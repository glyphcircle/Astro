
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`bg-skin-accent hover:opacity-90 disabled:bg-gray-600 disabled:cursor-not-allowed text-skin-button-text font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg border border-skin-border/50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
