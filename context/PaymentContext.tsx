import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface PaymentContextType {
  openPayment: (onSuccess: (paymentDetails?: any) => void, serviceName: string, price: number) => void;
  isPaymentOpen: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<{
    onSuccess: (paymentDetails?: any) => void;
    serviceName: string;
    price: number;
  } | null>(null);

  const openPayment = useCallback((
    onSuccess: (paymentDetails?: any) => void,
    serviceName: string,
    price: number
  ) => {
    console.log('💳 [PaymentContext] Opening payment:', { serviceName, price });

    if (isPaymentOpen) {
      console.warn('⚠️ Payment modal already open');
      return;
    }

    setIsPaymentOpen(true);
    setCurrentPayment({ onSuccess, serviceName, price });
  }, [isPaymentOpen]);

  const handlePaymentSuccess = useCallback((paymentDetails?: any) => {
    console.log('✅ [PaymentContext] Payment successful');

    if (currentPayment) {
      currentPayment.onSuccess(paymentDetails);
    }

    setIsPaymentOpen(false);
    setCurrentPayment(null);
  }, [currentPayment]);

  const handlePaymentCancel = useCallback(() => {
    console.log('❌ [PaymentContext] Payment cancelled');
    setIsPaymentOpen(false);
    setCurrentPayment(null);
  }, []);

  return (
    <PaymentContext.Provider value={{ openPayment, isPaymentOpen }}>
      {children}

      {/* Payment Modal */}
      {isPaymentOpen && currentPayment && (
        <PaymentModalComponent
          serviceName={currentPayment.serviceName}
          price={currentPayment.price}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
};

// ✅ Payment Modal Component (FIXED)
const PaymentModalComponent: React.FC<{
  serviceName: string;
  price: number;
  onSuccess: (paymentDetails?: any) => void;
  onCancel: () => void;
}> = ({ serviceName, price, onSuccess, onCancel }) => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching payment methods...');

      const { data, error: fetchError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (fetchError) {
        console.error('❌ Supabase error:', fetchError);
        setError('Failed to load payment methods: ' + fetchError.message);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No payment methods found');
        setError('No payment methods available');
        return;
      }

      console.log('✅ Payment methods loaded:', data.length);
      setPaymentMethods(data);
      setSelectedMethod(data[0]);

    } catch (err: any) {
      console.error('❌ Error fetching payment methods:', err);
      setError('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const paymentDetails = {
        orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        method: selectedMethod?.type || 'upi',
        provider: selectedMethod?.name || 'manual',
        timestamp: new Date().toISOString()
      };

      console.log('✅ Payment confirmed:', paymentDetails);
      onSuccess(paymentDetails);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div
      data-payment-modal="true"
      className="fixed inset-0 bg-black/95 backdrop-blur-lg z-[9999] overflow-y-auto"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading && !isProcessing) {
          onCancel();
        }
      }}
    >
      {/* Scrollable Container */}
      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className="bg-gradient-to-br from-purple-900 via-black to-indigo-900 rounded-3xl max-w-md w-full p-6 border-2 border-purple-500/30 shadow-2xl relative my-8">

          {/* Close Button */}
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-cinzel font-black text-white mb-2 uppercase tracking-wider">
              Complete Payment
            </h2>
            <p className="text-purple-200 text-sm">
              {serviceName}
            </p>
          </div>

          {/* Price */}
          <div className="bg-black/40 rounded-2xl p-4 mb-4 border border-purple-500/20">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Amount</span>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                ₹{price}
              </span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 text-center p-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-300 text-sm">Loading payment methods...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="mb-6">
              <div className="text-center p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-xl mb-4">
                <p className="text-yellow-300 text-sm">⚠️ {error}</p>
              </div>
              <button
                onClick={fetchPaymentMethods}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Payment Methods */}
          {!isLoading && !error && paymentMethods.length > 0 && (
            <>
              <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Select Payment Method
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method)}
                      disabled={isProcessing}
                      className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 disabled:opacity-50 ${selectedMethod?.id === method.id
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg'
                        : 'border-gray-700 bg-black/30 hover:border-gray-600'
                        }`}
                    >
                      {method.logo_url && (
                        <div className="w-10 h-10 bg-white rounded-lg p-1.5 flex items-center justify-center flex-shrink-0">
                          <img
                            src={method.logo_url}
                            alt={method.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-bold text-white text-sm">{method.name}</p>
                        <p className="text-xs text-gray-400 uppercase">{method.type}</p>
                      </div>
                      {selectedMethod?.id === method.id && (
                        <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code Display */}
              {selectedMethod?.qr_code_url && (
                <div className="mb-4 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Scan QR Code to Pay</p>
                  <div className="inline-block p-3 bg-white rounded-xl shadow-2xl">
                    <img
                      src={selectedMethod.qr_code_url}
                      alt="Payment QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  {selectedMethod.upi_id && (
                    <div className="mt-2">
                      <p className="text-xs text-purple-300">
                        UPI: <span className="font-mono font-bold text-sm">{selectedMethod.upi_id}</span>
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedMethod.upi_id);
                          alert('UPI ID copied!');
                        }}
                        className="mt-1 text-xs text-purple-400 hover:text-purple-300 underline"
                      >
                        Copy UPI ID
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Button - ALWAYS VISIBLE */}
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing || !selectedMethod}
                className={`w-full py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all shadow-lg ${isProcessing || !selectedMethod
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-2xl transform hover:scale-105'
                  }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `I've Paid ₹${price}`
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-3">
                🔒 Click after completing payment
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.8);
        }
      `}</style>
    </div>
  );
};