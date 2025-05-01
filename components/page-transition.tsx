"use client";

import React, { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

// ลดการเคลื่อนไหวให้น้อยลงและเร็วขึ้นอีก เน้นที่ opacity มากกว่า
const variants = {
  hidden: { opacity: 0 }, // ตัด y เพื่อลดการคำนวณ transform
  enter: { 
    opacity: 1,
    transition: { 
      duration: 0.08, // ลดลงอีกจาก 0.1
      ease: "easeOut"
    } 
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.04, // ลดลงอีกจาก 0.05
      ease: "easeIn"
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
  
  // Désactiver l'animation au premier rendu
  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  // ปรับปรุงการตรวจจับการเปลี่ยนหน้าให้เร็วขึ้น
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // ยกเลิกสถานะโหลดเร็วขึ้น
    const handleComplete = () => {
      setIsRouteChanging(false);
    };

    // ตั้งค่า isRouteChanging ให้เร็วที่สุด
    setIsRouteChanging(true);
    timeout = setTimeout(handleComplete, 20); // ลดลงจาก 30ms
    
    return () => {
      clearTimeout(timeout);
    };
  }, [pathname]);

  // ปรับการ key ให้มีประสิทธิภาพมากขึ้น - ใช้ path แรกเท่านั้น
  const pageKey = pathname.split('/')[1] || 'home';
  
  // ไม่ใช้อนิเมชันเลยเมื่อเป็นการเรนเดอร์ครั้งแรก เพื่อให้หน้าแรกโหลดเร็ว
  const shouldUseAnimation = !isFirstRender;
  
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={pageKey}
          initial={shouldUseAnimation ? "hidden" : undefined}
          animate={shouldUseAnimation ? "enter" : undefined}
          exit={shouldUseAnimation ? "exit" : undefined}
          variants={variants}
          className="flex-1 w-full"
          style={{ touchAction: "manipulation" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}); 