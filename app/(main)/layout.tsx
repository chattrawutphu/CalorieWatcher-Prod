"use client";

import React, { useEffect, useState, useRef, useCallback, memo, Suspense, useMemo } from "react";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useRouter, usePathname } from "next/navigation";
import PageTransition from "@/components/page-transition";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { LocalStorageManager } from "@/lib/utils/local-storage-manager";

// ตัวแปรกลาง state เพื่อเก็บข้อมูลว่าได้โหลดข้อมูลเริ่มต้นแล้วหรือยัง
// ใช้วิธีนี้แทนการเก็บใน localStorage เพื่อลดการเข้าถึง disk I/O
const appInitializationState = {
  isInitialized: false,
  lastInitTime: 0,
  pageVisitTimes: {} as Record<string, number>,
  cachedRouteData: new Map<string, any>()
};

// Skeleton loader component
const PageSkeleton = memo(() => (
  <div className="animate-pulse space-y-4 py-4">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
    <div className="space-y-2">
      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>
));

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
  
  // เก็บข้อมูลเวลาการเข้าถึงล่าสุดของแต่ละหน้า
  const pageLastVisitedRef = useRef<Record<string, number>>(appInitializationState.pageVisitTimes);
  
  const { locale } = useLanguage();
  
  const { 
    initializeData 
  } = useNutritionStore();

  // ดึง page key จาก pathname
  const pageKey = useMemo(() => pathname.split('/')[1] || 'home', [pathname]);

  // เมื่อเริ่มต้นแอพหรือเมื่อรีเฟรช ให้โหลดข้อมูลจาก localStorage
  useEffect(() => {
    const currentTime = Date.now();
    
    // โหลดข้อมูลเฉพาะเมื่อ:
    // 1. ยังไม่เคยโหลดข้อมูลเลย หรือ
    // 2. โหลดข้อมูลครั้งล่าสุดเกิน 5 นาที
    const shouldInitialize = 
      !appInitializationState.isInitialized || 
      (currentTime - appInitializationState.lastInitTime > 5 * 60 * 1000);
    
    if (shouldInitialize) {
      // แสดง loading state
      setIsLoading(true);
      
      // ใช้ Promise.resolve แบบขนานกับ requestAnimationFrame เพื่อไม่หน่วงการแสดงผล UI
      Promise.resolve().then(async () => {
        // โหลดข้อมูลเริ่มต้น
        await initializeData();
        
        // ใช้ requestIdleCallback เพื่อไม่ block main thread
        const runWhenIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
        
        runWhenIdle(() => {
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
    } else {
      // อัปเดตเวลาเข้าถึงหน้าปัจจุบันโดยไม่ต้องโหลดใหม่
      pageLastVisitedRef.current[pageKey] = currentTime;
      appInitializationState.pageVisitTimes[pageKey] = currentTime;
      setIsLoading(false);
    }
    
    // Flush LocalStorageManager เมื่อเปลี่ยนหน้า
    return () => {
      if (LocalStorageManager) {
        LocalStorageManager.flush(true);
      }
    };
  }, [initializeData, pageKey]);

  // Prefetch main routes ตั้งแต่แรก และ prefetch เพิ่มเติมตามหน้าปัจจุบัน
  useEffect(() => {
    // หน้าหลักที่ควร prefetch ด้วย priority สูง
    const mainRoutes = ['/dashboard', '/home', '/stats', '/settings'];
    
    // หน้าเสริมตามบริบทของหน้าปัจจุบัน
    const contextRoutes: Record<string, string[]> = {
      'dashboard': ['/add', '/stats/day', '/settings/data'],
      'home': ['/dashboard', '/settings', '/stats'],
      'stats': ['/dashboard', '/stats/day', '/stats/month'],
      'settings': ['/settings/data', '/settings/appearance', '/settings/admin'],
      'add': ['/dashboard', '/home']
    };
    
    // Prefetch หน้าหลักที่สำคัญที่สุดก่อน
    mainRoutes.forEach(route => {
      router.prefetch(route);
    });
    
    // Prefetch หน้าตามบริบทเมื่อ browser ว่าง
    const runWhenIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 10));
    
    runWhenIdle(() => {
      // ดึงรายการหน้าตามบริบทของหน้าปัจจุบัน
      const relevantRoutes = contextRoutes[pageKey] || [];
      
      // Prefetch หน้าตามบริบท
      relevantRoutes.forEach(route => {
        router.prefetch(route);
      });
    });
  }, [router, pageKey]);

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