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
import { ChevronLeft, Weight, Save, Scale } from "lucide-react";
import { useWeightStore } from "@/lib/store/weight-store";

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

export default function WeightSettingsPage() {
  const { locale } = useLanguage();
  const { getWeightGoal, updateWeightGoal } = useWeightStore();
  const [weightGoal, setWeightGoal] = useState<number | undefined>(undefined);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Load current weight goal on component mount
  useEffect(() => {
    const currentGoal = getWeightGoal();
    setWeightGoal(currentGoal);
  }, [getWeightGoal]);
  
  // Check for changes
  useEffect(() => {
    const currentGoal = getWeightGoal();
    setHasChanges(weightGoal !== currentGoal && weightGoal !== undefined);
  }, [weightGoal, getWeightGoal]);
  
  // Simplified translations for this page
  const translations = {
    en: {
      weightSettings: "Weight Goal",
      description: "Set your target weight",
      currentWeight: "Current Weight",
      targetWeight: "Target Weight",
      kgLabel: "kg",
      lbsLabel: "lbs",
      saveChanges: "Save Changes",
      changesSaved: "Weight goal updated successfully",
      back: "Back",
      noGoal: "No goal set",
      setGoal: "Set a weight goal to track your progress",
      weightGoalHint: "Enter your target weight in kilograms"
    },
    th: {
      weightSettings: "เป้าหมายน้ำหนัก",
      description: "ตั้งค่าเป้าหมายน้ำหนักของคุณ",
      currentWeight: "น้ำหนักปัจจุบัน",
      targetWeight: "น้ำหนักเป้าหมาย",
      kgLabel: "กิโลกรัม",
      lbsLabel: "ปอนด์",
      saveChanges: "บันทึกการเปลี่ยนแปลง",
      changesSaved: "อัพเดตเป้าหมายน้ำหนักสำเร็จ",
      back: "กลับ",
      noGoal: "ยังไม่ได้ตั้งเป้าหมาย",
      setGoal: "ตั้งเป้าหมายน้ำหนักเพื่อติดตามความคืบหน้าของคุณ",
      weightGoalHint: "ป้อนน้ำหนักเป้าหมายเป็นกิโลกรัม"
    },
    ja: {
      weightSettings: "体重目標",
      description: "目標体重を設定する",
      currentWeight: "現在の体重",
      targetWeight: "目標体重",
      kgLabel: "kg",
      lbsLabel: "ポンド",
      saveChanges: "変更を保存",
      changesSaved: "体重目標が正常に更新されました",
      back: "戻る",
      noGoal: "目標が設定されていません",
      setGoal: "進捗を追跡するために体重目標を設定してください",
      weightGoalHint: "目標体重をキログラムで入力してください"
    },
    zh: {
      weightSettings: "体重目标",
      description: "设置您的目标体重",
      currentWeight: "当前体重",
      targetWeight: "目标体重",
      kgLabel: "公斤",
      lbsLabel: "磅",
      saveChanges: "保存更改",
      changesSaved: "体重目标更新成功",
      back: "返回",
      noGoal: "未设置目标",
      setGoal: "设置体重目标以跟踪您的进度",
      weightGoalHint: "输入您的目标体重（公斤）"
    }
  };
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  // Handle changes to weight goal input
  const handleWeightGoalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '') {
      setWeightGoal(undefined);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        setWeightGoal(numValue);
      }
    }
  };
  
  // Save changes to weight goal
  const handleSaveChanges = () => {
    if (weightGoal !== undefined) {
      updateWeightGoal(weightGoal);
      toast({
        title: t.changesSaved,
        duration: 3000,
      });
      setHasChanges(false);
    }
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
          <h1 className="text-xl font-extrabold">{t.weightSettings}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
        </div>
      </div>
      
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Scale className="h-4 w-4 text-purple-500" />
              {t.targetWeight}
            </CardTitle>
            <CardDescription>
              {t.weightGoalHint}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="weight-goal">{t.targetWeight}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  id="weight-goal"
                  type="number"
                  min="30"
                  max="200"
                  step="0.1"
                  placeholder="60.0"
                  value={weightGoal !== undefined ? weightGoal : ''}
                  onChange={handleWeightGoalChange}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-20">{t.kgLabel}</span>
              </div>
            </div>
            
            {weightGoal !== undefined && (
              <div className="pt-4">
                <Slider 
                  defaultValue={[weightGoal]} 
                  min={30} 
                  max={150} 
                  step={0.5}
                  value={[weightGoal]}
                  onValueChange={([value]) => setWeightGoal(value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>30 {t.kgLabel}</span>
                  <span>150 {t.kgLabel}</span>
                </div>
              </div>
            )}
            
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