"use client";

import React, { useState, useEffect } from "react";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ChevronLeft, PieChart, Save, Check, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

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

export default function NutritionSettingsPage() {
  const { locale } = useLanguage();
  const { goals, updateGoals } = useNutritionStore();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Simplified translations for this page
  const translations = {
    en: {
      nutritionGoals: "Nutrition Goals",
      dailyCalories: "Daily Calories",
      macroDistribution: "Macro Distribution",
      protein: "Protein",
      fat: "Fat",
      carbs: "Carbohydrates",
      totalMacros: "Total",
      back: "Back",
      save: "Save Changes",
      saved: "Saved!",
      reset: "Reset",
      description: "Adjust your calorie and macronutrient goals",
      macroPercentageWarning: "The sum must be exactly 100%"
    },
    th: {
      nutritionGoals: "เป้าหมายโภชนาการ",
      dailyCalories: "แคลอรี่ต่อวัน",
      macroDistribution: "การกระจายของสารอาหาร",
      protein: "โปรตีน",
      fat: "ไขมัน",
      carbs: "คาร์โบไฮเดรต",
      totalMacros: "รวม",
      back: "กลับ",
      save: "บันทึกการเปลี่ยนแปลง",
      saved: "บันทึกแล้ว!",
      reset: "รีเซ็ต",
      description: "ปรับเป้าหมายแคลอรี่และสารอาหาร",
      macroPercentageWarning: "ผลรวมต้องเท่ากับ 100% พอดี"
    },
    ja: {
      nutritionGoals: "栄養目標",
      dailyCalories: "1日のカロリー",
      macroDistribution: "マクロ分布",
      protein: "タンパク質",
      fat: "脂肪",
      carbs: "炭水化物",
      totalMacros: "合計",
      back: "戻る",
      save: "変更を保存",
      saved: "保存しました！",
      reset: "リセット",
      description: "カロリーと栄養素の目標を調整する",
      macroPercentageWarning: "合計は必ず100%である必要があります"
    },
    zh: {
      nutritionGoals: "营养目标",
      dailyCalories: "每日卡路里",
      macroDistribution: "宏量营养素分布",
      protein: "蛋白质",
      fat: "脂肪",
      carbs: "碳水化合物",
      totalMacros: "总计",
      back: "返回",
      save: "保存更改",
      saved: "已保存！",
      reset: "重置",
      description: "调整您的卡路里和宏量营养素目标",
      macroPercentageWarning: "总和必须恰好为100%"
    }
  };
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  // Local state for the form
  const [dailyCalories, setDailyCalories] = useState(goals.calories);
  const [proteinPercentage, setProteinPercentage] = useState(
    Math.round((goals.protein * 4 / ((goals.protein * 4) + (goals.fat * 9) + (goals.carbs * 4))) * 100) || 30
  );
  const [fatPercentage, setFatPercentage] = useState(
    Math.round((goals.fat * 9 / ((goals.protein * 4) + (goals.fat * 9) + (goals.carbs * 4))) * 100) || 30
  );
  const [carbsPercentage, setCarbsPercentage] = useState(
    Math.round((goals.carbs * 4 / ((goals.protein * 4) + (goals.fat * 9) + (goals.carbs * 4))) * 100) || 40
  );
  const [proteinGrams, setProteinGrams] = useState(goals.protein);
  const [fatGrams, setFatGrams] = useState(goals.fat);
  const [carbsGrams, setCarbsGrams] = useState(goals.carbs);
  
  // State for initial settings and UI state
  const [initialSettings, setInitialSettings] = useState({
    calories: goals.calories,
    protein: goals.protein,
    fat: goals.fat,
    carbs: goals.carbs,
    proteinPercentage,
    fatPercentage,
    carbsPercentage
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Update gram values when percentages change
  useEffect(() => {
    setProteinGrams(Math.round((dailyCalories * proteinPercentage / 100) / 4));
    setFatGrams(Math.round((dailyCalories * fatPercentage / 100) / 9));
    setCarbsGrams(Math.round((dailyCalories * carbsPercentage / 100) / 4));
  }, [dailyCalories, proteinPercentage, fatPercentage, carbsPercentage]);
  
  // Check if total macro percentages equal 100%
  useEffect(() => {
    const totalPercentage = proteinPercentage + fatPercentage + carbsPercentage;
    
    if (totalPercentage !== 100) {
      setValidationMessage(t.macroPercentageWarning);
    } else {
      setValidationMessage(null);
    }
  }, [proteinPercentage, fatPercentage, carbsPercentage, t.macroPercentageWarning]);
  
  // Check for changes
  useEffect(() => {
    const currentSettings = {
      calories: dailyCalories,
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbsGrams,
      proteinPercentage,
      fatPercentage,
      carbsPercentage
    };
    
    const settingsChanged = 
      currentSettings.calories !== initialSettings.calories ||
      currentSettings.protein !== initialSettings.protein ||
      currentSettings.fat !== initialSettings.fat ||
      currentSettings.carbs !== initialSettings.carbs ||
      currentSettings.proteinPercentage !== initialSettings.proteinPercentage ||
      currentSettings.fatPercentage !== initialSettings.fatPercentage ||
      currentSettings.carbsPercentage !== initialSettings.carbsPercentage;
    
    setHasChanges(settingsChanged);
  }, [dailyCalories, proteinGrams, fatGrams, carbsGrams, proteinPercentage, fatPercentage, carbsPercentage, initialSettings]);
  
  // Handlers for changing values
  const handleProteinChange = (value: number) => {
    setProteinPercentage(value);
  };
  
  const handleFatChange = (value: number) => {
    setFatPercentage(value);
  };
  
  const handleCarbsChange = (value: number) => {
    setCarbsPercentage(value);
  };
  
  // Reset settings to initial values
  const resetSettings = () => {
    setDailyCalories(initialSettings.calories);
    setProteinPercentage(initialSettings.proteinPercentage);
    setFatPercentage(initialSettings.fatPercentage);
    setCarbsPercentage(initialSettings.carbsPercentage);
    setProteinGrams(initialSettings.protein);
    setFatGrams(initialSettings.fat);
    setCarbsGrams(initialSettings.carbs);
  };
  
  // Save settings
  const handleSaveChanges = async () => {
    try {
      // Validate total percentage is 100%
      const totalPercentage = proteinPercentage + fatPercentage + carbsPercentage;
      if (totalPercentage !== 100) {
        toast({
          title: "Cannot Save",
          description: t.macroPercentageWarning,
          variant: "destructive",
          duration: 3000
        });
        return;
      }
      
      // Show saving state
      setSaveStatus('saving');
      
      // Prepare data for saving
      const updatedGoals = {
        ...goals,
        calories: dailyCalories,
        protein: proteinGrams,
        fat: fatGrams,
        carbs: carbsGrams
      };
      
      // Save to store
      await updateGoals(updatedGoals);
      
      // Update initial settings
      setInitialSettings({
        calories: dailyCalories,
        protein: proteinGrams,
        fat: fatGrams,
        carbs: carbsGrams,
        proteinPercentage,
        fatPercentage,
        carbsPercentage
      });
      
      // Show success
      setSaveStatus('success');
      setHasChanges(false);
      
      // Show success toast
      toast({
        title: "Saved Successfully",
        duration: 2000
      });
      
      // Reset success state after delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error saving nutrition settings:', error);
      setSaveStatus('error');
      
      // Show error toast
      toast({
        title: "Save Failed",
        variant: "destructive",
        duration: 3000
      });
    }
  };
  
  return (
    <motion.div
      className="max-w-md mx-auto min-h-screen pb-32"
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
          <h1 className="text-xl font-extrabold">{t.nutritionGoals}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
        </div>
      </div>
      
      <motion.div variants={item} className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-green-500" />
              {t.nutritionGoals}
            </CardTitle>
            <CardDescription>
              {t.dailyCalories}: {dailyCalories}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="calories">{t.dailyCalories}</Label>
              <Input
                id="calories"
                type="number"
                value={dailyCalories}
                onChange={(e) => setDailyCalories(Number(e.target.value))}
                min={500}
                max={10000}
                step={50}
                className="text-lg"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>{t.macroDistribution}</Label>
                <Badge 
                  variant={(proteinPercentage + fatPercentage + carbsPercentage) === 100 ? "default" : "destructive"}
                  className="font-normal"
                >
                  {t.totalMacros}: {proteinPercentage + fatPercentage + carbsPercentage}%
                </Badge>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t.protein} ({proteinPercentage}%)</span>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{proteinGrams}g</span>
                  </div>
                  <Slider
                    value={[proteinPercentage]}
                    min={10}
                    max={60}
                    step={1}
                    onValueChange={(values) => handleProteinChange(values[0])}
                    className="my-1"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t.fat} ({fatPercentage}%)</span>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{fatGrams}g</span>
                  </div>
                  <Slider
                    value={[fatPercentage]}
                    min={10}
                    max={60}
                    step={1}
                    onValueChange={(values) => handleFatChange(values[0])}
                    className="my-1"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t.carbs} ({carbsPercentage}%)</span>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{carbsGrams}g</span>
                  </div>
                  <Slider
                    value={[carbsPercentage]}
                    min={10}
                    max={60}
                    step={1}
                    onValueChange={(values) => handleCarbsChange(values[0])}
                    className="my-1"
                  />
                </div>
              </div>
              
              {validationMessage && (
                <div className="text-[hsl(var(--destructive))] text-sm font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                  {validationMessage}
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetSettings}
                  className=""
                  disabled={!hasChanges}
                >
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  {t.reset}
                </Button>
                
                <Button
                  onClick={handleSaveChanges}
                  disabled={validationMessage !== null || saveStatus === 'saving' || !hasChanges}
                  className="flex-1"
                >
                  {saveStatus === 'saving' ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : saveStatus === 'success' ? (
                    <Check className="h-4 w-4 mr-1.5" />
                  ) : (
                    <Save className="h-4 w-4 mr-1.5" />
                  )}
                  <span>{saveStatus === 'success' ? t.saved : t.save}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 