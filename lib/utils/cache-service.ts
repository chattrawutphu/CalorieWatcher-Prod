// Cache Service
// บริการแคชเพื่อจัดเก็บข้อมูลที่ใช้บ่อยและลดการเรียก API

import { USDAFoodItem } from '@/lib/api/usda-api';

interface CacheOptions {
  expirationTime: number; // เวลาหมดอายุในมิลลิวินาที
}

interface CacheItem<T> {
  data: T;
  timestamp: number; // เวลาที่เก็บข้อมูล
  expiration: number; // เวลาหมดอายุ
}

// เวลาหมดอายุเริ่มต้น - 1 ชั่วโมง
const DEFAULT_EXPIRATION_TIME = 60 * 60 * 1000;

// ชื่อแคชสำหรับเก็บใน localStorage
const CACHE_KEYS = {
  FOOD_SEARCH: 'food_search_cache',
  FOOD_CATEGORIES: 'food_categories_cache',
  FOOD_DETAILS: 'food_details_cache',
};

class CacheService {
  private getCache<T>(cacheKey: string): Record<string, CacheItem<T>> {
    try {
      const cache = localStorage.getItem(cacheKey);
      return cache ? JSON.parse(cache) : {};
    } catch (error) {
      console.error(`Error getting cache for ${cacheKey}:`, error);
      return {};
    }
  }

  private setCache<T>(cacheKey: string, cache: Record<string, CacheItem<T>>): void {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.error(`Error setting cache for ${cacheKey}:`, error);
      // ถ้า localStorage เต็ม ให้ล้างแคชที่หมดอายุ
      this.clearExpiredCache();
    }
  }

  // ล้างแคชที่หมดอายุทั้งหมด
  clearExpiredCache(): void {
    Object.values(CACHE_KEYS).forEach(cacheKey => {
      const cache = this.getCache(cacheKey);
      const now = Date.now();
      let hasExpired = false;

      Object.keys(cache).forEach(key => {
        if (cache[key].expiration < now) {
          delete cache[key];
          hasExpired = true;
        }
      });

      if (hasExpired) {
        this.setCache(cacheKey, cache);
      }
    });
  }

  // แคชผลการค้นหาอาหาร
  cacheFoodSearch(query: string, pageNumber: number, foods: USDAFoodItem[], options?: Partial<CacheOptions>): void {
    const cacheKey = CACHE_KEYS.FOOD_SEARCH;
    const cache = this.getCache<USDAFoodItem[]>(cacheKey);
    const searchKey = `${query.toLowerCase()}_${pageNumber}`;
    
    const now = Date.now();
    const expirationTime = options?.expirationTime || DEFAULT_EXPIRATION_TIME;
    
    cache[searchKey] = {
      data: foods,
      timestamp: now,
      expiration: now + expirationTime,
    };
    
    this.setCache(cacheKey, cache);
  }

  // ดึงผลการค้นหาอาหารจากแคช
  getCachedFoodSearch(query: string, pageNumber: number): USDAFoodItem[] | null {
    const cacheKey = CACHE_KEYS.FOOD_SEARCH;
    const cache = this.getCache<USDAFoodItem[]>(cacheKey);
    const searchKey = `${query.toLowerCase()}_${pageNumber}`;
    
    const cachedItem = cache[searchKey];
    
    if (!cachedItem) {
      return null;
    }
    
    // ตรวจสอบว่าหมดอายุหรือไม่
    if (cachedItem.expiration < Date.now()) {
      delete cache[searchKey];
      this.setCache(cacheKey, cache);
      return null;
    }
    
    return cachedItem.data;
  }

  // แคชผลการค้นหาอาหารตามหมวดหมู่
  cacheFoodCategory(category: string, pageNumber: number, foods: USDAFoodItem[], options?: Partial<CacheOptions>): void {
    const cacheKey = CACHE_KEYS.FOOD_CATEGORIES;
    const cache = this.getCache<USDAFoodItem[]>(cacheKey);
    const categoryKey = `${category.toLowerCase()}_${pageNumber}`;
    
    const now = Date.now();
    const expirationTime = options?.expirationTime || DEFAULT_EXPIRATION_TIME;
    
    cache[categoryKey] = {
      data: foods,
      timestamp: now,
      expiration: now + expirationTime,
    };
    
    this.setCache(cacheKey, cache);
  }

  // ดึงผลการค้นหาอาหารตามหมวดหมู่จากแคช
  getCachedFoodCategory(category: string, pageNumber: number): USDAFoodItem[] | null {
    const cacheKey = CACHE_KEYS.FOOD_CATEGORIES;
    const cache = this.getCache<USDAFoodItem[]>(cacheKey);
    const categoryKey = `${category.toLowerCase()}_${pageNumber}`;
    
    const cachedItem = cache[categoryKey];
    
    if (!cachedItem) {
      return null;
    }
    
    // ตรวจสอบว่าหมดอายุหรือไม่
    if (cachedItem.expiration < Date.now()) {
      delete cache[categoryKey];
      this.setCache(cacheKey, cache);
      return null;
    }
    
    return cachedItem.data;
  }

  // แคชข้อมูลอาหารโดยละเอียด
  cacheFoodDetails(fdcId: number, foodDetails: USDAFoodItem, options?: Partial<CacheOptions>): void {
    const cacheKey = CACHE_KEYS.FOOD_DETAILS;
    const cache = this.getCache<USDAFoodItem>(cacheKey);
    const detailKey = fdcId.toString();
    
    const now = Date.now();
    // ข้อมูลละเอียดเก็บได้นานกว่า - 1 วัน
    const expirationTime = options?.expirationTime || (24 * 60 * 60 * 1000);
    
    cache[detailKey] = {
      data: foodDetails,
      timestamp: now,
      expiration: now + expirationTime,
    };
    
    this.setCache(cacheKey, cache);
  }

  // ดึงข้อมูลอาหารโดยละเอียดจากแคช
  getCachedFoodDetails(fdcId: number): USDAFoodItem | null {
    const cacheKey = CACHE_KEYS.FOOD_DETAILS;
    const cache = this.getCache<USDAFoodItem>(cacheKey);
    const detailKey = fdcId.toString();
    
    const cachedItem = cache[detailKey];
    
    if (!cachedItem) {
      return null;
    }
    
    // ตรวจสอบว่าหมดอายุหรือไม่
    if (cachedItem.expiration < Date.now()) {
      delete cache[detailKey];
      this.setCache(cacheKey, cache);
      return null;
    }
    
    return cachedItem.data;
  }

  // ล้างแคชทั้งหมด
  clearAllCache(): void {
    Object.values(CACHE_KEYS).forEach(cacheKey => {
      localStorage.removeItem(cacheKey);
    });
  }
}

// สร้าง singleton instance
export const cacheService = new CacheService(); 