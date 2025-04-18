"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // ใช้ setTimeout เพื่อให้แน่ใจว่า session ได้ถูกโหลดมาแล้ว
    const timer = setTimeout(() => {
      try {
        const isLoggedIn = localStorage.getItem('user-logged-in') === 'true';
        const lastLoginTime = localStorage.getItem('last-login-time');
        
        if (isLoggedIn && lastLoginTime) {
          const lastLogin = new Date(lastLoginTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - lastLogin.getTime()) / (1000 * 3600);
          
          // ถ้าเคยล็อกอินและยังไม่เกิน 24 ชั่วโมง ให้ไปที่ dashboard เลย
          if (hoursDiff < 24) {
            console.log(`[Root] Found recent login ${Math.round(hoursDiff)} hours ago, redirecting to dashboard...`);
            router.push("/dashboard");
            return;
          }
        }
        
        // ถ้าไม่พบข้อมูลการล็อกอิน หรือล็อกอินนานเกินไป ให้ไปที่หน้า signin
        router.push("/auth/signin");
      } catch (error) {
        console.error('Error checking localStorage in root page:', error);
        // ถ้ามีข้อผิดพลาด ให้ไปที่หน้า signin
        router.push("/auth/signin");
      }
    }, 100); // หน่วงเวลาเล็กน้อยเพื่อให้แน่ใจว่า session ได้ถูกโหลดมาแล้ว

    return () => clearTimeout(timer);
  }, [router]);

  // ไม่แสดงอะไรเพราะหน้านี้จะถูกรีไดเร็คไปทันที
  return null;
}
