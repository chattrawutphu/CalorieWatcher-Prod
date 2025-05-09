"use client";

import React, { useState } from "react";
import { useDragControls } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import BottomSheet from "@/components/ui/bottom-sheet";

// Interface for widget items
interface WidgetItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isVisible: boolean;
}

// Interface for layout editor props
interface LayoutEditorProps {
  isOpen: boolean;
  onClose: () => void;
  widgetItems: WidgetItem[];
  onSave: (items: string[], visibility: Record<string, boolean>) => void;
  translations: {
    editLayout: string;
    saveLayout: string;
  };
}

// Sortable widget item component
const SortableWidgetItem = ({
  id,
  item,
  toggleVisibility,
}: {
  id: string;
  item: WidgetItem;
  toggleVisibility: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex justify-between items-center p-2 bg-[hsl(var(--accent))]/10 rounded-lg"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="text-[hsl(var(--muted-foreground))]">
            {item.icon}
          </div>
          <span className="text-sm font-medium">{item.label}</span>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 rounded-full"
        onClick={() => toggleVisibility(id)}
      >
        {item.isVisible ?
          <Eye className="h-4 w-4 text-[hsl(var(--primary))]" /> :
          <EyeOff className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        }
      </Button>
    </div>
  );
};

const LayoutEditor = ({
  isOpen,
  onClose,
  widgetItems,
  onSave,
  translations,
}: LayoutEditorProps) => {
  const dragControls = useDragControls();
  const [items, setItems] = useState<WidgetItem[]>(() => [...widgetItems]);

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for widget reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex(item => item.id === active.id);
        const newIndex = prevItems.findIndex(item => item.id === over.id);
        return arrayMove(prevItems, oldIndex, newIndex);
      });
    }
  };

  // Toggle widget visibility
  const toggleVisibility = (id: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isVisible: !item.isVisible } : item
      )
    );
  };

  // Handle save layout
  const handleSave = () => {
    const itemIds = items.map(item => item.id);
    const visibility = items.reduce((acc, item) => {
      acc[item.id] = item.isVisible;
      return acc;
    }, {} as Record<string, boolean>);
    
    onSave(itemIds, visibility);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={translations.editLayout}
      showDragHandle={true}
      showCloseButton={false}
      height="fullscreen"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 pb-4">
            {items.map((item) => (
              <SortableWidgetItem
                key={item.id}
                id={item.id}
                item={item}
                toggleVisibility={toggleVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <div className="flex justify-end mt-6 mb-20">
        <Button onClick={handleSave} className="h-10 px-6">
          {translations.saveLayout}
        </Button>
      </div>
    </BottomSheet>
  );
};

export default LayoutEditor; 