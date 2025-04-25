"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Check, Sun, Moon, Laptop } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Animation variants
const container = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const item = {
  hidden: { y: 10, opacity: 1 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export default function AppearanceSettingsPage() {
  const { locale } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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
    { id: "system", name: t.system, icon: <Laptop className="h-4 w-4" /> },
    { id: "light", name: t.light, icon: <Sun className="h-4 w-4" /> },
    { id: "dark", name: t.dark, icon: <Moon className="h-4 w-4" /> },
    { id: "chocolate", name: t.chocolate, icon: <span className="text-lg">🍫</span> },
    { id: "sweet", name: t.sweet, icon: <span className="text-lg">🍬</span> },
    { id: "broccoli", name: t.broccoli, icon: <span className="text-lg">🥦</span> },
    { id: "blueberry", name: t.blueberry, icon: <span className="text-lg">🫐</span> },
    { id: "watermelon", name: t.watermelon, icon: <span className="text-lg">🍉</span> },
    { id: "honey", name: t.honey, icon: <span className="text-lg">🍯</span> },
  ];
  
  // Handle theme change - apply immediately
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {t.theme}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[hsl(var(--border))]">
              {themes.map((themeOption) => (
                <motion.div
                  key={themeOption.id}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    theme === themeOption.id 
                      ? 'bg-[hsl(var(--primary))/0.1]' 
                      : 'hover:bg-[hsl(var(--accent))]'
                  }`}
                  onClick={() => handleThemeChange(themeOption.id)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      theme === themeOption.id 
                        ? 'bg-[hsl(var(--primary))]' 
                        : 'bg-[hsl(var(--secondary))]'
                    }`}>
                      {themeOption.icon}
                    </div>
                    <span className="font-medium text-sm">{themeOption.name}</span>
                  </div>
                  
                  {theme === themeOption.id && (
                    <Check className="h-4 w-4 text-[hsl(var(--primary))]" />
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 