"use client";

import React, { useState, useEffect } from "react";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  User, 
  ChevronRight,
  Settings as SettingsIcon,
  Palette,
  PieChart,
  Droplet,
  Scale,
  Database,
  Cloud,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { th, ja, zhCN } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { toast } from "@/components/ui/use-toast";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

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
    syncData: "Data Synchronization",
    lastSync: "Last synchronized",
    neverSynced: "Never synced",
    syncNow: "Sync Now",
    syncing: "Syncing...",
    syncComplete: "Sync Complete",
    weightSettings: "Weight Goal",
    weightGoal: "Weight Goal",
    kg: "kg",
    weightDescription: "Track weight regularly",
    trackWeightRegularly: "Track weight regularly",
    resetSync: "Reset Sync History",
    syncResetConfirm: "This will reset all sync history. Your device will be treated as a new device. Continue?",
    connectionStatus: "Connection Status",
    online: "Online",
    offline: "Offline",
    syncTip: "Sync regularly to keep your data up to date across all devices.",
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
    dataManagement: "Data Management",
    clearTodayData: "Clear Today's Food Data",
    clearTodayDataConfirm: "This will remove all food entries for today. Water intake and other health data will be preserved. Continue?",
    clearTodayDataSuccess: "Today's food data has been cleared",
    cancel: "Cancel",
    confirm: "Confirm",
    syncTooFrequent: "You're syncing too frequently",
    syncWaitMessage: "Please wait about {minutes} minutes",
    totalMacros: "Total",
    macroPercentageWarning: "The sum of macro percentages must be exactly 100%. Your current total is {total}%.",
    general: "General",
    data: "Data",
    nutrition: "Nutrition",
    reset: "Reset",
    syncSettings: "Keep your data synced across devices",
    appearanceDesc: "Theme and language settings",
    nutritionDesc: "Calories and macronutrient goals",
    waterDesc: "Daily water intake goals",
    weightDesc: "Set your target weight",
    dataDesc: "Manage your app data",
    syncDesc: "Sync and backup your data"
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
    syncData: "การซิงค์ข้อมูล",
    lastSync: "ซิงค์ล่าสุดเมื่อ",
    neverSynced: "ไม่เคยซิงค์",
    syncNow: "ซิงค์ตอนนี้",
    syncing: "กำลังซิงค์...",
    syncComplete: "ซิงค์เสร็จสิ้น",
    weightSettings: "เป้าหมายน้ำหนัก",
    weightGoal: "เป้าหมายน้ำหนัก",
    kg: "กิโลกรัม",
    weightDescription: "ติดตามน้ำหนักประจำ",
    trackWeightRegularly: "ติดตามน้ำหนักประจำ",
    resetSync: "รีเซ็ตประวัติการซิงค์",
    syncResetConfirm: "การรีเซ็ตจะล้างประวัติการซิงค์ทั้งหมด อุปกรณ์ของคุณจะถูกถือว่าเป็นอุปกรณ์ใหม่ ดำเนินการต่อ?",
    connectionStatus: "สถานะการเชื่อมต่อ",
    online: "ออนไลน์",
    offline: "ออฟไลน์",
    syncTip: "ซิงค์ข้อมูลเป็นประจำเพื่อให้ข้อมูลของคุณอัปเดตบนทุกอุปกรณ์",
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
    dataManagement: "จัดการข้อมูล",
    clearTodayData: "ล้างข้อมูลอาหารของวันนี้",
    clearTodayDataConfirm: "การดำเนินการนี้จะลบข้อมูลอาหารทั้งหมดของวันนี้ ข้อมูลการดื่มน้ำและข้อมูลสุขภาพอื่นๆ จะยังคงอยู่ ต้องการดำเนินการต่อหรือไม่?",
    clearTodayDataSuccess: "ล้างข้อมูลอาหารของวันนี้เรียบร้อยแล้ว",
    cancel: "ยกเลิก",
    confirm: "ยืนยัน",
    syncTooFrequent: "คุณรีเฟรชข้อมูลบ่อยเกินไป",
    syncWaitMessage: "โปรดรอประมาณ {minutes} นาที",
    totalMacros: "รวม",
    macroPercentageWarning: "ผลรวมของสารอาหารต้องเท่ากับ 100% พอดี ปัจจุบันผลรวมคือ {total}%",
    general: "ทั่วไป",
    data: "ข้อมูล",
    nutrition: "โภชนาการ",
    reset: "รีเซ็ต",
    syncSettings: "รักษาข้อมูลของคุณให้ซิงค์กันระหว่างอุปกรณ์",
    appearanceDesc: "ปรับแต่งธีมและภาษา",
    nutritionDesc: "เป้าหมายแคลอรี่และสารอาหาร",
    waterDesc: "เป้าหมายการดื่มน้ำประจำวัน",
    weightDesc: "ตั้งค่าเป้าหมายน้ำหนัก",
    dataDesc: "จัดการข้อมูลในแอป",
    syncDesc: "ซิงค์และสำรองข้อมูล"
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
    syncData: "データ同期",
    lastSync: "最終同期",
    neverSynced: "同期履歴なし",
    syncNow: "今すぐ同期",
    syncing: "同期中...",
    syncComplete: "同期完了",
    weightSettings: "体重目標",
    weightGoal: "体重目標",
    kg: "kg",
    weightDescription: "定期的に体重を記録する",
    trackWeightRegularly: "定期的に体重を記録する",
    resetSync: "同期履歴をリセット",
    syncResetConfirm: "これにより、すべての同期履歴がリセットされます。お使いのデバイスは新しいデバイスとして扱われます。続行しますか？",
    connectionStatus: "接続状態",
    online: "オンライン",
    offline: "オフライン",
    syncTip: "定期的に同期して、すべてのデバイスでデータを最新の状態に保ちます。",
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
    dataManagement: "データ管理",
    clearTodayData: "今日の食事データを消去",
    clearTodayDataConfirm: "これにより、今日の食事エントリーがすべて削除されます。水分摂取量やその他の健康データは保持されます。続行しますか？",
    clearTodayDataSuccess: "今日の食事データが消去されました",
    cancel: "キャンセル",
    confirm: "確認",
    syncTooFrequent: "同期が頻繁すぎます",
    syncWaitMessage: "約{minutes}分お待ちください",
    totalMacros: "合計",
    macroPercentageWarning: "マクロ栄養素の合計は100%である必要があります。現在の合計は{total}%です。",
    general: "一般",
    data: "データ",
    nutrition: "栄養",
    reset: "リセット",
    syncSettings: "デバイス間でデータを同期する",
    appearanceDesc: "テーマと言語の設定",
    nutritionDesc: "カロリーと栄養素の目標",
    waterDesc: "1日の水分摂取目標",
    weightDesc: "目標体重を設定",
    dataDesc: "アプリデータの管理",
    syncDesc: "データの同期とバックアップ"
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
    syncData: "数据同步",
    lastSync: "最后同步时间",
    neverSynced: "从未同步",
    syncNow: "立即同步",
    syncing: "同步中...",
    syncComplete: "同步完成",
    weightSettings: "体重目标",
    weightGoal: "体重目标",
    kg: "公斤",
    weightDescription: "定期称重",
    trackWeightRegularly: "定期称重",
    resetSync: "重置同步历史",
    syncResetConfirm: "这将重置所有同步历史记录。您的设备将被视为新设备。是否继续？",
    connectionStatus: "连接状态",
    online: "在线",
    offline: "离线",
    syncTip: "定期同步以保持所有设备上的数据更新。",
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
    dataManagement: "数据管理",
    clearTodayData: "清除今天的食物数据",
    clearTodayDataConfirm: "这将删除今天的所有食物条目。饮水量和其他健康数据将保留。继续吗？",
    clearTodayDataSuccess: "今天的食物数据已清除",
    cancel: "取消",
    confirm: "确认",
    syncTooFrequent: "同步频率过高",
    syncWaitMessage: "请等待约{minutes}分钟",
    totalMacros: "总计",
    macroPercentageWarning: "宏量营养素百分比总和必须恰好为100%。当前总和为{total}%。",
    general: "常规",
    data: "数据",
    nutrition: "营养",
    reset: "重置",
    syncSettings: "在设备之间保持数据同步",
    appearanceDesc: "主题和语言设置",
    nutritionDesc: "卡路里和营养素目标",
    waterDesc: "每日饮水目标",
    weightDesc: "设置目标体重",
    dataDesc: "管理应用数据",
    syncDesc: "同步和备份数据"
  },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  const { syncData } = useNutritionStore();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // Load last sync time
  useEffect(() => {
    const storedSyncTime = localStorage.getItem('last-sync-time');
    setLastSyncTime(storedSyncTime);
  }, []);
  
  // Format last sync time
  const formatLastSyncTime = () => {
    if (!lastSyncTime) return t.neverSynced;
    
    // Select locale based on app language
    const localeOptions: Record<string, Locale> = {
      th: th,
      ja: ja,
      zh: zhCN
    };
    
    const localeOption = localeOptions[locale as keyof typeof localeOptions];
    
    return formatDistanceToNow(new Date(lastSyncTime), { 
      addSuffix: true,
      locale: localeOption
    });
  };
  
  // Refresh data
  const refreshData = async () => {
    try {
      await syncData();
      const syncTime = new Date().toISOString();
      localStorage.setItem('last-sync-time', syncTime);
      setLastSyncTime(syncTime);
      
      toast({
        title: locale === 'en' ? 'Data Updated' : 
              locale === 'th' ? 'อัปเดตข้อมูลแล้ว' : 
              locale === 'ja' ? 'データが更新されました' : '数据已更新',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: locale === 'en' ? 'Refresh Failed' : 
               locale === 'th' ? 'รีเฟรชข้อมูลล้มเหลว' : 
               locale === 'ja' ? '更新に失敗しました' : '刷新失败',
        variant: "destructive",
        duration: 3000
      });
    }
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
      icon: <Cloud className="h-5 w-5 text-indigo-500" />,
      title: t.syncData,
      description: t.syncDesc,
      href: "/settings/sync"
    },
    {
      icon: <Database className="h-5 w-5 text-red-500" />,
      title: t.dataManagement,
      description: t.dataDesc,
      href: "/settings/data"
    }
  ];
  
  return (
    <PullToRefresh onRefresh={refreshData}>
      <motion.div
        className="max-w-md mx-auto min-h-screen pb-32"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="flex items-center justify-between mb-6" variants={item}>
          <h1 className="text-xl font-extrabold">{t.settings}</h1>
          <motion.div className="w-10 h-10 rounded-full flex items-center justify-center bg-[hsl(var(--accent))]">
            <SettingsIcon className="h-5 w-5" />
          </motion.div>
        </motion.div>

        {/* User Profile Card */}
        <motion.div variants={item} className="mb-6">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))]">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{session?.user?.name || "User"}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] truncate max-w-[180px]">
                    {session?.user?.email || ""}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="rounded-full hover:bg-[hsl(var(--destructive))/0.1] hover:text-[hsl(var(--destructive))]"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  <span className="text-xs">{t.signOut}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings List */}
        <motion.div variants={item} className="space-y-3">
          {settingsItems.map((item, index) => (
            <Link href={item.href} key={index}>
              <motion.div 
                className="bg-[hsl(var(--card))] p-4 rounded-lg border border-[hsl(var(--border))] hover:shadow-md transition-shadow flex items-center"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center mr-4 flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </motion.div>
            </Link>
          ))}
        </motion.div>
        
        {/* Last Sync Info */}
        <motion.div variants={item} className="mt-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          <p>{t.lastSync}: {formatLastSyncTime()}</p>
        </motion.div>
      </motion.div>
    </PullToRefresh>
  );
} 