/**
 * Enhanced Cache Service
 * ระบบแคชประสิทธิภาพสูงที่ผสมผสาน in-memory caching และ localStorage
 * ปรับปรุงให้ใช้ LocalStorageManager เพื่อเพิ่มประสิทธิภาพ
 */

import { LocalStorageManager } from "./local-storage-manager";

// คีย์ prefix เพื่อป้องกันการชนกันของข้อมูลใน localStorage
const CACHE_PREFIX = 'calorie-app-cache:';
const IMAGE_CACHE_PREFIX = 'img:';
const BACKUP_TIME_KEY = 'last-backup-time';

// เวลาหมดอายุของแคชเริ่มต้น (7 วัน)
const DEFAULT_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

// In-memory cache เพื่อลดการเข้าถึง localStorage บ่อยๆ (เฉพาะข้อมูลที่ใช้บ่อย)
const memoryCache: Map<string, { value: any, expires: number }> = new Map();

// ฟังก์ชันสำหรับการเข้ารหัสและถอดรหัสข้อมูลในแคช
const serializeData = (data: any, expires: number): string => {
  return JSON.stringify({
    data,
    expires,
  });
};

const parseData = (data: string): { data: any, expires: number } | null => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

/**
 * ดึงข้อมูลจากแคช
 * @param key คีย์สำหรับข้อมูลที่ต้องการดึง
 * @returns ข้อมูลที่ดึงได้หรือ null ถ้าไม่พบหรือหมดอายุ
 */
export const getFromCache = <T>(key: string): T | null => {
  // สร้างคีย์ที่มี prefix
  const fullKey = `${CACHE_PREFIX}${key}`;
  
  // ตรวจสอบใน memory cache ก่อน (เร็วกว่า)
  const memItem = memoryCache.get(fullKey);
  if (memItem) {
    // ตรวจสอบว่าหมดอายุหรือไม่
    if (memItem.expires > Date.now()) {
      return memItem.value as T;
    } else {
      // ถ้าหมดอายุให้ลบออกจาก memory cache
      memoryCache.delete(fullKey);
    }
  }
  
  // ถ้าไม่มีใน memory cache ให้ตรวจสอบใน localStorage ผ่าน LocalStorageManager
  try {
    if (typeof window === 'undefined' || !LocalStorageManager) return null;
    
    const item = LocalStorageManager.getItem(fullKey);
    if (!item) return null;
    
    // แปลงข้อมูล JSON
    try {
      const parsedItem = JSON.parse(item);
      
      // ตรวจสอบว่าหมดอายุหรือไม่
      if (parsedItem.expires > Date.now()) {
        // เก็บใน memory cache ด้วยเพื่อการเข้าถึงครั้งต่อไปที่เร็วขึ้น
        memoryCache.set(fullKey, {
          value: parsedItem.data,
          expires: parsedItem.expires
        });
        return parsedItem.data as T;
      } else {
        // ถ้าหมดอายุให้ลบออกจาก localStorage
        LocalStorageManager.removeItem(fullKey);
        return null;
      }
    } catch (e) {
      // ถ้า parse ไม่ได้ ให้ลบออกจาก localStorage
      LocalStorageManager.removeItem(fullKey);
      return null;
    }
  } catch (error) {
    console.error('Failed to get from cache:', error);
    return null;
  }
};

/**
 * บันทึกข้อมูลลงในแคช
 * @param key คีย์สำหรับข้อมูลที่ต้องการบันทึก
 * @param data ข้อมูลที่ต้องการบันทึก
 * @param expiryMs เวลาหมดอายุในหน่วย milliseconds (มิลลิวินาที)
 */
