// Performance optimization utilities for mobile app

// Throttle function calls to reduce excessive executions
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Debounce function calls to delay execution until after wait time
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;
  return function(this: any, ...args: Parameters<T>) {
    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    }, wait);
    if (callNow) func.apply(this, args);
  };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Memory-efficient array operations
export function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (v, i) =>
    array.slice(i * size, i * size + size)
  );
}

// Virtual scrolling helper
export function getVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const end = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { start, end };
}

// RequestAnimationFrame throttling for smooth animations
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, args);
        rafId = null;
      });
    }
  };
}

// Preload images for better UX
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Check if device has limited resources
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // Check memory (if available)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory <= 2) return true;
  
  // Check connection
  const connection = (navigator as any).connection;
  if (connection) {
    const { effectiveType, downlink } = connection;
    if (effectiveType === '2g' || effectiveType === 'slow-2g' || downlink < 0.5) {
      return true;
    }
  }
  
  // Check CPU cores
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    return true;
  }
  
  return false;
}

// Optimize bundle loading based on device capabilities
export function shouldReduceAnimations(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return true;
  
  // Check for low-end device
  return isLowEndDevice();
}

// Efficient state updates batching
export function batchUpdates<T>(
  updates: Array<() => T>,
  delay: number = 16
): Promise<T[]> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const results = updates.map(update => update());
        resolve(results);
      }, delay);
    });
  });
}

// Resource cleanup utility
export class ResourceManager {
  private resources: Set<() => void> = new Set();
  
  add(cleanup: () => void): void {
    this.resources.add(cleanup);
  }
  
  remove(cleanup: () => void): void {
    this.resources.delete(cleanup);
  }
  
  cleanup(): void {
    this.resources.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Error during resource cleanup:', error);
      }
    });
    this.resources.clear();
  }
}

// Mobile-specific optimizations
export const mobileOptimizations = {
  // Reduce touch delay for better responsiveness
  enableFastClick: () => {
    if (typeof document !== 'undefined') {
      document.addEventListener('touchstart', () => {}, { passive: true });
    }
  },
  
  // Optimize scrolling performance
  optimizeScrolling: (element: HTMLElement) => {
    if ('CSS' in window && 'supports' in window.CSS) {
      if (window.CSS.supports('overscroll-behavior', 'contain')) {
        element.style.overscrollBehavior = 'contain';
      }
      if (window.CSS.supports('scroll-behavior', 'smooth')) {
        element.style.scrollBehavior = 'auto'; // Use auto for mobile performance
      }
    }
    
    // Add momentum scrolling for iOS
    (element.style as any).webkitOverflowScrolling = 'touch';
  },
  
  // Prevent zoom on input focus (iOS)
  preventZoomOnInput: () => {
    if (typeof document !== 'undefined') {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    }
  },
} 