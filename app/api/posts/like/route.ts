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
    
    if (!body.postId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required field: postId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // เชื่อมต่อ MongoDB
    const client = await clientPromise;
    const db = client.db();
    const postsCollection = db.collection('posts');
    
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
    
    // ตรวจสอบว่าผู้ใช้เคยกดไลค์โพสต์นี้หรือไม่
    const likedBy = post.likedBy || [];
    const alreadyLiked = likedBy.includes(userId);
    
    if (alreadyLiked) {
      // ถ้าเคยกดไลค์แล้ว ให้ยกเลิกการไลค์
      await postsCollection.updateOne(
        { _id: new ObjectId(body.postId) },
        { 
          $pull: { likedBy: userId },
          $inc: { likes: -1 }
        } as any
      );
      
      return new Response(
        JSON.stringify({
          success: true,
          liked: false,
          likes: (post.likes || 1) - 1
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // ถ้ายังไม่เคยกดไลค์ ให้เพิ่มการไลค์
      await postsCollection.updateOne(
        { _id: new ObjectId(body.postId) },
        { 
          $addToSet: { likedBy: userId },
          $inc: { likes: 1 }
        } as any
      );
      
      return new Response(
        JSON.stringify({
          success: true,
          liked: true,
          likes: (post.likes || 0) + 1
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error liking post:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to like/unlike post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 