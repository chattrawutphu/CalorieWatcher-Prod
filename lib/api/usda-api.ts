// USDA FoodData Central API Service
// ต้องการ API key จาก https://fdc.nal.usda.gov/api-key-signup.html

import { FoodItem } from '@/lib/store/nutrition-store';

// ตัวอย่าง API key - ในการใช้งานจริงควรเก็บใน env variables
const API_KEY = 'mLcBnM4rro9dlGOkdLuCRBlmMyh7hv7oaGSmUFRx'; 
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// ประเภทอาหารที่ USDA สนับสนุน
export enum FoodCategory {
  FOUNDATION = 'Foundation',
  SURVEY = 'Survey (FNDDS)',
  BRANDED = 'Branded',
  SR_LEGACY = 'SR Legacy',
  EXPERIMENTAL = 'Experimental',
}

// อินเตอร์เฟซสำหรับผลลัพธ์การค้นหาที่ใช้ใน search-food.tsx
export interface SearchFoodResult {
  fdcId: number;
  description: string;
  dataType?: string;
  foodCategory?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  brandName?: string;
  ingredients?: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName?: string;
    value: number;
  }>;
}

// อินเตอร์เฟซสำหรับการค้นหา
export interface FoodSearchCriteria {
  query: string;
  dataType?: string[]; // เช่น ['Foundation', 'SR Legacy']
  pageSize?: number;
  pageNumber?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  brandOwner?: string;
  requireAllWords?: boolean;
}

// อินเตอร์เฟซสำหรับกลุ่มอาหาร
export interface FoodGroup {
  id: number;
  name: string;
  description?: string;
}

// อินเตอร์เฟซสำหรับข้อมูลอาหาร
export interface USDAFoodItem {
  fdcId: number;
  description: string;
  lowercaseDescription?: string;
  dataType?: string;
  publicationDate?: string;
  foodCategory?: string;
  nutrients?: {
    nutrientId: number;
    nutrientName: string;
    unitName: string;
    value: number;
  }[];
  servingSize?: number;
  servingSizeUnit?: string;
  brandName?: string;
  ingredients?: string;
}

// แปลงจาก USDA Format เป็น Format ที่แอพใช้
export function convertToAppFoodItem(usdaFood: USDAFoodItem): FoodItem {
  // หาค่าโภชนาการหลักจาก nutrients
  const findNutrient = (names: string[], nutrientIds?: number[]) => {
    // ลองค้นหาด้วย nutrient ID ก่อน (แม่นยำกว่า)
    if (nutrientIds && usdaFood.nutrients) {
      for (const id of nutrientIds) {
        const nutrient = usdaFood.nutrients.find(n => n.nutrientId === id);
        if (nutrient) return nutrient.value;
      }
    }
    
    // ถ้าไม่พบด้วย ID ให้ลองค้นหาด้วยชื่อ (มีหลายชื่อที่อาจใช้)
    if (usdaFood.nutrients) {
      for (const name of names) {
        const nutrient = usdaFood.nutrients.find(n => 
          n.nutrientName.toLowerCase().includes(name.toLowerCase())
        );
        if (nutrient) return nutrient.value;
      }
    }
    
    return 0;
  };

  // ค้นหาค่าโภชนาการหลักด้วยชื่อที่หลากหลายและ ID ที่ถูกต้อง
  // USDA nutrient IDs: 
  // 1008 = Energy (kcal)
  // 1003 = Protein (g)
  // 1005 = Carbohydrate (g)
  // 1004 = Total fat (g)
  const calories = findNutrient(['energy', 'calorie', 'calories', 'kcal', 'energy (kcal)', 'energy (atwater general factors)'], [1008]);
  const protein = findNutrient(['protein', 'protein (g)', 'crude protein'], [1003]);
  const carbs = findNutrient(['carbohydrate', 'carbs', 'carbohydrates', 'total carbohydrate', 'carbohydrate, by difference', 'carbohydrate, total'], [1005]);
  const fat = findNutrient(['fat', 'total fat', 'lipid', 'fat (g)', 'total lipid (fat)', 'fat, total'], [1004]);
  
  // Log values for debugging
  console.log('Nutrient values found:', { 
    name: usdaFood.description,
    calories, protein, carbs, fat,
    hasNutrients: !!usdaFood.nutrients,
    nutrientCount: usdaFood.nutrients?.length || 0,
    nutrients: usdaFood.nutrients
  });
  
  // กำหนดขนาดเสิร์ฟ
  const servingSize = usdaFood.servingSize 
    ? `${usdaFood.servingSize} ${usdaFood.servingSizeUnit || 'g'}`
    : '100 g';

  return {
    id: usdaFood.fdcId.toString(),
    name: usdaFood.description,
    calories: calories || 0,
    protein: protein || 0,
    carbs: carbs || 0,
    fat: fat || 0,
    servingSize: servingSize,
    category: (usdaFood.foodCategory?.toLowerCase() || 'other') as any,
    favorite: false,
    createdAt: new Date(),
    usdaId: usdaFood.fdcId,
    brandName: usdaFood.brandName,
    ingredients: usdaFood.ingredients,
    dataType: usdaFood.dataType,
    isTemplate: true
  };
}

