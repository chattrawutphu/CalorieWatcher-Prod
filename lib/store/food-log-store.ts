import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servingSize: string;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other';
}

interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
}

interface DailyLog {
  date: string;
  meals: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  moodRating?: number; // 1-5 rating (1:worst, 5:best)
  notes?: string;
  lastModified: string;
}

interface FoodLogState {
  dailyLogs: Record<string, DailyLog>; // indexed by date string
  currentDate: string; // ISO string for the currently selected date
  
  // Actions for meal management
  addMeal: (meal: MealEntry) => void;
  removeMeal: (id: string) => void;
  getMealsByDate: (date: string) => MealEntry[];
  getDailyLog: (date: string) => DailyLog | null;
  updateDailyMood: (date: string, moodRating: number, notes?: string) => void;
  clearDailyMeals: (date: string) => void;
  setCurrentDate: (date: string) => void;
  
  // For reset functionality
  reset: () => void;
  
  // State access
  getState: () => Omit<FoodLogState, 'getState'>;
}

// Helper function to calculate nutrition totals
const calculateDailyTotals = (meals: MealEntry[]) => {
  return meals.reduce((totals, meal) => {
    const { foodItem, quantity } = meal;
    return {
      totalCalories: totals.totalCalories + (foodItem.calories * quantity),
      totalProtein: totals.totalProtein + (foodItem.protein * quantity),
      totalFat: totals.totalFat + (foodItem.fat * quantity),
      totalCarbs: totals.totalCarbs + (foodItem.carbs * quantity),
    };
  }, { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 });
};

export const useFoodLogStore = create<FoodLogState>()(
  persist(
    (set, get) => ({
      dailyLogs: {},
      currentDate: new Date().toISOString().split('T')[0],
      
      addMeal: (meal) => {
        set((state) => {
          const date = meal.date;
          const existingLog = state.dailyLogs[date] || {
            date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            lastModified: new Date().toISOString()
          };
          
          const updatedMeals = [...existingLog.meals, meal];
          const nutritionTotals = calculateDailyTotals(updatedMeals);
          
          return {
            dailyLogs: {
              ...state.dailyLogs,
              [date]: {
                ...existingLog,
                meals: updatedMeals,
                ...nutritionTotals,
                lastModified: new Date().toISOString()
              }
            }
          };
        });
      },
      
      removeMeal: (id) => {
        set((state) => {
          // Find which date contains this meal
          const dateEntry = Object.entries(state.dailyLogs).find(([_, log]) => 
            log.meals.some(meal => meal.id === id)
          );
          
          if (!dateEntry) return state;
          
          const [date, log] = dateEntry;
          const updatedMeals = log.meals.filter(meal => meal.id !== id);
          const nutritionTotals = calculateDailyTotals(updatedMeals);
          
          return {
            dailyLogs: {
              ...state.dailyLogs,
              [date]: {
                ...log,
                meals: updatedMeals,
                ...nutritionTotals,
                lastModified: new Date().toISOString()
              }
            }
          };
        });
      },
      
      getMealsByDate: (date) => {
        return get().dailyLogs[date]?.meals || [];
      },
      
      getDailyLog: (date) => {
        return get().dailyLogs[date] || null;
      },
      
      updateDailyMood: (date, moodRating, notes) => {
        set((state) => {
          const existingLog = state.dailyLogs[date] || {
            date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            lastModified: new Date().toISOString()
          };
          
          return {
            dailyLogs: {
              ...state.dailyLogs,
              [date]: {
                ...existingLog,
                moodRating,
                notes,
                lastModified: new Date().toISOString()
              }
            }
          };
        });
      },
      
      clearDailyMeals: (date) => {
        set((state) => {
          const existingLog = state.dailyLogs[date];
          
          if (!existingLog) return state;
          
          return {
            dailyLogs: {
              ...state.dailyLogs,
              [date]: {
                ...existingLog,
                meals: [],
                totalCalories: 0,
                totalProtein: 0,
                totalFat: 0,
                totalCarbs: 0,
                lastModified: new Date().toISOString()
              }
            }
          };
        });
      },
      
      setCurrentDate: (date) => {
        set({ currentDate: date });
      },
      
      reset: () => {
        set({
          dailyLogs: {},
          currentDate: new Date().toISOString().split('T')[0]
        });
      },
      
      getState: () => {
        const state = get();
        // Omit getState method from returned state
        const { getState, ...rest } = state;
        return rest;
      }
    }),
    {
      name: 'food-log-storage',
    }
  )
); 