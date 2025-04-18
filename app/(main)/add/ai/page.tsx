"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Upload, 
  Scan, 
  Camera, 
  Image as ImageIcon, 
  Loader2, 
  Bot, 
  Plus, 
  Clock,
  Sparkles,
  Utensils,
  Check,
  X,
  Flame,
  Dumbbell,
  Wheat,
  Droplet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useNutritionStore, FoodItem, FoodTemplate, MealFoodItem } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Mock AI analysis response
interface AIResponse {
  foodName: string;
  description: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    servingSize: string;
  };
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  portion?: string;
}

const mockAIResponse = (imageName: string): AIResponse => {
  // สร้างข้อมูลจำลองตามชื่อรูปภาพ
  if (imageName.toLowerCase().includes("salad")) {
    return {
      foodName: "ผักสลัดรวม",
      description: "สลัดผักรวมประกอบด้วยผักหลายชนิด เช่น ผักกาดแก้ว แครอท แตงกวา มะเขือเทศ และน้ำสลัด",
      nutritionalInfo: {
        calories: 120,
        protein: 2.5,
        fat: 6,
        carbs: 14,
        servingSize: "1 จาน (200g)"
      },
      category: "vegetable"
    };
  } else if (imageName.toLowerCase().includes("rice") || imageName.toLowerCase().includes("fried")) {
    return {
      foodName: "ข้าวผัด",
      description: "ข้าวผัดใส่ไข่ แครอท หอมใหญ่ และผักอื่นๆ ปรุงรสด้วยซอสถั่วเหลือง",
      nutritionalInfo: {
        calories: 350,
        protein: 8,
        fat: 12,
        carbs: 45,
        servingSize: "1 จาน (250g)"
      },
      category: "grain"
    };
  } else if (imageName.toLowerCase().includes("chicken")) {
    return {
      foodName: "อกไก่ย่าง",
      description: "อกไก่ย่างปรุงรสด้วยเครื่องเทศ มีโปรตีนสูงและไขมันต่ำ",
      nutritionalInfo: {
        calories: 180,
        protein: 28,
        fat: 4,
        carbs: 2,
        servingSize: "100g"
      },
      category: "protein"
    };
  } else {
    // กรณีทั่วไป
    return {
      foodName: "อาหารไทยทั่วไป",
      description: "อาหารไทยรสชาติกลมกล่อม มีส่วนผสมของเครื่องเทศและสมุนไพรหลากหลายชนิด",
      nutritionalInfo: {
        calories: 300,
        protein: 15,
        fat: 10,
        carbs: 35,
        servingSize: "1 จาน (200g)"
      },
      category: "other"
    };
  }
};

