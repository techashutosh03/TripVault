import API from "./axios.js";

// ============================================
// Trips API
// ============================================
export const getTrips = () => API.get("/trips");
export const getTripDetails = (id) => API.get(`/trips/${id}`);
export const createTrip = (data) => API.post("/trips", data);
export const updateTrip = (id, data) => API.put(`/trips/${id}`, data);
export const deleteTrip = (id) => API.delete(`/trips/${id}`);

// ============================================
// Itinerary API
// ============================================
export const getItinerary = (tripId) => API.get(`/itinerary/${tripId}`);
export const createItineraryDay = (data) => API.post("/itinerary", data);
export const addItineraryActivity = (itineraryId, data) => API.post(`/itinerary/${itineraryId}/activity`, data);
export const updateItineraryActivity = (itineraryId, activityId, data) => API.put(`/itinerary/${itineraryId}/activity/${activityId}`, data);
export const deleteItineraryActivity = (itineraryId, activityId) => API.delete(`/itinerary/${itineraryId}/activity/${activityId}`);

// ============================================
// Expenses API
// ============================================
export const getExpenses = (tripId) => API.get(`/expenses/${tripId}`);
export const createExpense = (tripId, data) => API.post(`/expenses/${tripId}`, data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const getExpenseSummary = (tripId) => API.get(`/expenses/summary/${tripId}`);

// ============================================
// Packing Checklist API
// ============================================
export const getChecklist = (tripId) => API.get(`/packing/trip/${tripId}`);
export const createChecklistItem = (data) => API.post("/packing", data);
export const updateChecklistItem = (id, data) => API.put(`/packing/${id}`, data);
export const deleteChecklistItem = (id) => API.delete(`/packing/${id}`);

// ============================================
// Travel Documents API
// ============================================
export const getDocuments = (tripId) => API.get(`/documents/trip/${tripId}`);
export const uploadDocument = (formData) => API.post("/documents", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const deleteDocument = (id) => API.delete(`/documents/${id}`);

// ============================================
// Dashboard Analytics API
// ============================================
export const getAnalytics = () => API.get("/analytics");

// ============================================
// Notifications API
// ============================================
export const getNotifications = () => API.get("/notifications");
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const clearNotifications = () => API.delete("/notifications");

// ============================================
// Weather API
// ============================================
export const getWeather = (city) => API.get(`/weather?q=${encodeURIComponent(city)}`);

// ============================================
// Maps API
// ============================================
export const getPlaces = (query) => API.get(`/maps/places?query=${encodeURIComponent(query)}`);
export const getNearby = (lat, lng, type) => API.get(`/maps/nearby?lat=${lat}&lng=${lng}&type=${type}`);

// ============================================
// Currency API
// ============================================
export const getCurrencyRates = () => API.get("/currency/rates");
export const convertCurrency = (data) => API.post("/currency/convert", data);

// ============================================
// AI Planner API
// ============================================
export const generateAIPlan = (prompt) => API.post("/ai/plan", { prompt });

// ============================================
// PDF Export Link
// ============================================
export const getPDFDownloadUrl = (tripId) => `/api/pdf/trip/${tripId}`;
