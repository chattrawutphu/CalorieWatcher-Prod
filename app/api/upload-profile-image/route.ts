import { NextRequest, NextResponse } from "next/server";
import { storeImage } from "@/lib/db/images";
import auth from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// อัปโหลดรูปโปรไฟล์และเก็บใน MongoDB
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
      'profile'
    );
    
    // สร้าง URL สำหรับเรียกดูรูปภาพ
    const imageUrl = `/api/images/${imageId}`;
    
    // ส่ง URL ของรูปภาพกลับไป
    return NextResponse.json({ 
      success: true, 
      imageId: imageId,
      url: imageUrl
    });
    
  } catch (error) {
    console.error("Error processing image:", error);
    // ส่งข้อผิดพลาดที่ละเอียดขึ้น
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