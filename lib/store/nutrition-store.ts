import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { nutritionStoreTranslations } from '@/lib/translations/nutrition-store';
import { useLanguage } from '@/components/providers/language-provider';

// Add type definition for translations
type TranslationSection = {
  [key: string]: string;
};

type TranslationType = {
  [key: string]: TranslationSection;
};

// Global language accessor
let currentLocale = 'en';
try {
  // Try to get language from localStorage first
  if (typeof window !== 'undefined') {
    currentLocale = localStorage.getItem('language') || 'en';
  }
} catch (error) {
  console.error('Failed to access localStorage for language setting:', error);
}

// Helper function to update locale whenever it changes
export const updateStoreLocale = (locale: string) => {
  currentLocale = locale;
  // บันทึกค่า locale ลงใน localStorage ด้วย
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-locale', locale);
    }
  } catch (error) {
    console.error('Failed to update locale in localStorage:', error);
  }
};

// Get translations based on current locale
const getT = () => {
  return nutritionStoreTranslations[currentLocale as keyof typeof nutritionStoreTranslations] || nutritionStoreTranslations.en;
};

// Format string with placeholders
const formatString = (str: string, params: Record<string, string | number>) => {
  return str.replace(/\{(\w+)\}/g, (_, key) => params[key]?.toString() || '');
};

// Helper function to show toast notifications
const showToast = (
  titleKey: string, 
  descriptionKey?: string, 
  params: Record<string, string | number> = {},
  variant: 'default' | 'destructive' = 'default'
) => {
  const t = getT() as TranslationType;
  
  // Navigate the nested structure to find the translation
  const [section, key] = titleKey.split('.');
  if (!section || !key || !t[section] || !t[section][key]) {
    console.error(`Translation key not found: ${titleKey}`);
    return toast({ title: titleKey, variant, duration: 3000 });
  }
  
  const title = formatString(t[section][key], params);
  
  let description;
  if (descriptionKey) {
    const [descSection, descKey] = descriptionKey.split('.');
    if (descSection && descKey && t[descSection] && t[descSection][descKey]) {
      description = formatString(t[descSection][descKey], params);
    }
  }
  
  toast({
    title,
    description,
    variant,
    duration: 3000,
  });
};

// Food template เป็นต้นแบบสำหรับสร้างอาหาร (เดิมคือ FoodItem)
export interface FoodTemplate {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servingSize: string;
  favorite: boolean;
  createdAt: Date;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other';
  // USDA API related fields
  usdaId?: number;
  brandName?: string;
  ingredients?: string;
  dataType?: string;
  // New field for meal categorization
  mealCategory?: string;
  // Indicate that this is a template
  isTemplate: boolean;
}

// Instance of food that is created from template or other sources
// This is what gets recorded in meal entries
export interface MealFoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servingSize: string;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other';
  // Optional fields
  usdaId?: number;
  brandName?: string;
  ingredients?: string;
  // Reference to the template it was created from (if any)
  templateId?: string;
  // When this food item was created
  recordedAt: Date;
}

// FoodItem type for backward compatibility and union type
export type FoodItem = FoodTemplate | MealFoodItem;

// Helper function to determine if a FoodItem is a template
export function isTemplate(food: FoodItem): food is FoodTemplate {
  return 'isTemplate' in food && food.isTemplate === true;
}

// Helper function to determine if a FoodItem is a meal food item
export function isMealFoodItem(food: FoodItem): food is MealFoodItem {
  return 'recordedAt' in food && !('isTemplate' in food);
}

export interface MealEntry {
  id: string;
  foodItem: MealFoodItem; // Now explicitly uses MealFoodItem
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  weight?: number; // Target weight in kg
}

export interface DailyLog {
  date: string;
  meals: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  moodRating?: number; // 1-5 rating (1:worst, 5:best)
  notes?: string;
  waterIntake: number; // มิลลิลิตร (ml)
  weight?: number; // Weight in kg
  lastModified: string;
}

export interface WeightEntry {
  date: string;
  weight: number; // Weight in kg
  note?: string; // Optional note about the weight entry
}

export interface WaterEntry {
  amount: number; // มิลลิลิตร (ml)
  timestamp: string;
}

interface NutritionState {
  // User settings
  goals: NutritionGoals;
  foodTemplates: FoodTemplate[]; // Renamed from favoriteFoods to foodTemplates
  dailyLogs: Record<string, DailyLog>; // indexed by date string
  weightHistory: WeightEntry[]; // Array of weight entries
  
  // Current day tracking
  currentDate: string; // ISO string for the currently selected date
  
  // Syncing state
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  lastSyncTime: string | null; // เพิ่ม timestamp ล่าสุดที่ซิงค์
  
  // Actions
  initializeData: () => Promise<void>;
  syncData: () => Promise<void>;
  // เพิ่มฟังก์ชันตรวจสอบว่าสามารถซิงค์ได้หรือไม่
  canSync: () => boolean;
  isSyncOnCooldown: () => boolean;
  
  // Data management
  clearTodayData: () => void; // เพิ่มฟังก์ชันล้างข้อมูลล่าสุดของวันนี้
  
  // Template management
  addFoodTemplate: (template: FoodTemplate) => Promise<void>;
  updateFoodTemplate: (templateId: string, updates: Partial<FoodTemplate>) => Promise<void>;
  removeFoodTemplate: (templateId: string) => Promise<void>;
  
  // Meal management
  createMealItemFromTemplate: (templateId: string, overrides?: Partial<MealFoodItem>) => MealFoodItem | null;
  createMealFoodFromScratch: (foodData: Omit<MealFoodItem, 'id' | 'recordedAt'>) => MealFoodItem;
  addMeal: (meal: MealEntry) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  updateMealEntry: (entryId: string, updates: Partial<MealEntry>) => Promise<void>;
  
  // Legacy methods for backward compatibility
  addFavoriteFood: (food: FoodItem) => Promise<void>;
  removeFavoriteFood: (foodId: string) => Promise<void>;
  
  // Other methods
  setCurrentDate: (date: string) => void;
  updateGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  updateDailyMood: (date: string, moodRating: number, notes?: string) => Promise<void>;
  getMood: (date: string) => { moodRating?: number, notes?: string } | null;
  getDailyMood: () => { moodRating?: number, notes?: string } | null;
  addWaterIntake: (date: string, amount: number) => Promise<void>;
  resetWaterIntake: (date: string) => Promise<void>;
  getWaterIntake: (date: string) => number;
  getWaterGoal: () => number;
  
