"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useSession } from "next-auth/react";

interface NutritionStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionContextType {
  getTodayStats: () => NutritionStats;
  goals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    water: number;
  };
  recentMeals: Array<{
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: string;
    type: "breakfast" | "lunch" | "dinner" | "snack";
    portion?: string;
  }>;
  meals: Array<any>;
  updateDailyMood: (date: string, moodRating: number, notes?: string) => void;
  getDailyMood: (date: string) => { moodRating?: number; notes?: string };
  isLoading: boolean;
  error: string | null;
}

const NutritionContext = createContext<NutritionContextType | null>(null);

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const { 
    dailyLogs, 
    goals, 
    currentDate,
    updateDailyMood,
    isLoading,
    isInitialized,
    error,
    initializeData
  } = useNutritionStore();

  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // โหลดข้อมูลจาก API เมื่อผู้ใช้ล็อกอินแล้ว
  useEffect(() => {
    // Only run this effect when the user is authenticated
    if (!isAuthenticated) return;
    
    // Load data once on component mount
    initializeData();
    
    // Return cleanup function (empty for this initialization effect)
    return () => {};
    // We intentionally leave dependencies empty to run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);  // Only depend on authentication status
  
  // Set up periodic sync in a separate effect
  useEffect(() => {
    // Only set up interval when authenticated
    if (!isAuthenticated) return;
    
    // Create the interval for periodic syncs
    const syncInterval = setInterval(() => {
      // Only sync if not already loading
      if (!isLoading) {
        initializeData();
      }
    }, 30000); // Sync every 30 seconds
    
    // Clean up the interval when component unmounts
    return () => clearInterval(syncInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Only depend on authentication status

  const getTodayStats = (): NutritionStats => {
    const todayLog = dailyLogs[currentDate] || {
      date: currentDate,
      meals: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    };

    return {
      calories: todayLog.totalCalories,
      protein: todayLog.totalProtein,
      carbs: todayLog.totalCarbs,
      fat: todayLog.totalFat
    };
  };

  // Get recent meals across all days, sorted by date (most recent first)
  const getRecentMeals = () => {
    const allMeals: Array<any> = [];
    
    Object.values(dailyLogs).forEach(log => {
      log.meals.forEach(meal => {
        allMeals.push({
          id: meal.id,
          name: meal.foodItem.name,
          calories: meal.foodItem.calories * meal.quantity,
          protein: meal.foodItem.protein * meal.quantity,
          carbs: meal.foodItem.carbs * meal.quantity,
          fat: meal.foodItem.fat * meal.quantity,
          date: meal.date,
          type: meal.mealType,
          portion: `${meal.quantity} ${meal.foodItem.servingSize}`
        });
      });
    });
    
    // Sort by date (most recent first) and take only the most recent 5
    return allMeals
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  // Get all meals for the current date
  const getMeals = () => {
    const todayLog = dailyLogs[currentDate] || {
      date: currentDate,
      meals: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    };

    return todayLog.meals.map(meal => ({
      id: meal.id,
      name: meal.foodItem.name,
      calories: meal.foodItem.calories * meal.quantity,
      protein: meal.foodItem.protein * meal.quantity,
      carbs: meal.foodItem.carbs * meal.quantity,
      fat: meal.foodItem.fat * meal.quantity,
      date: meal.date,
      type: meal.mealType,
      portion: `${meal.quantity} ${meal.foodItem.servingSize}`
    }));
  };

  // Get mood data for a specific date
  const getDailyMood = (date: string) => {
    const log = dailyLogs[date];
    return {
      moodRating: log?.moodRating,
      notes: log?.notes
    };
  };

  return (
    <NutritionContext.Provider 
      value={{
        getTodayStats,
        goals,
        recentMeals: getRecentMeals(),
        meals: getMeals(),
        updateDailyMood,
        getDailyMood,
        isLoading,
        error
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutrition() {
  const context = useContext(NutritionContext);
  if (context === null) {
    throw new Error("useNutrition must be used within a NutritionProvider");
  }
  return context;
} 