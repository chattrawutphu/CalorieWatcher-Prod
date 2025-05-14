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
  
  // State tracking
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  initializeData: () => Promise<void>;
  
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
          
          return { goals: updatedGoals };
        });
        
        // แสดง Toast เมื่ออัพเดทเป้าหมายสำเร็จ
        showToast(
          'goals.updateSuccess',
          'goals.updateSuccessDesc'
        );
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
        
        set({ weightHistory: updatedWeightHistory, dailyLogs: updatedDailyLogs });
        
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
        weightHistory: state.weightHistory
      })
    }
  )
); 