export const saveToCache = <T>(
  key: string,
  data: T,
  expiryMs: number = DEFAULT_CACHE_EXPIRY
): void => {
  // สร้างคีย์ที่มี prefix
  const fullKey = `${CACHE_PREFIX}${key}`;
  const expires = Date.now() + expiryMs;
  
  // สร้างข้อมูลที่จะบันทึก
  const cacheData = {
    data,
    expires
  };
  
  // บันทึกใน memory cache ก่อน (เร็วกว่า)
  memoryCache.set(fullKey, {
    value: data,
    expires
  });
  
  // บันทึกใน localStorage ผ่าน LocalStorageManager
  try {
    if (typeof window === 'undefined' || !LocalStorageManager) return;
    
    // แปลงเป็น JSON เพื่อบันทึก
    const serialized = JSON.stringify(cacheData);
    
    // ใช้ setItem แทนที่จะใช้ setObject เพื่อให้ control การ serialize เอง
    LocalStorageManager.setItem(fullKey, serialized);
  } catch (error) {
    console.error('Failed to save to cache:', error);
    // ถ้าเกิด error เช่น localStorage เต็ม ลอง clean up ข้อมูลเก่า
    try {
      if (typeof window !== 'undefined' && LocalStorageManager) {
        // ลบข้อมูลแคชที่เก่าที่สุดออกไป
        clearOldCache();
        // ลองอีกครั้ง
        const serialized = JSON.stringify(cacheData);
        LocalStorageManager.setItem(fullKey, serialized);
      }
    } catch (retryError) {
      console.error('Failed to save to cache after cleanup:', retryError);
    }
  }
};

/**
 * ลบข้อมูลออกจากแคช
 * @param key คีย์ของข้อมูลที่ต้องการลบ
 */
export const removeFromCache = (key: string): void => {
  const fullKey = `${CACHE_PREFIX}${key}`;
  
  // ลบจาก memory cache
  memoryCache.delete(fullKey);
  
  // ลบจาก localStorage ผ่าน LocalStorageManager
  try {
    if (typeof window === 'undefined' || !LocalStorageManager) return;
    LocalStorageManager.removeItem(fullKey);
  } catch (error) {
    console.error('Failed to remove from cache:', error);
  }
};

/**
 * ลบข้อมูลแคชทั้งหมดที่หมดอายุแล้ว
 */
export const clearExpiredCache = (): void => {
  const now = Date.now();
  
  // ล้าง memory cache ที่หมดอายุ
  for (const [key, value] of memoryCache.entries()) {
    if (value.expires < now) {
      memoryCache.delete(key);
    }
  }
  
  // ล้าง localStorage ที่หมดอายุ
  try {
    if (typeof window === 'undefined' || !LocalStorageManager) return;
    
    // หาคีย์ทั้งหมดที่เป็นของแคชเรา
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX) && LocalStorageManager) {
        const item = LocalStorageManager.getItem(key);
        if (item) {
          try {
            const parsedItem = JSON.parse(item);
            if (parsedItem && parsedItem.expires < now) {
              LocalStorageManager.removeItem(key);
            }
          } catch (e) {
            // ถ้า parse ไม่ได้ ลบออกไปเลย
            LocalStorageManager.removeItem(key);
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to clear expired cache:', error);
  }
};

/**
 * ล้างแคชทั้งหมดที่เก่าที่สุดเพื่อสร้างพื้นที่สำหรับข้อมูลใหม่
 * (ใช้เมื่อพื้นที่ localStorage เต็ม)
 */
export const clearOldCache = (): void => {
  try {
    if (typeof window === 'undefined' || !LocalStorageManager) return;
    
    // หาคีย์ทั้งหมดที่เป็นของแคชเรา
    const cacheKeys: Array<{key: string, expires: number}> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX) && LocalStorageManager) {
        const item = LocalStorageManager.getItem(key);
        if (item) {
          try {
            const parsedItem = JSON.parse(item);
            if (parsedItem) {
              cacheKeys.push({
                key,
                expires: parsedItem.expires
              });
            }
          } catch (e) {
            // ถ้า parse ไม่ได้ ลบออกไปเลย
            LocalStorageManager.removeItem(key);
          }
        }
      }
    }
    
    // เรียงลำดับตามวันหมดอายุจากเก่าไปใหม่
    cacheKeys.sort((a, b) => a.expires - b.expires);
    
    // ลบข้อมูลที่เก่าที่สุด 10 รายการ
    const toRemove = cacheKeys.slice(0, 10);
    toRemove.forEach(item => {
      if (LocalStorageManager) {
        LocalStorageManager.removeItem(item.key);
      }
      // ลบจาก memory cache ด้วย
      memoryCache.delete(item.key);
    });
  } catch (error) {
    console.error('Failed to clear old cache:', error);
  }
};

