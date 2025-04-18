"use client";

import React, { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

// ลดเวลาในอนิเมชันลงอีกเพื่อให้ UI ตอบสนองเร็วขึ้น
const variants = {
  hidden: { opacity: 0, y: 3 }, // ลดระยะการเคลื่อนไหวจาก 5px เป็น 3px
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.1, // ลดจาก 0.15 เป็น 0.1 ให้เร็วขึ้น
      ease: "easeOut" // เปลี่ยนจาก easeInOut เป็น easeOut เพื่อให้ดูเร็วขึ้น
    } 
  },
  exit: { 
    opacity: 0,
    y: 3, // ลดระยะการเคลื่อนไหวจาก 5px เป็น 3px
    transition: { 
      duration: 0.05, // ลดจาก 0.1 เป็น 0.05 ให้เร็วขึ้น
      ease: "easeIn" // เปลี่ยนจาก easeInOut เป็น easeIn เพื่อให้ดูเร็วขึ้น
    } 
  }
};

interface PageTransitionProps {
  children: React.ReactNode;
}

// ใช้ memo เพื่อป้องกันการ re-render ที่ไม่จำเป็น
export default memo(function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const router = useRouter();
  
  // Désactiver l'animation au premier rendu
  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  // ปรับปรุงการตรวจจับการเปลี่ยนหน้าให้เร็วขึ้น
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // ใช้ requestAnimationFrame แทน setTimeout เพื่อให้ทำงานเร็วขึ้น
    const handleComplete = () => {
      // ยกเลิกสถานะโหลดผ่าน requestAnimationFrame เพื่อให้ตรงกับ frame rate ของอุปกรณ์
      requestAnimationFrame(() => {
        setIsRouteChanging(false);
      });
    };

    // ตั้งค่า isRouteChanging ให้เร็วที่สุด
    setIsRouteChanging(true);
    timeout = setTimeout(handleComplete, 30); // ลดจาก 50ms เป็น 30ms
    
    return () => {
      clearTimeout(timeout);
    };
  }, [pathname]);

  // ปรับการ key ให้มีประสิทธิภาพมากขึ้น
  const pageKey = pathname.split('/')[1] || 'home';
  
  // ไม่ใช้อนิเมชันเลยเมื่อเป็นการเรนเดอร์ครั้งแรก เพื่อให้หน้าแรกโหลดเร็ว
  const shouldUseAnimation = !isFirstRender;
  
  return (
    <>
      {/* ปรับปรุงแถบโหลดให้เร็วขึ้น */}
      <AnimatePresence>
        {isRouteChanging && (
          <motion.div
            initial={{ opacity: 0.8 }} // เริ่มที่ความทึบสูงกว่าเดิม
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }} // ลดเวลาลงจาก default
            className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]"
          >
            <motion.div
              className="h-full bg-[hsl(var(--primary))]"
              initial={{ width: "0%" }}
              animate={{ 
                width: "100%",
                transition: { duration: 0.5, ease: "easeOut" } // ลดจาก 1 วินาที เป็น 0.5 วินาที
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ปรับการเปลี่ยนหน้าให้เร็วขึ้น */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pageKey}
          initial={shouldUseAnimation ? "hidden" : undefined}
          animate={shouldUseAnimation ? "enter" : undefined}
          exit={shouldUseAnimation ? "exit" : undefined}
          variants={variants}
          className="flex-1 w-full"
          style={{ touchAction: "manipulation" }} // เพิ่ม touch-action: manipulation
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}); 