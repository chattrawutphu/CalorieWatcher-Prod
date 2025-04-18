"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FoodItem, MealFoodItem, FoodTemplate, useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { commonFoodTranslations } from "@/lib/translations/common-foods";
import { Search, ArrowLeft, RotateCcw, Leaf, Salad, Beef, Cookie, Coffee, Egg, Wine, Pizza } from "lucide-react";
import { searchFoods, SearchFoodResult } from "@/lib/api/usda-api";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchFoodProps {
  onAddFood: (food: MealFoodItem) => void;
  onBack: () => void;
  onCustomFood: () => void;
  onViewFood: (food: FoodItem | FoodTemplate) => void;
}

const PAGE_SIZE = 15;

const SearchFood = ({ onAddFood, onBack, onCustomFood, onViewFood }: SearchFoodProps) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchFoodResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("recent");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { dailyLogs, foodTemplates } = useNutritionStore();

  // รวบรวมอาหารที่ใช้บ่อย
  const [recentFoods, setRecentFoods] = useState<Array<FoodItem | FoodTemplate>>([]);
  
  // คำแปลสำหรับอาหารทั่วไป
  const safeLocale = locale in commonFoodTranslations ? locale : 'en';
  const commonFoods = commonFoodTranslations[safeLocale as keyof typeof commonFoodTranslations];

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchFoods(searchQuery, page, PAGE_SIZE);
      if (page === 1) {
        setSearchResults(results.foods);
      } else {
        setSearchResults(prev => [...prev, ...results.foods]);
      }
      setHasMore(results.totalHits > page * PAGE_SIZE);
    } catch (error) {
      console.error("Error searching foods:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, page]);

  const loadMoreResults = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim()) {
      setPage(1);
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, handleSearch]);

  // Handle pagination
  useEffect(() => {
    if (page > 1) {
      handleSearch();
    }
  }, [page, handleSearch]);

  // รวบรวมรายการอาหารที่ใช้บ่อย
  useEffect(() => {
    // รวบรวมอาหารที่เคยเพิ่มจาก dailyLogs
    const foodsFromLogs: Record<string, FoodItem | FoodTemplate> = {};
    
    // เพิ่มทั้ง FoodItem จาก logs และ FoodTemplate จาก templates
    Object.values(dailyLogs).forEach(log => {
      log.meals.forEach(meal => {
        // ถ้ามี templateId แสดงว่ามาจาก template จะใช้ template แทนเพื่อให้กดเข้าไปแก้ไขได้ถูกต้อง
        if (meal.foodItem.templateId) {
          const template = foodTemplates.find(t => t.id === meal.foodItem.templateId);
          if (template) {
            foodsFromLogs[template.id] = template;
            return;
          }
        }
        // ถ้าไม่มี templateId แต่มี usdaId แสดงว่าเป็นอาหารจาก USDA
        else if (meal.foodItem.usdaId) {
          foodsFromLogs[meal.foodItem.id] = meal.foodItem;
        }
      });
    });
    
    // เพิ่ม favorites ที่ยังไม่มีในรายการ
    const allFoods = [
      ...Object.values(foodsFromLogs),
      ...foodTemplates.filter(food => !foodsFromLogs[food.id] && food.isTemplate)
    ];
    
    // เรียงลำดับตามวันที่ล่าสุด
    const uniqueFoods = Object.values(foodsFromLogs).sort((a, b) => {
      // จัดเรียงตามวันที่ล่าสุด
      const dateA = new Date('isTemplate' in a && a.isTemplate ? a.createdAt : ('recordedAt' in a ? a.recordedAt : new Date()));
      const dateB = new Date('isTemplate' in b && b.isTemplate ? b.createdAt : ('recordedAt' in b ? b.recordedAt : new Date()));
      return dateB.getTime() - dateA.getTime();
    });
    
    setRecentFoods(uniqueFoods.slice(0, 20)); // แสดงเฉพาะ 20 รายการแรก
    
  }, [dailyLogs, foodTemplates]);

  const handleAddFood = (food: FoodItem | FoodTemplate | SearchFoodResult) => {
    // กรณีเป็น FoodTemplate ต้องสร้าง MealFoodItem จาก template ก่อน
    if ('isTemplate' in food && food.isTemplate) {
      const { createMealItemFromTemplate } = useNutritionStore.getState();
      const mealItem = createMealItemFromTemplate(food.id);
      if (mealItem) {
        onAddFood(mealItem);
      }
      return;
    }
    
    // กรณีเป็น SearchFoodResult จาก USDA API
    if ('fdcId' in food) {
      const newFood: MealFoodItem = {
        id: crypto.randomUUID(),
        name: food.description,
        calories: Math.round(food.foodNutrients?.find(n => n.nutrientId === 1008)?.value || 0),
        protein: Math.round(food.foodNutrients?.find(n => n.nutrientId === 1003)?.value || 0),
        carbs: Math.round(food.foodNutrients?.find(n => n.nutrientId === 1005)?.value || 0),
        fat: Math.round(food.foodNutrients?.find(n => n.nutrientId === 1004)?.value || 0),
        servingSize: food.servingSize ? `${food.servingSize}${food.servingSizeUnit}` : "100g",
        category: "other",
        usdaId: food.fdcId,
        recordedAt: new Date()
      };
      onAddFood(newFood);
      return;
    }
    
    // กรณีเป็น MealFoodItem ส่งกลับเลย
    if ('recordedAt' in food) {
      onAddFood(food);
      return;
    }
  };

  const handleViewFood = (food: FoodItem | FoodTemplate | SearchFoodResult) => {
    if ('fdcId' in food) {
      // สร้าง FoodItem จาก SearchFoodResult
      const newFood: FoodItem = {
        id: crypto.randomUUID(),
        name: food.description,
        calories: Math.round(food.foodNutrients.find(n => n.nutrientId === 1008)?.value || 0),
        protein: Math.round(food.foodNutrients.find(n => n.nutrientId === 1003)?.value || 0),
        carbs: Math.round(food.foodNutrients.find(n => n.nutrientId === 1005)?.value || 0),
        fat: Math.round(food.foodNutrients.find(n => n.nutrientId === 1004)?.value || 0),
        servingSize: food.servingSize ? `${food.servingSize}${food.servingSizeUnit}` : "100g",
        favorite: false,
        createdAt: new Date(),
        category: "other",
        usdaId: food.fdcId,
        isTemplate: true
      };
      onViewFood(newFood);
    } else {
      onViewFood(food);
    }
  };

  // กลุ่มของอาหารทั่วไป
  const foodCategories = [
    { icon: <Salad className="w-5 h-5" />, id: 'vegetables', title: t.mobileNav.commonFoods.categories.vegetable },
    { icon: <Leaf className="w-5 h-5" />, id: 'fruits', title: t.mobileNav.commonFoods.categories.fruit },
    { icon: <Beef className="w-5 h-5" />, id: 'meats', title: t.mobileNav.commonFoods.categories.protein },
    { icon: <Egg className="w-5 h-5" />, id: 'dairy', title: t.mobileNav.commonFoods.categories.dairy },
    { icon: <Cookie className="w-5 h-5" />, id: 'grains', title: t.mobileNav.commonFoods.categories.grain },
    { icon: <Coffee className="w-5 h-5" />, id: 'beverages', title: t.mobileNav.commonFoods.categories.beverage },
    { icon: <Wine className="w-5 h-5" />, id: 'alcohol', title: t.mobileNav.commonFoods.categories.beverage },
    { icon: <Pizza className="w-5 h-5" />, id: 'fastfood', title: t.mobileNav.commonFoods.categories.snack }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Input
            type="text"
            placeholder={t.mobileNav.common.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>
      </div>

      <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="recent">{"Recent"}</TabsTrigger>
          <TabsTrigger value="common">{"Common"}</TabsTrigger>
          <TabsTrigger value="custom" onClick={onCustomFood}>
            {"Custom"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            {searchQuery ? (
              <div className="space-y-2">
                {isLoading && page === 1 ? (
                  <div className="text-center py-4">
                    <RotateCcw className="h-6 w-6 mx-auto animate-spin text-[hsl(var(--primary))]" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {searchResults.map((food) => (
                        <div 
                          key={food.fdcId} 
                          className="p-3 border rounded-xl flex justify-between items-center hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
                          onClick={() => handleViewFood(food)}
                        >
                          <div>
                            <div className="font-medium">{food.description}</div>
                            <div className="text-xs text-[hsl(var(--muted-foreground))]">
                              {food.servingSize ? `${food.servingSize}${food.servingSizeUnit}` : "100g"} • 
                              {Math.round(food.foodNutrients.find(n => n.nutrientId === 1008)?.value || 0)} kcal
                            </div>
                          </div>
                          <Button size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleAddFood(food);
                          }}>
                            {"Add"}
                          </Button>
                        </div>
                      ))}
                    </div>
                    {hasMore && (
                      <div className="py-4 text-center">
                        <Button 
                          variant="outline" 
                          onClick={loadMoreResults} 
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? (
                            <RotateCcw className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {"Load More"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[hsl(var(--muted-foreground))]">
                      {t.mobileNav.common.noResults}
                    </p>
                  </div>
                )}
              </div>
            ) : recentFoods.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {"Recently Used Foods"}
                </h3>
                <div className="space-y-2">
                  {recentFoods.map((food) => (
                    <div 
                      key={food.id} 
                      className="p-3 border rounded-xl flex justify-between items-center hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
                      onClick={() => handleViewFood(food)}
                    >
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{food.name}</span>
                          {'isTemplate' in food && food.isTemplate && (
                            <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4">
                              {"Template"}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {food.servingSize} • {food.calories} kcal
                        </div>
                      </div>
                      <Button size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleAddFood(food);
                      }}>
                        {"Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[hsl(var(--muted-foreground))]">
                  {"No recent foods"}
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="common" className="flex-1 overflow-y-auto">
          <ScrollArea className="flex-1">
            <div className="space-y-4">
              {foodCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    {category.icon}
                    <h3>{category.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {commonFoods[category.id as keyof typeof commonFoods]?.map((food, index) => (
                      <div 
                        key={`${category.id}-${index}`} 
                        className="p-3 border rounded-xl flex justify-between items-center hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
                        onClick={() => {
                          // ค้นหาอาหารในฐานข้อมูล
                          setSearchQuery(food.name);
                          setActiveTab("recent");
                        }}
                      >
                        <div>
                          <div className="font-medium">{food.name}</div>
                          <div className="text-xs text-[hsl(var(--muted-foreground))]">
                            {food.serving} • {"~"} {food.calories} kcal
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchFood; 