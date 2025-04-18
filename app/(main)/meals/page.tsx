"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNutrition } from "@/components/providers/nutrition-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, ArrowLeft } from "lucide-react";

const translations = {
  en: {
    meals: "My Meals",
    today: "Today",
    noMeals: "No meals recorded for this day",
    addMeal: "Add Meal",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    kcal: "kcal",
    back: "Back",
  },
  th: {
    meals: "มื้ออาหารของฉัน",
    today: "วันนี้",
    noMeals: "ไม่มีการบันทึกมื้ออาหารสำหรับวันนี้",
    addMeal: "เพิ่มมื้ออาหาร",
    breakfast: "อาหารเช้า",
    lunch: "อาหารกลางวัน",
    dinner: "อาหารเย็น",
    snack: "อาหารว่าง",
    kcal: "แคลอรี่",
    back: "กลับ",
  },
  ja: {
    meals: "私の食事",
    today: "今日",
    noMeals: "この日の食事記録はありません",
    addMeal: "食事を追加",
    breakfast: "朝食",
    lunch: "昼食",
    dinner: "夕食",
    snack: "間食",
    kcal: "カロリー",
    back: "戻る",
  },
  zh: {
    meals: "我的餐食",
    today: "今天",
    noMeals: "这一天没有记录任何餐食",
    addMeal: "添加餐食",
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snack: "小吃",
    kcal: "卡路里",
    back: "返回",
  },
};

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const getMealEmoji = (type: string) => {
  switch (type) {
    case "breakfast": return "🍳";
    case "lunch": return "🍱";
    case "dinner": return "🍲";
    case "snack": return "🍎";
    default: return "🍽️";
  }
};

export default function MealsPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { meals = [] } = useNutrition();

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const formattedDate = format(selectedDate, "EEEE, MMMM d");

  const filteredMeals = meals.filter((meal) => {
    const mealDate = new Date(meal.date);
    return (
      mealDate.getDate() === selectedDate.getDate() &&
      mealDate.getMonth() === selectedDate.getMonth() &&
      mealDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Group meals by type
  const groupedMeals: Record<string, any[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  filteredMeals.forEach((meal) => {
    if (groupedMeals[meal.type]) {
      groupedMeals[meal.type].push(meal);
    }
  });

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen pb-24">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center mb-6"
      >
        <Button 
          variant="ghost" 
          size="icon"
          className="mr-2 text-purple-600"
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          {t.meals}
        </h1>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <Card className="p-4 shadow-md border-purple-100 rounded-xl bg-white">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousDay}
              className="text-purple-600"
            >
              <ChevronLeft size={20} />
            </Button>
            
            <div className="text-center">
              <div 
                className="text-sm text-purple-700 font-medium cursor-pointer hover:text-purple-900"
                onClick={goToToday}
              >
                {isToday() ? t.today : formattedDate}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextDay}
              className="text-purple-600"
              disabled={isToday()}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </Card>
      </motion.div>

      {Object.keys(groupedMeals).length === 0 || 
       Object.values(groupedMeals).every(meals => meals.length === 0) ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <p className="text-gray-500">{t.noMeals}</p>
          <Button
            onClick={() => router.push(`/add?date=${format(selectedDate, 'yyyy-MM-dd')}`)}
            className="mt-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            <Plus size={16} className="mr-2" />
            {t.addMeal}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {Object.entries(groupedMeals).map(([type, meals]) => {
            if (meals.length === 0) return null;
            
            return (
              <motion.div 
                key={type} 
                variants={item}
                className="mb-4"
              >
                <div className="flex items-center mb-2">
                  <span className="mr-2 text-xl">{getMealEmoji(type)}</span>
                  <h2 className="text-lg font-semibold text-purple-900">
                    {t[type as keyof typeof t]}
                  </h2>
                </div>
                
                <div className="space-y-2">
                  {meals.map((meal) => (
                    <motion.div
                      key={meal.id}
                      whileHover={{ y: -3 }}
                      className="cursor-pointer"
                    >
                      <Card 
                        className="p-3 shadow-sm border-purple-100 rounded-xl bg-white hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-purple-800">{meal.name}</h3>
                            <div className="text-xs text-gray-500">
                              {meal.portion && `${meal.portion} • `}{format(new Date(meal.date), "HH:mm")}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-purple-700">
                              {Math.round(meal.calories)} {t.kcal}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
          
          <motion.div 
            variants={item}
            className="flex justify-center mt-8"
          >
            <Button
              onClick={() => router.push(`/add?date=${format(selectedDate, 'yyyy-MM-dd')}`)}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md rounded-xl px-6"
            >
              <Plus size={16} className="mr-2" />
              {t.addMeal}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 