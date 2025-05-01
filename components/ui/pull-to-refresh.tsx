"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useAnimationControls } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { useLanguage } from "@/components/providers/language-provider";
import { usePathname } from "next/navigation";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const translations = {
  en: {
    pullToRefresh: "Pull to refresh",
    releaseToRefresh: "Release to refresh",
    refreshing: "Refreshing..."
  },
  th: {
    pullToRefresh: "ดึงลงเพื่อรีเฟรช",
    releaseToRefresh: "ปล่อยเพื่อรีเฟรช",
    refreshing: "กำลังรีเฟรช..."
  },
  ja: {
    pullToRefresh: "引っ張って更新",
    releaseToRefresh: "離して更新",
    refreshing: "更新中..."
  },
  zh: {
    pullToRefresh: "下拉刷新",
    releaseToRefresh: "释放刷新",
    refreshing: "刷新中..."
  }
};

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const pathname = usePathname();
  
  // Check if current path is dashboard or stats
  const isAllowedPath = pathname.includes("/dashboard") || pathname.includes("/stats");
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [readyToRefresh, setReadyToRefresh] = useState(false);

  // พื้นที่เริ่มต้นที่ต้องดึงก่อนที่จะเริ่มแสดง progress (offset zone)
  const initialOffset = 70;
  // ระยะทางทั้งหมดที่ต้องดึงหลังจากผ่าน offset zone เพื่อให้ refresh
  const pullThreshold = 100;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const scrollY = useRef(0);
  
  // Animation controls
  const pullDistance = useMotionValue(0);
  const progressControl = useAnimationControls();
  
  // แยก transform สำหรับการเลื่อนตำแหน่งและการคำนวณ progress
  // progress จะเริ่มนับหลังจากผ่าน initialOffset
  const actualProgress = useTransform(
    pullDistance, 
    [initialOffset, initialOffset + pullThreshold], 
    [0, 1]
  );
  
  // ไอคอนจะหมุนตาม progress เท่านั้น
  const iconRotate = useTransform(
    actualProgress, 
    [0, 1], 
    [0, 180]
  );
  
  // ความโปร่งใสจะเริ่มแสดงทันทีที่เริ่มดึง แต่จะค่อยๆ ชัดขึ้น
  const indicatorOpacity = useTransform(
    pullDistance,
    [0, initialOffset * 0.5, initialOffset],
    [0, 0.5, 1]
  );
  
  // ขนาดจะค่อยๆ ใหญ่ขึ้นตาม progress
  const indicatorScale = useTransform(
    actualProgress,
    [0, 1],
    [0.9, 1]
  );
  
  // Circle progress values
  const circleRadius = 18;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = useTransform(
    actualProgress,
    [0, 1],
    [circleCircumference, 0]
  );

  // Check if we've pulled far enough and update UI accordingly
  useEffect(() => {
    return actualProgress.onChange(value => {
      if (value >= 1) {
        if (!readyToRefresh && !isRefreshing) {
          setReadyToRefresh(true);
        }
      } else {
        if (readyToRefresh) {
          setReadyToRefresh(false);
        }
      }
    });
  }, [actualProgress, readyToRefresh, isRefreshing]);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    // If not in allowed path, don't activate pull-to-refresh
    if (!isAllowedPath) return;
    
    // Only activate pull if we're at the top of the page
    if (window.scrollY <= 0) {
      touchStartY.current = e.touches[0].clientY;
      scrollY.current = window.scrollY;
    }
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    // If not in allowed path, don't activate pull-to-refresh
    if (!isAllowedPath) return;
    
    if (isRefreshing) return;

    // Check if we're at the top of the page
    if (window.scrollY <= 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY.current;
      
      // Only pull down, not up
      if (diff > 0) {
        // ปรับความต้านทานให้เริ่มต้นน้อยแล้วค่อยๆ เพิ่มขึ้นเมื่อดึงมากขึ้น
        // เริ่มต้นที่ 0.8 (ดึงง่าย) และลดลงช้าๆ
        const resistance = Math.max(0.4, 0.65 - (diff * 0.000375));
        const newPullDistance = diff * resistance;
        
        pullDistance.set(newPullDistance);
        
        // Prevent native scroll behavior only if actually pulling
        if (diff > 10) {
          e.preventDefault();
        }
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = async () => {
    // If not in allowed path, don't activate pull-to-refresh
    if (!isAllowedPath) return;
    
    if (isRefreshing) return;
    
    // If we've pulled far enough, trigger refresh
    if (actualProgress.get() >= 1) {
      setIsRefreshing(true);
      setReadyToRefresh(false);
      
      // Animate to a specific position for the refresh state
      await progressControl.start({ 
        y: initialOffset + 45, // แสดงตัว indicator ในตำแหน่งที่เห็นได้ชัดเจนและต่ำพอที่จะไม่ซ้อนทับกับ dynamic island
        transition: { 
          type: "spring", 
          stiffness: 300,
          damping: 25
        } 
      });
      
      try {
        await onRefresh();
      } finally {
        // Return to initial position with a delay for better UX
        setTimeout(async () => {
          await progressControl.start({ 
            y: 0,
            transition: { 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            } 
          });
          setIsRefreshing(false);
          pullDistance.set(0);
        }, 300);
      }
    } else {
      // If we didn't pull far enough, animate back to initial position
      await progressControl.start({ 
        y: 0,
        transition: { 
          type: "spring", 
          stiffness: 300, 
          damping: 25 
        } 
      });
      pullDistance.set(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator - only display on allowed paths */}
      {isAllowedPath && (
        <motion.div 
          className="fixed left-0 w-full flex justify-center z-50 pointer-events-none"
          style={{ 
            y: isRefreshing ? (initialOffset + 45) : pullDistance, 
            top: -82 // ให้อยู่ต่ำลงเพื่อไม่ซ้อนทับกับ dynamic island
          }}
          animate={progressControl}
          initial={{ y: 0 }}
        >
          <motion.div 
            className="flex flex-col items-center"
            style={{ opacity: indicatorOpacity, scale: indicatorScale }}
          >
            {/* Circle progress */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              {/* Background circle */}
              <svg width="48" height="48" viewBox="0 0 48 48" className="absolute">
                <circle 
                  cx="24" 
                  cy="24" 
                  r={circleRadius} 
                  fill="none" 
                  strokeWidth="2.5" 
                  stroke="hsl(var(--muted))" 
                />
              </svg>
              
              {/* Progress circle */}
              <motion.svg width="48" height="48" viewBox="0 0 48 48" className="absolute">
                <motion.circle 
                  cx="24" 
                  cy="24" 
                  r={circleRadius} 
                  fill="none" 
                  strokeWidth="3" 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                />
              </motion.svg>
              
              {/* Center icon */}
              <motion.div 
                style={{ 
                  rotate: isRefreshing ? 360 * 3 : iconRotate,
                  opacity: useTransform(actualProgress, [0, 0.1], [0.7, 1])
                }}
                animate={isRefreshing ? { rotate: 360 } : undefined}
                transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : undefined}
              >
                {isRefreshing ? (
                  <RefreshCw className="h-6 w-6 text-[hsl(var(--primary))]" />
                ) : (
                  <ArrowDown className="h-6 w-6 text-[hsl(var(--primary))]" />
                )}
              </motion.div>
            </div>
            
            {/* Text label - แสดงตามสถานะจริงของ progress */}
            <motion.div 
              className="text-sm font-medium mt-1 text-[hsl(var(--primary))]"
              style={{ opacity: useTransform(actualProgress, [0, 0.3], [0.7, 1]) }}
            >
              {isRefreshing 
                ? t.refreshing 
                : readyToRefresh 
                  ? t.releaseToRefresh 
                  : t.pullToRefresh}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Main content */}
      <div>
        {children}
      </div>
    </div>
  );
} 