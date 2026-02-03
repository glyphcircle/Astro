
import React from 'react';
import Button from './Button';

interface InlineErrorProps {
    message: string;
    onRetry: () => void;
}

const InlineError: React.FC<InlineErrorProps> = ({ message, onRetry }) => {
    return (
        <div className="p-6 rounded-lg bg-red-900/10 border border-red-500/30 text-center animate-fade-in-up my-4">
            <div className="mb-3 inline-block p-2 rounded-full bg-red-900/30 border border-red-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-md font-cinzel font-bold text-amber-100 mb-1">Cosmic interference detected</h3>
            <p className="text-xs text-amber-200/60 font-lora mb-4 italic px-4">{message}</p>
            <Button onClick={onRetry} className="bg-red-900/80 hover:bg-red-800 border-red-500/40 text-xs py-2 px-6 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                Retry Operation
            </Button>
        </div>
    );
};

export default InlineError;
