import { NextRequest, NextResponse } from "next/server";
import auth from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getProfileImageByUserId } from "@/lib/db/images";

// This is a mockup of database operations
// In a real application, you would connect to your database (MongoDB, etc.)
// and perform actual database operations

// Mock user data storage
let userData = {
  id: "user1",
  name: "Your Name",
  description: "Fitness enthusiast | Weight loss journey",
  profileImage: "https://i.pravatar.cc/150?img=10",
  stats: {
    posts: 124,
    friends: 845,
    groups: 15,
  },
};

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
    const body = await request.json();
    
    // เชื่อมต่อ MongoDB
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // หาข้อมูลผู้ใช้ปัจจุบัน
    const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    // ตรวจสอบว่ามีรูปโปรไฟล์ใน MongoDB หรือไม่
    let profileImageUrl = body.profileImage;
    
    // ถ้ามีการระบุ imageId แสดงว่ามีการอัปโหลดรูปใหม่
    if (body.imageId) {
      profileImageUrl = `/api/images/${body.imageId}`;
    } 
    // ถ้าไม่ได้ระบุ imageId หรือ profileImage ให้ใช้รูปล่าสุดจาก MongoDB
    else if (!profileImageUrl) {
      const latestProfileImage = await getProfileImageByUserId(userId);
      if (latestProfileImage) {
        profileImageUrl = `/api/images/${latestProfileImage._id}`;
      } else {
        // ใช้รูปเริ่มต้นถ้าไม่มีรูปใน MongoDB
        profileImageUrl = 'https://i.pravatar.cc/150?img=10';
      }
    }
    
    // สร้างหรืออัปเดทข้อมูลผู้ใช้
    const userData = {
      name: body.name || (currentUser?.name || 'Anonymous User'),
      description: body.description || (currentUser?.description || ''),
      profileImage: profileImageUrl,
      updatedAt: new Date(),
    };
    
    // อัปเดทข้อมูลใน MongoDB
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: userData,
        $setOnInsert: { 
          createdAt: new Date(),
          stats: currentUser?.stats || { posts: 0, friends: 0, groups: 0 }
        }
      },
      { upsert: true }
    );
    
    // ดึงข้อมูลที่อัปเดทแล้ว
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    // ดึงข้อมูลรูปโปรไฟล์เพิ่มเติม (เพื่อสนับสนุนการแคช)
    let profileImageBase64 = null;
    if (updatedUser?.profileImage && updatedUser.profileImage.startsWith('/api/images/')) {
      try {
        // ดึง ID ของรูปภาพจาก URL
        const imageId = updatedUser.profileImage.split('/').pop();
        
        // ดึงข้อมูลรูปภาพจาก MongoDB
        const imagesCollection = db.collection('images');
        const imageData = await imagesCollection.findOne({ _id: new ObjectId(imageId) });
        
        if (imageData) {
          // แปลงเป็น base64 URL สำหรับการแคช
          profileImageBase64 = `data:${imageData.contentType};base64,${imageData.base64}`;
        }
      } catch (error) {
        console.error('Error fetching profile image data:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser?._id.toString(),
        name: updatedUser?.name,
        description: updatedUser?.description,
        profileImage: updatedUser?.profileImage,
        profileImageBase64: profileImageBase64,
        stats: updatedUser?.stats
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update profile'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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
    
    // เชื่อมต่อ MongoDB
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // ดึงข้อมูลผู้ใช้
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    // ข้อมูลเริ่มต้นถ้ายังไม่มีข้อมูลผู้ใช้
    const userData = {
      id: userId,
      name: session.user.name || 'Anonymous User',
      description: '',
      profileImage: session.user.image || 'https://i.pravatar.cc/150?img=10',
      profileImageBase64: null,
      stats: { posts: 0, friends: 0, groups: 0 }
    };
    
    if (!user) {
      // สร้างข้อมูลเริ่มต้นถ้ายังไม่มีข้อมูลผู้ใช้
      return NextResponse.json({
        success: true,
        user: userData
      });
    }
    
    // ดึงข้อมูลรูปโปรไฟล์เพิ่มเติม (เพื่อสนับสนุนการแคช)
    let profileImageBase64 = null;
    if (user.profileImage && user.profileImage.startsWith('/api/images/')) {
      try {
        // ดึง ID ของรูปภาพจาก URL
        const imageId = user.profileImage.split('/').pop();
        
        // ดึงข้อมูลรูปภาพจาก MongoDB
        const imagesCollection = db.collection('images');
        const imageData = await imagesCollection.findOne({ _id: new ObjectId(imageId) });
        
        if (imageData) {
          // แปลงเป็น base64 URL สำหรับการแคช
          profileImageBase64 = `data:${imageData.contentType};base64,${imageData.base64}`;
        }
      } catch (error) {
        console.error('Error fetching profile image data:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        description: user.description,
        profileImage: user.profileImage,
        profileImageBase64: profileImageBase64,
        stats: user.stats || { posts: 0, friends: 0, groups: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile'
    }, { status: 500 });
  }
} 