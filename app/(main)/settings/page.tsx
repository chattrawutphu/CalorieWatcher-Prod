"use client";

import React, { useState, useEffect } from "react";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight,
  Settings as SettingsIcon,
  Palette,
  PieChart,
  Droplet,
  Scale,
  Database,
  FileDown,
  FileUp,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { th, ja, zhCN } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { toast } from "@/components/ui/use-toast";

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

// Translations
const translations = {
  en: {
    settings: "Settings",
    account: "Account",
    profile: "Profile",
    signOut: "Sign Out",
    appearance: "Appearance",
    theme: "Theme",
    language: "Language",
    languageDesc: "Choose your display language",
    nutritionGoals: "Nutrition Goals",
    dailyCalories: "Daily Calories",
    macroDistribution: "Macro Distribution",
    protein: "Protein",
    fat: "Fat",
    carbs: "Carbohydrates",
    save: "Save Changes",
    saved: "Changes Saved!",
    of: "of",
    calories: "calories",
    waterSettings: "Water Intake",
    dailyWaterGoal: "Daily Water Goal",
    ml: "ml",
    liters: "liters",
    recommendedWater: "Recommended: 2000-3000 ml per day",
    glass: "glass",
    dataManagement: "Data Management",
    lastBackup: "Last backup",
    exportData: "Export Data",
    importData: "Import Data",
    neverSynced: "Never backed up",
    weightSettings: "Weight Goal",
    weightGoal: "Weight Goal",
    kg: "kg",
    weightDescription: "Track weight regularly",
    trackWeightRegularly: "Track weight regularly",
    connectionStatus: "Connection Status",
    online: "Online",
    offline: "Offline",
    appVersion: "App Version",
    checkForUpdates: "Check for updates",
    system: "System",
    light: "Light",
    dark: "Dark",
    chocolate: "Chocolate",
    sweet: "Sweet",
    broccoli: "Broccoli",
    blueberry: "Blueberry",
    watermelon: "Watermelon",
    honey: "Honey",
    clearTodayData: "Clear Today's Food Data",
    clearTodayDataConfirm: "This will remove all food entries for today. Water intake and other health data will be preserved. Continue?",
    clearTodayDataSuccess: "Today's food data has been cleared",
    cancel: "Cancel",
    confirm: "Confirm",
    totalMacros: "Total",
    macroPercentageWarning: "The sum of macro percentages must be exactly 100%. Your current total is {total}%.",
    general: "General",
    data: "Data",
    nutrition: "Nutrition",
    reset: "Reset",
    appearanceDesc: "Theme and language settings",
    nutritionDesc: "Calories and macronutrient goals",
    waterDesc: "Daily water intake goals",
    weightDesc: "Set your target weight",
    dataDesc: "Import and export your app data",
  },
  th: {
    settings: "ตั้งค่า",
    account: "บัญชี",
    profile: "โปรไฟล์",
    signOut: "ออกจากระบบ",
    appearance: "ธีมและการแสดงผล",
    theme: "ธีม",
    language: "ภาษา",
    languageDesc: "เลือกภาษาที่แสดงผล",
    nutritionGoals: "เป้าหมายโภชนาการ",
    dailyCalories: "แคลอรี่ต่อวัน",
    macroDistribution: "การกระจายของสารอาหาร",
    protein: "โปรตีน",
    fat: "ไขมัน",
    carbs: "คาร์โบไฮเดรต",
    save: "บันทึกการเปลี่ยนแปลง",
    saved: "บันทึกการเปลี่ยนแปลงแล้ว!",
    of: "จาก",
    calories: "แคลอรี่",
    waterSettings: "การดื่มน้ำ",
    dailyWaterGoal: "เป้าหมายการดื่มน้ำต่อวัน",
    ml: "มล.",
    liters: "ลิตร",
    recommendedWater: "แนะนำ: 2000-3000 มล. ต่อวัน",
    glass: "แก้ว",
    dataManagement: "จัดการข้อมูล",
    lastBackup: "สำรองข้อมูลล่าสุด",
    exportData: "ส่งออกข้อมูล",
    importData: "นำเข้าข้อมูล",
    neverSynced: "ไม่เคยสำรองข้อมูล",
    weightSettings: "เป้าหมายน้ำหนัก",
    weightGoal: "เป้าหมายน้ำหนัก",
    kg: "กิโลกรัม",
    weightDescription: "ติดตามน้ำหนักประจำ",
    trackWeightRegularly: "ติดตามน้ำหนักประจำ",
    connectionStatus: "สถานะการเชื่อมต่อ",
    online: "ออนไลน์",
    offline: "ออฟไลน์",
    appVersion: "เวอร์ชั่นแอพ",
    checkForUpdates: "ตรวจสอบการอัพเดท",
    system: "อัตโนมัติ (ตามระบบ)",
    light: "โหมดสว่าง",
    dark: "โหมดมืด",
    chocolate: "ธีมช็อกโกแลต",
    sweet: "ธีมหวาน",
    broccoli: "ธีมบร็อคโคลี่",
    blueberry: "ธีมบลูเบอร์รี่",
    watermelon: "ธีมแตงโม",
    honey: "ธีมน้ำผึ้ง",
    clearTodayData: "ล้างข้อมูลอาหารของวันนี้",
    clearTodayDataConfirm: "การดำเนินการนี้จะลบข้อมูลอาหารทั้งหมดของวันนี้ ข้อมูลการดื่มน้ำและข้อมูลสุขภาพอื่นๆ จะยังคงอยู่ ต้องการดำเนินการต่อหรือไม่?",
    clearTodayDataSuccess: "ล้างข้อมูลอาหารของวันนี้เรียบร้อยแล้ว",
    cancel: "ยกเลิก",
    confirm: "ยืนยัน",
    totalMacros: "รวม",
    macroPercentageWarning: "ผลรวมของสารอาหารต้องเท่ากับ 100% พอดี ปัจจุบันผลรวมคือ {total}%",
    general: "ทั่วไป",
    data: "ข้อมูล",
    nutrition: "โภชนาการ",
    reset: "รีเซ็ต",
    appearanceDesc: "ปรับแต่งธีมและภาษา",
    nutritionDesc: "เป้าหมายแคลอรี่และสารอาหาร",
    waterDesc: "เป้าหมายการดื่มน้ำประจำวัน",
    weightDesc: "ตั้งค่าเป้าหมายน้ำหนัก",
    dataDesc: "นำเข้าและส่งออกข้อมูลแอป",
  },
  ja: {
    settings: "設定",
    account: "アカウント",
    profile: "プロフィール",
    signOut: "サインアウト",
    appearance: "外観",
    theme: "テーマ",
    language: "言語",
    languageDesc: "表示言語を選択",
    nutritionGoals: "栄養目標",
    dailyCalories: "1日のカロリー",
    macroDistribution: "マクロ分布",
    protein: "タンパク質",
    fat: "脂肪",
    carbs: "炭水化物",
    save: "変更を保存",
    saved: "保存しました！",
    of: "から",
    calories: "カロリー",
    waterSettings: "水分摂取",
    dailyWaterGoal: "1日の水分目標",
    ml: "ml",
    liters: "リットル",
    recommendedWater: "おすすめ：1日2000-3000ml",
    glass: "グラス",
    dataManagement: "データ管理",
    lastBackup: "最後のバックアップ",
    exportData: "データのエクスポート",
    importData: "データのインポート",
    neverSynced: "バックアップ履歴なし",
    weightSettings: "体重目標",
    weightGoal: "体重目標",
    kg: "kg",
    weightDescription: "定期的に体重を記録する",
    trackWeightRegularly: "定期的に体重を記録する",
    connectionStatus: "接続状態",
    online: "オンライン",
    offline: "オフライン",
    appVersion: "アプリバージョン",
    checkForUpdates: "アップデートを確認",
    system: "システム",
    light: "ライトモード",
    dark: "ダークモード",
    chocolate: "チョコレート",
    sweet: "スイート",
    broccoli: "ブロッコリー",
    blueberry: "ブルーベリー",
    watermelon: "スイカ",
    honey: "ハニー",
    clearTodayData: "今日の食事データを消去",
    clearTodayDataConfirm: "これにより、今日の食事エントリーがすべて削除されます。水分摂取量やその他の健康データは保持されます。続行しますか？",
    clearTodayDataSuccess: "今日の食事データが消去されました",
    cancel: "キャンセル",
    confirm: "確認",
    totalMacros: "合計",
    macroPercentageWarning: "マクロ栄養素の合計は100%である必要があります。現在の合計は{total}%です。",
    general: "一般",
    data: "データ",
    nutrition: "栄養",
    reset: "リセット",
    appearanceDesc: "テーマと言語の設定",
    nutritionDesc: "カロリーと栄養素の目標",
    waterDesc: "1日の水分摂取目標",
    weightDesc: "目標体重を設定",
    dataDesc: "アプリデータのインポートとエクスポート",
  },
  zh: {
    settings: "设置",
    account: "账户",
    profile: "个人资料",
    signOut: "退出登录",
    appearance: "外观",
    theme: "主题",
    language: "语言",
    languageDesc: "选择显示语言",
    nutritionGoals: "营养目标",
    dailyCalories: "每日卡路里",
    macroDistribution: "宏量营养素分布",
    protein: "蛋白质",
    fat: "脂肪",
    carbs: "碳水化合物",
    save: "保存更改",
    saved: "已保存！",
    of: "共",
    calories: "卡路里",
    waterSettings: "饮水量",
    dailyWaterGoal: "每日饮水目标",
    ml: "ml",
    liters: "升",
    recommendedWater: "建议：每日2000-3000ml",
    glass: "杯",
    dataManagement: "数据管理",
    lastBackup: "上次备份",
    exportData: "导出数据",
    importData: "导入数据",
    neverSynced: "从未备份",
    weightSettings: "体重目标",
    weightGoal: "体重目标",
    kg: "公斤",
    weightDescription: "定期称重",
    trackWeightRegularly: "定期称重",
    connectionStatus: "连接状态",
    online: "在线",
    offline: "离线",
    appVersion: "应用版本",
    checkForUpdates: "检查更新",
    system: "系统",
    light: "亮色",
    dark: "暗色",
    chocolate: "巧克力",
    sweet: "甜味",
    broccoli: "西兰花",
    blueberry: "蓝莓",
    watermelon: "西瓜",
    honey: "蜂蜜",
    clearTodayData: "清除今天的食物数据",
    clearTodayDataConfirm: "这将删除今天的所有食物条目。饮水量和其他健康数据将保留。继续吗？",
    clearTodayDataSuccess: "今天的食物数据已清除",
    cancel: "取消",
    confirm: "确认",
    totalMacros: "总计",
    macroPercentageWarning: "宏量营养素百分比总和必须恰好为100%。当前总和为{total}%。",
    general: "常规",
    data: "数据",
    nutrition: "营养",
    reset: "重置",
    appearanceDesc: "主题和语言设置",
    nutritionDesc: "卡路里和营养素目标",
    waterDesc: "每日饮水目标",
    weightDesc: "设置目标体重",
    dataDesc: "导入和导出应用数据",
  },
};

