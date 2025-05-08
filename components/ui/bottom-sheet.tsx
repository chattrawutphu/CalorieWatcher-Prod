"use client";

import { useState, useEffect, useCallback, memo, useRef, ReactNode } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X } from "lucide-react";

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
  title?: string;
  children: ReactNode;
  showDragHandle?: boolean;
  height?: "auto" | "full" | "half" | "fullscreen";
  maxHeight?: string;
  showCloseButton?: boolean;
}

const BottomSheet = memo(function BottomSheet({ 
  isOpen, 
  onClose, 
  title,
  children,
  showDragHandle = true,
  height = "auto",
  maxHeight = "90vh",
  showCloseButton = true
}: BottomSheetProps) {
  const dragControls = useDragControls();
  const [isVisible, setIsVisible] = useState(false);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  // Handle visibility state
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      onClose();
    }, 300);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Add drag gesture handling with snap back
  const handleDragEnd = useCallback((event: any, info: any) => {
    const shouldClose = info.velocity.y > 300 || info.offset.y > 200;
    if (shouldClose) {
      handleClose();
    }
  }, [handleClose]);

  const getHeightStyle = () => {
    switch (height) {
      case "fullscreen":
        return "min-h-screen inset-0 rounded-none";
      case "full":
        return "h-full";
      case "half":
        return "h-1/2";
      case "auto":
      default:
        return "max-h-[90vh]";
    }
  };

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
            className={`fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto flex flex-col bg-[hsl(var(--background))] ${height === 'fullscreen' ? 'rounded-none' : 'rounded-t-2xl'} border-t border-[hsl(var(--border))] shadow-xl ${getHeightStyle()}`}
            style={{ maxHeight: height === 'fullscreen' ? '100vh' : maxHeight }}
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
              {showDragHandle && (
                <div className="flex justify-center py-2">
                  <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--muted))]" />
                </div>
              )}
              
              {title && (
                <div className="py-4 px-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{title}</h2>
                  {showCloseButton && (
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-full hover:bg-[hsl(var(--muted))]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
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
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default BottomSheet; 