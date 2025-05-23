"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import CalendarPopup from '@/components/ui/calendar-popup';
import BottomSheet from '@/components/ui/bottom-sheet';
import LayoutEditor from '@/components/ui/layout-editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Save, Minus, Plus, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';
import { aiAssistantTranslations } from '@/lib/translations/ai-assistant';

// กำหนด state types ของ popups ต่างๆ
interface PopupsContextState {
  // Bottom Sheet States
  isBottomSheetOpen: boolean;
  bottomSheetTitle: string;
  bottomSheetContent: ReactNode;
  bottomSheetHeight: "auto" | "full" | "half" | "fullscreen";
  
  // Calendar Popup States
  isCalendarOpen: boolean;
  selectedDate: string;
  
  // Layout Editor States
  isLayoutEditorOpen: boolean;
  layoutEditorWidgets: any[];
  
  // Edit Meal States
  isEditMealOpen: boolean;
  mealToEdit: any;
  editedQuantity: number;
  
  // Methods
  openBottomSheet: (content: ReactNode, title?: string, height?: "auto" | "full" | "half" | "fullscreen") => void;
  closeBottomSheet: () => void;
  openCalendar: (currentDate: string, onSelectCallback?: (date: string) => void) => void;
  closeCalendar: () => void;
  openLayoutEditor: (widgets: any[]) => void;
  closeLayoutEditor: () => void;
  openEditMeal: (meal: any, quantity: number) => void;
  closeEditMeal: () => void;
  updateEditedQuantity: (quantity: number) => void;
  updateMealToEdit: (mealData: any) => void;
  
  // Modal State
  isAnyModalOpen: boolean;
  closeAllPopups: () => void;
}

// สร้าง Context
const PopupsContext = createContext<PopupsContextState | undefined>(undefined);

// Global callback สำหรับ calendar และ layout editor
let calendarCallback: ((date: string) => void) | undefined;
let layoutEditorCallback: ((newOrder: string[], visibility: Record<string, boolean>) => void) | undefined;
let saveEditedMealCallback: (() => void) | undefined;

