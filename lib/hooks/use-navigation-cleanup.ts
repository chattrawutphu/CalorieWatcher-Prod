import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Type สำหรับฟังก์ชันปิด popup
export type CleanupFunction = () => void;

// Global registry สำหรับเก็บฟังก์ชันปิด popup ทั้งหมด
class NavigationCleanupRegistry {
  private cleanupFunctions = new Set<CleanupFunction>();
  
  register(cleanup: CleanupFunction): () => void {
    this.cleanupFunctions.add(cleanup);
    
    // Return unregister function
    return () => {
      this.cleanupFunctions.delete(cleanup);
    };
  }
  
  executeAll(): void {
    this.cleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Navigation cleanup error:', error);
      }
    });
  }
  
  clear(): void {
    this.cleanupFunctions.clear();
  }
  
  get size(): number {
    return this.cleanupFunctions.size;
  }
}

export const navigationCleanupRegistry = new NavigationCleanupRegistry();

/**
 * Hook สำหรับจัดการการปิด popup/modal/bottom sheet อัตโนมัติเมื่อเปลี่ยนหน้า
 * 
 * @param isOpen - สถานะการเปิด/ปิดของ popup
 * @param onClose - ฟังก์ชันปิด popup
 * @param options - ตัวเลือกเพิ่มเติม
 */
export function useNavigationCleanup(
  isOpen: boolean,
  onClose: () => void,
  options: {
    // ปิดเมื่อเปลี่ยนหน้าหรือไม่ (default: true)
    closeOnNavigation?: boolean;
    // หน่วงเวลาก่อนปิด (ms)
    delay?: number;
    // เงื่อนไขเพิ่มเติมในการปิด
    shouldClose?: () => boolean;
  } = {}
) {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const {
    closeOnNavigation = true,
    delay = 0,
    shouldClose = () => true
  } = options;

  useEffect(() => {
    // ตรวจสอบการเปลี่ยนหน้า
    if (previousPathnameRef.current !== pathname) {
      const hasNavigated = true;
      previousPathnameRef.current = pathname;
      
      // ปิด popup เมื่อเปลี่ยนหน้า (ถ้าเปิดอยู่)
      if (hasNavigated && isOpen && closeOnNavigation && shouldClose()) {
        if (delay > 0) {
          timeoutRef.current = setTimeout(() => {
            onClose();
          }, delay);
        } else {
          onClose();
        }
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, isOpen, onClose, closeOnNavigation, delay, shouldClose]);

  // ลงทะเบียนฟังก์ชันปิดกับ global registry
  useEffect(() => {
    if (isOpen && closeOnNavigation) {
      const unregister = navigationCleanupRegistry.register(() => {
        if (shouldClose()) {
          onClose();
        }
      });
      
      return unregister;
    }
  }, [isOpen, onClose, closeOnNavigation, shouldClose]);
}

/**
 * Hook สำหรับปิด popup ทั้งหมดด้วยตนเอง
 */
export function useCloseAllPopups() {
  return {
    closeAll: () => navigationCleanupRegistry.executeAll(),
    hasActivePopups: () => navigationCleanupRegistry.size > 0
  };
} 