// ฟังก์ชันสำหรับค้นหาอาหาร โดยรับพารามิเตอร์เป็น string, page และ pageSize
export async function searchFoods(query: string, pageNumber: number = 1, pageSize: number = 25): Promise<{foods: SearchFoodResult[], totalHits: number}> {
  try {
    // กำหนด dataType เพื่อการค้นหาที่เหมาะสม ให้เน้นวัตถุดิบพื้นฐานก่อน
    const defaultDataTypes = ['Foundation', 'SR Legacy', 'Experimental', 'Survey (FNDDS)', 'Branded'];
    
    // เพิ่มการตรวจสอบว่าต้องการค้นหาวัตถุดิบพื้นฐานหรือไม่
    let dataType = defaultDataTypes;
    
    // เพิ่มพารามิเตอร์ให้ API
    const apiParams = {
      query,
      pageSize: pageSize,
      pageNumber: pageNumber,
      // ร้องขอค่าโภชนาการที่สำคัญเฉพาะ
      nutrients: [1008, 1003, 1004, 1005],
      dataType: dataType,
      sortBy: 'dataType.keyword',  // เรียงตามประเภทข้อมูล เพื่อให้ Foundation มาก่อน
      sortOrder: 'asc'
    };
    
    // ถ้ากำลังค้นหาด้วยชื่อวัตถุดิบทั่วไป (เช่น broccoli, apple) ให้ปรับพารามิเตอร์
    if (query && /^[a-zA-Z]+$/.test(query.trim())) {
      const simpleIngredientSearch = query.trim().toLowerCase();
      const commonIngredients = ['broccoli', 'apple', 'banana', 'rice', 'potato', 'carrot', 'onion', 'beef', 'chicken', 'fish'];
      
      if (commonIngredients.includes(simpleIngredientSearch) || 
          commonIngredients.some(ing => simpleIngredientSearch.includes(ing))) {
        // น่าจะกำลังค้นหาวัตถุดิบพื้นฐาน ให้เน้น Foundation และ SR Legacy
        apiParams.dataType = ['Foundation', 'SR Legacy'];
      }
    }
    
    console.log('Search params:', { 
      query: query,
      dataType: apiParams.dataType,
      sortBy: apiParams.sortBy
    });

    const response = await fetch(`${BASE_URL}/foods/search?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiParams)
    });

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('USDA API response:', {
      totalHits: data.totalHits,
      currentPage: data.currentPage,
      foodCount: data.foods?.length || 0,
      firstFoodSample: data.foods?.[0] ? {
        description: data.foods[0].description,
        dataType: data.foods[0].dataType,
        nutrients: data.foods[0].foodNutrients?.length || 0
      } : null
    });
    
    // แปลงผลลัพธ์ให้อยู่ในรูปแบบ SearchFoodResult
    const foods = data.foods || [];
    const searchResults: SearchFoodResult[] = foods.map((food: any) => ({
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      foodCategory: food.foodCategory,
      brandName: food.brandOwner,
      ingredients: food.ingredients,
      servingSize: food.servingSize,
      servingSizeUnit: food.servingSizeUnit,
      foodNutrients: food.foodNutrients?.map((n: any) => ({
        nutrientId: n.nutrientId || n.nutrient?.id,
        nutrientName: n.nutrientName || n.nutrient?.name,
        value: n.value || 0
      })) || []
    }));
    
    // เรียงลำดับให้วัตถุดิบมาก่อนเสมอ (Foundation และ SR Legacy)
    const sortedFoods = [...searchResults].sort((a, b) => {
      // ให้ Foundation และ SR Legacy มาก่อน
      if (a.dataType === 'Foundation' && b.dataType !== 'Foundation') return -1;
      if (a.dataType !== 'Foundation' && b.dataType === 'Foundation') return 1;
      if (a.dataType === 'SR Legacy' && b.dataType !== 'SR Legacy' && b.dataType !== 'Foundation') return -1;
      if (a.dataType !== 'SR Legacy' && a.dataType !== 'Foundation' && b.dataType === 'SR Legacy') return 1;
      
      // ถ้าเป็นประเภทเดียวกัน ให้เรียงตามชื่อ
      return a.description.localeCompare(b.description);
    });
    
    return {
      foods: sortedFoods,
      totalHits: data.totalHits || 0
    };
  } catch (error) {
    console.error('Error searching USDA foods:', error);
    return {
      foods: [],
      totalHits: 0
    };
  }
}

// ฟังก์ชันเพื่อดึงข้อมูลอาหารโดยละเอียดด้วย fdcId
export async function getFoodDetails(fdcId: number): Promise<USDAFoodItem | null> {
  try {
    // ขอข้อมูลโภชนาการหลัก - พลังงาน, โปรตีน, คาร์บ, ไขมัน
    const response = await fetch(
      `${BASE_URL}/food/${fdcId}?api_key=${API_KEY}&nutrients=208&nutrients=203&nutrients=204&nutrients=205`
    );

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const food = await response.json();
    
    // แปลงข้อมูลให้อยู่ในรูปแบบเดียวกับที่ใช้ในแอพ
    if (food.foodNutrients) {
      food.nutrients = food.foodNutrients.map((n: any) => ({
        nutrientId: n.nutrient?.id || n.nutrientId,
        nutrientName: n.nutrient?.name || n.nutrientName,
        unitName: n.nutrient?.unitName || n.unitName,
        value: n.amount || n.value || 0
      }));
    }
    
    // Log ข้อมูลเพื่อดูค่าโภชนาการ
    console.log('Food details retrieved:', {
      fdcId,
      description: food.description,
      nutrients: food.nutrients?.length || 0
    });
    
    return {
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      foodCategory: food.foodCategory,
      brandName: food.brandOwner || food.brandName,
      ingredients: food.ingredients,
      servingSize: food.servingSize,
      servingSizeUnit: food.servingSizeUnit,
      nutrients: food.nutrients || []
    };
  } catch (error) {
    console.error(`Error fetching food details for ID ${fdcId}:`, error);
    return null;
  }
}

// รายการหมวดหมู่อาหารหลัก
export const FOOD_CATEGORIES = [
  { id: 'protein', name: 'Protein', emoji: '🥩' },
  { id: 'vegetable', name: 'Vegetable', emoji: '🥦' },
  { id: 'fruit', name: 'Fruit', emoji: '🍎' },
  { id: 'grain', name: 'Grain', emoji: '🌾' },
  { id: 'dairy', name: 'Dairy', emoji: '🧀' },
  { id: 'snack', name: 'Snack', emoji: '🍿' }, 
  { id: 'beverage', name: 'Beverage', emoji: '🍹' },
  { id: 'other', name: 'Other', emoji: '📋' },
];

// แมปจาก USDA Categories เป็นหมวดหมู่ของเรา
export const USDA_CATEGORY_MAPPING: Record<string, string> = {
  'Vegetables and Vegetable Products': 'vegetable',
  'Fruits and Fruit Juices': 'fruit',
  'Grain Products': 'grain',
  'Cereal Grains and Pasta': 'grain',
  'Breakfast Cereals': 'grain',
  'Baked Products': 'grain',
  'Meat, Poultry, Fish and Seafood': 'protein',
  'Legumes and Legume Products': 'protein',
  'Nut and Seed Products': 'protein',
  'Beef Products': 'protein',
  'Pork Products': 'protein',
  'Poultry Products': 'protein',
  'Lamb, Veal, and Game Products': 'protein',
  'Sausages and Luncheon Meats': 'protein',
  'Fish and Seafood Products': 'protein',
  'Dairy and Egg Products': 'dairy',
  'Milk and Dairy Products': 'dairy',
  'Cheese Products': 'dairy',
  'Beverages': 'beverage',
  'Alcoholic Beverages': 'beverage',
  'Coffee and Tea': 'beverage',
  'Fats and Oils': 'other',
  'Soups, Sauces, and Gravies': 'other',
  'Spices and Herbs': 'other',
  'Snacks': 'snack',
  'Fast Foods': 'other',
  'Mixed Dishes': 'other',
  'Restaurant Foods': 'other',
};

// ฟังก์ชันค้นหาอาหารตามหมวดหมู่
export async function searchFoodsByCategory(category: string, pageNumber: number = 1, pageSize: number = 20): Promise<SearchFoodResult[]> {
  try {
    console.log(`Searching for foods in category: ${category}, page: ${pageNumber}, pageSize: ${pageSize}`);
    
    // ปรับแต่งคำค้นหาตามหมวดหมู่
    let query = "";
    
    switch (category.toLowerCase()) {
      case 'vegetables':
        query = "vegetable";
        break;
      case 'fruits':
        query = "fruit";
        break;
      case 'meats':
        query = "meat";
        break;
      case 'dairy':
        query = "dairy milk cheese";
        break;
      case 'grains':
        query = "grain rice bread pasta";
        break;
      case 'beverages':
        query = "drink beverage coffee tea";
        break;
      case 'alcohol':
        query = "alcohol beer wine";
        break;
      case 'fastfood':
        query = "fast food burger pizza";
        break;
      default:
        query = category;
    }
    
    // ค้นหาด้วย API - เน้นเรียงลำดับให้วัตถุดิบมาก่อน
    const result = await searchFoods(query, pageNumber, pageSize);
    
    return result.foods;
  } catch (error) {
    console.error(`Error searching foods for category ${category}:`, error);
    return [];
  }
}