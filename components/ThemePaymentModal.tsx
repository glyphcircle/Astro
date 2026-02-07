import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { useDb } from '../hooks/useDb';
import { Currency } from '../context/LanguageContext';
import Button from './shared/Button';
import Card from './shared/Card';

interface ThemePaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (details?: any) => void | Promise<void>;
  basePrice: number;
  serviceName: string;
}

const CURRENCIES: Currency[] = ['INR', 'USD', 'EUR', 'SAR', 'BRL', 'RUB', 'JPY', 'CNY'];

const ThemePaymentModal: React.FC<ThemePaymentModalProps> = ({ 
  isVisible, 
  onClose, 
  onSuccess, 
  basePrice, 
  serviceName 
}) => {
  const { theme } = useTheme();
  const { t, getRegionalPrice, currency, setCurrency } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { db } = useDb();

  const [activeTab, setActiveTab] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const isLight = theme.mode === 'light';
  const priceDisplay = getRegionalPrice(basePrice);

  // Dynamic Theme Mapping
  const themeStyles = useMemo(() => {
    const variant = theme.colorVariant;
    const variants: Record<string, any> = {
      default: { accent: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-500/30', gradient: 'from-amber-600/20 to-amber-900/20' },
      blue: { accent: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-500/30', gradient: 'from-blue-600/20 to-blue-900/20' },
      purple: { accent: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-500/30', gradient: 'from-purple-600/20 to-purple-900/20' },
      green: { accent: 'bg-green-600', text: 'text-green-600', border: 'border-green-500/30', gradient: 'from-green-600/20 to-green-900/20' },
      orange: { accent: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-500/30', gradient: 'from-orange-600/20 to-orange-900/20' },
      red: { accent: 'bg-red-600', text: 'text-red-600', border: 'border-red-500/30', gradient: 'from-red-600/20 to-red-900/20' },
      teal: { accent: 'bg-teal-600', text: 'text-teal-600', border: 'border-teal-500/30', gradient: 'from-teal-600/20 to-teal-900/20' },
    };
    return variants[variant] || variants.default;
  }, [theme.colorVariant]);

  const upiMethods = useMemo(() => {
    return (db.payment_methods || []).filter((m: any) => m.type === 'upi' && m.status === 'active');
  }, [db.payment_methods]);

  const handlePayment = async (methodName: string = 'universal') => {
    setIsLoading(true);
    // Simulate gateway delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const paymentDetails = {
      orderId: `ORD-${Date.now()}`,
      method: methodName,
      amount: priceDisplay.price,
      currency: currency,
      timestamp: new Date().toISOString()
    };

    setIsSuccess(true);
    setIsLoading(false);
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    setTimeout(async () => {
      await onSuccess(paymentDetails);
      await refreshUser();
      onClose();
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 transition-all duration-500">
      <div 
        className={`w-full max-w-md rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.7)] overflow-hidden relative flex flex-col border-2 transition-all duration-500 ${
          isLight ? 'bg-white border-amber-200' : 'bg-[#0f0f1c] border-white/5'
        }`}
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${themeStyles.gradient} opacity-30 pointer-events-none`}></div>

        {/* Close Button */}
        {!isSuccess && (
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-all z-20 text-gray-500 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}

        <div className="p-8 md:p-10 flex flex-col items-center relative z-10">
          {isSuccess ? (
            <div className="text-center py-10 animate-fade-in-up">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-cinzel font-black uppercase mb-2">Dakshina Accepted</h3>
              <p className="text-green-500 font-bold uppercase tracking-widest text-[10px]">Your path has been illuminated</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-cinzel font-black uppercase tracking-tighter mb-1">Dakshina</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Sacred Offering Portal</p>
              </div>

              {/* Price Display */}
              <div className={`p-8 rounded-[2rem] border text-center mb-8 shadow-inner relative group ${
                isLight ? 'bg-amber-50/50 border-amber-100' : 'bg-black/40 border-white/5'
              }`}>
                <div className="absolute top-3 right-4">
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="text-[9px] bg-transparent border-none outline-none font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="text-5xl font-cinzel font-black drop-shadow-xl group-hover:scale-105 transition-transform duration-500">
                  {priceDisplay.display}
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest mt-3 opacity-20">{serviceName}</p>
              </div>

              {/* Tabs */}
              <div className={`flex p-1 rounded-2xl mb-8 border transition-all ${
                isLight ? 'bg-gray-100 border-gray-200' : 'bg-black/60 border-white/5'
              }`}>
                <button 
                  onClick={() => setActiveTab('upi')}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    activeTab === 'upi' 
                      ? `${themeStyles.accent} text-white shadow-xl` 
                      : 'text-gray-500'
                  }`}
                >
                  UPI Portal
                </button>
                <button 
                  onClick={() => setActiveTab('card')}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    activeTab === 'card' 
                      ? `${themeStyles.accent} text-white shadow-xl` 
                      : 'text-gray-500'
                  }`}
                >
                  Card Payment
                </button>
              </div>

              {activeTab === 'upi' ? (
                <div className="space-y-6 animate-fade-in-up">
                  {/* UPI Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {upiMethods.map(method => (
                      <button 
                        key={method.id}
                        onClick={() => handlePayment(method.name)}
                        disabled={isLoading}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className={`w-14 h-14 rounded-2xl p-2.5 border-2 transition-all shadow-md flex items-center justify-center overflow-hidden ${
                          isLight ? 'bg-white border-gray-100 group-hover:border-amber-400' : 'bg-white border-transparent group-hover:border-amber-500/50'
                        }`}>
                          <img src={method.logo_url} alt={method.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100">{method.name}</span>
                      </button>
                    ))}
                    
                    {/* QR Option */}
                    <button 
                      onClick={() => setShowQr(!showQr)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={`w-14 h-14 rounded-2xl p-2.5 border-2 transition-all shadow-md flex items-center justify-center overflow-hidden ${
                        isLight ? 'bg-white border-gray-100 group-hover:border-amber-400' : 'bg-gray-800 border-white/10 group-hover:border-amber-500/50'
                      }`}>
                        <span className="text-2xl">📷</span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100">Scan QR</span>
                    </button>
                  </div>

                  {showQr && (
                    <Card className="p-6 bg-white border-amber-100 text-center animate-fade-in-up">
                      <div className="w-40 h-40 mx-auto bg-gray-100 border-4 border-amber-100 flex items-center justify-center rounded-2xl">
                         <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=seeker@upi&pn=GlyphCircle&am=49&cu=INR" alt="QR Code" />
                      </div>
                      <p className="text-[10px] font-bold text-amber-900 mt-4 uppercase">Scan to Pay Instantly</p>
                    </Card>
                  )}

                  {/* Manual UPI */}
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className={`w-full p-4 rounded-xl border-2 outline-none transition-all font-mono text-sm ${
                          isLight ? 'bg-gray-50 border-gray-200 focus:border-amber-500' : 'bg-black/40 border-white/10 focus:border-amber-500'
                        }`}
                      />
                      <button 
                        onClick={() => handlePayment('manual_vpa')}
                        disabled={isLoading || upiId.length < 5}
                        className={`absolute right-2 top-2 bottom-2 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                          upiId.length >= 5 ? `${themeStyles.accent} text-white shadow-lg` : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? '...' : 'PAY'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="space-y-3">
                    <input type="text" placeholder="Card Number" className={`w-full p-4 rounded-xl border-2 outline-none ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/40 border-white/10'}`} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM / YY" className={`w-full p-4 rounded-xl border-2 outline-none ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/40 border-white/10'}`} />
                      <input type="password" placeholder="CVV" className={`w-full p-4 rounded-xl border-2 outline-none ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/40 border-white/10'}`} />
                    </div>
                  </div>
                  <Button 
                    onClick={() => handlePayment('card')}
                    disabled={isLoading}
                    className={`w-full py-5 rounded-xl font-cinzel font-black uppercase text-xs tracking-[0.2em] shadow-2xl ${themeStyles.accent}`}
                  >
                    {isLoading ? 'Authorizing...' : 'Manifest Payment'}
                  </Button>
                </div>
              )}

              <p className="text-center text-[8px] font-mono uppercase tracking-[0.5em] opacity-30 mt-10">
                Encrypted Peer-to-Peer Gateway
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemePaymentModal;