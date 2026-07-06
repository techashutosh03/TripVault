import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

const runTests = async () => {
  try {
    console.log("🚀 Starting Travel Documents API Tests...");

    // 1. Register or Login
    console.log("➡️ Registering/Logging in test user...");
    const email = `test_docs_${Date.now()}@tripvault.com`;
    const password = "password123";
    
    let registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Docs User",
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

    // 2. Create Trip
    console.log("➡️ Creating test trip...");
    const tripRes = await fetch(`${BASE_URL}/trips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Paris Getaway",
        destination: "Paris, France",
        startDate: "2026-09-10",
        endDate: "2026-09-17",
        budget: 350000,
        travelers: 1,
        notes: "Test trip for document vault",
      }),
    });
    const tripData = await tripRes.json();
    if (!tripData.success) {
      throw new Error(`Failed to create trip: ${tripData.message}`);
    }
    const tripId = tripData.trip._id;
    console.log(`✅ Trip created. ID: ${tripId}`);

    // Create a dummy file to upload
    const dummyPath = "./dummy_ticket.pdf";
    fs.writeFileSync(dummyPath, "%PDF-1.4 dummy content");
    console.log("✅ Created temporary dummy file.");

    // 3. Upload Document using FormData
    console.log("➡️ Uploading document via form-data...");
    const formData = new FormData();
    formData.append("tripId", tripId);
    formData.append("docType", "Flight Tickets");
    formData.append("title", "Flight to Paris");
    
    const fileBuffer = fs.readFileSync(dummyPath);
    const fileBlob = new Blob([fileBuffer], { type: "application/pdf" });
    formData.append("file", fileBlob, "dummy_ticket.pdf");

    const uploadRes = await fetch(`${BASE_URL}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const uploadData = await uploadRes.json();
    if (!uploadData.success) {
      throw new Error(`Upload failed: ${uploadData.message}`);
    }
    const docId = uploadData.document._id;
    console.log(`✅ Document uploaded successfully. ID: ${docId}, URL: ${uploadData.document.fileUrl}`);

    // Clean up local temp file
    if (fs.existsSync(dummyPath)) {
      fs.unlinkSync(dummyPath);
    }

    // 4. Get Documents for Trip
    console.log("➡️ Getting documents for trip...");
    const getDocsRes = await fetch(`${BASE_URL}/documents/trip/${tripId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const getDocsData = await getDocsRes.json();
    if (!getDocsData.success) {
      throw new Error(`Failed to get documents: ${getDocsData.message}`);
    }
    console.log(`✅ Fetched documents. Count: ${getDocsData.count}`);
    if (getDocsData.documents[0]._id !== docId) {
      throw new Error("Uploaded document ID mismatch in list");
    }

    // 5. Delete Document
    console.log("➡️ Deleting document...");
    const deleteRes = await fetch(`${BASE_URL}/documents/${docId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const deleteData = await deleteRes.json();
    if (!deleteData.success) {
      throw new Error(`Failed to delete document: ${deleteData.message}`);
    }
    console.log("✅ Document deleted successfully.");

    // 6. Verify deletion
    const verifyRes = await fetch(`${BASE_URL}/documents/trip/${tripId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const verifyData = await verifyRes.json();
    console.log(`✅ Verification: remaining documents count = ${verifyData.count}`);

    // Cleanup: Delete Trip
    console.log("➡️ Cleaning up: deleting test trip...");
    await fetch(`${BASE_URL}/trips/${tripId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ Cleanup complete.");
    console.log("🎉 MODULE 2 TRAVEL DOCUMENTS TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    if (fs.existsSync("./dummy_ticket.pdf")) {
      fs.unlinkSync("./dummy_ticket.pdf");
    }
    process.exit(1);
  }
};

runTests();
