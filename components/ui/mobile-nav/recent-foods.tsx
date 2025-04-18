"use client";

import React from "react";
import { Clipboard } from "lucide-react";
import { FoodItem, MealEntry, useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";

interface RecentFoodsProps {
  onSelectFood: (food: FoodItem) => void;
  onBack: () => void;
}

const RecentFoods = ({ onSelectFood, onBack }: RecentFoodsProps) => {
  const { dailyLogs } = useNutritionStore();
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // Get all meals from all dates, sorted by most recent
  const allMeals: MealEntry[] = [];
  Object.values(dailyLogs).forEach(log => {
    allMeals.push(...log.meals);
  });
  
  // Sort by date (most recent first) and take the first 10
  const recentMeals = allMeals
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  // Remove duplicates (keep the most recent instance of each food)
  const uniqueFoods: FoodItem[] = [];
  const seenFoodIds = new Set();
  
  recentMeals.forEach(meal => {
    if (!seenFoodIds.has(meal.foodItem.id)) {
      seenFoodIds.add(meal.foodItem.id);
      uniqueFoods.push(meal.foodItem);
    }
  });

  return (
    <div className="space-y-6">
      {uniqueFoods.length > 0 ? (
        <div className="space-y-2">
          {uniqueFoods.map((food) => (
            <div 
              key={food.id}
              onClick={() => onSelectFood(food)}
              className="p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
            >
              <div className="font-medium">{food.name}</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                {food.calories} {t.mobileNav.common.calories} {t.mobileNav.common.per} {food.servingSize}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clipboard className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
          <p className="text-[hsl(var(--muted-foreground))]">{t.mobileNav.recentFoods.noFoods}</p>
        </div>
      )}
    </div>
  );
};

export default RecentFoods; 