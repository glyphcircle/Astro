
import React, { useState, useEffect, useRef } from 'react';
import { searchCities, City, getMoonInfo, getLagnaForTime, getSunriseTime, getFamousBirthdays } from '../services/geoService';

// --- STYLES ---
const INPUT_BASE = "w-full p-3 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50 focus:ring-1 focus:ring-amber-500 font-mono text-sm placeholder-gray-600";
const DROPDOWN_BASE = "absolute z-50 w-full bg-gray-900 border border-amber-500/50 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.9)] mt-1 max-h-64 overflow-y-auto custom-scrollbar";
const BADGE = "inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-2";

// --- 1. SMART DATE PICKER ---
interface SmartDatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export const SmartDatePicker: React.FC<SmartDatePickerProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal query with external value
  useEffect(() => { setQuery(value); }, [value]);

  // Suggestions Logic
  const getSuggestions = () => {
    const q = query.toLowerCase();
    const suggestions = [];

    // 1. Text Filters
    if (q.includes("leo")) suggestions.push({ label: "Leo Season (Recent)", value: "2023-08-15", note: "Sun in Leo" });
    if (q.includes("1980")) suggestions.push({ label: "Start of Decade", value: "1980-01-01", note: "Jan 1st" });
    
    // 2. Famous People
    const famous = getFamousBirthdays().filter(p => p.name.toLowerCase().includes(q));
    famous.forEach(f => suggestions.push({ label: f.name, value: f.date, note: "Famous Chart" }));

    // 3. Current/Recent
    if (!q || "today".includes(q)) {
        const today = new Date().toISOString().split('T')[0];
        suggestions.push({ label: "Today (Live Transit)", value: today, note: "Now" });
    }

    return suggestions;
  };

  const handleSelect = (date: string) => {
    onChange(date);
    setIsOpen(false);
  };

  const moonInfo = value ? getMoonInfo(value) : null;

  return (
    <div className="relative group" ref={wrapperRef}>
      <label className="block text-amber-200 mb-1 font-cinzel text-xs font-bold uppercase tracking-widest">
        Date of Birth
        {moonInfo && <span className="text-amber-500 ml-2 normal-case font-mono opacity-80">[{moonInfo.sign} Moon]</span>}
      </label>
      <div className="relative">
        <input 
            type="date" // Fallback to date picker but allow text search conceptually if type="text" used, keeping date for simplicity + icon
            className={INPUT_BASE}
            value={query}
            onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay for click
        />
        {/* Search Icon Overlay */}
        <div className="absolute right-3 top-3 pointer-events-none text-amber-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
      </div>

      {isOpen && query.length > 0 && !/\d{4}-\d{2}-\d{2}/.test(query) && (
        <div className={DROPDOWN_BASE}>
            <div className="p-2 text-xs text-gray-500 uppercase tracking-widest bg-gray-950/50">Smart Suggestions</div>
            {getSuggestions().map((s, i) => (
                <div 
                    key={i} 
                    className="p-3 hover:bg-amber-900/30 cursor-pointer flex justify-between items-center transition-colors border-b border-gray-800 last:border-0"
                    onMouseDown={() => handleSelect(s.value)}
                >
                    <span className="text-amber-100 font-bold">{s.label}</span>
                    <div className="text-right">
                        <div className="text-xs text-amber-500">{s.value}</div>
                        <div className="text-[10px] text-gray-500">{s.note}</div>
                    </div>
                </div>
            ))}
            {getSuggestions().length === 0 && (
                <div className="p-3 text-gray-500 text-xs italic">Type "Leo", "Gandhi", or select a date...</div>
            )}
        </div>
      )}
    </div>
  );
};

// --- 2. SMART TIME PICKER ---
interface SmartTimePickerProps {
  value: string;
  date: string; // Needed for Lagna calculation
  onChange: (time: string) => void;
}

