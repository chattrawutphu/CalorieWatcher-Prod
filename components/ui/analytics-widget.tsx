"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { Activity, Calendar, ChevronDown, PieChart, Droplets, Weight } from "lucide-react";
import { format, parse } from "date-fns";
import { th, ja, zhCN } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNutritionStore } from "@/lib/store/nutrition-store";

// Animation variants
const chartVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
};

// Chart container variants for sliding
const chartContainerVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  })
};

// Button pill container variants
const pillContainerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1 
    }
  }
};

const pillItemVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
  }
};

// Add animation variants for graph type selector
const graphTypeSelectorVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

// Define colors - updating with more vibrant, cute theme-compatible colors
const COLORS = {
  protein: {
    light: "hsl(var(--primary))",
    dark: "hsl(var(--primary))",
    gradient: "linear-gradient(180deg, hsl(var(--primary-foreground)), hsl(var(--primary)))"
  },
  fat: {
    light: "hsl(var(--secondary))",
    dark: "hsl(var(--secondary))",
    gradient: "linear-gradient(180deg, hsl(var(--secondary-foreground)), hsl(var(--secondary)))"
  },
  carbs: {
    light: "hsl(var(--accent))",
    dark: "hsl(var(--accent))",
    gradient: "linear-gradient(180deg, hsl(var(--muted-foreground)), hsl(var(--accent)))"
  },
  calories: {
    light: "hsl(var(--primary))",
    dark: "hsl(var(--primary))",
    gradient: "linear-gradient(180deg, hsl(var(--primary-foreground)), hsl(var(--primary)))"
  },
  water: {
    light: "hsl(var(--accent))",
    dark: "hsl(var(--accent))",
    gradient: "linear-gradient(180deg, hsl(var(--muted-foreground)), hsl(var(--accent)))"
  },
  primary: {
    light: "hsl(var(--primary))",
    dark: "hsl(var(--primary))",
    gradient: "linear-gradient(180deg, hsl(var(--primary-foreground)), hsl(var(--primary)))"
  }
};

// Calculate analytics data with some nice animated effects
const getAnalyticsData = (metric: string, period: string, dailyLogs: any, goals: any, getDateLocale: () => any, selectedDate?: string) => {
  // ใช้วันที่ที่กำหนดหรือวันที่ปัจจุบันถ้าไม่ได้กำหนด
  const today = selectedDate ? new Date(selectedDate) : new Date();
  console.log("getAnalyticsData", { metric, period, selectedDate, today: today.toISOString() });
  
  let dates: Date[] = [];
  let labels: string[] = [];
  
  // Generate dates based on selected period
  if (period === "7d") {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
      labels.push(format(date, 'EEE', { locale: getDateLocale() }));
    }
  } else if (period === "4w") {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - (i * 7));
      dates.push(date);
      labels.push(format(date, 'MMM d', { locale: getDateLocale() }));
    }
  } else if (period === "12m") {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      dates.push(date);
      labels.push(format(date, 'MMM', { locale: getDateLocale() }));
    }
  }
  
  // Map dates to data values
  const data = dates.map((date, index) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    // Get the daily log or create an empty one
    const dayLog = dailyLogs[formattedDate] || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      meals: []
    };
    
    // Get water data from a separate source if needed
    const waterData = dailyLogs[formattedDate]?.water || 0;
    
    // Get the value based on selected metric
    let value = 0;
    switch(metric) {
      case 'calories':
        value = dayLog.totalCalories || 0;
        break;
      case 'protein':
        value = dayLog.totalProtein || 0;
        break;
      case 'fat':
        value = dayLog.totalFat || 0;
        break;
      case 'carbs':
        value = dayLog.totalCarbs || 0;
        break;
      case 'water':
        value = waterData;
        break;
    }
    
    // Calculate goal based on metric
    let goal = 0;
    switch(metric) {
      case 'calories':
        goal = goals.calories || 2000;
        break;
      case 'protein':
        goal = Math.round(((goals.protein || 30) / 100) * goals.calories / 4);
        break;
      case 'fat':
        goal = Math.round(((goals.fat || 30) / 100) * goals.calories / 9);
        break;
      case 'carbs':
        goal = Math.round(((goals.carbs || 40) / 100) * goals.calories / 4);
        break;
      case 'water':
        goal = goals.water || 2000;
        break;
    }
    
    return {
      name: labels[index],
      value: value,
      goal: goal,
      date: formattedDate
    };
  });
  
  // ลบการสร้างข้อมูลจำลอง ใช้เฉพาะข้อมูลจริง
  // ไม่ต้องเพิ่มข้อมูลจำลองใดๆ แม้ข้อมูลจะมีน้อยเกินไปก็ตาม
  return data;
};

