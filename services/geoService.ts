
// Mock Database of Cities with Coordinates and Timezones
export interface City {
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  tz: string;
}

const CITIES_DB: City[] = [
  // India - Metros & Major
  { name: "Mumbai", state: "Maharashtra", country: "India", lat: 19.0760, lng: 72.8777, tz: "Asia/Kolkata" },
  { name: "Delhi", state: "Delhi", country: "India", lat: 28.6139, lng: 77.2090, tz: "Asia/Kolkata" },
  { name: "Bangalore", state: "Karnataka", country: "India", lat: 12.9716, lng: 77.5946, tz: "Asia/Kolkata" },
  { name: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lng: 80.2707, tz: "Asia/Kolkata" },
  { name: "Kolkata", state: "West Bengal", country: "India", lat: 22.5726, lng: 88.3639, tz: "Asia/Kolkata" },
  { name: "Hyderabad", state: "Telangana", country: "India", lat: 17.3850, lng: 78.4867, tz: "Asia/Kolkata" },
  { name: "Pune", state: "Maharashtra", country: "India", lat: 18.5204, lng: 73.8567, tz: "Asia/Kolkata" },
  { name: "Ahmedabad", state: "Gujarat", country: "India", lat: 23.0225, lng: 72.5714, tz: "Asia/Kolkata" },
  { name: "Jaipur", state: "Rajasthan", country: "India", lat: 26.9124, lng: 75.7873, tz: "Asia/Kolkata" },
  { name: "Lucknow", state: "Uttar Pradesh", country: "India", lat: 26.8467, lng: 80.9462, tz: "Asia/Kolkata" },
  
  // India - Tier 2 (Addressing specific search 'bho')
  { name: "Bhopal", state: "Madhya Pradesh", country: "India", lat: 23.2599, lng: 77.4126, tz: "Asia/Kolkata" },
  { name: "Bhubaneswar", state: "Odisha", country: "India", lat: 20.2961, lng: 85.8245, tz: "Asia/Kolkata" },
  { name: "Bhojpur", state: "Bihar", country: "India", lat: 25.4667, lng: 84.5167, tz: "Asia/Kolkata" },
  { name: "Bhilai", state: "Chhattisgarh", country: "India", lat: 21.1938, lng: 81.3509, tz: "Asia/Kolkata" },
  { name: "Indore", state: "Madhya Pradesh", country: "India", lat: 22.7196, lng: 75.8577, tz: "Asia/Kolkata" },
  { name: "Patna", state: "Bihar", country: "India", lat: 25.5941, lng: 85.1376, tz: "Asia/Kolkata" },
  { name: "Nagpur", state: "Maharashtra", country: "India", lat: 21.1458, lng: 79.0882, tz: "Asia/Kolkata" },
  { name: "Varanasi", state: "Uttar Pradesh", country: "India", lat: 25.3176, lng: 82.9739, tz: "Asia/Kolkata" },
  { name: "Kanpur", state: "Uttar Pradesh", country: "India", lat: 26.4499, lng: 80.3319, tz: "Asia/Kolkata" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", country: "India", lat: 17.6868, lng: 83.2185, tz: "Asia/Kolkata" },
  { name: "Surat", state: "Gujarat", country: "India", lat: 21.1702, lng: 72.8311, tz: "Asia/Kolkata" },
  
  // Global - Major Cities
  { name: "New York", state: "NY", country: "USA", lat: 40.7128, lng: -74.0060, tz: "America/New_York" },
  { name: "Los Angeles", state: "CA", country: "USA", lat: 34.0522, lng: -118.2437, tz: "America/Los_Angeles" },
  { name: "Chicago", state: "IL", country: "USA", lat: 41.8781, lng: -87.6298, tz: "America/Chicago" },
  { name: "Houston", state: "TX", country: "USA", lat: 29.7604, lng: -95.3698, tz: "America/Chicago" },
  { name: "London", state: "England", country: "UK", lat: 51.5074, lng: -0.1278, tz: "Europe/London" },
  { name: "Paris", state: "Ile-de-France", country: "France", lat: 48.8566, lng: 2.3522, tz: "Europe/Paris" },
  { name: "Berlin", state: "", country: "Germany", lat: 52.5200, lng: 13.4050, tz: "Europe/Berlin" },
  { name: "Moscow", state: "", country: "Russia", lat: 55.7558, lng: 37.6173, tz: "Europe/Moscow" },
  { name: "Dubai", state: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, tz: "Asia/Dubai" },
  { name: "Singapore", state: "", country: "Singapore", lat: 1.3521, lng: 103.8198, tz: "Asia/Singapore" },
  { name: "Sydney", state: "NSW", country: "Australia", lat: -33.8688, lng: 151.2093, tz: "Australia/Sydney" },
  { name: "Melbourne", state: "Victoria", country: "Australia", lat: -37.8136, lng: 144.9631, tz: "Australia/Melbourne" },
  { name: "Tokyo", state: "", country: "Japan", lat: 35.6762, lng: 139.6503, tz: "Asia/Tokyo" },
  { name: "Toronto", state: "Ontario", country: "Canada", lat: 43.6510, lng: -79.3470, tz: "America/Toronto" },
  { name: "Vancouver", state: "BC", country: "Canada", lat: 49.2827, lng: -123.1207, tz: "America/Vancouver" },
];

export const searchCities = (query: string): City[] => {
  const q = query.toLowerCase();
  return CITIES_DB.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.state.toLowerCase().includes(q) || 
    c.country.toLowerCase().includes(q)
  );
};

