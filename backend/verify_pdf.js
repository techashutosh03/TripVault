import dotenv from "dotenv";
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

const runTests = async () => {
  try {
    console.log("🚀 Starting PDF Export API Tests...");

    // 1. Register or Login
    console.log("➡️ Registering/Logging in test user...");
    const email = `test_pdf_${Date.now()}@tripvault.com`;
    const password = "password123";
    
    let registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test PDF User",
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
        title: "Swiss Winter Wonderland",
        destination: "Switzerland",
        startDate: "2026-12-15",
        endDate: "2026-12-25",
        budget: 500000,
        travelers: 2,
        notes: "Test PDF trip",
      }),
    });
    const tripData = await tripRes.json();
    if (!tripData.success) {
      throw new Error(`Failed to create trip: ${tripData.message}`);
    }
    const tripId = tripData.trip._id;
    console.log(`✅ Trip created. ID: ${tripId}`);

    // 3. Create Checklist Items
    console.log("➡️ Creating checklist items...");
    await fetch(`${BASE_URL}/packing`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tripId, itemName: "Thermal Jacket", category: "Clothing", isPacked: true }),
    });

    // 4. Create Expenses
    console.log("➡️ Creating expenses...");
    await fetch(`${BASE_URL}/expenses/${tripId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        category: "Flight",
        title: "Flights to Geneva",
        amount: 140000,
      }),
    });

    // 5. Query PDF
    console.log("➡️ Requesting PDF download...");
    const pdfRes = await fetch(`${BASE_URL}/pdf/trip/${tripId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (pdfRes.status !== 200) {
      const errorText = await pdfRes.text();
      throw new Error(`PDF request failed with status ${pdfRes.status}: ${errorText}`);
    }

    const contentType = pdfRes.headers.get("Content-Type");
    const contentDisposition = pdfRes.headers.get("Content-Disposition");
    const pdfBuffer = await pdfRes.arrayBuffer();

    console.log("✅ PDF Response details:");
    console.log(" - Content-Type:", contentType);
    console.log(" - Content-Disposition:", contentDisposition);
    console.log(" - PDF size in bytes:", pdfBuffer.byteLength);

    // Verifications
    if (contentType !== "application/pdf") throw new Error("Incorrect Content-Type returned");
    if (!contentDisposition || !contentDisposition.includes("attachment")) throw new Error("Incorrect Content-Disposition");
    if (pdfBuffer.byteLength < 1000) throw new Error("PDF file size is suspiciously small");

    // Cleanup: Delete Trip
    console.log("➡️ Cleaning up: deleting test trip...");
    await fetch(`${BASE_URL}/trips/${tripId}`, {
      method: "DELETE",
      headers,
    });
    console.log("✅ Cleanup complete.");

    console.log("🎉 MODULE 9 PDF EXPORT TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    process.exit(1);
  }
};

runTests();
