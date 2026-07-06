import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

const runTests = async () => {
  try {
    console.log("🚀 Starting AI Planner API Tests...");

    // 1. Register or Login
    console.log("➡️ Registering/Logging in test user...");
    const email = `test_ai_${Date.now()}@tripvault.com`;
    const password = "password123";
    
    let registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test AI User",
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 2. Trigger AI Planner
    console.log("➡️ Requesting AI Planner to create a Switzerland trip...");
    const aiRes = await fetch(`${BASE_URL}/ai/plan`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt: "Plan a luxury 10-day Switzerland trip under ₹5 lakh.",
      }),
    });
    const aiData = await aiRes.json();
    if (!aiData.success) {
      throw new Error(`AI Planner failed: ${aiData.message}`);
    }

    console.log("✅ AI Plan successfully created and saved in DB!");
    console.log(" - Trip Details:");
    console.log(`   - Title: "${aiData.trip.title}"`);
    console.log(`   - Destination: "${aiData.trip.destination}"`);
    console.log(`   - Budget: ${aiData.trip.budget}`);
    console.log(`   - Travelers: ${aiData.trip.travelers}`);
    console.log("   - Notes (Suggestions Preview):", aiData.trip.notes.substring(0, 150) + "...");
    
    console.log(` - Created Itineraries Days Count: ${aiData.itineraries.length}`);
    console.log(` - Created Expenses Count: ${aiData.expenses.length}`);
    console.log(` - Created Packing Items Count: ${aiData.packingChecklist.length}`);

    // Verification check on structure
    const tripId = aiData.trip._id;
    if (!mongoose.Types.ObjectId.isValid(tripId)) throw new Error("Invalid trip ID returned");
    if (aiData.itineraries.length === 0) throw new Error("No itineraries generated");
    if (aiData.expenses.length === 0) throw new Error("No expenses generated");
    if (aiData.packingChecklist.length === 0) throw new Error("No packing checklist items generated");

    // Cleanup: Delete Trip
    console.log("➡️ Cleaning up: deleting AI generated trip...");
    await fetch(`${BASE_URL}/trips/${tripId}`, {
      method: "DELETE",
      headers,
    });
    console.log("✅ Cleanup complete.");

    console.log("🎉 MODULE 8 AI PLANNER TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    process.exit(1);
  }
};

runTests();
