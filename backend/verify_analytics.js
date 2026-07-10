import dotenv from "dotenv";
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

const runTests = async () => {
  try {
    console.log("🚀 Starting Dashboard Analytics API Tests...");

    // 1. Register or Login
    console.log("➡️ Registering/Logging in test user...");
    const email = `test_analytics_${Date.now()}@tripvault.com`;
    const password = "password123";
    
    let registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Analytics User",
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

    // 2. Create Trip
    console.log("➡️ Creating test trip...");
    const tripRes = await fetch(`${BASE_URL}/trips`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "London Exploration",
        destination: "London, UK",
        startDate: "2026-10-01",
        endDate: "2026-10-10",
        budget: 400000,
        travelers: 2,
        notes: "Test trip for analytics",
      }),
    });
    const tripData = await tripRes.json();
    if (!tripData.success) {
      throw new Error(`Failed to create trip: ${tripData.message}`);
    }
    const tripId = tripData.trip._id;
    console.log(`✅ Trip created. ID: ${tripId}`);

    // 3. Create Checklist Items (Packed and Unpacked)
    console.log("➡️ Creating packing checklist items...");
    await fetch(`${BASE_URL}/packing`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tripId, itemName: "Umbrella", category: "Other", isPacked: true }),
    });
    const itemRes2 = await fetch(`${BASE_URL}/packing`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tripId, itemName: "Boots", category: "Clothing" }),
    });
    const itemData2 = await itemRes2.json();
    const itemId2 = itemData2.item._id;
    // Mark one as packed via PUT
    await fetch(`${BASE_URL}/packing/${itemId2}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ isPacked: true }),
    });
    // Create one unpacked
    await fetch(`${BASE_URL}/packing`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tripId, itemName: "Camera", category: "Electronics" }),
    });
    console.log("✅ Packing checklist setup done (2 packed, 1 unpacked).");

    // 4. Create Expenses
    console.log("➡️ Creating expenses...");
    await fetch(`${BASE_URL}/expenses/${tripId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        category: "Flight",
        title: "Air India Flight",
        amount: 80000,
        currency: "INR",
        paymentMethod: "Credit Card",
        date: "2026-07-15",
      }),
    });
    await fetch(`${BASE_URL}/expenses/${tripId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        category: "Hotel",
        title: "Hilton London",
        amount: 120000,
        currency: "INR",
        paymentMethod: "Credit Card",
        date: "2026-07-16",
      }),
    });
    console.log("✅ Expenses setup done.");

    // 5. Query Dashboard Analytics
    console.log("➡️ Fetching dashboard analytics...");
    const analyticsRes = await fetch(`${BASE_URL}/analytics`, {
      method: "GET",
      headers,
    });
    const analyticsData = await analyticsRes.json();
    if (!analyticsData.success) {
      throw new Error(`Analytics retrieval failed: ${analyticsData.message}`);
    }

    const { analytics } = analyticsData;
    console.log("✅ Analytics retrieved successfully. Results:");
    console.log(` - Trip Count: ${analytics.tripCount}`);
    console.log(` - Upcoming Trips: ${analytics.upcomingTrips}`);
    console.log(` - Completed Trips: ${analytics.completedTrips}`);
    console.log(` - Total Budget: ${analytics.budget}`);
    console.log(` - Total Spent: ${analytics.spent}`);
    console.log(` - Remaining Budget: ${analytics.remaining}`);
    console.log(` - Packing Progress: ${analytics.packingProgress.packed}/${analytics.packingProgress.total} (${analytics.packingProgress.percentage}%)`);
    console.log(` - Recent Trips Count: ${analytics.recentTrips.length}`);
    console.log(" - Expenses by Category:", JSON.stringify(analytics.expenseSummary));

    // Verify analytics values
    if (analytics.tripCount !== 1) throw new Error("Incorrect trip count");
    if (analytics.budget !== 400000) throw new Error("Incorrect budget sum");
    if (analytics.spent !== 200000) throw new Error("Incorrect expense sum");
    if (analytics.remaining !== 200000) throw new Error("Incorrect remaining budget");
    if (analytics.packingProgress.total !== 3) throw new Error("Incorrect packing checklist count");
    if (analytics.packingProgress.packed !== 2) throw new Error("Incorrect packed count");
    if (analytics.packingProgress.percentage !== 67) throw new Error(`Incorrect packing percentage, expected 67 got ${analytics.packingProgress.percentage}`);

    // Cleanup: Delete Trip
    console.log("➡️ Cleaning up: deleting test trip...");
    await fetch(`${BASE_URL}/trips/${tripId}`, {
      method: "DELETE",
      headers,
    });
    console.log("✅ Cleanup complete.");
    console.log("🎉 MODULE 3 DASHBOARD ANALYTICS TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    process.exit(1);
  }
};

runTests();
