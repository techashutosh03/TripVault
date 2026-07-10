import dotenv from "dotenv";
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

const runTests = async () => {
  try {
    console.log("🚀 Starting Weather API Tests...");

    // 1. Register or Login
    console.log("➡️ Registering/Logging in test user...");
    const email = `test_weather_${Date.now()}@tripvault.com`;
    const password = "password123";
    
    let registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Weather User",
        email,
        password,
      }),
    });
    
    let registerData = await registerRes.json();
    let token = registerData.token;
    
    if (!token) {
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      token = loginData.token;
    }

    if (!token) {
      throw new Error("Could not obtain auth token");
    }
    console.log("✅ Auth Token obtained.");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // 2. Query Weather for Zurich
    console.log("➡️ Querying weather for Zurich...");
    const weatherRes = await fetch(`${BASE_URL}/weather?q=Zurich`, {
      method: "GET",
      headers,
    });
    const weatherData = await weatherRes.json();
    if (!weatherData.success) {
      throw new Error(`Failed to query weather: ${weatherData.message}`);
    }

    console.log("✅ Weather data retrieved successfully.");
    console.log(" - Source:", weatherData.source);
    console.log(" - Current Weather in", weatherData.current.cityName + ":");
    console.log(`   - Temp: ${weatherData.current.temp}°C (Min: ${weatherData.current.tempMin}°C, Max: ${weatherData.current.tempMax}°C)`);
    console.log(`   - Humidity: ${weatherData.current.humidity}%`);
    console.log(`   - Wind: ${weatherData.current.windSpeed} m/s`);
    console.log(`   - Rain: ${weatherData.current.rain} mm`);
    console.log(`   - Description: ${weatherData.current.description}`);
    console.log(" - 5-Day Forecast:");
    weatherData.forecast.forEach((f) => {
      console.log(`   - [${f.day}, ${f.date}]: Temp: ${f.temp}°C, Condition: ${f.condition} (${f.description})`);
    });

    // Verification check on structure
    const { current, forecast } = weatherData;
    if (typeof current.temp !== "number") throw new Error("Current temperature is not a number");
    if (typeof current.humidity !== "number") throw new Error("Current humidity is not a number");
    if (!forecast || forecast.length !== 5) throw new Error("Forecast does not contain 5 elements");

    console.log("🎉 MODULE 5 WEATHER INTEGRATION TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    process.exit(1);
  }
};

runTests();