export const SmartTimePicker: React.FC<SmartTimePickerProps> = ({ value, date, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Generate Lagna Preview slots (every 2 hours)
  const slots = [
      "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"
  ];

  const currentLagna = value ? getLagnaForTime(value, date) : null;

  return (
    <div className="relative">
      <label className="block text-amber-200 mb-1 font-cinzel text-xs font-bold uppercase tracking-widest">
        Time of Birth
        {currentLagna && <span className="text-purple-400 ml-2 normal-case font-mono opacity-90">[{currentLagna} Lagna]</span>}
      </label>
      <div className="relative">
          <input 
            type="time" 
            className={INPUT_BASE} 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          />
          <div className="absolute right-10 top-3 text-[10px] text-amber-500/50 pointer-events-none">
              {value && getLagnaForTime(value, date)}
          </div>
      </div>

      {isOpen && (
          <div className={DROPDOWN_BASE}>
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-2 grid grid-cols-2 gap-2">
                  <div className="text-xs text-gray-400">Sunrise: <span className="text-amber-400">{getSunriseTime(date, 20)}</span></div>
                  <div className="text-xs text-gray-400 text-right">Abhijit: <span className="text-green-400">11:45-12:30</span></div>
              </div>
              <div className="p-2 text-[10px] text-gray-500 uppercase tracking-widest">Lagna Preview</div>
              {slots.map(time => {
                  const lagna = getLagnaForTime(time, date);
                  return (
                      <div 
                        key={time}
                        className="p-2 hover:bg-amber-900/30 cursor-pointer flex justify-between items-center border-b border-gray-800/50"
                        onMouseDown={() => { onChange(time); setIsOpen(false); }}
                      >
                          <span className="font-mono text-amber-100">{time}</span>
                          <span className={`text-xs ${['Aries','Leo','Sagittarius'].includes(lagna) ? 'text-red-400' : 'text-blue-300'}`}>
                              {lagna} Ascendant
                          </span>
                      </div>
                  )
              })}
          </div>
      )}
    </div>
  );
};

// --- 3. SMART CITY SEARCH ---
interface SmartCitySearchProps {
  value: string;
  onChange: (city: string, coords?: { lat: number; lng: number }) => void;
}

export const SmartCitySearch: React.FC<SmartCitySearchProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [coordsDisplay, setCoordsDisplay] = useState<string>('');

  useEffect(() => { setQuery(value); }, [value]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // Propagate text immediately
    
    if (val.length > 1) {
        setSuggestions(searchCities(val));
        setIsOpen(true);
    } else {
        setSuggestions([]);
        setIsOpen(false);
    }
  };

  const handleSelect = (city: City) => {
    setQuery(`${city.name}, ${city.country}`);
    onChange(`${city.name}, ${city.country}`, { lat: city.lat, lng: city.lng });
    setCoordsDisplay(`${city.lat.toFixed(2)}° N, ${city.lng.toFixed(2)}° E`);
    setIsOpen(false);
    
    // Save to recents
    const recents = JSON.parse(localStorage.getItem('glyph_recent_cities') || '[]');
    const newRecents = [city, ...recents.filter((c: City) => c.name !== city.name)].slice(0, 5);
    localStorage.setItem('glyph_recent_cities', JSON.stringify(newRecents));
  };

  const showRecents = () => {
      const recents = JSON.parse(localStorage.getItem('glyph_recent_cities') || '[]');
      setSuggestions(recents);
      setIsOpen(true);
  };

  return (
    <div className="relative">
        <label className="block text-amber-200 mb-1 font-cinzel text-xs font-bold uppercase tracking-widest">
            Place of Birth
            {coordsDisplay && <span className="text-green-400 ml-2 normal-case font-mono opacity-80 text-[10px]">[{coordsDisplay}]</span>}
        </label>
        <div className="relative">
            <input 
                type="text" 
                className={INPUT_BASE}
                placeholder="City, Country"
                value={query}
                onChange={handleSearch}
                onFocus={showRecents}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />
            <div className="absolute right-3 top-3 text-amber-500/50 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
        </div>

        {isOpen && (
            <div className={DROPDOWN_BASE}>
                {suggestions.length === 0 && query.length < 2 && (
                    <div className="p-3 text-gray-500 text-xs">Start typing to search global cities...</div>
                )}
                {suggestions.map((city, i) => (
                    <div 
                        key={i} 
                        className="p-3 hover:bg-amber-900/30 cursor-pointer border-b border-gray-800 transition-colors"
                        onMouseDown={() => handleSelect(city)}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-amber-100 font-bold">{city.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{city.tz}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                            <span>{city.state ? `${city.state}, ` : ''}{city.country}</span>
                            <span>{city.lat.toFixed(2)}, {city.lng.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

