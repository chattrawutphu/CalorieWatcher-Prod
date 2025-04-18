import { NextRequest, NextResponse } from 'next/server';
import auth from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ฟังก์ชันสำหรับลบโพสต์
export async function DELETE(request: NextRequest) {
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
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!body.postId) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }
    
    const postId = body.postId;
    
    // ตรวจสอบว่า postId ถูกต้องหรือไม่
    if (!ObjectId.isValid(postId)) {
      return NextResponse.json(
        { success: false, error: "Invalid post ID" },
        { status: 400 }
      );
    }
    
    // เชื่อมต่อ MongoDB
    const client = await clientPromise;
    const db = client.db();
    const postsCollection = db.collection('posts');
    const usersCollection = db.collection('users');
    
    // ตรวจสอบว่าโพสต์มีอยู่จริงและเป็นของผู้ใช้คนนี้
    const post = await postsCollection.findOne({
      _id: new ObjectId(postId)
    });
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }
    
    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของโพสต์
    if (post.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to delete this post" },
        { status: 403 }
      );
    }
    
    // ลบโพสต์
    const result = await postsCollection.deleteOne({ _id: new ObjectId(postId) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to delete post" },
        { status: 500 }
      );
    }
    
    // ลดจำนวนโพสต์ในข้อมูลผู้ใช้
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { 'stats.posts': -1 } }
    );
    
    return NextResponse.json(
      { success: true, message: "Post deleted successfully" }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
} 