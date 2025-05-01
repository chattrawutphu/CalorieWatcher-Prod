"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Droplet, 
  Weight, 
  ChevronDown, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Utensils,
  Target, 
  BarChart3, 
  Flame, 
  ArrowUpDown, 
  Trophy, 
  CalendarDays, 
  SquareStack, 
  Medal, 
  ArrowDown,
  ArrowUp,
  ArrowRightLeft,
  RefreshCw
} from "lucide-react";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { AnalyticsWidget } from "@/components/ui/analytics-widget";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  LineChart, Line, AreaChart, Area, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ScatterChart, Scatter, ZAxis, ComposedChart
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, addDays, subMonths, differenceInDays, isSameDay, startOfMonth, endOfMonth, subWeeks } from "date-fns";
import { th, ja, zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const container = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const item = {
  hidden: { y: 10, opacity: 1 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};


const cardHover = {
  rest: { scale: 1, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" },
  hover: { 
    scale: 1.02, 
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.09)",
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    } 
  }
};

// Types
type TimeRange = "week" | "month" | "3months" | "6months" | "year";
type StatTab = "overview" | "nutrition" | "meals" | "trends" | "achievements";

// Colors for charts with richer palette - Update with modern vibrant colors
const COLORS = [
  "hsl(var(--primary))",           // Primary Theme Color
  "hsl(var(--accent))",            // Accent Theme Color
  "hsl(262, 83%, 65%)",            // Rich Purple
  "hsl(329, 95%, 70%)",            // Vibrant Pink
  "hsl(24, 90%, 60%)",             // Warm Orange
  "hsl(188, 95%, 60%)",            // Turquoise
  "hsl(62, 90%, 60%)",             // Bright Yellow
  "hsl(152, 74%, 55%)",            // Emerald Green
  "hsl(340, 80%, 65%)",            // Rose
  "hsl(198, 90%, 60%)"             // Azure Blue
];

// Gradients for more visually stunning charts
const GRADIENTS = {
  primary: ["hsl(var(--primary))", "hsla(var(--primary)/0.5)"],
  secondary: ["hsl(var(--secondary))", "hsla(var(--secondary)/0.5)"],
  accent: ["hsl(var(--accent))", "hsla(var(--accent)/0.5)"],
  blue: ["hsl(212, 100%, 50%)", "hsla(212, 100%, 50%, 0.2)"],
  purple: ["hsl(262, 83%, 65%)", "hsla(262, 83%, 65%, 0.2)"],
  pink: ["hsl(329, 95%, 70%)", "hsla(329, 95%, 70%, 0.2)"],
  orange: ["hsl(24, 90%, 60%)", "hsla(24, 90%, 60%, 0.2)"],
  green: ["hsl(152, 74%, 55%)", "hsla(152, 74%, 55%, 0.2)"],
};

// Add this after defining GRADIENTS
const TOOLTIPS = {
  contentStyle: { 
    backgroundColor: 'hsl(var(--card))', 
    borderColor: 'transparent',
    borderRadius: '12px',
    boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
    padding: '10px 12px',
    border: 'none'
  },
  itemStyle: { 
    color: 'hsl(var(--foreground))', 
    fontWeight: 500 
  },
  labelStyle: { 
    color: 'hsl(var(--foreground))', 
    fontWeight: 'bold', 
    marginBottom: '5px' 
  },
  cursor: { 
    stroke: 'hsl(var(--primary))', 
    strokeWidth: 1, 
    strokeDasharray: '4 4' 
  }
};

// Achievement types and icons
const ACHIEVEMENT_TYPES = {
  STREAK: { icon: <Flame className="h-5 w-5" />, color: "bg-orange-500" },
  NUTRITION: { icon: <Activity className="h-5 w-5" />, color: "bg-blue-500" },
  WATER: { icon: <Droplet className="h-5 w-5" />, color: "bg-cyan-500" },
  WEIGHT: { icon: <Weight className="h-5 w-5" />, color: "bg-violet-500" },
  CONSISTENCY: { icon: <CalendarDays className="h-5 w-5" />, color: "bg-green-500" },
  MILESTONE: { icon: <Trophy className="h-5 w-5" />, color: "bg-amber-500" },
  CALORIE: { icon: <BarChart3 className="h-5 w-5" />, color: "bg-rose-500" },
  FIBER: { icon: <Utensils className="h-5 w-5" />, color: "bg-emerald-500" },
  BALANCE: { icon: <ArrowUpDown className="h-5 w-5" />, color: "bg-indigo-500" },
  VARIETY: { icon: <SquareStack className="h-5 w-5" />, color: "bg-fuchsia-500" },
};

// Add a standardized BAR_STYLE object for consistent styling
const BAR_STYLE = {
  radius: [4, 4, 0, 0] as [number, number, number, number],
  animationDuration: 1200,
  animationEasing: "ease-out" as const,
  strokeWidth: 1
};

// Used for caching to avoid unnecessary recalculations
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Add these interfaces at the top of the file, after existing type declarations
interface NutrientDistributionItem {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface CalorieTrendItem {
  date: string;
  calories: number;
  goal: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  complete: boolean;
  date: string;
  progress: number;
  type: {
    color: string;
    icon: React.ReactNode;
  }
}

// Add these type definitions
interface MealDistributionItem {
  name: string;
  count: number;
  calories: number;
}

interface NutritionRadarItem {
  subject: string;
  user: number;
  recommended: number;
  fullMark: number;
  value?: number;  // Some places use 'value' instead of 'user'
  actual?: number; // Some places use 'actual' instead of 'user'
}

// Define the types for the data structures used in charts
const nutrientDistribution: NutrientDistributionItem[] = [
  { name: 'Protein', value: 30 },
  { name: 'Carbs', value: 45 },
  { name: 'Fat', value: 25 }
];

const mealDistributionData = {
  byCount: [
    { name: 'Breakfast', count: 5 },
    { name: 'Lunch', count: 7 },
    { name: 'Dinner', count: 6 },
    { name: 'Snacks', count: 4 }
  ] as MealDistributionItem[],
  byCalories: [
    { name: 'Breakfast', calories: 450 },
    { name: 'Lunch', calories: 650 },
    { name: 'Dinner', calories: 550 },
    { name: 'Snacks', calories: 250 }
  ] as MealDistributionItem[]
};

const nutritionRadarData: NutritionRadarItem[] = [
  { subject: 'Protein', user: 80, recommended: 100, fullMark: 150 },
  { subject: 'Carbs', user: 95, recommended: 100, fullMark: 150 },
  { subject: 'Fat', user: 85, recommended: 100, fullMark: 150 },
  { subject: 'Fiber', user: 60, recommended: 100, fullMark: 150 },
  { subject: 'Vitamins', user: 70, recommended: 100, fullMark: 150 }
];

const macroBalanceData = [
  { date: '1', protein: 20, carbs: 50, fat: 30 },
  { date: '2', protein: 25, carbs: 45, fat: 30 },
  { date: '3', protein: 30, carbs: 45, fat: 25 },
  { date: '4', protein: 25, carbs: 50, fat: 25 },
  { date: '5', protein: 20, carbs: 55, fat: 25 },
  { date: '6', protein: 25, carbs: 50, fat: 25 },
  { date: '7', protein: 30, carbs: 45, fat: 25 }
];

export default function StatsPage() {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const { dailyLogs, goals } = useNutritionStore();
  const { toast } = useToast();
  
  // State for controlling which widgets are shown
  const [activeTab, setActiveTab] = useState<StatTab>("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareStartDate, setCompareStartDate] = useState<string>(format(subWeeks(new Date(), 2), 'yyyy-MM-dd'));
  const [compareEndDate, setCompareEndDate] = useState<string>(format(subWeeks(new Date(), 1), 'yyyy-MM-dd'));
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // Add state for storing API data
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add state for storing API data for achievements
  const [apiAchievements, setApiAchievements] = useState<any[]>([]);
  const [apiAchievementsStats, setApiAchievementsStats] = useState<any>(null);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  
  // Add a ref to cache previous keyStats values to prevent flickering
  const keyStatsRef = useRef<{
    currentStreak: number;
    totalEntries: number;
    mealConsistencyScore: number;
    achievementsCompleted: number;
    totalAchievements: number;
  } | null>(null);

  // Get date locale based on app language
  const getDateLocale = () => {
    switch (locale) {
      case 'th': return th;
      case 'ja': return ja;
      case 'zh': return zhCN;
      default: return undefined;
    }
  };

  // Get dates for current time range
  const getDatesForTimeRange = () => {
    const today = new Date();
    const endDate = today;
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = subDays(today, 6);
        break;
      case 'month':
        startDate = subDays(today, 29);
        break;
      case '3months':
        startDate = subMonths(today, 3);
        break;
      case '6months':
        startDate = subMonths(today, 6);
        break;
      case 'year':
        startDate = subMonths(today, 12);
        break;
      default:
        startDate = subDays(today, 6);
    }
    
    return { startDate, endDate };
  };

  // Calculate user's current streak (days in a row with entries)
  const getCurrentStreak = useMemo(() => {
    const today = new Date();
    let streak = 0;
    let currentDate = today;
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const log = dailyLogs[dateStr];
      
      if (log && (log.meals.length > 0 || log.waterIntake > 0)) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  }, [dailyLogs]);

  // Calculate meal consistency score (0-100)
  const getMealConsistencyScore = useMemo(() => {
    const { startDate, endDate } = getDatesForTimeRange();
    const totalDays = differenceInDays(endDate, startDate) + 1;
    let daysWithMeals = 0;
    let daysWithAllMeals = 0;
    
    for (let d = 0; d < totalDays; d++) {
      const date = format(addDays(startDate, d), 'yyyy-MM-dd');
      const log = dailyLogs[date];
      
      if (log && log.meals.length > 0) {
        daysWithMeals++;
        
        // Check if user logged all major meal types (breakfast, lunch, dinner)
        const mealTypes = new Set(log.meals.map(meal => meal.mealType));
        if (mealTypes.has('breakfast') && mealTypes.has('lunch') && mealTypes.has('dinner')) {
          daysWithAllMeals++;
        }
      }
    }
    
    // Weight: 60% for logging any meals, 40% for logging all major meals
    const consistencyScore = Math.round((daysWithMeals / totalDays) * 60 + (daysWithAllMeals / totalDays) * 40);
    return Math.min(100, consistencyScore);
  }, [dailyLogs, timeRange]);
  
  // Calculate water streak (days in a row reaching water goal)
  const getWaterStreak = useMemo(() => {
    const today = new Date();
    let streak = 0;
    let currentDate = today;
    const waterGoal = goals.water || 2000;
    
    // Count consecutive days where water intake met the goal
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const log = dailyLogs[dateStr];
      
      if (log && log.waterIntake >= waterGoal) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  }, [dailyLogs, goals.water]);
  
  // Calculate protein achievement (days hitting protein goal)
  const getProteinAchievement = useMemo(() => {
    const last30Days = Array.from({ length: 30 }).map((_, i) => 
      format(subDays(new Date(), i), 'yyyy-MM-dd')
    );
    
    const proteinGoal = goals.protein || 0;
    if (proteinGoal === 0) return { days: 0, progress: 0, complete: false };
    
    const daysHittingGoal = last30Days.filter(date => {
      const log = dailyLogs[date];
      return log && log.totalProtein >= proteinGoal;
    }).length;
    
    const targetDays = 10; // Need 10 days hitting protein goal
    const progress = Math.min(100, (daysHittingGoal / targetDays) * 100);
    const complete = daysHittingGoal >= targetDays;
    
    return { days: daysHittingGoal, progress, complete };
  }, [dailyLogs, goals.protein]);
  
  // Calculate weight tracking achievement (logging weight for 4 consecutive weeks)
  const getWeightTrackingAchievement = useMemo(() => {
    // Direct usage of weightEntries instead of calling a non-existent function
    const weightEntries = dailyLogs ? Object.entries(dailyLogs)
      .filter(([_, log]: [string, any]) => log && log.weight)
      .map(([date, log]: [string, any]) => ({ 
        date, 
        weight: log.weight as number
      })) : [];
      
    if (!weightEntries || weightEntries.length === 0) {
      return { progress: 0, complete: false };
    }
    
    // Get dates of the last 4 weeks (Sunday to Saturday)
    const today = new Date();
    const weeks: Date[][] = [];
    
    for (let i = 0; i < 4; i++) {
      const weekStart = startOfWeek(subWeeks(today, i));
      const weekEnd = endOfWeek(weekStart);
      weeks.push(eachDayOfInterval({ start: weekStart, end: weekEnd }));
    }
    
    // Check if each week has at least one weight entry
    let weeksWithEntries = 0;
    weeks.forEach(week => {
      const weekDates = week.map(date => format(date, 'yyyy-MM-dd'));
      const hasEntryInWeek = weightEntries.some((entry: { date: string; weight: number }) => 
        weekDates.includes(entry.date)
      );
      
      if (hasEntryInWeek) {
        weeksWithEntries++;
      }
    });
    
    const progress = Math.min(100, (weeksWithEntries / 4) * 100);
    const complete = weeksWithEntries >= 4;
    
    return { progress, complete, weeksWithEntries };
  }, [dailyLogs]); // Changed dependency from getWeightEntries to dailyLogs

  // Calculate calorie goal achievement (days hitting calorie goal)
  const getCalorieAchievement = useMemo(() => {
    const last30Days = Array.from({ length: 30 }).map((_, i) => 
      format(subDays(new Date(), i), 'yyyy-MM-dd')
    );
    
    const calorieGoal = goals.calories || 0;
    if (calorieGoal === 0) return { days: 0, progress: 0, complete: false };
    
    // Count days where calories were within 10% of goal (not over or under by too much)
    const daysHittingGoal = last30Days.filter(date => {
      const log = dailyLogs[date];
      if (!log || !log.totalCalories) return false;
      
      const lowerBound = calorieGoal * 0.9;
      const upperBound = calorieGoal * 1.1;
      return log.totalCalories >= lowerBound && log.totalCalories <= upperBound;
    }).length;
    
    const targetDays = 12; // Need 12 days hitting calorie goal
    const progress = Math.min(100, (daysHittingGoal / targetDays) * 100);
    const complete = daysHittingGoal >= targetDays;
    
    return { days: daysHittingGoal, progress, complete };
  }, [dailyLogs, goals.calories]);
  
  // Calculate meal variety achievement
  const getMealVarietyAchievement = useMemo(() => {
    const { startDate, endDate } = getDatesForTimeRange();
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    
    // Track unique food items logged
    const uniqueFoods = new Set();
    
    for (let i = 0; i < daysDiff; i++) {
      const date = format(addDays(startDate, i), 'yyyy-MM-dd');
      const log = dailyLogs[date];
      
      if (log && log.meals && log.meals.length > 0) {
        log.meals.forEach(meal => {
          if (meal.foodItem && meal.foodItem.name) uniqueFoods.add(meal.foodItem.name.toLowerCase());
        });
      }
    }
    
    const uniqueFoodCount = uniqueFoods.size;
    const targetCount = 25; // Target is 25 unique foods
    const progress = Math.min(100, (uniqueFoodCount / targetCount) * 100);
    const complete = uniqueFoodCount >= targetCount;
    
    return { count: uniqueFoodCount, progress, complete };
  }, [dailyLogs, getDatesForTimeRange]);
  
  // Calculate macro balance achievement
  const getMacroBalanceAchievement = useMemo(() => {
    const { startDate, endDate } = getDatesForTimeRange();
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    
    let daysWithGoodBalance = 0;
    
    for (let i = 0; i < daysDiff; i++) {
      const date = format(addDays(startDate, i), 'yyyy-MM-dd');
      const log = dailyLogs[date];
      
      if (log && log.totalCalories > 0) {
        // Calculate macro percentages
        const totalMacroCalories = 
          (log.totalProtein || 0) * 4 + 
          (log.totalCarbs || 0) * 4 + 
          (log.totalFat || 0) * 9;
        
        if (totalMacroCalories > 0) {
          const proteinPercent = ((log.totalProtein || 0) * 4) / totalMacroCalories * 100;
          const carbsPercent = ((log.totalCarbs || 0) * 4) / totalMacroCalories * 100;
          const fatPercent = ((log.totalFat || 0) * 9) / totalMacroCalories * 100;
          
          // Check if macros are reasonably balanced (within healthy ranges)
          const isBalanced = 
            proteinPercent >= 15 && proteinPercent <= 35 &&
            carbsPercent >= 40 && carbsPercent <= 65 &&
            fatPercent >= 20 && fatPercent <= 35;
            
          if (isBalanced) daysWithGoodBalance++;
        }
      }
    }
    
    const targetDays = 7; // Target is 7 days with good macro balance
    const progress = Math.min(100, (daysWithGoodBalance / targetDays) * 100);
    const complete = daysWithGoodBalance >= targetDays;
    
    return { days: daysWithGoodBalance, progress, complete };
  }, [dailyLogs, getDatesForTimeRange]);
  
  // Calculate fiber intake achievement (based on balanced meals instead of fiber which isn't tracked)
  const getFiberAchievement = useMemo(() => {
    const last14Days = Array.from({ length: 14 }).map((_, i) => 
      format(subDays(new Date(), i), 'yyyy-MM-dd')
    );
    
    // Count days with balanced meals (protein, veg, carbs)
    const daysWithBalancedMeals = last14Days.filter(date => {
      const log = dailyLogs[date];
      if (!log || !log.meals || log.meals.length === 0) return false;
      
      // Check if the day's meals include diverse food categories
      const categories = new Set();
      log.meals.forEach(meal => {
        if (meal.foodItem && meal.foodItem.category) {
          categories.add(meal.foodItem.category);
        }
      });
      
      // At least 3 different food categories indicates a balanced day
      return categories.size >= 3;
    }).length;
    
    const targetDays = 7; // Target is 7 days with balanced meals
    const progress = Math.min(100, (daysWithBalancedMeals / targetDays) * 100);
    const complete = daysWithBalancedMeals >= targetDays;
    
    return { days: daysWithBalancedMeals, progress, complete };
  }, [dailyLogs]);

  // Function to fetch data from the stats API
  const fetchStatsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/stats?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStatsData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch stats data');
      }
    } catch (err: any) {
      console.error('Error fetching stats data:', err);
      setError(err.message || 'An error occurred while fetching stats data');
      toast({
        title: locale === 'th' ? 'เกิดข้อผิดพลาด' : locale === 'ja' ? 'エラーが発生しました' : locale === 'zh' ? '发生错误' : 'Error',
        description: err.message || 'Failed to load stats data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Replace the refreshData function to actually refresh all data
  const refreshData = async () => {
    // Refresh both main stats data and achievements data
    await Promise.all([
      fetchStatsData(),
      fetchAchievements()
    ]);
    
    // Show a success toast
    toast({
      title: locale === 'th' ? 'อัปเดตข้อมูลแล้ว' : 
             locale === 'ja' ? 'データが更新されました' : 
             locale === 'zh' ? '数据已更新' : 
             'Data Updated',
      description: locale === 'th' ? 'ข้อมูลสถิติของคุณได้รับการรีเฟรชแล้ว' : 
                  locale === 'ja' ? '統計データが更新されました' : 
                  locale === 'zh' ? '您的统计数据已刷新' : 
                  'Your stats have been refreshed',
      duration: 2000
    });
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchStatsData();
  }, [timeRange]); // Refetch when time range changes

  // Fetch achievements data when component mounts or locale changes
  useEffect(() => {
    fetchAchievements();
  }, [locale]); // Refetch when locale changes to update translations

  // Function to fetch achievements data from API
  const fetchAchievements = async () => {
    try {
      setIsLoadingAchievements(true);
      const response = await fetch('/api/stats/achievements');
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Map API achievements to the format expected by the UI
        const mappedAchievements = data.data.achievements.map((achievement: any) => {
          // Map the type string to the ACHIEVEMENT_TYPES object
          // Use type assertion to fix the indexing issue
          const achievementType = achievement.type as keyof typeof ACHIEVEMENT_TYPES;
          const type = ACHIEVEMENT_TYPES[achievementType] || ACHIEVEMENT_TYPES.MILESTONE;
          
          return {
            ...achievement,
            type,
            // Translate title based on locale
            title: locale === 'th' ? 
              getThaiTitle(achievement.title) : 
              locale === 'ja' ? 
              getJapaneseTitle(achievement.title) : 
              locale === 'zh' ? 
              getChineseTitle(achievement.title) : 
              achievement.title,
            // Translate description based on locale
            description: locale === 'th' ? 
              getThaiDescription(achievement.description) : 
              locale === 'ja' ? 
              getJapaneseDescription(achievement.description) : 
              locale === 'zh' ? 
              getChineseDescription(achievement.description) : 
              achievement.description,
          };
        });
        
        setApiAchievements(mappedAchievements);
        setApiAchievementsStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setIsLoadingAchievements(false);
    }
  };

  // Helper functions for title translations
  const getThaiTitle = (title: string) => {
    switch (title) {
      case 'Current Streak': return 'สถิติต่อเนื่อง';
      case 'Meal Consistency': return 'ความสม่ำเสมอ';
      case 'Hydration Master': return 'ชอบดื่มน้ำ';
      case 'Protein Champion': return 'นักกินโปรตีน';
      case 'Weight Tracker': return 'ติดตามน้ำหนัก';
      default: return title;
    }
  };

  const getJapaneseTitle = (title: string) => {
    switch (title) {
      case 'Current Streak': return '連続記録';
      case 'Meal Consistency': return '一貫性';
      case 'Hydration Master': return '水分摂取マスター';
      case 'Protein Champion': return 'タンパク質マスター';
      case 'Weight Tracker': return '体重記録マスター';
      default: return title;
    }
  };

  const getChineseTitle = (title: string) => {
    switch (title) {
      case 'Current Streak': return '连续记录';
      case 'Meal Consistency': return '一致性';
      case 'Hydration Master': return '水分摄入大师';
      case 'Protein Champion': return '蛋白质大师';
      case 'Weight Tracker': return '体重记录大师';
      default: return title;
    }
  };

  // Helper functions for description translations
  const getThaiDescription = (description: string) => {
    if (description.includes('days in a row')) {
      const days = description.split(' ')[0];
      return `${days} วันติดต่อกัน`;
    }
    
    switch (description) {
      case 'Regularly log all your meals': return 'บันทึกทุกมื้ออาหารเป็นประจำ';
      case 'Reach water goal 7 days in a row': return 'บรรลุเป้าหมายน้ำ 7 วันติดต่อกัน';
      case 'Hit protein targets for 10 days': return 'ได้รับโปรตีนตามเป้าหมาย 10 วัน';
      case 'Log weight for 4 consecutive weeks': return 'บันทึกน้ำหนัก 4 สัปดาห์ติดต่อกัน';
      default: return description;
    }
  };

  const getJapaneseDescription = (description: string) => {
    if (description.includes('days in a row')) {
      const days = description.split(' ')[0];
      return `${days}日連続`;
    }
    
    switch (description) {
      case 'Regularly log all your meals': return '毎日すべての食事を記録する';
      case 'Reach water goal 7 days in a row': return '7日間連続で水分目標を達成';
      case 'Hit protein targets for 10 days': return '10日間タンパク質目標を達成';
      case 'Log weight for 4 consecutive weeks': return '4週連続で体重を記録';
      default: return description;
    }
  };

  const getChineseDescription = (description: string) => {
    if (description.includes('days in a row')) {
      const days = description.split(' ')[0];
      return `连续${days}天`;
    }
    
    switch (description) {
      case 'Regularly log all your meals': return '定期记录所有餐点';
      case 'Reach water goal 7 days in a row': return '连续7天达到水分目标';
      case 'Hit protein targets for 10 days': return '10天达到蛋白质目标';
      case 'Log weight for 4 consecutive weeks': return '连续4周记录体重';
      default: return description;
    }
  };

  // Generate achievement data
  const achievements = useMemo(() => {
    // Use API data if available
    if (apiAchievements.length > 0) {
      return apiAchievements;
    }
    
    // Fallback to mock data
    return [
      {
        id: 'streak',
        title: locale === 'th' ? 'สถิติต่อเนื่อง' : locale === 'ja' ? '連続記録' : locale === 'zh' ? '连续记录' : 'Current Streak',
        description: locale === 'th' ? `${getCurrentStreak} วันติดต่อกัน` : 
                    locale === 'ja' ? `${getCurrentStreak}日連続` : 
                    locale === 'zh' ? `连续${getCurrentStreak}天` : 
                    `${getCurrentStreak} days in a row`,
        type: ACHIEVEMENT_TYPES.STREAK,
        progress: Math.min(100, (getCurrentStreak / 7) * 100),
        date: format(new Date(), 'yyyy-MM-dd'),
        complete: getCurrentStreak >= 7,
      },
      {
        id: 'consistency',
        title: locale === 'th' ? 'ความสม่ำเสมอ' : locale === 'ja' ? '一貫性' : locale === 'zh' ? '一致性' : 'Meal Consistency',
        description: locale === 'th' ? 'บันทึกทุกมื้ออาหารเป็นประจำ' : 
                    locale === 'ja' ? '毎日すべての食事を記録する' : 
                    locale === 'zh' ? '定期记录所有餐点' : 
                    'Regularly log all your meals',
        type: ACHIEVEMENT_TYPES.CONSISTENCY,
        progress: getMealConsistencyScore,
        date: format(new Date(), 'yyyy-MM-dd'),
        complete: getMealConsistencyScore >= 80,
      },
      {
        id: 'hydration',
        title: locale === 'th' ? 'ชอบดื่มน้ำ' : locale === 'ja' ? '水分摂取マスター' : locale === 'zh' ? '水分摄入大师' : 'Hydration Master',
        description: locale === 'th' ? 'บรรลุเป้าหมายน้ำ 7 วันติดต่อกัน' : 
                    locale === 'ja' ? '7日間連続で水分目標を達成' : 
                    locale === 'zh' ? '连续7天达到水分目标' : 
                    'Reach water goal 7 days in a row',
        type: ACHIEVEMENT_TYPES.WATER,
        progress: 71, // Example value
        date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        complete: false,
      },
      {
        id: 'protein',
        title: locale === 'th' ? 'นักกินโปรตีน' : locale === 'ja' ? 'タンパク質マスター' : locale === 'zh' ? '蛋白质大师' : 'Protein Champion',
        description: locale === 'th' ? 'ได้รับโปรตีนตามเป้าหมาย 10 วัน' : 
                    locale === 'ja' ? '10日間タンパク質目標を達成' : 
                    locale === 'zh' ? '10天达到蛋白质目标' : 
                    'Hit protein targets for 10 days',
        type: ACHIEVEMENT_TYPES.NUTRITION,
        progress: 100,
        date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
        complete: true,
      },
      {
        id: 'weight',
        title: locale === 'th' ? 'ติดตามน้ำหนัก' : locale === 'ja' ? '体重記録マスター' : locale === 'zh' ? '体重记录大师' : 'Weight Tracker',
        description: locale === 'th' ? 'บันทึกน้ำหนัก 4 สัปดาห์ติดต่อกัน' : 
                    locale === 'ja' ? '4週連続で体重を記録' : 
                    locale === 'zh' ? '连续4周记录体重' : 
                    'Log weight for 4 consecutive weeks',
        type: ACHIEVEMENT_TYPES.WEIGHT,
        progress: 50,
        date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        complete: false,
      },
    ];
  }, [apiAchievements, locale, getCurrentStreak, getMealConsistencyScore]);

  // Helper function to translate achievement titles
  function translateAchievementTitle(title: string, targetLocale: string): string {
    switch (title) {
      case 'Current Streak':
        return targetLocale === 'th' ? 'สถิติต่อเนื่อง' : 
               targetLocale === 'ja' ? '連続記録' : 
               targetLocale === 'zh' ? '连续记录' : title;
      case 'Meal Consistency':
        return targetLocale === 'th' ? 'ความสม่ำเสมอ' : 
               targetLocale === 'ja' ? '一貫性' : 
               targetLocale === 'zh' ? '一致性' : title;
      case 'Hydration Master':
        return targetLocale === 'th' ? 'ชอบดื่มน้ำ' : 
               targetLocale === 'ja' ? '水分摂取マスター' : 
               targetLocale === 'zh' ? '水分摄入大师' : title;
      case 'Protein Champion':
        return targetLocale === 'th' ? 'นักกินโปรตีน' : 
               targetLocale === 'ja' ? 'タンパク質マスター' : 
               targetLocale === 'zh' ? '蛋白质大师' : title;
      case 'Weight Tracker':
        return targetLocale === 'th' ? 'ติดตามน้ำหนัก' : 
               targetLocale === 'ja' ? '体重記録マスター' : 
               targetLocale === 'zh' ? '体重记录大师' : title;
      default:
        return title;
    }
  }

  // Helper function to translate achievement descriptions
  function translateAchievementDescription(description: string, targetLocale: string): string {
    // If it contains "days in a row", it's likely the streak description
    if (description.includes('days in a row')) {
      const days = description.split(' ')[0];
      return targetLocale === 'th' ? `${days} วันติดต่อกัน` : 
             targetLocale === 'ja' ? `${days}日連続` : 
             targetLocale === 'zh' ? `连续${days}天` : description;
    }
    
    // Match other common descriptions
    switch (description) {
      case 'Regularly log all your meals':
        return targetLocale === 'th' ? 'บันทึกทุกมื้ออาหารเป็นประจำ' : 
               targetLocale === 'ja' ? '毎日すべての食事を記録する' : 
               targetLocale === 'zh' ? '定期记录所有餐点' : description;
      case 'Reach water goal 7 days in a row':
        return targetLocale === 'th' ? 'บรรลุเป้าหมายน้ำ 7 วันติดต่อกัน' : 
               targetLocale === 'ja' ? '7日間連続で水分目標を達成' : 
               targetLocale === 'zh' ? '连续7天达到水分目标' : description;
      case 'Hit protein targets for 10 days':
        return targetLocale === 'th' ? 'ได้รับโปรตีนตามเป้าหมาย 10 วัน' : 
               targetLocale === 'ja' ? '10日間タンパク質目標を達成' : 
               targetLocale === 'zh' ? '10天达到蛋白质目标' : description;
      case 'Log weight for 4 consecutive weeks':
        return targetLocale === 'th' ? 'บันทึกน้ำหนัก 4 สัปดาห์ติดต่อกัน' : 
               targetLocale === 'ja' ? '4週連続で体重を記録' : 
               targetLocale === 'zh' ? '连续4周记录体重' : description;
      default:
        return description;
    }
  }

  // Replace nutrient distribution calculation with data from API
  const nutrientDistribution = useMemo(() => {
    if (statsData?.nutrientDistribution) {
      return statsData.nutrientDistribution.map((item: any) => ({
        ...item,
        name: locale === 'th' ? 
          item.name === 'Protein' ? 'โปรตีน' : 
          item.name === 'Fat' ? 'ไขมัน' : 
          item.name === 'Carbs' ? 'คาร์โบไฮเดรต' : item.name :
          locale === 'ja' ? 
          item.name === 'Protein' ? 'タンパク質' : 
          item.name === 'Fat' ? '脂肪' : 
          item.name === 'Carbs' ? '炭水化物' : item.name :
          locale === 'zh' ? 
          item.name === 'Protein' ? '蛋白质' : 
          item.name === 'Fat' ? '脂肪' : 
          item.name === 'Carbs' ? '碳水化合物' : item.name :
          item.name
      }));
    }
    
    // Fallback to the original calculation
    const { startDate, endDate } = getDatesForTimeRange();
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    
    for (let i = 0; i < daysDiff; i++) {
      const date = format(addDays(startDate, i), 'yyyy-MM-dd');
      const dayLog = dailyLogs[date];
      
      if (dayLog) {
        totalProtein += dayLog.totalProtein || 0;
        totalFat += dayLog.totalFat || 0;
        totalCarbs += dayLog.totalCarbs || 0;
      }
    }
    
    const total = totalProtein + totalFat + totalCarbs;
    
    return [
      { name: locale === 'th' ? 'โปรตีน' : locale === 'ja' ? 'タンパク質' : locale === 'zh' ? '蛋白质' : 'Protein', value: totalProtein, percentage: total > 0 ? Math.round((totalProtein / total) * 100) : 0 },
      { name: locale === 'th' ? 'ไขมัน' : locale === 'ja' ? '脂肪' : locale === 'zh' ? '脂肪' : 'Fat', value: totalFat, percentage: total > 0 ? Math.round((totalFat / total) * 100) : 0 },
      { name: locale === 'th' ? 'คาร์โบไฮเดรต' : locale === 'ja' ? '炭水化物' : locale === 'zh' ? '碳水化合物' : 'Carbs', value: totalCarbs, percentage: total > 0 ? Math.round((totalCarbs / total) * 100) : 0 },
    ];
  }, [statsData, locale, dailyLogs, timeRange]);

  // Update calorie trend data to use API data
  const calorieTrendData = useMemo(() => {
    if (statsData?.calorieTrendData) {
      return statsData.calorieTrendData;
    }
    
    // Fallback to the original calculation
    const { startDate, endDate } = getDatesForTimeRange();
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    const calorieGoal = goals.calories || 2000;
    const result: CalorieTrendItem[] = [];

    // Generate calorie trend data for each day in the range
    for (let i = 0; i < daysDiff; i++) {
      const date = addDays(startDate, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLog = dailyLogs[dateStr];
      
      // Format the date according to the chosen locale
      const formattedDate = format(
        date, 
        timeRange === 'week' ? 'E' : 
        timeRange === 'month' ? 'd' : 
        timeRange === '3months' || timeRange === '6months' ? 'MMM d' : 
        'MMM',
        { locale: getDateLocale() }
      );
      
      result.push({
          date: formattedDate,
        calories: dayLog ? dayLog.totalCalories || 0 : 0,
        goal: calorieGoal
      });
    }
    
    return result;
  }, [statsData, dailyLogs, goals.calories, timeRange, getDateLocale]);

  // Update macro balance data to use API data
  const macroBalanceData = useMemo(() => {
    if (statsData?.macroBalanceData) {
      return statsData.macroBalanceData;
    }
    
    // Fallback to the original calculation
    const { startDate, endDate } = getDatesForTimeRange();
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    
    let daysWithGoodBalance = 0;
    
    for (let i = 0; i < daysDiff; i++) {
      const date = format(addDays(startDate, i), 'yyyy-MM-dd');
      const log = dailyLogs[date];
      
      if (log && log.totalCalories > 0) {
        // Calculate macro percentages
        const totalMacroCalories = 
          (log.totalProtein || 0) * 4 + 
          (log.totalCarbs || 0) * 4 + 
          (log.totalFat || 0) * 9;
        
        if (totalMacroCalories > 0) {
          const proteinPercent = ((log.totalProtein || 0) * 4) / totalMacroCalories * 100;
          const carbsPercent = ((log.totalCarbs || 0) * 4) / totalMacroCalories * 100;
          const fatPercent = ((log.totalFat || 0) * 9) / totalMacroCalories * 100;
          
          // Check if macros are reasonably balanced (within healthy ranges)
          const isBalanced = 
            proteinPercent >= 15 && proteinPercent <= 35 &&
            carbsPercent >= 40 && carbsPercent <= 65 &&
            fatPercent >= 20 && fatPercent <= 35;
            
          if (isBalanced) daysWithGoodBalance++;
        }
      }
    }
    
    const targetDays = 7; // Target is 7 days with good macro balance
    const progress = Math.min(100, (daysWithGoodBalance / targetDays) * 100);
    const complete = daysWithGoodBalance >= targetDays;
    
    return { days: daysWithGoodBalance, progress, complete };
  }, [statsData, dailyLogs, timeRange, getDateLocale]);

  // Update meal distribution data to use API data
  const mealDistributionData = useMemo(() => {
    if (statsData?.mealDistribution) {
      // Translate meal type names
      return {
        byCount: statsData.mealDistribution.byCount.map((item: any) => ({
          ...item,
          name: locale === 'th' ? 
            translateMealType(item.name, 'th') : 
            locale === 'ja' ? 
            translateMealType(item.name, 'ja') : 
            locale === 'zh' ? 
            translateMealType(item.name, 'zh') : 
            item.name
        })),
        byCalories: statsData.mealDistribution.byCalories.map((item: any) => ({
          ...item,
          name: locale === 'th' ? 
            translateMealType(item.name, 'th') : 
            locale === 'ja' ? 
            translateMealType(item.name, 'ja') : 
            locale === 'zh' ? 
            translateMealType(item.name, 'zh') : 
            item.name
        }))
      };
    }
    
    // Fallback to the original calculation
    const { startDate, endDate } = getDatesForTimeRange();
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    
    return {
      byCount: [
        { name: 'Breakfast', count: 5 },
        { name: 'Lunch', count: 7 },
        { name: 'Dinner', count: 6 },
        { name: 'Snacks', count: 4 }
      ] as MealDistributionItem[],
      byCalories: [
        { name: 'Breakfast', calories: 450 },
        { name: 'Lunch', calories: 650 },
        { name: 'Dinner', calories: 550 },
        { name: 'Snacks', calories: 250 }
      ] as MealDistributionItem[]
    };
  }, [statsData, dailyLogs, locale, timeRange]);

  // Helper function to translate meal types
  function translateMealType(type: string, targetLocale: string): string {
    switch (type) {
      case 'Morning':
        return targetLocale === 'th' ? 'เช้า' :
               targetLocale === 'ja' ? '朝食' :
               targetLocale === 'zh' ? '早餐' : type;
      case 'Afternoon':
        return targetLocale === 'th' ? 'กลางวัน' :
               targetLocale === 'ja' ? '昼食' :
               targetLocale === 'zh' ? '午餐' : type;
      case 'Evening':
        return targetLocale === 'th' ? 'เย็น' :
               targetLocale === 'ja' ? '夕食' :
               targetLocale === 'zh' ? '晚餐' : type;
      case 'Snack':
        return targetLocale === 'th' ? 'ของว่าง' :
               targetLocale === 'ja' ? 'おやつ' :
               targetLocale === 'zh' ? '零食' : type;
      default:
        return type;
    }
  }

  // Update nutrition radar data to use API data
  const nutritionRadarData = useMemo(() => {
    if (statsData?.nutritionRadarData) {
      return statsData.nutritionRadarData.map((item: any) => ({
        ...item,
        subject: locale === 'th' ? 
          item.subject === 'Protein' ? 'โปรตีน' : 
          item.subject === 'Fat' ? 'ไขมัน' : 
          item.subject === 'Carbs' ? 'คาร์โบไฮเดรต' : 
          item.subject === 'Calories' ? 'แคลอรี่' : item.subject :
          locale === 'ja' ? 
          item.subject === 'Protein' ? 'タンパク質' : 
          item.subject === 'Fat' ? '脂肪' : 
          item.subject === 'Carbs' ? '炭水化物' : 
          item.subject === 'Calories' ? 'カロリー' : item.subject :
          locale === 'zh' ? 
          item.subject === 'Protein' ? '蛋白质' : 
          item.subject === 'Fat' ? '脂肪' : 
          item.subject === 'Carbs' ? '碳水化合物' : 
          item.subject === 'Calories' ? '卡路里' : item.subject :
          item.subject
      }));
    }
    
    // This data compares user's average intake with recommended values
    const { startDate, endDate } = getDatesForTimeRange();
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    
    return [
      { subject: 'Protein', user: 80, recommended: 100, fullMark: 150 },
      { subject: 'Carbs', user: 95, recommended: 100, fullMark: 150 },
      { subject: 'Fat', user: 85, recommended: 100, fullMark: 150 },
      { subject: 'Fiber', user: 60, recommended: 100, fullMark: 150 },
      { subject: 'Vitamins', user: 70, recommended: 100, fullMark: 150 }
    ];
  }, [statsData, dailyLogs, goals, locale, timeRange]);

  // Add KeyStats component from API data with caching to prevent flickering
  const keyStats = useMemo(() => {
    let newStats;
    
    if (statsData?.keyStats) {
      newStats = {
        currentStreak: statsData.keyStats.currentStreak,
        totalEntries: statsData.keyStats.totalEntries,
        mealConsistencyScore: statsData.keyStats.mealConsistencyScore,
        achievementsCompleted: statsData.keyStats.achievementsCompleted,
        totalAchievements: statsData.keyStats.totalAchievements
      };
    } else {
      // Use fallback data only if we don't have cached data or for the first render
      newStats = {
        currentStreak: getCurrentStreak,
        totalEntries: Object.values(dailyLogs).reduce((sum, log) => sum + (log.meals?.length || 0), 0),
        mealConsistencyScore: getMealConsistencyScore,
        achievementsCompleted: achievements.filter(a => a.complete).length,
        totalAchievements: achievements.length
      };
    }
    
    // Only update the ref if we have data from API or if ref is null (first render)
    if (statsData?.keyStats || keyStatsRef.current === null) {
      keyStatsRef.current = newStats;
    }
    
    // Return the cached value to prevent flickering during loading
    return keyStatsRef.current;
  }, [statsData, getCurrentStreak, dailyLogs, getMealConsistencyScore, achievements]);

  // Add topFoods data from API
  const topFoods = useMemo(() => {
    if (statsData?.topFoods && statsData.topFoods.length > 0) {
      return statsData.topFoods.map((food: any) => ({
        name: locale === 'th' ? translateFoodName(food.name, 'th') : 
             locale === 'ja' ? translateFoodName(food.name, 'ja') : 
             locale === 'zh' ? translateFoodName(food.name, 'zh') : 
             food.name,
        count: food.count,
        calories: food.calories,
        icon: food.icon
      }));
    }

    // Fallback to mock data
    return [
      {
        name: locale === 'th' ? 'ไข่' : locale === 'ja' ? '卵' : locale === 'zh' ? '鸡蛋' : 'Eggs', 
        count: 14, 
        calories: 70,
        icon: '🥚'
      },
      { 
        name: locale === 'th' ? 'อกไก่' : locale === 'ja' ? '鶏の胸肉' : locale === 'zh' ? '鸡胸肉' : 'Chicken Breast', 
        count: 9, 
        calories: 165,
        icon: '🍗'
      },
      { 
        name: locale === 'th' ? 'ข้าว' : locale === 'ja' ? 'ご飯' : locale === 'zh' ? '米饭' : 'Rice', 
        count: 8, 
        calories: 130,
        icon: '🍚'
      },
      { 
        name: locale === 'th' ? 'กล้วย' : locale === 'ja' ? 'バナナ' : locale === 'zh' ? '香蕉' : 'Banana', 
        count: 7, 
        calories: 105,
        icon: '🍌'
      },
      { 
        name: locale === 'th' ? 'ขนมปัง' : locale === 'ja' ? 'パン' : locale === 'zh' ? '面包' : 'Bread', 
        count: 6, 
        calories: 80,
        icon: '🍞'
      },
    ];
  }, [statsData, locale]);

  // Helper function to translate common food names
  function translateFoodName(name: string, targetLocale: string): string {
    // This is a simple example, in a real app you would have a more comprehensive translation system
    const commonFoods: Record<string, Record<string, string>> = {
      'Chicken Breast': {
        'th': 'อกไก่',
        'ja': '鶏の胸肉',
        'zh': '鸡胸肉'
      },
      'Rice': {
        'th': 'ข้าว',
        'ja': 'ご飯',
        'zh': '米饭'
      },
      'Eggs': {
        'th': 'ไข่',
        'ja': '卵',
        'zh': '鸡蛋'
      },
      'Banana': {
        'th': 'กล้วย',
        'ja': 'バナナ',
        'zh': '香蕉'
      },
      'Bread': {
        'th': 'ขนมปัง',
        'ja': 'パン',
        'zh': '面包'
      }
    };

    return commonFoods[name]?.[targetLocale] || name;
  }

  // Calculate if page is in loading state - always false since we use real data directly
  const pageIsLoading = false;

  // Get time range label
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': 
        return locale === 'th' ? 'สัปดาห์นี้' : locale === 'ja' ? '今週' : locale === 'zh' ? '本周' : 'This Week';
      case 'month': 
        return locale === 'th' ? 'เดือนนี้' : locale === 'ja' ? '今月' : locale === 'zh' ? '本月' : 'This Month';
      case '3months': 
        return locale === 'th' ? '3 เดือน' : locale === 'ja' ? '3ヶ月' : locale === 'zh' ? '3个月' : '3 Months';
      case '6months': 
        return locale === 'th' ? '6 เดือน' : locale === 'ja' ? '6ヶ月' : locale === 'zh' ? '6个月' : '6 Months';
      case 'year': 
        return locale === 'th' ? 'ปีนี้' : locale === 'ja' ? '今年' : locale === 'zh' ? '今年' : 'This Year';
      default: 
        return 'Custom';
    }
  };

  // Update the JSX to use the loading state
  return (
    <motion.div 
      className="max-w-md mx-auto min-h-screen pb-32"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ซ่อน loading indicator แบบเดียวกับหน้า dashboard */}
      {isLoading && false && (
        <div className="p-4 text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            {locale === 'th' ? 'กำลังโหลดข้อมูล...' : 
             locale === 'ja' ? 'データを読み込んでいます...' : 
             locale === 'zh' ? '正在加载数据...' : 
             'Loading data...'}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 my-4 bg-destructive/10 rounded-lg text-center">
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={fetchStatsData}
          >
            {locale === 'th' ? 'ลองอีกครั้ง' : 
             locale === 'ja' ? '再試行' : 
             locale === 'zh' ? '重试' : 
             'Try Again'}
          </Button>
        </div>
      )}

      {/* Header with tabs */}
      <motion.div variants={item} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">
            {locale === 'th' ? 'การวิเคราะห์' : 
             locale === 'ja' ? '分析' : 
             locale === 'zh' ? '分析' : 'Stats'}
          </h1>
          <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 whitespace-nowrap">
                {getTimeRangeLabel()}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeRange("week")}>
                {locale === 'th' ? 'สัปดาห์นี้' : locale === 'ja' ? '今週' : locale === 'zh' ? '本周' : 'This Week'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("month")}>
                {locale === 'th' ? 'เดือนนี้' : locale === 'ja' ? '今月' : locale === 'zh' ? '本月' : 'This Month'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("3months")}>
                {locale === 'th' ? '3 เดือน' : locale === 'ja' ? '3ヶ月' : locale === 'zh' ? '3个月' : '3 Months'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("6months")}>
                {locale === 'th' ? '6 เดือน' : locale === 'ja' ? '6ヶ月' : locale === 'zh' ? '6个月' : '6 Months'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("year")}>
                {locale === 'th' ? 'ปีนี้' : locale === 'ja' ? '今年' : locale === 'zh' ? '今年' : 'This Year'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="text-xs">
              <Activity className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">
                {locale === 'th' ? 'ภาพรวม' : locale === 'ja' ? '概要' : locale === 'zh' ? '概览' : 'Overview'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="text-xs">
              <PieChartIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">
                {locale === 'th' ? 'โภชนาการ' : locale === 'ja' ? '栄養素' : locale === 'zh' ? '营养素' : 'Nutrition'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="meals" className="text-xs">
              <Utensils className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">
                {locale === 'th' ? 'มื้ออาหาร' : locale === 'ja' ? '食事' : locale === 'zh' ? '餐食' : 'Meals'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-xs">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">
                {locale === 'th' ? 'แนวโน้ม' : locale === 'ja' ? '傾向' : locale === 'zh' ? '趋势' : 'Trends'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs">
              <Trophy className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">
                {locale === 'th' ? 'ความสำเร็จ' : locale === 'ja' ? '実績' : locale === 'zh' ? '成就' : 'Awards'}
              </span>
            </TabsTrigger>
          </TabsList>
          
          {/* Content tabs */}
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-4">
            {/* Key Stats Overview */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">
                    {locale === 'th' ? 'สถิติสำคัญ' : 
                     locale === 'ja' ? '主要な統計' : 
                     locale === 'zh' ? '主要统计' : 
                     'Key Statistics'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-px bg-muted">
                    <div className="p-4 bg-card flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        {locale === 'th' ? 'ติดต่อกัน' : 
                         locale === 'ja' ? '連続' : 
                         locale === 'zh' ? '连续' : 
                         'Current Streak'}
                      </span>
                      <span className="text-2xl font-bold">
                        {keyStats.currentStreak} <span className="text-sm font-normal">{locale === 'th' ? 'วัน' : locale === 'ja' ? '日' : locale === 'zh' ? '天' : 'days'}</span>
                      </span>
                    </div>
                    <div className="p-4 bg-card flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <SquareStack className="h-3.5 w-3.5 text-blue-500" />
                        {locale === 'th' ? 'บันทึกรวม' : 
                         locale === 'ja' ? '合計記録' : 
                         locale === 'zh' ? '总记录' : 
                         'Total Entries'}
                      </span>
                      <span className="text-2xl font-bold">
                        {keyStats.totalEntries}
                      </span>
                    </div>
                    <div className="p-4 bg-card flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Target className="h-3.5 w-3.5 text-green-500" />
                        {locale === 'th' ? 'ความสม่ำเสมอ' : 
                         locale === 'ja' ? '一貫性' : 
                         locale === 'zh' ? '一致性' : 
                         'Consistency'}
                      </span>
                      <span className="text-2xl font-bold">
                        {keyStats.mealConsistencyScore}<span className="text-sm font-normal">%</span>
                      </span>
                    </div>
                    <div className="p-4 bg-card flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Medal className="h-3.5 w-3.5 text-amber-500" />
                        {locale === 'th' ? 'ความสำเร็จ' : 
                         locale === 'ja' ? '達成' : 
                         locale === 'zh' ? '成就' : 
                         'Achievements'}
                      </span>
                      <span className="text-2xl font-bold">
                        {keyStats.achievementsCompleted}/{keyStats.totalAchievements}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Weekly Calorie Trends Chart */}
            <motion.div variants={item}>
              <motion.div
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                className="h-full"
              >
                <Card className="overflow-hidden h-full">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">
                      {locale === 'th' ? 'แนวโน้มแคลอรี่' : 
                        locale === 'ja' ? 'カロリー傾向' : 
                        locale === 'zh' ? '卡路里趋势' : 
                        'Calorie Trends'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={calorieTrendData.slice(-7)} // Show last 7 data points
                                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <defs>
                            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                          <XAxis 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))" 
                            tickLine={false}
                            axisLine={false}
                            dy={5}
                            tick={{ fontSize: 10, fontWeight: 500 }}
                            tickMargin={8}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            tickLine={false}
                            axisLine={false}
                            dx={-5}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => value === 0 ? '' : value.toString()}
                            width={30}
                          />
                          <Tooltip 
                            contentStyle={TOOLTIPS.contentStyle}
                            itemStyle={TOOLTIPS.itemStyle}
                            labelStyle={TOOLTIPS.labelStyle}
                            cursor={TOOLTIPS.cursor}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="calories" 
                            stroke={COLORS[0]} 
                            strokeWidth={2}
                            fill="url(#colorCalories)" 
                            name={locale === 'th' ? 'แคลอรี่' : locale === 'ja' ? 'カロリー' : locale === 'zh' ? '卡路里' : 'Calories'} 
                            activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[0] }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="goal" 
                            stroke="hsl(var(--muted-foreground))" 
                            strokeDasharray="5 5" 
                            strokeWidth={1.5}
                            dot={false}
                            name={locale === 'th' ? 'เป้าหมาย' : locale === 'ja' ? '目標' : locale === 'zh' ? '目标' : 'Goal'} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            
            {/* Nutrient Distribution */}
            <motion.div variants={item}>
              <motion.div
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                className="h-full"
              >
                <Card className="overflow-hidden h-full">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">
                      {locale === 'th' ? 'สัดส่วนสารอาหาร' : 
                       locale === 'ja' ? '栄養素の割合' : 
                       locale === 'zh' ? '营养分布' : 
                       'Nutrient Distribution'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/2 h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                                  {nutrientDistribution.map((entry: NutrientDistributionItem, index: number) => (
                                <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                                  <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6} />
                                </linearGradient>
                              ))}
                            </defs>
                            <Pie
                              data={nutrientDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                              strokeWidth={1}
                              stroke="hsl(var(--background))"
                              animationBegin={200}
                              animationDuration={1000}
                              animationEasing="ease-out"
                            >
                                  {nutrientDistribution.map((entry: NutrientDistributionItem, index: number) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={TOOLTIPS.contentStyle}
                              itemStyle={TOOLTIPS.itemStyle}
                              labelStyle={TOOLTIPS.labelStyle}
                              formatter={(value: any, name: string, props: any) => [
                                `${Math.round(value)}g (${props.payload.percentage}%)`, 
                                name
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full md:w-1/2 flex flex-col justify-center p-4 space-y-3">
                            {nutrientDistribution.map((item: NutrientDistributionItem, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <div className="text-sm flex-1">{item.name}</div>
                            <div className="text-sm font-medium">{item.percentage}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            
            {/* Latest Achievements */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>
                      {locale === 'th' ? 'ความสำเร็จล่าสุด' : 
                      locale === 'ja' ? '最近の実績' : 
                      locale === 'zh' ? '最近成就' : 
                      'Latest Achievements'}
                    </span>
                    <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => setActiveTab("achievements")}>
                      {locale === 'th' ? 'ดูทั้งหมด' : 
                      locale === 'ja' ? 'すべて表示' : 
                      locale === 'zh' ? '查看全部' : 
                      'View All'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {achievements
                          .sort((a: Achievement, b: Achievement) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 3)
                          .map((achievement: Achievement, i: number) => (
                        <div key={i} className="flex items-center px-4 py-3 gap-3">
                          <div className={`h-9 w-9 rounded-full ${achievement.type.color} flex items-center justify-center text-white`}>
                            {achievement.type.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{achievement.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {achievement.complete ? (
                              <Badge className="bg-green-500">
                                {locale === 'th' ? 'สำเร็จ' : 
                                locale === 'ja' ? '達成' : 
                                locale === 'zh' ? '完成' : 
                                'Complete'}
                              </Badge>
                            ) : (
                              <div className="w-[70px] h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary"
                                  style={{ width: `${achievement.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* Meals Tab */}
          <TabsContent value="meals" className="mt-0 space-y-4">
            {/* Meal Distribution Chart */}
            <motion.div variants={item}>
              <motion.div
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                className="h-full"
              >
                <Card className="overflow-hidden h-full">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">
                      {locale === 'th' ? 'การกระจายมื้ออาหาร' : 
                       locale === 'ja' ? '食事の分布' : 
                       locale === 'zh' ? '餐食分布' : 
                       'Meal Distribution'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/2 h-[240px] p-2">
                        <h3 className="text-sm font-medium text-center mb-2">
                          {locale === 'th' ? 'จำนวนมื้อรวม' : 
                           locale === 'ja' ? '合計食事回数' : 
                           locale === 'zh' ? '总餐食次数' : 
                           'Meal Count'}
                        </h3>
                        <ResponsiveContainer width="100%" height="85%">
                          <BarChart data={mealDistributionData.byCount}>
                            <defs>
                              {mealDistributionData.byCount.map((entry: MealDistributionItem, index: number) => (
                                <linearGradient 
                                  key={`barGradient-${index}`} 
                                  id={`barGradient-${index}`} 
                                  x1="0" y1="0" x2="0" y2="1"
                                >
                                  <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9}/>
                                  <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6}/>
                                </linearGradient>
                              ))}
                            </defs>
                            <XAxis 
                              dataKey="name" 
                              stroke="hsl(var(--muted-foreground))" 
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              stroke="hsl(var(--muted-foreground))" 
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip 
                              contentStyle={TOOLTIPS.contentStyle}
                              itemStyle={TOOLTIPS.itemStyle}
                              formatter={(value: any) => [value, locale === 'th' ? 'มื้อ' : locale === 'ja' ? '食事' : locale === 'zh' ? '餐' : 'meals']}
                            />
                            <Bar 
                              dataKey="value" 
                              fill="url(#barGradient)"
                              radius={BAR_STYLE.radius}
                              animationDuration={BAR_STYLE.animationDuration}
                              animationEasing={BAR_STYLE.animationEasing}
                            >
                              {mealDistributionData.byCount.map((entry: MealDistributionItem, index: number) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={`url(#barGradient-${index})`}
                                  stroke={COLORS[index % COLORS.length]}
                                  strokeWidth={BAR_STYLE.strokeWidth}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full md:w-1/2 h-[240px] p-2">
                        <h3 className="text-sm font-medium text-center mb-2">
                          {locale === 'th' ? 'แคลอรี่เฉลี่ยต่อมื้อ' : 
                           locale === 'ja' ? '食事あたりの平均カロリー' : 
                           locale === 'zh' ? '每餐平均卡路里' : 
                           'Average Calories per Meal'}
                        </h3>
                        <ResponsiveContainer width="100%" height="85%">
                          <BarChart data={mealDistributionData.byCalories}>
                            <defs>
                              {mealDistributionData.byCalories.map((entry: MealDistributionItem, index: number) => (
                                <linearGradient 
                                  key={`barGradientCal-${index}`} 
                                  id={`barGradientCal-${index}`} 
                                  x1="0" y1="0" x2="0" y2="1"
                                >
                                  <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9}/>
                                  <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6}/>
                                </linearGradient>
                              ))}
                            </defs>
                            <XAxis 
                              dataKey="name" 
                              stroke="hsl(var(--muted-foreground))" 
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 10, fontWeight: 500 }}
                              tickMargin={8}
                            />
                            <YAxis 
                              stroke="hsl(var(--muted-foreground))" 
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => value === 0 ? '' : value.toString()}
                              width={30}
                            />
                            <Tooltip 
                              contentStyle={TOOLTIPS.contentStyle}
                              itemStyle={TOOLTIPS.itemStyle}
                              labelStyle={TOOLTIPS.labelStyle}
                              formatter={(value: any) => [value, 'kcal']}
                            />
                            <Bar 
                              dataKey="value" 
                              radius={BAR_STYLE.radius}
                              animationDuration={BAR_STYLE.animationDuration}
                              animationEasing={BAR_STYLE.animationEasing}
                              name={locale === 'th' ? 'แคลอรี่' : locale === 'ja' ? 'カロリー' : locale === 'zh' ? '卡路里' : 'Calories'}
                            >
                              {mealDistributionData.byCalories.map((entry: MealDistributionItem, index: number) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={`url(#barGradientCal-${index})`}
                                  stroke={COLORS[index % COLORS.length]}
                                  strokeWidth={BAR_STYLE.strokeWidth}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <p className="text-xs text-center text-muted-foreground">
                        {locale === 'th' ? 'ข้อมูลจาก' : locale === 'ja' ? 'データ期間：' : locale === 'zh' ? '数据基于' : 'Data based on'} {getTimeRangeLabel()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            
            {/* Top Foods */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">
                    {locale === 'th' ? 'อาหารยอดนิยม' : 
                     locale === 'ja' ? '人気の食品' : 
                     locale === 'zh' ? '热门食物' : 
                     'Top Foods'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {topFoods.map((food: { icon: React.ReactNode; name: string; count: number; calories: number }, i: number) => (
                      <div key={i} className="flex items-center p-4 gap-3">
                        <div className="text-2xl">{food.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{food.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {food.count} {locale === 'th' ? 'ครั้ง' : locale === 'ja' ? '回' : locale === 'zh' ? '次' : 'times'} • {food.calories} kcal/{locale === 'th' ? 'หน่วย' : locale === 'ja' ? '一食分' : locale === 'zh' ? '份' : 'serving'}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="secondary">
                            #{i+1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Meal Timing Patterns */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">
                    {locale === 'th' ? 'รูปแบบเวลาทานอาหาร' : 
                     locale === 'ja' ? '食事時間のパターン' : 
                     locale === 'zh' ? '用餐时间模式' : 
                     'Meal Timing Patterns'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="relative h-14 bg-muted rounded-lg mb-4">
                      <div className="absolute top-0 bottom-0 left-[8%] w-[12%] bg-blue-500/60 rounded"></div>
                      <div className="absolute top-0 bottom-0 left-[35%] w-[15%] bg-green-500/60 rounded"></div>
                      <div className="absolute top-0 bottom-0 left-[65%] w-[14%] bg-yellow-500/60 rounded"></div>
                      <div className="absolute top-0 bottom-0 left-[87%] w-[8%] bg-red-500/60 rounded"></div>
                      <div className="absolute -bottom-6 left-0 text-xs">6AM</div>
                      <div className="absolute -bottom-6 left-1/4 text-xs">12PM</div>
                      <div className="absolute -bottom-6 left-1/2 text-xs">6PM</div>
                      <div className="absolute -bottom-6 left-3/4 text-xs">12AM</div>
                      <div className="absolute -bottom-6 right-0 text-xs">6AM</div>
                    </div>
                    <div className="pt-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-blue-500/60 rounded"></div>
                        <span className="text-sm">
                          {locale === 'th' ? 'เช้า' : locale === 'ja' ? '朝食' : locale === 'zh' ? '早餐' : 'Breakfast'} (6-10 AM)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-green-500/60 rounded"></div>
                        <span className="text-sm">
                          {locale === 'th' ? 'กลางวัน' : locale === 'ja' ? '昼食' : locale === 'zh' ? '午餐' : 'Lunch'} (11 AM-3 PM)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-yellow-500/60 rounded"></div>
                        <span className="text-sm">
                          {locale === 'th' ? 'เย็น' : locale === 'ja' ? '夕食' : locale === 'zh' ? '晚餐' : 'Dinner'} (5-9 PM)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-red-500/60 rounded"></div>
                        <span className="text-sm">
                          {locale === 'th' ? 'ของว่าง' : locale === 'ja' ? 'おやつ' : locale === 'zh' ? '零食' : 'Snacks'} (other times)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* Trends Tab */}
          <TabsContent value="trends" className="mt-0 space-y-4">
            {/* Calorie Trends Chart */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">
                    {locale === 'th' ? 'แนวโน้มแคลอรี่ตามเวลา' : 
                     locale === 'ja' ? '時間によるカロリー傾向' : 
                     locale === 'zh' ? '卡路里随时间趋势' : 
                     'Calorie Trends Over Time'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart 
                        data={calorieTrendData}
                        margin={{ top: 10, right: 20, bottom: 25, left: 0 }}
                      >
                        <defs>
                          <linearGradient id="trendBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.9}/>
                            <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0.5}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                        <XAxis 
                          dataKey="name" 
                          stroke="hsl(var(--muted-foreground))" 
                          angle={-45} 
                          textAnchor="end" 
                          height={50}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={TOOLTIPS.contentStyle}
                          itemStyle={TOOLTIPS.itemStyle}
                          labelStyle={TOOLTIPS.labelStyle}
                          cursor={TOOLTIPS.cursor}
                        />
                        <Legend 
                          iconType="circle" 
                          iconSize={8}
                          wrapperStyle={{ paddingTop: 10 }}
                        />
                        <Bar 
                          dataKey="calories" 
                          fill="url(#trendBarGradient)"
                          stroke={COLORS[0]}
                          strokeWidth={BAR_STYLE.strokeWidth}
                          name={locale === 'th' ? 'แคลอรี่' : locale === 'ja' ? 'カロリー' : locale === 'zh' ? '卡路里' : 'Calories'} 
                          radius={BAR_STYLE.radius}
                          animationDuration={BAR_STYLE.animationDuration}
                          animationEasing={BAR_STYLE.animationEasing}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="goal" 
                          stroke={COLORS[3]}
                          strokeWidth={2}
                          strokeDasharray="5 5" 
                          dot={false}
                          name={locale === 'th' ? 'เป้าหมาย' : locale === 'ja' ? '目標' : locale === 'zh' ? '目标' : 'Goal'} 
                          animationDuration={1500}
                          animationEasing="ease-out"
                          animationBegin={300}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Weekly vs Monthly Comparison */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-lg mb-2 sm:mb-0">
                    {locale === 'th' ? 'เปรียบเทียบรายสัปดาห์/รายเดือน' : 
                     locale === 'ja' ? '週間/月間比較' : 
                     locale === 'zh' ? '周/月比较' : 
                     'Weekly vs Monthly Comparison'}
                  </CardTitle>
                  <div className="text-sm mb-4 sm:mb-0">
                    {isCompareMode ? (
                      <Button variant="outline" size="sm" className="h-8" onClick={() => setIsCompareMode(false)}>
                        {locale === 'th' ? 'ยกเลิกการเปรียบเทียบ' : 
                         locale === 'ja' ? '比較をキャンセル' : 
                         locale === 'zh' ? '取消比较' : 
                         'Cancel Comparison'}
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="h-8" onClick={() => setIsCompareMode(true)}>
                        {locale === 'th' ? 'เปรียบเทียบช่วงเวลา' : 
                         locale === 'ja' ? '期間を比較する' : 
                         locale === 'zh' ? '比较时间段' : 
                         'Compare Periods'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[280px]">
                      <h3 className="text-sm font-medium mb-2">
                        {isCompareMode 
                          ? (locale === 'th' ? 'เปรียบเทียบแคลอรี่' : locale === 'ja' ? 'カロリー比較' : locale === 'zh' ? '卡路里比较' : 'Calories Comparison')
                          : (locale === 'th' ? 'แคลอรี่เฉลี่ย' : locale === 'ja' ? '平均カロリー' : locale === 'zh' ? '平均卡路里' : 'Average Calories')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-3 bg-muted/40">
                          <p className="text-xs text-muted-foreground">
                            {isCompareMode 
                              ? (locale === 'th' ? 'ช่วงปัจจุบัน' : locale === 'ja' ? '現在の期間' : locale === 'zh' ? '当前时段' : 'Current Period') 
                              : (locale === 'th' ? 'รายสัปดาห์' : locale === 'ja' ? '週間' : locale === 'zh' ? '每周' : 'Weekly')}
                          </p>
                          <p className="text-xl font-bold">{isCompareMode ? "1,754" : "1,876"}</p>
                          <p className="text-xs text-muted-foreground">
                            {goals.calories > 0 && (
                              <>
                                {isCompareMode ? "88" : "94"}% {locale === 'th' ? 'ของเป้าหมาย' : locale === 'ja' ? '目標の' : locale === 'zh' ? '目标的' : 'of goal'}
                              </>
                            )}
                          </p>
                        </Card>
                        <Card className="p-3 bg-muted/40">
                          <p className="text-xs text-muted-foreground">
                            {isCompareMode 
                              ? (locale === 'th' ? 'ช่วงก่อนหน้า' : locale === 'ja' ? '前の期間' : locale === 'zh' ? '上一时段' : 'Previous Period') 
                              : (locale === 'th' ? 'รายเดือน' : locale === 'ja' ? '月間' : locale === 'zh' ? '每月' : 'Monthly')}
                          </p>
                          <p className="text-xl font-bold">{isCompareMode ? "1,954" : "1,820"}</p>
                          <p className="text-xs text-muted-foreground">
                            {goals.calories > 0 && (
                              <>
                                {isCompareMode ? "98" : "91"}% {locale === 'th' ? 'ของเป้าหมาย' : locale === 'ja' ? '目標の' : locale === 'zh' ? '目标的' : 'of goal'}
                              </>
                            )}
                          </p>
                        </Card>
                      </div>
                      {isCompareMode && (
                        <div className="mt-2 p-2 bg-muted/40 rounded-md flex items-center">
                          <ArrowDown className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">
                            <span className="font-medium text-green-500">10.2%</span> {locale === 'th' ? 'ลดลง' : locale === 'ja' ? '減少' : locale === 'zh' ? '减少' : 'decrease'} {locale === 'th' ? 'จากช่วงก่อนหน้า' : locale === 'ja' ? '前期間から' : locale === 'zh' ? '较上一时段' : 'from previous period'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-[280px]">
                      <h3 className="text-sm font-medium mb-2">
                        {isCompareMode 
                          ? (locale === 'th' ? 'เปรียบเทียบโปรตีน' : locale === 'ja' ? 'タンパク質比較' : locale === 'zh' ? '蛋白质比较' : 'Protein Comparison')
                          : (locale === 'th' ? 'โปรตีนเฉลี่ย' : locale === 'ja' ? '平均タンパク質' : locale === 'zh' ? '平均蛋白质' : 'Average Protein')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-3 bg-muted/40">
                          <p className="text-xs text-muted-foreground">
                            {isCompareMode 
                              ? (locale === 'th' ? 'ช่วงปัจจุบัน' : locale === 'ja' ? '現在の期間' : locale === 'zh' ? '当前时段' : 'Current Period') 
                              : (locale === 'th' ? 'รายสัปดาห์' : locale === 'ja' ? '週間' : locale === 'zh' ? '每周' : 'Weekly')}
                          </p>
                          <p className="text-xl font-bold">{isCompareMode ? "98.2" : "102.4"}g</p>
                          <p className="text-xs text-muted-foreground">
                            {goals.protein > 0 && (
                              <>
                                {isCompareMode ? "92" : "96"}% {locale === 'th' ? 'ของเป้าหมาย' : locale === 'ja' ? '目標の' : locale === 'zh' ? '目标的' : 'of goal'}
                              </>
                            )}
                          </p>
                        </Card>
                        <Card className="p-3 bg-muted/40">
                          <p className="text-xs text-muted-foreground">
                            {isCompareMode 
                              ? (locale === 'th' ? 'ช่วงก่อนหน้า' : locale === 'ja' ? '前の期間' : locale === 'zh' ? '上一时段' : 'Previous Period') 
                              : (locale === 'th' ? 'รายเดือน' : locale === 'ja' ? '月間' : locale === 'zh' ? '每月' : 'Monthly')}
                          </p>
                          <p className="text-xl font-bold">{isCompareMode ? "85.6" : "92.8"}g</p>
                          <p className="text-xs text-muted-foreground">
                            {goals.protein > 0 && (
                              <>
                                {isCompareMode ? "80" : "87"}% {locale === 'th' ? 'ของเป้าหมาย' : locale === 'ja' ? '目標の' : locale === 'zh' ? '目标的' : 'of goal'}
                              </>
                            )}
                          </p>
                        </Card>
                      </div>
                      {isCompareMode && (
                        <div className="mt-2 p-2 bg-muted/40 rounded-md flex items-center">
                          <ArrowUp className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm">
                            <span className="font-medium text-blue-500">14.7%</span> {locale === 'th' ? 'เพิ่มขึ้น' : locale === 'ja' ? '増加' : locale === 'zh' ? '增加' : 'increase'} {locale === 'th' ? 'จากช่วงก่อนหน้า' : locale === 'ja' ? '前期間から' : locale === 'zh' ? '较上一时段' : 'from previous period'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="mt-0 space-y-4">
            {/* Nutrient Radar Chart */}
            <motion.div variants={item}>
              <motion.div
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                className="h-full"
              >
                <Card className="overflow-hidden h-full">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">
                      {locale === 'th' ? 'เปรียบเทียบกับเป้าหมาย' : 
                       locale === 'ja' ? '目標との比較' : 
                       locale === 'zh' ? '目标对比' : 
                       'Nutrient Goals Comparison'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-3/5 h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={nutritionRadarData}>
                            <PolarGrid 
                              stroke="hsl(var(--border))" 
                              strokeOpacity={0.5}
                              strokeDasharray="2 3"
                            />
                            <PolarAngleAxis 
                              dataKey="subject" 
                              stroke="hsl(var(--foreground))"
                              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                              tickLine={false}
                            />
                            <PolarRadiusAxis 
                              angle={30} 
                              domain={[0, 100]} 
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                              tickCount={5}
                              stroke="hsl(var(--border))"
                              strokeOpacity={0.5}
                              strokeDasharray="2 3"
                            />
                            <defs>
                              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.9}/>
                                <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0.3}/>
                              </linearGradient>
                            </defs>
                            <Radar
                              name={locale === 'th' ? 'ค่าเฉลี่ย' : 
                                    locale === 'ja' ? '平均値' : 
                                    locale === 'zh' ? '平均值' : 
                                    'Average'}
                              dataKey="value"
                              stroke={COLORS[0]}
                              strokeWidth={2}
                              fill="url(#radarGradient)"
                              fillOpacity={0.7}
                              animationDuration={1200}
                              animationEasing="ease-out"
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                              formatter={(value: any, name: string, props: any) => [
                                `${value}% (${props.payload.actual}/${props.payload.recommended})`, 
                                props.payload.subject
                              ]}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full md:w-2/5 p-4 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {locale === 'th' ? 'เปรียบเทียบค่าเฉลี่ยประจำวันของคุณกับเป้าหมายที่แนะนำ' : 
                           locale === 'ja' ? 'あなたの日次平均値を推奨目標と比較します' : 
                           locale === 'zh' ? '将您的日平均值与推荐目标进行比较' : 
                           'Comparing your daily averages with recommended targets'}
                        </p>
                        {nutritionRadarData.map((item: NutritionRadarItem, i: number) => (
                          <div key={i} className="text-sm">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{item.subject}</span>
                              <span>{item.value}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-muted-foreground">
                                {item.actual} / {item.recommended}
                              </div>
                              <Progress value={item.value} className="flex-1 h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            
            {/* Macronutrient Balance */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">
                    {locale === 'th' ? 'สัดส่วนสารอาหารตามเวลา' : 
                     locale === 'ja' ? '時間ごとの栄養素バランス' : 
                     locale === 'zh' ? '时间营养素平衡' : 
                     'Macronutrient Balance Over Time'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={macroBalanceData}
                        margin={{ top: 10, right: 20, bottom: 20, left: 0 }}
                      >
                        <defs>
                          <linearGradient id="areaProtein" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                            <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0.3}/>
                          </linearGradient>
                          <linearGradient id="areaFat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS[1]} stopOpacity={0.8}/>
                            <stop offset="100%" stopColor={COLORS[1]} stopOpacity={0.3}/>
                          </linearGradient>
                          <linearGradient id="areaCarbs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS[2]} stopOpacity={0.8}/>
                            <stop offset="100%" stopColor={COLORS[2]} stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                        <XAxis 
                          dataKey="name" 
                          stroke="hsl(var(--muted-foreground))"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          contentStyle={TOOLTIPS.contentStyle}
                          itemStyle={TOOLTIPS.itemStyle}
                          labelStyle={TOOLTIPS.labelStyle}
                          formatter={(value: any) => [`${value}%`, '']}
                          cursor={TOOLTIPS.cursor}
                        />
                        <Legend 
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ paddingTop: 10 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="protein" 
                          stackId="1"
                          stroke={COLORS[0]} 
                          strokeWidth={2}
                          fill="url(#areaProtein)" 
                          name={locale === 'th' ? 'โปรตีน' : locale === 'ja' ? 'タンパク質' : locale === 'zh' ? '蛋白质' : 'Protein'} 
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="fat" 
                          stackId="1"
                          stroke={COLORS[1]} 
                          strokeWidth={2}
                          fill="url(#areaFat)" 
                          name={locale === 'th' ? 'ไขมัน' : locale === 'ja' ? '脂肪' : locale === 'zh' ? '脂肪' : 'Fat'} 
                          animationDuration={1500}
                          animationEasing="ease-out"
                          animationBegin={100}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="carbs" 
                          stackId="1"
                          stroke={COLORS[2]} 
                          strokeWidth={2}
                          fill="url(#areaCarbs)" 
                          name={locale === 'th' ? 'คาร์โบไฮเดรต' : locale === 'ja' ? '炭水化物' : locale === 'zh' ? '碳水化合物' : 'Carbs'} 
                          animationDuration={1500}
                          animationEasing="ease-out"
                          animationBegin={200}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Detailed Nutrient Breakdown */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">
                    {locale === 'th' ? 'รายละเอียดสารอาหาร' : 
                     locale === 'ja' ? '詳細な栄養素内訳' : 
                     locale === 'zh' ? '详细营养素明细' : 
                     'Detailed Nutrient Breakdown'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 divide-y divide-border">
                    {[
                      { 
                        name: locale === 'th' ? 'โปรตีน' : locale === 'ja' ? 'タンパク質' : locale === 'zh' ? '蛋白质' : 'Protein',
                        value: nutrientDistribution[0].value.toFixed(1),
                        unit: 'g',
                        percent: nutrientDistribution[0].percentage,
                        icon: <Activity className="h-5 w-5 text-blue-500" />,
                        info: locale === 'th' ? 'ช่วยสร้างและซ่อมแซมกล้ามเนื้อ' : 
                              locale === 'ja' ? '筋肉の構築と修復を助けます' : 
                              locale === 'zh' ? '帮助构建和修复肌肉' : 
                              'Helps build and repair muscles'
                      },
                      { 
                        name: locale === 'th' ? 'ไขมัน' : locale === 'ja' ? '脂肪' : locale === 'zh' ? '脂肪' : 'Fat',
                        value: nutrientDistribution[1].value.toFixed(1),
                        unit: 'g',
                        percent: nutrientDistribution[1].percentage,
                        icon: <Droplet className="h-5 w-5 text-pink-500" />,
                        info: locale === 'th' ? 'สำคัญสำหรับฮอร์โมนและการดูดซึมวิตามิน' : 
                              locale === 'ja' ? 'ホルモンとビタミン吸収に重要です' : 
                              locale === 'zh' ? '对荷尔蒙和维生素吸收很重要' : 
                              'Essential for hormones and vitamin absorption'
                      },
                      { 
                        name: locale === 'th' ? 'คาร์โบไฮเดรต' : locale === 'ja' ? '炭水化物' : locale === 'zh' ? '碳水化合物' : 'Carbs',
                        value: nutrientDistribution[2].value.toFixed(1),
                        unit: 'g',
                        percent: nutrientDistribution[2].percentage,
                        icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
                        info: locale === 'th' ? 'แหล่งพลังงานหลักสำหรับร่างกาย' : 
                              locale === 'ja' ? '体の主要なエネルギー源です' : 
                              locale === 'zh' ? '身体的主要能量来源' : 
                              'The body\'s main source of energy'
                      }
                    ].map((nutrient, i) => (
                      <div key={i} className="flex items-center p-4 gap-4">
                        <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          {nutrient.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-medium">{nutrient.name}</h3>
                            <div className="text-lg font-bold">
                              {nutrient.value} <span className="text-xs font-normal">{nutrient.unit}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{nutrient.info}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* Achievements Tab */}
          <TabsContent value="achievements" className="mt-0 space-y-4">
            {/* Achievements Overview */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-lg">
                    {locale === 'th' ? 'ความสำเร็จของคุณ' : 
                     locale === 'ja' ? 'あなたの実績' : 
                     locale === 'zh' ? '您的成就' : 
                     'Your Achievements'}
                  </CardTitle>
                  <CardDescription>
                    {locale === 'th' ? 'ติดตามความก้าวหน้าและความสำเร็จของคุณ' : 
                     locale === 'ja' ? 'あなたの進捗状況と実績を追跡します' : 
                     locale === 'zh' ? '跟踪您的进度和成就' : 
                     'Track your progress and accomplishments'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {locale === 'th' ? 'ความสำเร็จที่ได้รับ' : 
                         locale === 'ja' ? '獲得した実績' : 
                         locale === 'zh' ? '已获得成就' : 
                         'Achievements Earned'}
                      </span>
                      <Badge className="bg-primary">
                            {achievements?.filter((a: { complete: boolean }) => a.complete).length}/{achievements?.length}
                      </Badge>
                    </div>
                    <Progress 
                          value={(achievements?.filter((a: { complete: boolean }) => a.complete).length / (achievements?.length || 1)) * 100} 
                      className="h-2.5" 
                    />
                  </div>
                  <div className="divide-y divide-border">
                        {achievements?.map((achievement, i) => (
                      <div key={i} className={cn("p-4 flex items-center gap-3", 
                                                achievement.complete ? "" : "opacity-70")}>
                        <div className={cn(`h-12 w-12 rounded-full flex items-center justify-center text-white`, 
                                        achievement.complete ? achievement.type.color : "bg-muted")}>
                          {achievement.type.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-medium">{achievement.title}</h3>
                            {achievement.complete && (
                              <Badge className="bg-green-500">
                                ✓ {locale === 'th' ? 'สำเร็จ' : 
                                   locale === 'ja' ? '達成' : 
                                   locale === 'zh' ? '完成' : 
                                   'Complete'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {!achievement.complete && (
                            <div className="mt-1.5">
                              <div className="flex justify-between text-xs mb-1">
                                <span>{locale === 'th' ? 'ความคืบหน้า' : 
                                      locale === 'ja' ? '進捗' : 
                                      locale === 'zh' ? '进度' : 
                                      'Progress'}</span>
                                <span>{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Upcoming Achievements */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">
                    {locale === 'th' ? 'ความสำเร็จที่จะได้รับ' : 
                     locale === 'ja' ? '近日中の実績' : 
                     locale === 'zh' ? '即将获得的成就' : 
                     'Upcoming Achievements'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {[
                      { 
                        title: locale === 'th' ? 'นักบันทึกข้อมูล' : locale === 'ja' ? 'データロガー' : locale === 'zh' ? '数据记录者' : 'Data Logger', 
                        description: locale === 'th' ? 'บันทึกอาหารทุกวันเป็นเวลา 30 วัน' : 
                                     locale === 'ja' ? '30日間毎日食事を記録する' : 
                                     locale === 'zh' ? '连续30天记录食物' : 
                                     'Log your food every day for 30 days',
                        progress: 63,
                        icon: <CalendarDays className="h-5 w-5" />,
                        color: "bg-indigo-500"
                      },
                      { 
                        title: locale === 'th' ? 'ตรงตามเป้าหมาย' : locale === 'ja' ? '目標達成者' : locale === 'zh' ? '目标达成者' : 'Goal Achiever', 
                        description: locale === 'th' ? 'บรรลุเป้าหมายแคลอรี่ 10 วันติดต่อกัน' : 
                                     locale === 'ja' ? '10日連続でカロリー目標を達成' : 
                                     locale === 'zh' ? '连续10天达到卡路里目标' : 
                                     'Meet your calorie goal for 10 days in a row',
                        progress: 40,
                        icon: <Target className="h-5 w-5" />,
                        color: "bg-green-500"
                      },
                      { 
                        title: locale === 'th' ? 'ผู้เชี่ยวชาญด้านน้ำ' : locale === 'ja' ? '水分摂取マスター' : locale === 'zh' ? '水分大师' : 'Hydration Expert', 
                        description: locale === 'th' ? 'ดื่มน้ำตามเป้าหมายเป็นเวลา 14 วัน' : 
                                     locale === 'ja' ? '14日間水分目標を達成' : 
                                     locale === 'zh' ? '14天达到水分目标' : 
                                     'Hit your water target for 14 days',
                        progress: 29,
                        icon: <Droplet className="h-5 w-5" />,
                        color: "bg-blue-500"
                      },
                    ].map((achievement, i) => (
                      <div key={i} className="p-4 flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full ${achievement.color} flex items-center justify-center text-white opacity-50`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <div className="mt-1.5">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{locale === 'th' ? 'ความคืบหน้า' : 
                                    locale === 'ja' ? '進捗' : 
                                    locale === 'zh' ? '进度' : 
                                    'Progress'}</span>
                              <span>{achievement.progress}%</span>
                            </div>
                            <Progress value={achievement.progress} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Show loading indicator for achievements if needed */}
      {isLoadingAchievements && activeTab === "achievements" && (
        <div className="p-4 text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            {locale === 'th' ? 'กำลังโหลดข้อมูลความสำเร็จ...' : 
             locale === 'ja' ? '実績データを読み込んでいます...' : 
             locale === 'zh' ? '正在加载成就数据...' : 
             'Loading achievements...'}
          </p>
        </div>
      )}
    </motion.div>
  );
} 