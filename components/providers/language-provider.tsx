"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { updateStoreLocale } from "@/lib/store/nutrition-store";

type Locale = "en" | "th" | "ja" | "zh";

interface LanguageContextType {
  locale: Locale;
  changeLanguage: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    // Default to browser language or English
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Locale;
      if (savedLanguage && ['en', 'th', 'ja', 'zh'].includes(savedLanguage)) {
        return savedLanguage as Locale;
      }
      
      const browserLang = navigator.language.substring(0, 2);
      if (['en', 'th', 'ja', 'zh'].includes(browserLang)) {
        return browserLang as Locale;
      }
    }
    return 'en';
  });
  
  const changeLanguage = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('language', newLocale);
    // อัพเดท locale ใน nutrition store ด้วย
    updateStoreLocale(newLocale);
  }, []);
  
  return (
    <LanguageContext.Provider value={{ locale, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
} 