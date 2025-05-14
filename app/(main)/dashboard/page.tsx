"use client";

import React, { useState, useEffect, useRef, lazy, Suspense, useContext } from "react";
import { motion, AnimatePresence, useDragControls, useMotionValue, useTransform, animate } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNutrition } from "@/components/providers/nutrition-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { dashboardTranslations, formatTranslation } from "@/app/locales/dashboard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import {
  ArrowRight, Plus, Utensils, BarChart3, Settings, Calendar as CalendarIcon,
  ArrowLeft, ArrowRight as ArrowRightIcon, ChevronLeft, ChevronRight, Edit, Save,
  Sun, Moon, Check, SmilePlus, Pencil, X, Trash2, Minus, UtensilsCrossed,
  LayoutGrid, Eye, EyeOff, Activity, Droplet, Scale, GripVertical
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { format, addDays, subDays, startOfWeek, endOfWeek, addMonths, subMonths, parse, isSameDay, getMonth, getYear, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isYesterday, isTomorrow } from "date-fns";
import { th, ja, zhCN } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/components/ui/use-toast';
import { WaterTracker } from "@/components/ui/water-tracker";
import { WeightTracker } from "@/components/ui/weight-tracker";
import { AnalyticsWidget } from "@/components/ui/analytics-widget";
import MoodEmoji from "@/components/ui/mood-emoji";
import { usePopups } from "@/components/providers/popups-provider";
import { Separator } from "@/components/ui/separator";

// สร้าง components wrappers ที่เป็น default export
const WaterTrackerWrapper = lazy(() =>
  import("@/components/ui/water-tracker").then(mod => ({
    default: (props: any) => <WaterTracker {...props} />
  }))
);

const WeightTrackerWrapper = lazy(() =>
  import("@/components/ui/weight-tracker").then(mod => ({
    default: (props: any) => <WeightTracker {...props} />
  }))
);

const AnalyticsWidgetWrapper = lazy(() =>
  import("@/components/ui/analytics-widget").then(mod => ({
    default: (props: any) => <AnalyticsWidget {...props} />
  }))
);

// Import dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Widget types and icons with beautiful colors
const WIDGET_TYPES = {
  NUTRITION: { icon: <BarChart3 className="h-5 w-5" />, color: "bg-blue-500" },
  MEAL: { icon: <UtensilsCrossed className="h-5 w-5" />, color: "bg-orange-500" },
  ANALYTICS: { icon: <Activity className="h-5 w-5" />, color: "bg-violet-500" },
  WATER: { icon: <Droplet className="h-5 w-5" />, color: "bg-cyan-500" },
  WEIGHT: { icon: <Scale className="h-5 w-5" />, color: "bg-emerald-500" },
  MOOD: { icon: <SmilePlus className="h-5 w-5" />, color: "bg-amber-500" },
  CALENDAR: { icon: <CalendarIcon className="h-5 w-5" />, color: "bg-indigo-500" }
};

// ปรับ animation variants ให้เร็วขึ้น
const container = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02, // ลดจาก 0.05
      duration: 0.2, // ลดจาก 0.3
      ease: "easeOut"
    }
  }
};

const item = {
  hidden: { y: 5, opacity: 1 }, // ลด y จาก 10 เป็น 5
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.15, // ลดจาก 0.2
      ease: "easeOut"
    }
  }
};

const calendarVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

// Calendar popup animation variants
const popupVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

// Overlay animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: "easeInOut"
    }
  }
};

// Bottom sheet animation variants
const bottomSheetVariants = {
  hidden: {
    y: "100%",
    opacity: 0.8,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 40
    }
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 35
    }
  },
  exit: {
    y: "100%",
    opacity: 0.5,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 40
    }
  }
};

// Define colors - updating with more vibrant, cute theme-compatible colors
const COLORS = {
  protein: {
    light: "hsl(260, 80%, 65%)",
    dark: "hsl(260, 80%, 70%)",
    gradient: "linear-gradient(135deg, hsl(260, 80%, 65%), hsl(260, 60%, 75%))"
  },
  fat: {
    light: "hsl(330, 80%, 65%)",
    dark: "hsl(330, 80%, 70%)",
    gradient: "linear-gradient(135deg, hsl(330, 80%, 65%), hsl(330, 60%, 75%))"
  },
  carbs: {
    light: "hsl(35, 90%, 60%)",
    dark: "hsl(35, 90%, 65%)",
    gradient: "linear-gradient(135deg, hsl(35, 90%, 60%), hsl(35, 80%, 70%))"
  }
};

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_OF_WEEK_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const DAYS_OF_WEEK_JA = ["日", "月", "火", "水", "木", "金", "土"];
const DAYS_OF_WEEK_ZH = ["日", "一", "二", "三", "四", "五", "六"];

// ลบคลาส CalendarPopup ที่มีอยู่เดิมออก และ import component ใหม่แทน
import CalendarPopup from "@/components/ui/calendar-popup";
import LayoutEditor from "@/components/ui/layout-editor";
import BottomSheet from "@/components/ui/bottom-sheet";

