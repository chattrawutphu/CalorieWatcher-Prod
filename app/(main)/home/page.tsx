"use client";

import React, { useState } from "react";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, UtensilsCrossed, AppleIcon, Coffee, ArrowRight, Plus, PieChart, Sun, Moon, Cookie, Candy, Lock, Coins, Crown, Check, Sparkles, User, ArrowDown, Star, ChevronUp, ChevronDown, LucideHeart, Droplet } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/providers/language-provider";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { homeTranslations, formatTranslation } from "@/app/locales/home";

// Define the type for translations to fix TypeScript errors
type TranslationType = typeof homeTranslations.en;

// Spring animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const ThemeCard = ({ 
  icon, 
  name, 
  description, 
  price, 
  isOwned,
  onClick,
  disabled
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  price?: number;
  isOwned: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <motion.div variants={item}>
    <Card className="overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--accent))/0.1] flex items-center justify-center text-[hsl(var(--foreground))]">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
            </div>
          </div>
        </div>
        <Button
          onClick={onClick}
          disabled={disabled}
          variant={isOwned ? "outline" : "default"}
          className="w-full"
        >
          {price ? (
            isOwned ? (
              <span>Owned</span>
            ) : (
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span>{price}</span>
              </div>
            )
          ) : (
            <span>Free</span>
          )}
        </Button>
      </div>
    </Card>
  </motion.div>
);

// Add a helper function to get the goal name based on the selected goal
const getGoalName = (goal: 'muscleGain' | 'fatLoss' | 'both', t: TranslationType) => {
  switch(goal) {
    case 'muscleGain':
      return t.apps.tddCalculator.muscleGain;
    case 'fatLoss':
      return t.apps.tddCalculator.fatLoss;
    case 'both':
    default:
      return t.apps.tddCalculator.both;
  }
};

