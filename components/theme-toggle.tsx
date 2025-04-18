"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "./providers/language-provider";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const { locale } = useLanguage();
  
  // กำหนดข้อความตามภาษา
  const translations = {
    en: { toggleTheme: "Toggle theme", light: "Light", dark: "Dark" },
    th: { toggleTheme: "สลับธีม", light: "สว่าง", dark: "มืด" },
    ja: { toggleTheme: "テーマを切り替える", light: "ライト", dark: "ダーク" },
    zh: { toggleTheme: "切换主题", light: "明亮", dark: "暗黑" }
  };
  
  const t = translations[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t.toggleTheme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {t.light}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {t.dark}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 