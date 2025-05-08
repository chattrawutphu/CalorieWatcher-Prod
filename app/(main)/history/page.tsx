"use client";

import React, { useState, useEffect } from "react";
import { format, subDays, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, parse } from "date-fns";
import { th, ja, zhCN } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Droplet, Calendar as CalendarIcon, Smile, StickyNote, ArrowRight, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNutritionStore, DailyLog, MealEntry } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CalendarPopup from "@/components/ui/calendar-popup";

// Days of the week labels for different languages
const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_OF_WEEK_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const DAYS_OF_WEEK_JA = ["日", "月", "火", "水", "木", "金", "土"];
const DAYS_OF_WEEK_ZH = ["日", "一", "二", "三", "四", "五", "六"];

// Spring animation variants
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

// Date slider item animation variant
const sliderItem = {
  hidden: { opacity: 1 },
  show: { opacity: 1 }
};

export default function HistoryPage() {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const { dailyLogs } = useNutritionStore();
  const router = useRouter();
  
  // Local state
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Selected date entries
  const selectedDateEntries = dailyLogs[selectedDate]?.meals || [];

  // Function to format meal entry
  const formatMealEntry = (entry: MealEntry) => {
    return {
      ...entry,
      totalCalories: entry.foodItem.calories * entry.quantity,
      totalProtein: entry.foodItem.protein * entry.quantity,
      totalFat: entry.foodItem.fat * entry.quantity,
      totalCarbs: entry.foodItem.carbs * entry.quantity,
    };
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    const dateLocale = locale === 'th' ? th : locale === 'ja' ? ja : locale === 'zh' ? zhCN : undefined;
    return format(date, isToday(date) ? 'PPP (Today)' : 'PPP', { locale: dateLocale });
  };
  
  // Group meals by type
  const getMealsByType = (entries: MealEntry[] = []) => {
    const formattedEntries = entries.map(formatMealEntry);
    return formattedEntries.reduce((acc, entry) => {
      const type = entry.mealType || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(entry);
      return acc;
    }, {} as Record<string, MealEntry[]>);
  };

  // Handler for calendar date selection
  const handleCalendarDateSelect = (date: string) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };
  
  // Get date locale based on app language
  const getDateLocale = () => {
    switch (locale) {
      case 'th': return th;
      case 'ja': return ja;
      case 'zh': return zhCN;
      default: return undefined;
    }
  };

  // Render a meal type section
  const renderMealTypeSection = (mealType: string, meals: any[]) => {
    const title = mealType === 'breakfast' ? 'Breakfast' :
                  mealType === 'lunch' ? 'Lunch' :
                  mealType === 'dinner' ? 'Dinner' :
                  mealType === 'snack' ? 'Snack' :
                  mealType;
    
    // Skip empty meal types
    if (meals.length === 0) return null;
    
    return (
      <motion.div variants={item} className="mb-5" key={mealType}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="space-y-2">
          {meals.map((meal, index) => (
            <motion.div
              key={meal.id || index}
              variants={item}
              className="bg-[hsl(var(--card-hsl))] rounded-lg p-3 border border-[hsl(var(--border))]"
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{meal.foodItem.name}</h4>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {meal.quantity} {meal.foodItem.servingSize}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{Math.round(meal.totalCalories)} kcal</p>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] space-x-1">
                    <span className="text-blue-500">{Math.round(meal.totalProtein)}p</span>
                    <span className="text-pink-500">{Math.round(meal.totalFat)}f</span>
                    <span className="text-yellow-600">{Math.round(meal.totalCarbs)}c</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  // Group meals by type
  const mealsByType = getMealsByType(selectedDateEntries);
  
  return (
    <div className="max-w-md mx-auto pb-32">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="p-4 space-y-4"
      >
        {/* Header */}
        <motion.div variants={item} className="mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t.mobileNav?.navigation?.history || 'History'}</h1>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsCalendarOpen(true)}
              className="rounded-full"
            >
              <CalendarIcon className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
        
        {/* Date Display */}
        <motion.div variants={item} className="mb-2">
          <Card className="border border-[hsl(var(--border))]">
            <CardHeader className="py-4 px-5">
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(format(subDays(parse(selectedDate, 'yyyy-MM-dd', new Date()), 1), 'yyyy-MM-dd'))}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-base font-medium">
                  {formatDateForDisplay(selectedDate)}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const nextDay = format(
                      subDays(parse(selectedDate, 'yyyy-MM-dd', new Date()), -1), 
                      'yyyy-MM-dd'
                    );
                    // Only allow selection up to the current day
                    if (new Date(nextDay) <= new Date()) {
                      setSelectedDate(nextDay);
                    }
                  }}
                  disabled={isToday(parse(selectedDate, 'yyyy-MM-dd', new Date()))}
                  className="rounded-full"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
        
        {/* Daily Summary */}
        <motion.div variants={item} className="mb-4">
          <Card className="overflow-hidden">
            <CardHeader className="py-4 px-5 border-b border-[hsl(var(--border))]">
              <CardTitle className="text-base font-medium">Daily Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-3 bg-[hsl(var(--accent))]/10 rounded-lg">
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Total Calories</div>
                  <div className="text-xl font-semibold">{Math.round(dailyLogs[selectedDate]?.totalCalories || 0)} <span className="text-xs font-normal">kcal</span></div>
                </div>
                <div className="flex flex-col items-center p-3 bg-[hsl(var(--accent))]/10 rounded-lg">
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Total Protein</div>
                  <div className="text-xl font-semibold">{Math.round(dailyLogs[selectedDate]?.totalProtein || 0)} <span className="text-xs font-normal">g</span></div>
                </div>
                <div className="flex flex-col items-center p-3 bg-[hsl(var(--accent))]/10 rounded-lg">
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Total Fat</div>
                  <div className="text-xl font-semibold">{Math.round(dailyLogs[selectedDate]?.totalFat || 0)} <span className="text-xs font-normal">g</span></div>
                </div>
                <div className="flex flex-col items-center p-3 bg-[hsl(var(--accent))]/10 rounded-lg">
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Total Carbs</div>
                  <div className="text-xl font-semibold">{Math.round(dailyLogs[selectedDate]?.totalCarbs || 0)} <span className="text-xs font-normal">g</span></div>
                </div>
              </div>
              
              {/* Additional data if available */}
              {dailyLogs[selectedDate]?.waterIntake > 0 && (
                <div className="mt-4 p-3 bg-[hsl(var(--accent))]/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">Water Intake</span>
                  </div>
                  <span className="font-medium">{dailyLogs[selectedDate]?.waterIntake} ml</span>
                </div>
              )}
              
              {dailyLogs[selectedDate]?.moodRating && (
                <div className="mt-2 p-3 bg-[hsl(var(--accent))]/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smile className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm">Mood</span>
                  </div>
                  <span className="text-lg">
                    {dailyLogs[selectedDate]?.moodRating === 1 ? "😖" :
                     dailyLogs[selectedDate]?.moodRating === 2 ? "😔" :
                     dailyLogs[selectedDate]?.moodRating === 3 ? "😐" :
                     dailyLogs[selectedDate]?.moodRating === 4 ? "😊" :
                     dailyLogs[selectedDate]?.moodRating === 5 ? "😁" : ""}
                  </span>
                </div>
              )}
              
              {dailyLogs[selectedDate]?.notes && (
                <div className="mt-2 p-3 bg-[hsl(var(--accent))]/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">Notes</span>
                  </div>
                  <p className="text-sm">{dailyLogs[selectedDate]?.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Meal Entries */}
        <motion.div variants={item} className="mb-4">
          <h2 className="text-xl font-bold mb-3">Meals</h2>
          
          {selectedDateEntries.length === 0 ? (
            <div className="text-center py-10 bg-[hsl(var(--accent))]/5 rounded-lg border border-dashed border-[hsl(var(--border))]">
              <Sparkles className="h-10 w-10 text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
              <p className="text-[hsl(var(--muted-foreground))] mb-2">No meals logged for this day</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => router.push('/add')}
              >
                Add meal <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ) : (
            // Display meals grouped by type
            <>
              {renderMealTypeSection('breakfast', mealsByType['breakfast'] || [])}
              {renderMealTypeSection('lunch', mealsByType['lunch'] || [])}
              {renderMealTypeSection('dinner', mealsByType['dinner'] || [])}
              {renderMealTypeSection('snack', mealsByType['snack'] || [])}
              {renderMealTypeSection('other', mealsByType['other'] || [])}
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Calendar Popup */}
      <CalendarPopup
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={handleCalendarDateSelect}
      />
    </div>
  );
} 