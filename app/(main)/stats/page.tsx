"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  ArrowRightLeft
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

// Animation variants
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
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } }
};

// Types
type TimeRange = "week" | "month" | "3months" | "6months" | "year";
type StatTab = "overview" | "nutrition" | "meals" | "trends" | "achievements";

// Colors for charts with richer palette
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(240, 100%, 70%)",
  "hsl(330, 100%, 70%)",
  "hsl(120, 90%, 70%)",
  "hsl(24, 90%, 65%)",
  "hsl(270, 85%, 65%)",
];

const GRADIENTS = [
  ["hsl(var(--primary))", "hsl(var(--primary-foreground))"],
  ["hsl(var(--secondary))", "hsl(var(--secondary-foreground))"],
  ["hsl(var(--accent))", "hsl(var(--accent-foreground))"],
];

// Achievement types and icons
const ACHIEVEMENT_TYPES = {
  STREAK: { icon: <Flame className="h-5 w-5" />, color: "bg-orange-500" },
  NUTRITION: { icon: <Activity className="h-5 w-5" />, color: "bg-blue-500" },
  WATER: { icon: <Droplet className="h-5 w-5" />, color: "bg-cyan-500" },
  WEIGHT: { icon: <Weight className="h-5 w-5" />, color: "bg-violet-500" },
  CONSISTENCY: { icon: <CalendarDays className="h-5 w-5" />, color: "bg-green-500" },
  MILESTONE: { icon: <Trophy className="h-5 w-5" />, color: "bg-amber-500" },
};

