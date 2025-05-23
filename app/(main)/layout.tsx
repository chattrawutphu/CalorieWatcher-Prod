"use client";

import React, { useEffect, useState, useRef, useCallback, memo, Suspense, useMemo } from "react";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useRouter, usePathname } from "next/navigation";
import PageTransition from "@/components/page-transition";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { LocalStorageManager } from "@/lib/utils/local-storage-manager";
import { 
  useMobileOptimizations, 
  useResourceManager, 
  useDeviceCapabilities,
  useBatchedUpdates 
} from "@/lib/hooks/use-performance";

// ตัวแปรกลาง state เพื่อเก็บข้อมูลว่าได้โหลดข้อมูลเริ่มต้นแล้วหรือยัง
const appInitializationState = {
  isInitialized: false,
  lastInitTime: 0,
  pageVisitTimes: {} as Record<string, number>,
  cachedRouteData: new Map<string, any>()
};

// Optimized Skeleton loader component
const PageSkeleton = memo(() => {
  const { shouldReduceAnimations } = useDeviceCapabilities();
  
  return (
    <div className={`space-y-4 py-4 ${shouldReduceAnimations ? '' : 'animate-pulse'}`}>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
    <div className="space-y-2">
      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>
  );
});

// เพิ่มฟังก์ชันสำหรับล้าง cache เมื่อมีการเปลี่ยนแปลงข้อมูล
const clearPageCache = (pageKey: string) => {
  if (appInitializationState.cachedRouteData.has(pageKey)) {
    appInitializationState.cachedRouteData.delete(pageKey);
  }
};

// ใช้ memo เพื่อป้องกันการ re-render ที่ไม่จำเป็น
export default memo(function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(!appInitializationState.isInitialized);
  
  // Performance hooks
  useMobileOptimizations();
  const { addResource } = useResourceManager();
  const { isLowEnd } = useDeviceCapabilities();
  const batchUpdate = useBatchedUpdates();
  
  // เก็บข้อมูลเวลาการเข้าถึงล่าสุดของแต่ละหน้า
  const pageLastVisitedRef = useRef<Record<string, number>>(appInitializationState.pageVisitTimes);
  
  const { locale } = useLanguage();
  
  const { 
    initializeData 
  } = useNutritionStore();

  // ดึง page key จาก pathname
  const pageKey = useMemo(() => pathname.split('/')[1] || 'home', [pathname]);

  // Optimized initialization for low-end devices
  useEffect(() => {
    const currentTime = Date.now();
    
    // โหลดข้อมูลเฉพาะเมื่อ:
    // 1. ยังไม่เคยโหลดข้อมูลเลย หรือ
    // 2. โหลดข้อมูลครั้งล่าสุดเกิน 5 นาที (10 นาทีสำหรับ low-end devices)
    const cacheTimeout = isLowEnd ? 10 * 60 * 1000 : 5 * 60 * 1000;
    const shouldInitialize = 
      !appInitializationState.isInitialized || 
      (currentTime - appInitializationState.lastInitTime > cacheTimeout);
    
    if (shouldInitialize) {
      // แสดง loading state
      setIsLoading(true);
      
      // ใช้ Promise.resolve แบบขนานกับ requestAnimationFrame เพื่อไม่หน่วงการแสดงผล UI
      Promise.resolve().then(async () => {
        // โหลดข้อมูลเริ่มต้น
        await initializeData();
        
        // ใช้ requestIdleCallback หรือ setTimeout สำหรับ low-end devices
        const runWhenIdle = (callback: () => void) => {
          if (isLowEnd) {
            setTimeout(callback, 50);
          } else {
            (window.requestIdleCallback || ((fn: () => void) => setTimeout(fn, 1)))(callback);
          }
        };
        
        runWhenIdle(() => {
          batchUpdate(() => {
          // อัปเดต global state
          appInitializationState.isInitialized = true;
          appInitializationState.lastInitTime = currentTime;
          
          // บันทึกเวลาเข้าถึงหน้าปัจจุบัน
          pageLastVisitedRef.current[pageKey] = currentTime;
          appInitializationState.pageVisitTimes[pageKey] = currentTime;
          
          // จบการโหลด
          setIsLoading(false);
          });
        });
      });
    } else {
      // อัปเดตเวลาเข้าถึงหน้าปัจจุบันโดยไม่ต้องโหลดใหม่
      pageLastVisitedRef.current[pageKey] = currentTime;
      appInitializationState.pageVisitTimes[pageKey] = currentTime;
      setIsLoading(false);
    }
    
    // Add cleanup for LocalStorageManager
    addResource(() => {
      if (LocalStorageManager) {
        LocalStorageManager.flush(true);
      }
    });
  }, [initializeData, pageKey, isLowEnd, batchUpdate, addResource]);

  // Optimized prefetching based on device capabilities
  useEffect(() => {
    // หน้าหลักที่ควร prefetch ด้วย priority สูง
    const mainRoutes = ['/dashboard', '/home', '/stats', '/settings'];
    
    // หน้าเสริมตามบริบทของหน้าปัจจุบัน
    const contextRoutes: Record<string, string[]> = {
      'dashboard': ['/add', '/stats/day', '/settings/data'],
      'home': ['/dashboard', '/settings', '/stats'],
      'stats': ['/dashboard', '/stats/day', '/stats/month'],
      'settings': ['/settings/data', '/settings/appearance'],
      'add': ['/dashboard', '/home']
    };
    
    // Prefetch หน้าหลักที่สำคัญที่สุดก่อน
    const prefetchMainRoutes = () => {
    mainRoutes.forEach(route => {
      router.prefetch(route);
    });
    };
    
    // สำหรับ low-end devices ให้ prefetch น้อยลง
    if (isLowEnd) {
      // Prefetch เฉพาะหน้าปัจจุบันและหน้าที่เกี่ยวข้อง
      const currentRoute = `/${pageKey}`;
      if (mainRoutes.includes(currentRoute)) {
        router.prefetch(currentRoute);
      }
    } else {
      prefetchMainRoutes();
    
    // Prefetch หน้าตามบริบทเมื่อ browser ว่าง
      const runWhenIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 100));
    
    runWhenIdle(() => {
      // ดึงรายการหน้าตามบริบทของหน้าปัจจุบัน
      const relevantRoutes = contextRoutes[pageKey] || [];
      
      // Prefetch หน้าตามบริบท
      relevantRoutes.forEach(route => {
        router.prefetch(route);
      });
    });
    }
  }, [router, pageKey, isLowEnd]);

  // คำนวณว่าควรแสดง skeleton loader หรือไม่
  const shouldShowSkeleton = isLoading || !appInitializationState.isInitialized;

  // แสดง Skeleton loader เฉพาะเมื่อโหลดครั้งแรกเท่านั้น
  if (shouldShowSkeleton) {
    return (
      <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative">
        <main className="flex-1 container px-3 pt-safe relative z-10">
          <PageSkeleton />
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative">
      <main className="flex-1 container px-3 pt-safe relative z-10">
        <Suspense fallback={<PageSkeleton />}>
          <PageTransition>
            {children}
          </PageTransition>
        </Suspense>
      </main>
      <MobileNav />
    </div>
  );
});

// เอ็กซ์พอร์ต clearPageCache เพื่อให้ใช้งานได้จากภายนอก
export { clearPageCache }; 