interface AnalyticsWidgetProps {
  dailyLogs: Record<string, any>;
  goals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    water: number;
    weight?: number;
  };
  graphType: "nutrients" | "water" | "weight";
  onGraphTypeChange?: (type: "nutrients" | "water" | "weight") => void;
  selectedDate?: string;
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ dailyLogs, goals, graphType, onGraphTypeChange, selectedDate }) => {
  const { locale } = useLanguage();
  
  // Analytics state
  const [currentMetric, setCurrentMetric] = useState<string>("calories");
  const [currentPeriod, setCurrentPeriod] = useState<string>("7d");
  const [chartDirection, setChartDirection] = useState<number>(0); // For slide animation direction
  
  // Add state for storing the current graph type locally
  const [currentGraphType, setCurrentGraphType] = useState<"nutrients" | "water" | "weight">(graphType);
  
  // For weight data, add specific period state
  const [weightPeriod, setWeightPeriod] = useState<string>("30d");
  
  // Update local graph type when prop changes
  useEffect(() => {
    setCurrentGraphType(graphType);
  }, [graphType]);
  
  const getDateLocale = () => {
    switch (locale) {
      case 'th': return th;
      case 'ja': return ja;
      case 'zh': return zhCN;
      default: return undefined;
    }
  };
  
  // Get weight chart data - moved outside memo to fix initialization issue
  const getWeightData = (period: string, dailyLogs: any, goals: any, getDateLocale: () => any, selectedDate?: string) => {
    // Get weight history here inside the function
    const { weightHistory = [] } = useNutritionStore.getState();
    
    // If no weight entries, return empty array
    if (weightHistory.length === 0) return [];
    
    // ใช้วันที่ที่กำหนดหรือวันที่ปัจจุบันถ้าไม่ได้กำหนด
    const today = selectedDate ? new Date(selectedDate) : new Date();
    console.log("getWeightData", { period, selectedDate, today: today.toISOString(), weightEntriesCount: weightHistory.length });
    
    let filteredEntries = [...weightHistory];
    let dates: Date[] = [];
    let labels: string[] = [];
    
    // Filter entries based on period
    if (period === "7d") {
      // Last 7 days
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      filteredEntries = weightHistory.filter(entry => 
        new Date(entry.date) >= sevenDaysAgo
      );
      
      // Generate dates for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date);
        labels.push(format(date, 'EEE', { locale: getDateLocale() }));
      }
    } else if (period === "4w" || period === "30d") {
      // Last 4 weeks or 30 days
      const daysAgo = new Date(today);
      daysAgo.setDate(today.getDate() - (period === "4w" ? 28 : 30));
      filteredEntries = weightHistory.filter(entry => 
        new Date(entry.date) >= daysAgo
      );
      
      // Generate dates for the period
      const days = period === "4w" ? 28 : 30;
      const step = Math.max(1, Math.floor(days / 7)); // Show around 7 labels
      
      for (let i = days - 1; i >= 0; i -= step) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date);
        labels.push(format(date, 'MMM d', { locale: getDateLocale() }));
      }
    } else if (period === "12m" || period === "365d") {
      // Last 12 months or 365 days
      const timeAgo = new Date(today);
      if (period === "12m") {
        timeAgo.setMonth(today.getMonth() - 11);
      } else {
        timeAgo.setDate(today.getDate() - 365);
      }
      
      filteredEntries = weightHistory.filter(entry => 
        new Date(entry.date) >= timeAgo
      );
      
      // Generate dates for the last 12 months
      if (period === "12m") {
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(today.getMonth() - i);
          dates.push(date);
          labels.push(format(date, 'MMM', { locale: getDateLocale() }));
        }
      } else {
        // For 365 days, show monthly markers
        for (let i = 12; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - (i * 30));
          dates.push(date);
          labels.push(format(date, 'MMM', { locale: getDateLocale() }));
        }
      }
    } else if (period === "180d") {
      // Last 6 months (180 days)
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setDate(today.getDate() - 180);
      filteredEntries = weightHistory.filter(entry => 
        new Date(entry.date) >= sixMonthsAgo
      );
      
      // Generate dates for 6 months with monthly markers
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - (i * 30));
        dates.push(date);
        labels.push(format(date, 'MMM d', { locale: getDateLocale() }));
      }
    } else if (period === "all") {
      // All time - use all entries but create reasonable date labels
      // Sort entries by date
      filteredEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (filteredEntries.length > 0) {
        const firstEntryDate = new Date(filteredEntries[0].date);
        const monthDiff = (today.getFullYear() - firstEntryDate.getFullYear()) * 12 + 
                          today.getMonth() - firstEntryDate.getMonth();
        
        if (monthDiff < 12) {
          // Less than a year of data - show monthly markers
          const startMonth = firstEntryDate.getMonth();
          const startYear = firstEntryDate.getFullYear();
          
          for (let i = 0; i <= monthDiff; i++) {
            const date = new Date(startYear, startMonth + i, 1);
            dates.push(date);
            labels.push(format(date, 'MMM yy', { locale: getDateLocale() }));
          }
        } else {
          // More than a year - show quarterly markers
          const startYear = firstEntryDate.getFullYear();
          const endYear = today.getFullYear();
          
          for (let year = startYear; year <= endYear; year++) {
            for (let quarter = 0; quarter < 4; quarter++) {
              const month = quarter * 3;
              const date = new Date(year, month, 1);
              if (date <= today) {
                dates.push(date);
                labels.push(format(date, 'MMM yy', { locale: getDateLocale() }));
              }
            }
          }
        }
      }
    }
    
    // Create the data array for the chart
    const data = dates.map((date, index) => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Find weight entry closest to this date
      const closestEntry = filteredEntries.find(entry => entry.date === formattedDate);
      
      // Get the weight goal
      const weightGoal = goals.weight || 70;
      
      return {
        name: labels[index],
        value: closestEntry ? closestEntry.weight : 0,
        goal: weightGoal,
        date: formattedDate
      };
    });
    
    // ลบการสร้างข้อมูลจำลอง
    // ไม่ต้องเพิ่มข้อมูลจำลองใดๆ แม้ข้อมูลจะมีน้อยเกินไปก็ตาม
    return data;
  };
  
  // Get chart data for current selections - use memoized version to avoid recalculations
  const chartData = React.useMemo(() => {
    // log ข้อมูลเพื่อ debug
    console.log("Analytics Widget Data:", { 
      currentGraphType, 
      currentMetric, 
      currentPeriod, 
      weightPeriod,
      selectedDate,
      hasLogs: Object.keys(dailyLogs).length > 0,
      goals 
    });
    
    let data;
    if (currentGraphType === "weight") {
      // Get weight data - use weightPeriod for weight data
      data = getWeightData(weightPeriod, dailyLogs, goals, getDateLocale, selectedDate);
    } else {
      // Get regular analytics data
      data = getAnalyticsData(currentMetric, currentPeriod, dailyLogs, goals, getDateLocale, selectedDate);
    }
    
    // ตรวจสอบว่ามีข้อมูลจริงหรือไม่
    if (!data || data.length === 0 || data.every(item => item.value === 0)) {
      console.log("No valid data found for this period");
      return [];
    }
    
    return data;
  }, [currentMetric, currentPeriod, weightPeriod, dailyLogs, goals, locale, currentGraphType, selectedDate]);
  
  // Get translations for metrics
  const getMetricTranslation = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        analytics: "Analytics",
        nutrition: "Nutrition",
        calories: "Calories",
        protein: "Protein",
        fat: "Fat",
        carbs: "Carbs",
        water: "Water",
        weight: "Weight",
        goal: "Goal",
        average: "Average",
        week: "Week",
        month: "Month",
        year: "Year",
        today: "Today",
        "7d": "7 Days",
        "4w": "4 Weeks",
        "12m": "12 Months",
        "30d": "30 Days",
        "180d": "6 Months", 
        "365d": "1 Year",
        "all": "All Time"
      },
      th: {
        analytics: "การวิเคราะห์",
        nutrition: "โภชนาการ",
        calories: "แคลอรี่",
        protein: "โปรตีน",
        fat: "ไขมัน",
        carbs: "คาร์บ",
        water: "น้ำ",
        weight: "น้ำหนัก",
        goal: "เป้าหมาย",
        average: "เฉลี่ย",
        week: "สัปดาห์",
        month: "เดือน",
        year: "ปี",
        today: "วันนี้",
        "7d": "7 วัน",
        "4w": "4 สัปดาห์",
        "12m": "12 เดือน",
        "30d": "30 วัน",
        "180d": "6 เดือน",
        "365d": "1 ปี",
        "all": "ทั้งหมด"
      },
      ja: {
        analytics: "分析",
        nutrition: "栄養",
        calories: "カロリー",
        protein: "タンパク質",
        fat: "脂肪",
        carbs: "炭水化物",
        water: "水分",
        weight: "体重",
        goal: "目標",
        average: "平均",
        week: "週間",
        month: "月間",
        year: "年間",
        today: "今日",
        "7d": "7日間",
        "4w": "4週間",
        "12m": "12ヶ月",
        "30d": "30日間",
        "180d": "6ヶ月",
        "365d": "1年間",
        "all": "全期間"
      },
      zh: {
        analytics: "分析",
        nutrition: "营养",
        calories: "卡路里",
        protein: "蛋白质",
        fat: "脂肪",
        carbs: "碳水化合物",
        water: "水分",
        weight: "体重",
        goal: "目标",
        average: "平均",
        week: "周",
        month: "月",
        year: "年",
        today: "今天",
        "7d": "7天",
        "4w": "4周",
        "12m": "12个月",
        "30d": "30天",
        "180d": "6个月",
        "365d": "1年",
        "all": "全部时间"
      }
    };
    
    const currentLocale = locale as keyof typeof translations;
    const fallbackLocale = "en";
    
    return translations[currentLocale]?.[key] || translations[fallbackLocale][key] || key;
  };
  
  // Get unit for current metric
  const getMetricUnit = (metric: string) => {
    switch(metric) {
      case 'calories':
        return getMetricTranslation("kcal");
      case 'protein':
      case 'fat':
      case 'carbs':
        return getMetricTranslation("g");
      case 'water':
        return 'ml';
      case 'weight':
        return getMetricTranslation("kg");
      default:
        return '';
    }
  };
  
  const handleMetricChange = (metric: string) => {
    // Update chart direction for animation
    const metrics = ['calories', 'protein', 'fat', 'carbs', 'water', 'weight'];
    const currentIndex = metrics.indexOf(currentMetric);
    const newIndex = metrics.indexOf(metric);
    setChartDirection(newIndex > currentIndex ? 1 : -1);
    
    // Update current metric
    setCurrentMetric(metric);
  };
  
  const handlePeriodChange = (period: string) => {
    setCurrentPeriod(period);
  };
  
  // Get visual indicators for metrics
  const metrics = ['calories', 'protein', 'fat', 'carbs', 'water', 'weight'];
  const currentIndex = metrics.indexOf(currentMetric);

  // Get translations for graph types
  const getGraphTypeTranslation = (type: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        nutrients: "Macros",
        water: "Water",
        weight: "Weight"
      },
      th: {
        nutrients: "สารอาหาร",
        water: "น้ำ",
        weight: "น้ำหนัก"
      },
      ja: {
        nutrients: "栄養素",
        water: "水分",
        weight: "体重"
      },
      zh: {
        nutrients: "营养素",
        water: "水分",
        weight: "体重"
      }
    };
    
    const currentLocale = locale as keyof typeof translations;
    const fallbackLocale = "en";
    
    return translations[currentLocale]?.[type] || translations[fallbackLocale][type] || type;
  };
  
  // Get icon for graph type
  const getGraphTypeIcon = (type: string) => {
    switch(type) {
      case 'nutrients':
        return <PieChart className="h-3 w-3" />;
      case 'water':
        return <Droplets className="h-3 w-3" />;
      case 'weight':
        return <Weight className="h-3 w-3" />;
      default:
        return <PieChart className="h-3 w-3" />;
    }
  };

  // Update handler for graph type changes
  const handleGraphTypeChange = (type: "nutrients" | "water" | "weight") => {
    setCurrentGraphType(type);
    // Notify parent component if callback is provided
    if (onGraphTypeChange) {
      onGraphTypeChange(type);
    }
  };

  return (
    <Card className="relative p-5 shadow-md rounded-2xl overflow-hidden">
      {/* Theme-compatible decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br from-[hsl(var(--background))]/10 to-[hsl(var(--background))]/5 blur-xl"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-gradient-to-tr from-[hsl(var(--background))]/15 to-[hsl(var(--background))]/5 blur-xl"></div>
      </div>
      
      <div className="relative flex flex-col space-y-4">
        {/* Title and Graph Type Selector */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-9 w-9 bg-violet-500 rounded-full flex items-center justify-center text-white"
            >
              <Activity className="h-5 w-5" />
            </motion.div>
            <h2 className="text-base font-medium text-[hsl(var(--foreground))]">
              {getMetricTranslation("analytics")}
            </h2>
          </div>
          
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2 flex items-center gap-1 text-xs">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {currentGraphType === "weight" 
                    ? getWeightPeriodLabel(weightPeriod) 
                    : getMetricTranslation(currentPeriod)}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {currentGraphType === "weight" ? (
                  // Weight-specific periods
                  <>
                    <DropdownMenuItem onClick={() => setWeightPeriod("30d")}>
                      {getMetricTranslation("30d") || "30 Days"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setWeightPeriod("180d")}>
                      {getMetricTranslation("180d") || "6 Months"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setWeightPeriod("365d")}>
                      {getMetricTranslation("365d") || "1 Year"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setWeightPeriod("all")}>
                      {getMetricTranslation("all") || "All Time"}
                    </DropdownMenuItem>
                  </>
                ) : (
                  // Standard periods for other metrics
                  ['7d', '4w', '12m'].map((period) => (
                    <DropdownMenuItem 
                key={period}
                  onClick={() => handlePeriodChange(period)}
                      className={currentPeriod === period ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : ''}
                >
                  {getMetricTranslation(period)}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
        
        {/* Graph Type Selector - New Component */}
        <motion.div
          variants={graphTypeSelectorVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-1 p-1 bg-[hsl(var(--muted))] rounded-full text-xs">
            {(['nutrients', 'water', 'weight'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleGraphTypeChange(type)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 ${
                  currentGraphType === type
                    ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
                aria-label={`Show ${type} graph`}
              >
                <span className="flex items-center gap-1.5">
                  {getGraphTypeIcon(type)}
                  <span>{getGraphTypeTranslation(type)}</span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Chart Area */}
        <div 
          className="h-60 w-full relative overflow-hidden rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-2"
        >
          {chartData.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
              ไม่มีข้อมูลสำหรับช่วงเวลานี้
            </div>
          ) : (
            <AnimatePresence custom={chartDirection} mode="popLayout">
              <motion.div
                key={currentMetric + currentPeriod}
                custom={chartDirection}
                variants={chartContainerVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0"
              >
                {/* Visual goal indicator */}
                {chartData.length > 0 && (
                  <div 
                    className="absolute right-12 h-full w-px bg-[hsl(var(--muted))]/90 z-10 pointer-events-none"
                    style={{
                      height: '70%',
                      top: '15%'
                    }}
                  />
                )}
                
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 10, left: -10, bottom: 20 }}
                    barGap={2}
                    barSize={currentPeriod === '12m' ? 12 : currentPeriod === '4w' ? 20 : 30}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 500 }}
                      tickMargin={8}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => value === 0 ? '' : value.toString()}
                      width={30}
                    />
                    <Tooltip
                      formatter={(value: number) => {
                        return [
                          `${Math.round(value)} ${currentMetric === 'water' ? 'ml' : getMetricUnit(currentMetric)}`,
                          getMetricTranslation(currentMetric)
                        ] as [string, string];
                      }}
                      labelFormatter={(name, payload) => {
                        if (payload && payload.length > 0) {
                          const date = payload[0].payload.date;
                          return format(parse(date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d', { locale: getDateLocale() });
                        }
                        return name;
                      }}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0px 4px 20px hsl(var(--foreground)/0.05)',
                        backgroundColor: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        padding: '8px 12px'
                      }}
                      trigger="click"
                    />
                    {/* Reference Line for Goal */}
                    {chartData.length > 0 && chartData[0].goal > 0 && (
                      <ReferenceLine 
                        y={chartData[0].goal} 
                        stroke="hsl(var(--primary))"
                        strokeDasharray="3 3"
                        strokeWidth={2}
                        opacity={0.7}
                        label={{
                          value: `${getMetricTranslation("goal")}: ${chartData[0].goal}${currentMetric === 'water' ? ' ml' : getMetricUnit(currentMetric)}`,
                          fill: "hsl(var(--primary))",
                          fontSize: 10,
                          position: 'right'
                        }}
                      />
                    )}
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <Bar 
                      dataKey="value" 
                      fill="url(#barGradient)"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      stroke="hsl(var(--primary))"
                      strokeWidth={1}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill="url(#barGradient)"
                          stroke="hsl(var(--primary))"
                          strokeWidth={0.5}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Metric Pills - Only show for nutrients */}
        {currentGraphType === "nutrients" && (
        <motion.div 
          className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar"
          variants={pillContainerVariants}
          initial="hidden"
          animate="visible"
        >
            {['calories', 'protein', 'fat', 'carbs'].map((metric, index) => (
            <motion.div 
              key={metric} 
              variants={pillItemVariants}
              custom={index}
              transition={{ delay: 0.1 * index }}
            >
              <Button
                variant={currentMetric === metric ? "default" : "outline"}
                size="sm"
                onClick={() => handleMetricChange(metric)}
                className={`px-3 py-1 text-xs h-8 whitespace-nowrap rounded-full transition-all duration-200 
                  ${currentMetric === metric 
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]' 
                    : 'hover:bg-[hsl(var(--muted))] border-[hsl(var(--border))]'}`}
              >
                <span className="flex items-center gap-1">
                  {getMetricTranslation(metric)}
                </span>
              </Button>
            </motion.div>
          ))}
        </motion.div>
        )}
        
        {/* Stat Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center pt-1 px-1"
        >
          {/* แสดง Average เฉพาะกรณีที่ไม่ใช่กราฟน้ำหนัก และมีข้อมูล */}
          {currentGraphType !== "weight" && chartData.length > 0 && (
            <div className="flex flex-col">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {getMetricTranslation("average")}
              </span>
              <span className="font-semibold text-sm text-[hsl(var(--foreground))]">
                {currentGraphType === "water" 
                  // สำหรับน้ำ ใช้หน่วย ml และคำนวณเฉลี่ยจาก water ไม่ใช่ calories
                  ? `${Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / Math.max(1, chartData.length))} ml`
                  // สำหรับโภชนาการ ใช้ค่าและหน่วยของ metric ปัจจุบัน
                  : `${Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / Math.max(1, chartData.length))} ${getMetricUnit(currentMetric)}`
                }
              </span>
            </div>
          )}
          
          {/* แสดง Goal */}
          <div className={`flex flex-col ${currentGraphType === "weight" || chartData.length === 0 ? "w-full" : "items-end"}`}>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {getMetricTranslation("goal")}
            </span>
            <span className="font-semibold text-sm text-[hsl(var(--foreground))]">
              {chartData.length > 0 
                ? currentGraphType === "water" 
                  ? `${chartData[0].goal} ml` 
                  : `${chartData[0].goal} ${getMetricUnit(currentMetric)}`
                : currentGraphType === "water"
                  ? `${goals.water || 2000} ml`
                  : currentGraphType === "weight"
                    ? `${goals.weight || 70} ${getMetricUnit("weight")}`
                    : `${currentMetric === "calories" ? goals.calories || 2000 : 
                        currentMetric === "protein" ? Math.round(((goals.protein || 30) / 100) * (goals.calories || 2000) / 4) :
                        currentMetric === "fat" ? Math.round(((goals.fat || 30) / 100) * (goals.calories || 2000) / 9) : 
                        Math.round(((goals.carbs || 40) / 100) * (goals.calories || 2000) / 4)
                      } ${getMetricUnit(currentMetric)}`
              }
            </span>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}; 

// Helper function to get weight period label
function getWeightPeriodLabel(period: string) {
  switch (period) {
    case "30d": return "30 Days";
    case "180d": return "6 Months";
    case "365d": return "1 Year";
    case "all": return "All Time";
    default: return "30 Days";
  }
} 