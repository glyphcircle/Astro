
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface RegionalPriceProps {
  baseAmount: number; // Base price in INR
  className?: string;
}

export const RegionalPrice: React.FC<RegionalPriceProps> = ({ baseAmount, className = '' }) => {
  const { getRegionalPrice } = useTranslation();
  const { display } = getRegionalPrice(baseAmount);

  return (
    <span className={`font-bold font-mono ${className}`}>
      {display}
    </span>
  );
};

export const RegionalContent: React.FC<{ 
  india?: React.ReactNode, 
  global?: React.ReactNode,
  rtl?: React.ReactNode 
}> = ({ india, global, rtl }) => {
  const { currency, isRTL } = useTranslation();

  if (isRTL && rtl) return <>{rtl}</>;
  if (currency === 'INR' && india) return <>{india}</>;
  return <>{global || india}</>;
};
