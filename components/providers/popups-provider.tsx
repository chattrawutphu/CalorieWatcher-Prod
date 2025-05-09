"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import CalendarPopup from '@/components/ui/calendar-popup';
import BottomSheet from '@/components/ui/bottom-sheet';
import LayoutEditor from '@/components/ui/layout-editor';

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
          showCloseButton={false}
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
            showCloseButton={false}
            height="fullscreen"
          >
            <div className="max-w-md mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Food Name</label>
                  <input
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
                    className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <div className="flex items-center space-x-2">
                    <button
                      className="h-8 w-8 rounded-full flex items-center justify-center border border-[hsl(var(--border))]"
                      onClick={() => setEditedQuantity(prev => Math.max(0.5, prev - 0.5))}
                    >
                      -
                    </button>

                    <div className="flex-1 px-3 py-1.5 border rounded-md text-center bg-[hsl(var(--background))] text-sm">
                      {editedQuantity} {mealToEdit?.foodItem.servingSize}
                    </div>

                    <button
                      className="h-8 w-8 rounded-full flex items-center justify-center border border-[hsl(var(--border))]"
                      onClick={() => setEditedQuantity(prev => prev + 0.5)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Serving Size</label>
                  <input
                    type="text"
                    value={mealToEdit?.foodItem.servingSize}
                    onChange={(e) => {
                      if (mealToEdit) {
                        setMealToEdit({
                          ...mealToEdit,
                          foodItem: {
                            ...mealToEdit.foodItem,
                            servingSize: e.target.value
                          }
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Calories (kcal)</label>
                    <input
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
                      className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Protein (g)</label>
                    <input
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
                      className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fat (g)</label>
                    <input
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
                      className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Carbs (g)</label>
                    <input
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
                      className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-transparent"
                    />
                  </div>
                </div>

                <div className="text-right text-sm text-[hsl(var(--primary))]">
                  Total Calories: {Math.round(mealToEdit?.foodItem.calories * editedQuantity)} kcal
                </div>

                <div className="flex justify-end mt-6 pb-20">
                  <button
                    onClick={handleSaveEditedMeal}
                    className="bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </BottomSheet>
        )}
      </div>
    </PopupsContext.Provider>
  );
}

// Custom Hook สำหรับเรียกใช้ Context
export function usePopups() {
  const context = useContext(PopupsContext);
  if (context === undefined) {
    throw new Error('usePopups must be used within a PopupsProvider');
  }
  return context;
} 