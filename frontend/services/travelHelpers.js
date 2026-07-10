/**
 * Utility functions for TripVault travel visuals and metadata
 */

// Curated library of premium travel destination images from Unsplash
const destinationImages = {
  switzerland: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80",
  swiss: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80",
  zurich: "https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=800&q=80",
  maldives: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80",
  male: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80",
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
  france: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80",
  japan: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
  kyoto: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
  manali: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
  india: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
  delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
  himalayas: "https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&w=800&q=80",
  london: "https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&w=800&q=80",
  uk: "https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&w=800&q=80",
  england: "https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&w=800&q=80",
  usa: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
  america: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
  ny: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
  newyork: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
  indonesia: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
  uae: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
  italy: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
  venice: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80",
  spain: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80",
  barcelona: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80",
  germany: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
  munich: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
};

/**
 * Returns a premium travel cover image URL based on destination string matches
 */
export const getDestinationImage = (destination) => {
  if (!destination) return destinationImages.default;
  const dest = destination.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  for (const key of Object.keys(destinationImages)) {
    if (dest.includes(key)) {
      return destinationImages[key];
    }
  }
  return destinationImages.default;
};

/**
 * Returns the country flag emoji for a matching destination
 */
export const getDestinationFlag = (destination) => {
  if (!destination) return "🌐";
  const dest = destination.toLowerCase();
  
  if (dest.includes("switzerland") || dest.includes("swiss") || dest.includes("zurich") || dest.includes("geneva")) return "🇨🇭";
  if (dest.includes("maldives") || dest.includes("male")) return "🇲🇻";
  if (dest.includes("paris") || dest.includes("france")) return "🇫🇷";
  if (dest.includes("tokyo") || dest.includes("japan") || dest.includes("kyoto") || dest.includes("osaka")) return "🇯🇵";
  if (dest.includes("india") || dest.includes("manali") || dest.includes("goa") || dest.includes("delhi") || dest.includes("mumbai")) return "🇮🇳";
  if (dest.includes("uk") || dest.includes("london") || dest.includes("england") || dest.includes("united kingdom")) return "🇬🇧";
  if (dest.includes("usa") || dest.includes("new york") || dest.includes("united states") || dest.includes("ny")) return "🇺🇸";
  if (dest.includes("bali") || dest.includes("indonesia")) return "🇮🇩";
  if (dest.includes("dubai") || dest.includes("uae") || dest.includes("united arab emirates")) return "🇦🇪";
  if (dest.includes("italy") || dest.includes("rome") || dest.includes("venice") || dest.includes("florence")) return "🇮🇹";
  if (dest.includes("spain") || dest.includes("madrid") || dest.includes("barcelona")) return "🇪🇸";
  if (dest.includes("germany") || dest.includes("berlin") || dest.includes("munich")) return "🇩🇪";
  if (dest.includes("canada") || dest.includes("toronto") || dest.includes("vancouver")) return "🇨🇦";
  if (dest.includes("australia") || dest.includes("sydney") || dest.includes("melbourne")) return "🇦🇺";
  
  return "📍";
};

/**
 * Calculates duration in days between two dates
 */
export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays + 1} ${diffDays === 0 ? "Day" : "Days"}`;
};
