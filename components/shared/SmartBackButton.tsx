import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

interface SmartBackButtonProps {
  fallbackRoute?: string;
  label?: string;
  className?: string;
}

/**
 * SmartBackButton
 * An intelligent navigation component that handles context-aware "Back" actions.
 * Specifically avoids returning to payment screens if a process is marked as finished.
 */
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
    // 1. Check location state for completion context
    // When a user finishes a reading or payment, the component can pass these flags
    const state = location.state as any;
    
    // Requirement: "when payment is done and user click back it should not show again the payment screen"
    if (state?.isPaid || state?.completed || state?.fromPayment) {
      console.log('✅ [SmartBackButton] Completion state detected, navigating to fallback.');
      navigate(fallbackRoute, { replace: true });
      return;
    }

    // 2. Check for explicit "from" redirect context (common pattern for deep links)
    if (state?.from) {
        navigate(state.from, { replace: true });
        return;
    }

    // 3. Check session storage for "Return to Report" context 
    // This is useful for users visiting the Bazaar from a report and wanting to go back.
    const returnToReport = sessionStorage.getItem('return_to_report');
    if (returnToReport) {
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
        navigate(target, { replace: true });
        return;
      }
    }

    // 4. Default: Standard history navigation
    // We check length > 2 to ensure we stay within the app context.
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackRoute, { replace: true });
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-3 py-2 px-1 transition-all duration-300 group active:scale-95 ${
        isLight 
          ? 'text-amber-900 hover:text-amber-700' 
          : 'text-amber-200 hover:text-amber-400'
      } ${className}`}
      title={label}
      aria-label={label}
    >
      {/* Icon Container with Hover Animation */}
      <div className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-500 ${
        isLight 
          ? 'border-amber-200 bg-amber-50 group-hover:bg-amber-100 group-hover:border-amber-300 group-hover:shadow-md' 
          : 'border-white/10 bg-white/5 group-hover:bg-white/10 group-hover:border-amber-500/30 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
      }`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 transform group-hover:-translate-x-1.5 transition-transform duration-500 ease-in-out" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
      </div>

      {/* Label with specific typography */}
      <span className="font-cinzel font-black uppercase tracking-[0.25em] text-[10px] sm:text-xs">
        {label}
      </span>
    </button>
  );
};

export default SmartBackButton;