
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import PaymentModal from '../components/PaymentModal';
import { useTranslation } from '../hooks/useTranslation';

interface PaymentContextType {
  openPayment: (onSuccess: () => void, serviceName?: string, basePriceOverride?: number) => void;
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
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);
  
  // State for specific payment instance
  const [currentBasePrice, setCurrentBasePrice] = useState<number>(49);
  const [currentServiceName, setCurrentServiceName] = useState<string>('');

  const openPayment = useCallback((cb: () => void, serviceName: string = 'Mystic Service', basePriceOverride?: number) => {
    setOnSuccessCallback(() => cb); 
    setCurrentServiceName(serviceName);
    
    // Default to 49 if no override provided (backward compatibility)
    // If basePriceOverride is provided (even 0), use it.
    setCurrentBasePrice(basePriceOverride !== undefined ? basePriceOverride : 49);
    
    setIsOpen(true);
  }, []);

  const closePayment = useCallback(() => {
    setIsOpen(false);
    setOnSuccessCallback(null);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    if (onSuccessCallback) {
      onSuccessCallback();
    }
    closePayment();
  }, [onSuccessCallback, closePayment]);

  return (
    <PaymentContext.Provider value={{ openPayment, closePayment }}>
      {children}
      <PaymentModal 
        isVisible={isOpen} 
        onClose={closePayment} 
        onSuccess={handlePaymentSuccess}
        basePrice={currentBasePrice}
        serviceName={currentServiceName}
      />
    </PaymentContext.Provider>
  );
};
