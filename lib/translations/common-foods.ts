// คำแปลสำหรับอาหารทั่วไปในแต่ละหมวดหมู่

interface Food {
  name: string;
  serving: string;
  calories: number;
}

interface CommonFoods {
  vegetables: Food[];
  fruits: Food[];
  meats: Food[];
  dairy: Food[];
  grains: Food[];
  beverages: Food[];
  alcohol: Food[];
  fastfood: Food[];
}

interface Translations {
  en: CommonFoods;
  th: CommonFoods;
}

// คำแปลอาหารภาษาอังกฤษ
const englishFoods: CommonFoods = {
  vegetables: [
    { name: "Broccoli", serving: "1 cup chopped", calories: 55 },
    { name: "Spinach", serving: "1 cup", calories: 7 },
    { name: "Carrot", serving: "1 medium", calories: 25 },
    { name: "Bell Pepper", serving: "1 medium", calories: 30 },
    { name: "Cucumber", serving: "1 medium", calories: 30 }
  ],
  fruits: [
    { name: "Apple", serving: "1 medium", calories: 95 },
    { name: "Banana", serving: "1 medium", calories: 105 },
    { name: "Orange", serving: "1 medium", calories: 65 },
    { name: "Grapes", serving: "1 cup", calories: 62 },
    { name: "Strawberries", serving: "1 cup", calories: 49 }
  ],
  meats: [
    { name: "Chicken Breast", serving: "3 oz", calories: 165 },
    { name: "Salmon", serving: "3 oz", calories: 177 },
    { name: "Ground Beef", serving: "3 oz", calories: 213 },
    { name: "Tuna", serving: "3 oz", calories: 73 },
    { name: "Pork Chop", serving: "3 oz", calories: 206 }
  ],
  dairy: [
    { name: "Milk", serving: "1 cup", calories: 149 },
    { name: "Greek Yogurt", serving: "1 cup", calories: 100 },
    { name: "Cheddar Cheese", serving: "1 oz", calories: 113 },
    { name: "Cottage Cheese", serving: "1/2 cup", calories: 82 },
    { name: "Egg", serving: "1 large", calories: 78 }
  ],
  grains: [
    { name: "Brown Rice", serving: "1 cup cooked", calories: 216 },
    { name: "Whole Wheat Bread", serving: "1 slice", calories: 81 },
    { name: "Oatmeal", serving: "1/2 cup dry", calories: 153 },
    { name: "Quinoa", serving: "1 cup cooked", calories: 222 },
    { name: "Pasta", serving: "1 cup cooked", calories: 221 }
  ],
  beverages: [
    { name: "Coffee", serving: "8 oz", calories: 2 },
    { name: "Tea", serving: "8 oz", calories: 2 },
    { name: "Orange Juice", serving: "8 oz", calories: 112 },
    { name: "Soda", serving: "12 oz can", calories: 150 },
    { name: "Smoothie", serving: "12 oz", calories: 200 }
  ],
  alcohol: [
    { name: "Beer", serving: "12 oz", calories: 153 },
    { name: "Red Wine", serving: "5 oz", calories: 125 },
    { name: "White Wine", serving: "5 oz", calories: 121 },
    { name: "Vodka", serving: "1.5 oz", calories: 97 },
    { name: "Whiskey", serving: "1.5 oz", calories: 105 }
  ],
  fastfood: [
    { name: "Hamburger", serving: "1 regular", calories: 350 },
    { name: "French Fries", serving: "medium", calories: 380 },
    { name: "Pizza", serving: "1 slice", calories: 285 },
    { name: "Fried Chicken", serving: "1 piece", calories: 320 },
    { name: "Taco", serving: "1 regular", calories: 170 }
  ]
};

// คำแปลอาหารภาษาไทย
const thaiFoods: CommonFoods = {
  vegetables: [
    { name: "บล็อคโคลี่", serving: "1 ถ้วย", calories: 55 },
    { name: "ผักโขม", serving: "1 ถ้วย", calories: 7 },
    { name: "แครอท", serving: "1 หัวกลาง", calories: 25 },
    { name: "พริกหวาน", serving: "1 ลูกกลาง", calories: 30 },
    { name: "แตงกวา", serving: "1 ลูกกลาง", calories: 30 }
  ],
  fruits: [
    { name: "แอปเปิ้ล", serving: "1 ลูกกลาง", calories: 95 },
    { name: "กล้วยหอม", serving: "1 ลูกกลาง", calories: 105 },
    { name: "ส้ม", serving: "1 ลูกกลาง", calories: 65 },
    { name: "องุ่น", serving: "1 ถ้วย", calories: 62 },
    { name: "สตรอเบอร์รี่", serving: "1 ถ้วย", calories: 49 }
  ],
  meats: [
    { name: "อกไก่", serving: "85 กรัม", calories: 165 },
    { name: "ปลาแซลมอน", serving: "85 กรัม", calories: 177 },
    { name: "เนื้อบด", serving: "85 กรัม", calories: 213 },
    { name: "ปลาทูน่า", serving: "85 กรัม", calories: 73 },
    { name: "หมูสันนอก", serving: "85 กรัม", calories: 206 }
  ],
  dairy: [
    { name: "นม", serving: "1 ถ้วย", calories: 149 },
    { name: "โยเกิร์ตกรีก", serving: "1 ถ้วย", calories: 100 },
    { name: "ชีสเชดดาร์", serving: "28 กรัม", calories: 113 },
    { name: "คอทเทจชีส", serving: "1/2 ถ้วย", calories: 82 },
    { name: "ไข่", serving: "1 ฟองใหญ่", calories: 78 }
  ],
  grains: [
    { name: "ข้าวกล้อง", serving: "1 ถ้วยปรุงสุก", calories: 216 },
    { name: "ขนมปังโฮลวีท", serving: "1 แผ่น", calories: 81 },
    { name: "ข้าวโอ๊ต", serving: "1/2 ถ้วยแห้ง", calories: 153 },
    { name: "ควินัว", serving: "1 ถ้วยปรุงสุก", calories: 222 },
    { name: "พาสต้า", serving: "1 ถ้วยปรุงสุก", calories: 221 }
  ],
  beverages: [
    { name: "กาแฟ", serving: "240 มล.", calories: 2 },
    { name: "ชา", serving: "240 มล.", calories: 2 },
    { name: "น้ำส้ม", serving: "240 มล.", calories: 112 },
    { name: "น้ำอัดลม", serving: "1 กระป๋อง", calories: 150 },
    { name: "สมูทตี้", serving: "360 มล.", calories: 200 }
  ],
  alcohol: [
    { name: "เบียร์", serving: "360 มล.", calories: 153 },
    { name: "ไวน์แดง", serving: "150 มล.", calories: 125 },
    { name: "ไวน์ขาว", serving: "150 มล.", calories: 121 },
    { name: "วอดก้า", serving: "45 มล.", calories: 97 },
    { name: "วิสกี้", serving: "45 มล.", calories: 105 }
  ],
  fastfood: [
    { name: "แฮมเบอร์เกอร์", serving: "1 ชิ้นปกติ", calories: 350 },
    { name: "เฟรนช์ฟรายส์", serving: "ขนาดกลาง", calories: 380 },
    { name: "พิซซ่า", serving: "1 ชิ้น", calories: 285 },
    { name: "ไก่ทอด", serving: "1 ชิ้น", calories: 320 },
    { name: "ทาโก้", serving: "1 ชิ้นปกติ", calories: 170 }
  ]
};

export const commonFoodTranslations: Translations = {
  en: englishFoods,
  th: thaiFoods
}; 