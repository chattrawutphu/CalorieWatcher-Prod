import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplet, Plus, Minus, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNutritionStore } from '@/lib/store/nutrition-store';
import { useLanguage } from '@/components/providers/language-provider';

// Define translations
const translations = {
  en: {
    water: {
      title: "Water Intake",
      completed: "completed",
      reset: "Reset",
      add: "Add",
      goal: "Goal",
      today: "Today",
      ml: "ml"
    }
  },
  th: {
    water: {
      title: "การดื่มน้ำ",
      completed: "สำเร็จแล้ว",
      reset: "รีเซ็ต",
      add: "เพิ่ม",
      goal: "เป้าหมาย",
      today: "วันนี้",
      ml: "มล."
    }
  },
  ja: {
    water: {
      title: "水分摂取量",
      completed: "完了",
      reset: "リセット",
      add: "追加",
      goal: "目標",
      today: "今日",
      ml: "ml"
    }
  },
  zh: {
    water: {
      title: "饮水量",
      completed: "已完成",
      reset: "重置",
      add: "添加",
      goal: "目标",
      today: "今天",
      ml: "毫升"
    }
  }
};

export function WaterTracker({ date }: { date: string }) {
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations]?.water || translations.en.water;
  const { addWaterIntake, resetWaterIntake, getWaterIntake, getWaterGoal } = useNutritionStore();
  const waterIntake = getWaterIntake(date) || 0;
  const waterGoal = getWaterGoal() || 2000; // Default 2000ml if not set
  const percentage = waterGoal > 0 ? Math.min(Math.round((waterIntake / waterGoal) * 100), 100) : 0;
  const [customAmount, setCustomAmount] = useState(250);

  const handleAddWater = (amount: number) => {
    addWaterIntake(date, amount);
  };

  const handleResetWater = () => {
    resetWaterIntake(date);
  };

  const handleIncrement = () => {
    setCustomAmount(prev => prev + 50);
  };

  const handleDecrement = () => {
    setCustomAmount(prev => Math.max(50, prev - 50));
  };

  // Generate a nice gradient color based on percentage
  const getWaterGradient = () => {
    if (percentage >= 100) {
      return 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))';
    } else {
      return 'linear-gradient(135deg, hsl(var(--primary)/0.8), hsl(var(--primary)/0.6))';
    }
  };

  return (
    <Card className='p-5 shadow-md rounded-2xl overflow-hidden'>
      <div className="space-y-4">
        {/* Header - Elegant design */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[hsl(var(--accent))]/10 rounded-full flex items-center justify-center">
              <Droplet className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-base font-medium text-[hsl(var(--foreground))]">{t.title}</h2>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleResetWater}
            title={t.reset}
            className="rounded-full h-7 w-7 p-0 flex items-center justify-center group transition-all duration-300 hover:bg-[hsl(var(--primary))/0.15] hover:scale-105 active:scale-95 shadow-sm hover:shadow border border-transparent hover:border-[hsl(var(--primary))/0.3]"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" />
            <span className="sr-only">{t.reset}</span>
          </Button>
        </div>

        {/* Main display - Beautiful visualization */}
        <div className="relative flex items-center justify-center my-3">
          <div 
            className="w-[120px] h-[120px] rounded-full flex items-center justify-center relative"
            style={{
              background: 'hsl(var(--muted)/0.3)',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
            }}
          >
            <div 
              className="absolute bottom-0 left-0 right-0 rounded-b-full overflow-hidden transition-all duration-1000 ease-out"
              style={{ 
                height: `${percentage}%`,
                background: getWaterGradient()
              }}
            />
            <div className="relative z-10 text-center">
              <div className="text-xl font-bold text-[hsl(var(--foreground))]">
                {Math.round(percentage)}%
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                {waterIntake}/{waterGoal} {t.ml}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar - Consistent with other widgets */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[hsl(var(--muted-foreground))]">
              {t.today}
            </span>
            <span className="font-medium text-[hsl(var(--primary))]">
              {percentage}% {t.completed}
            </span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2" 
          />
        </div>

        {/* Custom Amount - Elegant and Simple */}
        <div className="flex items-center space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleDecrement}
            className="h-8 w-8 rounded-full"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          
          <div className="flex-1 px-3 py-1.5 border rounded-md text-center bg-[hsl(var(--background))] text-sm">
            {customAmount} {t.ml}
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleIncrement}
            className="h-8 w-8 rounded-full"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          
          <Button 
            onClick={() => handleAddWater(customAmount)}
            className="rounded-full py-1 px-4 h-8 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.9]"
            size="sm"
          >
            {t.add}
          </Button>
        </div>
      </div>
    </Card>
  );
} 