// เพิ่ม DateSelector component
const DateSelector = ({
  selectedDate,
  onSelectDate,
  onOpenCalendar,
  isSticky,
  dateLocale,
  t
}: {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenCalendar: () => void;
  isSticky: boolean;
  dateLocale: any;
  t: any;
}) => {
  const selectedDateObj = parse(selectedDate, 'yyyy-MM-dd', new Date());

  return (
    <div className={`flex items-center ${isSticky ? 'justify-center px-4 pt-5 pb-1' : 'justify-center'}`}>
                <Button
                  variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          onSelectDate(format(subDays(selectedDateObj, 1), 'yyyy-MM-dd'));
        }}
        className="h-8 w-8 rounded-full mr-1"
      >
        <ChevronLeft className="h-4 w-4" />
                </Button>

      <div
        className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenCalendar();
        }}
      >
        <div
          className="h-7 w-7 bg-[hsl(var(--accent))]/10 rounded-full flex items-center justify-center"
        >
          <CalendarIcon className="h-4 w-4" />
                </div>
        <h2 className="text-md font-semibold text-[hsl(var(--foreground))]">
          {isToday(selectedDateObj)
            ? t.today
            : format(selectedDateObj, 'EEE, d MMM', { locale: dateLocale })}
        </h2>
              </div>

                    <Button
                      variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          onSelectDate(format(addDays(selectedDateObj, 1), 'yyyy-MM-dd'));
        }}
        className="h-8 w-8 rounded-full ml-1"
        disabled={isToday(selectedDateObj)}
      >
        <ChevronRight className="h-4 w-4" />
                    </Button>
              </div>
  );
};

// กำหนด DashboardContext เพื่อส่งค่า showAllSlideControls ลงไปยัง SwipeToRevealControls
const DashboardContext = React.createContext<{ showAllSlideControls: boolean }>({ showAllSlideControls: false });

