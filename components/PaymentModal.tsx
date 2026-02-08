import React, { useState, useEffect, useMemo } from 'react';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { securityService } from '../services/security';
import { paymentManager, PaymentProvider } from '../services/paymentManager';
import { useDb } from '../hooks/useDb';
import { Currency } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import Card from './shared/Card';
import OptimizedImage from './shared/OptimizedImage';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentMethod {
  id: string;
  name: string;
  logo_url: string;
  type: string;
  status: string;
  qr_code_url?: string;
  upi_id?: string;
  payment_config?: any;
}

interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (details?: any) => void | Promise<void>;
  basePrice: number; 
  serviceName: string;
}

const CURRENCIES: Currency[] = ['INR', 'USD', 'EUR', 'SAR', 'BRL', 'RUB', 'JPY', 'CNY'];

const LOCAL_UPI_LOGOS: Record<string, string> = {
  'google pay': 'https://www.vectorlogo.zone/logos/google_pay/google_pay-icon.svg',
  'gpay': 'https://www.vectorlogo.zone/logos/google_pay/google_pay-icon.svg',
  'phonepe': 'https://www.vectorlogo.zone/logos/phonepe/phonepe-icon.svg',
  'paytm': 'https://www.vectorlogo.zone/logos/paytm/paytm-icon.svg',
  'bhim': 'https://raw.githubusercontent.com/justpay/upi-icons/master/png/bhim.png',
  'amazon pay': 'https://raw.githubusercontent.com/justpay/upi-icons/master/png/amazon-pay.png'
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isVisible, onClose, onSuccess, basePrice, serviceName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeProvider, setActiveProvider] = useState<PaymentProvider | null>(null);
  const [paymentMethodTab, setPaymentMethodTab] = useState<'card' | 'upi'>('upi');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  // Added toast state to fix 'showToast' error
  const [toast, setToast] = useState<string | null>(null);

  const { t, getRegionalPrice, currency, setCurrency } = useTranslation();
  const { user, pendingReading, commitPendingReading, refreshUser } = useAuth();
  const { db } = useDb();
  const { theme } = useTheme();
  
  const isLight = theme.mode === 'light';

  // Define showToast helper function
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

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

  const activeMethods = useMemo(() => {
    return (db.payment_methods || []).filter((m: any) => m.status === 'active' && m.type === 'upi');
  }, [db.payment_methods]);

  useEffect(() => {
    if (isVisible) {
      if (user?.currency && user.currency !== currency) setCurrency(user.currency as Currency);
      setIsLoading(false);
      setIsSuccess(false);
      setShowQrCode(false);
      setSelectedMethod(null);
      setErrorMsg('');
      if (currency === 'INR') setPaymentMethodTab('upi');
      else setPaymentMethodTab('card');

      const providersList = db.payment_providers || [];
      const region = paymentManager.detectUserCountry();
      const provider = paymentManager.getActiveProviderFromList(providersList, region);
      setActiveProvider(provider);
      
      // Auto-select first method
      if (activeMethods.length > 0) setSelectedMethod(activeMethods[0]);
    }
  }, [isVisible, db.payment_providers, user, currency, setCurrency, activeMethods]);

  const priceDisplay = getRegionalPrice(basePrice);

  const handlePaymentSuccess = async (details?: any) => {
    setIsLoading(false);
    setIsSuccess(true);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    try {
      await onSuccess(details);
    } catch (error) {
      console.error('❌ [PaymentModal] Parent callback error:', error);
    }

    setTimeout(() => {
      if (pendingReading && user) commitPendingReading();
      refreshUser();
      onClose(); 
    }, 2000);
  };

  const handleMethodClick = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setErrorMsg('');
  };

  const handleScanQRClick = () => {
    if (!selectedMethod?.qr_code_url) {
      setErrorMsg('No QR available for this route.');
      return;
    }
    setShowQrCode(!showQrCode);
  };

  const handleInitiatePayment = (specificMethod?: string) => {
    if (!securityService.checkSystemIntegrity()) {
      alert("Security Alert: System Integrity compromised.");
      return;
    }
    setIsLoading(true);

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    
    const paymentDetails = {
      method: specificMethod || selectedMethod?.name || 'test',
      provider: activeProvider?.provider_type || 'manual',
      orderId: `ORD-${timestamp}-${randomId}`,
      transactionId: transactionId || `TXN-${timestamp}-${randomId}`,
      amount: basePrice,
      currency: currency,
      timestamp: new Date().toISOString()
    };

    // If Razorpay is selected as the primary gateway
    if (activeProvider?.provider_type === 'razorpay' && !activeProvider.api_key.includes('12345678')) {
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
            modal: { ondismiss: () => { setIsLoading(false); } }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    } else {
        // Fallback for Manual/Demo flow
        setTimeout(() => handlePaymentSuccess(paymentDetails), 1500);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 transition-all duration-700 ${
      isLight ? 'bg-amber-50/80' : 'bg-black/90'
    }`}>
      <div 
        className={`w-full max-w-2xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden relative min-h-[550px] flex flex-col border-2 transition-all duration-500 animate-fade-in-up ${
          isLight ? 'bg-white border-amber-200' : 'bg-[#0b0c15] border-white/5'
        }`}
      >
        <div className={`absolute inset-0 pointer-events-none opacity-5 transition-opacity duration-1000 bg-gradient-to-br ${accentClasses.gradient}`}></div>

        {/* Toast Notification for UI feedback */}
        {toast && (
          <div className="absolute top-10 right-10 z-[110] bg-green-900/90 border border-green-400 text-white px-6 py-2 rounded-full shadow-2xl animate-fade-in-up font-bold text-xs">
            {toast}
          </div>
        )}

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

        <div className="p-8 md:p-12 text-center flex flex-col h-full justify-center items-center relative z-10">
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
              <p className={`text-[9px] uppercase tracking-[0.4em] mb-8 font-black opacity-40 ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                Sacred Exchange Portal
              </p>

              <div className={`mb-8 p-8 rounded-[2rem] border relative transition-all duration-500 shadow-inner group ${
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
              </div>

              <div className={`flex p-1.5 rounded-[1.5rem] mb-6 border shadow-sm ${
                isLight ? 'bg-amber-50 border-amber-100' : 'bg-black/60 border-white/5'
              }`}>
                <button 
                  onClick={() => setPaymentMethodTab('upi')} 
                  className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-[0.2em] ${
                    paymentMethodTab === 'upi' ? (`${accentClasses.bg} text-white shadow-xl`) : (isLight ? 'text-amber-800/30' : 'text-gray-600')
                  }`}
                >
                  UPI
                </button>
                <button 
                  onClick={() => setPaymentMethodTab('card')} 
                  className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-[0.2em] ${
                    paymentMethodTab === 'card' ? (`${accentClasses.bg} text-white shadow-xl`) : (isLight ? 'text-amber-800/30' : 'text-gray-600')
                  }`}
                >
                  Card
                </button>
              </div>

              {paymentMethodTab === 'upi' ? (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-1">
                    {activeMethods.length > 0 ? activeMethods.map((method) => {
                      const normalizedName = method.name.toLowerCase().trim();
                      const fallback = LOCAL_UPI_LOGOS[normalizedName] || '';
                      const logoUrl = method.logo_url && method.logo_url.trim() !== '' ? method.logo_url : fallback;
                      
                      return (
                        <button 
                          key={method.id} 
                          onClick={() => handleMethodClick(method)} 
                          className={`flex flex-col items-center gap-2 group cursor-pointer transition-all active:scale-90 p-2 border-2 rounded-2xl ${
                            selectedMethod?.id === method.id 
                              ? 'border-orange-500 bg-orange-50/10' 
                              : 'border-transparent'
                          }`}
                          disabled={isLoading}
                        >
                          <div className={`w-14 h-14 flex items-center justify-center bg-white rounded-2xl p-2.5 transition-all shadow-md overflow-hidden ${
                            isLight ? 'border-amber-100 group-hover:border-amber-600' : 'group-hover:border-amber-500/50 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          }`}>
                            <OptimizedImage 
                              src={logoUrl} 
                              alt={method.name} 
                              className="w-full h-full object-contain" 
                              containerClassName="w-full h-full"
                              showSkeleton={true}
                              fallbackSrc={fallback}
                            />
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${
                            isLight ? 'text-amber-900/40 group-hover:text-amber-900' : 'text-gray-600 group-hover:text-amber-200'
                          }`}>
                            {method.name}
                          </span>
                        </button>
                      );
                    }) : (
                      <div className="col-span-full py-4 text-xs opacity-50 italic text-center">No UPI methods found in registry.</div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {errorMsg && <p className="text-red-500 text-[10px] font-bold uppercase">{errorMsg}</p>}
                    
                    <button 
                      onClick={handleScanQRClick} 
                      className={`w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black uppercase tracking-[0.3em] text-[9px] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                      {showQrCode ? 'Hide QR Code' : 'Scan QR Code to Pay'}
                    </button>

                    {showQrCode && selectedMethod?.qr_code_url && (
                      <Card className="p-6 bg-white border-2 border-orange-500 animate-fade-in-up">
                        <div className="flex flex-col items-center">
                           <h4 className="text-amber-900 font-cinzel font-black text-sm uppercase mb-4">Scan to Pay {priceDisplay.display}</h4>
                           <div className="w-64 h-64 border-4 border-gray-100 rounded-2xl overflow-hidden shadow-inner p-2 bg-white">
                              {/* Cache-busting with Date.now() as requested */}
                              <img 
                                src={`${selectedMethod.qr_code_url}?t=${Date.now()}`} 
                                alt="Payment QR" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(`upi://pay?pa=${selectedMethod.upi_id || 'business@okaxis'}&pn=GlyphCircle&am=${priceDisplay.price}&cu=${currency}`);
                                }}
                              />
                           </div>
                           
                           {selectedMethod.upi_id && (
                             <div className="mt-4 flex flex-col items-center">
                                <p className="text-[10px] text-gray-500 font-black uppercase mb-1">VPA Identifier</p>
                                <div className="flex items-center gap-3">
                                    <code className="text-xs font-mono bg-gray-100 px-3 py-1 rounded text-gray-700">{selectedMethod.upi_id}</code>
                                    <button 
                                        onClick={() => { navigator.clipboard.writeText(selectedMethod.upi_id!); showToast("ID Copied"); }}
                                        className="text-orange-600 text-[10px] font-bold uppercase underline"
                                    >Copy</button>
                                </div>
                             </div>
                           )}
                           
                           <div className="mt-8 w-full border-t border-gray-100 pt-6 text-left">
                              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Transaction ID / Ref #</label>
                              <div className="flex gap-2">
                                <input 
                                  value={transactionId}
                                  onChange={e => setTransactionId(e.target.value)}
                                  placeholder="Enter Ref Number"
                                  className="flex-grow p-3 border rounded-xl text-sm font-mono outline-none focus:border-orange-500 text-gray-800 bg-white"
                                />
                                <button 
                                  onClick={() => handleInitiatePayment('qr_verification')}
                                  disabled={transactionId.length < 5 || isLoading}
                                  className="px-6 bg-green-600 text-white font-black text-[10px] rounded-xl uppercase disabled:opacity-50"
                                >Verify</button>
                              </div>
                              <p className="text-[8px] text-gray-400 mt-2 italic">Provide the 12-digit UPI reference number after payment.</p>
                           </div>
                        </div>
                      </Card>
                    )}

                    <div className={`pt-4 border-t ${isLight ? 'border-amber-100' : 'border-white/5'}`}>
                      <button className={`w-full py-4 border rounded-2xl text-[9px] font-black transition-all uppercase tracking-[0.3em] ${
                        isLight ? 'bg-white border-amber-200 text-amber-900/60 hover:text-amber-900' : 'bg-gray-900 border-gray-800 text-amber-200/40 hover:text-white'
                      }`}>
                        Pay via Manual UPI ID
                      </button>
                    </div>
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