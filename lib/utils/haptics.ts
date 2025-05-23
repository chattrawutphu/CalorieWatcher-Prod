/**
 * Haptic feedback utilities for native-like mobile interactions
 */

// Type definitions for haptic feedback
export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

// Interface สำหรับ Haptic API (Web Vibration API)
interface HapticAPI {
  vibrate?: (pattern: number | number[]) => boolean;
}

/**
 * ตรวจสอบว่า device รองรับ haptic feedback หรือไม่
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator && typeof navigator.vibrate === 'function';
}

/**
 * ตรวจสอบว่าเป็น iOS device หรือไม่ (สำหรับ Taptic Engine)
 */
export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * ตรวจสอบว่าเป็น Android device หรือไม่
 */
export function isAndroidDevice(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Haptic feedback patterns สำหรับ Android (vibration patterns)
 */
const HAPTIC_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10],
  warning: [15, 100, 15],
  error: [25, 100, 25, 100, 25],
  selection: [5]
} as const;

/**
 * เล่น haptic feedback
 * 
 * @param type - ประเภทของ haptic feedback
 * @param force - บังคับเล่นแม้ว่า user จะปิด haptic (default: false)
 */
export function hapticFeedback(type: HapticFeedbackType, force = false): void {
  // ตรวจสอบ user preferences (stored in localStorage)
  if (!force && !getHapticPreference()) {
    return;
  }

  // ลองใช้ iOS Taptic Engine ก่อน (ถ้าเป็น iOS)
  if (isIOSDevice() && tryIOSHaptic(type)) {
    return;
  }

  // ใช้ Web Vibration API สำหรับ Android และ devices อื่นๆ
  if (isHapticSupported()) {
    const pattern = HAPTIC_PATTERNS[type];
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
}

/**
 * ลอง iOS Taptic Engine (ผ่าน AudioContext trick)
 */
function tryIOSHaptic(type: HapticFeedbackType): boolean {
  try {
    // iOS Safari รองรับ AudioContext-based haptic feedback
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // สร้าง silent audio เพื่อ trigger haptic
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // ตั้งค่า frequency และ gain ตาม type
    oscillator.frequency.value = getIOSFrequency(type);
    gainNode.gain.value = 0; // Silent
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.01);
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * แปลง haptic type เป็น frequency สำหรับ iOS
 */
function getIOSFrequency(type: HapticFeedbackType): number {
  switch (type) {
    case 'light':
    case 'selection':
      return 1000;
    case 'medium':
      return 750;
    case 'heavy':
    case 'error':
      return 500;
    case 'success':
      return 1200;
    case 'warning':
      return 800;
    default:
      return 1000;
  }
}

/**
 * อ่าน user preference สำหรับ haptic feedback
 */
export function getHapticPreference(): boolean {
  try {
    const preference = localStorage.getItem('haptic-feedback-enabled');
    return preference === null ? true : preference === 'true'; // Enable by default
  } catch (error) {
    return true; // Default to enabled
  }
}

/**
 * ตั้งค่า user preference สำหรับ haptic feedback
 */
export function setHapticPreference(enabled: boolean): void {
  try {
    localStorage.setItem('haptic-feedback-enabled', enabled.toString());
  } catch (error) {
    console.warn('Failed to save haptic preference:', error);
  }
}

/**
 * Haptic feedback hooks สำหรับ React components
 */
export const useHapticFeedback = () => {
  return {
    light: (force?: boolean) => hapticFeedback('light', force),
    medium: (force?: boolean) => hapticFeedback('medium', force),
    heavy: (force?: boolean) => hapticFeedback('heavy', force),
    success: (force?: boolean) => hapticFeedback('success', force),
    warning: (force?: boolean) => hapticFeedback('warning', force),
    error: (force?: boolean) => hapticFeedback('error', force),
    selection: (force?: boolean) => hapticFeedback('selection', force),
    isSupported: isHapticSupported(),
    isEnabled: getHapticPreference(),
    setEnabled: setHapticPreference
  };
};

/**
 * Utility functions สำหรับ native-like interactions
 */

/**
 * เพิ่ม touch feedback ให้กับ element
 */
export function addTouchFeedback(element: HTMLElement, type: HapticFeedbackType = 'light'): () => void {
  const handleTouchStart = () => {
    hapticFeedback(type);
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  
  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
  };
}

/**
 * สร้าง native-like button press effect
 */
export function createNativeButtonEffect(element: HTMLElement): () => void {
  const handleTouchStart = () => {
    hapticFeedback('light');
    element.style.transform = 'scale(0.97)';
    element.style.transition = 'transform 0.1s ease-out';
  };

  const handleTouchEnd = () => {
    element.style.transform = '';
    element.style.transition = 'transform 0.2s ease-out';
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });
  element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
    element.removeEventListener('touchcancel', handleTouchEnd);
  };
}

/**
 * ป้องกัน double-tap zoom บน iOS
 */
export function preventDoubleTabZoom(element: HTMLElement): () => void {
  let lastTouchEnd = 0;

  const handleTouchEnd = (event: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  };

  element.addEventListener('touchend', handleTouchEnd, { passive: false });

  return () => {
    element.removeEventListener('touchend', handleTouchEnd);
  };
}

/**
 * React hook สำหรับ native-like interactions
 */
export function useNativeInteractions() {
  return {
    addTouchFeedback,
    createNativeButtonEffect,
    preventDoubleTabZoom,
    haptic: useHapticFeedback()
  };
} 