export default function DashboardPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = dashboardTranslations[locale as keyof typeof dashboardTranslations] || dashboardTranslations.en;
  const { getTodayStats, goals, recentMeals = [], getDailyMood } = useNutrition();
  const { dailyLogs, setCurrentDate, currentDate, updateDailyMood } = useNutritionStore();
  const dragControls = useDragControls();
  
  // เพิ่ม usePopups hook
  const { 
    openCalendar, 
    openLayoutEditor, 
    openEditMeal,
    isAnyModalOpen 
  } = usePopups();

  // State for calendar
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const selectedDateObj = parse(selectedDate, 'yyyy-MM-dd', new Date());

  // State for mood and notes
  const [notes, setNotes] = useState("");
  const [moodRating, setMoodRating] = useState<number | undefined>(undefined);
  const [saved, setSaved] = useState(false);

  // State for meal history editing - เปลี่ยน state เป็น constant แบบ false ถาวร
  const isEditingMeals = false; // เปลี่ยนจาก state เป็น constant false
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);

  // State for graph type selection
  const [selectedGraphType, setSelectedGraphType] = useState<"nutrients" | "water" | "weight">("nutrients");

  // State for widget visibility
  const [widgetVisibility, setWidgetVisibility] = useState<Record<string, boolean>>({
    nutritionSummary: true,
    analyticsWidget: true,
    waterTracker: true,
    weightTracker: true,
    mealHistory: true,
    moodNotes: true
  });

  // Add state for widget order
  const [widgetOrder, setWidgetOrder] = useState([
    'nutritionSummary',
    'mealHistory',
    'waterTracker',
    'weightTracker',
    'analyticsWidget',
    'moodNotes'
  ]);

  // Add state for temporary order during editing
  const [tempWidgetOrder, setTempWidgetOrder] = useState<string[]>([]);

  // State and ref for sticky date selector
  const [isDateSelectorSticky, setIsDateSelectorSticky] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const stickyThreshold = useRef<number>(0);

  // เพิ่ม state เพื่อ toggle การแสดง slide controls ทั้งหมด
  const [showAllSlideControls, setShowAllSlideControls] = useState(false);

  // Set current date to today when loading the Dashboard
  useEffect(() => {
    const todayDate = new Date().toISOString().split('T')[0];
    setCurrentDate(todayDate);
    setSelectedDate(todayDate);
  }, [setCurrentDate]);

  // Setup scroll listener for sticky date selector
  useEffect(() => {
    const handleScroll = () => {
      if (!dateRef.current) return;

      if (stickyThreshold.current === 0) {
        // Initialize threshold on first scroll
        stickyThreshold.current = dateRef.current.offsetTop;
      }

      const scrollY = window.scrollY;
      // Make the date selector sticky when scrolled past the threshold
      // No longer checking for nutritionSummary visibility
      setIsDateSelectorSticky(scrollY > stickyThreshold.current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load saved widget order from localStorage if available
    const savedWidgetOrder = localStorage.getItem('dashboardWidgetOrder');
    if (savedWidgetOrder) {
      try {
        const parsedOrder = JSON.parse(savedWidgetOrder);
        // Validate that all widgets exist in the parsed order
        const allWidgetsPresent = Object.keys(widgetVisibility).every(
          widget => parsedOrder.includes(widget)
        );
        if (parsedOrder.length === Object.keys(widgetVisibility).length && allWidgetsPresent) {
          setWidgetOrder(parsedOrder);
        }
      } catch (e) {
        console.error('Failed to parse saved widget order', e);
      }
    }
  }, []);

  // Create additional translations for meal editing feature
  const additionalTranslations = {
    edit: locale === 'th' ? 'แก้ไข' : locale === 'ja' ? '編集' : locale === 'zh' ? '编辑' : 'Edit',
    done: locale === 'th' ? 'เสร็จสิ้น' : locale === 'ja' ? '完了' : locale === 'zh' ? '完成' : 'Done',
    confirmDelete: locale === 'th' ? 'ยืนยันการลบ' : locale === 'ja' ? '削除の確認' : locale === 'zh' ? '确认删除' : 'Confirm Delete',
    confirmDeleteMessage: locale === 'th' ? 'คุณแน่ใจหรือว่าต้องการลบรายการอาหารนี้? การกระทำนี้ไม่สามารถย้อนกลับได้' :
      locale === 'ja' ? 'この食事を削除してもよろしいですか？この操作は元に戻せません。' :
        locale === 'zh' ? '您确定要删除此餐食吗？此操作无法撤消。' :
          'Are you sure you want to delete this meal? This cannot be undone.',
    cancel: locale === 'th' ? 'ยกเลิก' : locale === 'ja' ? 'キャンセル' : locale === 'zh' ? '取消' : 'Cancel',
    delete: locale === 'th' ? 'ลบ' : locale === 'ja' ? '削除' : locale === 'zh' ? '删除' : 'Delete',
    editMeal: locale === 'th' ? 'แก้ไขอาหาร' : locale === 'ja' ? '食事の編集' : locale === 'zh' ? '编辑餐食' : 'Edit Meal',
    quantity: locale === 'th' ? 'จำนวน' : locale === 'ja' ? '量' : locale === 'zh' ? '数量' : 'Quantity',
    per: locale === 'th' ? 'ต่อ' : locale === 'ja' ? 'あたり' : locale === 'zh' ? '每' : 'per',
    save: locale === 'th' ? 'บันทึกการเปลี่ยนแปลง' : locale === 'ja' ? '変更を保存' : locale === 'zh' ? '保存更改' : 'Save Changes',
    editLayout: locale === 'th' ? 'แก้ไขเลย์เอาต์' : locale === 'ja' ? 'レイアウト編集' : locale === 'zh' ? '编辑布局' : 'Edit Layout',
    saveLayout: locale === 'th' ? 'บันทึกเลย์เอาต์' : locale === 'ja' ? 'レイアウト保存' : locale === 'zh' ? '保存布局' : 'Save Layout',
    nutritionSummary: locale === 'th' ? 'สรุปโภชนาการ' : locale === 'ja' ? '栄養サマリー' : locale === 'zh' ? '营养摘要' : 'Nutrition Summary',
    mealHistory: locale === 'th' ? 'ประวัติมื้ออาหาร' : locale === 'ja' ? '食事履歴' : locale === 'zh' ? '用餐历史' : 'Meal History',
    analytics: locale === 'th' ? 'การวิเคราะห์' : locale === 'ja' ? '分析' : locale === 'zh' ? '分析' : 'Analytics',
    waterTracker: locale === 'th' ? 'ติดตามการดื่มน้ำ' : locale === 'ja' ? '水分トラッカー' : locale === 'zh' ? '水分追踪' : 'Water Tracker',
    weightTracker: locale === 'th' ? 'ติดตามน้ำหนัก' : locale === 'ja' ? '体重トラッカー' : locale === 'zh' ? '体重追踪' : 'Weight Tracker',
    moodNotes: locale === 'th' ? 'อารมณ์และบันทึก' : locale === 'ja' ? '気分とメモ' : locale === 'zh' ? '心情笔记' : 'Mood & Notes',
    mealUpdated: locale === 'th' ? 'อาหารถูกแก้ไขแล้ว' : locale === 'ja' ? '食事が更新されました' : locale === 'zh' ? '餐食已更新' : 'Meal Updated',
    mealUpdatedMessage: locale === 'th' ? 'อาหารถูกแก้ไขแล้ว' : locale === 'ja' ? '食事が更新されました' : locale === 'zh' ? '餐食已更新' : 'Meal Updated Message',
    foodName: locale === 'th' ? 'ชื่ออาหาร' : locale === 'ja' ? '食品名' : locale === 'zh' ? '食品名称' : 'Food Name',
    servingSize: locale === 'th' ? 'หน่วยเสิร์ฟ' : locale === 'ja' ? '1食分' : locale === 'zh' ? '份量' : 'Serving Size',
    calories: locale === 'th' ? 'แคลอรี่' : locale === 'ja' ? 'カロリー' : locale === 'zh' ? '卡路里' : 'Calories',
    protein: locale === 'th' ? 'โปรตีน' : locale === 'ja' ? 'タンパク質' : locale === 'zh' ? '蛋白质' : 'Protein',
    fat: locale === 'th' ? 'ไขมัน' : locale === 'ja' ? '脂肪' : locale === 'zh' ? '脂肪' : 'Fat',
    carbs: locale === 'th' ? 'คาร์โบไฮเดรต' : locale === 'ja' ? '炭水化物' : locale === 'zh' ? '碳水化合物' : 'Carbs',
    totalCalories: locale === 'th' ? 'แคลอรี่รวม' : locale === 'ja' ? '合計カロリー' : locale === 'zh' ? '总卡路里' : 'Total Calories'
  };

  // Combine translations
  const translations = { ...t, ...additionalTranslations };

  const getDateLocale = () => {
    switch (locale) {
      case 'th': return th;
      case 'ja': return ja;
      case 'zh': return zhCN;
      default: return undefined;
    }
  };

  const getDaysOfWeekLabels = () => {
    switch (locale) {
      case 'th': return DAYS_OF_WEEK_TH;
      case 'ja': return DAYS_OF_WEEK_JA;
      case 'zh': return DAYS_OF_WEEK_ZH;
      default: return DAYS_OF_WEEK;
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonthDate(prevDate => subMonths(prevDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonthDate(prevDate => addMonths(prevDate, 1));
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setCurrentDate(date);
  };

  const goToToday = () => {
    const todayDate = new Date().toISOString().split('T')[0];
    handleSelectDate(todayDate);
  };

  // Get stats for the currently selected date
  const getStatsForSelectedDate = () => {
    const dayLog = dailyLogs[selectedDate] || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      meals: []
    };

    return {
      calories: dayLog.totalCalories,
      protein: dayLog.totalProtein,
      carbs: dayLog.totalCarbs,
      fat: dayLog.totalFat,
      meals: dayLog.meals
    };
  };

  const selectedDayStats = getStatsForSelectedDate();
  const { calories = 0, protein = 0, carbs = 0, fat = 0, meals = [] } = selectedDayStats;

  // Calculate calorie-related values
  const caloriesRemaining = Math.max(0, goals.calories - calories);
  const caloriesPercentage = Math.min(100, (calories / goals.calories) * 100);

  // Function to get theme-compatible colors
  const getCurrentThemeColors = () => {
    // Default colors for light theme
    let proteinColor = COLORS.protein.light;
    let fatColor = COLORS.fat.light;
    let carbsColor = COLORS.carbs.light;

    // Adjust colors based on current theme
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      const isChocolate = document.documentElement.classList.contains('chocolate');
      const isSweet = document.documentElement.classList.contains('sweet');
      const isBroccoli = document.documentElement.classList.contains('broccoli');
      const isWatermelon = document.documentElement.classList.contains('watermelon');
      const isHoney = document.documentElement.classList.contains('honey');

      if (isDark) {
        proteinColor = COLORS.protein.dark;
        fatColor = COLORS.fat.dark;
        carbsColor = COLORS.carbs.dark;
      } else if (isChocolate) {
        proteinColor = "hsl(25, 70%, 40%)";
        fatColor = "hsl(15, 80%, 50%)";
        carbsColor = "hsl(35, 90%, 45%)";
      } else if (isSweet) {
        proteinColor = "hsl(325, 90%, 80%)";
        fatColor = "hsl(350, 90%, 85%)";
        carbsColor = "hsl(35, 95%, 75%)";
      } else if (isBroccoli) {
        proteinColor = "hsl(120, 50%, 40%)";
        fatColor = "hsl(80, 60%, 45%)";
        carbsColor = "hsl(50, 90%, 55%)";
      } else if (isWatermelon) {
        proteinColor = "hsl(350, 80%, 55%)";  // แดงแตงโม
        fatColor = "hsl(140, 60%, 35%)";      // เขียวแตงโม
        carbsColor = "hsl(95, 70%, 45%)";     // เขียวอ่อน
      } else if (isHoney) {
        proteinColor = "hsl(28, 90%, 55%)";   // ส้มเข้ม
        fatColor = "hsl(35, 95%, 50%)";       // ส้มอำพัน
        carbsColor = "hsl(45, 100%, 60%)";    // เหลืองทอง
      }
    }

    return { proteinColor, fatColor, carbsColor };
  };

  // Prepare data for pie chart with enhanced properties
  const { proteinColor, fatColor, carbsColor } = getCurrentThemeColors();

  const data = [
    {
      name: t.protein,
      value: protein,
      goal: goals.protein || 0,
      color: proteinColor,
      gradient: COLORS.protein.gradient,
      icon: "🍗"
    },
    {
      name: t.fat,
      value: fat,
      goal: goals.fat || 0,
      color: fatColor,
      gradient: COLORS.fat.gradient,
      icon: "🥑"
    },
    {
      name: t.carbs,
      value: carbs,
      goal: goals.carbs || 0,
      color: carbsColor,
      gradient: COLORS.carbs.gradient,
      icon: "🍚"
    },
  ];

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(currentMonthDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const calendarDays = generateCalendarDays();
  const daysInWeek = getDaysOfWeekLabels();

  // Update mood and notes when selected date changes
  useEffect(() => {
    const moodData = getDailyMood(selectedDate) || { moodRating: undefined, notes: "" };
    setMoodRating(moodData.moodRating);
    setNotes(moodData.notes || "");
    setSaved(false);
  }, [selectedDate, getDailyMood]);

  // Save mood and notes
  const handleSaveMood = () => {
    if (moodRating) {
      updateDailyMood(selectedDate, moodRating, notes);
      setSaved(true);

      // Reset saved message after 2 seconds
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    }
  };

  // Function to handle meal deletion
  const handleDeleteMeal = (mealId: string) => {
    const mealToDeleteData = dailyLogs[selectedDate]?.meals.find(m => m.id === mealId);
    if (mealToDeleteData) {
      setMealToDelete(mealId);
    }
  };

  // Function to confirm delete
  const confirmDeleteMeal = async () => {
    if (mealToDelete) {
      // ใช้ฟังก์ชันลบข้อมูลที่มีอยู่แล้วแทน deleteMeal ที่ไม่ได้ถูกนิยาม
      if (dailyLogs[selectedDate]) {
        const updatedMeals = dailyLogs[selectedDate].meals.filter(meal => meal.id !== mealToDelete);

        // Update nutrition calculations
        const deletedMeal = dailyLogs[selectedDate].meals.find(meal => meal.id === mealToDelete);
        if (deletedMeal) {
          const mealCalories = deletedMeal.foodItem.calories * deletedMeal.quantity;
          const mealProtein = deletedMeal.foodItem.protein * deletedMeal.quantity;
          const mealCarbs = deletedMeal.foodItem.carbs * deletedMeal.quantity;
          const mealFat = deletedMeal.foodItem.fat * deletedMeal.quantity;

          // Update daily logs with recalculated totals
          const updatedDailyLog = {
            ...dailyLogs[selectedDate],
            meals: updatedMeals,
            totalCalories: dailyLogs[selectedDate].totalCalories - mealCalories,
            totalProtein: dailyLogs[selectedDate].totalProtein - mealProtein,
            totalCarbs: dailyLogs[selectedDate].totalCarbs - mealCarbs,
            totalFat: dailyLogs[selectedDate].totalFat - mealFat
          };

          // Update store
          useNutritionStore.setState({
            dailyLogs: {
              ...dailyLogs,
              [selectedDate]: updatedDailyLog
            }
          });
        }
      }

      // After deleting, close the modal
      setMealToDelete(null);
    }
  };

  // Function to cancel delete
  const cancelDeleteMeal = () => {
    setMealToDelete(null);
  };

  // Function to open meal edit dialog
  const handleEditMeal = (meal: any) => {
    openEditMeal(meal, meal.quantity);
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = (widgetKey: keyof typeof widgetVisibility) => {
    setWidgetVisibility(prev => ({
      ...prev,
      [widgetKey]: !prev[widgetKey]
    }));
  };

  // ปรับฟังก์ชั่นที่เปิด Layout Editor
  const enterLayoutEditMode = () => {
    const widgetItems = widgetOrder.map(widgetKey => ({
      id: widgetKey,
      label: typeof t[`${widgetKey}` as keyof typeof t] === 'string'
        ? t[`${widgetKey}` as keyof typeof t] as string
        : widgetKey,
      icon: getWidgetIcon(widgetKey),
      isVisible: widgetVisibility[widgetKey]
    }));
    
    // เรียกใช้ openLayoutEditor โดยส่ง callback เพื่อจัดการเมื่อมีการบันทึก layout
    openLayoutEditor(widgetItems);
  };

  // เพิ่มฟังก์ชันสำหรับบันทึก layout
  const handleSaveLayout = (newOrder: string[], visibility: Record<string, boolean>) => {
    // Save widget order to localStorage
    localStorage.setItem('dashboardWidgetOrder', JSON.stringify(newOrder));

    // Apply the new order
    setWidgetOrder(newOrder);
    setWidgetVisibility(visibility);
  };

  // Handle drag end for widget reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTempWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over.id.toString());

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Also add clean up of overflow-hidden class when component unmounts
  useEffect(() => {
    return () => {
      // Clean up code if needed
    };
  }, []);

  // แสดง placeholder ขณะ lazy loading
  const LoadingPlaceholder = () => (
    <div className="animate-pulse bg-[hsl(var(--muted))] h-[200px] rounded-2xl"></div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen pb-32">
      <DashboardContext.Provider value={{ showAllSlideControls }}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        <motion.div variants={item} className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
                {t.dashboard}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={enterLayoutEditMode}
              className="h-9 w-9 rounded-full"
            >
              <LayoutGrid className="h-5 w-5 text-[hsl(var(--foreground))]" />
            </Button>
          </div>
        </motion.div>

        {/* Sticky Date Selector - Shows when scrolled past the original date selector */}
        {isDateSelectorSticky && (
          <div className="fixed top-0 left-0 right-0 z-10 w-full p-2 shadow-sm backdrop-blur-md border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]" style={{marginTop: '0px'}}>
            <DateSelector 
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onOpenCalendar={() => openCalendar(selectedDate, handleSelectDate)}
              isSticky={true}
              dateLocale={getDateLocale()}
              t={t}
            />
          </div>
        )}

        <motion.div variants={item} ref={dateRef}>
          <DateSelector 
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onOpenCalendar={() => openCalendar(selectedDate, handleSelectDate)}
            isSticky={false}
            dateLocale={getDateLocale()}
            t={t}
          />
        </motion.div>

        {/* Widget display - uses the saved order */}
        {widgetOrder.map((widgetKey, index) => {
          // Only render visible widgets
          if (!widgetVisibility[widgetKey]) return null;

          // Render each widget according to its visibility and position in order
          switch (widgetKey) {
            case 'nutritionSummary':
              return (
                <motion.div key="nutritionSummary" variants={item}>
                  <Card className="p-5 shadow-md rounded-2xl overflow-hidden mt-1">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-9 w-9 rounded-full ${WIDGET_TYPES.NUTRITION.color} flex items-center justify-center text-white`}>
                          {WIDGET_TYPES.NUTRITION.icon}
                        </div>
                        <h2 className="text-base font-medium text-[hsl(var(--foreground))]">{t.calories}</h2>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {/* Calories */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[hsl(var(--muted-foreground))]">{t.calories}</span>
                          <span className="font-medium text-[hsl(var(--primary))]">
                            {Math.round(calories)} / {goals.calories} {t.kcal}
                          </span>
                        </div>
                        <Progress value={caloriesPercentage} className="h-2" />
                        <div className="text-right text-xs text-[hsl(var(--primary))]">
                          {Math.round(caloriesRemaining)} {t.kcal} {t.remaining}
                        </div>
                      </div>

                      {/* Macros Distribution Chart - Now part of the first card */}
                      <div className="relative h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                              {data.map((entry, index) => (
                                <linearGradient key={`gradient-card1-${index}`} id={`gradientFill-card1-${index}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.5} />
                                </linearGradient>
                              ))}
                            </defs>
                            {/* Show empty chart when no data */}
                            {protein === 0 && fat === 0 && carbs === 0 ? (
                              <Pie
                                data={[{ name: "empty", value: 1 }]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                cornerRadius={4}
                                startAngle={90}
                                endAngle={-270}
                                paddingAngle={0}
                              >
                                <Cell fill="hsl(var(--muted))" opacity={0.2} />
                                <Label
                                  content={() => (
                                    <g>
                                      <text
                                        x={100}
                                        y={90}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="text-2xl font-bold"
                                        fill="hsl(var(--foreground))"
                                      >
                                        0
                                      </text>
                                      <text
                                        x={100}
                                        y={110}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="text-xs"
                                        fill="hsl(var(--muted-foreground))"
                                      >
                                        {t.kcal}
                                      </text>
                                    </g>
                                  )}
                                />
                              </Pie>
                            ) : (
                              <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={3}
                                dataKey="value"
                                cornerRadius={4}
                                startAngle={90}
                                endAngle={-270}
                              >
                                {data.map((entry, index) => (
                                  <Cell
                                    key={`cell-card1-${index}`}
                                    fill={`url(#gradientFill-card1-${index})`}
                                    stroke={entry.color}
                                    strokeWidth={1.5}
                                  />
                                ))}
                                <Label
                                  content={() => (
                                    <g>
                                      <text
                                        x={100}
                                        y={90}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="text-2xl font-bold"
                                        fill="hsl(var(--foreground))"
                                      >
                                        {Math.round(calories)}
                                      </text>
                                      <text
                                        x={100}
                                        y={110}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="text-xs"
                                        fill="hsl(var(--muted-foreground))"
                                      >
                                        {t.kcal}
                                      </text>
                                    </g>
                                  )}
                                />
                              </Pie>
                            )}
                            <Tooltip
                              formatter={(value: number, name: string, props: any) => [
                                <span key="tooltip-value" className="flex items-center gap-1">
                                  <span className="text-lg">{props.payload.icon}</span>
                                  <span>
                                    <span className="font-medium">{Math.round(value)}{t.g}</span>
                                    <span className="text-xs ml-1 text-[hsl(var(--muted-foreground))]">
                                      ({Math.round((value / props.payload.goal) * 100)}%)
                                    </span>
                                  </span>
                                </span>,
                                name
                              ]}
                              contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0px 4px 20px hsl(var(--foreground)/0.05)',
                                backgroundColor: 'hsl(var(--background))',
                                color: 'hsl(var(--foreground))',
                                padding: '8px 12px'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Cute Macro Bubbles */}
                      <div className="grid grid-cols-3 gap-3">
                        {data.map((entry, index) => (
                          <div
                            key={`macro-${index}`}
                            className="flex flex-col items-center p-2 rounded-xl relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, hsl(var(--accent)/0.1), hsl(var(--accent)/0.05))`
                            }}
                          >
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: index * 0.15 }}
                              className="absolute inset-0 z-0 rounded-xl"
                              style={{
                                background: `linear-gradient(135deg, ${entry.color}20, ${entry.color}10)`,
                                border: `1px solid ${entry.color}30`
                              }}
                            />

                            <motion.div
                              className="text-2xl mb-1"
                              animate={{ y: [0, -2, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                            >
                              {entry.icon}
                            </motion.div>

                            <div className="text-xs font-medium text-[hsl(var(--foreground))]">{entry.name}</div>
                            <div className="text-xs font-bold" style={{ color: entry.color }}>
                              {Math.round(entry.value)}{t.g}
                              <span className="text-[10px] ml-1 text-[hsl(var(--muted-foreground))]">
                                /{Math.round(entry.goal)}{t.g}
                              </span>
                            </div>

                            {/* Progress bar for each macro nutrient */}
                            <div className="mt-1 w-full">
                              <div className="w-full h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(100, (entry.value / entry.goal) * 100)}%`,
                                    backgroundColor: entry.color
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            case 'mealHistory':
              return (
                <motion.div key="mealHistory" variants={item} className="mt-1">
                  <Card className="p-5 shadow-md rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-9 w-9 rounded-full ${WIDGET_TYPES.MEAL.color} flex items-center justify-center text-white`}>
                          {WIDGET_TYPES.MEAL.icon}
                        </div>
                        <h2 className="text-base font-medium text-[hsl(var(--foreground))]">{t.mealHistory}</h2>
                      </div>
                      {/* Edit and Filters Buttons */}
                      <div>
                          {meals.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                              onClick={() => setShowAllSlideControls(prev => !prev)}
                          className="h-7 w-7 p-0 rounded-full hover:bg-[hsl(var(--muted))]"
                        >
                              {showAllSlideControls 
                                ? <X className="h-3.5 w-3.5 text-red-500" /> 
                                : <Edit className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                              }
                              <span className="sr-only">{showAllSlideControls ? "Hide Controls" : "Show Controls"}</span>
                        </Button>
                          )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {meals.length === 0 ? (
                        <div className="text-center py-6 text-[hsl(var(--muted-foreground))] text-sm">
                          {t.noMealsOnThisDay}
                        </div>
                      ) : (
                        meals.map((meal, index) => (
                            <SwipeToRevealControls
                            key={meal.id || index}
                              meal={meal}
                              index={index}
                              onEdit={() => handleEditMeal(meal)}
                              onDelete={() => handleDeleteMeal(meal.id)}
                              isEditMode={isEditingMeals}
                              translations={translations}
                              t={t}
                              proteinColor={proteinColor}
                              fatColor={fatColor}
                              carbsColor={carbsColor}
                            />
                        ))
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            case 'waterTracker':
              return widgetVisibility.waterTracker && (
                <motion.div key="waterTracker" variants={item} className="mt-1">
                  <Suspense fallback={<LoadingPlaceholder />}>
                    <WaterTrackerWrapper date={selectedDate} />
                  </Suspense>
                </motion.div>
              );
            case 'weightTracker':
              return widgetVisibility.weightTracker && (
                <motion.div key="weightTracker" variants={item} className="mt-1">
                  <Suspense fallback={<LoadingPlaceholder />}>
                    <WeightTrackerWrapper date={selectedDate} />
                  </Suspense>
                </motion.div>
              );
            case 'analyticsWidget':
              return widgetVisibility.analyticsWidget && (
                <motion.div key="analyticsWidget" variants={item} className="mt-1">
                  <Suspense fallback={<LoadingPlaceholder />}>
                    <AnalyticsWidgetWrapper
                      dailyLogs={dailyLogs}
                      goals={goals}
                      graphType={selectedGraphType}
                      onGraphTypeChange={setSelectedGraphType}
                        selectedDate={selectedDate}
                    />
                  </Suspense>
                </motion.div>
              );
            case 'moodNotes':
              return widgetVisibility.moodNotes && (
                <motion.div key="moodNotes" variants={item} className="mt-1">
                  <Card className="p-5 shadow-md rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-9 w-9 rounded-full ${WIDGET_TYPES.MOOD.color} flex items-center justify-center text-white`}>
                          {WIDGET_TYPES.MOOD.icon}
                        </div>
                        <h2 className="text-base font-medium text-[hsl(var(--foreground))]">{t.mood}</h2>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{t.moodRating}</p>
                        <div className="flex justify-between items-center p-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <MoodEmoji
                              key={rating}
                              rating={rating}
                              selected={moodRating === rating}
                              onClick={() => setMoodRating(rating)}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] px-1 mt-1">
                          <span>{t.terrible}</span>
                          <span>{t.great}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{t.notes}</p>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full min-h-[100px] bg-[hsl(var(--muted))/0.15]"
                          placeholder={t.placeholder}
                        />
                        <div className="mt-2 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveMood}
                            className="text-xs px-3 py-1 h-8"
                            disabled={saved}
                          >
                            {saved ? t.saved : t.saveNotes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            default:
              return null;
          }
        })}

        {/* Delete Confirmation Dialog */}
          {mealToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-full max-w-sm mx-auto bg-[hsl(var(--background))] p-5 rounded-lg shadow-lg animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="h-5 w-5 text-[hsl(var(--destructive))]" />
                    <h3 className="text-lg font-semibold">{translations.confirmDelete}</h3>
              </div>
              
              <Separator className="my-2" />
              
              <p className="py-3 text-sm text-[hsl(var(--muted-foreground))]">
                      {translations.confirmDeleteMessage}
                    </p>

              <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                  size="sm"
                      onClick={cancelDeleteMeal}
                  className="h-9"
                    >
                      {translations.cancel}
                    </Button>
                    <Button
                      variant="destructive"
                  size="sm"
                      onClick={confirmDeleteMeal}
                  className="h-9"
                    >
                      {translations.delete}
                    </Button>
                  </div>
                </div>
                  </div>
        )}
      </motion.div>
      </DashboardContext.Provider>
    </div>
  );
}

// Helper function to get widget icon
const getWidgetIcon = (widgetKey: string) => {
  switch(widgetKey) {
    case 'nutritionSummary': return <BarChart3 className="h-4 w-4" />;
    case 'mealHistory': return <UtensilsCrossed className="h-4 w-4" />;
    case 'analyticsWidget': return <Activity className="h-4 w-4" />;
    case 'waterTracker': return <Droplet className="h-4 w-4" />;
    case 'weightTracker': return <Scale className="h-4 w-4" />;
    case 'moodNotes': return <SmilePlus className="h-4 w-4" />;
    default: return <LayoutGrid className="h-4 w-4" />;
  }
};

// SwipeToRevealControls component
const SwipeToRevealControls = ({
  meal,
  index,
  onEdit,
  onDelete,
  isEditMode,
  translations,
  t,
  proteinColor,
  fatColor,
  carbsColor
}: {
  meal: any;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isEditMode: boolean;
  translations: any;
  t: any;
  proteinColor: string;
  fatColor: string;
  carbsColor: string;
}) => {
  // Setup motion values for swipe controls
  const x = useMotionValue(0);
  const input = [-120, 0];
  const output = [1, 0];
  // Add translation transform for buttons
  const buttonsX = useTransform(x, input, [0, 100]); // เมื่อเลื่อนสุด (x=-120) ค่า buttonsX จะเป็น 0, เมื่อไม่เลื่อน (x=0) ค่า buttonsX จะเป็น 100
  const [isRevealed, setIsRevealed] = useState(false);
  
  // ให้ component ดึงค่า context ของ showAllSlideControls จาก parent
  const { showAllSlideControls } = useContext(DashboardContext);

  // เมื่อ showAllSlideControls เปลี่ยน ให้ปรับการแสดงปุ่มตาม - ใช้ animate แทน set เพื่อให้การเคลื่อนไหวสมูท
  useEffect(() => {
    if (showAllSlideControls) {
      // ใช้ animate แทน set เพื่อให้การเคลื่อนไหวสมูท
      animate(x, -120, {
        type: "spring",
        stiffness: 400,
        damping: 30
      });
      setIsRevealed(true);
    } else {
      animate(x, 0, {
        type: "spring",
        stiffness: 400,
        damping: 30
      });
      setIsRevealed(false);
    }
  }, [showAllSlideControls, x]);

  // Reset position if edit mode changes - ใช้ animate แทน set เพื่อให้การเคลื่อนไหวสมูท
  useEffect(() => {
    animate(x, 0, {
      type: "spring",
      stiffness: 400,
      damping: 30
    });
    setIsRevealed(false);
  }, [isEditMode, x]);

  // Handle drag end - ใช้ animate แทน set เพื่อให้การเคลื่อนไหวสมูท
  const handleDragEnd = (event: any, info: any) => {
    const threshold = -60;
    if (info.offset.x < threshold) {
      animate(x, -120, {
        type: "spring",
        stiffness: 400,
        damping: 30
      });
      setIsRevealed(true);
    } else {
      animate(x, 0, {
        type: "spring",
        stiffness: 400,
        damping: 30
      });
      setIsRevealed(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg my-1">
      {/* Controls that appear behind when swiped */}
      <motion.div 
        className="absolute right-0 top-0 bottom-0 flex items-center gap-1 px-4 h-full"
        style={{ 
          x: buttonsX 
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-9 w-9 p-0 rounded-full bg-blue-500/10 hover:bg-blue-500/20"
        >
          <Edit className="h-4 w-4 text-blue-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-9 w-9 p-0 rounded-full bg-red-500/10 hover:bg-red-500/20"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </motion.div>

      {/* Content that can be swiped */}
      <motion.div
        initial={{ opacity: 1, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03, duration: 0.2, ease: "easeOut" }}
        className={`py-2 px-3 rounded-lg 
          ${isRevealed ? 'bg-[hsl(var(--accent))/0.05]' : 'hover:bg-[hsl(var(--accent))/0.1]'} 
          transition-colors cursor-pointer`}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        dragDirectionLock
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (isRevealed) {
            animate(x, 0, {
              type: "spring", 
              stiffness: 400,
              damping: 30
            });
            setIsRevealed(false);
          }
        }}
      >
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                <div className="flex gap-x-1">
                  <span className="text-sm font-medium text-nowrap">{meal.foodItem.name}</span>
                  <span className="text-xs font-thin text-nowrap">({meal.quantity} {meal.foodItem.servingSize})</span>
                </div>
              </div>

              <div className="flex relative justify-between items-center text-xs text-[hsl(var(--muted-foreground))]">
                <span className="font-medium text-[hsl(var(--primary))]">
                  {Math.round(meal.foodItem.calories * meal.quantity)} {t.kcal}
                </span>
                {isEditMode ? (
                  <div className="flex absolute -top-1 right-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onEdit}
                      className="h-7 w-7 p-0 rounded-full hover:bg-[hsl(var(--primary))/0.1]"
                    >
                      <Edit className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDelete}
                      className="h-7 w-7 p-0 rounded-full hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center">
                        <span className="ml-0.5" style={{ color: proteinColor }}>{Math.round(meal.foodItem.protein * meal.quantity)}p</span>
                      </div>
                      <div className="flex items-center">
                        <span className="ml-0.5" style={{ color: fatColor }}>{Math.round(meal.foodItem.fat * meal.quantity)}f</span>
                      </div>
                      <div className="flex items-center">
                        <span className="ml-0.5" style={{ color: carbsColor }}>{Math.round(meal.foodItem.carbs * meal.quantity)}c</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 