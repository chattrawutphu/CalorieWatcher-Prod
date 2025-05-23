"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodItem, FoodTemplate, useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, ArrowLeft, Pencil, AlignLeft, X, Search } from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/api/usda-api";
import { AnimatePresence } from "framer-motion";

interface CustomFoodProps {
  onAdd: (food: FoodItem) => void;
  onBack: () => void;
}

const CustomFood = ({ onAdd, onBack }: CustomFoodProps) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const [showAddForm, setShowAddForm] = useState(false);
  const { foodTemplates, addFoodTemplate } = useNutritionStore();
  
  // รวบรวมรายการอาหารที่ผู้ใช้เคยสร้างไว้
  const [userCustomFoods, setUserCustomFoods] = useState<FoodTemplate[]>([]);
  
  // แยก state สำหรับ serving size เป็นปริมาณและหน่วย
  const [servingAmount, setServingAmount] = useState<string>("1");
  const [servingUnit, setServingUnit] = useState<string>("serving");
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // รายการหน่วยที่ใช้บ่อย
  const commonUnits = [
    { value: "serving", label: "serving" },
    { value: "gram", label: "g" },
    { value: "milliliter", label: "ml" },
    { value: "cup", label: "cup" },
    { value: "tablespoon", label: "tbsp" },
    { value: "teaspoon", label: "tsp" },
    { value: "piece", label: "pcs" },
    { value: "ounce", label: "oz" },
    { value: "pound", label: "lb" }
  ];
  
  // Category filter options
  const categoryFilters = [
    { id: "all", label: "All" },
    { id: "protein", label: "Protein" },
    { id: "carbs", label: "Carbs" },
    { id: "fats", label: "Fats" },
    { id: "other", label: "Other" },
  ];
  
  const [customFood, setCustomFood] = useState<{
    name: string;
    calories: string | number;
    protein: string | number;
    fat: string | number;
    carbs: string | number;
    servingSize: string;
    category: FoodTemplate['category'];
  }>({
    name: "",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    servingSize: "1 serving",
    category: "other"
  });

  // ดึงรายการอาหารที่ผู้ใช้เคยเพิ่มไว้
  useEffect(() => {
    // รวบรวมอาหารจาก foodTemplates ที่เป็น template
    setUserCustomFoods(foodTemplates.filter(food => food.isTemplate === true));
  }, [foodTemplates]);

  // Filter foods based on search term and selected category
  const filteredFoods = useMemo(() => {
    return userCustomFoods.filter(food => {
      const matchesSearch = !searchTerm || 
        food.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || 
        (selectedCategory === "protein" && food.protein > 0) ||
        (selectedCategory === "carbs" && food.carbs > 0) ||
        (selectedCategory === "fats" && food.fat > 0) ||
        (selectedCategory === "other" && food.category === "other");
      
      return matchesSearch && matchesCategory;
    });
  }, [userCustomFoods, searchTerm, selectedCategory]);

  const handleSubmit = () => {
    if (!customFood.name || !customFood.calories) return;
    
    // รวมปริมาณและหน่วยเป็น serving size เดียว
    const combinedServingSize = `${servingAmount} ${servingUnit}`;
    
    const newFood: FoodTemplate = {
      id: crypto.randomUUID(),
      name: customFood.name,
      calories: Number(customFood.calories) || 0,
      protein: Number(customFood.protein) || 0,
      carbs: Number(customFood.carbs) || 0,
      fat: Number(customFood.fat) || 0,
      servingSize: combinedServingSize,
      category: customFood.category || "other",
      favorite: true,
      createdAt: new Date(),
      isTemplate: true
    };
    
    // เพิ่มไปที่ foodTemplates เพื่อให้เก็บไว้ใช้ต่อ
    addFoodTemplate(newFood);
    
    // ส่งต่อไปยัง onAdd
    onAdd(newFood);
    
    // Reset form และซ่อนฟอร์ม
    setCustomFood({
      name: "",
      calories: "",
      protein: "",
      fat: "",
      carbs: "",
      servingSize: "1 serving",
      category: "other"
    });
    setServingAmount("1");
    setServingUnit("serving");
    setShowAddForm(false);
  };

  return (
    <div>
      {showAddForm ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.mobileNav.customFood.foodName}</label>
            <Input
              type="text"
              value={customFood.name}
              onChange={(e) => setCustomFood({...customFood, name: e.target.value})}
              placeholder={t.mobileNav.customFood.foodNamePlaceholder}
              className="rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.mobileNav.customFood.foodCategory}</label>
            <Select
              value={customFood.category}
              onValueChange={(value) => setCustomFood({...customFood, category: value as FoodTemplate['category']})}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={t.mobileNav.customFood.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                {FOOD_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.emoji}</span>
                      <span>{t.mobileNav.commonFoods.categories[category.id as keyof typeof t.mobileNav.commonFoods.categories]}</span>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <span>📋</span>
                    <span>{t.mobileNav.commonFoods.categories.other}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.mobileNav.customFood.calories}</label>
            <Input
              type="number"
              value={customFood.calories}
              onChange={(e) => setCustomFood({...customFood, calories: e.target.value === "0" ? "" : e.target.value})}
              placeholder="0"
              className="rounded-xl"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.mobileNav.customFood.protein}</label>
              <Input
                type="number"
                value={customFood.protein}
                onChange={(e) => setCustomFood({...customFood, protein: e.target.value === "0" ? "" : e.target.value})}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.mobileNav.customFood.carbs}</label>
              <Input
                type="number"
                value={customFood.carbs}
                onChange={(e) => setCustomFood({...customFood, carbs: e.target.value === "0" ? "" : e.target.value})}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.mobileNav.customFood.fat}</label>
              <Input
                type="number"
                value={customFood.fat}
                onChange={(e) => setCustomFood({...customFood, fat: e.target.value === "0" ? "" : e.target.value})}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.mobileNav.customFood.servingSize}</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={servingAmount}
                onChange={(e) => setServingAmount(e.target.value)}
                className="w-1/3 rounded-xl"
                placeholder="1"
              />
              <Select
                value={servingUnit}
                onValueChange={(value) => setServingUnit(value)}
              >
                <SelectTrigger className="w-2/3 rounded-xl">
                  <SelectValue placeholder="serving" />
                </SelectTrigger>
                <SelectContent>
                  {commonUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={handleSubmit}
            disabled={!customFood.name || !customFood.calories}
          >
            {t.mobileNav.customFood.addNew || "Add Custom Food"}
          </Button>
        </div>
      ) : (
        <>
          {/* Search input */}
          <div className="relative mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="text"
                placeholder="Search custom foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-[hsl(var(--border))]"
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Category filters */}
          <div className="flex overflow-x-auto space-x-2 pb-2 mb-4 no-scrollbar">
            {categoryFilters.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`rounded-full px-4 py-2 whitespace-nowrap ${
                  selectedCategory === category.id 
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" 
                    : "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {filteredFoods.length > 0 ? (
            <div className="mt-2 space-y-3">
              <div className="space-y-2">
                {filteredFoods.map((food) => (
                  <div 
                    key={food.id}
                    onClick={() => onAdd(food)}
                    className="flex justify-between items-center p-3 border rounded-xl hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-medium">{food.name}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {food.servingSize} • {food.calories} kcal
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-[hsl(var(--primary))]">
                        {food.protein}g P • {food.carbs}g C • {food.fat}g F
                      </div>
                      <div className="text-[10px] px-1 py-0.5 mt-1 rounded-full bg-[hsl(var(--muted))] inline-block">
                        {t.mobileNav.customFood.badge}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : userCustomFoods.length > 0 ? (
            <div className="py-8 text-center">
              <p className="text-[hsl(var(--muted-foreground))]">No matching foods found</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <AlignLeft className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))/0.5]" />
              <h3 className="text-lg font-medium mb-2">{t.mobileNav.customFood.createFirst}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">{t.mobileNav.customFood.noCustomFoods}</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t.mobileNav.customFood.addNew}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomFood; 
