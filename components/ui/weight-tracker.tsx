"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, Plus, Minus, Edit, Check, X, ChevronDown } from 'lucide-react';
import { useNutritionStore } from '@/lib/store/nutrition-store';
import { useLanguage } from '@/components/providers/language-provider';
import { format, parseISO } from 'date-fns';
import { th, ja, zhCN } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Animation variants
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

// Define translations
const translations = {
  en: {
    weight: {
      title: "Weight Tracker",
      current: "Current",
      goal: "Goal",
      add: "Add Weight",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      kg: "kg",
      lb: "lb",
      history: "Weight History",
      noData: "No weight data yet. Add your first entry!",
      periods: {
        "30d": "30 Days",
        "180d": "6 Months",
        "365d": "1 Year",
        "all": "All Time"
      },
      chartTitle: "Weight Progress",
      increase: "increase",
      decrease: "decrease",
      same: "no change",
      from: "from",
      addFirst: "Add your weight",
      lastUpdated: "Last updated",
      updateToday: "Update today",
      note: "Note (optional)",
      addNote: "Add a note about this weight...",
      targetWeight: "Target Weight"
    }
  },
  th: {
    weight: {
      title: "ติดตามน้ำหนัก",
      current: "ปัจจุบัน",
      goal: "เป้าหมาย",
      add: "เพิ่มน้ำหนัก",
      edit: "แก้ไข",
      save: "บันทึก",
      cancel: "ยกเลิก",
      kg: "กก.",
      lb: "ปอนด์",
      history: "ประวัติน้ำหนัก",
      noData: "ยังไม่มีข้อมูลน้ำหนัก เพิ่มรายการแรกของคุณ!",
      periods: {
        "30d": "30 วัน",
        "180d": "6 เดือน",
        "365d": "1 ปี",
        "all": "ทั้งหมด"
      },
      chartTitle: "ความคืบหน้าน้ำหนัก",
      increase: "เพิ่มขึ้น",
      decrease: "ลดลง",
      same: "ไม่เปลี่ยนแปลง",
      from: "จาก",
      addFirst: "เพิ่มน้ำหนักของคุณ",
      lastUpdated: "อัพเดทล่าสุด",
      updateToday: "อัพเดทวันนี้",
      note: "บันทึก (ไม่บังคับ)",
      addNote: "เพิ่มบันทึกเกี่ยวกับน้ำหนักนี้...",
      targetWeight: "น้ำหนักเป้าหมาย"
    }
  },
  ja: {
    weight: {
      title: "体重トラッカー",
      current: "現在",
      goal: "目標",
      add: "体重を追加",
      edit: "編集",
      save: "保存",
      cancel: "キャンセル",
      kg: "kg",
      lb: "ポンド",
      history: "体重履歴",
      noData: "体重データがまだありません。最初のエントリを追加してください！",
      periods: {
        "30d": "30日",
        "180d": "6ヶ月",
        "365d": "1年",
        "all": "全期間"
      },
      chartTitle: "体重の進捗",
      increase: "増加",
      decrease: "減少",
      same: "変化なし",
      from: "から",
      addFirst: "体重を追加する",
      lastUpdated: "最終更新",
      updateToday: "今日更新",
      note: "メモ（任意）",
      addNote: "この体重についてのメモを追加...",
      targetWeight: "目標体重"
    }
  },
  zh: {
    weight: {
      title: "体重追踪",
      current: "当前",
      goal: "目标",
      add: "添加体重",
      edit: "编辑",
      save: "保存",
      cancel: "取消",
      kg: "公斤",
      lb: "磅",
      history: "体重历史",
      noData: "还没有体重数据。添加您的第一条记录！",
      periods: {
        "30d": "30天",
        "180d": "6个月",
        "365d": "1年",
        "all": "全部"
      },
      chartTitle: "体重进度",
      increase: "增加",
      decrease: "减少",
      same: "无变化",
      from: "从",
      addFirst: "添加您的体重",
      lastUpdated: "最后更新",
      updateToday: "今日更新",
      note: "备注（可选）",
      addNote: "添加关于此体重的备注...",
      targetWeight: "目标体重"
    }
  }
};

interface WeightTrackerProps {
  date: string;
}

