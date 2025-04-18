import { NextRequest } from 'next/server';
import auth from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Define MongoDB document interfaces
interface PostDocument {
  _id: ObjectId;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  likedBy: string[];
  comments: CommentDocument[];
}

interface CommentDocument {
  _id: ObjectId;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  likes: number;
}

// POST function to add a comment to a post
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบการล็อกอิน
    const session = await auth(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    if (!body.postId || !body.content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: postId, content' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // เชื่อมต่อ MongoDB
    const client = await clientPromise;
    const db = client.db();
    const postsCollection = db.collection('posts');
    const usersCollection = db.collection('users');
    
    // ดึงข้อมูลโพสต์
    const post = await postsCollection.findOne({ 
      _id: new ObjectId(body.postId)
    });
    
    if (!post) {
      return new Response(
        JSON.stringify({ success: false, error: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // ดึงข้อมูลผู้ใช้
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // สร้างคอมเมนต์ใหม่
    const newComment: CommentDocument = {
      _id: new ObjectId(),
      userId,
      userName: user.name || session.user.name || 'Anonymous',
      userAvatar: user.profileImage || session.user.image || 'https://i.pravatar.cc/150?img=10',
      content: body.content,
      timestamp: new Date(),
      likes: 0
    };
    
    // เพิ่มคอมเมนต์ลงในโพสต์
    await postsCollection.updateOne(
      { _id: new ObjectId(body.postId) },
      { $push: { comments: newComment } } as any
    );
    
    // แปลงรูปแบบคอมเมนต์สำหรับส่งกลับ
    const formattedComment = {
      id: newComment._id.toString(),
      userId: newComment.userId,
      userName: newComment.userName,
      userAvatar: newComment.userAvatar,
      content: newComment.content,
      timestamp: newComment.timestamp.toISOString(),
      likes: newComment.likes
    };
    
    return new Response(
      JSON.stringify({ success: true, comment: formattedComment }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error adding comment:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to add comment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 