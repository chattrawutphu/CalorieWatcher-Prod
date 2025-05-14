"use client";

import React from "react";
import { LanguageProvider } from "@/components/providers/language-provider";
import { NutritionProvider } from "@/components/providers/nutrition-provider";
import { PopupsProvider } from "@/components/providers/popups-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <LanguageProvider>
      <NutritionProvider>
        <PopupsProvider>{children}</PopupsProvider>
      </NutritionProvider>
    </LanguageProvider>
  );
}; 