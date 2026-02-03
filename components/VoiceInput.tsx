
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult, placeholder, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    // Haptic feedback for elderly/visually impaired confirmation
    if (navigator.vibrate) navigator.vibrate(50);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Could map to LanguageContext

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
      // Success haptic
      if (navigator.vibrate) navigator.vibrate([50, 50]);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      // Error haptic
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [isSupported, onResult]);

  if (!isSupported) return null;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={startListening}
        aria-label={isListening ? "Listening..." : "Start voice input"}
        className={`
          p-3 rounded-full transition-all duration-300 flex items-center justify-center
          ${isListening 
            ? 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)] scale-110' 
            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg border border-amber-400/50'
          }
        `}
      >
        {isListening ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 10.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
      {isListening && (
        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-amber-300 font-bold whitespace-nowrap bg-black/80 px-2 py-1 rounded">
          Listening...
        </span>
      )}
    </div>
  );
};

export default VoiceInput;
