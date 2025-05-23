// Performance-related types

export interface DeviceCapabilities {
  isLowEnd: boolean;
  shouldReduceAnimations: boolean;
  hasIntersectionObserver: boolean;
  hasRequestIdleCallback: boolean;
  memory?: number;
  connection?: {
    effectiveType: string;
    downlink: number;
  };
  hardwareConcurrency?: number;
}

export interface VirtualScrollingOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export interface VirtualScrollingResult {
  visibleItems: any[];
  visibleRange: { start: number; end: number };
  handleScroll: (e: any) => void;
  totalHeight: number;
  offsetY: number;
}

export interface PreloaderResult {
  isLoading: boolean;
  loadedCount: number;
  progress: number;
}

export interface LazyLoadResult<T extends HTMLElement = HTMLElement> {
  elementRef: any;
  isVisible: boolean;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
}

export interface CacheOptions {
  maxAge: number;
  maxEntries: number;
  strategy: 'LRU' | 'FIFO' | 'TTL';
}

export interface OptimizationConfig {
  enableVirtualScrolling: boolean;
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enablePrefetching: boolean;
  maxConcurrentRequests: number;
  cacheStrategy: CacheOptions;
}

export type ThrottledFunction<T extends (...args: any[]) => any> = T;
export type DebouncedFunction<T extends (...args: any[]) => any> = T;

export interface ResourceCleanup {
  (): void;
}

export interface BatchUpdateFunction {
  (update: () => void): void;
} 