export default function ShopPage() {
  const { locale } = useLanguage();
  const t = homeTranslations[locale as keyof typeof homeTranslations] || homeTranslations.en;
  const { theme, setTheme } = useTheme();
  const [subscriptionStatus, setSubscriptionStatus] = useState<"basic" | "pro">("basic");
  const [showProAnimation, setShowProAnimation] = useState(false);
  
  const { goals, updateGoals } = useNutritionStore();
  
  // TDD Calculator states
  const [showTddCalculator, setShowTddCalculator] = useState(false);
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive' | 'extremelyActive'>('moderatelyActive');
  const [tddResult, setTddResult] = useState<number | null>(null);
  const [waterIntakeResult, setWaterIntakeResult] = useState<number | null>(null);
  const [showTddResults, setShowTddResults] = useState(false);
  const [settingsUpdated, setSettingsUpdated] = useState(false);
  
  // Add state for macro ratio adjustments
  const [proteinPercentage, setProteinPercentage] = useState(30);
  const [fatPercentage, setFatPercentage] = useState(30);
  const [carbsPercentage, setCarbsPercentage] = useState(40);

  // Add fitness goal state
  const [fitnessGoal, setFitnessGoal] = useState<'muscleGain' | 'fatLoss' | 'both'>('both');

  // สร้างฟังก์ชันเพื่อดึงข้อมูลสีของธีมปัจจุบัน
  const getCurrentThemeColors = () => {
    const currentTheme = themes.find(t => t.name === theme) || themes[0];
    return currentTheme.colors;
  };

  const themes = [
    {
      name: "light",
      displayName: t.themes.light,
      icon: <Sun className="h-5 w-5" />,
      price: 0,
      colors: {
        bg: "#FFFFFF",
        text: "#020617",
        primary: "#3B82F6",
        muted: "#64748b",
        accent: "#818CF8"
      }
    },
    {
      name: "dark",
      displayName: t.themes.dark,
      icon: <Moon className="h-5 w-5" />,
      price: 0,
      colors: {
        bg: "#020617",
        text: "#FFFFFF",
        primary: "#3B82F6",
        muted: "#94a3b8",
        accent: "#818CF8"
      }
    },
    {
      name: "chocolate",
      displayName: t.themes.chocolate,
      icon: <Cookie className="h-5 w-5" />,
      price: "pro",
      colors: {
        bg: "#211513",
        text: "#e8d9cf",
        primary: "#854d30",
        muted: "#8c7b6e",
        accent: "#C2410C"
      }
    },
    {
      name: "sweet",
      displayName: t.themes.sweet,
      icon: <Candy className="h-5 w-5" />,
      price: "pro",
      colors: {
        bg: "#fdf2f8",
        text: "#831843",
        primary: "#ec4899",
        muted: "#9d174d",
        accent: "#F472B6"
      }
    },
    {
      name: "broccoli",
      displayName: t.themes.broccoli,
      icon: <AppleIcon className="h-5 w-5" />,
      price: "pro",
      colors: {
        bg: "#f0fdf4",
        text: "#14532d",
        primary: "#16a34a",
        muted: "#15803d",
        accent: "#4ADE80"
      }
    },
    {
      name: "watermelon",
      displayName: t.themes.watermelon || "Watermelon",
      icon: <LucideHeart className="h-5 w-5 text-red-500" />,
      price: "pro",
      colors: {
        bg: "#182520",
        text: "#f2f2f2",
        primary: "#e63946",
        muted: "#5a7d72",
        accent: "#2a9d8f"
      }
    },
    {
      name: "honey",
      displayName: t.themes.honey || "Honey",
      icon: <Droplet className="h-5 w-5 text-amber-400" />,
      price: "pro",
      colors: {
        bg: "#fff8e1",
        text: "#704214",
        primary: "#f59e0b",
        muted: "#d97706",
        accent: "#fbbf24"
      }
    },
  ];

  const toggleSubscription = () => {
    const newStatus = subscriptionStatus === "basic" ? "pro" : "basic";
    
    // เพิ่มเอฟเฟกต์เมื่อสลับเป็น Pro
    if (newStatus === "pro") {
      setShowProAnimation(true);
      setTimeout(() => setShowProAnimation(false), 1200);
    }
    
    setSubscriptionStatus(newStatus);
  };

  const currentColors = getCurrentThemeColors();

  // Update the calculateTDD function to adjust calories based on the goal
  const calculateTDD = () => {
    if (height === '' || weight === '' || age === '') return;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * (weight as number) + 6.25 * (height as number) - 5 * (age as number) + 5;
    } else {
      bmr = 10 * (weight as number) + 6.25 * (height as number) - 5 * (age as number) - 161;
    }
    
    // Apply activity multiplier
    let activityMultiplier;
    switch (activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.2;
        break;
      case 'lightlyActive':
        activityMultiplier = 1.375;
        break;
      case 'moderatelyActive':
        activityMultiplier = 1.55;
        break;
      case 'veryActive':
        activityMultiplier = 1.725;
        break;
      case 'extremelyActive':
        activityMultiplier = 1.9;
        break;
      default:
        activityMultiplier = 1.55;
    }
    
    // Calculate base TDD
    const baseTdd = Math.round(bmr * activityMultiplier);
    
    // Adjust TDD based on fitness goal
    let finalTdd = baseTdd;
    switch (fitnessGoal) {
      case 'muscleGain':
        // Add 15% calories for muscle gain
        finalTdd = Math.round(baseTdd * 1.15);
        break;
      case 'fatLoss':
        // Reduce 20% calories for fat loss
        finalTdd = Math.round(baseTdd * 0.8);
        break;
      case 'both':
      default:
        // Use base TDD for maintenance
        finalTdd = baseTdd;
        break;
    }
    
    // Calculate recommended water intake based on weight (35ml × kg)
    const waterIntake = Math.round((weight as number) * 35);
    
    setTddResult(finalTdd);
    setWaterIntakeResult(waterIntake);
    setShowTddResults(true);
    
    // Set macro percentages based on fitness goal
    switch (fitnessGoal) {
      case 'muscleGain':
        setProteinPercentage(35);
        setCarbsPercentage(45);
        setFatPercentage(20);
        break;
      case 'fatLoss':
        setProteinPercentage(40);
        setCarbsPercentage(25);
        setFatPercentage(35);
        break;
      case 'both':
      default:
        setProteinPercentage(30);
        setCarbsPercentage(40);
        setFatPercentage(30);
        break;
    }
  };
  
  // Add function to handle macro percentage changes
  const handleProteinChange = (newProtein: number) => {
    const remaining = 100 - newProtein;
    const fatRatio = fatPercentage / (fatPercentage + carbsPercentage || 1);
    
    const newFat = Math.round(remaining * fatRatio);
    const newCarbs = 100 - newProtein - newFat;
    
    setProteinPercentage(newProtein);
    setFatPercentage(newFat);
    setCarbsPercentage(newCarbs);
  };
  
  const handleFatChange = (newFat: number) => {
    const remaining = 100 - newFat;
    const proteinRatio = proteinPercentage / (proteinPercentage + carbsPercentage || 1);
    
    const newProtein = Math.round(remaining * proteinRatio);
    const newCarbs = 100 - newFat - newProtein;
    
    setFatPercentage(newFat);
    setProteinPercentage(newProtein);
    setCarbsPercentage(newCarbs);
  };
  
  const handleCarbsChange = (newCarbs: number) => {
    const remaining = 100 - newCarbs;
    const proteinRatio = proteinPercentage / (proteinPercentage + fatPercentage || 1);
    
    const newProtein = Math.round(remaining * proteinRatio);
    const newFat = 100 - newCarbs - newProtein;
    
    setCarbsPercentage(newCarbs);
    setProteinPercentage(newProtein);
    setFatPercentage(newFat);
  };
  
  // Add function to apply settings
  const applyToSettings = async () => {
    if (!tddResult) return;
    
    // คำนวณกรัมจากเปอร์เซ็นต์
    const proteinGrams = Math.round((tddResult * proteinPercentage / 100) / 4);
    const fatGrams = Math.round((tddResult * fatPercentage / 100) / 9);
    const carbsGrams = Math.round((tddResult * carbsPercentage / 100) / 4);
    
    await updateGoals({
      calories: tddResult,
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbsGrams,
      water: waterIntakeResult || goals.water,
    });
    
    setSettingsUpdated(true);
    setTimeout(() => {
      setSettingsUpdated(false);
    }, 3000);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Pro Animation Overlay */}
      {showProAnimation && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 1], 
              opacity: [0, 1, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 1,
              times: [0, 0.5, 1],
              ease: "easeInOut"
            }}
            className="relative flex flex-col items-center"
          >
            <Crown 
              className="h-32 w-32 text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.7)]" 
            />
            <span className="text-xl font-bold mt-3" style={{ color: currentColors.primary }}>
              {t.subscriptionStatus.pro}!
            </span>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="absolute inset-0 z-0"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: "50%", 
                    y: "50%", 
                    scale: 0, 
                    opacity: 1 
                  }}
                  animate={{ 
                    x: `${Math.random() * 100 - 50}%`, 
                    y: `${Math.random() * 100 - 50}%`, 
                    scale: Math.random() * 0.5 + 0.5, 
                    opacity: 0 
                  }}
                  transition={{ 
                    duration: Math.random() * 0.7 + 0.3,
                    ease: "easeOut"
                  }}
                  className="absolute"
                  style={{ 
                    left: "50%",
                    top: "50%",
                    transformOrigin: "center",
                    color: i % 2 === 0 ? currentColors.primary : currentColors.accent
                  }}
                >
                  {i % 3 === 0 ? <Sparkles className="h-5 w-5" /> : (i % 3 === 1 ? <Star className="h-5 w-5" /> : <Crown className="h-5 w-5" />)}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Apps & Tools Section Header */}
      <motion.div variants={item} className="mb-4">
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">{t.apps.sectionTitle}</h2>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">{t.apps.sectionSubtitle}</p>
      </motion.div>

      {/* TDD Calculator App */}
      <motion.div variants={item}>
        <Card className="overflow-hidden shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: currentColors.primary }}
                >
                  <PieChart className="h-6 w-6" />
                </div>
        <div>
                  <h3 className="font-bold text-lg text-[hsl(var(--foreground))]">
                    {t.apps.tddCalculator.title}
                  </h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {t.apps.tddCalculator.description}
                  </p>
        </div>
              </div>
              <Button
                onClick={() => setShowTddCalculator(!showTddCalculator)}
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                {showTddCalculator ? 
                  <ChevronUp className="h-5 w-5" /> : 
                  <ChevronDown className="h-5 w-5" />
                }
              </Button>
            </div>

            {showTddCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 mt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {t.apps.tddCalculator.height} (cm)
                    </label>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                      placeholder="170"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {t.apps.tddCalculator.weight} (kg)
                    </label>
                    <Input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                      placeholder="65"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {t.apps.tddCalculator.age}
                    </label>
                    <Input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                      placeholder="30"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {t.apps.tddCalculator.gender}
                    </label>
                    <div className="flex space-x-2">
                      <Button
                        variant={gender === 'male' ? 'default' : 'outline'}
                        className={`flex-1 ${gender === 'male' ? 'bg-[hsl(var(--primary))]' : ''}`}
                        onClick={() => setGender('male')}
                      >
                        {t.apps.tddCalculator.male}
                      </Button>
                      <Button
                        variant={gender === 'female' ? 'default' : 'outline'}
                        className={`flex-1 ${gender === 'female' ? 'bg-[hsl(var(--primary))]' : ''}`}
                        onClick={() => setGender('female')}
                      >
                        {t.apps.tddCalculator.female}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {t.apps.tddCalculator.activityLevel}
                  </label>
                  <Select
                    value={activityLevel}
                    onValueChange={(value) => 
                      setActivityLevel(value as 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive' | 'extremelyActive')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">{t.apps.tddCalculator.sedentary}</SelectItem>
                      <SelectItem value="lightlyActive">{t.apps.tddCalculator.lightlyActive}</SelectItem>
                      <SelectItem value="moderatelyActive">{t.apps.tddCalculator.moderatelyActive}</SelectItem>
                      <SelectItem value="veryActive">{t.apps.tddCalculator.veryActive}</SelectItem>
                      <SelectItem value="extremelyActive">{t.apps.tddCalculator.extremelyActive}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Fitness Goal selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {t.apps.tddCalculator.fitnessGoal}
                  </label>
                  <Select
                    value={fitnessGoal}
                    onValueChange={(value) => 
                      setFitnessGoal(value as 'muscleGain' | 'fatLoss' | 'both')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="muscleGain">{t.apps.tddCalculator.muscleGain}</SelectItem>
                      <SelectItem value="fatLoss">{t.apps.tddCalculator.fatLoss}</SelectItem>
                      <SelectItem value="both">{t.apps.tddCalculator.both}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={calculateTDD}
                  className="w-full bg-[hsl(var(--primary))]"
                  disabled={height === '' || weight === '' || age === ''}
                >
                  {t.apps.tddCalculator.calculateButton}
                </Button>

                {/* Results */}
                {showTddResults && tddResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.2,
                      type: "spring",
                      damping: 15,
                      stiffness: 300
                    }}
                    className="mt-6 p-4 rounded-lg bg-[hsl(var(--accent))/0.2] border border-[hsl(var(--accent))/0.2]"
                  >
                    <h4 className="font-semibold text-center mb-4 text-[hsl(var(--foreground))]">
                      {t.apps.tddCalculator.results.yourTdd} <span className="text-2xl text-[hsl(var(--primary))]">{tddResult}</span> {t.apps.tddCalculator.results.caloriesPerDay}
                    </h4>
                    
                    <div className="text-xs text-center mb-3 text-[hsl(var(--muted-foreground))]">
                      <span className="inline-flex items-center">
                        <span className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full mr-1"></span>
                        {t.apps.tddCalculator.results.goalAdjustment}: {getGoalName(fitnessGoal, t)}
                      </span>
                      <div className="mt-1">
                        {fitnessGoal === 'muscleGain' ? (
                          <span>{t.apps.tddCalculator.results.muscleGainAdjustment}</span>
                        ) : fitnessGoal === 'fatLoss' ? (
                          <span>{t.apps.tddCalculator.results.fatLossAdjustment}</span>
                        ) : (
                          <span>{t.apps.tddCalculator.results.noAdjustment}</span>
                        )}
                      </div>
                    </div>

                    <h5 className="font-medium text-sm mb-2 text-[hsl(var(--foreground))]">
                      {t.apps.tddCalculator.results.adjustRatios}
                    </h5>

                    <div className="space-y-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[hsl(var(--foreground))]">
                            {t.apps.tddCalculator.results.protein}: {proteinPercentage}%
                          </span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            {Math.round(tddResult * proteinPercentage / 100 / 4)}g
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="60"
                          value={proteinPercentage}
                          onChange={(e) => handleProteinChange(parseInt(e.target.value))}
                          className="w-full accent-[hsl(var(--primary))]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[hsl(var(--foreground))]">
                            {t.apps.tddCalculator.results.carbs}: {carbsPercentage}%
                          </span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            {Math.round(tddResult * carbsPercentage / 100 / 4)}g
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="60"
                          value={carbsPercentage}
                          onChange={(e) => handleCarbsChange(parseInt(e.target.value))}
                          className="w-full accent-[hsl(var(--primary))]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[hsl(var(--foreground))]">
                            {t.apps.tddCalculator.results.fat}: {fatPercentage}%
                          </span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            {Math.round(tddResult * fatPercentage / 100 / 9)}g
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="60"
                          value={fatPercentage}
                          onChange={(e) => handleFatChange(parseInt(e.target.value))}
                          className="w-full accent-[hsl(var(--primary))]"
                        />
                      </div>
                    </div>
                    
                    {/* Water Intake Result */}
                    <div className="mt-4 p-3 bg-[hsl(var(--primary))/0.1] rounded-md">
                      <h5 className="font-medium text-sm mb-2 text-[hsl(var(--foreground))]">
                        {t.apps.tddCalculator.results.waterIntake}
                      </h5>
                      <div className="flex items-center">
                        <div className="text-2xl font-bold text-[hsl(var(--primary))]">
                          {waterIntakeResult}
                        </div>
                        <div className="ml-2 text-sm text-[hsl(var(--muted-foreground))]">
                          {t.apps.tddCalculator.results.mlPerDay}
                        </div>
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        {t.apps.tddCalculator.results.waterIntakeExplanation}
                      </div>
                    </div>

                    <Button
                      onClick={applyToSettings}
                      className="w-full mt-4 bg-[hsl(var(--primary))]"
                      disabled={settingsUpdated}
                    >
                      {settingsUpdated ? (
        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          {t.apps.tddCalculator.successMessage}
        </div>
                      ) : (
                        t.apps.tddCalculator.applyButton
                      )}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme Shop Section Header */}
      <motion.div variants={item} className="mt-12 mb-4 flex justify-between items-center">
                  <div>
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">{t.title}</h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">{t.subtitle}</p>
                  </div>
        
        {/* Account Status - now inline with header */}
        <div className="flex items-center gap-1.5 text-[hsl(var(--foreground))] bg-[hsl(var(--accent))/0.1] px-3 py-1.5 rounded-full">
          {subscriptionStatus === "pro" ? (
            <div className="relative flex items-center">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  repeatType: "loop",
                  ease: "easeInOut"
                }}
              >
                <Crown className="w-4 h-4 text-yellow-300" />
              </motion.div>
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                className="font-medium text-sm ml-1"
              >
                {t.subscriptionStatus[subscriptionStatus]}
              </motion.span>
            </div>
          ) : (
            <>
              <User className="w-4 h-4" />
              <span className="font-medium text-sm">{t.subscriptionStatus[subscriptionStatus]}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Themes Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {themes.map((themeItem, index) => (
          <motion.div key={themeItem.name} variants={item} className="h-full">
            <Card 
              className={`overflow-hidden transition-all h-full flex flex-col ${theme === themeItem.name ? 'ring-2 ring-[hsl(var(--primary))]' : 'hover:translate-y-[-5px]'}`}
              style={{ 
                backgroundColor: themeItem.colors.bg,
                color: themeItem.colors.text,
                borderColor: `${themeItem.colors.primary}40`
              }}
            >
              <CardContent className="p-0 flex-1 flex flex-col">
                {/* Theme Preview */}
                <div 
                  className="p-4 md:p-5 flex-1"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-md" 
                        style={{ backgroundColor: themeItem.colors.primary, color: '#fff' }}>
                        {themeItem.icon}
                      </div>
                  <div>
                        <h3 className="font-medium text-sm md:text-base">{themeItem.displayName}</h3>
                      </div>
                    </div>
                    {themeItem.price === "pro" ? (
                      <div 
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs shadow-sm relative overflow-hidden" 
                        style={{ 
                          backgroundColor: subscriptionStatus === "pro" 
                            ? `${themeItem.colors.primary}` 
                            : `${themeItem.colors.muted}30`,
                          color: subscriptionStatus === "pro" ? '#fff' : themeItem.colors.text
                        }}
                      >
                        {subscriptionStatus === "pro" && (
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute h-full w-[200%] animate-[shimmer_2s_infinite]"
                              style={{
                                backgroundImage: `linear-gradient(
                                  to right,
                                  transparent 0%,
                                  ${themeItem.colors.accent || themeItem.colors.primary}40 25%,
                                  ${themeItem.colors.accent || themeItem.colors.primary}40 50%,
                                  transparent 100%
                                )`
                              }}
                            ></div>
                          </div>
                        )}
                        <motion.div 
                          animate={
                            subscriptionStatus === "pro" 
                              ? { rotate: [0, 15, -15, 0] } 
                              : { rotate: 0 }
                          }
                          transition={{ 
                            duration: 2, 
                            repeat: subscriptionStatus === "pro" ? Infinity : 0,
                            repeatType: "loop"
                          }}
                        >
                          <Crown className="w-3 h-3 text-yellow-300" />
                        </motion.div>
                        <span>{t.pro}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs shadow-sm"
                        style={{ backgroundColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}
                      >
                        <span>{t.free}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Mock UI Elements */}
                  <div 
                    className="space-y-2 mb-2 p-3 rounded-xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: `${themeItem.colors.muted}40` }}></div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: `${themeItem.colors.muted}40` }}></div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-4 w-4 rounded-md" style={{ backgroundColor: themeItem.colors.primary }}></div>
                      <div className="h-4 w-12 rounded-md" style={{ backgroundColor: `${themeItem.colors.muted}40` }}></div>
                </div>
                  </div>
                  
                  {/* Progress Bar Example */}
                  <div className="w-full h-3 rounded-full overflow-hidden mt-3" style={{ backgroundColor: `${themeItem.colors.muted}30` }}>
                    <div className="h-full rounded-full" style={{ backgroundColor: themeItem.colors.primary, width: '65%' }}></div>
                  </div>
                </div>
                
                {/* Action Section */}
                <div 
                  className="px-3 py-3 md:px-4 md:py-3 border-t flex flex-col"
                  style={{ 
                    borderColor: `${themeItem.colors.primary}30`,
                    backgroundColor: `${themeItem.colors.bg}80`,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {theme === themeItem.name && (
                    <div 
                      className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 self-start mb-2 shadow-sm"
                      style={{
                        backgroundColor: themeItem.colors.primary,
                        color: '#fff'
                      }}
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                      {t.currentTheme}
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`text-xs rounded-lg font-medium flex items-center justify-center gap-1.5 h-9 w-full shadow-md transition-all duration-300 ${
                      theme === themeItem.name ? 'opacity-50 cursor-not-allowed' : 
                      themeItem.price === "pro" && subscriptionStatus !== "pro" ? 'opacity-70 cursor-not-allowed' : 
                      'hover:shadow-lg'
                    }`}
                    style={{
                      backgroundColor: themeItem.colors.primary,
                      color: '#fff',
                      border: 'none',
                    }}
                    onClick={() => theme !== themeItem.name && (themeItem.price === 0 || subscriptionStatus === "pro") && setTheme(themeItem.name)}
                    disabled={theme === themeItem.name || (themeItem.price === "pro" && subscriptionStatus !== "pro")}
                  >
                    {theme === themeItem.name ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {t.currentTheme}
                      </>
                    ) : themeItem.price === "pro" && subscriptionStatus !== "pro" ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        {t.upgrade}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        {t.applyTheme}
                      </>
                    )}
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Premium Card */}
      <motion.div variants={item} className="mt-8">
        <Card 
          className="overflow-hidden transition-all duration-500"
          style={{ 
            backgroundColor: subscriptionStatus === "pro" 
              ? currentColors.primary 
              : currentColors.primary, 
            color: '#fff',
            backgroundImage: subscriptionStatus === "pro" 
              ? `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent || currentColors.primary})`
              : `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent || currentColors.primary}90)`
          }}
        >
          <CardContent className="p-6 relative overflow-hidden">
            {/* Decorative Elements */}
            {subscriptionStatus === "pro" && (
              <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${Math.random() * 20 + 10}px`,
                      height: `${Math.random() * 20 + 10}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      backgroundColor: 'rgba(255,255,255,0.4)',
                      transform: `scale(${Math.random() * 0.5 + 0.5})`,
                      animation: `float-${Math.floor(Math.random() * 3) + 1} ${Math.random() * 10 + 10}s infinite`
                    }}
                  />
                ))}
            </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              {subscriptionStatus === "pro" ? (
                <motion.div 
                  className="relative"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    y: [0, -2, 3, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="h-7 w-7 text-purple-900" />
                  </div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                    className="absolute -inset-1 rounded-full bg-yellow-400/30 z-0"
                  ></motion.div>
                </motion.div>
              ) : (
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    repeatType: "loop" 
                  }}
                >
                  <Crown className="h-8 w-8 text-yellow-300" />
                </motion.div>
              )}
              <h3 className="text-xl font-bold">
                {subscriptionStatus === "pro" ? t.subscriptionStatus.pro : t.premiumTitle}
              </h3>
              {subscriptionStatus === "pro" && (
                <div className="ml-auto flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  ></motion.div>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
              )}
            </div>
            <p className="mb-5 opacity-90">
              {subscriptionStatus === "pro" ? t.premiumDesc : t.premiumDesc}
            </p>
            
            <div className="flex flex-col space-y-3 mb-5 relative z-10">
              {[
                "Access to all premium themes",
                "Unlimited customizations",
                "Premium support"
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <motion.div 
                    className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
                    animate={
                      subscriptionStatus === "pro" 
                        ? { scale: [1, 1.3, 1], backgroundColor: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)'] } 
                        : {}
                    }
                    transition={{  
                      duration: 2,
                      repeat: subscriptionStatus === "pro" ? Infinity : 0,
                      repeatType: "loop",
                      delay: index * 0.5
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </motion.div>
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="relative z-10">
              <Button 
                className={`group relative overflow-hidden w-full md:w-auto ${
                  subscriptionStatus === "pro" 
                    ? "bg-white hover:bg-white/90" 
                    : "bg-white hover:bg-white/80"
                }`}
                onClick={toggleSubscription}
                style={{
                  color: currentColors.primary
                }}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {subscriptionStatus === "pro" ? (
                    <>
                      <ArrowDown className="w-4 h-4" />
                      {t.downgrade}
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
              {t.upgradeNow}
                    </>
                  )}
                </span>
                {subscriptionStatus !== "pro" && (
                  <span 
                    className="absolute inset-0 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300"
                    style={{ 
                      backgroundImage: `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent || currentColors.primary})`,
                      color: '#fff' 
                    }}
                  ></span>
                )}
            </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 

// Stlylesheet for animations
const customStyles = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes float-1 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(5deg); }
  50% { transform: translateY(-15px) rotate(-5deg); }
  75% { transform: translateY(-8px) rotate(3deg); }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

@keyframes float-3 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.1); }
}

.animate-[shimmer_2s_infinite] {
  animation: shimmer 2s infinite;
}
`; 