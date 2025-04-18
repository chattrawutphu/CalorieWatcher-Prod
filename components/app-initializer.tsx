"use client";

import React, { useEffect, useState, useMemo, Suspense, memo } from "react";
import { useSession } from "next-auth/react";
import { LoadingSplash } from "@/components/ui/loading-splash";
import { useNutritionStore } from "@/lib/store/nutrition-store";

// Mémoiser l'App Initializer pour éviter des rendus inutiles
const AppInitializer = memo(function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Garder une trace du premier chargement de l'app
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  const { status } = useSession();
  const { setCurrentDate } = useNutritionStore();
  
  // ตั้งค่าวันที่ปัจจุบันทุกครั้งที่เปิดแอพ
  useEffect(() => {
    // กำหนดวันที่ปัจจุบันให้กับ nutrition store
    const todayDate = new Date().toISOString().split('T')[0];
    setCurrentDate(todayDate);
  }, [setCurrentDate]);
  
  // Précharger les ressources essentielles
  useEffect(() => {
    // Fonction pour précharger les images
    const preloadImages = () => {
      const imagesToPreload = [
        '/icons/apple-touch-icon.png',
        '/icons/icon-192x192.png',
        '/images/logo.png'
      ];
      
      imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };
    
    // Fonction pour précharger les icônes
    const preloadIcons = () => {
      const iconsToPreload = [
        '/favicon.svg',
        '/icons/dashboard.svg',
        '/icons/history.svg',
        '/icons/meals.svg',
        '/icons/settings.svg'
      ];
      
      iconsToPreload.forEach(src => {
        fetch(src).catch(() => {}); // Ignorer les erreurs silencieusement
      });
    };
    
    // Exécuter le préchargement seulement si c'est le premier chargement
    if (isFirstLoad) {
      // Précharger avec un délai court pour ne pas bloquer le chargement initial
      setTimeout(() => {
        preloadImages();
        preloadIcons();
      }, 200);
    }
  }, [isFirstLoad]);
  
  useEffect(() => {
    // Vérifier si c'est le premier chargement de l'app dans la dernière heure
    const hasLoadedBefore = sessionStorage.getItem("app_initialized");
    const lastInitTime = localStorage.getItem("last_init_time");
    const now = Date.now();
    
    // เมื่อเข้าสู่ระบบแล้ว ไม่ควรแสดง splash screen นานเกินไป
    const hasAuth = localStorage.getItem("next-auth.session-token") || 
                    localStorage.getItem("__Secure-next-auth.session-token");
                    
    // Réduire l'intervalle à 1 heure au lieu de 24 heures pour une meilleure expérience
    const isRecentSession = lastInitTime && (now - parseInt(lastInitTime)) < 3600000;
    
    if (hasLoadedBefore || isRecentSession || hasAuth) {
      // Si l'app a déjà été chargée dans cette session ou récemment,
      // ou que l'utilisateur a déjà une session sauvegardée,
      // on supprime le splash screen immédiatement
      setIsLoading(false);
      setIsFirstLoad(false);
      
      // ตั้งค่าให้ MobileNav ไม่ต้องแสดงอนิเมชั่น (เพราะไม่ได้แสดง splash screen)
      sessionStorage.setItem("nav_animated", "true");
    } else {
      // Pour les premiers chargements, on attend que la session soit prête
      if (status !== "loading") {
        // Masquer le splash screen dès que la session est chargée
        setIsLoading(false);
        // Marquer que l'app a été initialisée
        sessionStorage.setItem("app_initialized", "true");
        localStorage.setItem("last_init_time", now.toString());
        
        // รีเซ็ตค่า nav_animated เพื่อให้ MobileNav แสดงอนิเมชั่นหลัง splash screen
        sessionStorage.removeItem("nav_animated");
      }
    }
  }, [status]);
  
  // Effet supplémentaire pour gérer les changements d'état de chargement de session
  useEffect(() => {
    if (status !== "loading" && !isFirstLoad) {
      setIsLoading(false);
    }
    // ถ้า status เปลี่ยนแปลงเป็น authenticated แล้วยังแสดง loading อยู่ ให้ปิด loading ทันที
    if (status === "authenticated" && isLoading) {
      setIsLoading(false);
    }
  }, [status, isFirstLoad, isLoading]);

  // จัดการอนิเมชั่นเมื่อปิด splash screen
  const handleSplashExitComplete = () => {
    // ไม่ต้องทำอะไรเพิ่มเติม เพราะค่า nav_animated จะถูกตั้งโดย MobileNav component เอง
  };
  
  // Optimisation: n'afficher que ce qui est nécessaire en fonction de l'état
  return (
    <>
      {isLoading ? (
        <LoadingSplash show={true} onExitComplete={handleSplashExitComplete} />
      ) : (
        <>{children}</>
      )}
    </>
  );
});

// Export avec type correct
export { AppInitializer }; 