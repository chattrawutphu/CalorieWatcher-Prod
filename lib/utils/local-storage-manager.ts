/**
 * LocalStorageManager
 * 
 * จัดการ localStorage ด้วยระบบ in-memory cache เพื่อเพิ่มประสิทธิภาพ
 * - ลดจำนวนครั้งการเข้าถึง localStorage ซึ่งเป็น I/O operation ที่ช้า
 * - ช่วยจัดการการเขียนด้วยการรวมหลายการเขียนเข้าด้วยกัน (batch)
 * - มีระบบ auto-flush เมื่อปิดแท็บหรือซ่อนแอพ
 */

// ตัวแปรสำหรับควบคุมช่วงเวลาการ flush ข้อมูลลง localStorage
const FLUSH_DELAY = 500; // ms

// สถานะการซิงค์ข้อมูล
type SyncStatus = 'synced' | 'pending' | 'error';

// คลาสหลักสำหรับจัดการ localStorage
export class LocalStorageManagerClass {
  // In-memory cache
  private cache: Map<string, any> = new Map();
  
  // ติดตามคีย์ที่มีการเปลี่ยนแปลงและรอการบันทึก
  private dirtyKeys: Set<string> = new Set();
  
  // ติดตามสถานะการซิงค์
  private syncStatus: SyncStatus = 'synced';
  
  // timeoutId สำหรับ debounced flush
  private flushTimeoutId: NodeJS.Timeout | null = null;
  
  // คีย์ที่ล็อคไว้ไม่ให้ใช้ผ่าน cache (เข้าถึง localStorage โดยตรง)
  private lockedKeys: Set<string> = new Set();
  
