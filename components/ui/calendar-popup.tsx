"use client";

import React, { useState, useEffect, memo } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek, addMonths, subMonths, parse, isSameDay, getMonth, getYear, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isYesterday, isTomorrow } from "date-fns";
import { th, ja, zhCN } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import BottomSheet from "@/components/ui/bottom-sheet";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { dashboardTranslations } from "@/app/locales/dashboard";

// Days of the week labels for different languages
const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_OF_WEEK_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const DAYS_OF_WEEK_JA = ["日", "月", "火", "水", "木", "金", "土"];
const DAYS_OF_WEEK_ZH = ["日", "一", "二", "三", "四", "五", "六"];

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  translationNamespace?: any;
}

const CalendarPopup = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  translationNamespace = dashboardTranslations
}: CalendarPopupProps) => {
  const { locale } = useLanguage();
  const t = translationNamespace[locale as keyof typeof translationNamespace] || translationNamespace.en;
  const { dailyLogs, goals } = useNutritionStore();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  useEffect(() => {
    // Set the current month to the month of the selected date when opening
    if (isOpen) {
      setCurrentMonthDate(parse(selectedDate, 'yyyy-MM-dd', new Date()));
    }
  }, [isOpen, selectedDate]);

  // Get date locale based on app language
  const getDateLocale = () => {
    switch (locale) {
      case 'th': return th;
      case 'ja': return ja;
      case 'zh': return zhCN;
      default: return undefined;
    }
  };

  // Get days of week labels based on app language
  const getDaysOfWeekLabels = () => {
    switch (locale) {
      case 'th': return DAYS_OF_WEEK_TH;
      case 'ja': return DAYS_OF_WEEK_JA;
      case 'zh': return DAYS_OF_WEEK_ZH;
      default: return DAYS_OF_WEEK;
    }
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonthDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonthDate(newDate);
  };

  const goToToday = () => {
    setCurrentMonthDate(new Date());
    onSelectDate(format(new Date(), 'yyyy-MM-dd', { locale: getDateLocale() }));

    // Add a slight delay before closing to allow tap/click feedback
    setTimeout(() => {
      onClose();
    }, 120);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(currentMonthDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  // Helper functions for displaying calendar data
  const hasEntries = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return dailyLogs[formattedDate] && dailyLogs[formattedDate].meals.length > 0;
  };

  const getEntryCount = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return dailyLogs[formattedDate]?.meals.length || 0;
  };

  const getTotalCalories = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return dailyLogs[formattedDate]?.totalCalories || 0;
  };

  const calendarDays = generateCalendarDays();
  const daysInWeek = getDaysOfWeekLabels();
  const selectedDateObj = parse(selectedDate, 'yyyy-MM-dd', new Date());

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    onSelectDate(formattedDate);

    // Add a slight delay before closing to allow tap/click feedback
    setTimeout(() => {
      onClose();
    }, 120);
  };

  const calendarTitle = t.calendar || "Calendar";

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={calendarTitle}
      showCloseButton={false}
      showDragHandle={true}
      height="fullscreen"
    >
      <div className="max-w-md mx-auto pt-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="text-xs px-2 py-1 h-8 text-[hsl(var(--primary))]"
          >
            {t.today || "Today"}
          </Button>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              className="rounded-full w-8 h-8"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-base font-medium mx-2">
              {format(currentMonthDate, 'MMMM yyyy', { locale: getDateLocale() })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              className="rounded-full w-8 h-8"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="w-16"></div> {/* Spacer for balance */}
        </div>

        <div className="grid grid-cols-7 text-center mb-2">
          {daysInWeek.map((day, i) => (
            <div key={i} className="text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-5">
          {calendarDays.map((day, i) => {
            const formattedDate = format(day, 'yyyy-MM-dd');
            const isSelected = formattedDate === selectedDate;
            const isDifferentMonth = !isSameMonth(day, currentMonthDate);
            const isTodayDate = isToday(day);
            const dayEntryCount = getEntryCount(day);
            const dayTotalCalories = getTotalCalories(day);
            const hasData = dayEntryCount > 0;

            // Calculate calorie percentage for visual indicator
            const caloriePercentage = Math.min(100, (dayTotalCalories / (goals.calories || 2000)) * 100);

            return (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                className={`
                  relative p-0 h-auto aspect-square flex flex-col items-center justify-center
                  ${isSelected ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' :
                    isDifferentMonth ? 'text-[hsl(var(--muted-foreground))] opacity-40' : ''}
                  ${isTodayDate && !isSelected ? 'ring-1 ring-[hsl(var(--primary))]' : ''}
                  ${hasData && !isSelected ? 'bg-[hsl(var(--accent))/0.1]' : ''}
                  ${isSelected ? 'hover:opacity-90' : 'hover:bg-[hsl(var(--muted))]/0.5'}
                `}
                onClick={() => handleDateSelect(day)}
              >
                <span className="text-sm font-semibold">
                  {format(day, 'd')}
                </span>

                {hasData && (
                  <div className="absolute bottom-1 w-full px-1">
                    <div className="w-full h-[3px] rounded-full bg-[hsl(var(--muted))/0.3]">
                      <div
                        className="h-full rounded-full bg-[hsl(var(--primary))]"
                        style={{ width: `${caloriePercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {hasData && (
                  <div className="absolute top-1 right-1">
                    <span className="text-[8px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-full w-3 h-3 flex items-center justify-center">
                      {dayEntryCount}
                    </span>
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
};

export default memo(CalendarPopup); 