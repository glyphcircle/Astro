import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// @ts-ignore
import { useLocation } from 'react-router-dom';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
}

interface AnalyticsContextType {
  track: (eventName: string, properties?: Record<string, any>) => void;
  identify: (userId: string, traits?: Record<string, any>) => void;
  events: AnalyticsEvent[];
  getFunnelStats: () => any;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error("useAnalytics must be used within AnalyticsProvider");
  return context;
};

// Seed Data for "AI Studio Preview" visual pop
const MOCK_HISTORY: AnalyticsEvent[] = Array.from({ length: 50 }).flatMap((_, i) => {
    const time = Date.now() - (i * 1000 * 60 * 60); // Past 50 hours
    const baseEvents: AnalyticsEvent[] = [
        { name: 'Page View', properties: { path: '/home' }, timestamp: time },
        { name: 'Card Select', properties: { card: 'The Fool' }, timestamp: time + 1000 },
    ];
    
    // Simulate funnel dropoff
    if (Math.random() > 0.3) {
        baseEvents.push({ name: 'Open Payment Modal', properties: { source: 'Tarot' }, timestamp: time + 5000 });
        if (Math.random() > 0.6) { // 40% conversion of modal
             baseEvents.push({ 
                 name: 'Payment Success', 
                 properties: { amount: Math.random() > 0.5 ? 49 : 29, currency: 'INR' }, 
                 timestamp: time + 15000 
             });
        }
    }
    return baseEvents;
}).sort((a, b) => a.timestamp - b.timestamp);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<AnalyticsEvent[]>(MOCK_HISTORY);
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();

  // Automatic Page View Tracking
  useEffect(() => {
    track('Page View', { path: location.pathname });
  }, [location]);

  const identify = (id: string, traits?: Record<string, any>) => {
    setUserId(id);
    console.log(`[Analytics] Identify: ${id}`, traits);
    // In production: amplitude.getInstance().setUserId(id);
  };

  const track = (eventName: string, properties?: Record<string, any>) => {
    const newEvent = {
        name: eventName,
        properties,
        timestamp: Date.now(),
        userId: userId || 'anonymous'
    };
    
    setEvents(prev => [...prev, newEvent]);
    
    // Console log for debug/demo
    console.log(`[Analytics] Track: ${eventName}`, properties);
    
    // In production: amplitude.getInstance().logEvent(eventName, properties);
  };

  const getFunnelStats = () => {
      const views = events.filter(e => e.name === 'Page View' && e.properties?.path === '/home').length;
      const readings = events.filter(e => e.name === 'Card Select' || e.name === 'Reading Generated').length;
      const intents = events.filter(e => e.name === 'Open Payment Modal').length;
      const conversions = events.filter(e => e.name === 'Payment Success').length;

      return {
          views,
          readings,
          intents,
          conversions,
          conversionRate: intents > 0 ? ((conversions / intents) * 100).toFixed(1) : '0'
      };
  };

  return (
    <AnalyticsContext.Provider value={{ track, identify, events, getFunnelStats }}>
      {children}
    </AnalyticsContext.Provider>
  );
};