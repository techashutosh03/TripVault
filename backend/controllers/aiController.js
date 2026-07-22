import { GoogleGenerativeAI } from "@google/generative-ai";
import Trip from "../models/Trip.js";
import Itinerary from "../models/Itinerary.js";
import Expense from "../models/Expense.js";
import PackingChecklist from "../models/PackingChecklist.js";

// ============================================
// AI Plan Generator Controller
// ============================================
export const planTrip = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let planData;

    if (!apiKey) {
      console.log("⚠️ GEMINI_API_KEY is missing. Using pre-coded high-end Switzerland trip fallback.");
      planData = generateFallbackPlan(prompt);
    } else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-1.5-flash or gemini-2.5-flash (gemini-1.5-flash is extremely stable and fast)
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const targetPrompt = `
You are a luxury travel planning expert.
The user wants a travel plan based on this prompt: "${prompt}".
Generate a detailed travel plan and return it as a JSON object adhering to the following structure:
{
  "trip": {
    "title": "String, short catchy title (e.g. Swiss Alps Getaway)",
    "destination": "String, main destination country/city",
    "startDate": "String, start date in format YYYY-MM-DD (assume starting 30 days from now if not specified)",
    "endDate": "String, end date in format YYYY-MM-DD (must align with duration specified or assumed)",
    "budget": Number, estimated total budget matching user request currency/amount (default to 300000 INR if not specified)",
    "travelers": Number, number of travelers (default to 2)",
    "notes": "String, detailed notes containing Hotel suggestions, Restaurant suggestions, and packing advice."
  },
  "itinerary": [
    {
      "dayNumber": Number,
      "date": "String, YYYY-MM-DD",
      "activities": [
        {
          "time": "String, e.g. 09:00 AM",
          "title": "String, activity title",
          "description": "String, activity details including sightseeing, hotels, or restaurants",
          "location": "String, activity location name",
          "status": "Pending"
        }
      ]
    }
  ],
  "expenses": [
    {
      "category": "String, must be one of: Flight, Hotel, Food, Transport, Shopping, Activity, Other",
      "title": "String, expense item title",
      "amount": Number,
      "currency": "String, e.g. INR or USD",
      "paymentMethod": "String, must be one of: Cash, Credit Card, Debit Card, UPI, Bank Transfer",
      "date": "String, YYYY-MM-DD"
    }
  ],
  "packingChecklist": [
    {
      "itemName": "String",
      "category": "String, e.g. Clothing, Toiletries, Electronics, Documents, General",
      "quantity": Number,
      "priority": "String, must be: Low, Medium, High"
    }
  ]
}

Strictly follow these rules:
1. Ensure all date fields match standard format YYYY-MM-DD.
2. Return ONLY a valid JSON object matching the schema. No conversational filler or surrounding markdown blocks (other than JSON).
3. The total amount in expenses must be equal to or less than the specified budget.
4. Distribute days chronologically from startDate.
`;

        const response = await model.generateContent(targetPrompt);
        const text = response.response.text();
        planData = JSON.parse(text);
        console.log("✅ Successfully generated trip plan from Gemini.");
      } catch (geminiError) {
        console.error("⚠️ Gemini API call failed. Falling back to local generator. Error:", geminiError.message);
        planData = generateFallbackPlan(prompt);
      }
    }

    // Save everything to MongoDB
    const userId = req.user.id;

    // 1. Create Trip
    const trip = await Trip.create({
      title: planData.trip.title,
      destination: planData.trip.destination,
      startDate: new Date(planData.trip.startDate),
      endDate: new Date(planData.trip.endDate),
      budget: planData.trip.budget,
      travelers: planData.trip.travelers || 1,
      notes: planData.trip.notes,
      createdBy: userId,
    });

    const tripId = trip._id;

    // 2. Create Itineraries
    const itineraryPromises = (planData.itinerary || []).map((day) =>
      Itinerary.create({
        tripId,
        dayNumber: day.dayNumber,
        date: new Date(day.date),
        activities: day.activities,
      })
    );
    const itineraries = await Promise.all(itineraryPromises);

    // 3. Create Expenses
    const expensePromises = (planData.expenses || []).map((exp) =>
      Expense.create({
        tripId,
        category: exp.category || "Other",
        title: exp.title,
        amount: exp.amount,
        currency: exp.currency || "INR",
        paymentMethod: exp.paymentMethod || "Cash",
        date: new Date(exp.date),
      })
    );
    const expenses = await Promise.all(expensePromises);

    // 4. Create Packing Items
    const packingPromises = (planData.packingChecklist || []).map((item) =>
      PackingChecklist.create({
        tripId,
        itemName: item.itemName,
        category: item.category || "General",
        quantity: item.quantity || 1,
        priority: item.priority || "Medium",
        isPacked: false,
      })
    );
    const packingChecklist = await Promise.all(packingPromises);

    res.status(201).json({
      success: true,
      message: "AI Trip Plan generated and saved successfully into database!",
      trip,
      itineraries,
      expenses,
      packingChecklist,
    });
  } catch (error) {
    console.error("AI Plan Route Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Fallback Plan Generator
// ============================================
const generateFallbackPlan = (prompt) => {
  const isSwiss = prompt.toLowerCase().includes("swiss") || prompt.toLowerCase().includes("switzerland");
  
  const destination = isSwiss ? "Switzerland" : "Paris, France";
  const title = isSwiss ? "Luxury Swiss Alps Retreat" : "Romantic Paris Getaway";
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 4); // 5-day trip

  const format = (date) => date.toISOString().split("T")[0];

  const date0 = format(startDate);
  
  const date1 = new Date(startDate);
  date1.setDate(date1.getDate() + 1);
  const date1Str = format(date1);
  
  const date2 = new Date(startDate);
  date2.setDate(date2.getDate() + 2);
  const date2Str = format(date2);
  
  const date3 = new Date(startDate);
  date3.setDate(date3.getDate() + 3);
  const date3Str = format(date3);
  
  const date4 = new Date(startDate);
  date4.setDate(date4.getDate() + 4);
  const date4Str = format(date4);

  return {
    trip: {
      title,
      destination,
      startDate: date0,
      endDate: date4Str,
      budget: 450000,
      travelers: 2,
      notes: `
### Hotel Suggestions
- **The Dolder Grand (Zurich)**: Luxury 5-star spa hotel overlooking the lake.
- **Badrutt's Palace (St. Moritz)**: Legendary alpine luxury hotel.

### Restaurant Suggestions
- **Kronenhalle (Zurich)**: High-end dining amidst real art by Picasso and Matisse.
- **Chesa Veglia (St. Moritz)**: Historic farmhouse serving gourmet Swiss specialities.

### Packing Advice
Ensure to pack warm thermal layers, adapters for Swiss type J outlets, and water-resistant boots.
`,
    },
    itinerary: [
      {
        dayNumber: 1,
        date: date0,
        activities: [
          {
            time: "10:00 AM",
            title: "Arrival & Hotel Check-in",
            description: "Check in to luxury hotel and refresh.",
            location: "Zurich Hotel",
            status: "Pending",
          },
          {
            time: "03:00 PM",
            title: "Lake Zurich Cruise",
            description: "Scenic afternoon cruise on Lake Zurich.",
            location: "Lake Zurich",
            status: "Pending",
          },
        ],
      },
      {
        dayNumber: 2,
        date: date1Str,
        activities: [
          {
            time: "09:30 AM",
            title: "Old Town Walk",
            description: "Guided historical walking tour of Lindenhof and churches.",
            location: "Zurich Old Town",
            status: "Pending",
          },
        ],
      },
      {
        dayNumber: 3,
        date: date2Str,
        activities: [
          {
            time: "08:00 AM",
            title: "Train to St. Moritz",
            description: "Scenic rail ride on the Glacier Express route.",
            location: "Zurich Hauptbahnhof",
            status: "Pending",
          },
        ],
      },
      {
        dayNumber: 4,
        date: date3Str,
        activities: [
          {
            time: "10:00 AM",
            title: "Alpine Hike",
            description: "Explore the breathtaking mountain trails.",
            location: "St. Moritz Mountains",
            status: "Pending",
          },
        ],
      },
      {
        dayNumber: 5,
        date: date4Str,
        activities: [
          {
            time: "12:00 PM",
            title: "Depart Switzerland",
            description: "Transfer to airport for return flight.",
            location: "Zurich Airport",
            status: "Pending",
          },
        ],
      },
    ],
    expenses: [
      {
        category: "Flight",
        title: "Swiss International Air Flights",
        amount: 120000,
        currency: "INR",
        paymentMethod: "Credit Card",
        date: date0,
      },
      {
        category: "Hotel",
        title: "Luxury Hotel Stays",
        amount: 180000,
        currency: "INR",
        paymentMethod: "Credit Card",
        date: date0,
      },
      {
        category: "Transport",
        title: "Swiss Travel Rail Pass",
        amount: 40000,
        currency: "INR",
        paymentMethod: "Debit Card",
        date: date0,
      },
      {
        category: "Food",
        title: "Gourmet Dining & Fondues",
        amount: 60000,
        currency: "INR",
        paymentMethod: "Cash",
        date: date1Str,
      },
    ],
    packingChecklist: [
      {
        itemName: "Thermal Layers",
        category: "Clothing",
        quantity: 3,
        priority: "High",
      },
      {
        itemName: "Water-resistant Boots",
        category: "Clothing",
        quantity: 1,
        priority: "High",
      },
      {
        itemName: "Swiss Socket J Adapter",
        category: "Electronics",
        quantity: 2,
        priority: "Medium",
      },
      {
        itemName: "Passport & Rail Passes",
        category: "Documents",
        quantity: 2,
        priority: "High",
      },
    ],
  };
};

// ============================================
// AI Summary Generator Controller
// ============================================
export const getTripAISummary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const itineraries = await Itinerary.find({ tripId });
    const expenses = await Expense.find({ tripId });

    const totalActivities = itineraries.reduce((sum, day) => sum + (day.activities ? day.activities.length : 0), 0);
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const apiKey = process.env.GEMINI_API_KEY;
    let summaryText = "";

    if (!apiKey) {
      summaryText = `This is a premium travel plan to ${trip.destination}. It spans from ${new Date(trip.startDate).toLocaleDateString()} to ${new Date(trip.endDate).toLocaleDateString()}, hosting ${trip.travelers} traveler(s). You have logged ${totalActivities} activities and spent ₹${totalSpent} out of your ₹${trip.budget} budget.`;
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
      Write a highly professional, engaging, 3-sentence summary of this trip suited for a recruiter dashboard:
      Destination: ${trip.destination}
      Title: ${trip.title}
      Duration: ${new Date(trip.startDate).toLocaleDateString()} to ${new Date(trip.endDate).toLocaleDateString()}
      Travelers: ${trip.travelers}
      Budget: ${trip.budget}
      Logged Expenses: Total spent is ${totalSpent}
      Total Activities Logged: ${totalActivities}
      Notes/Details: ${trip.notes || ""}
      
      Maintain a premium, travel-enthusiast tone. Do not include markdown blocks or label headers (like "Summary:"). Just write the paragraphs.
      `;
      const response = await model.generateContent(prompt);
      summaryText = response.response.text().trim();
    }

    res.status(200).json({
      success: true,
      summary: summaryText
    });
  } catch (error) {
    console.error("AI Summary Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate AI summary" });
  }
};