// Simulation Helpers for Intelligent Inputs

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha']; // Subset for demo

export const getMoonInfo = (dateStr: string) => {
  // Deterministic simulation based on date hash
  const date = new Date(dateStr);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  
  // Moon stays in a sign for ~2.5 days
  const signIndex = Math.floor(dayOfYear / 2.5) % 12;
  const nakIndex = Math.floor(dayOfYear) % 9;

  return {
    sign: SIGNS[signIndex],
    nakshatra: NAKSHATRAS[nakIndex]
  };
};

export const getSunriseTime = (dateStr: string, lat: number) => {
  // Very rough estimation based on latitude and basic seasonality
  // Winter (northern hemisphere): late sunrise, Summer: early
  const date = new Date(dateStr);
  const month = date.getMonth(); // 0-11
  
  let baseHour = 6;
  let baseMinute = 0;

  if (lat > 0) { // North
     if (month < 3 || month > 9) { baseHour = 7; baseMinute = 15; } // Winter
     else if (month > 4 && month < 8) { baseHour = 5; baseMinute = 30; } // Summer
  }
  
  return `${baseHour.toString().padStart(2, '0')}:${baseMinute.toString().padStart(2, '0')}`;
};

export const getLagnaForTime = (timeStr: string, dateStr: string) => {
  // Simulate Lagna changing every 2 hours
  // Starting Lagna depends on Sun Sign (Month) + Time
  const date = new Date(dateStr || new Date());
  const month = date.getMonth(); // 0 = Jan (Capricorn/Aquarius approx) -> Sun Sign index approx month + 10 % 12? 
  // Simplified: Sun is in Aries (0) in April (3). So SunSign ~ (Month - 3). 
  
  const sunSignIdx = (month + 9) % 12; // Approx Sun Sign
  
  const [hours] = timeStr.split(':').map(Number);
  
  // Sunrise (approx 6am) = SunSign is rising.
  // Every 2 hours, add 1 sign.
  const hoursSinceSunrise = (hours - 6);
  const signsPassed = Math.floor(hoursSinceSunrise / 2);
  
  let risingSignIdx = (sunSignIdx + signsPassed) % 12;
  if (risingSignIdx < 0) risingSignIdx += 12;

  return SIGNS[risingSignIdx];
};

export const getFamousBirthdays = () => [
  { name: "Mahatma Gandhi", date: "1869-10-02" },
  { name: "Albert Einstein", date: "1879-03-14" },
  { name: "Steve Jobs", date: "1955-02-24" },
  { name: "Elon Musk", date: "1971-06-28" }
];
