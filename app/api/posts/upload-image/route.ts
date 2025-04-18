import { NextRequest, NextResponse } from "next/server";
import { storeImage } from "@/lib/db/images";
import auth from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// อัปโหลดรูปภาพของโพสต์และเก็บใน MongoDB
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบการล็อกอิน
    const session = await auth(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const postId = formData.get("postId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // อ่านไฟล์เป็น base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // แปลงไฟล์เป็น base64 string (ไม่รวม prefix)
    const base64Image = buffer.toString('base64');
    const contentType = file.type;
    
    // เก็บรูปภาพใน MongoDB
    const imageId = await storeImage(
      userId,
      base64Image,
      contentType,
      'post',
      postId // จะเป็น undefined ถ้ายังไม่มี postId
    );
    
    // ส่ง imageId กลับไปให้ client
    return NextResponse.json({ 
      success: true, 
      imageId,
      url: `/api/images/${imageId}`
    });
    
  } catch (error) {
    console.error("Error processing post image:", error);
    let errorMessage = "Failed to process image";
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 