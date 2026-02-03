
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-skin-surface backdrop-blur-md rounded-xl shadow-lg border border-skin-border overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
