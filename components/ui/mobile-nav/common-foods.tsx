"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, ArrowLeft, AlertCircle, Loader2, Clipboard, X } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodItem } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { USDAFoodItem, convertToAppFoodItem, FOOD_CATEGORIES, searchFoods, searchFoodsByCategory, SearchFoodResult } from "@/lib/api/usda-api";
import { cacheService } from "@/lib/utils/cache-service";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { commonFoodTranslations } from "@/lib/translations/common-foods";

interface CommonFoodsProps {
  onSelectFood: (food: FoodItem) => void;
  onBack: () => void;
}

const CommonFoods = ({ onSelectFood, onBack }: CommonFoodsProps) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchMode, setSearchMode] = useState<'category' | 'search'>('category');
  const [dataTypeFilter, setDataTypeFilter] = useState<'ingredients' | 'meals' | 'all'>('all');
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; brandName?: string }[]>([]);
  const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);
  
  // สำหรับตัวอย่าง - หมวดหมู่ย่อยของแต่ละหมวดหมู่
  const subcategories = useMemo(() => {
    switch (selectedCategory) {
      case 'vegetables':
        return [
          { id: 'leafy', name: 'Leafy Greens', emoji: '🥬' },
          { id: 'root', name: 'Root Vegetables', emoji: '🥕' },
          { id: 'cruciferous', name: 'Cruciferous', emoji: '🥦' },
          { id: 'allium', name: 'Allium', emoji: '🧅' },
          { id: 'other_veg', name: 'Other Vegetables', emoji: '🌽' },
        ];
      case 'fruits':
        return [
          { id: 'berries', name: 'Berries', emoji: '🍓' },
          { id: 'citrus', name: 'Citrus', emoji: '🍊' },
          { id: 'tropical', name: 'Tropical', emoji: '🍍' },
          { id: 'stone_fruits', name: 'Stone Fruits', emoji: '🍑' },
          { id: 'other_fruits', name: 'Other Fruits', emoji: '🍏' },
        ];
      case 'protein_foods':
        return [
          { id: 'meat', name: 'Meat', emoji: '🥩' },
          { id: 'poultry', name: 'Poultry', emoji: '🍗' },
          { id: 'seafood', name: 'Seafood', emoji: '🐟' },
          { id: 'eggs', name: 'Eggs', emoji: '🥚' },
          { id: 'legumes', name: 'Legumes', emoji: '🫘' },
          { id: 'nuts', name: 'Nuts & Seeds', emoji: '🥜' },
        ];
      case 'dairy':
        return [
          { id: 'milk', name: 'Milk', emoji: '🥛' },
          { id: 'cheese', name: 'Cheese', emoji: '🧀' },
          { id: 'yogurt', name: 'Yogurt', emoji: '🥣' },
          { id: 'other_dairy', name: 'Other Dairy', emoji: '🍦' },
        ];
      case 'grains':
        return [
          { id: 'bread', name: 'Bread', emoji: '🍞' },
          { id: 'rice', name: 'Rice', emoji: '🍚' },
          { id: 'pasta', name: 'Pasta', emoji: '🍝' },
          { id: 'cereal', name: 'Cereal', emoji: '🥣' },
          { id: 'other_grains', name: 'Other Grains', emoji: '🌾' },
        ];
      case 'beverages':
        return [
          { id: 'water', name: 'Water', emoji: '💧' },
          { id: 'juice', name: 'Juice', emoji: '🧃' },
          { id: 'coffee', name: 'Coffee', emoji: '☕' },
          { id: 'tea', name: 'Tea', emoji: '🍵' },
          { id: 'smoothies', name: 'Smoothies', emoji: '🥤' },
        ];
      default:
        return [];
    }
  }, [selectedCategory]);
  
  // ค้นหาอาหารด้วย USDA API
  const performSearch = useCallback(async (query: string, loadPage: number = 1) => {
    if (!query || query.length < 2) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // กำหนดประเภทข้อมูลตามตัวเลือกของผู้ใช้
      let dataTypes;
      switch (dataTypeFilter) {
        case 'ingredients':
          dataTypes = ['Foundation', 'SR Legacy'];
          break;
        case 'meals':
          dataTypes = ['Survey (FNDDS)', 'Branded'];
          break;
        default:
          dataTypes = ['Foundation', 'SR Legacy', 'Survey (FNDDS)', 'Branded', 'Experimental'];
      }
      
      // ตรวจสอบแคชก่อน
      const cacheKey = `${query}_${dataTypeFilter}_${loadPage}`;
      const cachedResults = cacheService.getCachedFoodSearch(cacheKey, loadPage);
      
      if (cachedResults) {
        // ใช้ผลลัพธ์จากแคช
        const formattedFoods = cachedResults.map((food: USDAFoodItem) => convertToAppFoodItem(food));
        
        setFoods(prevFoods => loadPage === 1 ? formattedFoods : [...prevFoods, ...formattedFoods]);
        setHasMore(formattedFoods.length === 20); // สมมติว่าเรียก 20 รายการต่อหน้า
      } else {
        // เรียก API
        const result = await searchFoods(query, loadPage, 20);
        
        // แคชผลลัพธ์
        cacheService.cacheFoodSearch(cacheKey, loadPage, result.foods);
        
        // แปลงเป็นรูปแบบที่แอพใช้
        const formattedFoods = result.foods.map((food: SearchFoodResult) => ({
          id: food.fdcId.toString(),
          name: food.description,
          calories: getCalories(food),
          protein: getNutrient(food, 'Protein'),
          carbs: getNutrient(food, 'Carbohydrate, by difference'),
          fat: getNutrient(food, 'Total lipid (fat)'),
          servingSize: food.servingSize ? `${food.servingSize}${food.servingSizeUnit}` : "100g",
          favorite: false,
          createdAt: new Date().toISOString(),
          category: food.foodCategory || 'Uncategorized',
          usdaId: food.fdcId,
          isTemplate: true,
          dataType: food.dataType
        }));
        
        setFoods(prevFoods => loadPage === 1 ? formattedFoods : [...prevFoods, ...formattedFoods]);
        setHasMore(result.foods.length === 20); // สมมติว่าเรียก 20 รายการต่อหน้า
      }
    } catch (err) {
      console.error("Error searching foods:", err);
      setError("ไม่สามารถค้นหาอาหารได้ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [dataTypeFilter]);
  
  // ค้นหาอาหารตามหมวดหมู่
  const loadCategoryFoods = useCallback(async (category: string, subcat: string | null = null, loadPage: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // สร้างคำค้นหาจากหมวดหมู่และหมวดหมู่ย่อย
      let searchTerm = category;
      let dataTypes = ['Foundation', 'SR Legacy', 'Experimental', 'Survey (FNDDS)', 'Branded'];
      let sortBy = 'dataType.keyword'; // เรียงตามประเภทข้อมูล ให้วัตถุดิบพื้นฐานมาก่อน
      
      // เน้นค้นหาวัตถุดิบพื้นฐาน
      if (['vegetables', 'fruits', 'protein_foods'].includes(category)) {
        dataTypes = ['Foundation', 'SR Legacy']; // เน้นวัตถุดิบพื้นฐาน
      }
      
      if (subcat) {
        // เพิ่มคำสำคัญของหมวดหมู่ย่อย
        switch (subcat) {
          // กรณี vegetables
          case 'leafy': 
            searchTerm = 'spinach OR lettuce OR kale OR greens OR collard OR chard';
            dataTypes = ['Foundation', 'SR Legacy']; // เน้นวัตถุดิบพื้นฐาน
            break;
          case 'root': 
            searchTerm = 'carrot OR beet OR potato OR root OR turnip OR radish';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'cruciferous': 
            searchTerm = 'broccoli OR cauliflower OR brussels OR cabbage OR kale';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'allium': 
            searchTerm = 'onion OR garlic OR leek OR shallot OR chive';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          
          // กรณี fruits
          case 'berries': 
            searchTerm = 'berry OR berries OR strawberry OR blueberry OR raspberry OR blackberry';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'citrus': 
            searchTerm = 'orange OR lemon OR lime OR grapefruit OR citrus OR mandarin';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'tropical': 
            searchTerm = 'banana OR mango OR pineapple OR tropical OR papaya OR guava';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'stone_fruits': 
            searchTerm = 'peach OR plum OR nectarine OR cherry OR apricot OR avocado';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          
          // กรณี protein
          case 'meat': 
            searchTerm = 'beef OR pork OR lamb OR meat OR steak OR ground beef';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'poultry': 
            searchTerm = 'chicken OR turkey OR duck OR poultry OR breast OR thigh';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'seafood': 
            searchTerm = 'fish OR salmon OR tuna OR seafood OR shrimp OR cod OR halibut';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'eggs': 
            searchTerm = 'egg OR eggs OR omelette OR egg white OR yolk';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'legumes': 
            searchTerm = 'bean OR beans OR lentil OR lentils OR legume OR chickpea OR pea';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'nuts': 
            searchTerm = 'nut OR nuts OR seed OR seeds OR almond OR walnut OR cashew OR pistachio';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          
          // อื่นๆ สำหรับหมวดหมู่อื่น - เพิ่มตามต้องการ
          default:
            searchTerm += ` AND ${subcat}`;
        }
      } else {
        // ถ้าไม่มีหมวดหมู่ย่อย ปรับคำค้นหาให้เหมาะสมแต่ละหมวดหมู่
        switch (category) {
          case 'vegetables':
            searchTerm = 'vegetable OR vegetables OR broccoli OR carrot OR spinach OR lettuce OR kale';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'fruits':
            searchTerm = 'fruit OR fruits OR apple OR banana OR orange OR berries OR grape';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          case 'protein_foods':
            searchTerm = 'beef OR chicken OR fish OR egg OR pork OR tofu OR beans OR nuts OR seeds';
            dataTypes = ['Foundation', 'SR Legacy'];
            break;
          // สามารถเพิ่มกรณีอื่นๆ ตามต้องการ
        }
      }
      
      // ตรวจสอบแคชก่อน
      const cacheKey = subcat ? `${category}_${subcat}` : category;
      const cachedResults = cacheService.getCachedFoodCategory(cacheKey, loadPage);
      
      if (cachedResults) {
        // ใช้ผลลัพธ์จากแคช
        const formattedFoods = cachedResults.map((food: USDAFoodItem) => convertToAppFoodItem(food));
        
        setFoods(prevFoods => loadPage === 1 ? formattedFoods : [...prevFoods, ...formattedFoods]);
        setHasMore(formattedFoods.length === 20);
      } else {
        // เรียก API
        const results = await searchFoods(searchTerm, loadPage, 20);
        
        // แคชผลลัพธ์
        cacheService.cacheFoodCategory(cacheKey, loadPage, results.foods);
        
        // แปลงเป็นรูปแบบที่แอพใช้
        const formattedFoods = results.foods.map((food: SearchFoodResult) => ({
          id: food.fdcId.toString(),
          name: food.description,
          calories: getCalories(food),
          protein: getNutrient(food, 'Protein'),
          carbs: getNutrient(food, 'Carbohydrate, by difference'),
          fat: getNutrient(food, 'Total lipid (fat)'),
          servingSize: food.servingSize ? `${food.servingSize}${food.servingSizeUnit}` : "100g",
          favorite: false,
          createdAt: new Date().toISOString(),
          category: food.foodCategory || 'Uncategorized',
          usdaId: food.fdcId,
          isTemplate: true,
          dataType: food.dataType
        }));
        
        setFoods(prevFoods => loadPage === 1 ? formattedFoods : [...prevFoods, ...formattedFoods]);
        setHasMore(results.foods.length === 20);
      }
    } catch (err) {
      console.error(`Error loading foods for category ${category}:`, err);
      setError("ไม่สามารถโหลดข้อมูลอาหารได้ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [dataTypeFilter]);
  
  // โหลดหน้าถัดไป
  const loadMoreFoods = useCallback(() => {
    setPage(prevPage => {
      const nextPage = prevPage + 1;
      
      if (searchMode === 'search') {
        performSearch(searchQuery, nextPage);
      } else if (selectedCategory) {
        loadCategoryFoods(selectedCategory, subcategory, nextPage);
      }
      
      return nextPage;
    });
  }, [searchMode, searchQuery, selectedCategory, subcategory, performSearch, loadCategoryFoods]);
  
  // ติดตามการเปลี่ยนแปลงคำค้นหา
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchMode('search');
      setSelectedCategory(null);
      setSubcategory(null);
      setPage(1);
      
      // ใช้ debounce เพื่อลดการเรียก API บ่อยเกินไป
      const debounceTimer = setTimeout(() => {
        performSearch(searchQuery, 1);
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, performSearch]);
  
  // โหลดอาหารเมื่อเลือกหมวดหมู่หรือหมวดหมู่ย่อย
  useEffect(() => {
    if (selectedCategory) {
      setSearchMode('category');
      setPage(1);
      loadCategoryFoods(selectedCategory, subcategory, 1);
    }
  }, [selectedCategory, subcategory, loadCategoryFoods, dataTypeFilter]);
  
  // ติดตามการเปลี่ยนแปลงฟิลเตอร์ประเภทข้อมูล
  useEffect(() => {
    if (searchQuery.length >= 2) {
      // ค้นหาใหม่เมื่อเปลี่ยนฟิลเตอร์
      setPage(1);
      performSearch(searchQuery, 1);
    } else if (selectedCategory) {
      // โหลดหมวดหมู่ใหม่เมื่อเปลี่ยนฟิลเตอร์
      loadCategoryFoods(selectedCategory, subcategory, 1);
    }
  }, [dataTypeFilter, searchQuery, selectedCategory, subcategory, performSearch, loadCategoryFoods]);
  
  // ล้างการค้นหาและกลับไปที่หมวดหมู่
  const resetSearch = () => {
    setSearchQuery("");
    setSearchMode('category');
    setFoods([]);
    setSelectedCategory(null);
    setSubcategory(null);
    setPage(1);
  };
  
  const handleAutocomplete = useCallback(async (term: string) => {
    try {
      if (!term.trim()) {
        setSuggestions([]);
        return;
      }
      
      setLoadingAutocomplete(true);
      
      // ใช้ searchFoods แบบใหม่ที่รับพารามิเตอร์เป็น string, page, pageSize
      const result = await searchFoods(term, 1, 5);
      
      // แปลงผลลัพธ์เป็นรูปแบบที่ใช้ในแอพ
      const formattedSuggestions = result.foods.map(food => ({
        id: food.fdcId.toString(),
        name: food.description,
        brandName: food.brandName
      }));
      
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoadingAutocomplete(false);
    }
  }, []);
  
  // ฟังก์ชันสำหรับดึงค่าแคลอรี่จาก SearchFoodResult
  const getCalories = (food: SearchFoodResult): number => {
    const energyNutrient = food.foodNutrients?.find(
      (nutrient) => nutrient.nutrientId === 1008 || nutrient.nutrientName === 'Energy'
    );
    return Math.round(energyNutrient?.value || 0);
  };

  // ฟังก์ชันสำหรับดึงค่าสารอาหารจาก SearchFoodResult ตามชื่อ
  const getNutrient = (food: SearchFoodResult, nutrientName: string): number => {
    const nutrient = food.foodNutrients?.find(
      (n) => n.nutrientName === nutrientName || 
             (nutrientName === 'Protein' && n.nutrientId === 1003) ||
             (nutrientName === 'Carbohydrate, by difference' && n.nutrientId === 1005) ||
             (nutrientName === 'Total lipid (fat)' && n.nutrientId === 1004)
    );
    return Math.round(nutrient?.value || 0);
  };
  
  return (
    <div className="space-y-4">
      {/* ช่องค้นหา */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.mobileNav.common.searchPlaceholder || "Search foods..."}
          className="pl-11 pr-10 py-2 rounded-xl"
        />
        {searchQuery && (
          <button 
            onClick={resetSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* ตัวเลือกฟิลเตอร์ */}
      <div className="flex gap-2 pb-2">
        <Button 
          variant={dataTypeFilter === 'all' ? "default" : "outline"} 
          size="sm"
          className="flex-1"
          onClick={() => setDataTypeFilter('all')}
        >
          All Foods
        </Button>
        <Button 
          variant={dataTypeFilter === 'ingredients' ? "default" : "outline"} 
          size="sm"
          className="flex-1"
          onClick={() => setDataTypeFilter('ingredients')}
        >
          Ingredients
        </Button>
        <Button 
          variant={dataTypeFilter === 'meals' ? "default" : "outline"} 
          size="sm"
          className="flex-1"
          onClick={() => setDataTypeFilter('meals')}
        >
          Meals
        </Button>
      </div>
      
      {/* เนวิเกชันหมวดหมู่ */}
      {!searchQuery && searchMode === 'category' && (
        <div className="flex flex-col space-y-4">
          {!selectedCategory ? (
            // แสดงหมวดหมู่หลัก
            <div className="grid grid-cols-2 gap-3">
              {FOOD_CATEGORIES.map((category: { id: string; name: string; emoji: string }) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors flex flex-col items-center justify-center text-center aspect-square"
                >
                  <span className="text-xl mb-2">{category.emoji}</span>
                  <span className="font-medium">{category.name}</span>
                </div>
              ))}
            </div>
          ) : (
            // แสดงหมวดหมู่ย่อย (ถ้ามี)
            <>
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSubcategory(null);
                    setFoods([]);
                  }}
                  className="flex items-center text-[hsl(var(--primary))]"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span>Back to Categories</span>
                </button>
              </div>
              
              {subcategories.length > 0 && !subcategory && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {subcategories.map((subcat) => (
                    <div
                      key={subcat.id}
                      onClick={() => setSubcategory(subcat.id)}
                      className="p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors flex flex-col items-center justify-center text-center"
                    >
                      <span className="text-2xl mb-1">{subcat.emoji}</span>
                      <span className="font-medium text-sm">{subcat.name}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {subcategory && (
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setSubcategory(null);
                      setFoods([]);
                    }}
                    className="flex items-center text-[hsl(var(--primary))]"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span>Back to {selectedCategory}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* ส่วนแสดงผลลัพธ์ */}
      {error ? (
        <div className="py-6 text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-2 text-red-500" />
          <p className="text-red-500">{error}</p>
          <Button onClick={resetSearch} className="mt-4">
            Reset Search
          </Button>
        </div>
      ) : loading && foods.length === 0 ? (
        <div className="py-10 text-center">
          <Loader2 className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--primary))] animate-spin" />
          <p className="text-[hsl(var(--muted-foreground))]">Loading...</p>
        </div>
      ) : foods.length > 0 ? (
        <div className="space-y-3">
          <div className="space-y-2">
            {foods.map((food) => {
              // เพิ่มตัวแปรเพื่อตรวจสอบว่าเป็นวัตถุดิบหรือไม่
              const isIngredient = food.dataType === 'Foundation' || food.dataType === 'SR Legacy';
              const dataTypeLabel = isIngredient 
                ? 'Ingredient' 
                : food.dataType === 'Survey (FNDDS)' 
                  ? 'Common Meal' 
                  : food.dataType === 'Branded' 
                    ? 'Branded Food' 
                    : food.dataType || '';
              
              return (
                <div 
                  key={food.id}
                  onClick={() => onSelectFood(food)}
                  className={`p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors ${isIngredient ? 'border-l-4 border-l-green-500' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{food.name}</div>
                    {isIngredient && (
                      <div className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-0.5 rounded-full flex items-center">
                        <span className="mr-1">🥦</span> {dataTypeLabel}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      {food.calories} {t.mobileNav.common.calories} {t.mobileNav.common.per} {food.servingSize}
                    </div>
                    {food.brandName && (
                      <div className="text-xs bg-[hsl(var(--muted))/0.5] px-2 py-0.5 rounded-full">
                        {food.brandName}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {!isIngredient && food.dataType && (
                      <span className="text-xs text-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.1] px-2 py-0.5 rounded-full flex items-center">
                        {food.dataType === 'Survey (FNDDS)' ? <span className="mr-1">🍲</span> : <span className="mr-1">🏷️</span>}
                        {dataTypeLabel}
                      </span>
                    )}
                    {food.protein > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-0.5 rounded-full">
                        P: {food.protein}g
                      </span>
                    )}
                    {food.carbs > 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 px-2 py-0.5 rounded-full">
                        C: {food.carbs}g
                      </span>
                    )}
                    {food.fat > 0 && (
                      <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 px-2 py-0.5 rounded-full">
                        F: {food.fat}g
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Loader สำหรับการโหลดเพิ่ม */}
          {loading && (
            <div className="py-4 text-center">
              <Loader2 className="h-6 w-6 mx-auto animate-spin text-[hsl(var(--primary))]" />
            </div>
          )}
          
          {/* ปุ่มโหลดเพิ่มเติม */}
          {!loading && hasMore && (
            <div className="text-center pt-2 pb-8">
              <Button variant="outline" onClick={loadMoreFoods}>
                Load More
              </Button>
            </div>
          )}
        </div>
      ) : (searchQuery || selectedCategory) && !loading ? (
        <div className="py-8 text-center">
          <Clipboard className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
          <p className="text-[hsl(var(--muted-foreground))]">No foods found.</p>
        </div>
      ) : null}
    </div>
  );
};

export default CommonFoods; 