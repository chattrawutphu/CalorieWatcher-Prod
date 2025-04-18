// Simple food database for the app
// This would normally come from an API or database
export interface FoodDatabaseItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servingSize: string;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other';
}

export const FoodDatabase: FoodDatabaseItem[] = [
  {
    id: "1",
    name: "Grilled Chicken Breast",
    calories: 165,
    protein: 31,
    fat: 3.6,
    carbs: 0,
    servingSize: "100g",
    category: "protein"
  },
  {
    id: "2",
    name: "Salmon Fillet",
    calories: 206,
    protein: 22,
    fat: 13,
    carbs: 0,
    servingSize: "100g",
    category: "protein"
  },
  {
    id: "3",
    name: "Brown Rice",
    calories: 112,
    protein: 2.6,
    fat: 0.9,
    carbs: 23,
    servingSize: "100g cooked",
    category: "grain"
  },
  {
    id: "4",
    name: "Broccoli",
    calories: 34,
    protein: 2.8,
    fat: 0.4,
    carbs: 6.6,
    servingSize: "100g",
    category: "vegetable"
  },
  {
    id: "5",
    name: "Avocado",
    calories: 160,
    protein: 2,
    fat: 15,
    carbs: 9,
    servingSize: "100g",
    category: "fruit"
  },
  {
    id: "6",
    name: "Eggs",
    calories: 155,
    protein: 13,
    fat: 11,
    carbs: 1.1,
    servingSize: "2 large eggs",
    category: "protein"
  },
  {
    id: "7",
    name: "Greek Yogurt",
    calories: 59,
    protein: 10,
    fat: 0.4,
    carbs: 3.6,
    servingSize: "100g",
    category: "dairy"
  },
  {
    id: "8",
    name: "Banana",
    calories: 89,
    protein: 1.1,
    fat: 0.3,
    carbs: 23,
    servingSize: "1 medium",
    category: "fruit"
  },
  {
    id: "9",
    name: "Pasta",
    calories: 158,
    protein: 5.8,
    fat: 0.9,
    carbs: 31,
    servingSize: "100g cooked",
    category: "grain"
  },
  {
    id: "10",
    name: "Almonds",
    calories: 579,
    protein: 21,
    fat: 49,
    carbs: 22,
    servingSize: "100g",
    category: "snack"
  },
  {
    id: "11",
    name: "Sweet Potato",
    calories: 86,
    protein: 1.6,
    fat: 0.1,
    carbs: 20,
    servingSize: "100g",
    category: "vegetable"
  },
  {
    id: "12",
    name: "Quinoa",
    calories: 120,
    protein: 4.4,
    fat: 1.9,
    carbs: 21,
    servingSize: "100g cooked",
    category: "grain"
  },
  {
    id: "13",
    name: "Spinach",
    calories: 23,
    protein: 2.9,
    fat: 0.4,
    carbs: 3.6,
    servingSize: "100g",
    category: "vegetable"
  },
  {
    id: "14",
    name: "Apple",
    calories: 52,
    protein: 0.3,
    fat: 0.2,
    carbs: 14,
    servingSize: "1 medium",
    category: "fruit"
  },
  {
    id: "15",
    name: "Oatmeal",
    calories: 68,
    protein: 2.4,
    fat: 1.4,
    carbs: 12,
    servingSize: "100g cooked",
    category: "grain"
  },
  {
    id: "16",
    name: "Tofu",
    calories: 76,
    protein: 8,
    fat: 4.8,
    carbs: 1.9,
    servingSize: "100g",
    category: "protein"
  },
  {
    id: "17",
    name: "Orange",
    calories: 47,
    protein: 0.9,
    fat: 0.1,
    carbs: 12,
    servingSize: "1 medium",
    category: "fruit"
  },
  {
    id: "18",
    name: "Whole Wheat Bread",
    calories: 247,
    protein: 13,
    fat: 3.4,
    carbs: 41,
    servingSize: "100g (about 2 slices)",
    category: "grain"
  },
  {
    id: "19",
    name: "Coffee",
    calories: 2,
    protein: 0.3,
    fat: 0,
    carbs: 0,
    servingSize: "240ml (1 cup)",
    category: "beverage"
  },
  {
    id: "20",
    name: "Milk",
    calories: 42,
    protein: 3.4,
    fat: 1,
    carbs: 5,
    servingSize: "100ml",
    category: "dairy"
  },
  // Thai foods
  {
    id: "21",
    name: "Pad Thai",
    calories: 350,
    protein: 12,
    fat: 9,
    carbs: 55,
    servingSize: "1 plate",
    category: "other"
  },
  {
    id: "22",
    name: "Green Curry",
    calories: 315,
    protein: 8,
    fat: 25,
    carbs: 15,
    servingSize: "1 bowl",
    category: "other"
  },
  // Japanese foods
  {
    id: "23",
    name: "Sushi Roll",
    calories: 255,
    protein: 9,
    fat: 7,
    carbs: 38,
    servingSize: "6 pieces",
    category: "other"
  },
  {
    id: "24",
    name: "Miso Soup",
    calories: 84,
    protein: 6,
    fat: 3,
    carbs: 9,
    servingSize: "1 bowl",
    category: "other"
  },
  // Chinese foods
  {
    id: "25",
    name: "Kung Pao Chicken",
    calories: 348,
    protein: 28,
    fat: 19,
    carbs: 12,
    servingSize: "1 serving",
    category: "other"
  },
  {
    id: "26",
    name: "Fried Rice",
    calories: 238,
    protein: 6,
    fat: 8,
    carbs: 35,
    servingSize: "1 cup",
    category: "grain"
  }
]; 