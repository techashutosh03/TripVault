import dotenv from "dotenv";
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

const runTests = async () => {
  try {
    console.log("🚀 Starting Notifications API Tests...");

    // 1. Register or Login
    console.log("➡️ Registering/Logging in test user...");
    const email = `test_notif_${Date.now()}@tripvault.com`;
    const password = "password123";
    
    let registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Notif User",
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

    // 2. Create Trip (starting in 2 days)
    console.log("➡️ Creating test trip starting in 2 days...");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);

    const tripRes = await fetch(`${BASE_URL}/trips`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Upcoming Tokyo Adventure",
        destination: "Tokyo, Japan",
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        budget: 600000,
        travelers: 1,
        notes: "Tokyo Trip Notifications Test",
      }),
    });
    const tripData = await tripRes.json();
    if (!tripData.success) {
      throw new Error(`Failed to create trip: ${tripData.message}`);
    }
    const tripId = tripData.trip._id;
    console.log(`✅ Trip created. ID: ${tripId}, Start Date: ${startDate.toISOString().split("T")[0]}`);

    // 3. Create Flight Expense
    console.log("➡️ Creating Flight expense to trigger Flight Reminder...");
    const expenseRes = await fetch(`${BASE_URL}/expenses/${tripId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        category: "Flight",
        title: "ANA Airlines ticket",
        amount: 95000,
      }),
    });
    const expenseData = await expenseRes.json();
    if (!expenseData.success) {
      throw new Error("Failed to create expense");
    }
    console.log("✅ Flight expense created.");

    // 4. Create Passport Document
    console.log("➡️ Creating Passport travel document record to trigger Passport Reminder...");
    const notifFormData = new FormData();
    notifFormData.append("tripId", tripId);
    notifFormData.append("docType", "Passport");
    notifFormData.append("title", "My Passport Scan");
    const passportBlob = new Blob(["mock passport content"], { type: "application/pdf" });
    notifFormData.append("file", passportBlob, "passport.pdf");

    const docRes = await fetch(`${BASE_URL}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: notifFormData,
    });
    const docData = await docRes.json();
    if (!docData.success) {
      throw new Error(`Failed to create passport doc: ${docData.message}`);
    }
    console.log("✅ Passport travel document created.");

    // 5. Fetch Notifications (Auto-generates reminders)
    console.log("➡️ Fetching notifications (triggers dynamic auto-generation)...");
    const getNotifRes = await fetch(`${BASE_URL}/notifications`, {
      method: "GET",
      headers,
    });
    const getNotifData = await getNotifRes.json();
    if (!getNotifData.success) {
      throw new Error(`Failed to get notifications: ${getNotifData.message}`);
    }

    console.log(`✅ Fetched notifications. Count: ${getNotifData.count}`);
    getNotifData.notifications.forEach((n) => {
      console.log(` - [${n.type}] ${n.title}: ${n.message} (Read: ${n.isRead})`);
    });

    const notifTypes = getNotifData.notifications.map((n) => n.type);
    if (!notifTypes.includes("Travel")) throw new Error("Missing auto-generated Travel notification");
    if (!notifTypes.includes("Flight")) throw new Error("Missing auto-generated Flight notification");
    if (!notifTypes.includes("Passport")) throw new Error("Missing auto-generated Passport notification");

    const targetNotif = getNotifData.notifications[0];
    const targetId = targetNotif._id;

    // 6. Mark as Read
    console.log(`➡️ Marking notification ${targetId} as read...`);
    const readRes = await fetch(`${BASE_URL}/notifications/${targetId}/read`, {
      method: "PUT",
      headers,
    });
    const readData = await readRes.json();
    if (!readData.success || !readData.notification.isRead) {
      throw new Error("Failed to mark notification as read");
    }
    console.log("✅ Notification marked as read successfully.");

    // Cleanup: Delete Trip
    console.log("➡️ Cleaning up: deleting test trip...");
    await fetch(`${BASE_URL}/trips/${tripId}`, {
      method: "DELETE",
      headers,
    });
    console.log("✅ Cleanup complete.");

    // 7. Clear All
    console.log("➡️ Clearing all notifications...");
    const clearRes = await fetch(`${BASE_URL}/notifications`, {
      method: "DELETE",
      headers,
    });
    const clearData = await clearRes.json();
    if (!clearData.success) {
      throw new Error("Failed to clear notifications");
    }
    console.log("✅ Notifications cleared.");

    // Verify clear
    const verifyRes = await fetch(`${BASE_URL}/notifications`, {
      method: "GET",
      headers,
    });
    const verifyData = await verifyRes.json();
    console.log(`✅ Verification: remaining notifications count = ${verifyData.count}`);
    if (verifyData.count !== 0) throw new Error("Notifications not fully cleared");

    console.log("🎉 MODULE 4 NOTIFICATIONS TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    process.exit(1);
  }
};

runTests();
