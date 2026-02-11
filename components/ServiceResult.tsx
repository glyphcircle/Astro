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
            <div className={`w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden transition-all duration-700 transform hover:scale-105 ${
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
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
              {previewPoints.map((point, idx) => (
                <div
                  key={idx}
                  className={`group flex items-start gap-3 p-5 rounded-2xl transition-all duration-500 transform cursor-default hover:scale-[1.03] hover:shadow-xl ${
                    isLight 
                      ? 'bg-gray-50 border border-transparent hover:border-amber-200 hover:bg-white hover:shadow-md' 
                      : 'bg-gray-800/40 border border-transparent hover:border-amber-500/30 hover:bg-gray-800 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                  }`}
                >
                  <span className={`text-2xl flex-shrink-0 transition-transform duration-500 group-hover:scale-125 ${
                    point.type === 'positive' ? 'text-green-500' :
                    point.type === 'negative' ? 'text-red-500' :
                    isLight ? 'text-amber-700' : 'text-amber-400'
                  }`}>
                    {point.type === 'positive' ? '✨' : 
                     point.type === 'negative' ? '⚠️' : '🔮'}
                  </span>
                  <p className={`text-sm leading-relaxed transition-colors duration-500 ${
                    isLight ? 'text-gray-700 group-hover:text-amber-900' : 'text-gray-300 group-hover:text-amber-200'
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
              className={`w-full py-5 text-lg font-cinzel font-black tracking-widest transition-all duration-500 active:scale-95 ${
                isLight
                  ? 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white shadow-xl hover:shadow-2xl'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black shadow-xl hover:shadow-amber-500/40'
              }`}
            >
              MANIFEST FULL DECREE
            </Button>

            {/* Admin Bypass Button */}
            {isAdmin && onAdminBypass && (
              <button
                onClick={onAdminBypass}
                className={`w-full py-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity ${
                  isLight ? 'text-purple-900' : 'text-purple-400'
                }`}
              >
                👑 Sovereign Direct Access
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ServiceResult;