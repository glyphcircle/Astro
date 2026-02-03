
import React, { useState, useMemo } from 'react';
import Button from './shared/Button';
import Loader from './shared/Loader';
import { useDb } from '../hooks/useDb';
import { useTranslation } from '../hooks/useTranslation';

interface PaymentGatewayProps {
  onPaymentSuccess: () => void;
}

type PaymentStep = 'billing' | 'payment' | 'success';

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ onPaymentSuccess }) => {
  const [step, setStep] = useState<PaymentStep>('billing');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: '',
  });
   const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });
  const [cardError, setCardError] = useState('');
  const { t, getRegionalPrice } = useTranslation();
  const { db } = useDb();
  
  // Calculate Standard Reading Price
  const { display: priceDisplay } = getRegionalPrice(49); // Base 49 INR

  const paymentConfig = useMemo(() => {
    const config = db.payment_config.find((c: any) => c.status === 'active');
    return {
      paypalEmail: config?.account_email || 'billing@glyph.co',
      creditorName: config?.creditor_name || 'Glyph Circle',
      creditorAddress: config?.creditor_address || '123 Astral Plane, Cosmos',
    };
  }, [db]);

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingDetails({ ...billingDetails, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardError('');
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const isBillingComplete = useMemo(() => {
    return Object.values(billingDetails).every(field => (field as string).trim() !== '');
  }, [billingDetails]);

  const processPayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
      setTimeout(onPaymentSuccess, 1500);
    }, 2000);
  };

  const handleCardPayment = () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        setCardError('Please fill in all card details.');
        return;
    }
    // Simple regex for MM/YY format
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardDetails.expiry)) {
        setCardError('Please use a valid MM/YY expiry date format.');
        return;
    }
    processPayment();
  }

  const handlePayPalPayment = () => {
    processPayment();
  }
  
  const renderSuccess = () => (
    <div className="p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-green-400 mb-2">{t('paymentSuccessTitle')}</h2>
        <p className="text-amber-100">{t('paymentSuccessMsg')}</p>
    </div>
  );

  const renderBilling = () => (
    <div className="p-6">
        <h2 className="text-3xl font-bold text-center text-amber-300 mb-6">{t('billingInfo')}</h2>
        <div className="space-y-4">
            <input name="name" value={billingDetails.name} onChange={handleBillingChange} placeholder={t('fullName')} className="w-full p-2 bg-gray-800 border border-amber-500/30 rounded-md text-amber-50"/>
            <input name="email" value={billingDetails.email} onChange={handleBillingChange} placeholder={t('email')} className="w-full p-2 bg-gray-800 border border-amber-500/30 rounded-md text-amber-50"/>
            <input name="address" value={billingDetails.address} onChange={handleBillingChange} placeholder={t('address')} className="w-full p-2 bg-gray-800 border border-amber-500/30 rounded-md text-amber-50"/>
            <div className="flex gap-4">
                <input name="city" value={billingDetails.city} onChange={handleBillingChange} placeholder={t('city')} className="w-full p-2 bg-gray-800 border border-amber-500/30 rounded-md text-amber-50"/>
                <input name="zip" value={billingDetails.zip} onChange={handleBillingChange} placeholder={t('zip')} className="w-full p-2 bg-gray-800 border border-amber-500/30 rounded-md text-amber-50"/>
            </div>
            <input name="country" value={billingDetails.country} onChange={handleBillingChange} placeholder={t('country')} className="w-full p-2 bg-gray-800 border border-amber-500/30 rounded-md text-amber-50"/>
        </div>
        <Button onClick={() => setStep('payment')} disabled={!isBillingComplete} className="w-full mt-6">
            {t('proceedToPayment')}
        </Button>
    </div>
  );

  const renderPaymentSelection = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center text-amber-300 mb-4">{t('unlockReport')}</h2>
      <p className="text-center text-amber-100 mb-2">{t('paymentPrompt', { price: priceDisplay })}</p>
      <div className="text-center p-3 my-4 bg-gray-800 rounded-lg border border-amber-500/20">
          <p className="text-sm text-amber-200/70">{t('payTo')}</p>
          <p className="font-semibold text-amber-100">{paymentConfig.creditorName}</p>
          <p className="text-xs text-amber-200/60">{paymentConfig.creditorAddress}</p>
      </div>
      
      <div className="space-y-4 my-6">
        <button
          onClick={() => setPaymentMethod('card')}
          className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${paymentMethod === 'card' ? 'border-amber-400 bg-amber-900/30' : 'border-amber-800 hover:bg-gray-800'}`}
        >
          <p className="font-bold text-amber-100">{t('creditCard')}</p>
        </button>

        {paymentMethod === 'card' && (
             <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg">
                <input name="number" value={cardDetails.number} onChange={handleCardChange} placeholder="Card Number" className="w-full p-2 bg-gray-900 border border-amber-500/30 rounded-md text-amber-50"/>
                <div className="flex gap-3">
                    <input name="expiry" value={cardDetails.expiry} onChange={handleCardChange} placeholder="MM/YY" className="w-full p-2 bg-gray-900 border border-amber-500/30 rounded-md text-amber-50"/>
                    <input name="cvv" value={cardDetails.cvv} onChange={handleCardChange} placeholder="CVV" className="w-full p-2 bg-gray-900 border border-amber-500/30 rounded-md text-amber-50"/>
                </div>
                 {cardError && <p className="text-red-400 text-xs text-center pt-1">{cardError}</p>}
            </div>
        )}
       
        <button
          onClick={() => setPaymentMethod('paypal')}
          className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${paymentMethod === 'paypal' ? 'border-amber-400 bg-amber-900/30' : 'border-amber-800 hover:bg-gray-800'}`}
        >
          <p className="font-bold text-amber-100">{t('paypal')}</p>
          <p className="text-xs text-amber-200/60">{t('paypalNote', { email: paymentConfig.paypalEmail })}</p>
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4">
            {paymentMethod === 'card' && (
                <Button onClick={handleCardPayment} disabled={isLoading} className="w-full">{t('payNow')}</Button>
            )}
            {paymentMethod === 'paypal' && (
                <Button onClick={handlePayPalPayment} disabled={isLoading} className="w-full bg-[#0070ba] hover:bg-[#005ea6] border-[#0070ba] text-white">
                    Pay with PayPal
                </Button>
            )}
            <Button onClick={() => setStep('billing')} className="w-full bg-gray-600 hover:bg-gray-500 text-amber-100">
                {t('back')}
            </Button>
        </div>
      )}
    </div>
  );

  switch (step) {
    case 'billing': return renderBilling();
    case 'payment': return renderPaymentSelection();
    case 'success': return renderSuccess();
    default: return renderBilling();
  }
};

export default PaymentGateway;
