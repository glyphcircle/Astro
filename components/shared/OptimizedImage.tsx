
import React, { useState, useMemo } from 'react';
import { cloudManager } from '../../services/cloudManager';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  containerClassName?: string;
  showSkeleton?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  fallbackSrc, 
  alt, 
  className = '', 
  containerClassName = '', 
  showSkeleton = true,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const defaultFallback = "https://images.unsplash.com/photo-1600609842388-3e4b489d71c6?q=80&w=200";

  // --- OPTIMIZATION: Memoize Cloud URL resolution ---
  // This prevents regex parsing inside cloudManager on every render cycle
  const finalSrc = useMemo(() => {
      if (hasError) return fallbackSrc || defaultFallback;
      return cloudManager.resolveImage(src);
  }, [src, hasError, fallbackSrc]);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Skeleton / Placeholder */}
      {!isLoaded && showSkeleton && (
        <div className="absolute inset-0 bg-gray-800/50 animate-pulse flex items-center justify-center z-0">
           <svg className="w-8 h-8 text-gray-600/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
        </div>
      )}
      
      {/* Image */}
      <img
        src={finalSrc}
        alt={alt || 'Visual content'}
        loading="lazy"
        crossOrigin="anonymous" 
        onLoad={() => setIsLoaded(true)}
        onError={() => { 
            // Avoid infinite loops if fallback also fails
            if (!hasError) {
                setHasError(true); 
                setIsLoaded(true); 
            }
        }}
        className={`transition-opacity duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
