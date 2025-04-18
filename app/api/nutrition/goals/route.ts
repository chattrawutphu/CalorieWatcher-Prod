import { NextRequest, NextResponse } from 'next/server';
import auth from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { connectToDatabase } from '@/lib/mongoose';
import NutritionModel from '@/lib/models/nutrition';
import { headers } from 'next/headers';

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
    const goals = await request.json();

    // ตรวจสอบข้อมูล
    if (!goals) {
      return NextResponse.json(
        { success: false, message: 'No goals data provided' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // อัพเดทข้อมูลเป้าหมาย
    const result = await NutritionModel.findOneAndUpdate(
      { userId },
      { $set: { goals } },
      { upsert: true, new: true }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Failed to update goals' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Goals updated successfully',
      data: result.goals
    });
  } catch (error) {
    console.error('Error updating goals:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update goals',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 