"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
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
import { useNavigationCleanup } from "@/lib/hooks/use-navigation-cleanup";
import { useDeviceCapabilities } from "@/lib/hooks/use-performance";

// Enhanced animation variants with native-like feel
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94] // iOS native timing
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const bottomSheetVariants = {
  hidden: { 
    y: "100%",
    transition: {
      type: "spring",
      damping: 40,
      stiffness: 400,
      mass: 0.5
    }
  },
  visible: { 
    y: 0,
    transition: {
      type: "spring",
      damping: 40,
      stiffness: 400,
      mass: 0.5
    }
  },
  exit: { 
    y: "100%",
    transition: {
      type: "spring",
      damping: 40,
      stiffness: 400,
      mass: 0.5
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
  const { isLowEnd, isTouchDevice } = useDeviceCapabilities();
  
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
  const [dragOffset, setDragOffset] = useState(0);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  // Navigation cleanup hook
  useNavigationCleanup(isOpen, onClose, {
    closeOnNavigation: true,
    delay: 100
  });

  // Handle visibility state with improved timing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setDragOffset(0);
      // Reset to main section when opening
      setCurrentSection("main");
    }
  }, [isOpen]);

  // Enhanced body scroll prevention
  useEffect(() => {
    if (isVisible) {
      // Store current scroll position
      const scrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;
      
      // Prevent scrolling
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      
      // Prevent pull-to-refresh on mobile
      body.style.overscrollBehavior = 'none';
      
      return () => {
        // Restore scroll position
        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.right = '';
        body.style.overflow = '';
        html.style.overflow = '';
        body.style.overscrollBehavior = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isVisible]);

  // Enhanced close handler with animation
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setDragOffset(0);
    
    const timer = setTimeout(() => {
      onClose();
    }, isLowEnd ? 200 : 250);
    
    return () => clearTimeout(timer);
  }, [onClose, isLowEnd]);

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

  // Native-like drag gesture handling
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { velocity, offset } = info;
    const shouldClose = velocity.y > 500 || offset.y > 150;
    
    if (shouldClose) {
      handleClose();
    } else {
      // Snap back to original position
      setDragOffset(0);
    }
  }, [handleClose]);

  // Handle drag with visual feedback
  const handleDrag = useCallback((event: any, info: PanInfo) => {
    const { offset } = info;
    // Only allow dragging down and only from main section
    if (offset.y > 0 && currentSection === "main") {
      setDragOffset(offset.y);
    }
  }, [currentSection]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isVisible) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (currentSection !== "main") {
          handleBackNavigation();
        } else {
          handleClose();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleClose, handleBackNavigation, currentSection]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <>
          {/* Enhanced backdrop with blur effect */}
          <motion.div
            key="backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm touch-none"
            style={{
              WebkitBackdropFilter: 'blur(8px)',
              backdropFilter: 'blur(8px)'
            }}
          />
          
          {/* Bottom Sheet Container with enhanced mobile UX */}
          <motion.div
            key="bottom-sheet"
            ref={bottomSheetRef}
            className="fixed inset-0 max-w-md mx-auto z-50 flex flex-col bg-[hsl(var(--background))] rounded-t-3xl h-full border-t border-[hsl(var(--border))] shadow-2xl"
            style={{
              transform: `translateY(${dragOffset}px)`,
              willChange: 'transform',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag={isTouchDevice && currentSection === "main" ? "y" : false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            dragListener={false}
          >
            {/* Enhanced Header - Draggable Area */}
            <div
              className="bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] pt-safe touch-none"
              onPointerDown={isTouchDevice && currentSection === "main" ? (e) => dragControls.start(e) : undefined}
              style={{
                cursor: isTouchDevice && currentSection === "main" ? 'grab' : 'default'
              }}
            >
              <div className="flex justify-center py-3">
                <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--muted))] transition-colors" />
              </div>
              <div className="py-4 flex items-center px-4">
                <div className="flex items-center gap-2">
                  {currentSection !== "main" && (
                    <motion.button 
                      onClick={handleBackNavigation} 
                      className="p-2 rounded-full hover:bg-[hsl(var(--muted))] active:bg-[hsl(var(--muted-foreground/10))] transition-colors touch-manipulation"
                      whileTap={{ scale: 0.95 }}
                      disabled={!isVisible}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </motion.button>
                  )}
                  
                  <h2 className="text-xl font-semibold truncate">
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
            
            {/* Enhanced Content with improved scroll behavior */}
            <div 
              className="flex-1 overflow-y-auto overscroll-none touch-auto" 
              style={{ 
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                transform: isLowEnd ? 'translateZ(0)' : undefined
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
                    <div>
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