/**
 * บันทึกรูปภาพลงในแคช
 * @param postId ID ของโพสต์
 * @param imageUrl URL ของรูปภาพ
 * @param expiryMs เวลาหมดอายุในหน่วย milliseconds
 */
export const savePostImageToCache = (
  postId: string, 
  imageUrl: string, 
  expiryMs: number = DEFAULT_CACHE_EXPIRY
): void => {
  if (!postId || !imageUrl) return;
  saveToCache(`${IMAGE_CACHE_PREFIX}${postId}`, imageUrl, expiryMs);
};

/**
 * ดึงรูปภาพจากแคช
 * @param postId ID ของโพสต์
 * @returns URL ของรูปภาพหรือ null ถ้าไม่พบในแคช
 */
export const getCachedPostImage = (postId: string): string | null => {
  if (!postId) return null;
  return getFromCache<string>(`${IMAGE_CACHE_PREFIX}${postId}`);
};

/**
 * บันทึกเวลาที่สำรองข้อมูลล่าสุด
 * @param datetime เวลาที่สำรองข้อมูลในรูปแบบ string
 */
export const saveLastBackupTime = (datetime: string): void => {
  if (!datetime) return;
  
  try {
    if (typeof window === 'undefined' || !LocalStorageManager) return;
    
    // บันทึกลงใน localStorage โดยตรงเพราะไม่จำเป็นต้องหมดอายุ
    LocalStorageManager.setItem(`${CACHE_PREFIX}${BACKUP_TIME_KEY}`, datetime);
  } catch (error) {
    console.error('Failed to save backup time:', error);
  }
};

/**
 * ดึงเวลาที่สำรองข้อมูลล่าสุด
 * @returns เวลาที่สำรองข้อมูลล่าสุด หรือ null ถ้าไม่มี
 */
export const getLastBackupTime = (): string | null => {
  try {
    if (typeof window === 'undefined' || !LocalStorageManager) return null;
    
    // ดึงจาก localStorage โดยตรง
    const time = LocalStorageManager.getItem(`${CACHE_PREFIX}${BACKUP_TIME_KEY}`);
    return time;
  } catch (error) {
    console.error('Failed to get backup time:', error);
    return null;
  }
};

/**
 * เคลียร์แคชทั้งหมด (ใช้เมื่อล็อกเอาท์)
 */
export const clearAllCache = (): void => {
  // ล้าง memory cache
  memoryCache.clear();
  
  // ล้างเฉพาะคีย์ที่เกี่ยวข้องกับแคชเราใน localStorage
  try {
    if (typeof window === 'undefined' || !LocalStorageManager) return;
    
    // รวบรวมคีย์ที่เกี่ยวข้องกับแคชเรา
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // ลบทีละคีย์
    keysToRemove.forEach(key => {
      if (LocalStorageManager) {
        LocalStorageManager.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear all cache:', error);
  }
};

// Export default cache functions (สำหรับความเข้ากันได้กับโค้ดเดิม)
export default {
  getFromCache,
  saveToCache,
  removeFromCache,
  clearExpiredCache,
  getCachedPostImage,
  savePostImageToCache,
  clearAllCache,
  getLastBackupTime,
  saveLastBackupTime
}; 