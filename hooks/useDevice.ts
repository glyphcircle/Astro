
import { useState, useEffect } from 'react';

export const useDevice = () => {
  const [width, setWidth] = useState(window.innerWidth);
  
  // @ts-ignore
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNative;
  // @ts-ignore
  const platform = typeof window !== 'undefined' && window.Capacitor?.getPlatform ? window.Capacitor.getPlatform() : 'web';

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isNative, 
    platform,
    width 
  };
};
