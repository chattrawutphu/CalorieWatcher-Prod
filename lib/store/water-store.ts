import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

interface WaterEntry {
  amount: number; // in mL
  timestamp: string;
}

interface WaterState {
  dailyWaterIntake: Record<string, number>; // date -> total mL
  waterEntries: Record<string, WaterEntry[]>; // date -> entries
  goal: number; // Daily water goal in mL
  
  // Actions
  addWaterIntake: (date: string, amount: number) => void;
  resetWaterIntake: (date: string) => void;
  getWaterIntake: (date: string) => number;
  getWaterGoal: () => number;
  updateWaterGoal: (goal: number) => void;
  
  // For reset functionality
  reset: () => void;
  
  // State access
  getState: () => Omit<WaterState, 'getState'>;
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      dailyWaterIntake: {},
      waterEntries: {},
      goal: 2000, // Default: 2L per day
      
      addWaterIntake: (date, amount) => {
        set((state) => {
          const currentTotal = state.dailyWaterIntake[date] || 0;
          const newEntry: WaterEntry = {
            amount,
            timestamp: new Date().toISOString()
          };
          
          return {
            dailyWaterIntake: {
              ...state.dailyWaterIntake,
              [date]: currentTotal + amount
            },
            waterEntries: {
              ...state.waterEntries,
              [date]: [...(state.waterEntries[date] || []), newEntry]
            }
          };
        });
      },
      
      resetWaterIntake: (date) => {
        set((state) => ({
          dailyWaterIntake: {
            ...state.dailyWaterIntake,
            [date]: 0
          },
          waterEntries: {
            ...state.waterEntries,
            [date]: []
          }
        }));
      },
      
      getWaterIntake: (date) => {
        return get().dailyWaterIntake[date] || 0;
      },
      
      getWaterGoal: () => {
        return get().goal;
      },
      
      updateWaterGoal: (goal) => {
        set({ goal });
      },
      
      reset: () => {
        set({
          dailyWaterIntake: {},
          waterEntries: {},
          goal: 2000
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
      name: 'water-storage',
    }
  )
); 