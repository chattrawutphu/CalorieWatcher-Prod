"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, Apple, Pencil, Scan, Clock, Bot, Clipboard, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { useNutritionStore, FoodItem, MealEntry, FoodTemplate, MealFoodItem } from "@/lib/store/nutrition-store";
import { cn } from "@/lib/utils";
import CommonFoods from "./common-foods";
import QuickActionButton from "./quick-action-button";
import FoodDetail from "./food-detail";
import FoodEdit from "./food-edit";
import BarcodeScanner from "./barcode-scanner";
import RecentFoods from "./recent-foods";
import CustomFood from "./custom-food";

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const bottomSheetVariants = {
  hidden: { 
    y: "100%",
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      mass: 0.8
    }
  },
  visible: { 
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      mass: 0.8
    }
  },
  exit: { 
    y: "100%",
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      mass: 0.8
    }
  }
};

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onMealAdded: (food?: FoodItem | FoodTemplate) => void;
}

const BottomSheet = memo(function BottomSheet({ isOpen, onClose, onMealAdded }: BottomSheetProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const dragControls = useDragControls();
  
  // Access nutrition store
  const { 
    addMeal, 
    addFavoriteFood, 
    removeFavoriteFood,
    createMealItemFromTemplate,
    createMealFoodFromScratch,
    currentDate,
    updateFoodTemplate
  } = useNutritionStore();
  
  // State management
  const [currentSection, setCurrentSection] = useState<
    "main" | "common" | "custom" | "barcode" | "recent" | "detail" | "edit"
  >("main");
  
  const [selectedFood, setSelectedFood] = useState<FoodItem | FoodTemplate | null>(null);
  const [previousSection, setPreviousSection] = useState<string>("main");
  const [isVisible, setIsVisible] = useState(false);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  // Handle visibility state
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('overflow-hidden');
    } else {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      onClose();
    }, 300);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Handle back navigation
  const handleBackNavigation = useCallback(() => {
    if (currentSection === "edit" && previousSection === "detail") {
      setCurrentSection("detail");
    } else if (currentSection === "detail" && ["common", "custom", "barcode", "recent"].includes(previousSection)) {
      setCurrentSection(previousSection as typeof currentSection);
    } else {
      setCurrentSection("main");
    }
  }, [currentSection, previousSection]);

  // Navigate to a section
  const navigateToSection = useCallback((section: typeof currentSection) => {
    setPreviousSection(currentSection);
    setCurrentSection(section);
  }, [currentSection]);

  // Handle adding a food
  const handleAddFood = useCallback((food: MealFoodItem, quantity: number, mealType: string) => {
    if (!food) return;
    
    let mealFoodItem: MealFoodItem;
    
    if ('isTemplate' in food && food.isTemplate) {
      const templateId = food.id;
      const createdMealFood = createMealItemFromTemplate(templateId);
      
      if (!createdMealFood) {
        mealFoodItem = {
          id: crypto.randomUUID(),
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          servingSize: food.servingSize,
          category: food.category,
          recordedAt: new Date()
        };
      } else {
        mealFoodItem = createdMealFood;
      }
    } else {
      mealFoodItem = {
        id: crypto.randomUUID(),
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        servingSize: food.servingSize,
        category: food.category,
        recordedAt: new Date()
      };
    }
    
    const meal: MealEntry = {
      id: crypto.randomUUID(),
      mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      foodItem: mealFoodItem,
      quantity: quantity,
      date: currentDate,
    };
    
    addMeal(meal);
    onMealAdded(food);
    handleClose();
  }, [addMeal, handleClose, onMealAdded, currentDate, createMealItemFromTemplate]);

  // Handle food edit
  const handleEditFood = useCallback((food: FoodItem | FoodTemplate) => {
    setSelectedFood(food);
    navigateToSection("edit");
  }, [navigateToSection]);

  // Handle food edit save
  const handleSaveEdit = useCallback((updatedFood: FoodItem) => {
    setSelectedFood(updatedFood);
    
    if (updatedFood.id) {
      if ('isTemplate' in updatedFood && updatedFood.isTemplate) {
        updateFoodTemplate(updatedFood.id, updatedFood);
      } else {
        const template: FoodTemplate = {
          ...updatedFood,
          isTemplate: true,
          favorite: 'favorite' in updatedFood ? updatedFood.favorite : true,
          createdAt: 'createdAt' in updatedFood ? updatedFood.createdAt : new Date(),
        };
        updateFoodTemplate(updatedFood.id, template);
      }
    } else {
      addFavoriteFood(updatedFood);
    }
    
    setCurrentSection("detail");
  }, [addFavoriteFood, updateFoodTemplate]);

  // Add drag gesture handling with snap back
  const handleDragEnd = useCallback((event: any, info: any) => {
    const shouldClose = info.velocity.y > 300 || info.offset.y > 200;
    if (shouldClose) {
      handleClose();
    }
  }, [handleClose]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <>
          {/* Backdrop with blur effect */}
          <motion.div
            key="backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm touch-none"
          />
          
          {/* Bottom Sheet Container */}
          <motion.div
            key="bottom-sheet"
            ref={bottomSheetRef}
            className="fixed inset-0 max-w-md mx-auto z-50 flex flex-col bg-[hsl(var(--background))] rounded-t-2xl h-full border-t border-[hsl(var(--border))] shadow-xl"
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.4}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            dragListener={false}
          >
            {/* Header - Draggable Area */}
            <div
              className="bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] pt-safe touch-none"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="flex justify-center py-2">
                <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--muted))]" />
              </div>
              <div className="py-4 flex items-center px-4">
                <div className="flex items-center gap-2">
                  {currentSection !== "main" && (
                    <motion.button 
                      onClick={handleBackNavigation} 
                      className="p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors touch-manipulation"
                      whileTap={{ scale: 0.95 }}
                      disabled={!isVisible}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </motion.button>
                  )}
                  
                  <h2 className="text-xl font-semibold">
                    {currentSection === "main" && "Add Food"}
                    {currentSection === "common" && t.mobileNav.commonFoods.title}
                    {currentSection === "custom" && t.mobileNav.customFood.title}
                    {currentSection === "barcode" && t.mobileNav.barcodeScanner.title}
                    {currentSection === "recent" && t.mobileNav.recentFoods.title}
                    {currentSection === "detail" && selectedFood?.name}
                    {currentSection === "edit" && (t.mobileNav.foodDetail.editFood || "Edit Food")}
                  </h2>
                </div>
              </div>
              
              {currentSection === "main" && (
                <div className="px-6 pb-3">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Choose an option to add food</p>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div 
              className="flex-1 overflow-y-auto overscroll-none touch-auto" 
              style={{ 
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
              <div className="px-4 pb-24">
                {currentSection === "main" && (
                  <div className="space-y-6">
                    {/* AI Assistant Button with enhanced styling */}
                    <div>
                      <Button
                        onClick={() => {
                          router.push("/add/ai");
                          handleClose();
                        }}
                        className="w-full h-auto sm:p-4 p-3 sm:mb-6 mb-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 transition-opacity sm:rounded-xl rounded-lg shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="sm:w-12 sm:h-12 w-10 h-10 sm:rounded-2xl rounded-xl bg-white/20 flex items-center justify-center">
                            <Bot className="sm:h-6 sm:w-6 h-5 w-5" />
                          </div>
                          <div className="flex-grow text-left">
                            <div className="font-medium sm:text-base text-sm">{t.mobileNav.aiAssistant.title}</div>
                            <div className="sm:text-sm text-xs opacity-90">{t.mobileNav.aiAssistant.description}</div>
                          </div>
                        </div>
                      </Button>
                    </div>

                    {/* Quick Actions with enhanced styling */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] sm:mb-3 mb-2">
                        {t.mobileNav.common.quickActions || "Quick Actions"}
                      </h3>
                      <div className="space-y-3">
                        <QuickActionButton
                          icon={<Apple className="h-6 w-6" />}
                          label={t.mobileNav.commonFoods.title || "Common Foods"}
                          description={t.mobileNav.common.commonFoodsDesc || "Choose from frequently used items"}
                          onClick={() => setCurrentSection("common")}
                        />
                        <QuickActionButton
                          icon={<Pencil className="h-6 w-6" />}
                          label={t.mobileNav.customFood.title || "Custom Food"}
                          description={t.mobileNav.common.customFoodDesc || "Create your own food entry"}
                          onClick={() => setCurrentSection("custom")}
                        />
                        <QuickActionButton
                          icon={<Scan className="h-6 w-6" />}
                          label={t.mobileNav.barcodeScanner.title || "Barcode Scanner"}
                          description={t.mobileNav.common.barcodeScannerDesc || "Get nutrition info from barcode"}
                          onClick={() => setCurrentSection("barcode")}
                        />
                        <QuickActionButton
                          icon={<Clock className="h-6 w-6" />}
                          label={t.mobileNav.recentFoods.title || "Recent Foods"}
                          description={t.mobileNav.common.recentFoodsDesc || "View your recently added foods"}
                          onClick={() => setCurrentSection("recent")}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {currentSection === "common" && (
                  <CommonFoods 
                    onSelectFood={(food) => {
                      setSelectedFood(food);
                      navigateToSection("detail");
                    }} 
                    onBack={() => setCurrentSection("main")}
                  />
                )}
                
                {currentSection === "custom" && (
                  <CustomFood 
                    onAdd={(food) => {
                      setSelectedFood(food);
                      navigateToSection("detail");
                    }} 
                    onBack={() => setCurrentSection("main")}
                  />
                )}
                
                {currentSection === "barcode" && (
                  <BarcodeScanner 
                    onFoodFound={(food) => {
                      setSelectedFood(food);
                      navigateToSection("detail");
                    }} 
                    onBack={() => setCurrentSection("main")}
                  />
                )}
                
                {currentSection === "recent" && (
                  <RecentFoods 
                    onSelectFood={(food) => {
                      setSelectedFood(food);
                      navigateToSection("detail");
                    }} 
                    onBack={() => setCurrentSection("main")}
                  />
                )}
                
                {currentSection === "detail" && selectedFood && (
                  <FoodDetail 
                    food={selectedFood}
                    onAddFood={handleAddFood}
                    onBack={handleBackNavigation}
                    onEdit={handleEditFood}
                  />
                )}
                
                {currentSection === "edit" && selectedFood && (
                  <FoodEdit
                    food={selectedFood}
                    onSave={handleSaveEdit}
                    onBack={() => setCurrentSection("detail")}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default BottomSheet; 