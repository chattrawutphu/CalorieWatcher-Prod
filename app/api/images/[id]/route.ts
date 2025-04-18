import { getImageById } from '@/lib/db/images';

export const dynamic = 'force-dynamic';

// API endpoint สำหรับดึงรูปภาพจาก MongoDB โดย ID
export async function GET(request: Request) {
  try {
    // ดึง ID จาก URL path
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const id = segments[segments.length - 1];
    
    // ดึงข้อมูลรูปภาพจาก MongoDB
    const image = await getImageById(id);

    if (!image) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // สร้าง response ที่มี content type ตามชนิดของรูปภาพ
    const base64Data = image.base64;
    const contentType = image.contentType;
    
    // แปลง base64 กลับเป็น binary
    const buffer = Buffer.from(base64Data, 'base64');
    
    // ส่งคืนรูปภาพในรูปแบบ binary พร้อมระบุ content type
    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache 1 year
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch image' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
} 