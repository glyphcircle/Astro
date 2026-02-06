import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import PaymentModal from '../components/PaymentModal';

interface PaymentContextType {
  openPayment: (
    onSuccess: (paymentDetails?: any) => void | Promise<void>, // ✅ FIXED: Accept async callback with payment details
    serviceName?: string, 
    basePriceOverride?: number
  ) => void;
  closePayment: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState<((details?: any) => void | Promise<void>) | null>(null);
  
  // State for specific payment instance
  const [currentBasePrice, setCurrentBasePrice] = useState<number>(49);
  const [currentServiceName, setCurrentServiceName] = useState<string>('');

  const openPayment = useCallback(
    (
      cb: (paymentDetails?: any) => void | Promise<void>, // ✅ FIXED: Support async callbacks
      serviceName: string = 'Mystic Service', 
      basePriceOverride?: number
    ) => {
      console.log('💳 [PaymentContext] Opening payment:', { serviceName, price: basePriceOverride });
      
      setOnSuccessCallback(() => cb); 
      setCurrentServiceName(serviceName);
      
      // Default to 49 if no override provided (backward compatibility)
      setCurrentBasePrice(basePriceOverride !== undefined ? basePriceOverride : 49);
      
      setIsOpen(true);
    }, 
    []
  );

  const closePayment = useCallback(() => {
    console.log('💳 [PaymentContext] Closing payment modal');
    setIsOpen(false);
    setOnSuccessCallback(null);
  }, []);

  // ✅ FIXED: Handle async callbacks and pass payment details
  const handlePaymentSuccess = useCallback(async (paymentDetails?: any) => {
    console.log('✅ [PaymentContext] Payment successful, triggering callback');
    
    if (onSuccessCallback) {
      try {
        // ✅ IMPORTANT: Only call the callback - don't create transaction here
        // The calling component (proceedToPayment) will handle database operations
        await onSuccessCallback(paymentDetails);
        console.log('✅ [PaymentContext] Callback executed successfully');
      } catch (error) {
        console.error('❌ [PaymentContext] Callback error:', error);
        throw error; // Re-throw so PaymentModal can handle it
      }
    }
    
    closePayment();
  }, [onSuccessCallback, closePayment]);

  return (
    <PaymentContext.Provider value={{ openPayment, closePayment }}>
      {children}
      <PaymentModal 
        isVisible={isOpen} 
        onClose={closePayment} 
        onSuccess={handlePaymentSuccess} // ✅ Pass payment details to callback
        basePrice={currentBasePrice}
        serviceName={currentServiceName}
      />
    </PaymentContext.Provider>
  );
};
