import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { connectToDatabase } from '@/lib/mongoose';
import NutritionModel from '@/lib/models/nutrition';

// GET request เพื่อดึงข้อมูลโภชนาการทั้งหมดของผู้ใช้
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  console.log(`[API] GET: Starting nutrition data request at ${new Date().toISOString()}`);
  
  try {
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้ว โดยใช้ getServerSession
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error('[API] GET: Unauthorized access attempt');
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: 'No valid session found' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`[API] GET: Accessing nutrition data for user ${userId}`);

    // เชื่อมต่อกับ MongoDB
    const dbConnectStart = performance.now();
    await connectToDatabase();
    const dbConnectEnd = performance.now();
    console.log(`[API] GET: Database connection established in ${(dbConnectEnd - dbConnectStart).toFixed(2)}ms`);

    // ค้นหาข้อมูลของผู้ใช้
    const dbQueryStart = performance.now();
    let nutritionData = await NutritionModel.findOne({ userId });
    const dbQueryEnd = performance.now();
    console.log(`[API] GET: Database query completed in ${(dbQueryEnd - dbQueryStart).toFixed(2)}ms`);

    // ถ้าไม่พบข้อมูล ให้สร้างข้อมูลเริ่มต้น
    if (!nutritionData) {
      // สร้างข้อมูลเริ่มต้นด้วย timestamp ปัจจุบัน
      const now = new Date().toISOString();
      console.log(`[API] GET: Creating default nutrition data for new user ${userId}`);
      
      const dbCreateStart = performance.now();
      nutritionData = new NutritionModel({
        userId,
        dailyLogs: {},
        goals: {
          calories: 2000,
          protein: 120,
          carbs: 250,
          fat: 65,
          water: 2000,
          lastModified: now
        },
        favoriteFoods: [],
        updatedAt: now
      });
      await nutritionData.save();
      const dbCreateEnd = performance.now();
      console.log(`[API] GET: Default data created and saved in ${(dbCreateEnd - dbCreateStart).toFixed(2)}ms`);
    }

    // เพิ่ม query parameter สำหรับตรวจสอบว่ามีข้อมูลใหม่หรือไม่
    const lastSyncTime = request.nextUrl.searchParams.get('lastSync');
    
    // ตรวจสอบว่าข้อมูลใน server มีการอัพเดทหลังจาก lastSyncTime หรือไม่
    const hasUpdates = lastSyncTime 
      ? new Date(nutritionData.updatedAt || 0) > new Date(lastSyncTime)
      : true;
    
    // ถ้าไม่มีการอัพเดท ให้ส่งสถานะว่าไม่มีข้อมูลใหม่
    if (!hasUpdates) {
      console.log(`[API] GET: No updates since ${lastSyncTime} for user ${userId}`);
      const endTime = performance.now();
      console.log(`[API] GET: Request completed (no updates) in ${(endTime - startTime).toFixed(2)}ms`);
      return NextResponse.json({ 
        success: true, 
        hasUpdates: false,
        lastSync: nutritionData.updatedAt || new Date().toISOString()
      });
    }

    // แปลง Map เป็น Object (JSON serializable)
    const responseData = {
      ...nutritionData.toObject(),
      dailyLogs: Object.fromEntries(
        nutritionData.dailyLogs instanceof Map
          ? nutritionData.dailyLogs.entries()
          : Object.entries(nutritionData.dailyLogs)
      ),
      updatedAt: nutritionData.updatedAt || new Date().toISOString()
    };

    const endTime = performance.now();
    console.log(`[API] GET: Returning data for user ${userId}, last updated: ${responseData.updatedAt}`);
    console.log(`[API] GET: Request completed with data in ${(endTime - startTime).toFixed(2)}ms`);
    
    return NextResponse.json({ 
      success: true,
      hasUpdates: true, 
      data: responseData
    });
  } catch (error) {
    const endTime = performance.now();
    console.error(`[API] GET: Error fetching nutrition data after ${(endTime - startTime).toFixed(2)}ms:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch nutrition data',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// POST request เพื่อบันทึกข้อมูลโภชนาการของผู้ใช้
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  console.log(`[API] POST: Starting nutrition data save at ${new Date().toISOString()}`);
  
  try {
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้ว โดยใช้ getServerSession
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error('[API] POST: Unauthorized access attempt');
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: 'No valid session found' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`[API] POST: Saving nutrition data for user ${userId}`);
    
    const data = await request.json();
    const clientUpdateTime = data.updatedAt;
    
    // เชื่อมต่อกับ MongoDB
    const dbConnectStart = performance.now();
    await connectToDatabase();
    const dbConnectEnd = performance.now();
    console.log(`[API] POST: Database connection established in ${(dbConnectEnd - dbConnectStart).toFixed(2)}ms`);
    
    // ดึงข้อมูลปัจจุบันเพื่อตรวจสอบข้อขัดแย้ง
    const dbQueryStart = performance.now();
    const currentData = await NutritionModel.findOne({ userId });
    const dbQueryEnd = performance.now();
    console.log(`[API] POST: Database query completed in ${(dbQueryEnd - dbQueryStart).toFixed(2)}ms`);
    
    // ถ้ามีข้อมูลอยู่แล้วและมีการแก้ไขขัดแย้งกัน (ในกรณีที่มีการซิงค์จากหลายอุปกรณ์)
    const now = new Date().toISOString();
    
    // ถ้ามี server conflict ให้ใช้วิธีจัดการความขัดแย้ง
    if (currentData?.updatedAt) {
      const serverTime = new Date(currentData.updatedAt).getTime();
      const clientTime = new Date(clientUpdateTime || 0).getTime();
      
      if (serverTime > clientTime) {
        console.log(`[API] POST: Server data is newer (${serverTime} > ${clientTime}), potential conflict`);
        
        // ใช้กลยุทธ์การรวมข้อมูล (อาจซับซ้อนขึ้นในอนาคต)
        // เช่น เก็บมื้ออาหารจากทั้งสองแหล่ง และใช้เป้าหมายล่าสุด
      }
    }
    
    // แปลง object เป็น Map ถ้าจำเป็น
    const nutritionData = {
      ...data,
      userId,
      dailyLogs: data.dailyLogs instanceof Map
        ? data.dailyLogs
        : new Map(Object.entries(data.dailyLogs || {})),
      updatedAt: now
    };

    // บันทึกข้อมูลโดยใช้ upsert
    const dbSaveStart = performance.now();
    await NutritionModel.findOneAndUpdate(
      { userId },
      nutritionData,
      { upsert: true, new: true }
    );
    const dbSaveEnd = performance.now();
    console.log(`[API] POST: Database save completed in ${(dbSaveEnd - dbSaveStart).toFixed(2)}ms`);

    const endTime = performance.now();
    console.log(`[API] POST: Data saved successfully for user ${userId} in ${(endTime - startTime).toFixed(2)}ms`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data saved successfully',
      lastSync: now
    });
  } catch (error) {
    const endTime = performance.now();
    console.error(`[API] POST: Error saving nutrition data after ${(endTime - startTime).toFixed(2)}ms:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save nutrition data',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// ฟังก์ชัน helper สำหรับ merge ข้อมูล
async function mergeNutritionData(serverData: any, clientData: any) {
  const merged = { ...serverData };
  
  // แปลง dailyLogs จาก Map เป็น Object ถ้าจำเป็น
  const serverLogs = serverData.dailyLogs instanceof Map
    ? Object.fromEntries(serverData.dailyLogs.entries())
    : serverData.dailyLogs || {};
    
  const clientLogs = clientData.dailyLogs instanceof Map
    ? Object.fromEntries(clientData.dailyLogs.entries())
    : clientData.dailyLogs || {};
  
  // รวมข้อมูล dailyLogs
  const mergedLogs: Record<string, any> = { ...serverLogs };
  
  // ตรวจสอบและรวมข้อมูลจาก dailyLogs ของ client
  for (const date in clientLogs) {
    const clientLog = clientLogs[date];
    const serverLog = serverLogs[date];
    
    // ถ้า server ไม่มีข้อมูลของวันนี้ ให้ใช้ข้อมูลจาก client
    if (!serverLog) {
      mergedLogs[date] = clientLog;
      continue;
    }
    
    // ถ้ามีทั้งคู่ ให้รวมข้อมูล
    const clientLastModified = clientLog.lastModified ? new Date(clientLog.lastModified) : new Date(0);
    const serverLastModified = serverLog.lastModified ? new Date(serverLog.lastModified) : new Date(0);
    
    // ใช้ข้อมูลที่ใหม่กว่า
    if (clientLastModified > serverLastModified) {
      mergedLogs[date] = clientLog;
    } else {
      // รวมข้อมูลมื้ออาหาร - ให้รวมมื้ออาหารจากทั้ง client และ server
      const mergedMeals = [...(serverLog.meals || [])];
      
      // ตรวจสอบว่ามีมื้ออาหารใน client ที่ไม่มีใน server หรือไม่
      if (clientLog.meals) {
        for (const clientMeal of clientLog.meals) {
          // ตรวจสอบว่ามื้ออาหารนี้มีอยู่ใน server หรือไม่
          const existsInServer = mergedMeals.some(serverMeal => serverMeal.id === clientMeal.id);
          
          // ถ้าไม่มี ให้เพิ่มเข้าไป
          if (!existsInServer) {
            mergedMeals.push(clientMeal);
          }
        }
      }
      
      // ใช้วิธีคำนวณยอดรวมใหม่
      const totals = mergedMeals.reduce(
        (acc, meal) => {
          const quantity = meal.quantity || 1;
          acc.totalCalories += meal.foodItem.calories * quantity;
          acc.totalProtein += meal.foodItem.protein * quantity;
          acc.totalFat += meal.foodItem.fat * quantity;
          acc.totalCarbs += meal.foodItem.carbs * quantity;
          return acc;
        },
        { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 }
      );
      
      // อัพเดท mergedLogs กับข้อมูลที่รวมแล้ว
      mergedLogs[date] = {
        ...serverLog,
        meals: mergedMeals,
        ...totals,
        lastModified: new Date().toISOString() // อัพเดท timestamp
      };
    }
  }
  
  merged.dailyLogs = mergedLogs;
  
  // รวมข้อมูล goals
  if (clientData.goals) {
    const clientGoalsLastModified = clientData.goals.lastModified ? new Date(clientData.goals.lastModified) : new Date(0);
    const serverGoalsLastModified = serverData.goals?.lastModified ? new Date(serverData.goals.lastModified) : new Date(0);
    
    if (clientGoalsLastModified > serverGoalsLastModified) {
      merged.goals = clientData.goals;
    }
  }
  
  // รวมข้อมูลอื่นๆ ตามความจำเป็น
  // ...
  
  return merged;
} 