// ============================================
// Google Maps Integration Controller
// ============================================

// GET /api/maps/places?query=city
export const getPlaces = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'query' is required",
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.log(`⚠️ GOOGLE_MAPS_API_KEY missing. Returning mock coordinates for: ${query}`);
      const mockLocation = generateMockLocation(query);
      return res.status(200).json({
        success: true,
        source: "mock",
        location: mockLocation,
      });
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${apiKey}`;
      const apiRes = await fetch(url);
      const data = await apiRes.json();

      if (data.status !== "OK" || !data.results.length) {
        throw new Error(data.error_message || "No results found");
      }

      const result = data.results[0];
      const location = {
        name: result.name,
        formattedAddress: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.name)}&query_place_id=${result.place_id}`,
        placeId: result.place_id,
      };

      return res.status(200).json({
        success: true,
        source: "google",
        location,
      });
    } catch (apiError) {
      console.log(`⚠️ Google Places search failed. Falling back to mock data. Error:`, apiError.message);
      return res.status(200).json({
        success: true,
        source: "mock-fallback",
        location: generateMockLocation(query),
      });
    }
  } catch (error) {
    console.error("Get places error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET /api/maps/nearby?lat=...&lng=...&type=hotel|restaurant|tourist_attraction
export const getNearby = async (req, res) => {
  try {
    const { lat, lng, type } = req.query;

    if (!lat || !lng || !type) {
      return res.status(400).json({
        success: false,
        message: "Latitude (lat), longitude (lng), and type (hotel/restaurant/tourist_attraction) are required query parameters",
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.log(`⚠️ GOOGLE_MAPS_API_KEY missing. Returning mock nearby places for type: ${type}`);
      return res.status(200).json({
        success: true,
        source: "mock",
        places: generateMockNearby(parseFloat(lat), parseFloat(lng), type),
      });
    }

    try {
      // Map frontend type to Google API type
      let googleType = "lodging"; // hotel
      if (type === "restaurant") googleType = "restaurant";
      if (type === "tourist_attraction") googleType = "tourist_attraction";

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2500&type=${googleType}&key=${apiKey}`;
      const apiRes = await fetch(url);
      const data = await apiRes.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(data.error_message || "Google search failed");
      }

      const places = (data.results || []).slice(0, 10).map((place) => ({
        name: place.name,
        address: place.vicinity,
        rating: place.rating || 4.0,
        userRatingsTotal: place.user_ratings_total || 0,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`,
      }));

      return res.status(200).json({
        success: true,
        source: "google",
        places,
      });
    } catch (apiError) {
      console.log(`⚠️ Google Nearby search failed. Falling back to mock data. Error:`, apiError.message);
      return res.status(200).json({
        success: true,
        source: "mock-fallback",
        places: generateMockNearby(parseFloat(lat), parseFloat(lng), type),
      });
    }
  } catch (error) {
    console.error("Get nearby error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Helper Mock Location Generators
// ============================================
const generateMockLocation = (query) => {
  const hash = query.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Zurich coordinates fallback by default
  let lat = 47.3769 + ((hash % 100) - 50) * 0.01;
  let lng = 8.5417 + ((hash % 100) - 50) * 0.01;

  // Exact coordinates for popular search queries
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("zurich") || lowerQuery.includes("switzerland")) {
    lat = 47.3769;
    lng = 8.5417;
  } else if (lowerQuery.includes("paris")) {
    lat = 48.8566;
    lng = 2.3522;
  } else if (lowerQuery.includes("tokyo")) {
    lat = 35.6762;
    lng = 139.6503;
  } else if (lowerQuery.includes("london")) {
    lat = 51.5074;
    lng = -0.1278;
  }

  return {
    name: query.charAt(0).toUpperCase() + query.slice(1),
    formattedAddress: `${query.charAt(0).toUpperCase() + query.slice(1)}, Center Area`,
    lat,
    lng,
    mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    placeId: `mock_place_${hash}`,
  };
};

const generateMockNearby = (lat, lng, type) => {
  // Generate deterministic nearby places
  const hash = Math.round((lat + lng) * 1000) % 100;
  const places = [];

  const adjectives = ["Royal", "Grand", "Boutique", "Luxe", "Elite", "Golden", "Heritage", "Savoy"];
  
  if (type === "hotel") {
    const hotelNames = ["Palace", "Suites", "Inn", "Resort", "Plaza", "Spire"];
    for (let i = 1; i <= 5; i++) {
      const adj = adjectives[(hash + i) % adjectives.length];
      const hotel = hotelNames[(hash * i) % hotelNames.length];
      const name = `${adj} ${hotel} Hotel`;
      places.push({
        name,
        address: `${10 * i} Travel Lane, Center City`,
        rating: parseFloat((4.0 + ((hash + i) % 10) * 0.1).toFixed(1)),
        userRatingsTotal: 50 + (hash * i * 3) % 450,
        lat: lat + 0.003 * i * (i % 2 === 0 ? 1 : -1),
        lng: lng + 0.003 * i * (i % 2 !== 0 ? 1 : -1),
        mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`,
      });
    }
  } else if (type === "restaurant") {
    const restNames = ["Bistro", "Osteria", "Tavern", "Kitchen", "Table", "Garden"];
    const cuisines = ["Italian", "French", "Japanese", "Continental", "Indian", "Fusion"];
    for (let i = 1; i <= 5; i++) {
      const adj = adjectives[(hash + i * 2) % adjectives.length];
      const rest = restNames[(hash * i) % restNames.length];
      const cuisine = cuisines[(hash + i) % cuisines.length];
      const name = `${adj} ${rest} (${cuisine})`;
      places.push({
        name,
        address: `${15 * i} Foodie Street, Gourmet District`,
        rating: parseFloat((4.1 + ((hash + i * 3) % 9) * 0.1).toFixed(1)),
        userRatingsTotal: 80 + (hash * i * 4) % 600,
        lat: lat + 0.002 * i * (i % 2 === 0 ? -1 : 1),
        lng: lng + 0.002 * i * (i % 2 !== 0 ? -1 : 1),
        mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`,
      });
    }
  } else { // tourist_attraction
    const attractions = ["Museum of Art", "Historical Castle", "Scenic Lookout Point", "Botanical Gardens", "Cathedral Square", "Old Town Hall"];
    for (let i = 1; i <= 5; i++) {
      const name = attractions[(hash + i) % attractions.length] + ` ${i > 3 ? "Towers" : ""}`;
      places.push({
        name,
        address: `${25 * i} Sightseeing Rd, Old Town`,
        rating: parseFloat((4.3 + ((hash + i * 2) % 7) * 0.1).toFixed(1)),
        userRatingsTotal: 150 + (hash * i * 10) % 1500,
        lat: lat + 0.004 * i * (i % 2 === 0 ? 1 : -1),
        lng: lng + 0.004 * i * (i % 2 !== 0 ? -1 : 1),
        mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`,
      });
    }
  }

  return places;
};
