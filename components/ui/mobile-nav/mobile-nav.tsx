"use client";

import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, PieChart, Plus, Settings, BarChart3, X } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";

import { navContainer, navItem } from "./animations";
import { BottomSheet } from "./";

// NavItem interface
interface NavItem {
  icon: React.ReactNode;
  href: string;
  labelKey: keyof typeof aiAssistantTranslations.en.mobileNav.navigation;
}

// Navigation items - ย้ายออกนอก component เพื่อไม่ให้สร้างใหม่ทุกครั้งที่ render
const navItems: NavItem[] = [
  {
    icon: <Home className="h-6 w-6" />,
    href: "/home",
    labelKey: "home",
  },
  {
    icon: <PieChart className="h-6 w-6" />,
    href: "/dashboard",
    labelKey: "dashboard",
  },
  {
    icon: <Plus className="h-8 w-8" />,
    href: "#",
    labelKey: "add",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    href: "/stats",
    labelKey: "history",
  },
  {
    icon: <Settings className="h-6 w-6" />,
    href: "/settings",
    labelKey: "settings",
  },
];

// ลดเวลาของอนิเมชันให้สั้นลงเพื่อการตอบสนองที่เร็วขึ้น
const buttonAnimationConfig = {
  scale: [1, 1.05, 1],
  transition: { duration: 0.2 } // ลดจาก 0.3 เป็น 0.2 เพื่อให้เร็วขึ้น
};

