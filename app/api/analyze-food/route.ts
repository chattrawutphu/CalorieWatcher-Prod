import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ฟังก์ชันแปลงหมวดหมู่จาก Spoonacular เป็นหมวดหมู่ในแอป
function mapFoodCategory(dishTypes: string[]): 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other' {
  // แปลง dish types เป็นตัวพิมพ์เล็กและกำจัดช่องว่าง
  const normalizedDishTypes = dishTypes.map(type => type.toLowerCase().trim());
  
  if (normalizedDishTypes.some(type => type.includes('meat') || type.includes('seafood') || type.includes('fish') || type.includes('chicken') || type.includes('beef') || type.includes('pork'))) {
    return 'protein';
  } else if (normalizedDishTypes.some(type => type.includes('vegetable') || type.includes('salad') || type.includes('vegetables'))) {
    return 'vegetable';
  } else if (normalizedDishTypes.some(type => type.includes('fruit') || type.includes('smoothie'))) {
    return 'fruit';
  } else if (normalizedDishTypes.some(type => type.includes('grain') || type.includes('rice') || type.includes('pasta') || type.includes('bread') || type.includes('noodle'))) {
    return 'grain';
  } else if (normalizedDishTypes.some(type => type.includes('dairy') || type.includes('cheese') || type.includes('milk') || type.includes('yogurt'))) {
    return 'dairy';
  } else if (normalizedDishTypes.some(type => type.includes('snack') || type.includes('dessert') || type.includes('cookie') || type.includes('cake') || type.includes('sweet'))) {
    return 'snack';
  } else if (normalizedDishTypes.some(type => type.includes('beverage') || type.includes('drink') || type.includes('juice') || type.includes('coffee') || type.includes('tea'))) {
    return 'beverage';
  } else {
    return 'other';
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json({ error: 'ไม่พบรูปภาพ' }, { status: 400 });
    }
    
    // แปลงรูปภาพเป็น base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    
    // ส่งคำขอไปยัง OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "วิเคราะห์อาหารในรูปภาพนี้ ให้ข้อมูลในรูปแบบ JSON ดังนี้: { \"foodName\": \"ชื่ออาหารภาษาไทย\", \"description\": \"คำอธิบายอาหารและส่วนประกอบหลัก\", \"nutritionalInfo\": { \"calories\": จำนวนแคลอรี่โดยประมาณ, \"protein\": จำนวนโปรตีนเป็นกรัม, \"fat\": จำนวนไขมันเป็นกรัม, \"carbs\": จำนวนคาร์โบไฮเดรตเป็นกรัม, \"servingSize\": \"ขนาด 1 จาน (ประมาณกรัม)\" }, \"category\": \"[เลือกหนึ่งหมวดหมู่: protein, vegetable, fruit, grain, dairy, snack, beverage, other]\" }"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });
    
    try {
      // แยก JSON จากคำตอบ
      const content = response.choices[0].message.content || '';
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*?}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      
      // แปลง string เป็น JSON
      const result = JSON.parse(jsonString);
      
      return NextResponse.json({ result });
    } catch (error) {
      console.error('Error parsing JSON response from OpenAI:', error);
      return NextResponse.json({ 
        error: 'ไม่สามารถแปลงผลลัพธ์จาก AI ได้',
        rawResponse: response.choices[0].message.content 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error analyzing food with OpenAI:', error);
    return NextResponse.json({ 
      error: error.message || 'เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ',
      mockResult: {
        foodName: "อาหารไทยทั่วไป",
        description: "ไม่สามารถวิเคราะห์อาหารได้ในขณะนี้",
        nutritionalInfo: {
          calories: 300,
          protein: 15,
          fat: 10,
          carbs: 35,
          servingSize: "1 จาน (200g)"
        },
        category: "other"
      }
    }, { status: 200 });
  }
} 