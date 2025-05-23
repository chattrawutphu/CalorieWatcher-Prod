// Performance monitoring utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start monitoring performance
  startMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor navigation timing
    this.monitorNavigationTiming();
    
    // Monitor resource loading
    this.monitorResourceTiming();
    
    // Monitor paint timing
    this.monitorPaintTiming();
    
    // Monitor layout shifts
    this.monitorLayoutShifts();
  }

  private monitorNavigationTiming(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.set('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.metrics.set('loadComplete', navigation.loadEventEnd - navigation.loadEventStart);
        this.metrics.set('firstByte', navigation.responseStart - navigation.requestStart);
      }
    }
  }

  private monitorResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            // Track slow resources
            if (resourceEntry.duration > 1000) {
              console.warn(`Slow resource: ${resourceEntry.name} took ${resourceEntry.duration}ms`);
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }
  }

  private monitorPaintTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.set('firstContentfulPaint', entry.startTime);
          }
          if (entry.name === 'largest-contentful-paint') {
            this.metrics.set('largestContentfulPaint', entry.startTime);
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      this.observers.push(observer);
    }
  }

  private monitorLayoutShifts(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.metrics.set('cumulativeLayoutShift', clsValue);
          }
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    }
  }

  // Get performance metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Log performance issues
  logPerformanceIssues(): void {
    const metrics = this.getMetrics();
    
    // Check for performance issues
    if (metrics.firstContentfulPaint > 2500) {
      console.warn('Slow First Contentful Paint:', metrics.firstContentfulPaint);
    }
    
    if (metrics.largestContentfulPaint > 4000) {
      console.warn('Slow Largest Contentful Paint:', metrics.largestContentfulPaint);
    }
    
    if (metrics.cumulativeLayoutShift > 0.1) {
      console.warn('High Cumulative Layout Shift:', metrics.cumulativeLayoutShift);
    }
  }

  // Clean up observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  if (typeof window === 'undefined') return;
  
  const memory = (performance as any).memory;
  if (memory) {
    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const totalMB = memory.totalJSHeapSize / 1024 / 1024;
    const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
    
    console.log(`Memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB (limit: ${limitMB.toFixed(2)}MB)`);
    
    // Warn if memory usage is high
    if (usedMB / limitMB > 0.8) {
      console.warn('High memory usage detected');
    }
  }
}

// FPS monitoring
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private isRunning = false;

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
  }

  private tick = (): void => {
    if (!this.isRunning) return;
    
    const now = performance.now();
    this.frameCount++;
    
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
      
      // Warn if FPS is low
      if (this.fps < 30) {
        console.warn(`Low FPS detected: ${this.fps}`);
      }
    }
    
    requestAnimationFrame(this.tick);
  };

  getFPS(): number {
    return this.fps;
  }
}

// Bundle size analyzer
export function analyzeBundleSize(): void {
  if (typeof window === 'undefined') return;
  
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  console.group('Bundle Analysis');
  console.log(`Scripts: ${scripts.length}`);
  console.log(`Stylesheets: ${styles.length}`);
  
  // Estimate total size (this is approximate)
  let totalEstimatedSize = 0;
  scripts.forEach(script => {
    const src = (script as HTMLScriptElement).src;
    if (src.includes('/_next/static/')) {
      console.log(`Script: ${src}`);
    }
  });
  
  console.groupEnd();
} 