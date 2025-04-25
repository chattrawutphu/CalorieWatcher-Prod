"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Droplet, Save } from "lucide-react";
import { useWaterStore } from "@/lib/store/water-store";

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

export default function WaterSettingsPage() {
  const { locale } = useLanguage();
  const { getWaterGoal, updateWaterGoal } = useWaterStore();
  const [waterGoal, setWaterGoal] = useState<number>(2000);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Load current water goal on component mount
  useEffect(() => {
    const currentGoal = getWaterGoal();
    setWaterGoal(currentGoal || 2000);
  }, [getWaterGoal]);
  
  // Check for changes
  useEffect(() => {
    const currentGoal = getWaterGoal();
    setHasChanges(waterGoal !== currentGoal);
  }, [waterGoal, getWaterGoal]);
  
  // Simplified translations for this page
  const translations = {
    en: {
      waterSettings: "Water Intake",
      description: "Set your daily water intake goal",
      waterGoal: "Daily Water Goal",
      mlLabel: "ml",
      litersLabel: "liters",
      saveChanges: "Save Changes",
      changesSaved: "Water goal updated successfully",
      back: "Back",
      waterGoalHint: "Recommended: 2000-3000 ml per day",
      glassSize: "Glass Size",
      glasses: "glasses",
      glassHint: "Standard glass is about 250ml"
    },
    th: {
      waterSettings: "การดื่มน้ำ",
      description: "ตั้งค่าเป้าหมายการดื่มน้ำประจำวัน",
      waterGoal: "เป้าหมายการดื่มน้ำต่อวัน",
      mlLabel: "มล.",
      litersLabel: "ลิตร",
      saveChanges: "บันทึกการเปลี่ยนแปลง",
      changesSaved: "อัพเดตเป้าหมายการดื่มน้ำสำเร็จ",
      back: "กลับ",
      waterGoalHint: "แนะนำ: 2000-3000 มล. ต่อวัน",
      glassSize: "ขนาดแก้ว",
      glasses: "แก้ว",
      glassHint: "แก้วมาตรฐานประมาณ 250 มล."
    },
    ja: {
      waterSettings: "水分摂取",
      description: "1日の水分摂取目標を設定する",
      waterGoal: "1日の水分目標",
      mlLabel: "ml",
      litersLabel: "リットル",
      saveChanges: "変更を保存",
      changesSaved: "水分目標が正常に更新されました",
      back: "戻る",
      waterGoalHint: "おすすめ：1日2000-3000ml",
      glassSize: "グラスサイズ",
      glasses: "杯",
      glassHint: "標準グラスは約250ml"
    },
    zh: {
      waterSettings: "饮水量",
      description: "设置您的每日饮水目标",
      waterGoal: "每日饮水目标",
      mlLabel: "毫升",
      litersLabel: "升",
      saveChanges: "保存更改",
      changesSaved: "饮水目标更新成功",
      back: "返回",
      waterGoalHint: "建议：每日2000-3000毫升",
      glassSize: "杯子大小",
      glasses: "杯",
      glassHint: "标准杯约250毫升"
    }
  };
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  // Handle changes to water goal input
  const handleWaterGoalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '') {
      setWaterGoal(0);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setWaterGoal(numValue);
      }
    }
  };
  
  // Save changes to water goal
  const handleSaveChanges = () => {
    if (waterGoal >= 0) {
      updateWaterGoal(waterGoal);
      toast({
        title: t.changesSaved,
        duration: 3000,
      });
      setHasChanges(false);
    }
  };
  
  // Calculate glasses based on a standard 250ml glass
  const getGlassCount = () => {
    return Math.round(waterGoal / 250);
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
          <h1 className="text-xl font-extrabold">{t.waterSettings}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
        </div>
      </div>
      
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Droplet className="h-4 w-4 text-cyan-500" />
              {t.waterGoal}
            </CardTitle>
            <CardDescription>
              {t.waterGoalHint}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="water-goal">{t.waterGoal}</Label>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {(waterGoal / 1000).toFixed(1)} {t.litersLabel}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  id="water-goal"
                  type="number"
                  min="0"
                  max="5000"
                  step="50"
                  value={waterGoal}
                  onChange={handleWaterGoalChange}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-20">{t.mlLabel}</span>
              </div>
            </div>
            
            <div className="pt-4">
              <Slider 
                defaultValue={[waterGoal]} 
                min={500} 
                max={5000} 
                step={50}
                value={[waterGoal]}
                onValueChange={([value]) => setWaterGoal(value)}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>500 {t.mlLabel}</span>
                <span>5000 {t.mlLabel}</span>
              </div>
            </div>
            
            <div className="bg-[hsl(var(--accent))] p-3 rounded-lg mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t.glassSize}: 250 {t.mlLabel}</span>
                <span className="font-medium">{getGlassCount()} {t.glasses}</span>
              </div>
              <div className="flex mt-2">
                {Array.from({ length: Math.min(getGlassCount(), 20) }).map((_, i) => (
                  <div 
                    key={i} 
                    className="h-6 w-3 bg-cyan-500 rounded-sm mx-0.5"
                    style={{ 
                      opacity: i < 8 ? 1 : i < 12 ? 0.8 : 0.6,
                      height: `${Math.min(24, 18 + Math.random() * 6)}px`
                    }}
                  />
                ))}
                {getGlassCount() > 20 && (
                  <div className="text-xs ml-1 flex items-center">+{getGlassCount() - 20}</div>
                )}
              </div>
            </div>
            
            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              className="w-full mt-6"
            >
              <Save className="h-4 w-4 mr-2" />
              {t.saveChanges}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 