export default function StatsPage() {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const { dailyLogs, goals } = useNutritionStore();
  
  // State for controlling which widgets are shown
  const [activeTab, setActiveTab] = useState<StatTab>("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareStartDate, setCompareStartDate] = useState<string>(format(subWeeks(new Date(), 2), 'yyyy-MM-dd'));
  const [compareEndDate, setCompareEndDate] = useState<string>(format(subWeeks(new Date(), 1), 'yyyy-MM-dd'));
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

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

  // Generate achievement data
  const achievements = useMemo(() => {
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
  }, [dailyLogs, locale, getCurrentStreak, getMealConsistencyScore]);

  // Calculate nutrient distribution data for the pie chart
  const nutrientDistribution = useMemo(() => {
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
  }, [dailyLogs, locale, timeRange]);

  // Calculate calorie trend data
  const calorieTrendData = useMemo(() => {
    const { startDate, endDate } = getDatesForTimeRange();
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    
    // For week and month, show daily data
    if (timeRange === 'week' || timeRange === 'month') {
      return Array.from({ length: daysDiff }).map((_, index) => {
        const day = addDays(startDate, index);
        const formattedDate = format(day, 'yyyy-MM-dd');
        const dayLog = dailyLogs[formattedDate] || { totalCalories: 0 };
        
        return {
          date: formattedDate,
          name: format(day, timeRange === 'week' ? 'EEE' : 'dd MMM', { locale: getDateLocale() }),
          calories: dayLog.totalCalories || 0,
          goal: goals.calories
        };
      });
    }
    
    // For longer periods, aggregate by weeks or months
    const aggregatedData = [];
    const isLongPeriod = timeRange === 'year';
    
    if (isLongPeriod) {
      // Aggregate by month for year view
      const monthsCount = Math.ceil(daysDiff / 30);
      
      for (let i = 0; i < monthsCount; i++) {
        const periodStart = addDays(startDate, i * 30);
        const periodLabel = format(periodStart, 'MMM', { locale: getDateLocale() });
        let totalCalories = 0;
        let daysWithData = 0;
        
        // Calculate average for this period
        for (let j = 0; j < 30 && i * 30 + j < daysDiff; j++) {
          const date = format(addDays(startDate, i * 30 + j), 'yyyy-MM-dd');
          const dayLog = dailyLogs[date];
          
          if (dayLog && dayLog.totalCalories) {
            totalCalories += dayLog.totalCalories;
            daysWithData++;
          }
        }
        
        const avgCalories = daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0;
        
        aggregatedData.push({
          date: format(periodStart, 'yyyy-MM-dd'),
          name: periodLabel,
          calories: avgCalories,
          goal: goals.calories
        });
      }
    } else {
      // Aggregate by week for 3month/6month view
      const weeksCount = Math.ceil(daysDiff / 7);
      
      for (let i = 0; i < weeksCount; i++) {
        const weekStart = addDays(startDate, i * 7);
        const weekEnd = addDays(weekStart, 6);
        const periodLabel = `${format(weekStart, 'dd MMM', { locale: getDateLocale() })}`;
        let totalCalories = 0;
        let daysWithData = 0;
        
        // Calculate average for this week
        for (let j = 0; j < 7 && i * 7 + j < daysDiff; j++) {
          const date = format(addDays(startDate, i * 7 + j), 'yyyy-MM-dd');
          const dayLog = dailyLogs[date];
          
          if (dayLog && dayLog.totalCalories) {
            totalCalories += dayLog.totalCalories;
            daysWithData++;
          }
        }
        
        const avgCalories = daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0;
        
        aggregatedData.push({
          date: format(weekStart, 'yyyy-MM-dd'),
          name: periodLabel,
          calories: avgCalories,
          goal: goals.calories
        });
      }
    }
    
    return aggregatedData;
  }, [dailyLogs, goals.calories, timeRange, getDateLocale]);

  // Calculate macronutrient balance data (protein, fat, carbs ratio over time)
  const macroBalanceData = useMemo(() => {
    const { startDate, endDate } = getDatesForTimeRange();
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    
    // For simplicity, we'll show weekly averages regardless of time range
    const weeksCount = Math.ceil(daysDiff / 7);
    const data = [];
    
    for (let i = 0; i < weeksCount; i++) {
      const weekStart = addDays(startDate, i * 7);
      let totalProtein = 0;
      let totalFat = 0;
      let totalCarbs = 0;
      let daysWithData = 0;
      
      // Calculate average for this week
      for (let j = 0; j < 7 && i * 7 + j < daysDiff; j++) {
        const date = format(addDays(startDate, i * 7 + j), 'yyyy-MM-dd');
        const dayLog = dailyLogs[date];
        
        if (dayLog && (dayLog.totalProtein || dayLog.totalFat || dayLog.totalCarbs)) {
          totalProtein += dayLog.totalProtein || 0;
          totalFat += dayLog.totalFat || 0;
          totalCarbs += dayLog.totalCarbs || 0;
          daysWithData++;
        }
      }
      
      // Only add data point if we have data for this week
      if (daysWithData > 0) {
        const total = totalProtein + totalFat + totalCarbs;
        data.push({
          date: format(weekStart, 'yyyy-MM-dd'),
          name: format(weekStart, 'dd MMM', { locale: getDateLocale() }),
          protein: total > 0 ? Math.round((totalProtein / total) * 100) : 0,
          fat: total > 0 ? Math.round((totalFat / total) * 100) : 0,
          carbs: total > 0 ? Math.round((totalCarbs / total) * 100) : 0,
        });
      }
    }
    
    return data;
  }, [dailyLogs, timeRange, getDateLocale]);

  // Calculate meal distribution by time and type
  const mealDistributionData = useMemo(() => {
    const { startDate, endDate } = getDatesForTimeRange();
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    
    // Map meal types to time periods
    const mealTimeMapping = {
      breakfast: locale === 'th' ? 'เช้า' : locale === 'ja' ? '朝食' : locale === 'zh' ? '早餐' : 'Morning',
      lunch: locale === 'th' ? 'กลางวัน' : locale === 'ja' ? '昼食' : locale === 'zh' ? '午餐' : 'Afternoon',
      dinner: locale === 'th' ? 'เย็น' : locale === 'ja' ? '夕食' : locale === 'zh' ? '晚餐' : 'Evening',
      snack: locale === 'th' ? 'ของว่าง' : locale === 'ja' ? 'おやつ' : locale === 'zh' ? '零食' : 'Snack'
    };
    
    // Initialize data structure for meal count by type
    const mealsByType = {
      [mealTimeMapping.breakfast]: 0,
      [mealTimeMapping.lunch]: 0,
      [mealTimeMapping.dinner]: 0,
      [mealTimeMapping.snack]: 0
    };
    
    // Initialize data structure for calories by meal type
    const caloriesByType = {
      [mealTimeMapping.breakfast]: 0,
      [mealTimeMapping.lunch]: 0,
      [mealTimeMapping.dinner]: 0,
      [mealTimeMapping.snack]: 0
    };
    
    for (let d = 0; d < daysDiff; d++) {
      const date = format(addDays(startDate, d), 'yyyy-MM-dd');
      const dayLog = dailyLogs[date];
      
      if (dayLog && dayLog.meals) {
        dayLog.meals.forEach(meal => {
          const timeKey = mealTimeMapping[meal.mealType] || mealTimeMapping.snack;
          mealsByType[timeKey] += 1;
          
          // Sum calories by meal type
          const mealCalories = meal.foodItem.calories * meal.quantity;
          caloriesByType[timeKey] += mealCalories;
        });
      }
    }
    
    // Calculate average calories per meal type
    Object.keys(caloriesByType).forEach(type => {
      if (mealsByType[type] > 0) {
        caloriesByType[type] = Math.round(caloriesByType[type] / mealsByType[type]);
      }
    });
    
    return {
      byCount: Object.entries(mealsByType).map(([time, count]) => ({
        name: time,
        value: count
      })),
      byCalories: Object.entries(caloriesByType).map(([time, calories]) => ({
        name: time,
        value: calories
      }))
    };
  }, [dailyLogs, locale, timeRange]);

  // Calculate daily nutrition radar data
  const nutritionRadarData = useMemo(() => {
    // This data compares user's average intake with recommended values
    const { startDate, endDate } = getDatesForTimeRange();
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalCalories = 0;
    let daysWithData = 0;
    
    for (let d = 0; d < daysDiff; d++) {
      const date = format(addDays(startDate, d), 'yyyy-MM-dd');
      const dayLog = dailyLogs[date];
      
      if (dayLog && dayLog.totalCalories) {
        totalCalories += dayLog.totalCalories;
        totalProtein += dayLog.totalProtein || 0;
        totalFat += dayLog.totalFat || 0;
        totalCarbs += dayLog.totalCarbs || 0;
        daysWithData++;
      }
    }
    
    // Calculate daily averages
    const avgProtein = daysWithData > 0 ? Math.round(totalProtein / daysWithData) : 0;
    const avgFat = daysWithData > 0 ? Math.round(totalFat / daysWithData) : 0;
    const avgCarbs = daysWithData > 0 ? Math.round(totalCarbs / daysWithData) : 0;
    const avgCalories = daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0;
    
    // Calculate recommended values based on goals
    const recProtein = Math.round(((goals.protein || 30) / 100) * goals.calories / 4);
    const recFat = Math.round(((goals.fat || 30) / 100) * goals.calories / 9);
    const recCarbs = Math.round(((goals.carbs || 40) / 100) * goals.calories / 4);
    
    // Calculate percentage of goal achieved (capped at 100%)
    const proteinPct = Math.min(100, Math.round((avgProtein / recProtein) * 100));
    const fatPct = Math.min(100, Math.round((avgFat / recFat) * 100));
    const carbsPct = Math.min(100, Math.round((avgCarbs / recCarbs) * 100));
    const caloriesPct = Math.min(100, Math.round((avgCalories / goals.calories) * 100));
    
    return [
      {
        subject: locale === 'th' ? 'โปรตีน' : locale === 'ja' ? 'タンパク質' : locale === 'zh' ? '蛋白质' : 'Protein',
        value: proteinPct,
        fullMark: 100,
        actual: avgProtein,
        recommended: recProtein
      },
      {
        subject: locale === 'th' ? 'ไขมัน' : locale === 'ja' ? '脂肪' : locale === 'zh' ? '脂肪' : 'Fat',
        value: fatPct,
        fullMark: 100,
        actual: avgFat,
        recommended: recFat
      },
      {
        subject: locale === 'th' ? 'คาร์โบไฮเดรต' : locale === 'ja' ? '炭水化物' : locale === 'zh' ? '碳水化合物' : 'Carbs',
        value: carbsPct,
        fullMark: 100,
        actual: avgCarbs,
        recommended: recCarbs
      },
      {
        subject: locale === 'th' ? 'แคลอรี่' : locale === 'ja' ? 'カロリー' : locale === 'zh' ? '卡路里' : 'Calories',
        value: caloriesPct,
        fullMark: 100,
        actual: avgCalories,
        recommended: goals.calories
      }
    ];
  }, [dailyLogs, goals, locale, timeRange]);

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

  return (
    <motion.div 
      className="max-w-md mx-auto min-h-screen pb-32"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header with tabs */}
      <motion.div variants={item} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">
            {locale === 'th' ? 'การวิเคราะห์' : 
             locale === 'ja' ? '分析' : 
             locale === 'zh' ? '分析' : 'Stats'}
          </h1>
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
                        {getCurrentStreak} <span className="text-sm font-normal">{locale === 'th' ? 'วัน' : locale === 'ja' ? '日' : locale === 'zh' ? '天' : 'days'}</span>
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
                        {Object.values(dailyLogs).reduce((sum, log) => sum + (log.meals?.length || 0), 0)}
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
                        {getMealConsistencyScore}<span className="text-sm font-normal">%</span>
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
                        {achievements.filter(a => a.complete).length}/{achievements.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Weekly Calorie Trends Chart */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
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
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="calories" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary)/0.2)" 
                          name={locale === 'th' ? 'แคลอรี่' : locale === 'ja' ? 'カロリー' : locale === 'zh' ? '卡路里' : 'Calories'} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="goal" 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeDasharray="5 5" 
                          name={locale === 'th' ? 'เป้าหมาย' : locale === 'ja' ? '目標' : locale === 'zh' ? '目标' : 'Goal'} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Nutrient Distribution */}
            <motion.div variants={item}>
              <Card className="overflow-hidden">
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
                          <Pie
                            data={nutrientDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {nutrientDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col justify-center p-4 space-y-3">
                      {nutrientDistribution.map((item, i) => (
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
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 3)
                      .map((achievement, i) => (
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
              <Card className="overflow-hidden">
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
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                            formatter={(value: any) => [value, locale === 'th' ? 'มื้อ' : locale === 'ja' ? '食事' : locale === 'zh' ? '餐' : 'meals']}
                          />
                          <Bar 
                            dataKey="value" 
                            name={locale === 'th' ? 'จำนวนมื้อ' : locale === 'ja' ? '食事数' : locale === 'zh' ? '餐点数' : 'Meal Count'}
                          >
                            {mealDistributionData.byCount.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                            formatter={(value: any) => [value, 'kcal']}
                          />
                          <Bar 
                            dataKey="value" 
                            name={locale === 'th' ? 'แคลอรี่' : locale === 'ja' ? 'カロリー' : locale === 'zh' ? '卡路里' : 'Calories'}
                          >
                            {mealDistributionData.byCalories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    {/* This would normally be filled with data from the logs */}
                    {[
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
                    ].map((food, i) => (
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
                      <ComposedChart data={calorieTrendData}
                                margin={{ top: 10, right: 20, bottom: 25, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={50} />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="calories" 
                          fill="hsl(var(--primary))" 
                          name={locale === 'th' ? 'แคลอรี่' : locale === 'ja' ? 'カロリー' : locale === 'zh' ? '卡路里' : 'Calories'} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="goal" 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeDasharray="5 5" 
                          name={locale === 'th' ? 'เป้าหมาย' : locale === 'ja' ? '目標' : locale === 'zh' ? '目标' : 'Goal'} 
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
              <Card className="overflow-hidden">
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
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis 
                            dataKey="subject" 
                            stroke="hsl(var(--foreground))"
                            tick={{ fill: 'hsl(var(--foreground))' }}
                          />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name={locale === 'th' ? 'ค่าเฉลี่ย' : 
                                  locale === 'ja' ? '平均値' : 
                                  locale === 'zh' ? '平均值' : 
                                  'Average'}
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary)/0.5)"
                            fillOpacity={0.6}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                            formatter={(value: any, name: string) => [`${value}%`, name]}
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
                      {nutritionRadarData.map((item, i) => (
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
                      <AreaChart data={macroBalanceData}
                               margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                          formatter={(value: any) => [`${value}%`, '']}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="protein" 
                          stackId="1"
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))" 
                          name={locale === 'th' ? 'โปรตีน' : locale === 'ja' ? 'タンパク質' : locale === 'zh' ? '蛋白质' : 'Protein'} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="fat" 
                          stackId="1"
                          stroke="hsl(var(--secondary))" 
                          fill="hsl(var(--secondary))" 
                          name={locale === 'th' ? 'ไขมัน' : locale === 'ja' ? '脂肪' : locale === 'zh' ? '脂肪' : 'Fat'} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="carbs" 
                          stackId="1"
                          stroke="hsl(var(--accent))" 
                          fill="hsl(var(--accent))" 
                          name={locale === 'th' ? 'คาร์โบไฮเดรต' : locale === 'ja' ? '炭水化物' : locale === 'zh' ? '碳水化合物' : 'Carbs'} 
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
                        {achievements.filter(a => a.complete).length}/{achievements.length}
                      </Badge>
                    </div>
                    <Progress 
                      value={(achievements.filter(a => a.complete).length / achievements.length) * 100} 
                      className="h-2.5" 
                    />
                  </div>
                  <div className="divide-y divide-border">
                    {achievements.map((achievement, i) => (
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
    </motion.div>
  );
} 