// Provider Component
export function PopupsProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // Bottom Sheet States
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetTitle, setBottomSheetTitle] = useState('');
  const [bottomSheetContent, setBottomSheetContent] = useState<ReactNode>(null);
  const [bottomSheetHeight, setBottomSheetHeight] = useState<"auto" | "full" | "half" | "fullscreen">("auto");
  
  // Calendar Popup States
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Layout Editor States
  const [isLayoutEditorOpen, setIsLayoutEditorOpen] = useState(false);
  const [layoutEditorWidgets, setLayoutEditorWidgets] = useState<any[]>([]);
  
  // Edit Meal States
  const [isEditMealOpen, setIsEditMealOpen] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<any>(null);
  const [editedQuantity, setEditedQuantity] = useState<number>(1);
  
  // Overall modal state - true if any modal is open
  const isAnyModalOpen = isBottomSheetOpen || isCalendarOpen || isLayoutEditorOpen || isEditMealOpen;
  
  // Effect to disable body scrolling when modal is open
  useEffect(() => {
    if (isAnyModalOpen) {
      // Disable scrolling and pull-to-refresh when modal is open
      document.body.style.overflow = 'hidden';
      
      // Disable touch events on the main content to prevent pull-to-refresh
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.pointerEvents = 'none';
      }
    } else {
      // Re-enable scrolling when all modals are closed
      document.body.style.overflow = '';
      
      // Re-enable touch events
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.pointerEvents = '';
      }
    }
    
    return () => {
      document.body.style.overflow = '';
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.pointerEvents = '';
      }
    };
  }, [isAnyModalOpen]);

  // เพิ่มฟังก์ชันสำหรับปิด popups ทั้งหมด
  const closeAllPopups = () => {
    setIsBottomSheetOpen(false);
    setIsCalendarOpen(false);
    setIsLayoutEditorOpen(false);
    setIsEditMealOpen(false);
    calendarCallback = undefined;
    layoutEditorCallback = undefined;
    saveEditedMealCallback = undefined;
  };
  
  // Bottom Sheet Methods
  const openBottomSheet = (
    content: ReactNode, 
    title: string = '', 
    height: "auto" | "full" | "half" | "fullscreen" = "auto"
  ) => {
    // ปิด popups ทั้งหมดก่อนเปิด bottom sheet ใหม่
    closeAllPopups();
    
    setBottomSheetContent(content);
    setBottomSheetTitle(title);
    setBottomSheetHeight(height);
    setIsBottomSheetOpen(true);
  };
  
  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
  };
  
  // Calendar Methods
  const openCalendar = (currentDate: string, onSelectCallback?: (date: string) => void) => {
    // ปิด popups ทั้งหมดก่อนเปิด calendar ใหม่
    closeAllPopups();
    
    setSelectedDate(currentDate);
    calendarCallback = onSelectCallback;
    setIsCalendarOpen(true);
  };
  
  const closeCalendar = () => {
    setIsCalendarOpen(false);
    calendarCallback = undefined;
  };
  
  // Layout Editor Methods
  const openLayoutEditor = (widgets: any[], onSaveCallback?: (newOrder: string[], visibility: Record<string, boolean>) => void) => {
    // ปิด popups ทั้งหมดก่อนเปิด layout editor ใหม่
    closeAllPopups();
    
    setLayoutEditorWidgets(widgets);
    layoutEditorCallback = onSaveCallback;
    setIsLayoutEditorOpen(true);
  };
  
  const closeLayoutEditor = () => {
    setIsLayoutEditorOpen(false);
    layoutEditorCallback = undefined;
  };
  
  // Edit Meal Methods
  const openEditMeal = (meal: any, quantity: number, onSaveCallback?: () => void) => {
    // ปิด popups ทั้งหมดก่อนเปิด edit meal ใหม่
    closeAllPopups();
    
    setMealToEdit(meal);
    setEditedQuantity(quantity);
    saveEditedMealCallback = onSaveCallback;
    setIsEditMealOpen(true);
  };
  
  const closeEditMeal = () => {
    setIsEditMealOpen(false);
    setMealToEdit(null);
    saveEditedMealCallback = undefined;
  };
  
  const updateEditedQuantity = (quantity: number) => {
    setEditedQuantity(quantity);
  };
  
  const updateMealToEdit = (mealData: any) => {
    setMealToEdit(mealData);
  };
  
  // Handle Calendar Date Selection
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    if (calendarCallback) {
      calendarCallback(date);
    }
    closeCalendar();
  };
  
  // Handle Layout Editor Save
  const handleLayoutSave = (newOrder: string[], visibility: Record<string, boolean>) => {
    if (layoutEditorCallback) {
      layoutEditorCallback(newOrder, visibility);
    }
    closeLayoutEditor();
  };
  
  // Handle Edit Meal Save
  const handleSaveEditedMeal = () => {
    if (saveEditedMealCallback) {
      saveEditedMealCallback();
    }
    closeEditMeal();
  };
  
  // Context value
  const contextValue: PopupsContextState = {
    // Bottom Sheet
    isBottomSheetOpen,
    bottomSheetTitle,
    bottomSheetContent,
    bottomSheetHeight,
    openBottomSheet,
    closeBottomSheet,
    
    // Calendar
    isCalendarOpen,
    selectedDate,
    openCalendar,
    closeCalendar,
    
    // Layout Editor
    isLayoutEditorOpen,
    layoutEditorWidgets,
    openLayoutEditor,
    closeLayoutEditor,
    
    // Edit Meal
    isEditMealOpen,
    mealToEdit,
    editedQuantity,
    openEditMeal,
    closeEditMeal,
    updateEditedQuantity,
    updateMealToEdit,
    
    // Modal State
    isAnyModalOpen,
    closeAllPopups
  };
  
  return (
    <PopupsContext.Provider value={contextValue}>
      {children}
      
      {/* PopupsContainer - แสดง popups ทั้งหมดในระดับสูงสุดของ DOM */}
      <div id="popups-container" className="relative z-[9999]">
        {/* Bottom Sheet */}
        <BottomSheet
          isOpen={isBottomSheetOpen}
          onClose={closeBottomSheet}
          title={bottomSheetTitle}
          height={bottomSheetHeight}
          showDragHandle={true}
          showCloseButton={true}
        >
          {bottomSheetContent}
        </BottomSheet>
        
        {/* Calendar Popup */}
        <CalendarPopup
          isOpen={isCalendarOpen}
          onClose={closeCalendar}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
        
        {/* Layout Editor */}
        {isLayoutEditorOpen && (
          <LayoutEditor
            isOpen={isLayoutEditorOpen}
            onClose={closeLayoutEditor}
            widgetItems={layoutEditorWidgets}
            onSave={handleLayoutSave}
            translations={{
              editLayout: "Edit Layout",
              saveLayout: "Save Layout"
            }}
          />
        )}
        
        {/* Edit Meal */}
        {isEditMealOpen && mealToEdit && (
          <BottomSheet
            isOpen={isEditMealOpen}
            onClose={closeEditMeal}
            title="Edit Meal"
            showDragHandle={true}
            showCloseButton={true}
            height="fullscreen"
          >
            <div className="max-w-md mx-auto">
              <div className="pb-safe">
                <div className="space-y-6">
                  {/* Food Title and Preview */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white">
                      {getCategoryEmoji(mealToEdit?.foodItem.category)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h2 className="text-lg font-semibold truncate">{mealToEdit?.foodItem.name}</h2>
                      <p className="text-[hsl(var(--muted-foreground))] text-xs truncate">
                        {editedQuantity} × {typeof mealToEdit?.foodItem.servingSize === 'string' ? mealToEdit?.foodItem.servingSize : 'serving'}
                      </p>
                    </div>
                  </div>
                
                  {/* Nutrition Summary */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex flex-col items-center justify-center">
                      <span className="text-md font-semibold">{Math.round(mealToEdit?.foodItem.calories * editedQuantity)}</span>
                      <span className="text-xs">kcal</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] flex flex-col items-center justify-center">
                      <span className="text-md font-semibold">{Math.round(mealToEdit?.foodItem.protein * editedQuantity)}</span>
                      <span className="text-xs">{t?.result?.protein || "Protein"}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] flex flex-col items-center justify-center">
                      <span className="text-md font-semibold">{Math.round(mealToEdit?.foodItem.carbs * editedQuantity)}</span>
                      <span className="text-xs">{t?.result?.carbs || "Carbs"}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] flex flex-col items-center justify-center">
                      <span className="text-md font-semibold">{Math.round(mealToEdit?.foodItem.fat * editedQuantity)}</span>
                      <span className="text-xs">{t?.result?.fat || "Fat"}</span>
                    </div>
                  </div>
                
                  {/* Quantity Selector */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t?.mobileNav?.foodDetail?.quantity || "Quantity"}</label>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-l-lg border-r-0 flex-shrink-0"
                        onClick={() => setEditedQuantity(prev => Math.max(0.25, prev - 0.25))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <Input
                        type="number"
                        value={editedQuantity}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value > 0) {
                            setEditedQuantity(value);
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
                        onClick={() => setEditedQuantity(prev => prev + 0.25)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Form Section with Outline */}
                  <div className="border border-[hsl(var(--border))] rounded-lg p-3 space-y-4 bg-[hsl(var(--card))]">
                    <div className="space-y-1">
                  <label className="text-sm font-medium">Food Name</label>
                      <Input
                    type="text"
                    value={mealToEdit?.foodItem.name}
                    onChange={(e) => {
                      if (mealToEdit) {
                        setMealToEdit({
                          ...mealToEdit,
                          foodItem: {
                            ...mealToEdit.foodItem,
                            name: e.target.value
                          }
                        });
                      }
                    }}
                        className="w-full rounded-lg h-10 touch-manipulation"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">{t?.mobileNav?.foodDetail?.servingSize || "Serving Size"}</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={typeof mealToEdit?.foodItem.servingSize === 'string' ? 
                            (mealToEdit.foodItem.servingSize.split(' ')[0] || '1') : '1'}
                    onChange={(e) => {
                      if (mealToEdit) {
                              let unit = 'serving';
                              if (typeof mealToEdit.foodItem.servingSize === 'string') {
                                const parts = mealToEdit.foodItem.servingSize.split(' ');
                                if (parts.length > 1) {
                                  unit = parts.slice(1).join(' ');
                                }
                              }
                        setMealToEdit({
                          ...mealToEdit,
                          foodItem: {
                            ...mealToEdit.foodItem,
                                  servingSize: `${e.target.value} ${unit}`
                          }
                        });
                      }
                    }}
                          className="w-1/3 rounded-lg h-10 touch-manipulation"
                        />
                        <Select
                          value={typeof mealToEdit?.foodItem.servingSize === 'string' ? 
                            (mealToEdit.foodItem.servingSize.split(' ').slice(1).join(' ') || 'serving') : 'serving'}
                          onValueChange={(value) => {
                            if (mealToEdit) {
                              let amount = '1';
                              if (typeof mealToEdit.foodItem.servingSize === 'string') {
                                amount = mealToEdit.foodItem.servingSize.split(' ')[0] || '1';
                              }
                              setMealToEdit({
                                ...mealToEdit,
                                foodItem: {
                                  ...mealToEdit.foodItem,
                                  servingSize: `${amount} ${value}`
                                }
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-2/3 rounded-lg h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="serving">serving</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="cup">cup</SelectItem>
                            <SelectItem value="tbsp">tbsp</SelectItem>
                            <SelectItem value="tsp">tsp</SelectItem>
                            <SelectItem value="pcs">pcs</SelectItem>
                            <SelectItem value="oz">oz</SelectItem>
                            <SelectItem value="lb">lb</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                </div>

                    <div className="space-y-1">
                    <label className="text-sm font-medium">Calories (kcal)</label>
                      <Input
                      type="number"
                      value={mealToEdit?.foodItem.calories}
                      onChange={(e) => {
                        if (mealToEdit) {
                          setMealToEdit({
                            ...mealToEdit,
                            foodItem: {
                              ...mealToEdit.foodItem,
                              calories: parseFloat(e.target.value) || 0
                            }
                          });
                        }
                      }}
                        className="w-full rounded-lg h-10 touch-manipulation"
                    />
                  </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Macronutrients (g)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[hsl(var(--foreground))]">{t?.result?.protein || "Protein"}</label>
                          <Input
                      type="number"
                      value={mealToEdit?.foodItem.protein}
                      onChange={(e) => {
                        if (mealToEdit) {
                          setMealToEdit({
                            ...mealToEdit,
                            foodItem: {
                              ...mealToEdit.foodItem,
                              protein: parseFloat(e.target.value) || 0
                            }
                          });
                        }
                      }}
                            className="w-full rounded-lg h-10 touch-manipulation"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[hsl(var(--foreground))]">{t?.result?.carbs || "Carbs"}</label>
                          <Input
                            type="number"
                            value={mealToEdit?.foodItem.carbs}
                            onChange={(e) => {
                              if (mealToEdit) {
                                setMealToEdit({
                                  ...mealToEdit,
                                  foodItem: {
                                    ...mealToEdit.foodItem,
                                    carbs: parseFloat(e.target.value) || 0
                                  }
                                });
                              }
                            }}
                            className="w-full rounded-lg h-10 touch-manipulation"
                    />
                  </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[hsl(var(--foreground))]">{t?.result?.fat || "Fat"}</label>
                          <Input
                      type="number"
                      value={mealToEdit?.foodItem.fat}
                      onChange={(e) => {
                        if (mealToEdit) {
                          setMealToEdit({
                            ...mealToEdit,
                            foodItem: {
                              ...mealToEdit.foodItem,
                              fat: parseFloat(e.target.value) || 0
                            }
                          });
                        }
                      }}
                            className="w-full rounded-lg h-10 touch-manipulation"
                    />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                    <AlertCircle className="h-4 w-4 text-[hsl(var(--foreground))] flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {t?.mobileNav?.foodDetail?.warningTitle || "การเปลี่ยนแปลงนี้จะมีผลกับรายการนี้เท่านั้น"}
                      </p>
                      <p className="text-xs mt-0.5 text-[hsl(var(--muted-foreground))]">
                        {t?.mobileNav?.foodDetail?.warningDesc || "การแก้ไขนี้ไม่มีผลกับอาหารชนิดนี้ที่เคยบันทึกไว้ หรือต้นแบบของอาหารในรายการส่วนตัว"}
                      </p>
                    </div>
                </div>

                  <Button
                    className="w-full h-12 text-sm rounded-lg"
                    onClick={handleSaveEditedMeal}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t?.mobileNav?.foodDetail?.saveChanges || "บันทึกการเปลี่ยนแปลง"}
                  </Button>
                </div>
              </div>
            </div>
          </BottomSheet>
        )}
      </div>
    </PopupsContext.Provider>
  );
}

// Helper function to get emoji based on food category
function getCategoryEmoji(category: string): JSX.Element {
  switch (category) {
    case 'protein':
      return <span>🥩</span>;
    case 'dairy':
      return <span>🧀</span>;
    case 'fruit':
      return <span>🍎</span>;
    case 'vegetable':
      return <span>🥦</span>;
    case 'grain':
      return <span>🍞</span>;
    case 'beverage':
      return <span>🥤</span>;
    case 'snack':
      return <span>🍿</span>;
    default:
      return <span>🍽️</span>;
  }
}

// Custom Hook สำหรับเรียกใช้ Context
export function usePopups() {
  const context = useContext(PopupsContext);
  if (context === undefined) {
    throw new Error('usePopups must be used within a PopupsProvider');
  }
  return context;
} 