  // Weight tracking methods
  addWeightEntry: (entry: WeightEntry) => Promise<void>;
  updateWeightEntry: (date: string, weight: number, note?: string) => Promise<void>;
  getWeightEntry: (date: string) => WeightEntry | undefined;
  getWeightEntries: (limit?: number) => WeightEntry[];
  getWeightGoal: () => number | undefined;
  
  // ฟังก์ชันสำหรับรวมข้อมูลจาก server และ local
  mergeData: (localData: any, serverData: any) => any;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      // Default state
      goals: {
        calories: 2000,
        protein: 100,
        carbs: 250,
        fat: 70,
        water: 2000,
        weight: 70 // Default target weight
      },
      foodTemplates: [], // เปลี่ยนชื่อจาก favoriteFoods เป็น foodTemplates
      dailyLogs: {},
      weightHistory: [],
      currentDate: new Date().toISOString().split('T')[0],
      isLoading: false,
      isInitialized: false,
      error: null,
      lastSyncTime: null, // เพิ่ม timestamp ล่าสุดที่ซิงค์
      
      // Initialize data
      initializeData: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // ตรวจสอบการ migration จาก favoriteFoods เป็น foodTemplates (ถ้าจำเป็น)
          set((state) => {
            // If this is a fresh install or we already migrated, do nothing
            if (state.foodTemplates.length > 0 || !('favoriteFoods' in state)) {
              return state;
            }
            
            // Migration needed - convert old favoriteFood to templates
            const oldFavoriteFoods = (state as any).favoriteFoods || [];
            const foodTemplates = oldFavoriteFoods.map((food: any) => ({
              ...food,
              isTemplate: true,
            }));
            
            return {
              ...state,
              foodTemplates,
            };
          });
          
