"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// กำหนด type เองแทนการ import
type Attribute = 'class' | 'data-theme' | 'data-mode';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: Attribute | Attribute[];
  defaultTheme?: string;
  enableSystem?: boolean;
  storageKey?: string;
  forcedTheme?: string;
  disableTransitionOnChange?: boolean;
  themes?: string[];
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      themes={["light", "dark", "chocolate", "sweet", "broccoli", "watermelon", "honey", "blueberry"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
} 