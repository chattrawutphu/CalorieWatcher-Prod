"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, AlertCircle, Loader2, Clipboard, X } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodItem } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { USDAFoodItem, convertToAppFoodItem, FOOD_CATEGORIES, searchFoods, searchFoodsByCategory, SearchFoodResult } from "@/lib/api/usda-api";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { commonFoodTranslations } from "@/lib/translations/common-foods";

interface CommonFoodsProps {
  onSelectFood: (food: FoodItem) => void;
  onBack: () => void;
}

// Category emojis mapping for better UI
const CATEGORY_EMOJIS = {
  vegetables: "🥦",
  fruits: "🍎",
  protein_foods: "🥩",
  dairy: "🧀",
  grains: "🍞",
  beverages: "🥤",
  all: "🍽️"
};

const CommonFoods = ({ onSelectFood, onBack }: CommonFoodsProps) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchMode, setSearchMode] = useState<'search' | 'category'>('category');
  const [dataTypeFilter, setDataTypeFilter] = useState<'all' | 'ingredients' | 'meals'>('all');
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
      
      // เรียก API โดยตรง
      const result = await searchFoods(query, loadPage, 20);
      
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
      
      // เรียก API
      const results = await searchFoods(searchTerm, loadPage, 20);
      
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
        loadCategoryFoods(selectedCategory, selectedSubcategory, nextPage);
      }
      
      return nextPage;
    });
  }, [searchMode, searchQuery, selectedCategory, selectedSubcategory, performSearch, loadCategoryFoods]);
  
  // ติดตามการเปลี่ยนแปลงคำค้นหา
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchMode('search');
      setSelectedCategory("all");
      setSelectedSubcategory(null);
      setPage(1);
      
      // ดีเลย์การค้นหาเล็กน้อยเพื่อไม่ให้มีการค้นหาทุกการกดคีย์
      const timer = setTimeout(() => {
        performSearch(searchQuery, 1);
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (searchQuery.length === 0) {
      // ถ้าลบคำค้นหาออกหมด กลับไปที่หมวดหมู่
      setFoods([]);
      setSearchMode('category');
      setPage(1);
      loadCategoryFoods(selectedCategory, selectedSubcategory, 1);
    }
  }, [searchQuery, performSearch, selectedCategory, selectedSubcategory, loadCategoryFoods]);
  
  // โหลดอาหารเมื่อเลือกหมวดหมู่หรือหมวดหมู่ย่อย
  useEffect(() => {
    if (selectedCategory) {
      setSearchMode('category');
      setPage(1);
      loadCategoryFoods(selectedCategory, selectedSubcategory, 1);
    }
  }, [selectedCategory, selectedSubcategory, loadCategoryFoods]);
  
  // ติดตามการเปลี่ยนแปลงฟิลเตอร์ประเภทข้อมูล
  useEffect(() => {
    if (searchQuery.length >= 2) {
      // ค้นหาใหม่เมื่อเปลี่ยนฟิลเตอร์
      setPage(1);
      performSearch(searchQuery, 1);
    } else if (selectedCategory) {
      // โหลดหมวดหมู่ใหม่เมื่อเปลี่ยนฟิลเตอร์
      setPage(1);
      loadCategoryFoods(selectedCategory, selectedSubcategory, 1);
    }
  }, [dataTypeFilter, searchQuery, selectedCategory, selectedSubcategory, performSearch, loadCategoryFoods]);
  
  // ล้างการค้นหาและกลับไปที่หมวดหมู่
  const resetSearch = () => {
    setSearchQuery("");
    setFoods([]);
    setSelectedCategory("all");
    setSelectedSubcategory(null);
    setPage(1);
    loadCategoryFoods("all", null, 1);
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

  const getCategoryEmoji = (category: string): JSX.Element => {
    // Default emoji
    let emoji = '🍽️';
    
    // Convert category string to lowercase for matching
    const lowerCategory = category ? category.toLowerCase() : '';
    
    // Match category with appropriate emoji
    if (lowerCategory.includes('vegetable') || lowerCategory.includes('veg')) {
      emoji = '🥦';
    } else if (lowerCategory.includes('fruit')) {
      emoji = '🍎';
    } else if (lowerCategory.includes('meat') || lowerCategory.includes('beef') || lowerCategory.includes('pork')) {
      emoji = '🥩';
    } else if (lowerCategory.includes('poultry') || lowerCategory.includes('chicken') || lowerCategory.includes('turkey')) {
      emoji = '🍗';
    } else if (lowerCategory.includes('fish') || lowerCategory.includes('seafood')) {
      emoji = '🐟';
    } else if (lowerCategory.includes('dairy') || lowerCategory.includes('milk') || lowerCategory.includes('cheese')) {
      emoji = '🧀';
    } else if (lowerCategory.includes('grain') || lowerCategory.includes('bread') || lowerCategory.includes('cereal')) {
      emoji = '🍞';
    } else if (lowerCategory.includes('beverage') || lowerCategory.includes('drink')) {
      emoji = '🥤';
    } else if (lowerCategory.includes('sweet') || lowerCategory.includes('dessert') || lowerCategory.includes('candy')) {
      emoji = '🍬';
    } else if (lowerCategory.includes('breakfast')) {
      emoji = '🍳';
    } else if (lowerCategory.includes('soup')) {
      emoji = '🍲';
    } else if (lowerCategory.includes('fast food') || lowerCategory.includes('fastfood')) {
      emoji = '🍔';
    } else if (lowerCategory.includes('snack')) {
      emoji = '🍿';
    } else if (lowerCategory.includes('nut') || lowerCategory.includes('seed')) {
      emoji = '🥜';
    } else if (lowerCategory.includes('egg')) {
      emoji = '🥚';
    } else if (lowerCategory.includes('legume') || lowerCategory.includes('bean')) {
      emoji = '🫘';
    }
    
    return <span>{emoji}</span>;
  };
  
  return (
    <div className="pb-safe">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-[hsl(var(--background))] pt-2 pb-3 border-b border-[hsl(var(--border))]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          <Input 
            type="text"
            placeholder={t.mobileNav.common.searchPlaceholder || "Search foods..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 rounded-xl"
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="">
        {/* Category Navigation */}
        {!searchQuery && (
          <div className="mt-4">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="w-full overflow-x-auto flex justify-start mb-3 rounded-xl bg-[hsl(var(--accent))/0.1] p-1">
                <TabsTrigger value="all" className="rounded-lg flex-1 flex items-center justify-center">
                  <span className="mr-1">{CATEGORY_EMOJIS.all}</span> All
                </TabsTrigger>
                <TabsTrigger value="vegetables" className="rounded-lg flex-1 flex items-center justify-center">
                  <span className="mr-1">{CATEGORY_EMOJIS.vegetables}</span> Vegetables
                </TabsTrigger>
                <TabsTrigger value="fruits" className="rounded-lg flex-1 flex items-center justify-center">
                  <span className="mr-1">{CATEGORY_EMOJIS.fruits}</span> Fruits
                </TabsTrigger>
                <TabsTrigger value="protein_foods" className="rounded-lg flex-1 flex items-center justify-center">
                  <span className="mr-1">{CATEGORY_EMOJIS.protein_foods}</span> Protein
                </TabsTrigger>
                <TabsTrigger value="dairy" className="rounded-lg flex-1 flex items-center justify-center">
                  <span className="mr-1">{CATEGORY_EMOJIS.dairy}</span> Dairy
                </TabsTrigger>
                <TabsTrigger value="grains" className="rounded-lg flex-1 flex items-center justify-center">
                  <span className="mr-1">{CATEGORY_EMOJIS.grains}</span> Grains
                </TabsTrigger>
                <TabsTrigger value="beverages" className="rounded-lg flex-1 flex items-center justify-center">
                  <span className="mr-1">{CATEGORY_EMOJIS.beverages}</span> Beverages
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Data Type Filter (Ingredients vs Meals) */}
            <div className="flex overflow-x-auto gap-2 mb-3 no-scrollbar">
              <Button 
                variant={dataTypeFilter === 'all' ? 'default' : 'outline'} 
                size="sm" 
                className="rounded-full"
                onClick={() => setDataTypeFilter('all')}
              >
                All Types
              </Button>
              <Button 
                variant={dataTypeFilter === 'ingredients' ? 'default' : 'outline'} 
                size="sm" 
                className="rounded-full"
                onClick={() => setDataTypeFilter('ingredients')}
              >
                <span className="mr-1">🥦</span> Ingredients
              </Button>
              <Button 
                variant={dataTypeFilter === 'meals' ? 'default' : 'outline'} 
                size="sm" 
                className="rounded-full"
                onClick={() => setDataTypeFilter('meals')}
              >
                <span className="mr-1">🍽️</span> Meals
              </Button>
            </div>
            
            {/* Subcategories for selected category */}
            {selectedCategory !== 'all' && subcategories.length > 0 && (
              <div className="flex overflow-x-auto space-x-2 pb-2 mb-1 no-scrollbar">
                <Button
                  variant={!selectedSubcategory ? 'default' : 'outline'}
                  className="rounded-full whitespace-nowrap"
                  size="sm"
                  onClick={() => setSelectedSubcategory(null)}
                >
                  <span className="mr-1">{CATEGORY_EMOJIS[selectedCategory as keyof typeof CATEGORY_EMOJIS]}</span>
                  All {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                </Button>
                {subcategories.map(subcat => (
                  <Button
                    key={subcat.id}
                    variant={selectedSubcategory === subcat.id ? 'default' : 'outline'}
                    className="rounded-full whitespace-nowrap"
                    size="sm"
                    onClick={() => setSelectedSubcategory(subcat.id)}
                  >
                    <span className="mr-1">{subcat.emoji}</span>
                    {subcat.name}
                  </Button>
                ))}
              </div>
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
          <div className="space-y-3 mt-4 pb-32">
            <div className="space-y-3">
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
                    className="p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium flex items-center">
                        <span className="mr-2 text-lg">{getCategoryEmoji(food.category)}</span>
                        {food.name}
                      </div>
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
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
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
    </div>
  );
};

export default CommonFoods; 