          set({ isInitialized: true, isLoading: false });
        } catch (error) {
          console.error('Failed to initialize nutrition data', error);
          set({ error: 'Failed to initialize data', isLoading: false });
        }
      },
      
      // เพิ่มฟังก์ชันตรวจสอบว่าสามารถซิงค์ได้หรือไม่
      canSync: () => {
        const { isLoading, lastSyncTime } = get();
        
        // ถ้ากำลังโหลดข้อมูลอยู่ ไม่อนุญาตให้ซิงค์อีก
        if (isLoading) return false;
        
        // ตรวจสอบประวัติการซิงค์ใน localStorage
        try {
          // ดึงประวัติการซิงค์
          const syncHistoryJSON = localStorage.getItem('sync-history');
          const syncHistory = syncHistoryJSON ? JSON.parse(syncHistoryJSON) : [];
          
          // กรองรายการซิงค์ในช่วง 3 นาทีที่ผ่านมา
          const threeMinutesAgo = Date.now() - (3 * 60 * 1000);
          const recentSyncs = syncHistory.filter((timestamp: number) => timestamp > threeMinutesAgo);
          
          // ถ้ามีการซิงค์มากกว่า 5 ครั้งใน 3 นาที ไม่อนุญาตให้ซิงค์
          if (recentSyncs.length >= 5) {
            // คำนวณเวลาที่ต้องรอ - หาเวลาซิงค์แรกสุดในช่วง 3 นาทีล่าสุด
            if (recentSyncs.length > 0) {
              const oldestSync = Math.min(...recentSyncs);
              const timeToWait = (oldestSync + (3 * 60 * 1000)) - Date.now();
              
              // บันทึกเวลารอไว้ใน localStorage เพื่อใช้แสดงให้ผู้ใช้
              localStorage.setItem('sync-cooldown-until', String(Date.now() + timeToWait));
            }
            return false;
          }
        } catch (error) {
          console.error('Error checking sync history:', error);
        }
        
        // ถ้าไม่เคยซิงค์มาก่อน หรือไม่มี lastSyncTime อนุญาตให้ซิงค์ได้ทันที
        if (!lastSyncTime) return true;
        
        // ตรวจสอบช่วงเวลา cooldown (5 วินาที)
        const lastSync = new Date(lastSyncTime).getTime();
        const now = Date.now();
        const cooldownPeriod = 5000; // 5 วินาที
        
        return (now - lastSync) > cooldownPeriod;
      },
      
      // เพิ่มฟังก์ชันตรวจสอบว่าอยู่ในช่วง cooldown หรือไม่
      isSyncOnCooldown: () => {
        const { lastSyncTime } = get();
        
        // ตรวจสอบประวัติการซิงค์ใน localStorage
        try {
          // ดึงประวัติการซิงค์
          const syncHistoryJSON = localStorage.getItem('sync-history');
          const syncHistory = syncHistoryJSON ? JSON.parse(syncHistoryJSON) : [];
          
          // กรองรายการซิงค์ในช่วง 3 นาทีที่ผ่านมา
          const threeMinutesAgo = Date.now() - (3 * 60 * 1000);
          const recentSyncs = syncHistory.filter((timestamp: number) => timestamp > threeMinutesAgo);
          
          // ถ้ามีการซิงค์มากกว่า 5 ครั้งใน 3 นาที ถือว่าอยู่ในช่วง cooldown
          if (recentSyncs.length >= 5) {
            // คำนวณเวลาที่ต้องรอ - หาเวลาซิงค์แรกสุดในช่วง 3 นาทีล่าสุด
            if (recentSyncs.length > 0) {
              const oldestSync = Math.min(...recentSyncs);
              const timeToWait = (oldestSync + (3 * 60 * 1000)) - Date.now();
              
              // บันทึกเวลารอไว้ใน localStorage เพื่อแสดงให้ผู้ใช้
              localStorage.setItem('sync-cooldown-until', String(Date.now() + timeToWait));
              return true;
            }
          } else {
            // ลบเวลารอถ้าไม่ได้อยู่ในช่วง cooldown
            localStorage.removeItem('sync-cooldown-until');
          }
        } catch (error) {
          console.error('Error checking sync history:', error);
        }
        
        // ถ้าไม่เคยซิงค์มาก่อน หรือไม่มี lastSyncTime แสดงว่าไม่อยู่ใน cooldown
        if (!lastSyncTime) return false;
        
        // ตรวจสอบช่วงเวลา cooldown (5 วินาที)
        const lastSync = new Date(lastSyncTime).getTime();
        const now = Date.now();
        const cooldownPeriod = 5000; // 5 วินาที
        
        return (now - lastSync) <= cooldownPeriod;
      },
      
      // Sync data with server (if needed)
      syncData: async () => {
        // ตรวจสอบว่าสามารถซิงค์ได้หรือไม่
        if (!get().canSync()) {
          console.log('[Sync] Sync operation is currently on cooldown or in progress');
          
          // ตรวจสอบถ้าอยู่ในช่วง cooldown จากการซิงค์มากเกินไป
          try {
            const cooldownUntil = localStorage.getItem('sync-cooldown-until');
            if (cooldownUntil) {
              const endTime = parseInt(cooldownUntil, 10);
              const now = Date.now();
              if (endTime > now) {
                // ยังอยู่ในช่วง cooldown
                const remainingMs = endTime - now;
                const remainingMinutes = Math.ceil(remainingMs / 60000);
                
                // ใช้โค้ด showToast เพื่อแสดงข้อความเตือน โดยใช้ locale จาก TranslationContext
                const locale = localStorage.getItem('app-locale') || 'en';
                
                // เตรียมข้อความตามภาษาที่ใช้
                const title = locale === 'en' ? 'Syncing too frequently' : 
                       locale === 'th' ? 'รีเฟรชข้อมูลบ่อยเกินไป' : 
                       locale === 'ja' ? '同期が頻繁すぎます' : '同步频率过高';
                       
                const description = locale === 'en' ? `You're syncing too frequently. Please wait about ${remainingMinutes} minutes.` : 
                            locale === 'th' ? `คุณรีเฟรชข้อมูลบ่อยเกินไป โปรดรอประมาณ ${remainingMinutes} นาที` : 
                            locale === 'ja' ? `同期が頻繁すぎます。約${remainingMinutes}分お待ちください。` : 
                            `同步频率过高，请等待约${remainingMinutes}分钟。`;
                
                // แสดง Toast แจ้งเตือน
                showToast(
                  'sync.tooFrequent',
                  'sync.tooFrequentDesc',
                  { minutes: String(remainingMinutes) },
                  'destructive'
                );
              }
            }
          } catch (error) {
            console.error('Error checking sync cooldown:', error);
          }
          
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // บันทึกเวลาเริ่มต้นซิงค์
          const syncStartTime = new Date().toISOString();
          set({ lastSyncTime: syncStartTime });
          
          // บันทึกประวัติการซิงค์
          try {
            const syncHistoryJSON = localStorage.getItem('sync-history');
            const syncHistory = syncHistoryJSON ? JSON.parse(syncHistoryJSON) : [];
            syncHistory.push(Date.now());
            
            // เก็บประวัติแค่ 30 รายการล่าสุด
            if (syncHistory.length > 30) {
              syncHistory.splice(0, syncHistory.length - 30);
            }
            
            localStorage.setItem('sync-history', JSON.stringify(syncHistory));
          } catch (error) {
            console.error('Error updating sync history:', error);
          }
          
          // เช็คการเชื่อมต่ออินเตอร์เน็ตและแสดงข้อความเตือนที่ชัดเจน
          if (!navigator.onLine) {
            console.warn('[Sync] No internet connection, skipping sync');
            set({ isLoading: false, error: 'No internet connection' });
            
            // แสดง Toast แจ้งเตือนว่าไม่มีการเชื่อมต่ออินเทอร์เน็ต
            showToast(
              'sync.noInternet',
              'sync.noInternetDesc',
              {},
              'destructive'
            );
            
            return;
          }
          
          // เก็บเวลาเริ่มต้น
          const startTime = performance.now();
          console.log(`[Sync] Starting data synchronization at ${new Date().toISOString()}`);
          
          // 1. ดึงข้อมูลจาก localStorage
          const localData = get();
          
          // 2. ดึงข้อมูลจาก server - กำหนดค่า timeout ที่เหมาะสม
          const fetchStartTime = performance.now();
          console.log(`[Sync] Starting database fetch at ${new Date().toISOString()}`);
          
          const fetchController = new AbortController();
          const timeoutId = setTimeout(() => fetchController.abort(), 10000);
          
          try {
            // ตรวจสอบหรือรีเฟรช session ก่อนเรียกใช้ API
            // ใช้ credentials: 'include' เพื่อส่ง cookies ไปด้วย
            const response = await fetch('/api/nutrition', {
              credentials: 'include', // ส่ง cookies ไปด้วย
              headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json'
              },
              signal: fetchController.signal
            });
            
            const fetchEndTime = performance.now();
            const fetchDuration = (fetchEndTime - fetchStartTime).toFixed(2);
            console.log(`[Sync] Database fetch completed in ${fetchDuration}ms`);
            
            // จัดการกรณี session timeout หรือ authentication error
            if (response.status === 401) {
              console.error('[Sync] Authentication error: Session may be expired');
              window.dispatchEvent(new CustomEvent('auth-error', { detail: { code: 401 }}));
              set({ isLoading: false, error: 'Authentication error: Please log in again' });
              
              // แสดง Toast แจ้งเตือนว่าต้องล็อกอินใหม่
              showToast(
                'sync.authError',
                'sync.authErrorDesc',
                {},
                'destructive'
              );
              
              return;
            }
            
            if (!response.ok) {
              console.error(`[Sync] Server returned error: ${response.status} ${response.statusText}`);
              
              // แสดง Toast แจ้งเตือนว่าเกิดข้อผิดพลาดในการซิงค์
              showToast(
                'sync.syncFailed',
                'sync.syncFailedDesc',
                {},
                'destructive'
              );
              
              throw new Error(`Failed to fetch server data: ${response.status}`);
            }
            
            const result = await response.json();
            
            // ตรวจสอบว่าข้อมูลมี data หรือไม่
            if (!result.success) {
              showToast(
                'sync.syncFailed',
                'sync.syncFailedDesc',
                {},
                'destructive'
              );
              
              throw new Error(result.message || 'Unknown server error');
            }
            
            // ถ้าไม่มีการอัพเดต ให้หยุดทำงาน
            if (result.hasUpdates === false) {
              console.log('[Sync] No updates needed, server data is up to date');
              localStorage.setItem('last-server-sync-time', result.lastSync);
              set({ isLoading: false });
              return;
            }
            
            const { data: serverData } = result;
            
            // 3. เช็คว่ามีข้อมูลใหม่หรือไม่ โดยเปรียบเทียบ timestamp
            const lastServerSync = localStorage.getItem('last-server-sync-time');
            const lastLocalUpdate = localStorage.getItem('last-local-update-time');
            
            console.log(`[Sync] Last server sync: ${lastServerSync || 'never'}`);
            console.log(`[Sync] Last local update: ${lastLocalUpdate || 'never'}`);
            
            // 4. ตัดสินใจว่าจะใช้ข้อมูลจากที่ไหน
            let finalData = { ...localData };
            let needsServerUpdate = false;
            let needsLocalUpdate = false;
            
            // ถ้าไม่เคยซิงค์กับ server มาก่อน หรือข้อมูลใน localStorage มีการอัพเดทล่าสุด
            if (!lastServerSync || (lastLocalUpdate && new Date(lastLocalUpdate) > new Date(lastServerSync))) {
              console.log('[Sync] Local data is newer, updating server');
              needsServerUpdate = true;
            } 
            // ถ้า server มีข้อมูลใหม่กว่า
            else if (serverData.updatedAt && (!lastLocalUpdate || new Date(serverData.updatedAt) > new Date(lastLocalUpdate))) {
              console.log('[Sync] Server data is newer, updating local data');
              needsLocalUpdate = true;
              
              // อัพเดทข้อมูลท้องถิ่นด้วยข้อมูลจาก server
              finalData = get().mergeData(localData, serverData);
            }
            
            // 5. อัพเดทข้อมูลที่จำเป็น
            // ถ้า server มีข้อมูลใหม่กว่า ให้อัพเดทข้อมูลท้องถิ่น
            if (needsLocalUpdate) {
              set(finalData);
              
              // อัพเดท timestamp เป็นเวลาล่าสุดที่ได้จาก server
              localStorage.setItem('last-server-sync-time', new Date().toISOString());
              
              // แสดง Toast แจ้งเตือนว่าอัพเดทเซิร์ฟเวอร์สำเร็จ
              // โค้ดส่วนนี้ถูกลบเพื่อไม่แสดง toast เมื่ออัปเดทสำเร็จ
              // showToast(
              //   'sync.uploadSuccess',
              //   'sync.uploadSuccessDesc',
              //   {},
              //   'default'
              // );
            }
            
            // ถ้าข้อมูลท้องถิ่นมีการอัพเดทล่าสุด ให้อัพเดทข้อมูลไปที่ server
            if (needsServerUpdate) {
              // บันทึกเวลาเริ่มต้นการอัพเดทข้อมูลไปยัง server
              const updateStartTime = performance.now();
              console.log(`[Sync] Starting database update at ${new Date().toISOString()}`);
              
              // ส่งข้อมูลไปยัง server
              const updateResponse = await fetch('/api/nutrition', {
                method: 'POST',
                credentials: 'include', // ส่ง cookies ไปด้วย
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                  ...localData,
                  updatedAt: new Date().toISOString(),
                }),
              });
              
              const updateEndTime = performance.now();
              const updateDuration = (updateEndTime - updateStartTime).toFixed(2);
              console.log(`[Sync] Database update completed in ${updateDuration}ms`);
              
              // จัดการกรณี session timeout หรือ authentication error
              if (updateResponse.status === 401) {
                console.error('[Sync] Authentication error during POST: Session may be expired');
                window.dispatchEvent(new CustomEvent('auth-error', { detail: { code: 401 }}));
                set({ isLoading: false, error: 'Authentication error: Please log in again' });
                
                // แสดง Toast แจ้งเตือนว่าต้องล็อกอินใหม่
                showToast(
                  'sync.authError',
                  'sync.authErrorDesc',
                  {},
                  'destructive'
                );
                
                return;
              }
              
              if (!updateResponse.ok) {
                console.error(`[Sync] Update server error: ${updateResponse.status} ${updateResponse.statusText}`);
                
                // แสดง Toast แจ้งเตือนว่าเกิดข้อผิดพลาดในการอัพเดทเซิร์ฟเวอร์
                showToast(
                  'sync.updateFailed',
                  'sync.updateFailedDesc',
                  {},
                  'destructive'
                );
                
                throw new Error(`Failed to update server data: ${updateResponse.status}`);
              }
              
              // อัพเดท timestamp เป็นเวลาปัจจุบัน
              const now = new Date().toISOString();
              localStorage.setItem('last-server-sync-time', now);
              localStorage.setItem('last-local-update-time', now);
              
              console.log(`[Sync] Server update successful: ${now}`);
            }
            
            const endTime = performance.now();
            const totalDuration = (endTime - startTime).toFixed(2);
            console.log(`[Sync] Synchronization completed successfully in ${totalDuration}ms`);
            
            set({ isLoading: false });
            
            // ถ้ามีการซิงค์ข้อมูล แสดง Toast เพียงครั้งเดียว
            if (!needsLocalUpdate && !needsServerUpdate) {
              // แสดง Toast แจ้งเตือนว่าข้อมูลเป็นปัจจุบันแล้ว
              // โค้ดส่วนนี้ถูกลบเพื่อไม่แสดง toast เมื่อข้อมูลเป็นปัจจุบันแล้ว
              // showToast(
              //   'sync.upToDate',
              //   'sync.upToDateDesc',
              //   {},
              //   'default'
              // );
            }
          } catch (fetchError) {
            clearTimeout(timeoutId);
            // จัดการกรณี timeout หรือ network error
            if (fetchError && typeof fetchError === 'object' && 'name' in fetchError && fetchError.name === 'AbortError') {
              console.error('[Sync] Request timed out after 10 seconds');
              set({ isLoading: false, error: 'Request timed out. Please try again later.' });
              
              // แสดง Toast แจ้งเตือนว่าการเชื่อมต่อหมดเวลา
              showToast(
                'sync.timeout',
                'sync.timeoutDesc',
                {},
                'destructive'
              );
            } else {
              throw fetchError; // โยนข้อผิดพลาดไปยัง catch ด้านนอก
            }
          }
        } catch (error) {
          const endTime = performance.now();
          const startTime = performance.now() - 1; // Fallback in case startTime wasn't set
          const totalDuration = (endTime - startTime).toFixed(2);
          
          console.error(`[Sync] Error during synchronization after ${totalDuration}ms:`, error);
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to sync data' });
          
          // แสดง Toast แจ้งเตือนว่าเกิดข้อผิดพลาดในการซิงค์
          showToast(
            'sync.syncFailed',
            'sync.syncFailedDesc',
            {},
            'destructive'
          );
        }
      },
      
      // ฟังก์ชันสำหรับรวมข้อมูลจาก server และ local
      mergeData: (localData, serverData) => {
        const merged = { ...serverData };
        
        // รวมข้อมูล dailyLogs
        const mergedLogs = { ...serverData.dailyLogs || {} };
        
        // ตรวจสอบและรวมข้อมูลจาก dailyLogs ท้องถิ่น
        for (const date in localData.dailyLogs) {
          const localLog = localData.dailyLogs[date];
          const serverLog = serverData.dailyLogs ? serverData.dailyLogs[date] : undefined;
          
          // ถ้า server ไม่มีข้อมูลของวันนี้ ให้ใช้ข้อมูลจาก local
          if (!serverLog) {
            mergedLogs[date] = localLog;
            continue;
          }
          
          // ถ้ามีทั้งคู่ ให้รวมข้อมูล
          const localLastModified = localLog.lastModified ? new Date(localLog.lastModified) : new Date(0);
          const serverLastModified = serverLog.lastModified ? new Date(serverLog.lastModified) : new Date(0);
          
          // ใช้ข้อมูลที่ใหม่กว่า
          if (localLastModified > serverLastModified) {
            mergedLogs[date] = localLog;
          } else {
            mergedLogs[date] = serverLog;
          }
          
          // รวมข้อมูลมื้ออาหาร - ให้รวมมื้ออาหารจากทั้ง local และ server
          const mergedMeals = [...(serverLog.meals || [])];
          
          // ตรวจสอบว่ามีมื้ออาหารใน local ที่ไม่มีใน server หรือไม่
          if (localLog.meals) {
            for (const localMeal of localLog.meals) {
              // ตรวจสอบว่ามื้ออาหารนี้มีอยู่ใน server หรือไม่
              const existsInServer = mergedMeals.some(serverMeal => serverMeal.id === localMeal.id);
              
              // ถ้าไม่มี ให้เพิ่มเข้าไป
              if (!existsInServer) {
                mergedMeals.push(localMeal);
              }
            }
          }
          
          // ใช้วิธีคำนวณยอดรวมใหม่
          const totals = mergedMeals.reduce(
            (acc, meal) => {
              const quantity = meal.quantity || 1;
              acc.totalCalories += meal.foodItem.calories * quantity;
              acc.totalProtein += meal.foodItem.protein * quantity;
              acc.totalFat += meal.foodItem.fat * quantity;
              acc.totalCarbs += meal.foodItem.carbs * quantity;
              return acc;
            },
            { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 }
          );
          
          // อัพเดท mergedLogs กับข้อมูลที่รวมแล้ว
          mergedLogs[date] = {
            ...mergedLogs[date],
            meals: mergedMeals,
            ...totals,
            lastModified: new Date().toISOString() // อัพเดท timestamp
          };
        }
        
        merged.dailyLogs = mergedLogs;
        
        // รวมข้อมูล food templates
        if (localData.foodTemplates && serverData.foodTemplates) {
          const mergedTemplates = [...serverData.foodTemplates];
          
          // ตรวจสอบว่ามี template ใน local ที่ไม่มีใน server หรือไม่
          for (const localTemplate of localData.foodTemplates) {
            // ตรวจสอบว่า template นี้มีอยู่ใน server หรือไม่
            const existingTemplateIndex = mergedTemplates.findIndex(t => t.id === localTemplate.id);
            
            if (existingTemplateIndex === -1) {
              // ถ้าไม่มี ให้เพิ่มเข้าไป
              mergedTemplates.push(localTemplate);
            } else {
              // ถ้ามีแล้ว ให้ใช้อันที่ใหม่กว่า
              const serverTemplate = mergedTemplates[existingTemplateIndex];
              const localLastModified = localTemplate.lastModified ? new Date(localTemplate.lastModified) : new Date(0);
              const serverLastModified = serverTemplate.lastModified ? new Date(serverTemplate.lastModified) : new Date(0);
              
              if (localLastModified > serverLastModified) {
                mergedTemplates[existingTemplateIndex] = localTemplate;
              }
            }
          }
          
          merged.foodTemplates = mergedTemplates;
        } else if (localData.foodTemplates) {
          merged.foodTemplates = localData.foodTemplates;
        }
        
        // รวมข้อมูล goals
        if (localData.goals && serverData.goals) {
          // ตรวจสอบว่าอันไหนอัพเดทล่าสุด
          const localGoalsLastModified = localData.goals.lastModified ? new Date(localData.goals.lastModified) : new Date(0);
          const serverGoalsLastModified = serverData.goals.lastModified ? new Date(serverData.goals.lastModified) : new Date(0);
          
          if (localGoalsLastModified > serverGoalsLastModified) {
            merged.goals = localData.goals;
          } else {
            merged.goals = serverData.goals;
          }
        } else if (localData.goals) {
          merged.goals = localData.goals;
        }
        
        // รวมข้อมูล weightHistory
        if (localData.weightHistory && serverData.weightHistory) {
          const mergedWeightHistory = [...serverData.weightHistory];
          
          // ตรวจสอบว่ามีข้อมูลน้ำหนักใน local ที่ไม่มีใน server หรือไม่
          for (const localWeight of localData.weightHistory) {
            // ตรวจสอบว่าข้อมูลนี้มีอยู่ใน server หรือไม่
            const existingWeightIndex = mergedWeightHistory.findIndex(w => w.date === localWeight.date);
            
            if (existingWeightIndex === -1) {
              // ถ้าไม่มี ให้เพิ่มเข้าไป
              mergedWeightHistory.push(localWeight);
            } else {
              // ถ้ามีแล้ว ให้ใช้อันที่ใหม่กว่า
              const serverWeight = mergedWeightHistory[existingWeightIndex];
              const localLastModified = localWeight.lastModified ? new Date(localWeight.lastModified) : new Date(0);
              const serverLastModified = serverWeight.lastModified ? new Date(serverWeight.lastModified) : new Date(0);
              
              if (localLastModified > serverLastModified) {
                mergedWeightHistory[existingWeightIndex] = localWeight;
              }
            }
          }
          
          merged.weightHistory = mergedWeightHistory;
        } else if (localData.weightHistory) {
          merged.weightHistory = localData.weightHistory;
        }
        
        // อัพเดทสถานะอื่นๆ
        merged.isInitialized = localData.isInitialized;
        merged.isLoading = localData.isLoading;
        merged.error = localData.error;
        merged.currentDate = localData.currentDate;
        
        return merged;
      },
      
      // Template management methods
      addFoodTemplate: async (template) => {
        set((state) => ({
          foodTemplates: [...state.foodTemplates, {
            ...template,
            isTemplate: true, // Ensure it's marked as a template
          }]
        }));
      },
      
      updateFoodTemplate: async (templateId, updates) => {
        set((state) => ({
          foodTemplates: state.foodTemplates.map(template =>
            template.id === templateId
              ? { ...template, ...updates, isTemplate: true }
              : template
          )
        }));
      },
      
      removeFoodTemplate: async (templateId) => {
        set((state) => ({
          foodTemplates: state.foodTemplates.filter(template => template.id !== templateId)
        }));
      },
      
      // Create food items from templates
      createMealItemFromTemplate: (templateId, overrides = {}) => {
        const { foodTemplates } = get();
        const template = foodTemplates.find(t => t.id === templateId);
        
        if (!template) return null;
        
        return {
          id: crypto.randomUUID(),
          name: template.name,
          calories: template.calories,
          protein: template.protein,
          carbs: template.carbs,
          fat: template.fat,
          servingSize: template.servingSize,
          category: template.category,
          usdaId: template.usdaId,
          brandName: template.brandName,
          ingredients: template.ingredients,
          templateId: template.id, // Reference to original template
          recordedAt: new Date(),
          ...overrides
        };
      },
      
      createMealFoodFromScratch: (foodData) => {
        return {
          id: crypto.randomUUID(),
          recordedAt: new Date(),
          ...foodData
        };
      },
      
      // Legacy methods for backward compatibility
      addFavoriteFood: async (food) => {
        // Convert FoodItem to FoodTemplate if necessary
        const template: FoodTemplate = {
          id: food.id || crypto.randomUUID(),
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          servingSize: food.servingSize,
          category: food.category,
          favorite: 'favorite' in food ? food.favorite : true,
          createdAt: 'createdAt' in food ? food.createdAt : new Date(),
          usdaId: 'usdaId' in food ? food.usdaId : undefined,
          brandName: 'brandName' in food ? food.brandName : undefined,
          ingredients: 'ingredients' in food ? food.ingredients : undefined,
          dataType: 'dataType' in food ? food.dataType : undefined,
          mealCategory: 'mealCategory' in food ? food.mealCategory : undefined,
          isTemplate: true,
        };
        
        get().addFoodTemplate(template);
      },
      
      removeFavoriteFood: async (foodId) => {
        get().removeFoodTemplate(foodId);
      },
      
      // Add a meal entry
      addMeal: async (meal) => {
        set((state) => {
          const { dailyLogs, currentDate } = state;
          const date = meal.date || currentDate;
          
          // Get or create log for the day
          const dayLog = dailyLogs[date] || {
            date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            waterIntake: 0,
            lastModified: new Date().toISOString() // เพิ่ม timestamp
          };
          
          // Ensure meal.foodItem is a MealFoodItem
          let mealFoodItem: MealFoodItem;
          if (isMealFoodItem(meal.foodItem)) {
            mealFoodItem = meal.foodItem;
          } else if (isTemplate(meal.foodItem)) {
            // Convert template to meal food item
            const template = meal.foodItem as FoodTemplate;
            mealFoodItem = {
              id: crypto.randomUUID(),
              name: template.name,
              calories: template.calories,
              protein: template.protein,
              carbs: template.carbs,
              fat: template.fat,
              servingSize: template.servingSize,
              category: template.category,
              usdaId: template.usdaId,
              brandName: template.brandName,
              ingredients: template.ingredients,
              templateId: template.id,
              recordedAt: new Date()
            };
          } else {
            // Legacy case - convert normal FoodItem to MealFoodItem
            const foodItem = meal.foodItem as any;
            mealFoodItem = {
              id: crypto.randomUUID(),
              name: foodItem.name,
              calories: foodItem.calories,
              protein: foodItem.protein,
              carbs: foodItem.carbs,
              fat: foodItem.fat,
              servingSize: foodItem.servingSize,
              category: foodItem.category,
              usdaId: foodItem.usdaId,
              brandName: foodItem.brandName,
              ingredients: foodItem.ingredients,
              recordedAt: new Date()
            };
          }
          
          // Create new meal entry with MealFoodItem
          const newMeal: MealEntry = {
            ...meal,
            foodItem: mealFoodItem
          };
          
          // Add meal to the day's log
          const updatedMeals = [...dayLog.meals, newMeal];
          
          // Calculate new totals
          const totals = updatedMeals.reduce(
            (acc, meal) => {
              const quantity = meal.quantity;
              acc.totalCalories += meal.foodItem.calories * quantity;
              acc.totalProtein += meal.foodItem.protein * quantity;
              acc.totalFat += meal.foodItem.fat * quantity;
              acc.totalCarbs += meal.foodItem.carbs * quantity;
              return acc;
            },
            { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 }
          );
          
          // Create updated log
          const updatedLog = {
            ...dayLog,
            meals: updatedMeals,
            ...totals,
            waterIntake: dayLog.waterIntake,
            lastModified: new Date().toISOString() // เพิ่ม timestamp
          };
          
          // อัพเดท timestamp เมื่อมีการเพิ่มมื้ออาหาร
          const now = new Date().toISOString();
          localStorage.setItem('last-local-update-time', now);
          
          // Return updated state
          return {
            dailyLogs: {
              ...dailyLogs,
              [date]: updatedLog
            }
          };
        });
        
        // แสดง Toast เมื่อเพิ่มมื้ออาหารสำเร็จ
        showToast(
          'meal.addSuccess',
          'meal.addSuccessDesc',
          {
            name: meal.foodItem.name,
            calories: Math.round(meal.foodItem.calories * meal.quantity)
          }
        );
        
        // ซิงค์ข้อมูลในพื้นหลัง
        setTimeout(() => {
          // ตรวจสอบว่าสามารถซิงค์ได้หรือไม่ก่อนที่จะทำการซิงค์
          if (get().canSync()) {
            get().syncData().catch(error => console.error('Background sync after adding meal failed:', error));
          }
        }, 500);
      },
      
      // ฟังก์ชั่นอื่นๆ ที่ไม่เกี่ยวกับการแก้ไขโครงสร้าง template ยังคงเหมือนเดิม...
      removeMeal: async (id) => {
        let mealName = '';
        let mealCalories = 0;
        
        set((state) => {
          const { dailyLogs } = state;
          let updatedLogs = { ...dailyLogs };
          
          // Find the log containing this meal
          for (const dateString in dailyLogs) {
            const log = dailyLogs[dateString];
            const mealIndex = log.meals.findIndex((meal) => meal.id === id);
            
            if (mealIndex >= 0) {
              // ทำการจัดเก็บข้อมูลมื้ออาหารที่ถูกลบเพื่อแจ้งเตือน
              const removedMeal = log.meals[mealIndex];
              mealName = removedMeal.foodItem.name;
              mealCalories = Math.round(removedMeal.foodItem.calories * removedMeal.quantity);
              
              // Remove the meal
              const updatedMeals = log.meals.filter((_, index) => index !== mealIndex);
              
              // Recalculate totals
              const totals = updatedMeals.reduce(
                (acc, meal) => {
                  const quantity = meal.quantity;
                  acc.totalCalories += meal.foodItem.calories * quantity;
                  acc.totalProtein += meal.foodItem.protein * quantity;
                  acc.totalFat += meal.foodItem.fat * quantity;
                  acc.totalCarbs += meal.foodItem.carbs * quantity;
                  return acc;
                },
                { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 }
              );
              
              // Update the log
              updatedLogs[dateString] = {
                ...log,
                meals: updatedMeals,
                ...totals,
                lastModified: new Date().toISOString() // เพิ่ม timestamp
              };
              
              // อัพเดท timestamp เมื่อมีการลบมื้ออาหาร
              const now = new Date().toISOString();
              localStorage.setItem('last-local-update-time', now);
              
              break;
            }
          }
          
          return { dailyLogs: updatedLogs };
        });
        
        // แสดง Toast เมื่อลบมื้ออาหารสำเร็จ
        if (mealName) {
          showToast(
            'meal.removeSuccess',
            'meal.removeSuccessDesc',
            {
              name: mealName,
              calories: mealCalories
            }
          );
        }
        
        // ซิงค์ข้อมูลอัตโนมัติหลังจากลบ
        setTimeout(() => {
          // ตรวจสอบว่าสามารถซิงค์ได้หรือไม่ก่อนที่จะทำการซิงค์
          if (get().canSync()) {
            get().syncData().catch(error => console.error('Background sync after removing meal failed:', error));
          }
        }, 500);
      },
      
      updateMealEntry: async (entryId, updates) => {
        let dateFound = '';
        let updatedMeal: MealEntry | null = null;
        
        // อัพเดท state ก่อน
        set((state) => {
          const { dailyLogs } = state;
          
          // Find the log containing this entry
          for (const dateString in dailyLogs) {
            const log = dailyLogs[dateString];
            const entryIndex = log.meals.findIndex((meal) => meal.id === entryId);
            
            if (entryIndex >= 0) {
              dateFound = dateString;
              
              // Update the entry
              const updatedMeals = [...log.meals];
              updatedMeals[entryIndex] = {
                ...updatedMeals[entryIndex],
                ...updates,
              };
              
              updatedMeal = updatedMeals[entryIndex];
              
              // Recalculate totals
              const totals = updatedMeals.reduce(
                (acc, meal) => {
                  const quantity = meal.quantity;
                  acc.totalCalories += meal.foodItem.calories * quantity;
                  acc.totalProtein += meal.foodItem.protein * quantity;
                  acc.totalFat += meal.foodItem.fat * quantity;
                  acc.totalCarbs += meal.foodItem.carbs * quantity;
                  return acc;
                },
                { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 }
              );
              
              // Update the log
              const updatedLog = {
                ...log,
                meals: updatedMeals,
                ...totals,
                waterIntake: log.waterIntake,
                lastModified: new Date().toISOString() // เพิ่ม timestamp
              };
              
              return {
                dailyLogs: {
                  ...dailyLogs,
                  [dateString]: updatedLog,
                },
              };
            }
          }
          
          return state; // No change if entry not found
        });
      },
      
      setCurrentDate: (date) => {
        set({ currentDate: date });
      },
      
      updateGoals: async (goals) => {
        set((state) => {
          const updatedGoals = { ...state.goals, ...goals, lastModified: new Date().toISOString() };
          
          // อัพเดท timestamp
          const now = new Date().toISOString();
          localStorage.setItem('last-local-update-time', now);
          
          return { goals: updatedGoals };
        });
        
        // แสดง Toast เมื่ออัพเดทเป้าหมายสำเร็จ
        showToast(
          'goals.updateSuccess',
          'goals.updateSuccessDesc'
        );
        
        // ซิงค์ข้อมูลในพื้นหลัง
        setTimeout(() => {
          // ตรวจสอบว่าสามารถซิงค์ได้หรือไม่ก่อนที่จะทำการซิงค์
          if (get().canSync()) {
            get().syncData().catch(error => console.error('Background sync failed:', error));
          }
        }, 500);
      },
      
      updateDailyMood: async (date, moodRating, notes) => {
        set((state) => {
          const { dailyLogs } = state;
          
          // Get or create log for the day
          const dayLog = dailyLogs[date] || {
            date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            waterIntake: 0,
            lastModified: new Date().toISOString() // เพิ่ม timestamp
          };
          
          // Update the log
          const updatedLog = {
            ...dayLog,
            moodRating,
            notes,
            lastModified: new Date().toISOString() // เพิ่ม timestamp
          };
          
          // อัพเดท timestamp สำหรับการซิงค์
          const now = new Date().toISOString();
          localStorage.setItem('last-local-update-time', now);
          
          return {
            dailyLogs: {
              ...dailyLogs,
              [date]: updatedLog
            }
          };
        });
        
        // แสดง Toast แจ้งเตือนเมื่อบันทึกอารมณ์สำเร็จ
        showToast(
          'mood.updateSuccess',
          'mood.updateSuccessDesc'
        );
        
        // ซิงค์ข้อมูลหลังจากอัพเดทอารมณ์
        setTimeout(() => {
          // ตรวจสอบว่าสามารถซิงค์ได้หรือไม่ก่อนที่จะทำการซิงค์
          if (get().canSync()) {
            get().syncData().catch(error => console.error('Background sync after mood update failed:', error));
          }
        }, 500);
      },
      
      getMood: (date) => {
        const { dailyLogs } = get();
        const log = dailyLogs[date];
        
        if (!log) return null;
        
        return {
          moodRating: log.moodRating,
          notes: log.notes
        };
      },
      
      getDailyMood: () => {
        const { dailyLogs, currentDate } = get();
        const log = dailyLogs[currentDate];
        
        if (!log) return null;
        
        return {
          moodRating: log.moodRating,
          notes: log.notes
        };
      },
      
      addWaterIntake: async (date, amount) => {
        set((state) => {
          const { dailyLogs } = state;
          
          // Get or create log for the day
          const dayLog = dailyLogs[date] || {
            date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            waterIntake: 0,
            lastModified: new Date().toISOString() // เพิ่ม timestamp
          };
          
          // Update the log
          const updatedLog = {
            ...dayLog,
            waterIntake: dayLog.waterIntake + amount,
            lastModified: new Date().toISOString() // เพิ่ม timestamp
          };
          
          // อัพเดท timestamp สำหรับการซิงค์
          const now = new Date().toISOString();
          localStorage.setItem('last-local-update-time', now);
          
          return {
            dailyLogs: {
              ...dailyLogs,
              [date]: updatedLog
            }
          };
        });
        
        // แสดง toast เมื่อบันทึกเรียบร้อย
        const waterGoal = get().goals.water;
        const currentWaterIntake = get().getWaterIntake(date) || 0;
        const percentage = Math.min(Math.round((currentWaterIntake / waterGoal) * 100), 100);
        
        if (percentage >= 100) {
          showToast(
            'water.goalComplete', 
            'water.goalCompleteDesc',
            {
              goal: waterGoal
            }
          );
        } else {
          showToast(
            'water.addSuccess', 
            'water.addSuccessDesc',
            {
              current: currentWaterIntake,
              goal: waterGoal,
              percentage: percentage
            }
          );
        }
        
        // ซิงค์ข้อมูลอัตโนมัติหลังจากเพิ่มน้ำดื่ม
        setTimeout(() => {
          // ตรวจสอบว่าสามารถซิงค์ได้หรือไม่ก่อนที่จะทำการซิงค์
          if (get().canSync()) {
            get().syncData().catch(error => console.error('Background sync after water intake failed:', error));
          }
        }, 500);
      },
      
      resetWaterIntake: async (date) => {
        set((state) => {
          const { dailyLogs } = state;
          
          // Get log for the day
          const dayLog = dailyLogs[date];
          
          // If no log, no need to update
          if (!dayLog) return state;
          
          // Update the log
          const updatedLog = {
            ...dayLog,
            waterIntake: 0,
            lastModified: new Date().toISOString() // เพิ่ม timestamp
          };
          
          // อัพเดท timestamp สำหรับการซิงค์
          const now = new Date().toISOString();
          localStorage.setItem('last-local-update-time', now);
          
          return {
            dailyLogs: {
              ...dailyLogs,
              [date]: updatedLog
            }
          };
        });
        
        // แสดง toast การรีเซ็ต
        showToast(
          'water.reset', 
          'water.resetDesc'
        );
        
        // ซิงค์ข้อมูลอัตโนมัติหลังจากรีเซ็ต
        setTimeout(() => {
          // ตรวจสอบว่าสามารถซิงค์ได้หรือไม่ก่อนที่จะทำการซิงค์
          if (get().canSync()) {
            get().syncData().catch(error => console.error('Background sync after water reset failed:', error));
          }
        }, 500);
      },
      
      getWaterIntake: (date) => {
        const { dailyLogs } = get();
        const log = dailyLogs[date];
        
        if (!log) return 0;
        
        return log.waterIntake;
      },
      
      getWaterGoal: () => {
        const { goals } = get();
        return goals.water;
      },
      
      // Weight tracking methods implementation
      addWeightEntry: async (entry: WeightEntry) => {
        const { weightHistory, dailyLogs } = get();
        
        // Update weight history
        const updatedWeightHistory = [...weightHistory];
        const existingEntryIndex = updatedWeightHistory.findIndex(e => e.date === entry.date);
        
        if (existingEntryIndex >= 0) {
          // Update existing entry
          updatedWeightHistory[existingEntryIndex] = entry;
        } else {
          // Add new entry
          updatedWeightHistory.push(entry);
        }
        
        // Sort by date (newest first)
        updatedWeightHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Also update the daily log if it exists
        const updatedDailyLogs = { ...dailyLogs };
        if (updatedDailyLogs[entry.date]) {
          updatedDailyLogs[entry.date] = {
            ...updatedDailyLogs[entry.date],
            weight: entry.weight,
            lastModified: new Date().toISOString() // เพิ่ม timestamp
          };
        } else {
          // Create a new daily log entry if one doesn't exist
          updatedDailyLogs[entry.date] = {
            date: entry.date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            waterIntake: 0,
            weight: entry.weight,
            lastModified: new Date().toISOString() // เพิ่ม timestamp
          };
        }
        
        // อัพเดท timestamp สำหรับการซิงค์
        const now = new Date().toISOString();
        localStorage.setItem('last-local-update-time', now);
        
        set({ weightHistory: updatedWeightHistory, dailyLogs: updatedDailyLogs });
        
        // ซิงค์ข้อมูลอัตโนมัติหลังจากบันทึกน้ำหนัก
        setTimeout(() => {
          // ตรวจสอบว่าสามารถซิงค์ได้หรือไม่ก่อนที่จะทำการซิงค์
          if (get().canSync()) {
            get().syncData().catch(error => console.error('Background sync after weight entry failed:', error));
          }
        }, 500);
        
        // แสดง toast เมื่อบันทึกเรียบร้อย
        showToast(
          'weight.addSuccess', 
          'weight.addSuccessDesc',
          {
            weight: entry.weight
          }
        );
      },
      
      updateWeightEntry: async (date: string, weight: number, note?: string) => {
        const entry: WeightEntry = { date, weight, note };
        try {
          await get().addWeightEntry(entry);
          
          // ไม่จำเป็นต้องแสดง toast อีกครั้งเพราะ addWeightEntry จะจัดการให้แล้ว
        } catch (error) {
          console.error('Failed to update weight entry:', error);
          showToast(
            'sync.syncFailed', 
            'sync.syncFailedDesc',
            {},
            'destructive'
          );
        }
      },
      
      getWeightEntry: (date: string) => {
        const { weightHistory, dailyLogs } = get();
        
        // First check in weight history
        const entry = weightHistory.find(e => e.date === date);
        if (entry) return entry;
        
        // If not found in history but exists in daily log, create entry from daily log
        if (dailyLogs[date] && dailyLogs[date].weight) {
          return {
            date,
            weight: dailyLogs[date].weight as number
          };
        }
        
        return undefined;
      },
      
      getWeightEntries: (limit?: number) => {
        const { weightHistory } = get();
        // Return all entries sorted by date (newest first), or limit if specified
        const sortedEntries = [...weightHistory].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        return limit ? sortedEntries.slice(0, limit) : sortedEntries;
      },
      
      getWeightGoal: () => {
        return get().goals.weight;
      },
      
      // Data management
      clearTodayData: () => {
        const { currentDate, dailyLogs } = get();
        const today = dailyLogs[currentDate];
        
        // ถ้าไม่มีข้อมูลวันนี้ ไม่ต้องทำอะไร
        if (!today) return;
        
        // คัดลอกข้อมูลเดิมแต่ล้างมื้ออาหารและคำนวณค่าโภชนาการใหม่
        set((state) => ({
          dailyLogs: {
            ...state.dailyLogs,
            [currentDate]: {
              ...today,
              meals: [], // ล้างมื้ออาหารทั้งหมด
              totalCalories: 0, // รีเซ็ตค่าแคลอรี่
              totalProtein: 0, // รีเซ็ตค่าโปรตีน
              totalFat: 0, // รีเซ็ตค่าไขมัน
              totalCarbs: 0, // รีเซ็ตค่าคาร์โบไฮเดรต
              lastModified: new Date().toISOString() // อัปเดทเวลาแก้ไข
            }
          }
        }));
        
        // แสดง toast แจ้งเตือน
        showToast(
          'data.clearSuccess', 
          'data.clearSuccessDesc'
        );
      }
    }),
    {
      name: 'nutrition-storage',
      // Exclude some heavy data from persistence if necessary
      partialize: (state) => ({
        goals: state.goals,
        foodTemplates: state.foodTemplates,
        dailyLogs: state.dailyLogs,
        currentDate: state.currentDate,
        isInitialized: state.isInitialized,
        lastSyncTime: state.lastSyncTime, // บันทึก lastSyncTime
      })
    }
  )
); 