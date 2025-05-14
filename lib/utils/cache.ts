// cache.ts - Cache utility functions for client-side caching
// แนะนำให้ใช้ในฝั่ง client เท่านั้น (ใช้ในไฟล์ที่มี "use client" เท่านั้น)

// กำหนดชื่อ cache key
const CACHE_KEYS = {
  APP_DATA: 'app_data',
  LAST_BACKUP: 'last-backup-time'
};

// กำหนดช่วงเวลาที่ cache จะหมดอายุ (ms)
const CACHE_EXPIRY = {
  APP_DATA: 24 * 60 * 60 * 1000, // 24 ชั่วโมง
};

// ตรวจสอบว่ากำลังทำงานในฝั่ง client หรือไม่
export const isClient = typeof window !== 'undefined';

// ฟังก์ชันสำหรับบันทึกข้อมูลลงใน localStorage พร้อมเวลาหมดอายุ
export function saveToCache(key: string, data: any, expiryTime: number = CACHE_EXPIRY.APP_DATA) {
  if (!isClient) return;
  
  try {
    const cacheData = {
      data,
      expiry: Date.now() + expiryTime
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
}

// ฟังก์ชันสำหรับดึงข้อมูลจาก localStorage พร้อมตรวจสอบการหมดอายุ
export function getFromCache<T>(key: string): T | null {
  if (!isClient) return null;
  
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;
    
    const { data, expiry } = JSON.parse(cachedData);
    
    // ตรวจสอบการหมดอายุ
    if (Date.now() > expiry) {
      localStorage.removeItem(key); // ลบข้อมูลที่หมดอายุ
      return null;
    }
    
    return data as T;
  } catch (error) {
    console.warn('Failed to get from cache:', error);
    return null;
  }
}

// ฟังก์ชันสำหรับบันทึกข้อมูลการ backup ล่าสุด
export function saveLastBackupTime(timestamp: string) {
  if (!isClient) return;
  
  try {
    localStorage.setItem(CACHE_KEYS.LAST_BACKUP, timestamp);
  } catch (error) {
    console.warn('Failed to save last backup time:', error);
  }
}

// ฟังก์ชันสำหรับดึงเวลา backup ล่าสุด
export function getLastBackupTime(): string | null {
  if (!isClient) return null;
  
  try {
    return localStorage.getItem(CACHE_KEYS.LAST_BACKUP);
  } catch (error) {
    console.warn('Failed to get last backup time:', error);
    return null;
  }
}

export default {
  CACHE_KEYS,
  saveToCache,
  getFromCache,
  saveLastBackupTime,
  getLastBackupTime
}; 