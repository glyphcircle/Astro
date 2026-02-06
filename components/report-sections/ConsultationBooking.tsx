import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

interface ConsultationOption {
  id: string;
  icon: string;
  title: string;
  description: string;
  price: number;
  action: 'book-session' | 'get-kit' | 'send-query';
}

const ConsultationBooking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme.mode === 'light';

  const consultationOptions: ConsultationOption[] = [
    {
      id: 'one-on-one',
      icon: '👤',
      title: 'ONE-ON-ONE SESSION',
      description: 'Live 60-min session with Master Astrologer',
      price: 2999,
      action: 'book-session',
    },
    {
      id: 'remedy-kit',
      icon: '🔥',
      title: 'REMEDY KIT',
      description: 'Customized package with yantras & mantras',
      price: 1499,
      action: 'get-kit',
    },
    {
      id: 'email-query',
      icon: '✉️',
      title: 'EMAIL QUERY',
      description: 'Ask specific questions with 48h response',
      price: 499,
      action: 'send-query',
    },
  ];

  const handleConsultationClick = (option: ConsultationOption) => {
    console.log(`🚀 [ConsultationBooking] Initiating ${option.action} workflow`);
    
    // Save current location and scroll position to return after booking
    const returnPath = location.pathname + location.search;
    const scrollPosition = window.scrollY;

    // Navigate to consultation booking page with context
    navigate('/consultation-booking', {
      state: {
        consultationType: option.action,
        optionId: option.id,
        price: option.price,
        title: option.title,
        returnPath,
        scrollPosition,
        fromReport: true,
        serviceType: location.pathname.includes('astrology') ? 'astrology' : 'numerology',
      },
    });
  };

  return (
    <section
      className={`w-full max-w-4xl p-8 rounded-2xl border shadow-xl transition-all ${
        isLight
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
          : 'bg-gradient-to-br from-gray-900 to-gray-800 border-amber-500/20'
      }`}
    >
      <div className="text-center mb-10">
        <h2 className={`text-3xl font-cinzel font-black uppercase tracking-widest mb-3 ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>
          Deepen Your Journey
        </h2>
        <p className={`font-lora italic text-lg ${isLight ? 'text-amber-800/70' : 'text-amber-200/60'}`}>
          Personal guidance from our Master Astrologers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {consultationOptions.map((option) => (
          <div
            key={option.id}
            className={`rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              isLight
                ? 'bg-white border-amber-300 hover:border-amber-600'
                : 'bg-gray-800/50 border-amber-700/30 hover:border-amber-500'
            }`}
          >
            <div className="text-5xl mb-4 text-center">{option.icon}</div>
            <h3 className={`text-lg font-cinzel font-black uppercase tracking-wider text-center mb-2 leading-tight ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
              {option.title}
            </h3>
            <p className={`text-sm text-center mb-4 font-lora min-h-[3rem] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              {option.description}
            </p>
            <div className="text-center mb-6">
              <span className={`text-3xl font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                ₹{option.price}
              </span>
            </div>
            <button
              onClick={() => handleConsultationClick(option)}
              className={`w-full py-3 rounded-full font-cinzel font-bold uppercase tracking-wider text-sm transition-all shadow-lg active:scale-95 ${
                isLight
                  ? 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white'
                  : 'bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 text-white'
              }`}
            >
              {option.action === 'book-session' && 'BOOK SESSION'}
              {option.action === 'get-kit' && 'GET KIT'}
              {option.action === 'send-query' && 'SEND QUERY'}
            </button>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-xl text-center text-sm ${isLight ? 'bg-amber-100/50 text-amber-900' : 'bg-amber-900/20 text-amber-200'}`}>
        <p className="font-semibold">
          ✨ All consultations include personalized remedies and lifetime report access
        </p>
      </div>
    </section>
  );
};

export default ConsultationBooking;