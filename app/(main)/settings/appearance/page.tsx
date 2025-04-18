"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Check, Sun, Moon, Laptop, Palette } from "lucide-react";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function AppearanceSettingsPage() {
  const { locale } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  // Simplified translations for this page
  const translations = {
    en: {
      appearance: "Appearance",
      theme: "Theme",
      back: "Back",
      description: "Change the look and feel of the app",
      system: "System",
      light: "Light",
      dark: "Dark",
      chocolate: "Chocolate",
      sweet: "Sweet",
      broccoli: "Broccoli",
      blueberry: "Blueberry",
      watermelon: "Watermelon",
      honey: "Honey",
      themeChanged: "Theme changed"
    },
    th: {
      appearance: "ธีมและการแสดงผล",
      theme: "ธีม",
      back: "กลับ",
      description: "เปลี่ยนรูปลักษณ์และความรู้สึกของแอป",
      system: "อัตโนมัติ (ตามระบบ)",
      light: "โหมดสว่าง",
      dark: "โหมดมืด",
      chocolate: "ธีมช็อกโกแลต",
      sweet: "ธีมหวาน",
      broccoli: "ธีมบร็อคโคลี่",
      blueberry: "ธีมบลูเบอร์รี่",
      watermelon: "ธีมแตงโม",
      honey: "ธีมน้ำผึ้ง",
      themeChanged: "เปลี่ยนธีมแล้ว"
    },
    ja: {
      appearance: "外観",
      theme: "テーマ",
      back: "戻る",
      description: "アプリの外観と感触を変更する",
      system: "システム",
      light: "ライトモード",
      dark: "ダークモード",
      chocolate: "チョコレート",
      sweet: "スイート",
      broccoli: "ブロッコリー",
      blueberry: "ブルーベリー",
      watermelon: "スイカ",
      honey: "ハニー",
      themeChanged: "テーマが変更されました"
    },
    zh: {
      appearance: "外观",
      theme: "主题",
      back: "返回",
      description: "更改应用的外观和感觉",
      system: "系统",
      light: "亮色",
      dark: "暗色",
      chocolate: "巧克力",
      sweet: "甜味",
      broccoli: "西兰花",
      blueberry: "蓝莓",
      watermelon: "西瓜",
      honey: "蜂蜜",
      themeChanged: "主题已更改"
    }
  };
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  // Define available themes
  const themes = [
    { id: "system", name: t.system, icon: <Laptop className="h-5 w-5" /> },
    { id: "light", name: t.light, icon: <Sun className="h-5 w-5" /> },
    { id: "dark", name: t.dark, icon: <Moon className="h-5 w-5" /> },
    { id: "chocolate", name: t.chocolate, icon: <Palette className="h-5 w-5 text-amber-800" /> },
    { id: "sweet", name: t.sweet, icon: <Palette className="h-5 w-5 text-pink-500" /> },
    { id: "broccoli", name: t.broccoli, icon: <Palette className="h-5 w-5 text-green-600" /> },
    { id: "blueberry", name: t.blueberry, icon: <Palette className="h-5 w-5 text-blue-600" /> },
    { id: "watermelon", name: t.watermelon, icon: <Palette className="h-5 w-5 text-red-500" /> },
    { id: "honey", name: t.honey, icon: <Palette className="h-5 w-5 text-amber-500" /> },
  ];
  
  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: t.themeChanged,
      duration: 2000,
    });
  };
  
  return (
    <motion.div
      className="max-w-md mx-auto min-h-screen pb-20"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold">{t.appearance}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
        </div>
      </div>
      
      <motion.div variants={item} className="space-y-4">
        <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]">
          <div className="p-4 border-b border-[hsl(var(--border))]">
            <h2 className="font-medium">{t.theme}</h2>
          </div>
          
          <div className="divide-y divide-[hsl(var(--border))]">
            {themes.map((themeOption) => (
              <div
                key={themeOption.id}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[hsl(var(--accent))]"
                onClick={() => handleThemeChange(themeOption.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center">
                    {themeOption.icon}
                  </div>
                  <span>{themeOption.name}</span>
                </div>
                
                {theme === themeOption.id && (
                  <Check className="h-5 w-5 text-[hsl(var(--primary))]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 