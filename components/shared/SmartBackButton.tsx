
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

interface SmartBackButtonProps {
  fallbackRoute?: string;
  label?: string;
  className?: string;
}

const SmartBackButton: React.FC<SmartBackButtonProps> = ({ 
  fallbackRoute = '/home',
  label = 'Back',
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme.mode === 'light';

  const handleBack = () => {
    // Check if user should return to a specific report
    const returnToReport = sessionStorage.getItem('return_to_report');
    
    if (returnToReport) {
      console.log(`⬅️ Returning to ${returnToReport} report`);
      sessionStorage.removeItem('return_to_report');
      
      const routes: Record<string, string> = {
        'numerology': '/numerology',
        'astrology': '/astrology',
        'palmistry': '/palmistry',
        'tarot': '/tarot',
        'face-reading': '/face-reading',
        'remedy': '/remedy',
        'ayurveda': '/ayurveda',
        'dream-analysis': '/dream-analysis'
      };
      
      const target = routes[returnToReport];
      if (target) {
        navigate(target);
        return;
      }
    }

    const state = location.state as { from?: string } | undefined;
    
    if (state?.from || window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackRoute);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center transition-colors group ${
        className || (isLight 
          ? 'text-amber-800 hover:text-amber-950' 
          : 'text-amber-200 hover:text-amber-400')
      }`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6 mr-2 transform group-hover:-translate-x-2 transition-transform" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      <span className="font-cinzel font-bold uppercase tracking-widest text-xs">{label}</span>
    </button>
  );
};

export default SmartBackButton;
