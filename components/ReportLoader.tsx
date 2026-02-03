import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from './shared/Card';

const ReportLoader: React.FC = () => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const isLight = theme.mode === 'light';

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Accelerated progress curve
        const increment = prev < 30 ? 3 : 
                         prev < 60 ? 2.5 : 
                         prev < 85 ? 2 : 
                         prev < 95 ? 1.5 : 1;
        
        return Math.min(100, prev + increment); // ✅ Can reach 100%!
      });
    }, 120); // Faster updates

    return () => clearInterval(interval);
  }, []);

  const getMessage = (p: number) => {
    if (p < 15) return "Fetching sacred templates...";
    if (p < 30) return "Calculating cosmic alignments...";
    if (p < 55) return "Generating deeper soul insights...";
    if (p < 75) return "Rendering your imperial report...";
    if (p < 95) return "Applying final seals...";
    return "Manifesting your destiny...";
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      isLight 
        ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50'
        : 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
    }`}>
      <Card className="max-w-md w-full text-center space-y-8 p-10">
        
        {/* Spinner */}
        <div className="relative w-32 h-32 mx-auto">
          <div className={`absolute inset-0 rounded-full border-4 ${
            isLight ? 'border-amber-200' : 'border-gray-700'
          }`} />
          <div className={`absolute inset-0 rounded-full border-4 border-transparent ${
            isLight 
              ? 'border-t-amber-600 border-r-orange-600' 
              : 'border-t-amber-500 border-r-orange-500'
          } animate-spin`} />
        </div>

        {/* Status message */}
        <div className="space-y-4">
          <p className={`text-2xl font-serif ${
            isLight ? 'text-amber-900' : 'text-amber-400'
          }`}>
            {getMessage(progress)}
          </p>
          
          {/* Progress bar */}
          <div className={`h-2 rounded-full overflow-hidden ${
            isLight ? 'bg-gray-200' : 'bg-gray-800'
          }`}>
            <div 
              className={`h-full transition-all duration-300 ease-out ${
                isLight
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className={`text-sm ${
            isLight ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {progress}% Complete
          </p>
        </div>

        <p className={`text-xs italic ${
          isLight ? 'text-gray-500' : 'text-gray-500'
        }`}>
          Aligning temporal coordinates with planetary transits...
        </p>
      </Card>
    </div>
  );
};

export default ReportLoader;
