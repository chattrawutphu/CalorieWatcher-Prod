"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronLeft, RefreshCw, Cloud, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { th, ja, zhCN } from 'date-fns/locale';
import type { Locale } from 'date-fns';

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

export default function SyncSettingsPage() {
  const { locale } = useLanguage();
  const { data: session, status } = useSession();
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [syncFrequency, setSyncFrequency] = useState<string>("hourly");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showResetDialog, setShowResetDialog] = useState<boolean>(false);
  const [syncCooldown, setSyncCooldown] = useState<boolean>(false);
  const [cooldownTime, setCooldownTime] = useState<number>(0);
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAutoSync = localStorage.getItem('autoSync');
      if (storedAutoSync !== null) {
        setAutoSync(storedAutoSync === 'true');
      }
      
      const storedSyncFrequency = localStorage.getItem('syncFrequency');
      if (storedSyncFrequency) {
        setSyncFrequency(storedSyncFrequency);
      }
      
      const storedLastSyncTime = localStorage.getItem('last-sync-time');
      setLastSyncTime(storedLastSyncTime);
    }
  }, []);
  
  // Check for online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (syncCooldown && cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setSyncCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [syncCooldown, cooldownTime]);
  
  // Simplified translations for this page
  const translations = {
    en: {
      syncSettings: "Data Synchronization",
      description: "Manage your data across devices",
      connectionStatus: "Connection Status",
      online: "Online",
      offline: "Offline",
      lastSync: "Last synchronized",
      neverSynced: "Never synced",
      syncNow: "Sync Now",
      syncing: "Syncing...",
      syncComplete: "Sync Complete",
      autoSync: "Auto Sync",
      enableAutoSync: "Enable automatic synchronization",
      syncFrequency: "Sync Frequency",
      hourly: "Hourly",
      daily: "Daily",
      weekly: "Weekly",
      resetSync: "Reset Sync History",
      resetSyncDesc: "Clear all sync history and treat this as a new device",
      resetConfirm: "Are you sure?",
      resetMessage: "This will clear all synchronization history. Your device will be treated as a new device, which may cause conflicts. This action cannot be undone.",
      confirm: "Confirm",
      cancel: "Cancel",
      back: "Back",
      syncTip: "Sync regularly to keep your data up to date across all devices.",
      syncTooFrequent: "You're syncing too frequently",
      syncWaitMessage: "Please wait {minutes} minutes",
      syncLoginRequired: "Login required for sync",
      loginToSync: "Please login to enable synchronization",
      syncSuccess: "Data synchronized successfully",
      syncError: "Synchronization failed",
      minutes: "minutes",
      seconds: "seconds"
    },
    th: {
      syncSettings: "การซิงค์ข้อมูล",
      description: "จัดการข้อมูลของคุณระหว่างอุปกรณ์",
      connectionStatus: "สถานะการเชื่อมต่อ",
      online: "ออนไลน์",
      offline: "ออฟไลน์",
      lastSync: "ซิงค์ล่าสุดเมื่อ",
      neverSynced: "ไม่เคยซิงค์",
      syncNow: "ซิงค์ตอนนี้",
      syncing: "กำลังซิงค์...",
      syncComplete: "ซิงค์เสร็จสิ้น",
      autoSync: "ซิงค์อัตโนมัติ",
      enableAutoSync: "เปิดใช้งานการซิงค์อัตโนมัติ",
      syncFrequency: "ความถี่ในการซิงค์",
      hourly: "ทุกชั่วโมง",
      daily: "ทุกวัน",
      weekly: "ทุกสัปดาห์",
      resetSync: "รีเซ็ตประวัติการซิงค์",
      resetSyncDesc: "ล้างประวัติการซิงค์ทั้งหมดและถือว่านี่เป็นอุปกรณ์ใหม่",
      resetConfirm: "คุณแน่ใจหรือไม่?",
      resetMessage: "การดำเนินการนี้จะล้างประวัติการซิงค์ทั้งหมด อุปกรณ์ของคุณจะถูกถือว่าเป็นอุปกรณ์ใหม่ ซึ่งอาจทำให้เกิดความขัดแย้งของข้อมูล การกระทำนี้ไม่สามารถยกเลิกได้",
      confirm: "ยืนยัน",
      cancel: "ยกเลิก",
      back: "กลับ",
      syncTip: "ซิงค์เป็นประจำเพื่อให้ข้อมูลของคุณทันสมัยบนอุปกรณ์ทั้งหมด",
      syncTooFrequent: "คุณซิงค์บ่อยเกินไป",
      syncWaitMessage: "โปรดรอ {minutes} นาที",
      syncLoginRequired: "ต้องเข้าสู่ระบบเพื่อซิงค์",
      loginToSync: "โปรดเข้าสู่ระบบเพื่อเปิดใช้งานการซิงค์",
      syncSuccess: "ซิงค์ข้อมูลสำเร็จ",
      syncError: "การซิงค์ล้มเหลว",
      minutes: "นาที",
      seconds: "วินาที"
    },
    ja: {
      syncSettings: "データ同期",
      description: "デバイス間でデータを管理する",
      connectionStatus: "接続状態",
      online: "オンライン",
      offline: "オフライン",
      lastSync: "最終同期",
      neverSynced: "同期履歴なし",
      syncNow: "今すぐ同期",
      syncing: "同期中...",
      syncComplete: "同期完了",
      autoSync: "自動同期",
      enableAutoSync: "自動同期を有効にする",
      syncFrequency: "同期頻度",
      hourly: "毎時",
      daily: "毎日",
      weekly: "毎週",
      resetSync: "同期履歴をリセット",
      resetSyncDesc: "すべての同期履歴をクリアし、これを新しいデバイスとして扱います",
      resetConfirm: "よろしいですか？",
      resetMessage: "これにより、すべての同期履歴がクリアされます。デバイスは新しいデバイスとして扱われ、データの競合が発生する可能性があります。この操作は元に戻せません。",
      confirm: "確認",
      cancel: "キャンセル",
      back: "戻る",
      syncTip: "定期的に同期して、すべてのデバイスでデータを最新の状態に保ちます。",
      syncTooFrequent: "同期が頻繁すぎます",
      syncWaitMessage: "{minutes}分お待ちください",
      syncLoginRequired: "同期にはログインが必要です",
      loginToSync: "同期を有効にするにはログインしてください",
      syncSuccess: "データが正常に同期されました",
      syncError: "同期に失敗しました",
      minutes: "分",
      seconds: "秒"
    },
    zh: {
      syncSettings: "数据同步",
      description: "管理您在各设备上的数据",
      connectionStatus: "连接状态",
      online: "在线",
      offline: "离线",
      lastSync: "上次同步时间",
      neverSynced: "从未同步",
      syncNow: "立即同步",
      syncing: "同步中...",
      syncComplete: "同步完成",
      autoSync: "自动同步",
      enableAutoSync: "启用自动同步",
      syncFrequency: "同步频率",
      hourly: "每小时",
      daily: "每天",
      weekly: "每周",
      resetSync: "重置同步历史",
      resetSyncDesc: "清除所有同步历史并将此视为新设备",
      resetConfirm: "您确定吗？",
      resetMessage: "这将清除所有同步历史。您的设备将被视为新设备，这可能会导致数据冲突。此操作无法撤消。",
      confirm: "确认",
      cancel: "取消",
      back: "返回",
      syncTip: "定期同步以保持所有设备上的数据更新。",
      syncTooFrequent: "同步频率过高",
      syncWaitMessage: "请等待{minutes}分钟",
      syncLoginRequired: "同步需要登录",
      loginToSync: "请登录以启用同步",
      syncSuccess: "数据同步成功",
      syncError: "同步失败",
      minutes: "分钟",
      seconds: "秒"
    }
  };
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  // Handle auto sync toggle
  const handleAutoSyncToggle = (checked: boolean) => {
    setAutoSync(checked);
    localStorage.setItem('autoSync', checked.toString());
    
    if (checked) {
      toast({
        title: "Auto sync enabled",
        duration: 2000,
      });
    } else {
      toast({
        title: "Auto sync disabled",
        duration: 2000,
      });
    }
  };
  
  // Handle sync frequency change
  const handleSyncFrequencyChange = (frequency: string) => {
    setSyncFrequency(frequency);
    localStorage.setItem('syncFrequency', frequency);
  };
  
  // Get date locale based on app language
  const getDateLocale = (): Locale | undefined => {
    switch (locale) {
      case 'th': return th;
      case 'ja': return ja;
      case 'zh': return zhCN;
      default: return undefined;
    }
  };
  
  // Format last sync time
  const formatLastSyncTime = () => {
    if (!lastSyncTime) return t.neverSynced;
    
    return formatDistanceToNow(new Date(lastSyncTime), { 
      addSuffix: true,
      locale: getDateLocale() 
    });
  };
  
  // Format countdown time
  const formatCountdownTime = () => {
    const minutes = Math.floor(cooldownTime / 60);
    const seconds = cooldownTime % 60;
    
    if (minutes > 0) {
      return `${minutes} ${t.minutes} ${seconds} ${t.seconds}`;
    }
    
    return `${seconds} ${t.seconds}`;
  };
  
  // Simulate sync operation
  const handleSync = () => {
    // Check if user is logged in
    if (status !== "authenticated") {
      toast({
        title: t.syncLoginRequired,
        description: t.loginToSync,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Check if online
    if (!isOnline) {
      toast({
        title: t.offline,
        description: t.syncError,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Implement cooldown logic
    if (lastSyncTime) {
      const lastSync = new Date(lastSyncTime);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);
      
      // If last sync was less than 5 minutes ago, show cooldown
      if (diffMinutes < 5) {
        const remainingMinutes = Math.ceil(5 - diffMinutes);
        setSyncCooldown(true);
        setCooldownTime(remainingMinutes * 60);
        toast({
          title: t.syncTooFrequent,
          description: t.syncWaitMessage.replace("{minutes}", remainingMinutes.toString()),
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
    }
    
    setIsSyncing(true);
    
    // Simulate sync delay
    setTimeout(() => {
      // Set last sync time
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('last-sync-time', now);
      
      setIsSyncing(false);
      
      toast({
        title: t.syncComplete,
        description: t.syncSuccess,
        duration: 3000,
      });
    }, 2000);
  };
  
  // Handle sync reset
  const handleResetSync = () => {
    // Clear sync history
    localStorage.removeItem('last-sync-time');
    setLastSyncTime(null);
    
    toast({
      title: "Sync history reset",
      duration: 3000,
    });
    
    setShowResetDialog(false);
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
          <h1 className="text-xl font-extrabold">{t.syncSettings}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
        </div>
      </div>
      
      <motion.div variants={item} className="space-y-4">
        {/* Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {isOnline ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              {t.connectionStatus}
            </CardTitle>
            <CardDescription>
              {isOnline ? t.online : t.offline}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <span>{t.lastSync}</span>
              </div>
              <span className="font-medium">{formatLastSyncTime()}</span>
            </div>
            
            <Button 
              onClick={handleSync} 
              disabled={isSyncing || !isOnline || syncCooldown}
              className="w-full"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t.syncing}
                </>
              ) : syncCooldown ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  {formatCountdownTime()}
                </>
              ) : (
                <>
                  <Cloud className="h-4 w-4 mr-2" />
                  {t.syncNow}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Auto Sync Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              {t.autoSync}
            </CardTitle>
            <CardDescription>
              {t.enableAutoSync}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>{t.autoSync}</span>
              <Switch 
                checked={autoSync} 
                onCheckedChange={handleAutoSyncToggle}
                disabled={!isOnline || status !== "authenticated"}
              />
            </div>
            
            {autoSync && (
              <div className="space-y-2">
                <div className="text-sm font-medium">{t.syncFrequency}</div>
                <div className="flex gap-2">
                  <Button 
                    variant={syncFrequency === "hourly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSyncFrequencyChange("hourly")}
                    className="flex-1"
                  >
                    {t.hourly}
                  </Button>
                  <Button 
                    variant={syncFrequency === "daily" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSyncFrequencyChange("daily")}
                    className="flex-1"
                  >
                    {t.daily}
                  </Button>
                  <Button 
                    variant={syncFrequency === "weekly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSyncFrequencyChange("weekly")}
                    className="flex-1"
                  >
                    {t.weekly}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Reset Sync Card */}
        <Card className="border-[hsl(var(--destructive)/15)] bg-[hsl(var(--destructive)/3)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-[hsl(var(--destructive))]">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--destructive))]" />
              {t.resetSync}
            </CardTitle>
            <CardDescription className="text-[hsl(var(--destructive)/80)]">
              {t.resetSyncDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                >
                  {t.resetSync}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.resetConfirm}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.resetMessage}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetSync}>
                    {t.confirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
        
        {/* Sync Tip */}
        <div className="bg-[hsl(var(--muted))] p-4 rounded-lg text-sm text-center text-[hsl(var(--muted-foreground))]">
          {t.syncTip}
        </div>
      </motion.div>
    </motion.div>
  );
} 