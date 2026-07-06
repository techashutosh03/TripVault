import dotenv from "dotenv";
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

const runTests = async () => {
  try {
    console.log("🚀 Starting Currency Converter API Tests...");

    // 1. Register or Login
    console.log("➡️ Registering/Logging in test user...");
    const email = `test_currency_${Date.now()}@tripvault.com`;
    const password = "password123";
    
    let registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Currency User",
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

    // 2. Query Exchange Rates
    console.log("➡️ Fetching exchange rates...");
    const ratesRes = await fetch(`${BASE_URL}/currency/rates`, {
      method: "GET",
      headers,
    });
    const ratesData = await ratesRes.json();
    if (!ratesData.success) {
      throw new Error(`Failed to query rates: ${ratesData.message}`);
    }

    console.log("✅ Exchange rates retrieved successfully:");
    console.log(" - Base:", ratesData.base);
    console.log(" - Supported Currencies:", ratesData.supportedCurrencies.join(", "));
    console.log(" - Rates:", JSON.stringify(ratesData.rates));

    // 3. Convert Currency (e.g. 100 EUR to INR)
    console.log("➡️ Converting 100 EUR to INR...");
    const convertRes = await fetch(`${BASE_URL}/currency/convert`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: "EUR",
        to: "INR",
        amount: 100,
      }),
    });
    const convertData = await convertRes.json();
    if (!convertData.success) {
      throw new Error(`Failed to convert currency: ${convertData.message}`);
    }

    console.log("✅ Conversion successful:");
    console.log(` - Input: ${convertData.amount} ${convertData.from}`);
    console.log(` - Output: ${convertData.convertedAmount} ${convertData.to}`);
    console.log(` - Exchange Rate: 1 ${convertData.from} = ${convertData.rate} ${convertData.to}`);

    // Verification check on structure
    if (typeof ratesData.rates.EUR !== "number") throw new Error("EUR rate is not a number");
    if (convertData.convertedAmount <= 0) throw new Error("Conversion result is invalid");
    if (convertData.rate <= 0) throw new Error("Conversion rate is invalid");

    console.log("🎉 MODULE 7 CURRENCY CONVERTER TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    process.exit(1);
  }
};

runTests();
