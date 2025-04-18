"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * คอมโพเนนต์นี้จะทดสอบการเชื่อมต่อ API และตรวจสอบว่า session ยังใช้ได้หรือไม่
 * โดยจะส่งคำขอไปยัง API ทุก 5 นาที
 */
export default function AutoRefresh() {
  const { data: session, status } = useSession();
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // ฟังก์ชันสำหรับทดสอบการเชื่อมต่อ API และตรวจสอบ session
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      // ทดสอบการเชื่อมต่อกับ API
      const response = await fetch('/api/session', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json'
        }
      });
      
      // ถ้าสถานะเป็น 401 (Unauthorized) แสดงว่า session หมดอายุ
      if (response.status === 401) {
        console.warn('[AutoRefresh] Session invalid or expired');
        setConnectionStatus('offline');
        
        // ทริกเกอร์การรีเฟรช session โดยการใช้ custom event
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      
      if (!response.ok) {
        throw new Error(`API response not OK: ${response.status}`);
      }
      
      const data = await response.json();
      setLastCheckTime(new Date());
      setConnectionStatus('online');
      console.log('[AutoRefresh] Connection OK, session valid');
    } catch (error) {
      console.error('[AutoRefresh] Connection check failed:', error);
      setConnectionStatus('offline');
    }
  };

  // เริ่มตรวจสอบเมื่อคอมโพเนนต์โหลด และทำซ้ำทุก 5 นาที
  useEffect(() => {
    if (status !== 'authenticated') return;
    
    // ตรวจสอบครั้งแรกหลังจากโหลด
    checkConnection();
    
    // ตั้งเวลาตรวจสอบทุก 5 นาที
    const intervalId = setInterval(checkConnection, 5 * 60 * 1000);
    
    // ตรวจสอบเมื่อกลับมาออนไลน์
    const handleOnline = () => {
      console.log('[AutoRefresh] Browser went online');
      checkConnection();
    };
    
    // เพิ่ม event listener
    window.addEventListener('online', handleOnline);
    
    // ล้าง interval และ event listener เมื่อคอมโพเนนต์ถูกทำลาย
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
    };
  }, [status]);

  // คอมโพเนนต์นี้ไม่แสดงผลใดๆ ทำงานเฉพาะในพื้นหลัง
  return null;
} 