const AIAssistantPage = () => {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const { addMeal, addFoodTemplate } = useNutritionStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIResponse | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [quantity, setQuantity] = useState(1);
  const [addedToMeal, setAddedToMeal] = useState(false);
  
  // Handle image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setSelectedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
      
      // Reset states
      setAnalysisResult(null);
      setAddedToMeal(false);
    }
  };
  
  // Trigger file input dialog
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle camera capture
  const handleCameraCapture = () => {
    // เปิดกล้องถ่ายรูป (ในที่นี้จะจำลองโดยให้คลิกที่ปุ่มเพื่ออัปโหลดไฟล์แทน)
    handleUploadClick();
  };
  
  // Analyze the uploaded image
  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      // แปลง base64 string เป็น Blob
      const fetchResponse = await fetch(selectedImage);
      const blob = await fetchResponse.blob();
      
      // สร้าง File object จาก Blob
      const file = new File([blob], uploadedFileName || "food.jpg", { type: 'image/jpeg' });
      
      // สร้าง FormData
      const formData = new FormData();
      formData.append('image', file);
      
      // เรียกใช้ API route
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.error && !data.mockResult) {
        throw new Error(data.error);
      }
      
      // ใช้ข้อมูลจาก API หรือ mock data ในกรณีที่ API มีข้อผิดพลาด
      const result = data.result || data.mockResult;
      
      if (result) {
        setAnalysisResult(result);
      } else {
        throw new Error('ไม่สามารถวิเคราะห์รูปภาพได้');
      }
    } catch (error: any) {
      console.error("Error analyzing food:", error);
      
      // แสดงข้อความแจ้งเตือนและใช้ข้อมูลจำลองเพื่อให้ผู้ใช้ยังทดลองใช้ฟังก์ชันได้
      setAnalysisResult({
        foodName: "อาหารที่ไม่สามารถวิเคราะห์ได้",
        description: "เกิดข้อผิดพลาดในการวิเคราะห์ แต่คุณยังสามารถแก้ไขข้อมูลได้ด้วยตนเอง",
        nutritionalInfo: {
          calories: 300,
          protein: 15,
          fat: 10,
          carbs: 35,
          servingSize: "1 จาน (200g)"
        },
        category: "other"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Add food to meal log
  const addFoodToMealLog = () => {
    if (!analysisResult) return;
    
    // สร้าง FoodTemplate ก่อน
    const foodTemplate: FoodTemplate = {
      id: crypto.randomUUID(),
      name: analysisResult.foodName,
      calories: analysisResult.nutritionalInfo.calories,
      protein: analysisResult.nutritionalInfo.protein,
      carbs: analysisResult.nutritionalInfo.carbs,
      fat: analysisResult.nutritionalInfo.fat,
      servingSize: analysisResult.nutritionalInfo.servingSize || "1 serving",
      favorite: false,
      createdAt: new Date(),
      category: analysisResult.category || "other",
      isTemplate: true
    };

    // แปลง FoodTemplate เป็น MealFoodItem
    const mealFoodItem: MealFoodItem = {
      id: crypto.randomUUID(),
      name: foodTemplate.name,
      calories: foodTemplate.calories,
      protein: foodTemplate.protein,
      carbs: foodTemplate.carbs,
      fat: foodTemplate.fat,
      servingSize: foodTemplate.servingSize,
      category: foodTemplate.category,
      templateId: foodTemplate.id,
      recordedAt: new Date()
    };

    // เก็บ FoodTemplate ไว้ใช้ในอนาคต
    addFoodTemplate(foodTemplate);

    // เพิ่มมื้ออาหาร
    addMeal({
      id: crypto.randomUUID(),
      mealType: mealType,
      foodItem: mealFoodItem,
      quantity: quantity,
      date: new Date().toISOString().split('T')[0],
    });
    
    setAddedToMeal(true);
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header with Visual Element */}
        <motion.div variants={item} className="relative">
          {/* Back button with improved contrast */}
          <button 
            onClick={() => router.back()} 
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors z-10"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          {/* Header content with visual appeal */}
          <div className="flex flex-col items-center pt-2 pb-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))/0.1] flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-[hsl(var(--primary))]" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-1">{t.title}</h1>
            <p className="text-[hsl(var(--muted-foreground))] text-center text-sm max-w-xs mx-auto">
              {t.subtitle}
            </p>
          </div>
        </motion.div>
        
        {/* Feature description with visual aids */}
        <motion.div 
          variants={item} 
          className="bg-gradient-to-br from-[hsl(var(--primary))/0.1] to-[hsl(var(--background))] p-4 rounded-xl border border-[hsl(var(--border))]"
        >
          <div className="flex gap-3 items-start">
            <div className="min-w-8 w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-medium mb-1">{t.featureTitle}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                {t.featureDescription}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary))/0.1] px-2 py-1 text-xs text-[hsl(var(--primary))]">
                  <Sparkles className="h-3 w-3 mr-1" /> {t.featureTags.gpt4Vision}
                </span>
                <span className="inline-flex items-center rounded-full bg-[hsl(var(--muted))/0.5] px-2 py-1 text-xs">
                  {t.featureTags.supportAllFood}
                </span>
                <span className="inline-flex items-center rounded-full bg-[hsl(var(--muted))/0.5] px-2 py-1 text-xs">
                  {t.featureTags.highAccuracy}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Image Upload Area - Modern Design */}
        <motion.div variants={item}>
          {selectedImage ? (
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-[hsl(var(--border))]">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-0"></div>
              <div className="relative h-72 w-full rounded-xl overflow-hidden z-10">
                <Image 
                  src={selectedImage} 
                  alt="Food" 
                  fill 
                  style={{ objectFit: "cover" }} 
                  className="rounded-xl hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-20">
                <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs flex items-center">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-[150px]">{uploadedFileName || "Food Image"}</span>
                </div>
                
                <button 
                  onClick={() => setSelectedImage(null)} 
                  className="bg-black/50 backdrop-blur-md text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div 
                onClick={handleUploadClick}
                className="h-72 border-2 border-dashed border-[hsl(var(--border))] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-[hsl(var(--muted))/0.1] hover:bg-[hsl(var(--muted))/0.2] transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-[hsl(var(--primary))/0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))/0.1] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <Upload className="h-8 w-8 text-[hsl(var(--primary))] group-hover:text-[hsl(var(--primary))]" />
                </div>
                
                <p className="text-lg font-medium mb-1 group-hover:translate-y-[-2px] transition-transform">{t.upload.title}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{t.upload.dragDrop}</p>
                
                <div className="flex flex-wrap justify-center gap-1 max-w-xs">
                  {t.upload.formats.map((format, index) => (
                    <span key={index} className="text-xs bg-[hsl(var(--muted))/0.3] px-2 py-1 rounded-full">{format}</span>
                  ))}
                </div>
              </div>
              
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <span className="text-xs bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-full px-3 py-1 shadow-sm">
                  {t.upload.sizeLimit}
                </span>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </motion.div>
        
        {/* Upload Options */}
        {!selectedImage && (
          <motion.div variants={item} className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleUploadClick}
              variant="outline" 
              className="py-6 h-auto flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/0.5] hover:bg-[hsl(var(--primary))/0.05] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))/0.3] flex items-center justify-center">
                <ImageIcon className="h-5 w-5" />
              </div>
              <span>{t.uploadOptions.gallery}</span>
            </Button>
            
            <Button 
              onClick={handleCameraCapture}
              variant="outline" 
              className="py-6 h-auto flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/0.5] hover:bg-[hsl(var(--primary))/0.05] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))/0.3] flex items-center justify-center">
                <Camera className="h-5 w-5" />
              </div>
              <span>{t.uploadOptions.camera}</span>
            </Button>
          </motion.div>
        )}
        
        {/* Analysis Button */}
        {selectedImage && !analysisResult && !isAnalyzing && (
          <motion.div variants={item} className="space-y-3">
            <Button 
              onClick={analyzeImage}
              className="w-full py-4 h-auto text-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))/0.8] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="group-hover:scale-105 transition-transform duration-300">
                  {t.analyze.button}
                </span>
              </div>
            </Button>
            <div className="flex items-center justify-center gap-2">
              <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
                {t.analyze.apiUsage}
              </p>
              <div className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-[10px]">
                {t.analyze.highAccuracy}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Loading State with Animation */}
        {isAnalyzing && (
          <motion.div 
            variants={item} 
            className="bg-gradient-to-br from-[hsl(var(--primary))/0.1] to-[hsl(var(--background))] p-6 rounded-xl border border-[hsl(var(--primary))/0.2] overflow-hidden relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
              <div className="h-full bg-[hsl(var(--primary))]"></div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-[hsl(var(--primary))/0.2] flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-[hsl(var(--primary))] animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-lg">{t.analyzing.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.analyzing.pleaseWait}</p>
              </div>
            </div>
            
            <div className="bg-[hsl(var(--card))] rounded-lg p-4 ml-3 border-l-2 border-[hsl(var(--primary))]">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-[hsl(var(--primary))]`}></div>
                  <p className="text-sm">{t.analyzing.steps.step1}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse`}></div>
                  <p className="text-sm">{t.analyzing.steps.step2}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-[hsl(var(--muted))]`}></div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.analyzing.steps.step3}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Analysis Results */}
        {analysisResult && (
          <motion.div 
            variants={item}
            className="bg-[hsl(var(--card))] p-6 rounded-xl border border-[hsl(var(--card-foreground))/0.1] shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-medium mb-1">{t.addMeal.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.addMeal.subtitle}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setAnalysisResult(null)} 
                className="text-[hsl(var(--muted-foreground))]"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            
            <div className="space-y-5">
              {/* Food Name & Portion */}
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-[hsl(var(--primary))/0.1] flex items-center justify-center text-[hsl(var(--primary))]">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{analysisResult.foodName || 'Unknown Food'}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Portion: {analysisResult.nutritionalInfo?.servingSize || '1 serving'}
                  </p>
                </div>
              </div>
              
              {/* Nutrition Facts */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm mb-2 uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  {t.result.nutritionalInfo}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Calories */}
                  <div className="bg-[hsl(var(--background))] p-3 rounded-lg border border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                        <Flame className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.result.totalCalories}</p>
                        <p className="font-medium">{analysisResult.nutritionalInfo?.calories || '0'} kcal</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Protein */}
                  <div className="bg-[hsl(var(--background))] p-3 rounded-lg border border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Dumbbell className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.result.protein}</p>
                        <p className="font-medium">{analysisResult.nutritionalInfo?.protein || '0'} g</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Carbs */}
                  <div className="bg-[hsl(var(--background))] p-3 rounded-lg border border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Wheat className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.result.carbs}</p>
                        <p className="font-medium">{analysisResult.nutritionalInfo?.carbs || '0'} g</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fat */}
                  <div className="bg-[hsl(var(--background))] p-3 rounded-lg border border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <Droplet className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.result.fat}</p>
                        <p className="font-medium">{analysisResult.nutritionalInfo?.fat || '0'} g</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {analysisResult.description && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Description
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {analysisResult.description}
                  </p>
                </div>
              )}
              
              {/* Meal Type Selection */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  {t.addMeal.mealType}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => (
                    <Button
                      key={meal}
                      variant={mealType === meal ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMealType(meal)}
                      className={mealType === meal ? "" : "bg-[hsl(var(--background))]"}
                    >
                      {t.addMeal.mealTypes[meal]}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Log Button */}
              <Button 
                onClick={addFoodToMealLog} 
                className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))]"
              >
                {t.addMeal.saveButton}
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* GPT-4 Vision Tips */}
        {!analysisResult && !isAnalyzing && (
          <motion.div 
            variants={item} 
            className="mt-8 space-y-4"
          >
            <div className="border-t border-[hsl(var(--border))] pt-4">
              <h3 className="font-medium text-[hsl(var(--primary))] flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4" />
                <span>{t.tips.title}</span>
              </h3>
              
              <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                <li className="flex items-start gap-2">
                  <span className="bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>{t.tips.tip1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>{t.tips.tip2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>{t.tips.tip3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <span>{t.tips.tip4}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-[hsl(var(--primary))/0.05] rounded-lg p-4 border border-[hsl(var(--primary))/0.1] flex items-center gap-3">
              <Bot className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <p className="text-sm font-medium">{t.techInfo.title}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t.techInfo.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AIAssistantPage; 