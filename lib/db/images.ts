import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export interface ImageDocument {
  _id?: ObjectId;
  userId: string;
  base64: string;
  contentType: string;
  type: 'profile' | 'post';
  postId?: string;
  createdAt: Date;
}

export async function storeImage(
  userId: string,
  base64Data: string,
  contentType: string,
  type: 'profile' | 'post',
  postId?: string
): Promise<string> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('images');

    // สร้างเอกสารสำหรับเก็บรูปภาพ
    const imageDoc: ImageDocument = {
      userId,
      base64: base64Data,
      contentType,
      type,
      createdAt: new Date(),
    };

    // ถ้าเป็นรูปของโพสต์ ให้เก็บ ID ของโพสต์ด้วย
    if (type === 'post' && postId) {
      imageDoc.postId = postId;
    }

    // บันทึกลงใน MongoDB
    const result = await collection.insertOne(imageDoc);

    // ส่งคืน ID ของรูปภาพที่เพิ่งบันทึก
    return result.insertedId.toString();
  } catch (error) {
    console.error('Error storing image in MongoDB:', error);
    throw new Error('Failed to store image');
  }
}

export async function getImageById(imageId: string): Promise<ImageDocument | null> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('images');

    return await collection.findOne<ImageDocument>({ _id: new ObjectId(imageId) });
  } catch (error) {
    console.error('Error fetching image from MongoDB:', error);
    return null;
  }
}

export async function getProfileImageByUserId(userId: string): Promise<ImageDocument | null> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('images');

    // ดึงรูปโปรไฟล์ล่าสุดของผู้ใช้
    return await collection.findOne<ImageDocument>(
      { userId, type: 'profile' },
      { sort: { createdAt: -1 } } // เรียงลำดับตามเวลาสร้างล่าสุด
    );
  } catch (error) {
    console.error('Error fetching profile image from MongoDB:', error);
    return null;
  }
}

export async function getPostImagesByPostId(postId: string): Promise<ImageDocument[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('images');

    // ดึงรูปภาพทั้งหมดของโพสต์นั้น
    return await collection
      .find<ImageDocument>({ postId, type: 'post' })
      .sort({ createdAt: 1 })
      .toArray();
  } catch (error) {
    console.error('Error fetching post images from MongoDB:', error);
    return [];
  }
} 