  constructor() {
    // Initialize event listeners
    if (typeof window !== 'undefined') {
      // Initialize cache from localStorage
      this.hydrateFromLocalStorage();
      
      // Flush before unload
      window.addEventListener('beforeunload', () => {
        this.flush(true); // flush แบบทันที
      });
      
      // Flush when tab becomes hidden
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush(true); // flush แบบทันที
        }
      });
    }
  }
  
  /**
   * โหลดข้อมูลจาก localStorage เข้าสู่ memory cache
   */
  private hydrateFromLocalStorage(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !this.lockedKeys.has(key)) {
          const value = localStorage.getItem(key);
          if (value !== null) {
            try {
              // พยายามแปลงเป็น JSON ถ้าเป็นไปได้
              this.cache.set(key, JSON.parse(value));
            } catch {
              // ถ้าแปลงไม่ได้ ให้เก็บเป็น string ธรรมดา
              this.cache.set(key, value);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to hydrate from localStorage:', error);
    }
  }
  
  /**
   * ดึงข้อมูลจาก localStorage หรือ cache
   */
  getItem(key: string): string | null {
    try {
      // ถ้าเป็นคีย์ที่ล็อคไว้ ให้เข้าถึง localStorage โดยตรง
      if (this.lockedKeys.has(key)) {
        return localStorage.getItem(key);
      }
      
      // ตรวจสอบใน cache ก่อน
      if (this.cache.has(key)) {
        const value = this.cache.get(key);
        
        // แปลงกลับเป็น string ถ้าเป็น object
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        
        return String(value);
      }
      
      // ถ้าไม่มีใน cache ให้อ่านจาก localStorage
      const value = localStorage.getItem(key);
      
      // บันทึกลง cache ถ้ามีค่า
      if (value !== null) {
        try {
          // พยายามแปลงเป็น JSON ถ้าเป็นไปได้
          this.cache.set(key, JSON.parse(value));
        } catch {
          // ถ้าแปลงไม่ได้ ให้เก็บเป็น string ธรรมดา
          this.cache.set(key, value);
        }
      }
      
      return value;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }
  
  /**
   * ดึงข้อมูลที่เป็นออบเจกต์โดยแปลงจาก JSON อัตโนมัติ
   */
  getObject<T>(key: string): T | null {
    try {
      // ถ้าเป็นคีย์ที่ล็อคไว้ ให้เข้าถึง localStorage โดยตรง
      if (this.lockedKeys.has(key)) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }
      
      // ตรวจสอบใน cache ก่อน
      if (this.cache.has(key)) {
        return this.cache.get(key) as T;
      }
      
      // ถ้าไม่มีใน cache ให้อ่านจาก localStorage
      const value = localStorage.getItem(key);
      
      if (value !== null) {
        try {
          const parsedValue = JSON.parse(value) as T;
          this.cache.set(key, parsedValue);
          return parsedValue;
        } catch {
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting object ${key}:`, error);
      return null;
    }
  }
  
  /**
   * บันทึกข้อมูลลง cache และกำหนดให้บันทึกลง localStorage ในภายหลัง
   */
  setItem(key: string, value: string): void {
    try {
      // ถ้าเป็นคีย์ที่ล็อคไว้ ให้เข้าถึง localStorage โดยตรง
      if (this.lockedKeys.has(key)) {
        localStorage.setItem(key, value);
        return;
      }
      
      // พยายามแปลงเป็น JSON ถ้าเป็นไปได้
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }
      
      // บันทึกลง cache
      this.cache.set(key, parsedValue);
      
      // เพิ่มเข้าในรายการรอบันทึก
      this.dirtyKeys.add(key);
      this.syncStatus = 'pending';
      
      // ตั้งเวลาสำหรับการ flush
      this.scheduleFlush();
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      this.syncStatus = 'error';
    }
  }
  
  /**
   * บันทึกออบเจกต์โดยแปลงเป็น JSON อัตโนมัติ
   */
  setObject<T>(key: string, value: T): void {
    try {
      // ถ้าเป็นคีย์ที่ล็อคไว้ ให้เข้าถึง localStorage โดยตรง
      if (this.lockedKeys.has(key)) {
        localStorage.setItem(key, JSON.stringify(value));
        return;
      }
      
      // บันทึกลง cache
      this.cache.set(key, value);
      
      // เพิ่มเข้าในรายการรอบันทึก
      this.dirtyKeys.add(key);
      this.syncStatus = 'pending';
      
      // ตั้งเวลาสำหรับการ flush
      this.scheduleFlush();
    } catch (error) {
      console.error(`Error setting object ${key}:`, error);
      this.syncStatus = 'error';
    }
  }
  
  /**
   * ลบข้อมูลออกจาก cache และ localStorage
   */
  removeItem(key: string): void {
    try {
      // ลบออกจาก cache
      this.cache.delete(key);
      
      // ถ้าเป็นคีย์ที่ล็อคไว้ ให้เข้าถึง localStorage โดยตรง
      if (this.lockedKeys.has(key)) {
        localStorage.removeItem(key);
        return;
      }
      
      // ลบออกจาก localStorage (ทันที)
      localStorage.removeItem(key);
      
      // ลบออกจากรายการรอบันทึก (ถ้ามี)
      this.dirtyKeys.delete(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  }
  
  /**
   * ล้างข้อมูลทั้งหมดใน localStorage และ cache
   */
  clear(): void {
    try {
      // ล้าง cache
      this.cache.clear();
      
      // ล้าง dirtyKeys
      this.dirtyKeys.clear();
      
      // ล้าง localStorage
      localStorage.clear();
      
      this.syncStatus = 'synced';
    } catch (error) {
      console.error('Error clearing storage:', error);
      this.syncStatus = 'error';
    }
  }
  
  /**
   * บังคับให้บันทึกข้อมูลทั้งหมดที่รอการบันทึกลง localStorage ทันที
   */
  flush(immediate: boolean = false): void {
    // ยกเลิก timeout เดิมถ้ามี
    if (this.flushTimeoutId) {
      clearTimeout(this.flushTimeoutId);
      this.flushTimeoutId = null;
    }
    
    // ถ้าไม่มีข้อมูลที่รอบันทึก ให้ return เลย
    if (this.dirtyKeys.size === 0) {
      this.syncStatus = 'synced';
      return;
    }
    
    try {
      // บันทึกข้อมูลทั้งหมดที่รอการบันทึก
      for (const key of this.dirtyKeys) {
        const value = this.cache.get(key);
        
        // ข้ามคีย์ที่ล็อคไว้
        if (this.lockedKeys.has(key)) continue;
        
        if (value !== undefined) {
          if (typeof value === 'object' && value !== null) {
            localStorage.setItem(key, JSON.stringify(value));
          } else {
            localStorage.setItem(key, String(value));
          }
        }
      }
      
      // ล้างรายการรอบันทึก
      this.dirtyKeys.clear();
      this.syncStatus = 'synced';
    } catch (error) {
      console.error('Error flushing to localStorage:', error);
      this.syncStatus = 'error';
      
      // ถ้าเกิด error เช่น localStorage เต็ม ลองล้างข้อมูลเก่าบางส่วน
      this.handleStorageError();
    }
  }
  
  /**
   * ตั้งเวลาสำหรับการ flush
   */
  private scheduleFlush(): void {
    // ยกเลิก timeout เดิมถ้ามี
    if (this.flushTimeoutId) {
      clearTimeout(this.flushTimeoutId);
    }
    
    // ตั้งเวลาใหม่
    this.flushTimeoutId = setTimeout(() => {
      this.flush();
      this.flushTimeoutId = null;
    }, FLUSH_DELAY);
  }
  
  /**
   * จัดการกับข้อผิดพลาดเมื่อ localStorage เต็ม
   */
  private handleStorageError(): void {
    try {
      // ลองลบข้อมูลที่ไม่จำเป็นออกไปบางส่วน
      const keysToDelete = [];
      
      // หาคีย์ที่ไม่ได้อยู่ในรายการรอบันทึก
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !this.dirtyKeys.has(key) && !this.lockedKeys.has(key)) {
          keysToDelete.push(key);
        }
      }
      
      // ลบคีย์ที่ไม่จำเป็นไป 20% ของทั้งหมด
      const numToDelete = Math.ceil(keysToDelete.length * 0.2);
      for (let i = 0; i < numToDelete && i < keysToDelete.length; i++) {
        localStorage.removeItem(keysToDelete[i]);
        this.cache.delete(keysToDelete[i]);
      }
      
      // ลองบันทึกอีกครั้ง
      this.flush();
    } catch (error) {
      console.error('Failed to handle storage error:', error);
    }
  }
  
  /**
   * ดูสถานะปัจจุบันของการซิงค์
   */
  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }
  
  /**
   * ล็อคคีย์ไม่ให้ใช้ผ่าน cache (เข้าถึง localStorage โดยตรง)
   * ใช้สำหรับข้อมูลที่อาจมีการเปลี่ยนแปลงจากภายนอก
   */
  lockKey(key: string): void {
    this.lockedKeys.add(key);
    // ลบออกจาก cache เพื่อให้แน่ใจว่าจะอ่านจาก localStorage โดยตรง
    this.cache.delete(key);
  }
  
  /**
   * ปลดล็อคคีย์
   */
  unlockKey(key: string): void {
    this.lockedKeys.delete(key);
  }
}

// สร้าง single instance สำหรับใช้ทั่วทั้งแอพ
export const LocalStorageManager = typeof window !== 'undefined' 
  ? new LocalStorageManagerClass() 
  : null;

export default LocalStorageManager; 