export default function SettingsPage() {
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  const { clearTodayData } = useNutritionStore();
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  
  // Load last backup time
  useEffect(() => {
    const storedBackupTime = localStorage.getItem('last-backup-time');
    setLastBackupTime(storedBackupTime);
  }, []);
  
  // Format last backup time
  const formatLastBackupTime = () => {
    if (!lastBackupTime) return t.neverSynced;
    
    // Select locale based on app language
    const localeOptions: Record<string, Locale> = {
      th: th,
      ja: ja,
      zh: zhCN
    };
    
    const localeOption = localeOptions[locale as keyof typeof localeOptions];
    
    return formatDistanceToNow(new Date(lastBackupTime), { 
      addSuffix: true,
      locale: localeOption
    });
  };
  
  // Settings items
  const settingsItems = [
    {
      icon: <Palette className="h-5 w-5 text-blue-500" />,
      title: t.appearance,
      description: t.appearanceDesc,
      href: "/settings/appearance"
    },
    {
      icon: <Globe className="h-5 w-5 text-orange-500" />,
      title: t.language,
      description: t.languageDesc,
      href: "/settings/language"
    },
    {
      icon: <PieChart className="h-5 w-5 text-green-500" />,
      title: t.nutritionGoals,
      description: t.nutritionDesc,
      href: "/settings/nutrition"
    },
    {
      icon: <Droplet className="h-5 w-5 text-cyan-500" />,
      title: t.waterSettings,
      description: t.waterDesc,
      href: "/settings/water"
    },
    {
      icon: <Scale className="h-5 w-5 text-purple-500" />,
      title: t.weightSettings,
      description: t.weightDesc,
      href: "/settings/weight"
    },
    {
      icon: <Database className="h-5 w-5 text-amber-500" />,
      title: t.dataManagement,
      description: t.dataDesc,
      href: "/settings/data"
    }
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen pb-32">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="mb-6">
          <h1 className="text-2xl font-bold">{t.settings}</h1>
        </motion.div>

        {/* Settings Categories */}
        <motion.div variants={item} className="space-y-3">
          {settingsItems.map((item, index) => (
            <Link href={item.href} key={index}>
              <Card className="cursor-pointer hover:bg-[hsl(var(--accent))/0.1] transition-colors">
                <CardContent className="flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[hsl(var(--accent))/0.1] flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>

        {/* App Info */}
        <motion.div variants={item} className="text-center text-xs text-[hsl(var(--muted-foreground))] pt-6">
          <p>CalorieWatcher v1.0.0</p>
        </motion.div>
      </motion.div>
    </div>
  );
} 