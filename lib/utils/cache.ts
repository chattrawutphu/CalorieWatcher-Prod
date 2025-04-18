// cache.ts - Cache utility functions for client-side caching
// แนะนำให้ใช้ในฝั่ง client เท่านั้น (ใช้ในไฟล์ที่มี "use client" เท่านั้น)

// กำหนดชื่อ cache key
const CACHE_KEYS = {
  PROFILE_IMAGE: 'profile_image',
  PROFILE_DATA: 'profile_data',
  POSTS: 'cached_posts',
  POST_IMAGES: 'post_images'
};

// กำหนดช่วงเวลาที่ cache จะหมดอายุ (ms)
const CACHE_EXPIRY = {
  PROFILE: 24 * 60 * 60 * 1000, // 24 ชั่วโมง
  POSTS: 5 * 60 * 1000 // 5 นาที
};

// ตรวจสอบว่ากำลังทำงานในฝั่ง client หรือไม่
export const isClient = typeof window !== 'undefined';

// ฟังก์ชันสำหรับบันทึกข้อมูลลงใน localStorage พร้อมเวลาหมดอายุ
export function saveToCache(key: string, data: any, expiryTime: number = CACHE_EXPIRY.POSTS) {
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

// ฟังก์ชันสำหรับบันทึกข้อมูลโพสต์
export function savePostsToCache(posts: any[]) {
  saveToCache(CACHE_KEYS.POSTS, posts);
}

// ฟังก์ชันสำหรับดึงข้อมูลโพสต์
export function getCachedPosts() {
  return getFromCache<any[]>(CACHE_KEYS.POSTS) || [];
}

// ฟังก์ชันสำหรับบันทึกข้อมูลรูปภาพโพสต์ (จัดเก็บเป็น Map: imageUrl -> base64)
export function savePostImageToCache(imageUrl: string, base64Data: string) {
  if (!isClient) return;
  
  try {
    const cacheKey = `${CACHE_KEYS.POST_IMAGES}_${imageUrl}`;
    saveToCache(cacheKey, base64Data, CACHE_EXPIRY.PROFILE);
  } catch (error) {
    console.warn('Failed to save post image to cache:', error);
  }
}

// ฟังก์ชันสำหรับดึงข้อมูลรูปภาพโพสต์
export function getCachedPostImage(imageUrl: string) {
  if (!isClient) return null;
  
  try {
    const cacheKey = `${CACHE_KEYS.POST_IMAGES}_${imageUrl}`;
    return getFromCache<string>(cacheKey);
  } catch (error) {
    console.warn('Failed to get post image from cache:', error);
    return null;
  }
}

// ฟังก์ชันสำหรับบันทึกข้อมูลโปรไฟล์
export function saveProfileDataToCache(profileData: any) {
  saveToCache(CACHE_KEYS.PROFILE_DATA, profileData, CACHE_EXPIRY.PROFILE);
}

// ฟังก์ชันสำหรับดึงข้อมูลโปรไฟล์
export function getCachedProfileData() {
  return getFromCache<any>(CACHE_KEYS.PROFILE_DATA);
}

// ฟังก์ชันสำหรับบันทึกข้อมูลรูปภาพโปรไฟล์
export function saveProfileImageToCache(imageUrl: string, base64Data: string) {
  if (!isClient) return;
  
  try {
    saveToCache(CACHE_KEYS.PROFILE_IMAGE, { url: imageUrl, data: base64Data }, CACHE_EXPIRY.PROFILE);
  } catch (error) {
    console.warn('Failed to save profile image to cache:', error);
  }
}

// ฟังก์ชันสำหรับดึงข้อมูลรูปภาพโปรไฟล์
export function getCachedProfileImage() {
  return getFromCache<{url: string, data: string}>(CACHE_KEYS.PROFILE_IMAGE);
}

export default {
  CACHE_KEYS,
  saveToCache,
  getFromCache,
  savePostsToCache,
  getCachedPosts,
  savePostImageToCache,
  getCachedPostImage,
  saveProfileDataToCache,
  getCachedProfileData,
  saveProfileImageToCache,
  getCachedProfileImage
}; 