"use client";

import React, { useEffect, useState, useCallback, memo } from "react";
import { MobileNav } from "@/components/ui/mobile-nav";
import { redirect, useRouter, usePathname } from "next/navigation";
import PageTransition from "@/components/page-transition";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { format, isToday } from "date-fns";
import { toast } from "@/components/ui/use-toast";

// ใช้ memo เพื่อป้องกันการ re-render ที่ไม่จำเป็น
export default memo(function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  
  const { locale } = useLanguage();
  
  const { 
    initializeData 
  } = useNutritionStore();

  // เมื่อเริ่มต้นแอพหรือเมื่อรีเฟรช ให้โหลดข้อมูลจาก localStorage
  useEffect(() => {
      // ใช้ Promise.resolve() เพื่อให้เรียกใช้นอก callstack หลัก และไม่บล็อกการเรนเดอร์
      Promise.resolve().then(async () => {
        // โหลดข้อมูลแบบพื้นฐานก่อน
        await initializeData();
        
        // ตรวจสอบว่าเป็นการโหลดหน้าใหม่หรือการรีเฟรช (ไม่ใช่การเปลี่ยนหน้าภายในแอพ)
        const isNewPageLoad = !sessionStorage.getItem('app-initialized');
        sessionStorage.setItem('app-initialized', 'true');
    });
    
    // Set loading state to false after initialization
      setIsLoading(false);
  }, [initializeData]);

  // Prefetch main routes on layout mount to improve navigation speed (ปรับปรุงประสิทธิภาพ)
  const prefetchRoutes = useCallback(() => {
    // หน้าหลักที่ควร prefetch ตลอดเวลา
    const mainRoutes = ['/dashboard', '/history', '/meals', '/settings'];
    
    // ใช้ Promise.all เพื่อทำ prefetch พร้อมกันแบบขนาน
    Promise.all(mainRoutes.map(route => router.prefetch(route)));
    
    // Prefetch เฉพาะหน้าที่น่าจะไปต่อเท่านั้น
    if (pathname === '/dashboard') {
      router.prefetch('/add');
    } else if (pathname === '/history') {
      router.prefetch('/dashboard');
    } else if (pathname === '/meals') {
      router.prefetch('/add');
    }
  }, [router, pathname]);
  
  // ใช้ requestIdleCallback (หรือ polyfill) เพื่อ prefetch routes เมื่อ browser ว่าง
  useEffect(() => {
    // ใช้ requestIdleCallback ถ้ามี มิฉะนั้นให้ใช้ setTimeout
    const requestIdleCallbackPolyfill = 
      window.requestIdleCallback || 
      ((cb) => setTimeout(cb, 1));
      
    // ทำ prefetch เมื่อ browser ว่าง
    requestIdleCallbackPolyfill(() => {
      prefetchRoutes();
    });
  }, [prefetchRoutes]);

  // แสดง UI เฉพาะเมื่อโหลดเสร็จแล้ว
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-500">
            {locale === 'en' ? 'Loading...' : 
             locale === 'th' ? 'กำลังโหลด...' : 
             locale === 'ja' ? '読み込み中...' : '加载中...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative">
      <main className="flex-1 container px-3 pt-safe relative z-10">

      
            <PageTransition>
              {children}
            </PageTransition>
        </main>
        <MobileNav />
      </div>
  );
}); 