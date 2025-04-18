import { NextRequest, NextResponse } from 'next/server';
import auth from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { connectToDatabase } from '@/lib/mongoose';
import NutritionModel from '@/lib/models/nutrition';
import { IMealEntry, IDailyLog } from '@/lib/models/nutrition';

// POST request เพื่อเพิ่มมื้ออาหาร
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้ว
    const session = await auth(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const meal = await request.json() as IMealEntry;

    // ตรวจสอบข้อมูลมื้ออาหาร
    if (!meal.id || !meal.date || !meal.foodItem) {
      return NextResponse.json(
        { success: false, message: 'Invalid meal data' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ค้นหาข้อมูลของผู้ใช้
    const nutritionData = await NutritionModel.findOne({ userId });
    if (!nutritionData) {
      return NextResponse.json(
        { success: false, message: 'User nutrition data not found' },
        { status: 404 }
      );
    }

    // แปลง data.dailyLogs จาก Object เป็น Map ถ้าจำเป็น
    const dailyLogs = nutritionData.dailyLogs instanceof Map 
      ? nutritionData.dailyLogs 
      : new Map(Object.entries(nutritionData.dailyLogs || {}));

    // ดึงข้อมูลของวันที่ระบุหรือสร้างใหม่ถ้ายังไม่มี
    const dayLog = dailyLogs.get(meal.date) || {
      date: meal.date,
      meals: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      waterIntake: 0,
    };

    // เพิ่มมื้ออาหารใหม่
    dayLog.meals.push(meal);

    // คำนวณค่าโภชนาการรวม
    dayLog.totalCalories = dayLog.meals.reduce(
      (sum: number, m: IMealEntry) => sum + m.foodItem.calories * m.quantity, 0
    );
    dayLog.totalProtein = dayLog.meals.reduce(
      (sum: number, m: IMealEntry) => sum + m.foodItem.protein * m.quantity, 0
    );
    dayLog.totalCarbs = dayLog.meals.reduce(
      (sum: number, m: IMealEntry) => sum + m.foodItem.carbs * m.quantity, 0
    );
    dayLog.totalFat = dayLog.meals.reduce(
      (sum: number, m: IMealEntry) => sum + m.foodItem.fat * m.quantity, 0
    );

    // อัพเดทข้อมูล
    dailyLogs.set(meal.date, dayLog);
    
    // กำหนดค่า dailyLogs ไปยัง nutritionData อย่างถูกต้อง
    // แปลง Map เป็น Object เสมอเพื่อให้ตรงกับ type INutritionData
    nutritionData.dailyLogs = Object.fromEntries(dailyLogs.entries()) as Record<string, IDailyLog>;
    await nutritionData.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Meal added successfully'
    });
  } catch (error) {
    console.error('Error adding meal:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to add meal',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE request เพื่อลบมื้ออาหาร
export async function DELETE(request: NextRequest) {
  try {
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้ว
    const session = await auth(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const mealId = searchParams.get('id');
    const date = searchParams.get('date');

    if (!mealId || !date) {
      return NextResponse.json(
        { success: false, message: 'Meal ID and date are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ค้นหาข้อมูลของผู้ใช้
    const nutritionData = await NutritionModel.findOne({ userId });
    if (!nutritionData) {
      return NextResponse.json(
        { success: false, message: 'User nutrition data not found' },
        { status: 404 }
      );
    }

    // แปลง data.dailyLogs จาก Object เป็น Map ถ้าจำเป็น
    const dailyLogs = nutritionData.dailyLogs instanceof Map 
      ? nutritionData.dailyLogs 
      : new Map(Object.entries(nutritionData.dailyLogs || {}));

    // ดึงข้อมูลของวันที่ระบุ
    const dayLog = dailyLogs.get(date);
    if (!dayLog) {
      return NextResponse.json(
        { success: false, message: 'Day log not found' },
        { status: 404 }
      );
    }

    // ลบมื้ออาหาร
    const updatedMeals = dayLog.meals.filter((meal: IMealEntry) => meal.id !== mealId);
    
    // คำนวณค่าโภชนาการรวมใหม่
    const totalCalories = updatedMeals.reduce(
      (sum: number, m: IMealEntry) => sum + m.foodItem.calories * m.quantity, 0
    );
    const totalProtein = updatedMeals.reduce(
      (sum: number, m: IMealEntry) => sum + m.foodItem.protein * m.quantity, 0
    );
    const totalCarbs = updatedMeals.reduce(
      (sum: number, m: IMealEntry) => sum + m.foodItem.carbs * m.quantity, 0
    );
    const totalFat = updatedMeals.reduce(
      (sum: number, m: IMealEntry) => sum + m.foodItem.fat * m.quantity, 0
    );

    // อัพเดทข้อมูล
    const updatedDayLog = {
      ...dayLog,
      meals: updatedMeals,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    };
    
    dailyLogs.set(date, updatedDayLog);
    
    // กำหนดค่า dailyLogs ไปยัง nutritionData อย่างถูกต้อง
    // แปลง Map เป็น Object เสมอเพื่อให้ตรงกับ type INutritionData
    nutritionData.dailyLogs = Object.fromEntries(dailyLogs.entries()) as Record<string, IDailyLog>;
    await nutritionData.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Meal removed successfully'
    });
  } catch (error) {
    console.error('Error removing meal:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to remove meal',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 