import dotenv from "dotenv";
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

const runTests = async () => {
  try {
    console.log("🚀 Starting Google Maps API Tests...");

    // 1. Register or Login
    console.log("➡️ Registering/Logging in test user...");
    const email = `test_maps_${Date.now()}@tripvault.com`;
    const password = "password123";
    
    let registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Maps User",
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

    // 2. Query Coordinates for Paris
    console.log("➡️ Querying places/coordinates for Paris...");
    const placeRes = await fetch(`${BASE_URL}/maps/places?query=Paris`, {
      method: "GET",
      headers,
    });
    const placeData = await placeRes.json();
    if (!placeData.success) {
      throw new Error(`Failed to query places: ${placeData.message}`);
    }

    console.log("✅ Paris coordinates retrieved successfully:");
    console.log(" - Name:", placeData.location.name);
    console.log(" - Address:", placeData.location.formattedAddress);
    console.log(` - Coordinates: Lat: ${placeData.location.lat}, Lng: ${placeData.location.lng}`);
    console.log(" - Maps Link:", placeData.location.mapsLink);

    const { lat, lng } = placeData.location;

    // 3. Query Nearby Hotels in Paris
    console.log(`➡️ Querying nearby hotels around coordinates (${lat}, ${lng})...`);
    const nearbyRes = await fetch(`${BASE_URL}/maps/nearby?lat=${lat}&lng=${lng}&type=hotel`, {
      method: "GET",
      headers,
    });
    const nearbyData = await nearbyRes.json();
    if (!nearbyData.success) {
      throw new Error(`Failed to query nearby hotels: ${nearbyData.message}`);
    }

    console.log(`✅ Nearby hotels retrieved. Count: ${nearbyData.places.length}`);
    nearbyData.places.forEach((hotel) => {
      console.log(`   - Hotel Name: "${hotel.name}" | Rating: ${hotel.rating} (${hotel.userRatingsTotal} reviews)`);
      console.log(`     Address: ${hotel.address}`);
      console.log(`     Link: ${hotel.mapsLink}`);
    });

    // Verification check on structure
    if (typeof lat !== "number" || typeof lng !== "number") throw new Error("Coordinates are not numbers");
    if (!nearbyData.places || nearbyData.places.length === 0) throw new Error("No nearby places returned");
    if (!nearbyData.places[0].name) throw new Error("Nearby place does not have a name");

    console.log("🎉 MODULE 6 GOOGLE MAPS INTEGRATION TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    process.exit(1);
  }
};

runTests();
