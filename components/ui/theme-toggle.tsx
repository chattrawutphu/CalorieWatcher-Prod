"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import { 
  CandyCane, Cookie, SunIcon, Candy, Leaf, Heart, MoonIcon, 
  ComputerIcon, Check, SunMoon, Disc, Droplet 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useLanguage } from "../providers/language-provider";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { locale } = useLanguage();
  
  // Translations for theme options
  const translations = {
    en: { 
      light: "Light", 
      dark: "Dark", 
      system: "Auto (System)", 
      toggleTheme: "Toggle theme", 
      chocolate: "Chocolate", 
      sweet: "Sweet", 
      broccoli: "Broccoli", 
      blueberry: "Blueberry", 
      watermelon: "Watermelon", 
      honey: "Honey" 
    },
    th: { 
      light: "โหมดสว่าง", 
      dark: "โหมดมืด", 
      system: "อัตโนมัติ (ตามระบบ)", 
      toggleTheme: "สลับธีม", 
      chocolate: "ธีมช็อกโกแลต", 
      sweet: "ธีมหวาน", 
      broccoli: "ธีมบร็อคโคลี่", 
      blueberry: "ธีมบลูเบอร์รี่", 
      watermelon: "ธีมแตงโม", 
      honey: "ธีมน้ำผึ้ง" 
    },
    ja: { 
      light: "ライト", 
      dark: "ダーク", 
      system: "自動 (システム)", 
      toggleTheme: "テーマを切り替える", 
      chocolate: "チョコレート", 
      sweet: "スイート", 
      broccoli: "ブロッコリー", 
      blueberry: "ブルーベリー", 
      watermelon: "スイカ", 
      honey: "ハニー" 
    },
    zh: { 
      light: "明亮", 
      dark: "暗黑", 
      system: "自动 (系统)", 
      toggleTheme: "切换主题", 
      chocolate: "巧克力", 
      sweet: "甜蜜", 
      broccoli: "西兰花", 
      blueberry: "蓝莓", 
      watermelon: "西瓜", 
      honey: "蜂蜜" 
    }
  };
  
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-90 sweet:scale-0 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-90 blueberry:scale-0 watermelon:rotate-90 watermelon:scale-0 honey:rotate-90 honey:scale-0 light:rotate-0 light:scale-100 system:rotate-90 system:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-90 sweet:scale-0 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-90 blueberry:scale-0 watermelon:rotate-90 watermelon:scale-0 honey:rotate-90 honey:scale-0 light:rotate-90 light:scale-0 system:rotate-90 system:scale-0" />
          <Cookie className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-0 chocolate:scale-100 sweet:rotate-90 sweet:scale-0 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-90 blueberry:scale-0 watermelon:rotate-90 watermelon:scale-0 honey:rotate-90 honey:scale-0 light:rotate-90 light:scale-0 system:rotate-90 system:scale-0" />
          <Candy className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-0 sweet:scale-100 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-90 blueberry:scale-0 watermelon:rotate-90 watermelon:scale-0 honey:rotate-90 honey:scale-0 light:rotate-90 light:scale-0 system:rotate-90 system:scale-0" />
          <Leaf className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-90 sweet:scale-0 broccoli:rotate-0 broccoli:scale-100 blueberry:rotate-90 blueberry:scale-0 watermelon:rotate-90 watermelon:scale-0 honey:rotate-90 honey:scale-0 light:rotate-90 light:scale-0 system:rotate-90 system:scale-0" />
          <Heart className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-90 sweet:scale-0 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-0 blueberry:scale-100 watermelon:rotate-90 watermelon:scale-0 honey:rotate-90 honey:scale-0 light:rotate-90 light:scale-0 system:rotate-90 system:scale-0" />
          <Disc className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-90 sweet:scale-0 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-90 blueberry:scale-0 watermelon:rotate-0 watermelon:scale-100 honey:rotate-90 honey:scale-0 light:rotate-90 light:scale-0 system:rotate-90 system:scale-0" />
          <Droplet className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-90 sweet:scale-0 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-90 blueberry:scale-0 watermelon:rotate-90 watermelon:scale-0 honey:rotate-0 honey:scale-100 light:rotate-90 light:scale-0 system:rotate-90 system:scale-0" />
          <ComputerIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all system:rotate-0 system:scale-100" />
          {theme === 'system' && resolvedTheme === 'dark' && (
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 opacity-50" />
          )}
          {theme === 'system' && resolvedTheme === 'light' && (
            <SunIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 opacity-50" />
          )}
          <span className="sr-only">{t.toggleTheme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <ComputerIcon className="h-4 w-4 mr-2" />
            {t.system}
          </div>
          {theme === "system" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <SunIcon className="h-4 w-4 mr-2" />
            {t.light}
          </div>
          {theme === "light" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <MoonIcon className="h-4 w-4 mr-2" />
            {t.dark}
          </div>
          {theme === "dark" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("chocolate")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Cookie className="h-4 w-4 mr-2" />
            {t.chocolate}
          </div>
          {theme === "chocolate" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("sweet")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Candy className="h-4 w-4 mr-2" />
            {t.sweet}
          </div>
          {theme === "sweet" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("broccoli")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Leaf className="h-4 w-4 mr-2" />
            {t.broccoli}
          </div>
          {theme === "broccoli" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("blueberry")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            {t.blueberry}
          </div>
          {theme === "blueberry" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("watermelon")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Disc className="h-4 w-4 mr-2" />
            {t.watermelon}
          </div>
          {theme === "watermelon" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("honey")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Droplet className="h-4 w-4 mr-2" />
            {t.honey}
          </div>
          {theme === "honey" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 