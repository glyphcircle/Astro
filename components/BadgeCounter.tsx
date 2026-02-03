
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from './PushNotifications';
import { useNavigate } from 'react-router-dom';

// Defines the PWA App Badge API
declare global {
  interface Navigator {
    setAppBadge?: (count?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  }
}

const BadgeCounter: React.FC = () => {
  const { history, user } = useAuth();
  const { permission } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
        setUnreadCount(0);
        return;
    }

    // Determine "Unread" count
    // Logic: Count readings from the last 24 hours
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    const recentReadings = history.filter(h => new Date(h.timestamp) > oneDayAgo);
    const count = recentReadings.length;

    setUnreadCount(count);

    // Update PWA Badge
    if (navigator.setAppBadge) {
      if (count > 0) {
        navigator.setAppBadge(count).catch(console.error);
      } else {
        navigator.clearAppBadge?.().catch(console.error);
      }
    }

  }, [history, user]);

  if (unreadCount === 0) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 animate-bounce pointer-events-none">
      <div 
        className="relative group pointer-events-auto cursor-pointer" 
        title={`${unreadCount} new readings today`}
        onClick={() => navigate('/history')}
      >
        {/* Glow Effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-neon-magenta rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
        
        {/* Icon */}
        <div className="relative flex items-center justify-center w-12 h-12 bg-gray-900 border border-amber-500/50 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
           </svg>
           
           {/* Badge Number */}
           <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-sm">
              <span className="text-[10px] font-bold text-white leading-none">{unreadCount}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeCounter;
