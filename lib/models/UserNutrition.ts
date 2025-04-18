// Minimal version to pass build

// Define interfaces for the models
export interface IFoodItem {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servingSize: string;
  favorite: boolean;
  createdAt: Date;
}

export interface IDailyLog {
  date: Date;
  foodItems: Array<{
    foodItem: any;
    quantity: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
  }>;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

export interface IUserNutrition {
  userId: string;
  dailyCalorieGoal: number;
  macroRatios: {
    protein: number;
    fat: number;
    carbs: number;
  };
  favoriteFood: IFoodItem[];
  dailyLogs: IDailyLog[];
  createdAt: Date;
  updatedAt: Date;
}

// Dummy models for build
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UserNutrition: any = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FoodItem: any = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DailyLog: any = {}; 