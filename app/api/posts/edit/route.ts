import { NextRequest, NextResponse } from 'next/server';
import auth from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ฟังก์ชันสำหรับแก้ไขโพสต์
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
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!body.postId || !body.content || body.content.trim() === '') {
      return NextResponse.json(
        { success: false, error: "Post ID and content are required" },
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
        { success: false, error: "You don't have permission to edit this post" },
        { status: 403 }
      );
    }
    
    // อัปเดตโพสต์
    const updateResult = await postsCollection.findOneAndUpdate(
      { _id: new ObjectId(postId) },
      { 
        $set: { 
          content: body.content,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!updateResult) {
      return NextResponse.json(
        { success: false, error: "Failed to update post" },
        { status: 500 }
      );
    }
    
    const updatedPost = updateResult;
    
    // แปลงรูปแบบข้อมูลสำหรับส่งกลับ
    const formattedPost = {
      id: updatedPost._id.toString(),
      userId: updatedPost.userId,
      userName: updatedPost.userName,
      userAvatar: updatedPost.userAvatar,
      content: updatedPost.content,
      images: updatedPost.imageIds?.map((id: string) => `/api/images/${id}`) || [],
      timestamp: updatedPost.timestamp.toISOString(),
      updatedAt: updatedPost.updatedAt?.toISOString() || null,
      likes: updatedPost.likes || 0,
      likedBy: updatedPost.likedBy || [],
      comments: updatedPost.comments?.map((comment: any) => ({
        id: comment._id.toString(),
        userId: comment.userId,
        userName: comment.userName,
        userAvatar: comment.userAvatar,
        content: comment.content,
        timestamp: comment.timestamp.toISOString(),
        likes: comment.likes || 0
      })) || []
    };
    
    return NextResponse.json({ success: true, post: formattedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
} 