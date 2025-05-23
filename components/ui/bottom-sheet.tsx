"use client";

import { useState, useEffect, useCallback, memo, useRef, ReactNode } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { useNavigationCleanup } from "@/lib/hooks/use-navigation-cleanup";
import { useDeviceCapabilities } from "@/lib/hooks/use-performance";
import { useHapticFeedback } from "@/lib/utils/haptics";

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
  title?: string;
  children: ReactNode;
  showDragHandle?: boolean;
  height?: "auto" | "full" | "half" | "fullscreen";
  maxHeight?: string;
  showCloseButton?: boolean;
  closeOnNavigation?: boolean;
  preventBodyScroll?: boolean;
  swipeThreshold?: number;
  velocityThreshold?: number;
}

const BottomSheet = memo(function BottomSheet({ 
  isOpen, 
  onClose, 
  title,
  children,
  showDragHandle = true,
  height = "auto",
  maxHeight = "90vh",
  showCloseButton = true,
  closeOnNavigation = true,
  preventBodyScroll = true,
  swipeThreshold = 150,
  velocityThreshold = 500
}: BottomSheetProps) {
  const dragControls = useDragControls();
  const [isVisible, setIsVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const { isLowEnd, isTouchDevice } = useDeviceCapabilities();
  const haptic = useHapticFeedback();
  
  // Navigation cleanup hook
  useNavigationCleanup(isOpen, onClose, {
    closeOnNavigation,
    delay: 100 // เล็กน้อยเพื่อให้ transition สมูท
  });

  // Handle visibility state with improved timing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setDragOffset(0);
      // Haptic feedback เมื่อเปิด bottom sheet
      haptic.light();
    }
  }, [isOpen, haptic]);

  // Enhanced body scroll prevention
  useEffect(() => {
    if (!preventBodyScroll) return;
    
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
  }, [isVisible, preventBodyScroll]);

  // Enhanced close handler with animation
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setDragOffset(0);
    
    // Haptic feedback เมื่อปิด
    haptic.light();
    
    // Delay actual close to allow exit animation
    const timer = setTimeout(() => {
      onClose();
    }, isLowEnd ? 200 : 250);
    
    return () => clearTimeout(timer);
  }, [onClose, isLowEnd, haptic]);

  // Native-like drag gesture handling
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { velocity, offset } = info;
    const shouldClose = 
      velocity.y > velocityThreshold || 
      offset.y > swipeThreshold;
    
    if (shouldClose) {
      // Haptic feedback เมื่อ swipe ปิด
      haptic.medium();
      handleClose();
    } else {
      // Haptic feedback เมื่อ snap back
      haptic.light();
      // Snap back to original position
      setDragOffset(0);
    }
  }, [handleClose, velocityThreshold, swipeThreshold, haptic]);

  // Handle drag with visual feedback
  const handleDrag = useCallback((event: any, info: PanInfo) => {
    const { offset } = info;
    // Only allow dragging down
    if (offset.y > 0) {
      setDragOffset(offset.y);
      
      // Subtle haptic feedback เมื่อเริ่ม drag
      if (offset.y > 20 && offset.y < 25) {
        haptic.selection();
      }
    }
  }, [haptic]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isVisible) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleClose]);

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

  // Enhanced backdrop click handling
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      haptic.light();
      handleClose();
    }
  }, [handleClose, haptic]);

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
            onClick={handleBackdropClick}
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
            className={`fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto flex flex-col bg-[hsl(var(--background))] ${height === 'fullscreen' ? 'rounded-none' : 'rounded-t-3xl'} border-t border-[hsl(var(--border))] shadow-2xl ${getHeightStyle()}`}
            style={{ 
              maxHeight: height === 'fullscreen' ? '100vh' : maxHeight,
              transform: `translateY(${dragOffset}px)`,
              willChange: 'transform',
              // iOS-style safe area handling
              paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag={isTouchDevice ? "y" : false}
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
              onPointerDown={isTouchDevice ? (e) => {
                dragControls.start(e);
                haptic.selection(); // Haptic feedback เมื่อเริ่ม drag
              } : undefined}
              style={{
                cursor: isTouchDevice ? 'grab' : 'default'
              }}
            >
              {showDragHandle && (
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--muted))] transition-colors" />
                </div>
              )}
              
              {title && (
                <div className="py-4 px-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold truncate pr-2">{title}</h2>
                  {showCloseButton && (
                    <motion.button
                      onClick={() => {
                        haptic.light();
                        handleClose();
                      }}
                      className="p-2 rounded-full hover:bg-[hsl(var(--muted))] active:bg-[hsl(var(--muted-foreground/10))] transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  )}
                </div>
              )}
            </div>
            
            {/* Enhanced Content with improved scroll behavior */}
            <div 
              className="flex-1 overflow-y-auto overscroll-none touch-auto" 
              style={{ 
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                // Improve scroll performance on low-end devices
                transform: isLowEnd ? 'translateZ(0)' : undefined
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