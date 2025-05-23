"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLazyLoad } from '@/lib/hooks/use-performance';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  placeholder?: React.ReactNode;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  fallback = '/images/placeholder.png',
  placeholder,
  className,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { elementRef, isVisible } = useLazyLoad<HTMLDivElement>();

  useEffect(() => {
    if (isVisible && !imageSrc && !imageError) {
      setImageSrc(src);
    }
  }, [isVisible, src, imageSrc, imageError]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setImageSrc(fallback);
    onError?.();
  };

  const defaultPlaceholder = (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
  );

  return (
    <div ref={elementRef} className={cn("relative overflow-hidden", className)}>
      {!isVisible || (!imageSrc && !imageError) ? (
        placeholder || defaultPlaceholder
      ) : (
        <img
          src={imageSrc || fallback}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      )}
      
      {/* Loading overlay */}
      {imageSrc && !isLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  );
}

// Optimized image component with WebP support
interface OptimizedImageProps extends LazyImageProps {
  webpSrc?: string;
  sizes?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  webpSrc,
  sizes,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [supportedFormat, setSupportedFormat] = useState<string>(src);

  useEffect(() => {
    // Check WebP support
    if (webpSrc) {
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        setSupportedFormat(webp.height === 2 ? webpSrc : src);
      };
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    }
  }, [src, webpSrc]);

  // For priority images, load immediately
  if (priority) {
    return (
      <img
        src={supportedFormat}
        sizes={sizes}
        {...props}
      />
    );
  }

  return (
    <LazyImage
      src={supportedFormat}
      {...props}
    />
  );
}

export default LazyImage; 