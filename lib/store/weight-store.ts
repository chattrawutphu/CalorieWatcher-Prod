import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WeightEntry {
  date: string;
  weight: number; // Weight in kg
  note?: string;
}

interface WeightState {
  weightEntries: WeightEntry[];
  goal?: number; // Target weight in kg
  
  // Actions
  addWeightEntry: (entry: WeightEntry) => void;
  updateWeightEntry: (date: string, weight: number, note?: string) => void;
  removeWeightEntry: (date: string) => void;
  getWeightEntries: (limit?: number) => WeightEntry[];
  getWeightGoal: () => number | undefined;
  updateWeightGoal: (goal: number) => void;
  
  // For reset functionality
  reset: () => void;
  
  // State access
  getState: () => Omit<WeightState, 'getState'>;
}

export const useWeightStore = create<WeightState>()(
  persist(
    (set, get) => ({
      weightEntries: [],
      goal: undefined,
      
      addWeightEntry: (entry) => {
        set((state) => {
          // Check if entry for this date already exists
          const existingEntryIndex = state.weightEntries.findIndex(e => e.date === entry.date);
          
          if (existingEntryIndex >= 0) {
            // Update existing entry
            const updatedEntries = [...state.weightEntries];
            updatedEntries[existingEntryIndex] = entry;
            return { weightEntries: updatedEntries };
          } else {
            // Add new entry
            return { 
              weightEntries: [...state.weightEntries, entry].sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              ) 
            };
          }
        });
      },
      
      updateWeightEntry: (date, weight, note) => {
        set((state) => {
          const entryIndex = state.weightEntries.findIndex(e => e.date === date);
          
          if (entryIndex >= 0) {
            const updatedEntries = [...state.weightEntries];
            updatedEntries[entryIndex] = {
              ...updatedEntries[entryIndex],
              weight,
              note
            };
            return { weightEntries: updatedEntries };
          }
          
          return state;
        });
      },
      
      removeWeightEntry: (date) => {
        set((state) => ({
          weightEntries: state.weightEntries.filter(entry => entry.date !== date)
        }));
      },
      
      getWeightEntries: (limit) => {
        const entries = get().weightEntries;
        // Sort in reverse chronological order
        const sortedEntries = [...entries].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        return limit ? sortedEntries.slice(0, limit) : sortedEntries;
      },
      
      getWeightGoal: () => {
        return get().goal;
      },
      
      updateWeightGoal: (goal) => {
        set({ goal });
      },
      
      reset: () => {
        set({
          weightEntries: [],
          goal: undefined
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
      name: 'weight-storage',
    }
  )
); 