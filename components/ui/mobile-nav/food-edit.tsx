"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodItem, FoodTemplate, isTemplate, useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FOOD_CATEGORIES } from "@/lib/api/usda-api";

interface FoodEditProps {
  food: FoodItem;
  onBack: () => void;
  onSave: (food: FoodItem) => void;
}

const FoodEdit = ({ food, onBack, onSave }: FoodEditProps) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const { updateFoodTemplate, addFoodTemplate } = useNutritionStore();
  
  // Check if we're editing a template
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  
  // Edit state
  const [editableFood, setEditableFood] = useState<FoodItem>({...food});
  
  // State for serving size components
  const [servingAmount, setServingAmount] = useState("1");
  const [servingUnit, setServingUnit] = useState("serving");
  
  // Common serving units
  const commonUnits = [
    { value: "serving", label: "serving" },
    { value: "g", label: "g" },
    { value: "ml", label: "ml" },
    { value: "cup", label: "cup" },
    { value: "tbsp", label: "tbsp" },
    { value: "tsp", label: "tsp" },
    { value: "pcs", label: "pcs" },
    { value: "oz", label: "oz" },
    { value: "lb", label: "lb" }
  ];
  
  // Initialize component based on food type
  useEffect(() => {
    // Check if it's a template
    setIsEditingTemplate(isTemplate(food));
    
    // Initialize editable food
    setEditableFood({...food});
    
    // Initialize serving size components
    try {
      const servingSizeParts = food.servingSize.split(' ');
      if (servingSizeParts.length >= 2) {
        const amount = parseFloat(servingSizeParts[0]);
        if (!isNaN(amount)) {
          setServingAmount(amount.toString());
        }
        
        const unit = servingSizeParts.slice(1).join(' ');
        // Check if unit exists in our list
        const unitExists = commonUnits.some(u => u.value === unit);
        if (unitExists) {
          setServingUnit(unit);
        }
      }
    } catch (e) {
      console.error("Error parsing serving size:", e);
    }
  }, [food]);
  
  // Update serving size when components change
  useEffect(() => {
    const newServingSize = `${servingAmount} ${servingUnit}`;
    setEditableFood(prev => ({
      ...prev, 
      servingSize: newServingSize
    }));
  }, [servingAmount, servingUnit]);
  
  // Handle saving changes
  const handleSave = () => {
    // Process numeric values
    const processedFood = {
      ...editableFood,
      calories: typeof editableFood.calories === 'number' ? editableFood.calories : parseFloat(editableFood.calories as any) || 0,
      protein: typeof editableFood.protein === 'number' ? editableFood.protein : parseFloat(editableFood.protein as any) || 0,
      carbs: typeof editableFood.carbs === 'number' ? editableFood.carbs : parseFloat(editableFood.carbs as any) || 0,
      fat: typeof editableFood.fat === 'number' ? editableFood.fat : parseFloat(editableFood.fat as any) || 0,
    };
    
    if (isEditingTemplate) {
      // If editing a template, update it in the store
      const template = processedFood as FoodTemplate;
      updateFoodTemplate(template.id, template);
    } else {
      // ถ้าเป็นรายการอาหารที่มีอยู่แล้ว (มี id) ให้ทำการอัปเดต ไม่ใช่สร้างใหม่
      if (processedFood.id) {
        // สร้าง template จากข้อมูลที่มีอยู่ และอัปเดตข้อมูลเดิม
        const updatedTemplate: FoodTemplate = {
          ...processedFood,
          favorite: 'favorite' in processedFood ? processedFood.favorite : true,
          createdAt: 'createdAt' in processedFood ? processedFood.createdAt : new Date(),
          isTemplate: true
        } as FoodTemplate;
        
        // อัปเดตข้อมูลแทนการเพิ่มใหม่
        updateFoodTemplate(updatedTemplate.id, updatedTemplate);
      } else {
        // ถ้าไม่มี id แสดงว่าเป็นรายการใหม่จริงๆ
        const newTemplate: FoodTemplate = {
          ...processedFood,
          id: crypto.randomUUID(),
          favorite: 'favorite' in processedFood ? processedFood.favorite : true,
          createdAt: 'createdAt' in processedFood ? processedFood.createdAt : new Date(),
          isTemplate: true
        } as FoodTemplate;
        
        addFoodTemplate(newTemplate);
      }
    }
    
    // Send the processed food back to the parent
    onSave(processedFood);
  };
  
  // Format number inputs
  const formatNumber = (num: number): number => {
    return parseFloat(num.toFixed(2));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 p-0 h-auto"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.mobileNav.foodDetail.back || "Back"}</span>
        </Button>
        
        <h2 className="text-lg font-medium">{t.mobileNav.foodDetail.editFood || "Edit Food"}</h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className="flex items-center gap-1"
        >
          <Check className="h-4 w-4" />
          <span>{t.mobileNav.foodDetail.save || "Save"}</span>
        </Button>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.mobileNav.customFood.foodName || "Food Name"}</label>
          <Input 
            value={editableFood.name}
            onChange={(e) => setEditableFood({...editableFood, name: e.target.value})}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t.mobileNav.customFood.foodCategory || "Food Category"}</label>
          <Select
            value={editableFood.category}
            onValueChange={(value) => setEditableFood({...editableFood, category: value as FoodItem['category']})}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOOD_CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <span>{category.emoji}</span>
                    <span>{t.mobileNav.commonFoods.categories[category.id as keyof typeof t.mobileNav.commonFoods.categories] || category.id}</span>
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="other">
                <div className="flex items-center gap-2">
                  <span>📋</span>
                  <span>{t.mobileNav.commonFoods.categories.other || "Other"}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t.mobileNav.customFood.calories || "Calories (kcal)"}</label>
          <Input 
            type="number"
            value={editableFood.calories}
            onChange={(e) => setEditableFood({
              ...editableFood, 
              calories: parseFloat(e.target.value) || 0
            })}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.mobileNav.foodDetail.servingSize || "Serving Size"}</label>
          <div className="flex gap-2">
            <Input 
              type="number"
              min="0.1"
              step="0.1"
              value={servingAmount}
              onChange={(e) => setServingAmount(e.target.value)}
              className="w-1/3"
            />
            <Select
              value={servingUnit}
              onValueChange={setServingUnit}
            >
              <SelectTrigger className="w-2/3">
                <SelectValue />
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

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">{t.result.protein || "Protein"} (g)</label>
            <Input 
              type="number"
              value={editableFood.protein}
              onChange={(e) => setEditableFood({
                ...editableFood, 
                protein: parseFloat(e.target.value) || 0
              })}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">{t.result.carbs || "Carbs"} (g)</label>
            <Input 
              type="number"
              value={editableFood.carbs}
              onChange={(e) => setEditableFood({
                ...editableFood, 
                carbs: parseFloat(e.target.value) || 0
              })}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">{t.result.fat || "Fat"} (g)</label>
            <Input 
              type="number"
              value={editableFood.fat}
              onChange={(e) => setEditableFood({
                ...editableFood, 
                fat: parseFloat(e.target.value) || 0
              })}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <Button
        className="w-full mt-6"
        onClick={handleSave}
      >
        <Save className="h-4 w-4 mr-2" />
        {t.mobileNav.foodDetail.saveChanges || "Save Changes"}
      </Button>
    </div>
  );
};

export default FoodEdit; 