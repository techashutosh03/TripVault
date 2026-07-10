// ============================================
// Currency Converter Controller
// ============================================

const SUPPORTED_CURRENCIES = ["INR", "USD", "EUR", "CHF", "JPY", "GBP"];

// Fallback rates relative to USD
const FALLBACK_RATES = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  CHF: 0.89,
  JPY: 156.2,
  GBP: 0.78,
};

let cache = {
  rates: null,
  lastUpdated: 0,
};

// Helper: Fetch rates
const fetchExchangeRates = async () => {
  const CACHE_TTL = 3600 * 1000; // 1 hour
  const now = Date.now();

  if (cache.rates && now - cache.lastUpdated < CACHE_TTL) {
    return cache.rates;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();

    if (data && data.result === "success" && data.rates) {
      // Filter rates to only support our required currencies
      const filteredRates = {};
      SUPPORTED_CURRENCIES.forEach((cur) => {
        if (data.rates[cur]) {
          filteredRates[cur] = data.rates[cur];
        } else {
          filteredRates[cur] = FALLBACK_RATES[cur];
        }
      });

      cache.rates = filteredRates;
      cache.lastUpdated = now;
      console.log("✅ Live exchange rates fetched successfully.");
      return filteredRates;
    }
    throw new Error("Invalid API response format");
  } catch (error) {
    console.log("⚠️ Failed to fetch live exchange rates, using fallback cache. Error:", error.message);
    return FALLBACK_RATES;
  }
};

// GET /api/currency/rates
export const getRates = async (req, res) => {
  try {
    const rates = await fetchExchangeRates();
    res.status(200).json({
      success: true,
      base: "USD",
      supportedCurrencies: SUPPORTED_CURRENCIES,
      rates,
    });
  } catch (error) {
    console.error("Get rates error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// POST /api/currency/convert
export const convertCurrency = async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    if (!from || !to || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Fields 'from', 'to', and 'amount' are required",
      });
    }

    const curFrom = from.toUpperCase();
    const curTo = to.toUpperCase();

    if (!SUPPORTED_CURRENCIES.includes(curFrom) || !SUPPORTED_CURRENCIES.includes(curTo)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported currency. Supported currencies: ${SUPPORTED_CURRENCIES.join(", ")}`,
      });
    }

    const rates = await fetchExchangeRates();

    // Convert: amount_in_usd = amount / rate_from_usd
    // amount_in_target = amount_in_usd * rate_to_usd
    const amountInUSD = amount / rates[curFrom];
    const convertedAmount = amountInUSD * rates[curTo];
    
    // Calculate exchange rate
    const conversionRate = rates[curTo] / rates[curFrom];

    res.status(200).json({
      success: true,
      from: curFrom,
      to: curTo,
      amount: parseFloat(amount),
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      rate: parseFloat(conversionRate.toFixed(6)),
    });
  } catch (error) {
    console.error("Convert currency error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
