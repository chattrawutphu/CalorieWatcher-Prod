import { NextRequest, NextResponse } from 'next/server';
import auth from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getPostImagesByPostId } from "@/lib/db/images";

// Define post data structure
interface Post {
  _id?: ObjectId;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  imageIds?: string[];
  timestamp: Date;
  updatedAt?: Date;
  likes: number;
  likedBy?: string[];
  comments: Comment[];
}

interface Comment {
  _id?: ObjectId;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  likes: number;
}

// GET function to retrieve posts
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบการล็อกอิน
    const session = await auth(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const includeCacheImages = url.searchParams.get('cache') === 'true';
    
    // เชื่อมต่อ MongoDB
    const client = await clientPromise;
    const db = client.db();
    const postsCollection = db.collection('posts');
    
    // สร้าง query
    const query = userId ? { userId } : {};
    
    // ดึงข้อมูลโพสต์
    const posts = await postsCollection
      .find(query)
      .sort({ timestamp: -1 }) // เรียงตามเวลา (ล่าสุดก่อน)
      .toArray();
    
    // แปลงรูปแบบข้อมูลให้เข้ากับที่ client ต้องการ
    const formattedPosts = await Promise.all(posts.map(async post => {
      // สร้าง object สำหรับเก็บข้อมูลรูปภาพ base64 ถ้าต้องการ
      let imageCache: Record<string, string> | null = includeCacheImages ? {} : null;
      let imageUrls: string[] = [];
      
      // ดึงข้อมูลรูปภาพถ้ามี
      if (post.imageIds && post.imageIds.length > 0) {
        imageUrls = post.imageIds.map((id: string) => `/api/images/${id}`);
        
        // ถ้าต้องการข้อมูลสำหรับแคช ให้ดึงรูปภาพและแปลงเป็น base64
        if (includeCacheImages) {
          const imagesCollection = db.collection('images');
          for (const imageId of post.imageIds) {
            try {
              const imageUrl = `/api/images/${imageId}`;
              const imageData = await imagesCollection.findOne({ _id: new ObjectId(imageId) });
              
              if (imageData && imageCache) {
                // แปลงเป็น base64 URL สำหรับการแคช
                imageCache[imageUrl] = `data:${imageData.contentType};base64,${imageData.base64}`;
              }
            } catch (error) {
              console.error(`Error fetching image data for ${imageId}:`, error);
            }
          }
        }
      }
      
      return {
        id: post._id.toString(),
        userId: post.userId,
        userName: post.userName,
        userAvatar: post.userAvatar,
        content: post.content,
        images: imageUrls,
        timestamp: post.timestamp.toISOString(),
        updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
        likes: post.likes || 0,
        likedBy: post.likedBy || [],
        comments: post.comments?.map((comment: any) => ({
          id: comment._id.toString(),
          userId: comment.userId,
          userName: comment.userName,
          userAvatar: comment.userAvatar,
          content: comment.content,
          timestamp: comment.timestamp.toISOString(),
          likes: comment.likes || 0
        })) || [],
        // เพิ่มข้อมูลแคช (จะเป็น null ถ้าไม่ได้ร้องขอ)
        imageCache
      };
    }));
    
    return NextResponse.json({ 
      success: true, 
      posts: formattedPosts 
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch posts' 
    }, { status: 500 });
  }
}

// POST function to create a new post
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
    
    // Validate required fields
    if (!body.content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: content'
      }, { status: 400 });
    }
    
    // เชื่อมต่อ MongoDB
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');
    const postsCollection = db.collection('posts');
    
    // ดึงข้อมูลผู้ใช้
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // Create a new post
    const newPost: Post = {
      userId,
      userName: user.name || session.user.name || 'Anonymous',
      userAvatar: user.profileImage || session.user.image || 'https://i.pravatar.cc/150?img=10',
      content: body.content,
      timestamp: new Date(),
      likes: 0,
      likedBy: [],
      comments: [],
    };
    
    // เพิ่ม imageIds ถ้ามีการแนบรูปภาพ
    if (body.imageIds && Array.isArray(body.imageIds) && body.imageIds.length > 0) {
      newPost.imageIds = body.imageIds;
    }
    
    // เพิ่มโพสต์ลงใน MongoDB
    const result = await postsCollection.insertOne(newPost);
    
    // อัพเดทจำนวนโพสต์ของผู้ใช้
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { 'stats.posts': 1 } }
    );
    
    // แปลงรูปแบบข้อมูลสำหรับส่งกลับ
    const formattedPost = {
      id: result.insertedId.toString(),
      userId: newPost.userId,
      userName: newPost.userName,
      userAvatar: newPost.userAvatar,
      content: newPost.content,
      images: newPost.imageIds?.map(id => `/api/images/${id}`) || [],
      timestamp: newPost.timestamp.toISOString(),
      likes: newPost.likes,
      likedBy: newPost.likedBy,
      comments: []
    };
    
    return NextResponse.json({ 
      success: true, 
      post: formattedPost
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create post' 
    }, { status: 500 });
  }
} 