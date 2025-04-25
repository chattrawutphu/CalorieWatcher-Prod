"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Upload, Trash2, RefreshCw, Clock, Download, UploadCloud, AlertTriangle, Loader2, FileDown, FileUp } from "lucide-react";
import { useWaterStore } from "@/lib/store/water-store";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useWeightStore } from "@/lib/store/weight-store";
import { useFoodLogStore } from "@/lib/store/food-log-store";

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

export default function DataSettingsPage() {
  const { locale } = useLanguage();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetTimerId, setResetTimerId] = useState<NodeJS.Timeout | null>(null);
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Access to the stores for data operations
  const waterStore = useWaterStore();
  const nutritionStore = useNutritionStore();
  const weightStore = useWeightStore();
  const foodLogStore = useFoodLogStore();
  
  // Simplified translations for this page
  const translations = {
    en: {
      dataManagement: "Data Management",
      exportData: "Export Data",
      importData: "Import Data",
      resetData: "Reset All Data",
      backup: "Backup all your data to a file",
      restore: "Restore data from a backup file",
      resetWarning: "This will permanently erase all your data",
      exportDesc: "Save all your app data as a JSON file",
      importDesc: "Import data from a previously exported file",
      resetDesc: "Erase all your data and reset the app",
      confirm: "Confirm",
      cancel: "Cancel",
      resetTitle: "Reset all data?",
      resetConfirmMessage: "This action cannot be undone. All your data, including food logs, water intake records, and weight history will be permanently erased.",
      exporting: "Exporting...",
      importing: "Importing...",
      resetting: "Resetting...",
      exported: "Data exported successfully",
      imported: "Data imported successfully",
      reset: "Data reset successfully",
      back: "Back",
      resetConfirmation: "Type 'reset' to confirm",
      lastBackup: "Last backup",
      errorImport: "Error importing data. Invalid file format.",
      description: "Export, import or reset your app data"
    },
    th: {
      dataManagement: "จัดการข้อมูล",
      exportData: "ส่งออกข้อมูล",
      importData: "นำเข้าข้อมูล",
      resetData: "รีเซ็ตข้อมูลทั้งหมด",
      backup: "สำรองข้อมูลทั้งหมดเป็นไฟล์",
      restore: "กู้คืนข้อมูลจากไฟล์ที่สำรองไว้",
      resetWarning: "การดำเนินการนี้จะลบข้อมูลทั้งหมดอย่างถาวร",
      exportDesc: "บันทึกข้อมูลทั้งหมดเป็นไฟล์ JSON",
      importDesc: "นำเข้าข้อมูลจากไฟล์ที่ส่งออกไว้ก่อนหน้านี้",
      resetDesc: "ลบข้อมูลทั้งหมดและรีเซ็ตแอป",
      confirm: "ยืนยัน",
      cancel: "ยกเลิก",
      resetTitle: "รีเซ็ตข้อมูลทั้งหมด?",
      resetConfirmMessage: "การกระทำนี้ไม่สามารถยกเลิกได้ ข้อมูลทั้งหมดของคุณ รวมถึงบันทึกอาหาร บันทึกการดื่มน้ำ และประวัติน้ำหนักจะถูกลบอย่างถาวร",
      exporting: "กำลังส่งออก...",
      importing: "กำลังนำเข้า...",
      resetting: "กำลังรีเซ็ต...",
      exported: "ส่งออกข้อมูลสำเร็จ",
      imported: "นำเข้าข้อมูลสำเร็จ",
      reset: "รีเซ็ตข้อมูลสำเร็จ",
      back: "กลับ",
      resetConfirmation: "พิมพ์ 'reset' เพื่อยืนยัน",
      lastBackup: "สำรองข้อมูลล่าสุด",
      errorImport: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล รูปแบบไฟล์ไม่ถูกต้อง",
      description: "ส่งออก นำเข้า หรือรีเซ็ตข้อมูลแอป"
    },
    ja: {
      dataManagement: "データ管理",
      exportData: "データのエクスポート",
      importData: "データのインポート",
      resetData: "全データをリセット",
      backup: "すべてのデータをファイルにバックアップ",
      restore: "バックアップファイルからデータを復元",
      resetWarning: "これによりすべてのデータが完全に消去されます",
      exportDesc: "すべてのアプリデータをJSONファイルとして保存",
      importDesc: "以前にエクスポートしたファイルからデータをインポート",
      resetDesc: "すべてのデータを消去してアプリをリセット",
      confirm: "確認",
      cancel: "キャンセル",
      resetTitle: "すべてのデータをリセットしますか？",
      resetConfirmMessage: "このアクションは元に戻せません。食事記録、水分摂取記録、体重履歴など、すべてのデータが完全に消去されます。",
      exporting: "エクスポート中...",
      importing: "インポート中...",
      resetting: "リセット中...",
      exported: "データが正常にエクスポートされました",
      imported: "データが正常にインポートされました",
      reset: "データが正常にリセットされました",
      back: "戻る",
      resetConfirmation: "確認するには「reset」と入力してください",
      lastBackup: "最後のバックアップ",
      errorImport: "データのインポート中にエラーが発生しました。無効なファイル形式です。",
      description: "アプリデータのエクスポート、インポート、またはリセット"
    },
    zh: {
      dataManagement: "数据管理",
      exportData: "导出数据",
      importData: "导入数据",
      resetData: "重置所有数据",
      backup: "将所有数据备份到文件",
      restore: "从备份文件恢复数据",
      resetWarning: "这将永久删除您的所有数据",
      exportDesc: "将所有应用数据保存为JSON文件",
      importDesc: "从之前导出的文件导入数据",
      resetDesc: "删除所有数据并重置应用",
      confirm: "确认",
      cancel: "取消",
      resetTitle: "重置所有数据？",
      resetConfirmMessage: "此操作无法撤销。您的所有数据，包括食物日志、饮水记录和体重历史记录将被永久删除。",
      exporting: "导出中...",
      importing: "导入中...",
      resetting: "重置中...",
      exported: "数据导出成功",
      imported: "数据导入成功",
      reset: "数据重置成功",
      back: "返回",
      resetConfirmation: "输入'reset'确认",
      lastBackup: "上次备份",
      errorImport: "导入数据时出错。文件格式无效。",
      description: "导出、导入或重置应用数据"
    }
  };
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  // Handler for exporting data
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      // Collect data from all stores
      const exportData = {
        water: waterStore.getState(),
        nutrition: {
          goals: nutritionStore.goals,
          dailyLogs: nutritionStore.dailyLogs,
          currentDate: nutritionStore.currentDate
        },
        weight: weightStore.getState(),
        foodLog: foodLogStore.getState(),
        exportDate: new Date().toISOString(),
        appVersion: "1.0.0", // Add app version for compatibility checks
      };
      
      // Convert to JSON string
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      // Setup download attributes
      const date = new Date().toISOString().split("T")[0];
      link.download = `calorie-watcher-backup-${date}.json`;
      link.href = url;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Update local storage with last backup date
      localStorage.setItem("lastBackupDate", new Date().toISOString());
      
      // Show success toast
      toast({
        title: t.exported,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handler for importing data
  const handleImportData = () => {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    
    // Handle file selection
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;
      
      try {
        setIsImporting(true);
        
        // Read file contents
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          try {
            const jsonData = JSON.parse(event.target?.result as string);
            
            // Basic validation
            if (!jsonData.water || !jsonData.nutrition || !jsonData.weight || !jsonData.foodLog) {
              throw new Error("Invalid data format");
            }
            
            // Apply data to stores - using individual field updates instead of setState
            // This approach is more compatible and safer
            
            // Water Store
            if (jsonData.water) {
              if (jsonData.water.goal) {
                waterStore.updateWaterGoal(jsonData.water.goal);
              }
              
              // Reset current data
              waterStore.reset();
              
              // Import daily water intake if available
              if (jsonData.water.dailyWaterIntake) {
                Object.entries(jsonData.water.dailyWaterIntake).forEach(([date, amount]) => {
                  if (typeof amount === 'number' && amount > 0) {
                    waterStore.addWaterIntake(date, amount);
                  }
                });
              }
            }
            
            // Nutrition Store
            if (jsonData.nutrition) {
              if (jsonData.nutrition.goals) {
                await nutritionStore.updateGoals(jsonData.nutrition.goals);
              }
              
              if (jsonData.nutrition.currentDate) {
                nutritionStore.setCurrentDate(jsonData.nutrition.currentDate);
              }
              
              // For daily logs, we'd need dedicated import methods
            }
            
            // Weight Store
            if (jsonData.weight) {
              // Reset weight data
              weightStore.reset();
              
              // Import weight goal
              if (jsonData.weight.goal) {
                weightStore.updateWeightGoal(jsonData.weight.goal);
              }
              
              // Import weight entries
              if (jsonData.weight.weightEntries && Array.isArray(jsonData.weight.weightEntries)) {
                jsonData.weight.weightEntries.forEach((entry: any) => {
                  if (entry && entry.date && entry.weight) {
                    weightStore.addWeightEntry({
                      date: entry.date,
                      weight: entry.weight,
                      note: entry.note
                    });
                  }
                });
              }
            }
            
            // Food Log Store
            if (jsonData.foodLog) {
              // Reset food log data
              foodLogStore.reset();
              
              // Set current date
              if (jsonData.foodLog.currentDate) {
                foodLogStore.setCurrentDate(jsonData.foodLog.currentDate);
              }
              
              // Import daily logs
              if (jsonData.foodLog.dailyLogs) {
                Object.entries(jsonData.foodLog.dailyLogs).forEach(([date, log]: [string, any]) => {
                  // Import mood & notes
                  if (log.moodRating) {
                    foodLogStore.updateDailyMood(date, log.moodRating, log.notes);
                  }
                  
                  // Import meals
                  if (log.meals && Array.isArray(log.meals)) {
                    log.meals.forEach((meal: any) => {
                      if (meal && meal.foodItem) {
                        foodLogStore.addMeal(meal);
                      }
                    });
                  }
                });
              }
            }
            
            // Show success toast
            toast({
              title: t.imported,
              duration: 3000,
            });
            
            // Force a navigation to refresh the UI
            router.refresh();
          } catch (error) {
            console.error("Error parsing imported data:", error);
            toast({
              title: t.errorImport,
              variant: "destructive",
              duration: 3000,
            });
          } finally {
            setIsImporting(false);
          }
        };
        
        reader.readAsText(file);
      } catch (error) {
        console.error("Error importing data:", error);
        setIsImporting(false);
        toast({
          title: "Import failed",
          variant: "destructive",
          duration: 3000,
        });
      }
    };
    
    // Trigger file selection dialog
    fileInput.click();
  };
  
  // Handler for resetting all data
  const handleResetData = async () => {
    try {
      setIsResetting(true);
      
      // Reset all stores
      await waterStore.reset();
      
      // Nutrition store might not have reset, so handle it differently
      // Reset goals to defaults
      await nutritionStore.updateGoals({
        calories: 2000,
        protein: 125, // 25% of calories
        carbs: 250,   // 50% of calories
        fat: 55,      // 25% of calories
        water: 2000
      });
      
      // Clear today's data
      if (nutritionStore.clearTodayData) {
        nutritionStore.clearTodayData();
      }
      
      await weightStore.reset();
      await foodLogStore.reset();
      
      // Show success toast
      toast({
        title: t.reset,
        duration: 3000,
      });
      
      // Force a navigation to refresh the UI
      router.refresh();
    } catch (error) {
      console.error("Error resetting data:", error);
      toast({
        title: "Reset failed",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  // Get the last backup date from local storage
  const lastBackupDate = typeof window !== 'undefined' 
    ? localStorage.getItem("lastBackupDate") 
    : null;
  
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
          <h1 className="text-xl font-extrabold">{t.dataManagement}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
        </div>
      </div>
      
      <motion.div variants={item} className="space-y-4">
        {/* Export Data Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileDown className="h-4 w-4 text-blue-500" />
              {t.exportData}
            </CardTitle>
            <CardDescription>{t.exportDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {lastBackupDate && (
                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <Clock className="h-3 w-3" />
                  <span>
                    {t.lastBackup}: {new Date(lastBackupDate).toLocaleDateString(locale, { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              
              <Button 
                onClick={handleExportData} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.exporting}
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    {t.exportData}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Import Data Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileUp className="h-4 w-4 text-green-500" />
              {t.importData}
            </CardTitle>
            <CardDescription>{t.importDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleImportData} 
              disabled={isImporting}
              className="w-full"
              variant="outline"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.importing}
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4 mr-2" />
                  {t.importData}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Reset Data Card */}
        <Card className="border-[hsl(var(--destructive)/15)] bg-[hsl(var(--destructive)/3)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-[hsl(var(--destructive))]">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--destructive))]" />
              {t.resetData}
            </CardTitle>
            <CardDescription className="text-[hsl(var(--destructive)/80)]">
              {t.resetDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.resetting}
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t.resetData}
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.resetTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.resetConfirmMessage}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetData}>
                    {t.confirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 