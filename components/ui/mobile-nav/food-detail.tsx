"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, Pencil, BookmarkPlus, Bookmark, Plus, Trash2, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodItem, FoodTemplate, MealFoodItem, isTemplate, useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface FoodDetailProps {
  food: FoodItem;
  onBack: () => void;
  onAddFood: (food: MealFoodItem, quantity: number, mealType: string) => void;
  onEdit?: (food: FoodItem) => void;
}

const FoodDetail = ({ food, onBack, onAddFood, onEdit }: FoodDetailProps) => {
  // ผู้ใช้สามารถปรับปริมาณได้เป็นทศนิยม
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState("breakfast");
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const { foodTemplates, addFoodTemplate, createMealFoodFromScratch, removeFoodTemplate } = useNutritionStore();
  
  // เพิ่ม state สำหรับหน่วย
  const [quantityUnit, setQuantityUnit] = useState("serving");
  
  // Add state for saving to custom foods
  const [saveAsCustomFood, setSaveAsCustomFood] = useState(false);
  // Check if food already exists in custom foods
  const [existsInCustomFoods, setExistsInCustomFoods] = useState(false);
  const [matchingCustomFood, setMatchingCustomFood] = useState<FoodTemplate | null>(null);
  
  // รายการหน่วยที่ใช้บ่อย
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
  
  // สถานะสำหรับโหมดแก้ไขและข้อมูลอาหารที่แก้ไขได้
  const [isEditing, setIsEditing] = useState(false);
  const [editableFood, setEditableFood] = useState<FoodItem>({...food});
  
  // Check if this food exists in custom foods on component mount
  useEffect(() => {
    // Check if this food is already saved as a custom food
    // We can compare by name since barcode foods have unique names
    const customFood = foodTemplates.find(
      t => t.name.toLowerCase() === food.name.toLowerCase()
    );
    
    if (customFood) {
      setExistsInCustomFoods(true);
      setMatchingCustomFood(customFood);
      // If found, use the custom food data instead
      setEditableFood({...customFood});
    } else {
      setExistsInCustomFoods(false);
      setMatchingCustomFood(null);
      setEditableFood({...food});
    }
  }, [food, foodTemplates]);
  
  // อัปเดต editableFood เมื่อ food prop เปลี่ยน
  useEffect(() => {
    // Only update if no matching custom food was found
    if (!matchingCustomFood) {
      setEditableFood({...food});
    }
    
    // แยกปริมาณและหน่วยจาก serving size
    try {
      const currentFood = matchingCustomFood || food;
      
      // ถ้า servingSize เป็นตัวเลข ให้ใช้ค่านั้นโดยตรง
      if (typeof currentFood.servingSize === 'number') {
        setQuantity(currentFood.servingSize);
        setQuantityUnit('serving');
        return;
      }
      
      // ถ้าเป็น string ให้พยายามแยกตัวเลขออกมา
      const servingSizeParts = String(currentFood.servingSize).split(' ');
      if (servingSizeParts.length >= 2) {
        const amount = parseFloat(servingSizeParts[0]);
        if (!isNaN(amount)) {
          setQuantity(amount);
        }
        
        const unit = servingSizeParts.slice(1).join(' ');
        // ตรวจสอบว่าหน่วยมีอยู่ในรายการไหม
        const unitExists = commonUnits.some(u => u.value === unit);
        if (unitExists) {
          setQuantityUnit(unit);
        }
      }
    } catch (e) {
      console.error("Error parsing serving size:", e);
      // Set default values if parsing fails
      setQuantity(1);
      setQuantityUnit('serving');
    }
  }, [food, matchingCustomFood]);

  // Handle saving food as custom food
  const handleSaveAsCustomFood = () => {
    // Create a FoodTemplate from the current food data
    const template: FoodTemplate = {
      id: crypto.randomUUID(),
      name: editableFood.name,
      calories: typeof editableFood.calories === 'number' ? editableFood.calories : parseFloat(editableFood.calories as any) || 0,
      protein: typeof editableFood.protein === 'number' ? editableFood.protein : parseFloat(editableFood.protein as any) || 0,
      carbs: typeof editableFood.carbs === 'number' ? editableFood.carbs : parseFloat(editableFood.carbs as any) || 0,
      fat: typeof editableFood.fat === 'number' ? editableFood.fat : parseFloat(editableFood.fat as any) || 0,
      servingSize: editableFood.servingSize,
      category: editableFood.category,
      favorite: true,
      createdAt: new Date(),
      isTemplate: true,
      // Copy additional properties if they exist
      usdaId: 'usdaId' in editableFood ? editableFood.usdaId : undefined,
      brandName: 'brandName' in editableFood ? editableFood.brandName : undefined,
      ingredients: 'ingredients' in editableFood ? editableFood.ingredients : undefined,
      dataType: 'dataType' in editableFood ? editableFood.dataType : undefined,
      mealCategory: 'mealCategory' in editableFood ? editableFood.mealCategory : undefined,
    };
    
    addFoodTemplate(template);
    setExistsInCustomFoods(true);
    setMatchingCustomFood(template);
    setSaveAsCustomFood(false);
  };

  // Handle edit button click
  const handleEditClick = () => {
    if (isEditing) {
      applyEdits();
    } else if (onEdit) {
      // Navigate to edit screen
      onEdit(matchingCustomFood || editableFood);
    } else {
      // If no onEdit handler, use inline editing
      setIsEditing(true);
    }
  };

  // นำการแก้ไขไปใช้กับอาหารที่แสดง
  const applyEdits = () => {
    // สร้าง FoodItem ใหม่พร้อมค่าที่แก้ไขแล้วแต่รักษา id ต้นฉบับ
    const updatedFood: FoodItem = {
      ...editableFood,
      id: food.id,
      createdAt: 'createdAt' in food ? food.createdAt : new Date(),
      favorite: 'favorite' in food ? food.favorite : false,
    };
    
    // สร้าง MealFoodItem สำหรับส่งไปยัง parent
    const mealFood = createMealFoodFromScratch({
      name: updatedFood.name,
      calories: typeof updatedFood.calories === 'number' ? updatedFood.calories : parseFloat(updatedFood.calories as any) || 0,
      protein: typeof updatedFood.protein === 'number' ? updatedFood.protein : parseFloat(updatedFood.protein as any) || 0,
      carbs: typeof updatedFood.carbs === 'number' ? updatedFood.carbs : parseFloat(updatedFood.carbs as any) || 0,
      fat: typeof updatedFood.fat === 'number' ? updatedFood.fat : parseFloat(updatedFood.fat as any) || 0,
      servingSize: updatedFood.servingSize,
      category: updatedFood.category,
      // Copy additional properties if they exist
      usdaId: 'usdaId' in updatedFood ? updatedFood.usdaId : undefined,
      brandName: 'brandName' in updatedFood ? updatedFood.brandName : undefined,
      ingredients: 'ingredients' in updatedFood ? updatedFood.ingredients : undefined,
    });
    
    // ส่งอาหารที่แก้ไขกลับไปที่ parent component
    onAddFood(mealFood, quantity, mealType);
    
    // ออกจากโหมดแก้ไข
    setIsEditing(false);
  };

  // จัดรูปแบบตัวเลขเพื่อป้องกันทศนิยมมากเกินไป
  const formatNumber = (num: number): number => {
    return parseFloat(num.toFixed(2));
  };

  // ข้อมูลอาหารที่จะแสดง (ต้นฉบับหรือที่แก้ไข)
  const displayFood = isEditing ? editableFood : (matchingCustomFood || editableFood);
  
  // คำนวณแคลอรี่ตามปริมาณที่เลือก
  const calculateCalories = () => {
    // ถ้า servingSize เป็นตัวเลข ให้ใช้ค่านั้นโดยตรง
    if (typeof food.servingSize === 'number') {
      return formatNumber((displayFood.calories / food.servingSize) * quantity);
    }
    
    // ถ้าเป็น string ให้พยายามแยกตัวเลขออกมา
    const servingSizeParts = String(food.servingSize).split(' ');
    if (servingSizeParts.length >= 2) {
      const originalAmount = parseFloat(servingSizeParts[0]);
      if (!isNaN(originalAmount) && originalAmount > 0) {
        // คำนวณตามสัดส่วน
        return formatNumber((displayFood.calories / originalAmount) * quantity);
      }
    }
    // หากไม่สามารถแยกได้ใช้วิธีคูณปกติ
    return formatNumber(displayFood.calories * quantity);
  };

  // Get category emoji
  const getCategoryEmoji = (category: string): JSX.Element => {
    const lowerCategory = (category || '').toLowerCase();
    
    if (lowerCategory.includes('protein') || lowerCategory.includes('meat')) {
      return <span>🥩</span>;
    } else if (lowerCategory.includes('dairy') || lowerCategory.includes('milk') || lowerCategory.includes('cheese')) {
      return <span>🧀</span>;
    } else if (lowerCategory.includes('fruit')) {
      return <span>🍎</span>;
    } else if (lowerCategory.includes('vegetable') || lowerCategory.includes('veg')) {
      return <span>🥦</span>;
    } else if (lowerCategory.includes('grain') || lowerCategory.includes('bread')) {
      return <span>🍞</span>;
    } else if (lowerCategory.includes('beverage') || lowerCategory.includes('drink')) {
      return <span>🥤</span>;
    } else if (lowerCategory.includes('snack')) {
      return <span>🍿</span>;
    } else {
      return <span>🍽️</span>;
    }
  };

  // เมื่อกดปุ่มเพิ่มอาหาร
  const handleAddFood = () => {
    // สร้าง serving size ใหม่โดยรวมปริมาณและหน่วย
    const newServingSize = `${quantity} ${quantityUnit}`;
    
    // สร้าง MealFoodItem สำหรับการบันทึก
    let mealFood: MealFoodItem;
    
    // หากมี template ที่ตรงกัน ให้ใช้ template เป็นฐาน
    if (matchingCustomFood) {
      mealFood = createMealFoodFromScratch({
        name: matchingCustomFood.name,
        calories: matchingCustomFood.calories,
        protein: matchingCustomFood.protein,
        carbs: matchingCustomFood.carbs,
        fat: matchingCustomFood.fat,
        servingSize: newServingSize,
        category: matchingCustomFood.category,
        usdaId: matchingCustomFood.usdaId,
        brandName: matchingCustomFood.brandName,
        ingredients: matchingCustomFood.ingredients,
        templateId: matchingCustomFood.id // อ้างอิงถึง template ต้นฉบับ
      });
    } else {
      // ถ้าไม่มี template สร้างจากข้อมูลอาหารโดยตรง
      mealFood = createMealFoodFromScratch({
        name: displayFood.name,
        calories: displayFood.calories,
        protein: displayFood.protein,
        carbs: displayFood.carbs,
        fat: displayFood.fat,
        servingSize: newServingSize,
        category: displayFood.category,
        usdaId: 'usdaId' in displayFood ? displayFood.usdaId : undefined,
        brandName: 'brandName' in displayFood ? displayFood.brandName : undefined,
        ingredients: 'ingredients' in displayFood ? displayFood.ingredients : undefined,
      });
    }
    
    // ส่งอาหารและปริมาณไปยัง parent
    onAddFood(mealFood, 1, mealType); // ส่ง quantity=1 เพราะเราได้ปรับ serving size ในตัว MealFoodItem แล้ว
  };

  // Handle delete button click
  const handleDeleteFood = () => {
    if (existsInCustomFoods && matchingCustomFood) {
      // ส่ง ID ของ template ไปให้ฟังก์ชัน removeFoodTemplate
      removeFoodTemplate(matchingCustomFood.id);
      // กลับไปที่หน้าก่อนหน้า
      onBack();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="pb-safe">
        <div className="space-y-6">
          {/* Food Title and Preview */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white">
              {getCategoryEmoji(displayFood.category)}
            </div>
            <div className="flex-1 overflow-hidden">
              <h2 className="text-lg font-semibold truncate">{displayFood.name}</h2>
              <p className="text-[hsl(var(--muted-foreground))] text-xs truncate">
                {quantity} × {typeof displayFood.servingSize === 'string' ? displayFood.servingSize : 'serving'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Nutrition Summary */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex flex-col items-center justify-center">
              <span className="text-md font-semibold">{Math.round(calculateCalories())}</span>
              <span className="text-xs">kcal</span>
            </div>
            <div className="p-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] flex flex-col items-center justify-center">
              <span className="text-md font-semibold">{Math.round(displayFood.protein * quantity)}</span>
              <span className="text-xs">{t.result.protein}</span>
            </div>
            <div className="p-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] flex flex-col items-center justify-center">
              <span className="text-md font-semibold">{Math.round(displayFood.carbs * quantity)}</span>
              <span className="text-xs">{t.result.carbs}</span>
            </div>
            <div className="p-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] flex flex-col items-center justify-center">
              <span className="text-md font-semibold">{Math.round(displayFood.fat * quantity)}</span>
              <span className="text-xs">{t.result.fat}</span>
            </div>
          </div>
          
          {/* Custom Food Saving Option - Only show if not already saved and not USDA food */}
          {!existsInCustomFoods && !(food as any).usdaId && !isEditing && (
            <div className="flex items-start space-x-2 p-3 rounded-lg bg-[hsl(var(--accent))]/10">
              <Checkbox 
                id="save-custom" 
                checked={saveAsCustomFood}
                onCheckedChange={(checked) => setSaveAsCustomFood(checked === true)}
                className="mt-1"
              />
              <div className="grid gap-1 leading-none">
                <label
                  htmlFor="save-custom"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t.mobileNav.foodDetail.saveCustomFood || "Add to My Custom Foods"}
                </label>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t.mobileNav.foodDetail.saveCustomFoodDesc || "Save this food for easier access in the future"}
                </p>
              </div>
            </div>
          )}
          
          {/* Show note when using a custom food version */}
          {existsInCustomFoods && !isEditing && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--accent))]/10 text-sm">
              <Bookmark className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span>{t.mobileNav.foodDetail.usingCustomFood || "Using your saved custom food data"}</span>
              {/* Add delete option */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteFood}
                className="ml-auto h-7 px-2 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          )}
          
          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.mobileNav.foodDetail.quantity}</label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-l-lg border-r-0 flex-shrink-0"
                onClick={() => quantity > 0.25 && setQuantity(formatNumber(quantity - 0.25))}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <Input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setQuantity(formatNumber(value));
                  }
                }}
                step="0.25"
                min="0.25"
                className="h-12 rounded-none text-center border-x-0 touch-manipulation"
              />

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-r-lg border-l-0 flex-shrink-0"
                onClick={() => setQuantity(formatNumber(quantity + 0.25))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isEditing ? (
            <div className="border border-[hsl(var(--border))] rounded-lg p-3 space-y-4 bg-[hsl(var(--card))]">
              <div className="space-y-1">
                <label className="text-sm font-medium">Food Name</label>
                <Input 
                  value={editableFood.name}
                  onChange={(e) => setEditableFood({...editableFood, name: e.target.value})}
                  className="w-full rounded-lg h-10 touch-manipulation"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Serving Size</label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={editableFood.servingSize.split(' ')[0] || '1'}
                    onChange={(e) => {
                      const unit = editableFood.servingSize.split(' ').slice(1).join(' ') || 'serving';
                      setEditableFood({
                        ...editableFood, 
                        servingSize: `${e.target.value} ${unit}`
                      });
                    }}
                    className="w-1/3 rounded-lg h-10 touch-manipulation"
                  />
                  <Select
                    value={editableFood.servingSize.split(' ').slice(1).join(' ') || 'serving'}
                    onValueChange={(value) => {
                      const amount = editableFood.servingSize.split(' ')[0] || '1';
                      setEditableFood({
                        ...editableFood, 
                        servingSize: `${amount} ${value}`
                      });
                    }}
                  >
                    <SelectTrigger className="w-2/3 rounded-lg h-10">
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

              <div className="space-y-1">
                <label className="text-sm font-medium">Calories (kcal)</label>
                <Input 
                  type="number"
                  value={editableFood.calories}
                  onChange={(e) => setEditableFood({
                    ...editableFood, 
                    calories: parseFloat(e.target.value) || 0
                  })}
                  className="w-full rounded-lg h-10 touch-manipulation"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Macronutrients (g)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t.result.protein}</label>
                    <Input 
                      type="number"
                      value={editableFood.protein}
                      onChange={(e) => setEditableFood({
                        ...editableFood, 
                        protein: parseFloat(e.target.value) || 0
                      })}
                      className="w-full rounded-lg h-10 touch-manipulation"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t.result.carbs}</label>
                    <Input 
                      type="number"
                      value={editableFood.carbs}
                      onChange={(e) => setEditableFood({
                        ...editableFood, 
                        carbs: parseFloat(e.target.value) || 0
                      })}
                      className="w-full rounded-lg h-10 touch-manipulation"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t.result.fat}</label>
                    <Input 
                      type="number"
                      value={editableFood.fat}
                      onChange={(e) => setEditableFood({
                        ...editableFood, 
                        fat: parseFloat(e.target.value) || 0
                      })}
                      className="w-full rounded-lg h-10 touch-manipulation"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-[hsl(var(--border))] rounded-lg p-3 space-y-4 bg-[hsl(var(--card))]">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t.mobileNav.foodDetail.mealType}</label>
                <Select
                  value={mealType}
                  onValueChange={setMealType}
                >
                  <SelectTrigger className="w-full rounded-lg h-10">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">{t.mobileNav.foodDetail.mealTypes.breakfast}</SelectItem>
                    <SelectItem value="lunch">{t.mobileNav.foodDetail.mealTypes.lunch}</SelectItem>
                    <SelectItem value="dinner">{t.mobileNav.foodDetail.mealTypes.dinner}</SelectItem>
                    <SelectItem value="snack">{t.mobileNav.foodDetail.mealTypes.snack}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Serving Unit</label>
                <Select
                  value={quantityUnit}
                  onValueChange={setQuantityUnit}
                >
                  <SelectTrigger className="w-full rounded-lg h-10">
                    <SelectValue placeholder="Unit" />
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
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="w-full"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Food Details
              </Button>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Add button for saving as custom food */}
            {saveAsCustomFood && !existsInCustomFoods && (
              <Button 
                className="w-full"
                variant="outline"
                onClick={handleSaveAsCustomFood}
              >
                <BookmarkPlus className="h-4 w-4 mr-2" />
                {t.mobileNav.foodDetail.saveButton || "Save to My Custom Foods"}
              </Button>
            )}
            
            {/* Regular add food button or save edits button */}
            {isEditing ? (
              <Button
                className="w-full"
                onClick={handleEditClick}
              >
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleAddFood}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.mobileNav.foodDetail.addToMeal}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail; 