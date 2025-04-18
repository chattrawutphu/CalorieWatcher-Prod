import { NextRequest, NextResponse } from 'next/server';
import auth from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { connectToDatabase } from '@/lib/mongoose';
import NutritionModel from '@/lib/models/nutrition';
import { IDailyLog } from '@/lib/models/nutrition';

export async function PUT(request: NextRequest) {
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
    const { date, waterIntake } = await request.json();

    // ตรวจสอบข้อมูล
    if (!date || waterIntake === undefined || waterIntake < 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid data provided' },
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
    const dayLog = dailyLogs.get(date) || {
      date: date,
      meals: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      waterIntake: 0,
    };

    // อัพเดทข้อมูลการดื่มน้ำ
    dayLog.waterIntake = waterIntake;
    
    // บันทึกข้อมูล
    dailyLogs.set(date, dayLog);
    
    // กำหนดค่า dailyLogs ไปยัง nutritionData อย่างถูกต้อง
    // แปลง Map เป็น Object เสมอเพื่อให้ตรงกับ type INutritionData
    nutritionData.dailyLogs = Object.fromEntries(dailyLogs.entries()) as Record<string, IDailyLog>;
    await nutritionData.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Water intake updated successfully'
    });
  } catch (error) {
    console.error('Error updating water intake:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update water intake',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 