"use client";

import React, { useEffect, useState, memo, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

// ปรับการเคลื่อนไหวให้นุ่มนวลขึ้น เน้นที่ opacity fade in/out
const variants = {
  hidden: { opacity: 0 },
  enter: { 
    opacity: 1,
    transition: { 
      duration: 0.15, // เพิ่มขึ้นเล็กน้อย
      ease: [0.33, 1, 0.68, 1] // cubic-bezier ที่นุ่มนวลกว่า
    } 
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.12, // เพิ่มขึ้นเล็กน้อย
      ease: [0.32, 0, 0.67, 0] // cubic-bezier ที่นุ่มนวลกว่า
    } 
  }
};

interface PageTransitionProps {
  children: React.ReactNode;
}

// สร้าง Map เพื่อเก็บ cache ของแต่ละหน้า
const pageCache = new Map();

// ใช้ memo เพื่อป้องกันการ re-render ที่ไม่จำเป็น
export default memo(function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // อ้างอิงถึงหน้าก่อนหน้า เพื่อเก็บ state เมื่อ navigate กลับมา
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  
  // แยก key ตาม URL segment
  const pageKey = pathname.split('/')[1] || 'home';
  
  // เก็บ cache ของแต่ละหน้า
  useEffect(() => {
    // เราจะเก็บเฉพาะหน้าที่ไม่ใช่หน้าปัจจุบัน
    if (previousPath && previousPath !== pathname) {
      pageCache.set(previousPath, children);
    }
    
    // อัปเดท previousPath เมื่อมีการเปลี่ยนหน้า
    setPreviousPath(pathname);
    
    // จำกัดขนาดของ cache ไม่ให้ใหญ่เกินไป (เก็บแค่ 5 หน้าล่าสุด)
    if (pageCache.size > 5) {
      const oldestKey = pageCache.keys().next().value;
      pageCache.delete(oldestKey);
    }
  }, [pathname, children, previousPath]);
  
  // Désactiver l'animation au premier rendu
  useEffect(() => {
    // ใช้ requestAnimationFrame เพื่อไม่ให้เกิด reflow
    requestAnimationFrame(() => {
      setIsFirstRender(false);
    });
  }, []);

  // เพิ่ม effect เพื่อจัดการกับการเปลี่ยนหน้า
  useEffect(() => {
    setIsTransitioning(true);
    
    // ตั้งเวลาเพื่อปิด transitioning state
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // ให้เวลามากกว่า animation duration เล็กน้อย
    
    return () => clearTimeout(timer);
  }, [pathname]);
  
  // ไม่ใช้อนิเมชันเลยเมื่อเป็นการเรนเดอร์ครั้งแรก เพื่อให้หน้าแรกโหลดเร็ว
  const shouldUseAnimation = !isFirstRender;

  // สร้าง cached version ของหน้าเพจต่างๆ
  const cachedPages = useMemo(() => {
    const pages = new Map(pageCache);
    // เพิ่มหน้าปัจจุบันเข้าไปใน cache
    pages.set(pathname, children);
    return pages;
  }, [pathname, children]);

  // Function สำหรับเรนเดอร์หน้าที่ cache ไว้
  const renderCachedPages = useCallback(() => {
    return Array.from(cachedPages.entries()).map(([path, content]) => {
      const key = path.split('/')[1] || 'home';
      const isCurrentPage = path === pathname;
      
      // แสดงเฉพาะหน้าปัจจุบันและหน้าก่อนหน้า (ซึ่งอาจจะถูกเรียกดูในอนาคต)
      if (!isCurrentPage && path !== previousPath) return null;
      
      return (
        <motion.div
          key={key}
          initial={shouldUseAnimation && isCurrentPage ? "hidden" : undefined}
          animate={shouldUseAnimation && isCurrentPage ? "enter" : undefined}
          exit={shouldUseAnimation ? "exit" : undefined}
          variants={variants}
          className={`flex-1 w-full page-transition ${isTransitioning ? 'pageTransitioning' : ''}`}
          style={{ 
            touchAction: "manipulation",
            willChange: "opacity", // บอก browser ให้เตรียมพร้อมสำหรับ animation
            display: isCurrentPage ? 'block' : 'none' // ซ่อนหน้าที่ไม่ได้แสดงอยู่
          }}
          data-animate="true"
          data-pathname={path}
        >
          <div className="page-content">
            {content}
          </div>
        </motion.div>
      );
    });
  }, [cachedPages, pathname, previousPath, shouldUseAnimation, isTransitioning]);
  
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {renderCachedPages()}
    </AnimatePresence>
  );
}); 