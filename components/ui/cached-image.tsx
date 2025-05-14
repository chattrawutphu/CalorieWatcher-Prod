"use client";

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { getFromCache, saveToCache } from '@/lib/utils/cache';

// Simple cache helpers for images
const IMAGE_CACHE_PREFIX = 'img_cache_';

function getCachedPostImage(imageUrl: string): string | null {
  return getFromCache<string>(`${IMAGE_CACHE_PREFIX}${imageUrl}`);
}

function savePostImageToCache(imageUrl: string, dataUrl: string): void {
  saveToCache(`${IMAGE_CACHE_PREFIX}${imageUrl}`, dataUrl, 7 * 24 * 60 * 60 * 1000); // 7 days
}

interface CachedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  cacheKey?: string;
}

/**
 * Component แสดงรูปภาพที่ใช้ cache ก่อน แล้วค่อยโหลดจาก server
 */
export default function CachedImage({
  src,
  fallbackSrc = '/images/placeholder.png',
  alt,
  width,
  height,
  className,
  ...props
}: CachedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // ถ้าไม่มี src ให้ใช้รูปเริ่มต้น
    if (!src) {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }
    
    // ดึงข้อมูลจาก cache ก่อน
    const cachedImage = getCachedPostImage(src);
    
    if (cachedImage) {
      // ถ้ามีข้อมูลใน cache ให้แสดงทันที
      setImageSrc(cachedImage);
      setIsLoading(false);
    } else {
      // ถ้าไม่มีข้อมูลใน cache ให้ใช้รูปเริ่มต้นและโหลดจาก server
      setImageSrc(fallbackSrc);
      setIsLoading(true);
    }
    
    // โหลดข้อมูลจาก server
    const fetchImage = async () => {
      try {
        // ใช้วิธีนี้เฉพาะรูปที่มาจาก API ของเราเอง (เริ่มต้นด้วย /)
        if (src.startsWith('/api/')) {
          const response = await fetch(src);
          
          if (!isMounted) return;
          
          if (!response.ok) {
            throw new Error('Failed to load image');
          }
          
          const blob = await response.blob();
          const reader = new FileReader();
          
          reader.onloadend = () => {
            if (!isMounted) return;
            
            const base64data = reader.result as string;
            setImageSrc(base64data);
            setIsLoading(false);
            
            // บันทึกลง cache
            savePostImageToCache(src, base64data);
          };
          
          reader.readAsDataURL(blob);
        } else {
          // สำหรับรูปภายนอก ใช้วิธีการโหลดปกติ
          setImageSrc(src);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        if (isMounted) {
          setImageSrc(fallbackSrc);
          setIsLoading(false);
        }
      }
    };
    
    // ถ้าไม่มีข้อมูลใน cache หรือเป็นรูปที่มาจาก API ของเรา ให้โหลดจาก server
    if (!cachedImage || src.startsWith('/api/')) {
      fetchImage();
    }
    
    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc]);

  return (
    <div className={`relative ${className || ''}`}>
      <Image
        src={imageSrc}
        alt={alt || 'Image'}
        width={width || 100}
        height={height || 100}
        className={`${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity ${className}`}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 rounded-full border-t-transparent animate-spin border-primary"></div>
        </div>
      )}
    </div>
  );
} 