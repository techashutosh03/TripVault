import dotenv from "dotenv";
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

const runTests = async () => {
  try {
    console.log("🚀 Starting Packing Checklist API Tests...");

    // 1. Register or Login
    console.log("➡️ Registering/Logging in test user...");
    const email = `test_packing_${Date.now()}@tripvault.com`;
    const password = "password123";
    
    let registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Packing User",
        email,
        password,
      }),
    });
    
    let registerData = await registerRes.json();
    let token = registerData.token;
    
    if (!token) {
      console.log("Registration failed or user exists, trying login...");
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
    console.log("✅ Auth Token obtained successfully.");

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
        title: "Swiss Winter Wonderland",
        destination: "Switzerland",
        startDate: "2026-12-15",
        endDate: "2026-12-25",
        budget: 500000,
        travelers: 2,
        notes: "Test packing checklist trip",
      }),
    });
    const tripData = await tripRes.json();
    if (!tripData.success) {
      throw new Error(`Failed to create trip: ${tripData.message}`);
    }
    const tripId = tripData.trip._id;
    console.log(`✅ Trip created. ID: ${tripId}`);

    // 3. Create Packing Item
    console.log("➡️ Creating packing checklist item...");
    const createItemRes = await fetch(`${BASE_URL}/packing`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tripId,
        itemName: "Thermal Jacket",
        category: "Clothing",
        quantity: 2,
        priority: "High",
        notes: "Heavy fleece layer",
      }),
    });
    const createItemData = await createItemRes.json();
    if (!createItemData.success) {
      throw new Error(`Failed to create packing item: ${createItemData.message}`);
    }
    const itemId = createItemData.item._id;
    console.log(`✅ Checklist item created: "${createItemData.item.itemName}" with ID: ${itemId}`);

    // 4. Get Checklist
    console.log("➡️ Fetching checklist for trip...");
    const getChecklistRes = await fetch(`${BASE_URL}/packing/trip/${tripId}`, {
      method: "GET",
      headers,
    });
    const getChecklistData = await getChecklistRes.json();
    if (!getChecklistData.success) {
      throw new Error(`Failed to get checklist: ${getChecklistData.message}`);
    }
    console.log(`✅ Fetched checklist. Item count: ${getChecklistData.count}`);
    if (getChecklistData.checklist[0]._id !== itemId) {
      throw new Error("Checklist item ID mismatch");
    }

    // 5. Update Packing Item
    console.log("➡️ Updating checklist item (marking as packed)...");
    const updateRes = await fetch(`${BASE_URL}/packing/${itemId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        isPacked: true,
        quantity: 3,
      }),
    });
    const updateData = await updateRes.json();
    if (!updateData.success) {
      throw new Error(`Failed to update checklist item: ${updateData.message}`);
    }
    console.log(`✅ Item updated. isPacked: ${updateData.item.isPacked}, quantity: ${updateData.item.quantity}`);

    // 6. Delete Packing Item
    console.log("➡️ Deleting checklist item...");
    const deleteRes = await fetch(`${BASE_URL}/packing/${itemId}`, {
      method: "DELETE",
      headers,
    });
    const deleteData = await deleteRes.json();
    if (!deleteData.success) {
      throw new Error(`Failed to delete checklist item: ${deleteData.message}`);
    }
    console.log("✅ Checklist item deleted successfully.");

    // 7. Verify deletion
    const verifyRes = await fetch(`${BASE_URL}/packing/trip/${tripId}`, {
      method: "GET",
      headers,
    });
    const verifyData = await verifyRes.json();
    console.log(`✅ Verification: remaining items count = ${verifyData.count}`);

    // Cleanup: Delete Trip
    console.log("➡️ Cleaning up: deleting test trip...");
    await fetch(`${BASE_URL}/trips/${tripId}`, {
      method: "DELETE",
      headers,
    });
    console.log("✅ Cleanup complete.");
    console.log("🎉 MODULE 1 PACKING CHECKLIST TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    process.exit(1);
  }
};

runTests();
