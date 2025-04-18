// Minimal version to pass build
export interface IFoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servingSize: string;
  favorite: boolean;
  createdAt: Date;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other';
  usdaId?: number;
  brandName?: string;
  ingredients?: string;
  dataType?: string;
  mealCategory?: string;
  lastModified?: string;
}

export interface IMealEntry {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItem: IFoodItem;
  quantity: number;
  date: string;
  lastModified?: string;
}

export interface IDailyLog {
  date: string;
  meals: IMealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number;
  moodRating?: number;
  notes?: string;
  weight?: number;
  lastModified?: string;
}

export interface INutritionData {
  userId: string;
  dailyLogs: Record<string, IDailyLog>;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
    weight?: number;
    lastModified?: string;
  };
  favoriteFoods: IFoodItem[];
  updatedAt?: string;
}

import mongoose from 'mongoose';
const { Schema } = mongoose;

// ตรวจสอบว่ามี model นี้ถูกสร้างไว้แล้วหรือไม่
const NutritionModel = mongoose.models.Nutrition || mongoose.model('Nutrition', new Schema({
  userId: { type: String, required: true },
  dailyLogs: { type: Schema.Types.Mixed, default: {} },
  goals: {
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 120 },
    carbs: { type: Number, default: 250 },
    fat: { type: Number, default: 65 },
    water: { type: Number, default: 2000 },
    weight: { type: Number },
    lastModified: { type: String }
  },
  favoriteFoods: { type: [Schema.Types.Mixed], default: [] },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true }));

export default NutritionModel; 