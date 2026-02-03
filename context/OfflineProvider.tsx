
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface OfflineContextType {
  isOnline: boolean;
  isCachedMode: boolean;
  lastSyncTime: number | null;
  refreshData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

// Pull-to-Refresh Component Wrapper
export const PullToRefreshWrapper: React.FC<{ children: ReactNode; onRefresh: () => Promise<void> }> = ({ children, onRefresh }) => {
  const [startY, setStartY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const threshold = 120; // px to pull down

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0 && window.scrollY === 0) {
      // Prevent default only if we are at the top and pulling down
      // e.preventDefault(); // Note: interfering with scroll can be tricky, kept simple here
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    if (!pulling) return;
    const currentY = e.changedTouches[0].clientY;
    const diff = currentY - startY;

    if (diff > threshold && window.scrollY === 0) {
      setRefreshing(true);
      // Trigger haptic
      if (navigator.vibrate) navigator.vibrate(50);
      await onRefresh();
      setRefreshing(false);
    }
    setPulling(false);
    setStartY(0);
  };

  return (
    <div 
      onTouchStart={handleTouchStart} 
      onTouchMove={handleTouchMove} 
      onTouchEnd={handleTouchEnd}
      className="min-h-screen relative"
    >
      {refreshing && (
        <div className="absolute top-0 left-0 w-full flex justify-center py-4 z-50">
           <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {children}
    </div>
  );
};

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(Date.now());
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSyncTime(Date.now());
      // Haptic feedback for reconnection
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      // Haptic feedback for disconnection
      if (navigator.vibrate) navigator.vibrate(200);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshData = useCallback(async () => {
    if (!isOnline) return;
    // Simulate a data refresh or sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastSyncTime(Date.now());
  }, [isOnline]);

  return (
    <OfflineContext.Provider value={{ 
      isOnline, 
      isCachedMode: !isOnline, 
      lastSyncTime,
      refreshData
    }}>
      <PullToRefreshWrapper onRefresh={refreshData}>
        {!isOnline && (
          <div className="bg-amber-900/80 backdrop-blur text-amber-100 text-center text-xs py-1 px-4 sticky top-0 z-[60] border-b border-amber-500/30 animate-fade-in-up">
            You are offline. Showing cached cosmic wisdom.
          </div>
        )}
        {children}
      </PullToRefreshWrapper>
    </OfflineContext.Provider>
  );
};
