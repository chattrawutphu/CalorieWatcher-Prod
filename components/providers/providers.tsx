"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/components/providers/language-provider";
import { NutritionProvider } from "@/components/providers/nutrition-provider";
import { PopupsProvider } from "@/components/providers/popups-provider";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <LanguageProvider>
        <NutritionProvider>
          <PopupsProvider>{children}</PopupsProvider>
        </NutritionProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}; 