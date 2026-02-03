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
  onSuccess: () => void;
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
  const { theme } = useTheme();
  const isLight = theme.mode === 'light';

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

  const handlePaymentSuccess = async () => {
    setIsLoading(false);
    setIsSuccess(true);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    if (user) {
        dbService.recordTransaction({
          user_id: user.id,
          amount: basePrice,
          description: serviceName,
          status: 'success'
        });
    }

    onSuccess(); 
    setTimeout(() => {
        if (pendingReading && user) commitPendingReading();
        refreshUser();
        onClose(); 
    }, 3000); 
  };

  const handleInitiatePayment = (specificMethod?: string) => {
    if (!securityService.checkSystemIntegrity()) {
      alert("Security Alert: System Integrity compromised.");
      return;
    }
    setIsLoading(true);

    // Mock/Test behavior
    if (!activeProvider || activeProvider.api_key.includes('12345678') || !activeProvider.api_key) {
      setTimeout(() => handlePaymentSuccess(), 1500);
      return;
    }

    if (activeProvider.provider_type === 'razorpay') {
      const options = {
        key: activeProvider.api_key,
        amount: Math.round(priceDisplay.price * 100), 
        currency: currency, 
        name: "Glyph Circle",
        description: serviceName,
        handler: handlePaymentSuccess,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: isLight ? "#92400e" : "#F59E0B" }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      setTimeout(() => handlePaymentSuccess(), 1500);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 backdrop-blur-xl z-[100] flex items-center justify-center p-4 transition-colors duration-500 ${
      isLight ? 'bg-amber-100/90' : 'bg-black/95'
    }`}>
      <div className={`w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative min-h-[500px] flex flex-col justify-center border-2 transition-all duration-500 animate-fade-in-up ${
        isLight ? 'bg-white border-amber-200' : 'bg-[#0b0c15] border-amber-500/30'
      }`}>
        {!isSuccess && (
          <button 
            onClick={onClose} 
            className={`absolute top-6 right-6 p-2 text-2xl transition-colors z-10 ${
              isLight ? 'text-amber-800 hover:text-black' : 'text-amber-500/50 hover:text-white'
            }`}
          >
            ✕
          </button>
        )}

        <div className="p-8 text-center flex flex-col h-full justify-center items-center">
          {isSuccess ? (
            <div className="animate-fade-in-up flex flex-col items-center">
              <div className="relative mb-10">
                <div className="w-28 h-28 bg-[#10b981] rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className={`text-4xl font-cinzel font-black mb-3 uppercase tracking-tight ${isLight ? 'text-amber-900' : 'text-white'}`}>
                Offer Accepted
              </h3>
              <p className="text-[#10b981] font-bold uppercase tracking-widest text-xs">Path Illuminated</p>
            </div>
          ) : (
            <div className="w-full">
              <h3 className={`text-3xl font-cinzel font-black mb-1 uppercase tracking-tighter ${isLight ? 'text-amber-950' : 'text-amber-100'}`}>
                Dakshina
              </h3>
              <p className={`text-[10px] uppercase tracking-[0.4em] mb-8 font-bold ${isLight ? 'text-amber-700/60' : 'text-amber-200/50'}`}>
                Sacred Exchange
              </p>

              <div className={`mb-10 p-8 rounded-[2rem] border relative shadow-inner ${
                isLight ? 'bg-amber-50 border-amber-100' : 'bg-black/60 border-amber-500/20'
              }`}>
                <div className="absolute top-4 right-6">
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className={`text-[10px] rounded-full border px-3 py-1 outline-none font-bold cursor-pointer transition-colors ${
                      isLight ? 'bg-white border-amber-300 text-amber-900' : 'bg-gray-800 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <span className={`font-black text-6xl block pt-2 tracking-tighter drop-shadow-sm ${
                  isLight ? 'text-amber-950' : 'text-white'
                }`}>
                  {priceDisplay.display}
                </span>
              </div>

              <div className={`flex p-1.5 rounded-2xl mb-8 border shadow-sm ${
                isLight ? 'bg-amber-50 border-amber-200' : 'bg-black/60 border-white/5'
              }`}>
                <button 
                  onClick={() => setPaymentMethod('upi')} 
                  className={`flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                    paymentMethod === 'upi' ? (isLight ? 'bg-amber-700 text-white shadow-md' : 'bg-amber-600 text-white shadow-lg') : (isLight ? 'text-amber-800/40' : 'text-gray-500')
                  }`}
                >
                  UPI
                </button>
                <button 
                  onClick={() => setPaymentMethod('card')} 
                  className={`flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                    paymentMethod === 'card' ? (isLight ? 'bg-amber-700 text-white shadow-md' : 'bg-amber-600 text-white shadow-lg') : (isLight ? 'text-amber-800/40' : 'text-gray-500')
                  }`}
                >
                  Card
                </button>
              </div>

              {paymentMethod === 'upi' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4 px-1">
                    {upiMethods.map((method: any) => (
                      <button 
                        key={method.id} 
                        onClick={() => handleInitiatePayment(method.name.toLowerCase())} 
                        className="flex flex-col items-center gap-2 group cursor-pointer transition-transform active:scale-90"
                      >
                        <div className={`w-14 h-14 flex items-center justify-center bg-white rounded-full p-2.5 border-2 transition-all shadow-md overflow-hidden ${
                          isLight ? 'border-amber-100 group-hover:border-amber-600' : 'border-transparent group-hover:border-amber-50 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        }`}>
                          <img src={method.logo_url} alt={method.name} className="w-full h-full object-contain" />
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${
                          isLight ? 'text-amber-900/40 group-hover:text-amber-900' : 'text-gray-500 group-hover:text-amber-200'
                        }`}>
                          {method.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className={`pt-6 border-t ${isLight ? 'border-amber-100' : 'border-white/5'}`}>
                    <button onClick={() => setShowVpaInput(!showVpaInput)} className={`w-full py-3.5 border rounded-2xl text-[10px] font-black transition-colors uppercase tracking-[0.2em] ${
                      isLight ? 'bg-white border-amber-200 text-amber-900/60 hover:text-amber-900 hover:border-amber-500' : 'bg-gray-900 border-gray-800 text-amber-200/60 hover:text-white'
                    }`}>
                      {showVpaInput ? 'Hide manual entry' : 'Pay via manual UPI ID'}
                    </button>
                    {showVpaInput && (
                      <div className="flex gap-2 mt-4 animate-fade-in-up">
                        <input 
                            type="text" 
                            placeholder="seeker@upi" 
                            value={upiVpa} 
                            onChange={(e) => setUpiVpa(e.target.value)} 
                            className={`flex-grow border rounded-2xl px-5 py-4 text-sm outline-none font-mono ${
                              isLight ? 'bg-white border-amber-300 text-amber-950 focus:border-amber-600' : 'bg-black border-amber-500/30 text-white focus:border-amber-500'
                            }`} 
                        />
                        <button 
                            onClick={() => handleInitiatePayment('vpa')} 
                            disabled={upiVpa.length < 5 || isLoading} 
                            className={`px-8 rounded-2xl font-bold text-xs shadow-lg active:scale-95 disabled:opacity-50 transition-all ${
                              isLight ? 'bg-amber-800 text-white hover:bg-amber-900' : 'bg-amber-600 text-white hover:bg-amber-500'
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
                    className={`w-full border-none shadow-2xl py-6 font-black uppercase tracking-[0.3em] text-xs rounded-2xl transform hover:scale-[1.02] active:scale-95 transition-all ${
                      isLight ? 'bg-amber-900 text-white hover:bg-black' : 'bg-blue-700 hover:bg-blue-600'
                    }`}
                  >
                    {isLoading ? 'Contacting Bank...' : 'Secure Card Payment'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;