"use client";

import React, { useEffect, useState, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";

interface LoadingSplashProps {
  /**
   * Whether to show the loading screen
   */
  show: boolean;
  
  /**
   * Callback when the exit animation is complete
   */
  onExitComplete?: () => void;
}

// Mémorisation du composant pour éviter les re-rendus inutiles
export const LoadingSplash = memo(function LoadingSplash({
  show = true,
  onExitComplete,
}: LoadingSplashProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const { locale } = useLanguage();
  
  // Texte de chargement simplifié et mémorisé
  const loadingText = useMemo(() => ({
    en: "Loading",
    th: "กำลังโหลด",
    ja: "読み込み中",
    zh: "加载中",
  }[locale] || "Loading"), [locale]);
  
  // Un seul message pour éviter les transitions
  const message = useMemo(() => ({
    en: "Getting things ready...",
    th: "กำลังเตรียมทุกอย่าง...",
    ja: "準備しています...",
    zh: "正在准备一切...",
  }[locale] || "Getting things ready..."), [locale]);
  
  // Gérer l'affichage/masquage du splash screen en temps réel
  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      // Permettre à l'animation de sortie de se jouer avant de supprimer le composant du DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
        onExitComplete?.();
      }, 250); // Juste le temps nécessaire pour l'animation de sortie
      
      return () => clearTimeout(timer);
    }
  }, [show, onExitComplete]);
  
  // Early return si rien à afficher
  if (!shouldRender) return null;
  
  // Animations simplifiées pour un chargement plus rapide
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[hsl(var(--background))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Logo principal avec animation simplifiée */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {/* Conteneur du logo simplifié */}
        <div className="relative">
          {/* Icône principale de l'application */}
          <div className="relative z-10 sm:w-24 sm:h-24 w-16 h-16 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] shadow-md overflow-hidden">
            {/* Logo simplifié */}
            <svg viewBox="0 0 24 24" fill="none" className="sm:w-12 sm:h-12 w-10 h-10">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="9" cy="9" r="1" fill="currentColor" />
              <circle cx="15" cy="9" r="1" fill="currentColor" />
            </svg>
          </div>
        </div>
        
        {/* Un seul emoji au lieu de trois */}
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] flex items-center justify-center shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          🍎
        </motion.div>
      </motion.div>
      
      {/* Texte de chargement simplifié */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h2 className="text-2xl font-bold mb-1">{loadingText}</h2>
        <p className="text-[hsl(var(--muted-foreground))]">{message}</p>
      </motion.div>
      
      {/* Indicateur de chargement simplifié */}
      <motion.div
        className="mt-8 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.1 }}
      >
        <div className="flex space-x-3">
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))]"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
          />
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))]"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: 0.2,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
          />
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))]"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: 0.4,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}); 