export function WeightTracker({ date }: WeightTrackerProps) {
  const { locale } = useLanguage();
  const { 
    addWeightEntry, 
    updateWeightEntry, 
    getWeightEntry, 
    getWeightEntries,
    getWeightGoal,
    updateGoals
  } = useNutritionStore();
  
  // Get translations based on locale
  const t = translations[locale as keyof typeof translations]?.weight || translations.en.weight;
  
  // State for weight input and editing
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [goalWeightInput, setGoalWeightInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  
  // Get current weight data
  const currentEntry = getWeightEntry(date);
  const weightGoal = getWeightGoal();
  
  // Get all weight entries for chart
  const allEntries = getWeightEntries();
  
  // Find the previous weight entry for comparison
  const previousEntry = allEntries.find(entry => {
    const entryDate = parseISO(entry.date);
    const currentDate = parseISO(date);
    return entryDate < currentDate;
  });
  
  // Calculate weight change
  const currentWeight = currentEntry?.weight;
  const previousWeight = previousEntry?.weight;
  const weightChange = currentWeight && previousWeight
    ? parseFloat((currentWeight - previousWeight).toFixed(1))
    : 0;
  
  const weightChangeText = weightChange === 0
    ? t.same
    : weightChange > 0
      ? `${weightChange} ${t.kg} ${t.increase}`
      : `${Math.abs(weightChange)} ${t.kg} ${t.decrease}`;
  
  // Initialize inputs when data changes
  useEffect(() => {
    if (currentEntry) {
      setWeightInput(currentEntry.weight.toString());
      setNoteInput(currentEntry.note || '');
    } else {
      setWeightInput('');
      setNoteInput('');
    }
    
    if (weightGoal) {
      setGoalWeightInput(weightGoal.toString());
    }
  }, [currentEntry, weightGoal]);
  
  // Handle save weight
  const handleSaveWeight = () => {
    const weight = parseFloat(weightInput);
    if (!isNaN(weight) && weight > 0) {
      updateWeightEntry(date, weight, noteInput || undefined);
      setIsEditing(false);
    }
  };
  
  // Handle save goal weight
  const handleSaveGoalWeight = () => {
    const weight = parseFloat(goalWeightInput);
    if (!isNaN(weight) && weight > 0) {
      updateGoals({ weight });
      setIsEditingGoal(false);
    }
  };
  
  // Get formatted date for display
  const getFormattedDate = (dateString: string) => {
    const getDateLocale = () => {
      switch (locale) {
        case 'th': return th;
        case 'ja': return ja;
        case 'zh': return zhCN;
        default: return undefined;
      }
    };
    
    return format(parseISO(dateString), 'PP', { locale: getDateLocale() });
  };

  return (
    <Card className="p-5 shadow-md rounded-2xl">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {/* Header */}
        <motion.div variants={item} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-emerald-500 rounded-full flex items-center justify-center text-white">
              <Scale className="h-5 w-5" />
            </div>
            <h2 className="text-base font-medium text-[hsl(var(--foreground))]">{t.title}</h2>
          </div>
          
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-7 px-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t.add}
            </Button>
          )}
        </motion.div>
        
        {/* Current Weight Display */}
        <motion.div variants={item}>
          {!isEditing && currentEntry ? (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-[hsl(var(--muted-foreground))]">{t.current}</div>
                <div className="text-xl font-bold text-[hsl(var(--foreground))]">
                  {currentEntry.weight} <span className="text-lg font-normal">{t.kg}</span>
                </div>
                
                {previousEntry && (
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    {weightChangeText} {t.from} {getFormattedDate(previousEntry.date)}
                  </div>
                )}
                
                {currentEntry.note && (
                  <div className="mt-2 p-2 bg-[hsl(var(--muted))]/10 rounded-md text-sm italic">
                    {currentEntry.note}
                  </div>
                )}
              </div>
              
              <div className="text-right space-y-1">
                <div className="text-sm text-[hsl(var(--muted-foreground))]">{t.goal}</div>
                {isEditingGoal ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={goalWeightInput}
                      onChange={(e) => setGoalWeightInput(e.target.value)}
                      className="w-16 h-7 text-sm"
                      step="0.1"
                    />
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingGoal(false)}
                        className="h-7 w-7 p-0 rounded-full"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleSaveGoalWeight}
                        className="h-7 w-7 p-0 rounded-full"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex items-center justify-end space-x-1 cursor-pointer" 
                    onClick={() => setIsEditingGoal(true)}
                  >
                    <div className="text-xl font-semibold text-[hsl(var(--primary))]">
                      {weightGoal} <span className="text-sm font-normal">{t.kg}</span>
                    </div>
                    <Edit className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                  </div>
                )}
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t.targetWeight}
                </div>
              </div>
            </div>
          ) : isEditing && date ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">{t.current}</div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      const currentValue = parseFloat(weightInput) || 0;
                      setWeightInput((currentValue - 0.1).toFixed(1));
                    }}
                    className="h-8 w-8 rounded-full"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="flex-1 text-center"
                    step="0.1"
                    placeholder={t.kg.toString()}
                  />
                  
                  <Button
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      const currentValue = parseFloat(weightInput) || 0;
                      setWeightInput((currentValue + 0.1).toFixed(1));
                    }}
                    className="h-8 w-8 rounded-full"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">{t.note}</div>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full p-2 rounded-md text-sm bg-[hsl(var(--muted))]/10 border-none h-20"
                  placeholder={t.addNote}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  {t.cancel}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveWeight}
                >
                  {t.save}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="text-[hsl(var(--muted-foreground))] text-sm">{t.noData}</div>
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t.addFirst}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </Card>
  );
} 