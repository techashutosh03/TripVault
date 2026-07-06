// ============================================
// Weather Integration Controller
// ============================================

export const getWeather = async (req, res) => {
  try {
    const { q: city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City query parameter 'q' is required",
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.log(`⚠️ OPENWEATHER_API_KEY missing. Returning mock weather for: ${city}`);
      return res.status(200).json({
        success: true,
        source: "mock",
        current: generateMockCurrentWeather(city),
        forecast: generateMockForecast(city),
      });
    }

    try {
      // 1. Fetch current weather
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${apiKey}&units=metric`;
      const currentRes = await fetch(currentUrl);
      const currentData = await currentRes.json();

      if (currentRes.status !== 200) {
        throw new Error(currentData.message || "Failed to fetch current weather");
      }

      // 2. Fetch 5-day forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&appid=${apiKey}&units=metric`;
      const forecastRes = await fetch(forecastUrl);
      const forecastData = await forecastRes.json();

      if (forecastRes.status !== 200) {
        throw new Error(forecastData.message || "Failed to fetch weather forecast");
      }

      // Parse current weather
      const current = {
        temp: Math.round(currentData.main.temp),
        tempMin: Math.round(currentData.main.temp_min),
        tempMax: Math.round(currentData.main.temp_max),
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        rain: currentData.rain ? currentData.rain["1h"] || 0 : 0,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        cityName: currentData.name,
      };

      // Parse 5-day forecast (take 1 reading per day, OpenWeather returns every 3 hours, so step of 8 indices)
      const forecastList = forecastData.list;
      const forecast = [];
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      for (let i = 0; i < forecastList.length; i += 8) {
        const item = forecastList[i];
        const date = new Date(item.dt * 1000);
        forecast.push({
          day: days[date.getDay()],
          date: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
        });
      }

      return res.status(200).json({
        success: true,
        source: "openweather",
        current,
        forecast,
      });
    } catch (apiError) {
      console.log(`⚠️ OpenWeather API call failed. Falling back to mock data. Error:`, apiError.message);
      return res.status(200).json({
        success: true,
        source: "mock-fallback",
        current: generateMockCurrentWeather(city),
        forecast: generateMockForecast(city),
      });
    }
  } catch (error) {
    console.error("Weather Route Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Helper Mock Weather Generators
// ============================================
const generateMockCurrentWeather = (city) => {
  // Generate deterministic-looking temperatures based on name hash
  const hash = city.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseTemp = 10 + (hash % 20); // range 10-30 degrees C
  const isRainy = hash % 3 === 0;

  return {
    temp: baseTemp,
    tempMin: baseTemp - 3,
    tempMax: baseTemp + 4,
    humidity: 50 + (hash % 40), // range 50-90%
    windSpeed: parseFloat((2.5 + (hash % 10) * 0.5).toFixed(1)), // 2.5 - 7.5 m/s
    rain: isRainy ? parseFloat((0.5 + (hash % 5) * 1.2).toFixed(1)) : 0,
    description: isRainy ? "moderate rain" : hash % 2 === 0 ? "clear sky" : "scattered clouds",
    icon: isRainy ? "10d" : hash % 2 === 0 ? "01d" : "03d",
    cityName: city.charAt(0).toUpperCase() + city.slice(1),
  };
};

const generateMockForecast = (city) => {
  const hash = city.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseTemp = 10 + (hash % 20);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = new Date().getDay();

  const conditions = ["Clear", "Clouds", "Rain", "Clear", "Clouds"];

  const forecast = [];
  for (let i = 0; i < 5; i++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + i + 1);
    
    const dayName = daysOfWeek[(currentDayIndex + i + 1) % 7];
    const condition = conditions[(hash + i) % conditions.length];
    
    let icon = "01d"; // clear
    if (condition === "Clouds") icon = "03d";
    if (condition === "Rain") icon = "10d";

    const dailyTemp = baseTemp + (i % 2 === 0 ? i : -i) + ((hash % 3) - 1);

    forecast.push({
      day: dayName,
      date: targetDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      temp: Math.round(dailyTemp),
      condition,
      description: condition.toLowerCase() + " sky",
      icon,
      humidity: 55 + (i * 3) % 30,
      windSpeed: parseFloat((3.0 + i * 0.4).toFixed(1)),
    });
  }
  return forecast;
};
