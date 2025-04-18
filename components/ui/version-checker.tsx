"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Download, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/ui/use-toast";

// Current app version from package.json
const CURRENT_VERSION = "0.1.0";

// Simulated remote version endpoint
// In a real app, you would fetch this from your backend
const checkForUpdates = async (): Promise<{
  version: string;
  hasUpdate: boolean;
  releaseNotes?: string;
}> => {
  // Simulate API call with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For testing: randomly decide if there's an update
  // In production, compare with actual server version
  const mockRemoteVersion = Math.random() > 0.7 ? "0.1.1" : "0.1.0";
  
  return {
    version: mockRemoteVersion,
    hasUpdate: mockRemoteVersion !== CURRENT_VERSION,
    releaseNotes: mockRemoteVersion !== CURRENT_VERSION ? 
      "- เพิ่มสีธีมใหม่\n- ปรับปรุงประสิทธิภาพการทำงาน\n- แก้ไขบั๊กการซิงค์ข้อมูล" : 
      undefined
  };
};

const translations = {
  en: {
    appVersion: "App Version",
    currentVersion: "Current Version",
    latestVersion: "Latest Version",
    upToDate: "Up to date",
    updateAvailable: "Update Available",
    releaseNotes: "Release Notes",
    checkForUpdates: "Check for Updates",
    checking: "Checking...",
    update: "Update Now",
    lastChecked: "Last checked",
    never: "never",
    justNow: "just now",
    minutesAgo: "minutes ago",
    hoursAgo: "hours ago",
    daysAgo: "days ago"
  },
  th: {
    appVersion: "เวอร์ชั่นแอพ",
    currentVersion: "เวอร์ชั่นปัจจุบัน",
    latestVersion: "เวอร์ชั่นล่าสุด",
    upToDate: "เป็นเวอร์ชั่นล่าสุดแล้ว",
    updateAvailable: "มีอัพเดทใหม่",
    releaseNotes: "รายละเอียดการอัพเดท",
    checkForUpdates: "ตรวจสอบอัพเดท",
    checking: "กำลังตรวจสอบ...",
    update: "อัพเดทเดี๋ยวนี้",
    lastChecked: "ตรวจสอบล่าสุดเมื่อ",
    never: "ไม่เคย",
    justNow: "เมื่อสักครู่",
    minutesAgo: "นาทีที่แล้ว",
    hoursAgo: "ชั่วโมงที่แล้ว",
    daysAgo: "วันที่แล้ว"
  },
  ja: {
    appVersion: "アプリバージョン",
    currentVersion: "現在のバージョン",
    latestVersion: "最新バージョン",
    upToDate: "最新です",
    updateAvailable: "アップデートが利用可能",
    releaseNotes: "リリースノート",
    checkForUpdates: "アップデートを確認",
    checking: "確認中...",
    update: "今すぐ更新",
    lastChecked: "最終確認",
    never: "確認履歴なし",
    justNow: "たった今",
    minutesAgo: "分前",
    hoursAgo: "時間前",
    daysAgo: "日前"
  },
  zh: {
    appVersion: "应用版本",
    currentVersion: "当前版本",
    latestVersion: "最新版本",
    upToDate: "已是最新",
    updateAvailable: "有可用更新",
    releaseNotes: "更新说明",
    checkForUpdates: "检查更新",
    checking: "检查中...",
    update: "立即更新",
    lastChecked: "上次检查",
    never: "从未检查",
    justNow: "刚刚",
    minutesAgo: "分钟前",
    hoursAgo: "小时前",
    daysAgo: "天前"
  }
};

export function VersionChecker() {
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [checking, setChecking] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState(CURRENT_VERSION);
  const [releaseNotes, setReleaseNotes] = useState<string | undefined>(undefined);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  // Check for updates on mount (optionally)
  useEffect(() => {
    // Load last checked time from localStorage
    const storedLastChecked = localStorage.getItem('last-update-check');
    if (storedLastChecked) {
      setLastChecked(new Date(storedLastChecked));
    }
    
    // Auto-check for updates on component mount
    handleCheckForUpdates();
  }, []);
  
  const handleCheckForUpdates = async () => {
    setChecking(true);
    
    try {
      const result = await checkForUpdates();
      setLatestVersion(result.version);
      setHasUpdate(result.hasUpdate);
      setReleaseNotes(result.releaseNotes);
      
      // Update last checked time
      const now = new Date();
      setLastChecked(now);
      localStorage.setItem('last-update-check', now.toISOString());
      
      // Show toast notification if update is available
      if (result.hasUpdate) {
        toast({
          title: t.updateAvailable,
          description: `${t.latestVersion}: ${result.version}`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setChecking(false);
    }
  };
  
  const handleUpdate = () => {
    // In a PWA, this would typically:
    // 1. Notify the service worker to update
    // 2. Clear cache
    // 3. Reload the page
    
    // For demo purposes, we'll just reload the page
    if ('serviceWorker' in navigator && window.workbox !== undefined) {
      // If workbox is available, use it to update
      window.workbox.addEventListener('controlling', () => {
        window.location.reload();
      });
      
      window.workbox.messageSkipWaiting();
    } else {
      // Fallback to simple reload
      window.location.reload();
    }
  };
  
  // Format the last checked time
  const formatLastChecked = () => {
    if (!lastChecked) return t.never;
    
    const now = new Date();
    const diffMs = now.getTime() - lastChecked.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return t.justNow;
    if (diffMins < 60) return `${diffMins} ${t.minutesAgo}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ${t.hoursAgo}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${t.daysAgo}`;
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span className="font-medium">{t.appVersion}</span>
          </div>
          
          {hasUpdate ? (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
            >
              {t.updateAvailable}
            </motion.span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
              <Check className="h-3 w-3" /> {t.upToDate}
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">{t.currentVersion}</span>
            <span>{CURRENT_VERSION}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">{t.latestVersion}</span>
            <span className={hasUpdate ? "text-[hsl(var(--primary))] font-medium" : ""}>{latestVersion}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">{t.lastChecked}</span>
            <span>{formatLastChecked()}</span>
          </div>
        </div>
        
        {releaseNotes && hasUpdate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2"
          >
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">{t.releaseNotes}:</p>
            <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))/0.3] p-2 rounded-md whitespace-pre-line">
              {releaseNotes}
            </div>
          </motion.div>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleCheckForUpdates}
            disabled={checking}
            className="flex-1"
          >
            {checking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {t.checking}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t.checkForUpdates}
              </>
            )}
          </Button>
          
          {hasUpdate && (
            <Button 
              onClick={handleUpdate}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {t.update}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Add this to make TypeScript happy with the workbox property
declare global {
  interface Window {
    workbox?: any;
  }
} 