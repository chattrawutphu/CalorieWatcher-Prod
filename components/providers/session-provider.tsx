"use client";

import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Provider ที่จะรีเฟรชเซสชันอัตโนมัติทุก 4 นาที (หรือตามที่กำหนด)
export default function SessionRefresher({ children }: { children: ReactNode }) {
  const { data: session, update } = useSession();
  
  // รีเฟรชเซสชันทุก 4 นาที เพื่อป้องกันเซสชันหมดอายุ
  useEffect(() => {
    if (session) {
      const intervalId = setInterval(() => {
        console.log('[Session] Refreshing session...');
        update(); // รีเฟรชเซสชัน
      }, 4 * 60 * 1000); // ทุก 4 นาที
      
      return () => clearInterval(intervalId);
    }
  }, [session, update]);
  
  return <>{children}</>;
} 