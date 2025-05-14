"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNutritionStore } from "@/lib/store/nutrition-store";

// Define the NutritionStats type
interface NutritionStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  percentCalories: number;
  percentProtein: number;
  percentCarbs: number;
  percentFat: number;
  percentWater: number;
}

// Define the context type
interface NutritionContextType {
  isDataLoaded: boolean;
  getTodayStats: () => NutritionStats;
  goals: any;
  recentMeals: any[];
  meals: any[];
  isTodayEmpty: boolean;
  getDailyMood: (date: string) => any;
  isLoading: boolean;
  error: string | null;
}

// Create context with default value
const NutritionContext = createContext<NutritionContextType>({
  isDataLoaded: false,
  getTodayStats: () => ({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
    percentCalories: 0,
    percentProtein: 0,
    percentCarbs: 0,
    percentFat: 0,
    percentWater: 0
  }),
  goals: {},
  recentMeals: [],
  meals: [],
  isTodayEmpty: true,
  getDailyMood: () => null,
  isLoading: false,
  error: null
});

// Custom hook to use the context
export const useNutrition = () => useContext(NutritionContext);

export function NutritionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { 
    dailyLogs, 
    goals, 
    foodTemplates,
    currentDate,
    isInitialized,
    initializeData, 
    isLoading, 
    error,
    getDailyMood
  } = useNutritionStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeData();
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Failed to initialize nutrition data:", error);
        setIsDataLoaded(true); // Set to true anyway so UI renders
      }
    };

    loadData();
  }, [initializeData]);

  const getTodayStats = (): NutritionStats => {
    const todayLog = dailyLogs[currentDate] || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0, 
      totalFat: 0,
      waterIntake: 0
    };

    const goalCalories = goals?.calories || 2000;
    const goalProtein = goals?.protein || 50;
    const goalCarbs = goals?.carbs || 200;
    const goalFat = goals?.fat || 70;
    const goalWater = goals?.water || 2000;

    return {
      calories: todayLog.totalCalories || 0,
      protein: todayLog.totalProtein || 0,
      carbs: todayLog.totalCarbs || 0,
      fat: todayLog.totalFat || 0,
      water: todayLog.waterIntake || 0,
      percentCalories: Math.min(100, Math.round((todayLog.totalCalories / goalCalories) * 100)) || 0,
      percentProtein: Math.min(100, Math.round((todayLog.totalProtein / goalProtein) * 100)) || 0,
      percentCarbs: Math.min(100, Math.round((todayLog.totalCarbs / goalCarbs) * 100)) || 0,
      percentFat: Math.min(100, Math.round((todayLog.totalFat / goalFat) * 100)) || 0,
      percentWater: Math.min(100, Math.round((todayLog.waterIntake / goalWater) * 100)) || 0
    };
  };

  // Get meals for today
  const getMealsForToday = () => {
    const todayLog = dailyLogs[currentDate];
    return todayLog?.meals || [];
  };

  // Get a few recent meals from all days
  const getRecentMeals = () => {
    const allMeals: any[] = [];
    
    // Collect meals from all days
    Object.values(dailyLogs).forEach(log => {
      log.meals.forEach(meal => allMeals.push(meal));
    });
    
    // Sort by date (newest first) and take the first 5
    return allMeals
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  // Determine if today is empty
  const isTodayEmpty = !dailyLogs[currentDate] || !dailyLogs[currentDate].meals || dailyLogs[currentDate].meals.length === 0;

  return (
    <NutritionContext.Provider
      value={{
        getTodayStats,
        goals,
        recentMeals: getRecentMeals(),
        meals: getMealsForToday(),
        isTodayEmpty,
        getDailyMood,
        isLoading,
        error,
        isDataLoaded
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
} 