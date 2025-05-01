"use client";

import React, { useEffect, useState, useCallback, memo } from "react";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useSession } from "next-auth/react";
import { redirect, useRouter, usePathname } from "next/navigation";
import PageTransition from "@/components/page-transition";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { format, isToday } from "date-fns";
import SessionRefresher from "@/components/providers/session-provider";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { toast } from "@/components/ui/use-toast";

// ใช้ memo เพื่อป้องกันการ re-render ที่ไม่จำเป็น
export default memo(function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  
  const { locale } = useLanguage();
  
  const { 
    initializeData, 
    syncData,
    canSync
  } = useNutritionStore();

  // เมื่อเริ่มต้นแอพหรือเมื่อรีเฟรช ให้โหลดข้อมูลจาก localStorage และซิงค์ข้อมูลจาก API
  useEffect(() => {
    if (status === "authenticated") {
      // ไม่ต้องมี setMainContentReady แล้ว เพราะเราแสดง MobileNav แล้ว
      
      // ใช้ Promise.resolve() เพื่อให้เรียกใช้นอก callstack หลัก และไม่บล็อกการเรนเดอร์
      Promise.resolve().then(async () => {
        // โหลดข้อมูลแบบพื้นฐานก่อน
        await initializeData();
        
        // ตรวจสอบว่าเป็นการโหลดหน้าใหม่หรือการรีเฟรช (ไม่ใช่การเปลี่ยนหน้าภายในแอพ)
        const isNewPageLoad = !sessionStorage.getItem('app-initialized');
        sessionStorage.setItem('app-initialized', 'true');
        
        // ซิงค์ข้อมูลเมื่อเป็นการโหลดหน้าใหม่หรือรีเฟรช แต่ใช้เวลาน้อยลง
        if (isNewPageLoad && canSync()) {
          // ลดเวลาดีเลย์ลงเพื่อให้ข้อมูลพร้อมเร็วขึ้น
          setTimeout(async () => {
            try {
              await syncData();
              // บันทึกเวลาซิงค์ล่าสุดใน localStorage
              localStorage.setItem('last-sync-time', new Date().toISOString());
              console.log(`[Synced] Automatic sync on app load/refresh: ${new Date().toISOString()}`);
            } catch (error) {
              console.error('Failed to sync data on app load/refresh:', error);
            }
          }, 500); // ลดจาก 2000ms เหลือ 500ms
        }
      });
    }
  }, [status, initializeData, syncData, canSync]);

  // ซิงค์ข้อมูลอัตโนมัติทุก 2 นาที
  useEffect(() => {
    if (status !== 'authenticated') return;

    // ทำการซิงค์เมื่อกลับมาออนไลน์
    const handleOnline = async () => {
      if (canSync()) {
        console.log('[AutoSync] Network is back online, syncing...');
        try {
          await syncData();
          localStorage.setItem('last-sync-time', new Date().toISOString());
          
          // ลบการแสดง toast เมื่อซิงค์สำเร็จ
        } catch (error) {
          console.error('[AutoSync] Error syncing after reconnect:', error);
          
          // Show error toast when auto-sync fails
          toast({
            title: locale === 'en' ? 'Sync Failed' : 
                   locale === 'th' ? 'ซิงค์ข้อมูลล้มเหลว' : 
                   locale === 'ja' ? '同期に失敗しました' : '同步失败',
            description: locale === 'en' ? 'Please try again later' : 
                         locale === 'th' ? 'กรุณาลองใหม่ภายหลัง' : 
                         locale === 'ja' ? '後でもう一度お試しください' : '请稍后再试',
            duration: 4000
          });
        }
      }
    };

    // คอยฟังเหตุการณ์ออนไลน์/ออฟไลน์
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [status, syncData, canSync, locale]);

  // ตรวจสอบ session และบันทึกสถานะการล็อกอินลง localStorage
  useEffect(() => {
    if (status === "authenticated" && session) {
      // เก็บข้อมูลล็อกอินที่สำเร็จลงใน localStorage
      localStorage.setItem('user-logged-in', 'true');
      localStorage.setItem('last-login-time', new Date().toISOString());
      // เก็บข้อมูลพื้นฐานของผู้ใช้ (ไม่เก็บข้อมูลที่ละเอียดอ่อน)
      if (session.user?.email) {
        localStorage.setItem('user-email', session.user.email);
      }
      // ไม่ต้องกังวลเรื่อง redirect เพราะ middleware จะทำให้
    } else if (status === "unauthenticated") {
      // ล้างข้อมูลใน localStorage เมื่อไม่มี session
      localStorage.removeItem('user-logged-in');
      localStorage.removeItem('user-email');
      // ยังคงเก็บ last-login-time ไว้เพื่อใช้ในการตรวจสอบ
    }
  }, [status, session]);

  // แสดงสถานะการโหลดตามเวลาจริง (ทำให้เร็วขึ้น)
  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

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

  // เพิ่มฟังก์ชัน handleRefresh
  const handleRefresh = useCallback(async () => {
    if (status === "authenticated") {
      if (!canSync()) {
        // ตรวจสอบว่ามีการซิงค์บ่อยเกินไปหรือไม่
        try {
          const cooldownUntil = localStorage.getItem('sync-cooldown-until');
          if (cooldownUntil) {
            const endTime = parseInt(cooldownUntil, 10);
            const now = Date.now();
            if (endTime > now) {
              // ยังอยู่ในช่วง cooldown
              const remainingMs = endTime - now;
              const remainingMinutes = Math.ceil(remainingMs / 60000);
              
              // เตรียมข้อความตามภาษาที่ใช้
              const syncMessages: Record<string, { title: string, message: string }> = {
                en: { 
                  title: "Syncing too frequently", 
                  message: `You're syncing too frequently. Please wait about ${remainingMinutes} minutes.`
                },
                th: { 
                  title: "รีเฟรชข้อมูลบ่อยเกินไป", 
                  message: `คุณรีเฟรชข้อมูลบ่อยเกินไป โปรดรอประมาณ ${remainingMinutes} นาที`
                },
                ja: { 
                  title: "同期が頻繁すぎます", 
                  message: `同期が頻繁すぎます。約${remainingMinutes}分お待ちください。`
                },
                zh: { 
                  title: "同步频率过高", 
                  message: `同步频率过高，请等待约${remainingMinutes}分钟。`
                }
              };
              
              const currentMessage = syncMessages[locale as keyof typeof syncMessages] || syncMessages.en;
              
              // แสดงข้อความเตือน
              toast({
                title: currentMessage.title,
                description: currentMessage.message,
                duration: 5000
              });
              return;
            }
          }
        } catch (error) {
          console.error('Error checking sync cooldown during pull-to-refresh:', error);
        }
      }
      
      try {
        await syncData();
        // บันทึกเวลาซิงค์ล่าสุดและแสดง toast
        localStorage.setItem('last-sync-time', new Date().toISOString());
        
        // แสดง toast ว่าข้อมูลอัปเดตแล้ว
        toast({
          title: locale === 'en' ? 'Data Updated' : 
                locale === 'th' ? 'อัปเดตข้อมูลแล้ว' : 
                locale === 'ja' ? 'データが更新されました' : '数据已更新',
          description: locale === 'en' ? 'Your data has been refreshed' : 
                      locale === 'th' ? 'ข้อมูลของคุณได้รับการรีเฟรชแล้ว' : 
                      locale === 'ja' ? 'データが更新されました' : '您的数据已刷新',
          duration: 2000
        });
        
        console.log(`[Synced] Manual pull-to-refresh sync: ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Failed to sync data on pull-to-refresh:', error);
        
        // Show error toast when manual sync fails
        toast({
          title: locale === 'en' ? 'Refresh Failed' : 
                 locale === 'th' ? 'รีเฟรชข้อมูลล้มเหลว' : 
                 locale === 'ja' ? '更新に失敗しました' : '刷新失败',
          description: locale === 'en' ? 'Please try again later' : 
                       locale === 'th' ? 'กรุณาลองใหม่ภายหลัง' : 
                       locale === 'ja' ? '後でもう一度お試しください' : '请稍后再试',
          duration: 4000
        });
      }
    }
  }, [status, syncData, canSync, locale]);

  // Show loading state while checking authentication - real-time loading indicator
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to sign in page
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  return (
    <SessionRefresher>
      <div className="flex h-screen flex-col user-select-none">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Animated blobs */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-[hsl(var(--primary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob" />
          <div className="absolute top-40 right-10 w-32 h-32 bg-[hsl(var(--secondary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-4 left-20 w-32 h-32 bg-[hsl(var(--accent))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000" />
          
          {/* Theme-specific background elements - Optimized (ลดการแสดงผลองค์ประกอบที่ไม่จำเป็น) */}
          <div className="hidden chocolate:block">
            <div className="chocolate-emoji-1" />
            <div className="chocolate-emoji-2" />
          </div>
          
          <div className="hidden sweet:block">
            <div className="sweet-emoji-1" />
            <div className="sweet-emoji-2" />
          </div>

          <div className="hidden broccoli:block">
            <div className="broccoli-emoji-1" />
            <div className="broccoli-emoji-2" />
          </div>
        </div>

        <main className="flex-1 container px-3 pt-safe relative z-10">
          <PullToRefresh onRefresh={handleRefresh}>
            <PageTransition>
              {children}
            </PageTransition>
          </PullToRefresh>
        </main>
        
        {/* แสดง MobileNav ตั้งแต่เริ่มต้นเลย ไม่ต้องรอ mainContentReady */}
        <MobileNav />
      </div>
    </SessionRefresher>
  );
}); 