import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from './shared/Card';
import Button from './shared/Button';

interface ServiceResultProps {
  serviceName: string;
  serviceIcon: string;
  previewText: string;
  onRevealReport: () => void;
  isAdmin?: boolean;
  onAdminBypass?: () => void;
}

const ServiceResult: React.FC<ServiceResultProps> = ({
  serviceName,
  serviceIcon,
  previewText,
  onRevealReport,
  isAdmin,
  onAdminBypass
}) => {
  const { theme } = useTheme();
  const isLight = theme.mode === 'light';

  // Get emoji based on service name
  const getServiceEmoji = (name: string): string => {
    const upperName = name.toUpperCase();
    if (upperName.includes('NUMEROLOGY')) return '🔢';
    if (upperName.includes('ASTROLOGY')) return '⭐';
    if (upperName.includes('PALMISTRY')) return '🖐️';
    if (upperName.includes('TAROT')) return '🃏';
    return '✨';
  };

  // Format preview text into bullet points (first 3-4 sentences only)
  const formatPreview = (text: string) => {
    // Split by asterisks or newlines, filter valid sentences
    const sentences = text
      .split(/[\*\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 50 && s.length < 400)
      .slice(0, 4); // Only first 4 points

    return sentences.map((sentence) => {
      const cleaned = sentence.replace(/^\[POSITIVE\]|\[NEGATIVE\]|^\*+/gi, '').trim();
      const isPositive = /positive|gift|strength|success|fortune|lucky|blessed/i.test(sentence);
      const isNegative = /negative|challenge|obstacle|difficulty|weakness|caution/i.test(sentence);
      
      return {
        text: cleaned,
        type: isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'
      };
    });
  };

  const previewPoints = formatPreview(previewText);

  // Check if serviceIcon is a valid URL
  const isValidImageUrl = serviceIcon && serviceIcon.startsWith('http');

  return (
    <div className={`min-h-screen p-6 ${
      isLight 
        ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50'
        : 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
    }`}>
      
      {/* Header */}
      <h1 className={`text-4xl md:text-5xl font-serif text-center mb-12 tracking-wide ${
        isLight
          ? 'text-amber-900 drop-shadow-sm'
          : 'text-amber-400'
      }`}>
        Oracle's First Vision
      </h1>

      {/* Main Card */}
      <Card className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center p-6 md:p-10">
          
          {/* Left: Visual Side - Image/Icon */}
          <div className="flex justify-center">
            <div className={`w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden transition-all ${
              isLight 
                ? 'shadow-2xl shadow-amber-300/50 ring-4 ring-amber-200' 
                : 'shadow-2xl shadow-amber-500/30 ring-4 ring-amber-900/50'
            }`}>
              {isValidImageUrl ? (
                <img
                  src={serviceIcon}
                  alt={serviceName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('❌ Image failed to load:', serviceIcon);
                    const target = e.currentTarget;
                    const parent = target.parentElement;
                    if (parent) {
                      const emoji = getServiceEmoji(serviceName);
                      const bgClass = isLight 
                        ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700' 
                        : 'bg-gradient-to-br from-gray-800 to-gray-900 text-amber-400';
                      
                      parent.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center text-8xl ${bgClass}">
                          ${emoji}
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-8xl ${
                  isLight 
                    ? 'text-amber-700 bg-gradient-to-br from-amber-100 to-orange-100' 
                    : 'text-amber-400 bg-gradient-to-br from-gray-800 to-gray-900'
                }`}>
                  {getServiceEmoji(serviceName)}
                </div>
              )}
            </div>
          </div>

          {/* Right: Content Side */}
          <div className="space-y-6">
            
            {/* Service Name Badge */}
            <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold tracking-widest ${
              isLight
                ? 'bg-amber-200 text-amber-900'
                : 'bg-amber-900/50 text-amber-400'
            }`}>
              {serviceName.toUpperCase()}
            </div>

            {/* Preview Text - Formatted as Bullet Points */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {previewPoints.map((point, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                    isLight ? 'bg-gray-50' : 'bg-gray-800/50'
                  }`}
                >
                  <span className={`text-xl flex-shrink-0 ${
                    point.type === 'positive' ? 'text-green-600' :
                    point.type === 'negative' ? 'text-red-600' :
                    isLight ? 'text-amber-700' : 'text-amber-400'
                  }`}>
                    {point.type === 'positive' ? '✨' : 
                     point.type === 'negative' ? '⚠️' : '🔮'}
                  </span>
                  <p className={`text-sm leading-relaxed ${
                    isLight ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {point.text}
                  </p>
                </div>
              ))}
              
              {/* Blur overlay to indicate more content */}
              <div className={`relative h-16 -mt-8 pointer-events-none ${
                isLight
                  ? 'bg-gradient-to-t from-white via-white/90 to-transparent'
                  : 'bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent'
              }`} />
            </div>

            {/* CTA Button */}
            <Button
              onClick={onRevealReport}
              className={`w-full py-4 text-xl font-bold tracking-wide transition-all duration-300 ${
                isLight
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-gray-900 shadow-lg hover:shadow-amber-500/50 hover:scale-[1.02]'
              }`}
            >
              REVEAL COMPLETE REPORT
            </Button>

            {/* Admin Bypass Button */}
            {isAdmin && onAdminBypass && (
              <button
                onClick={onAdminBypass}
                className={`w-full py-3 text-sm font-medium transition-all rounded-lg ${
                  isLight
                    ? 'bg-purple-100 hover:bg-purple-200 text-purple-900'
                    : 'bg-purple-900/50 hover:bg-purple-800/50 text-purple-300'
                }`}
              >
                👑 Admin Direct Access
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ServiceResult;
