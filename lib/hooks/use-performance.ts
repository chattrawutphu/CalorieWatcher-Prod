import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  throttle, 
  debounce, 
  createIntersectionObserver, 
  isLowEndDevice,
  shouldReduceAnimations,
  mobileOptimizations,
  ResourceManager 
} from '@/lib/utils/performance';

// Hook for throttled callbacks
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef<T>();
  
  useEffect(() => {
    throttledCallback.current = throttle(callback, delay) as T;
  }, [callback, delay]);
  
  return throttledCallback.current || callback;
}

// Hook for debounced callbacks
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  immediate?: boolean
): T {
  const debouncedCallback = useRef<T>();
  
  useEffect(() => {
    debouncedCallback.current = debounce(callback, delay, immediate) as T;
  }, [callback, delay, immediate]);
  
  return debouncedCallback.current || callback;
}

// Hook for lazy loading with intersection observer
export function useLazyLoad<T extends HTMLElement = HTMLElement>() {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<T>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = createIntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer?.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );
    
    if (observer) {
      observer.observe(element);
      return () => observer.disconnect();
    }
  }, []);
  
  return { elementRef, isVisible };
}

// Hook for detecting device capabilities
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isLowEnd: false,
    shouldReduceAnimations: false,
    hasIntersectionObserver: false,
    hasRequestIdleCallback: false,
  });
  
  useEffect(() => {
    setCapabilities({
      isLowEnd: isLowEndDevice(),
      shouldReduceAnimations: shouldReduceAnimations(),
      hasIntersectionObserver: 'IntersectionObserver' in window,
      hasRequestIdleCallback: 'requestIdleCallback' in window,
    });
  }, []);
  
  return capabilities;
}

// Hook for optimizing mobile interactions
export function useMobileOptimizations() {
  useEffect(() => {
    // Enable fast click for better touch responsiveness
    mobileOptimizations.enableFastClick();
    
    // Prevent zoom on input focus for iOS
    mobileOptimizations.preventZoomOnInput();
    
    // Optimize main scrolling element
    const main = document.querySelector('main');
    if (main) {
      mobileOptimizations.optimizeScrolling(main);
    }
  }, []);
}

// Hook for resource management and cleanup
export function useResourceManager() {
  const resourceManager = useRef(new ResourceManager());
  
  const addResource = useCallback((cleanup: () => void) => {
    resourceManager.current.add(cleanup);
  }, []);
  
  const removeResource = useCallback((cleanup: () => void) => {
    resourceManager.current.remove(cleanup);
  }, []);
  
  useEffect(() => {
    return () => {
      resourceManager.current.cleanup();
    };
  }, []);
  
  return { addResource, removeResource };
}

// Hook for virtual scrolling optimization
export function useVirtualScrolling(
  items: any[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  
  const handleScroll = useThrottle((e: React.UIEvent<HTMLElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
  }, 16);
  
  useEffect(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
    const end = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + 3
    );
    
    setVisibleRange({ start, end });
  }, [scrollTop, itemHeight, containerHeight, items.length]);
  
  const visibleItems = items.slice(visibleRange.start, visibleRange.end + 1);
  
  return {
    visibleItems,
    visibleRange,
    handleScroll,
    totalHeight: items.length * itemHeight,
    offsetY: visibleRange.start * itemHeight,
  };
}

// Hook for preloading critical resources
export function usePreloader(resources: string[]) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (resources.length === 0) {
      setIsLoading(false);
      return;
    }
    
    let loaded = 0;
    
    const loadResource = async (src: string) => {
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });
        loaded++;
        setLoadedCount(loaded);
        
        if (loaded === resources.length) {
          setIsLoading(false);
        }
      } catch (error) {
        console.warn(`Failed to preload resource: ${src}`, error);
        loaded++;
        setLoadedCount(loaded);
        
        if (loaded === resources.length) {
          setIsLoading(false);
        }
      }
    };
    
    resources.forEach(loadResource);
  }, [resources]);
  
  return {
    isLoading,
    loadedCount,
    progress: resources.length > 0 ? (loadedCount / resources.length) * 100 : 100,
  };
}

// Hook for efficient state batching
export function useBatchedUpdates() {
  const pendingUpdates = useRef<Array<() => void>>([]);
  const isScheduled = useRef(false);
  
  const batchUpdate = useCallback((update: () => void) => {
    pendingUpdates.current.push(update);
    
    if (!isScheduled.current) {
      isScheduled.current = true;
      requestAnimationFrame(() => {
        const updates = pendingUpdates.current;
        pendingUpdates.current = [];
        isScheduled.current = false;
        
        updates.forEach((updateFn: () => void) => updateFn());
      });
    }
  }, []);
  
  return batchUpdate;
} 