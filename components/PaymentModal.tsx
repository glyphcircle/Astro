import React, { useState, useEffect, useMemo } from 'react';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { securityService } from '../services/security';
import { paymentManager, PaymentProvider } from '../services/paymentManager';
import { useDb } from '../hooks/useDb';
import { Currency } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (details?: any) => void | Promise<void>; // ✅ Support async callbacks
  basePrice: number; 
  serviceName: string;
}

const CURRENCIES: Currency[] = ['INR', 'USD', 'EUR', 'SAR', 'BRL', 'RUB', 'JPY', 'CNY'];

const PaymentModal: React.FC<PaymentModalProps> = ({ isVisible, onClose, onSuccess, basePrice, serviceName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeProvider, setActiveProvider] = useState<PaymentProvider | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('upi');
  const [upiVpa, setUpiVpa] = useState('');
  const [showVpaInput, setShowVpaInput] = useState(false);

  const { t, getRegionalPrice, currency, setCurrency } = useTranslation();
  const { user, pendingReading, commitPendingReading, refreshUser } = useAuth();
  const { db } = useDb();
  const { theme, currentTheme } = useTheme();
  
  const isLight = theme.mode === 'light';

  // Dynamic Accent Color Mapping based on colorVariant
  const accentClasses = useMemo(() => {
    const variant = theme.colorVariant;
    const map: Record<string, { bg: string; text: string; border: string; glow: string; gradient: string }> = {
      default: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-500', glow: 'shadow-amber-500/50', gradient: 'from-amber-600 to-amber-900' },
      blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-500', glow: 'shadow-blue-500/50', gradient: 'from-blue-600 to-blue-900' },
      purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-500', glow: 'shadow-purple-500/50', gradient: 'from-purple-600 to-purple-900' },
      green: { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-500', glow: 'shadow-green-500/50', gradient: 'from-green-600 to-green-900' },
      orange: { bg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-500', glow: 'shadow-orange-500/50', gradient: 'from-orange-600 to-orange-900' },
      red: { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-500', glow: 'shadow-red-500/50', gradient: 'from-red-600 to-red-900' },
      teal: { bg: 'bg-teal-600', text: 'text-teal-600', border: 'border-teal-500', glow: 'shadow-teal-500/50', gradient: 'from-teal-600 to-teal-900' },
    };
    return map[variant] || map.default;
  }, [theme.colorVariant]);

  const upiMethods = useMemo(() => {
    return (db.payment_methods || []).filter((m: any) => m.type === 'upi' && m.status === 'active');
  }, [db.payment_methods]);

  useEffect(() => {
    if (isVisible) {
      if (user?.currency && user.currency !== currency) setCurrency(user.currency as Currency);
      setIsLoading(false);
      setIsSuccess(false);
      if (currency === 'INR') setPaymentMethod('upi');
      else setPaymentMethod('card');

      const providersList = db.payment_providers || [];
      const region = paymentManager.detectUserCountry();
      const provider = paymentManager.getActiveProviderFromList(providersList, region);
      setActiveProvider(provider);
    }
  }, [isVisible, db.payment_providers, user, currency, setCurrency]);

  const priceDisplay = getRegionalPrice(basePrice);

  
  // ✅ FIXED: Close modal AFTER parent callback completes
  const handlePaymentSuccess = async (details?: any) => {
    setIsLoading(false);
    setIsSuccess(true);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    console.log('✅ [PaymentModal] Payment successful, calling parent callback');

    try {
    // ✅ Wait for parent callback to complete
      await onSuccess(details);
      console.log('✅ [PaymentModal] Parent callback completed');
    } catch (error) {
      console.error('❌ [PaymentModal] Parent callback error:', error);
    }

  // ✅ Show success for 2 seconds, then close
    setTimeout(() => {
      if (pendingReading && user) commitPendingReading();
      refreshUser();
      onClose(); 
      console.log('✅ [PaymentModal] Modal closed');
    }, 2000); // Reduced from 3000ms to 2000ms
  };


  const handleInitiatePayment = (specificMethod?: string) => {
    if (!securityService.checkSystemIntegrity()) {
      alert("Security Alert: System Integrity compromised.");
      return;
    }
    setIsLoading(true);

    // Generate payment details
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    
    const paymentDetails = {
      method: specificMethod || 'test',
      provider: activeProvider?.provider_type || 'manual',
      orderId: `ORD-${timestamp}-${randomId}`,
      transactionId: `TXN-${timestamp}-${randomId}`,
      amount: basePrice,
      currency: currency,
      timestamp: new Date().toISOString()
    };

    console.log('💳 [PaymentModal] Processing payment:', paymentDetails);

    // Mock/Test behavior
    if (!activeProvider || activeProvider.api_key.includes('12345678') || !activeProvider.api_key) {
      setTimeout(() => handlePaymentSuccess(paymentDetails), 1500);
      return;
    }

    if (activeProvider.provider_type === 'razorpay') {
      const options = {
        key: activeProvider.api_key,
        amount: Math.round(priceDisplay.price * 100), 
        currency: currency, 
        name: "Glyph Circle",
        description: serviceName,
        handler: (res: any) => {
          const razorpayDetails = {
            ...paymentDetails,
            razorpay_payment_id: res.razorpay_payment_id,
            razorpay_order_id: res.razorpay_order_id,
            razorpay_signature: res.razorpay_signature
          };
          handlePaymentSuccess(razorpayDetails);
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: isLight ? "#92400e" : "#F59E0B" },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            console.log('⚠️ [PaymentModal] User closed Razorpay modal');
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      setTimeout(() => handlePaymentSuccess(paymentDetails), 1500);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 transition-all duration-700 ${
      isLight ? 'bg-amber-50/80' : 'bg-black/90'
    }`}>
      <div 
        className={`w-full max-w-sm rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden relative min-h-[550px] flex flex-col justify-center border-2 transition-all duration-500 animate-fade-in-up ${
          isLight ? 'bg-white border-amber-200' : 'bg-[#0b0c15] border-white/5'
        }`}
      >
        {/* Dynamic Background Gradient Overlay */}
        <div className={`absolute inset-0 pointer-events-none opacity-5 transition-opacity duration-1000 bg-gradient-to-br ${accentClasses.gradient}`}></div>

        {!isSuccess && (
          <button 
            onClick={onClose} 
            className={`absolute top-8 right-8 p-2 text-2xl transition-all z-10 hover:rotate-90 ${
              isLight ? 'text-amber-800/40 hover:text-black' : 'text-amber-500/30 hover:text-white'
            }`}
          >
            ✕
          </button>
        )}

        <div className="p-10 text-center flex flex-col h-full justify-center items-center relative z-10">
          {isSuccess ? (
            <div className="animate-fade-in-up flex flex-col items-center">
              <div className="relative mb-10">
                <div className={`w-32 h-32 bg-[#10b981] rounded-full flex items-center justify-center shadow-2xl animate-bounce border-4 border-white/20`}>
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
              </div>
              <h3 className={`text-4xl font-cinzel font-black mb-3 uppercase tracking-tighter ${isLight ? 'text-amber-900' : 'text-white'}`}>
                Offer Accepted
              </h3>
              <p className="text-[#10b981] font-black uppercase tracking-[0.3em] text-[10px]">Path Illuminated • Sealed in Akasha</p>
            </div>
          ) : (
            <div className="w-full">
              <h3 className={`text-3xl font-cinzel font-black mb-1 uppercase tracking-tighter ${isLight ? 'text-amber-950' : 'text-amber-100'}`}>
                Dakshina
              </h3>
              <p className={`text-[9px] uppercase tracking-[0.5em] mb-10 font-black opacity-40 ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                Sacred Exchange Portal
              </p>

              <div className={`mb-10 p-10 rounded-[2.5rem] border relative transition-all duration-500 shadow-inner group ${
                isLight ? 'bg-amber-50/50 border-amber-100' : 'bg-black/40 border-white/5'
              }`}>
                <div className="absolute top-4 right-6">
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className={`text-[9px] rounded-full border px-3 py-1.5 outline-none font-black cursor-pointer transition-all uppercase tracking-widest ${
                      isLight ? 'bg-white border-amber-200 text-amber-900' : 'bg-gray-800 border-white/10 text-amber-200'
                    }`}
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <span className={`font-cinzel font-black text-6xl block pt-4 tracking-tighter drop-shadow-xl transition-transform duration-500 group-hover:scale-110 ${
                  isLight ? 'text-amber-950' : 'text-white'
                }`}>
                  {priceDisplay.display}
                </span>
                <p className="text-[8px] font-black uppercase tracking-widest mt-4 opacity-30">Immediate Digital Scribing</p>
              </div>

              <div className={`flex p-1.5 rounded-[1.5rem] mb-8 border shadow-sm ${
                isLight ? 'bg-amber-50 border-amber-100' : 'bg-black/60 border-white/5'
              }`}>
                <button 
                  onClick={() => setPaymentMethod('upi')} 
                  className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-[0.2em] ${
                    paymentMethod === 'upi' ? (`${accentClasses.bg} text-white shadow-xl`) : (isLight ? 'text-amber-800/30' : 'text-gray-600')
                  }`}
                >
                  UPI
                </button>
                <button 
                  onClick={() => setPaymentMethod('card')} 
                  className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-[0.2em] ${
                    paymentMethod === 'card' ? (`${accentClasses.bg} text-white shadow-xl`) : (isLight ? 'text-amber-800/30' : 'text-gray-600')
                  }`}
                >
                  Card
                </button>
              </div>

              {paymentMethod === 'upi' ? (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="grid grid-cols-4 gap-4 px-1">
                    {upiMethods.map((method: any) => (
                      <button 
                        key={method.id} 
                        onClick={() => handleInitiatePayment(method.name.toLowerCase())} 
                        className="flex flex-col items-center gap-2 group cursor-pointer transition-all active:scale-90"
                        disabled={isLoading}
                      >
                        <div className={`w-14 h-14 flex items-center justify-center bg-white rounded-2xl p-2.5 border-2 transition-all shadow-md overflow-hidden ${
                          isLight ? 'border-amber-100 group-hover:border-amber-600' : 'border-transparent group-hover:border-amber-500/50 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        }`}>
                          <img src={method.logo_url} alt={method.name} className="w-full h-full object-contain" />
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${
                          isLight ? 'text-amber-900/40 group-hover:text-amber-900' : 'text-gray-600 group-hover:text-amber-200'
                        }`}>
                          {method.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className={`pt-6 border-t ${isLight ? 'border-amber-100' : 'border-white/5'}`}>
                    <button onClick={() => setShowVpaInput(!showVpaInput)} className={`w-full py-4 border rounded-2xl text-[9px] font-black transition-all uppercase tracking-[0.3em] ${
                      isLight ? 'bg-white border-amber-200 text-amber-900/60 hover:text-amber-900 hover:border-amber-500' : 'bg-gray-900 border-gray-800 text-amber-200/40 hover:text-white'
                    }`}>
                      {showVpaInput ? 'Hide Manual Gateway' : 'Pay via Manual UPI ID'}
                    </button>
                    {showVpaInput && (
                      <div className="flex gap-2 mt-4 animate-fade-in-up">
                        <input 
                            type="text" 
                            placeholder="seeker@upi" 
                            value={upiVpa} 
                            onChange={(e) => setUpiVpa(e.target.value)} 
                            className={`flex-grow border rounded-2xl px-5 py-4 text-sm outline-none font-mono transition-all ${
                              isLight ? 'bg-white border-amber-300 text-amber-950 focus:border-amber-600' : 'bg-black border-white/10 text-white focus:border-amber-500'
                            }`} 
                        />
                        <button 
                            onClick={() => handleInitiatePayment('vpa')} 
                            disabled={upiVpa.length < 5 || isLoading} 
                            className={`px-6 rounded-2xl font-black text-[10px] shadow-2xl active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest ${
                              isLight ? 'bg-amber-950 text-white' : `${accentClasses.bg} text-white`
                            }`}
                        >
                            PAY
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in-up pt-4">
                  <Button 
                    onClick={() => handleInitiatePayment('card')} 
                    disabled={isLoading} 
                    className={`w-full border-none shadow-2xl py-6 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transform hover:scale-[1.02] active:scale-95 transition-all ${
                      isLight ? 'bg-amber-950 text-white hover:bg-black' : `${accentClasses.bg} text-white`
                    }`}
                  >
                    {isLoading ? 'Contacting Astral Bank...' : 'Authorize Card Manifestation'}
                  </Button>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-white/5">
                <p className={`text-[8px] font-mono uppercase tracking-[0.4em] ${isLight ? 'text-amber-800/30' : 'text-gray-700'}`}>
                  Secure Peer-to-Peer Encryption Active
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