// MobileNav component with performance optimizations
export const MobileNav = memo(function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // Track whether animations should play
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  // Track which button is currently animating
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);
  
  // Track touch state
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);

  // Check animation status when component loads
  useEffect(() => {
    const hasAnimated = sessionStorage.getItem("nav_animated") === "true";
    setShouldAnimate(!hasAnimated);
    if (!hasAnimated) {
      sessionStorage.setItem("nav_animated", "true");
    }
  }, []);

  // Handle touch events
  const handleTouchStart = useCallback((e: React.TouchEvent, href: string) => {
    e.preventDefault();
    setTouchStartTime(Date.now());
    setTouchStartPos({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
    setIsTouching(true);
    setAnimatingButton(href);

    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  // Handle mouse click events
  const handleClick = useCallback((href: string) => {
    if (href === "#") {
      if (isAddOpen) {
        // ปิด sheet ด้วย animation
        const bottomSheet = document.querySelector(".bottom-sheet-container");
        if (bottomSheet) {
          // เพิ่ม class เพื่อให้เกิด animation slide down
          bottomSheet.classList.add("exit-animation");
          // รอให้ animation เล่นจบก่อนปิด sheet
          setTimeout(() => {
            setIsAddOpen(false);
          }, 300);
        } else {
          setIsAddOpen(false);
        }
      } else {
        setIsAddOpen(true);
      }
    } else if (href !== pathname) {
      router.push(href);
    }
  }, [pathname, router, isAddOpen]);

  // Handle mouse down for animation
  const handleMouseDown = useCallback((href: string) => {
    setAnimatingButton(href);
  }, []);

  // Handle mouse up to reset animation
  const handleMouseUp = useCallback(() => {
    setAnimatingButton(null);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent, href: string) => {
    e.preventDefault();
    setIsTouching(false);
    setAnimatingButton(null);

    // Check if touch duration was less than 300ms and movement was minimal
    const touchDuration = Date.now() - touchStartTime;
    const touchEndPos = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };
    const movement = Math.sqrt(
      Math.pow(touchEndPos.x - touchStartPos.x, 2) +
      Math.pow(touchEndPos.y - touchStartPos.y, 2)
    );

    if (touchDuration < 300 && movement < 10) {
      if (href === "#") {
        if (isAddOpen) {
          // ปิด sheet ด้วย animation
          const bottomSheet = document.querySelector(".bottom-sheet-container");
          if (bottomSheet) {
            // เพิ่ม class เพื่อให้เกิด animation slide down
            bottomSheet.classList.add("exit-animation");
            // รอให้ animation เล่นจบก่อนปิด sheet
            setTimeout(() => {
              setIsAddOpen(false);
            }, 300);
          } else {
            setIsAddOpen(false);
          }
        } else {
          setIsAddOpen(true);
        }
      } else if (href !== pathname) {
        router.push(href);
      }
    }
  }, [touchStartTime, touchStartPos, pathname, router, isAddOpen]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (isTouching) {
      const touchPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      const movement = Math.sqrt(
        Math.pow(touchPos.x - touchStartPos.x, 2) +
        Math.pow(touchPos.y - touchStartPos.y, 2)
      );
      // If movement is too large, cancel the touch
      if (movement > 10) {
        setIsTouching(false);
        setAnimatingButton(null);
      }
    }
  }, [isTouching, touchStartPos]);

  // Cache navigation elements
  const navElements = useMemo(() => {
    return navItems.map((item) => {
      const isAddButton = item.href === "#";
      const isActive = item.href !== "#" && pathname.startsWith(item.href);
      
      return (
        <motion.div
          key={item.href}
          className="flex-1 flex items-stretch justify-center"
          variants={navItem}
        >
          {isAddButton ? (
            <div
              onTouchStart={(e) => handleTouchStart(e, item.href)}
              onTouchEnd={(e) => handleTouchEnd(e, item.href)}
              onTouchMove={handleTouchMove}
              onClick={() => handleClick(item.href)}
              onMouseDown={() => handleMouseDown(item.href)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="flex-1 flex flex-col items-center justify-center cursor-pointer py-1 -my-2 max-w-[80px] touch-manipulation"
            >
              <div className="sm:-mt-6 -mt-5">
                <motion.div 
                  animate={
                    isAddOpen 
                      ? { rotate: 135, scale: 1 } 
                      : animatingButton === item.href 
                        ? { scale: 0.95 }
                        : { scale: 1 }
                  }
                  transition={{ duration: 0.1 }}
                  className="flex items-center justify-center sm:h-16 sm:w-16 h-14 w-14 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg ring-4 ring-[hsl(var(--background))]"
                >
                  <Plus className="h-8 w-8" />
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex justify-center">
              <div
                onTouchStart={(e) => handleTouchStart(e, item.href)}
                onTouchEnd={(e) => handleTouchEnd(e, item.href)}
                onTouchMove={handleTouchMove}
                onClick={() => handleClick(item.href)}
                onMouseDown={() => handleMouseDown(item.href)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="flex flex-col items-center w-full h-full px-1 py-3 -my-2 cursor-pointer max-w-[70px] touch-manipulation"
                role="button"
                aria-label={t.mobileNav.navigation[item.labelKey]}
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={
                      animatingButton === item.href 
                        ? { scale: 0.95 }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.1 }}
                    className={cn(
                      "flex items-center justify-center sm:h-12 sm:w-12 h-10 w-10 rounded-full",
                      isActive
                        ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    )}
                  >
                    {item.icon}
                  </motion.div>
                  <span 
                    className={cn(
                      "mt-1 sm:text-xs text-[10px] truncate w-full text-center",
                      isActive
                        ? "text-[hsl(var(--foreground))] font-medium"
                        : "text-[hsl(var(--muted-foreground))]"
                    )}
                  >
                    {t.mobileNav.navigation[item.labelKey]}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      );
    });
  }, [pathname, animatingButton, t, locale, isAddOpen, handleTouchStart, handleTouchEnd, handleTouchMove, handleClick, handleMouseDown, handleMouseUp]);
  
  // ปรับแต่งให้ component นี้มีประสิทธิภาพมากขึ้น
  return (
    <>
      {isAddOpen && (
        <BottomSheet 
          isOpen={isAddOpen} 
          onClose={() => setIsAddOpen(false)} 
          onMealAdded={() => setIsAddOpen(false)}
        />
      )}
      
      <nav className="fixed bottom-0 left-0 z-50 w-full">
        <div className="mx-auto sm:px-6 px-2">
          <motion.div
            variants={navContainer}
            initial={shouldAnimate ? "hidden" : "show"}
            animate="show"
            className="flex pb-6 pt-0 items-center justify-around bg-[hsl(var(--background))] bg-opacity-90 backdrop-blur-md sm:rounded-t-xl rounded-t-lg sm:border border-b-0 border-x-0 sm:border-x sm:border-t border-[hsl(var(--border))] shadow-lg max-w-md mx-auto"
          >
            {navElements}
          </motion.div>
        </div>
      </nav>
    </>
  );
}); 