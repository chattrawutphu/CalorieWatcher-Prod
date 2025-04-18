"use client";

import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrowserMultiFormatReader } from '@zxing/library';
import { FoodItem } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { getFoodByBarcode, isValidBarcode } from "@/lib/api/barcode-api";

interface BarcodeScannerProps {
  onFoodFound: (food: FoodItem) => void;
  onBack: () => void;
}

const BarcodeScanner = ({ onFoodFound, onBack }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraPermissionRequested, setCameraPermissionRequested] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // เตรียม scanner
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    return () => {
      // Cleanup function to stop scanning when component unmounts
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);
  
  // Start/stop scanner based on isScanning state
  useEffect(() => {
    if (!codeReader.current || !videoRef.current) return;
    
    if (isScanning) {
      startScanner();
    } else if (codeReader.current) {
      codeReader.current.reset();
    }
    
    async function startScanner() {
      try {
        const videoElement = videoRef.current;
        if (!videoElement) return;
        
        setCameraPermissionRequested(true);
        
        // Check if user has previously granted camera permissions
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        
        if (cameras.length === 0) {
          throw new Error("No camera found on this device");
        }
        
        // Start scanning with explicit constraints
        await codeReader.current!.decodeFromConstraints(
          {
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          },
          videoElement,
          (result, error) => {
            if (result) {
              console.log("Scanned barcode:", result.getText());
              // เมื่อพบบาร์โค้ด ให้หยุดการสแกนและค้นหาข้อมูลอาหาร
              setIsScanning(false);
              lookupBarcodeData(result.getText());
            }
            
            if (error && error.name !== 'NotFoundException') {
              console.error("Scanner error:", error);
            }
          }
        );
      } catch (err: any) {
        console.error("Failed to start scanner:", err);
        
        // Handle specific error cases with more helpful messages
        if (err.name === 'NotAllowedError') {
          setError("คุณไม่ได้อนุญาตให้เข้าถึงกล้อง กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่าเบราว์เซอร์");
        } else if (err.name === 'NotFoundError' || err.message.includes('No camera found')) {
          setError("ไม่พบกล้องบนอุปกรณ์นี้ กรุณาใช้อุปกรณ์ที่มีกล้อง");
        } else if (err.name === 'NotReadableError') {
          setError("ไม่สามารถเข้าถึงกล้องได้ อาจเนื่องจากกล้องกำลังถูกใช้งานโดยแอปพลิเคชันอื่น");
        } else {
          setError(`ไม่สามารถเข้าถึงกล้องได้: ${err.message || 'โปรดตรวจสอบการเชื่อมต่อกล้อง'}`);
        }
        
        setIsScanning(false);
      }
    }
  }, [isScanning]);
  
  // Explicitly request camera permission before starting scanner
  const requestCameraPermission = async () => {
    setCameraPermissionRequested(true);
    try {
      // ขอสิทธิ์การเข้าถึงกล้อง
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      // หากได้รับอนุญาต ให้หยุด stream และเริ่มสแกนเนอร์
      stream.getTracks().forEach(track => track.stop());
      
      // เริ่มสแกนเนอร์
      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera permission error:", err);
      
      if (err.name === 'NotAllowedError') {
        setError(t.mobileNav.barcodeScanner.errors.cameraPermission);
      } else if (err.name === 'NotFoundError') {
        setError(t.mobileNav.barcodeScanner.errors.noCamera);
      } else {
        setError(`${t.mobileNav.barcodeScanner.errors.general} ${err.message || ''}`);
      }
    }
  };
  
  // ค้นหาข้อมูลอาหารจากบาร์โค้ด
  const lookupBarcodeData = async (barcode: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // ตรวจสอบว่าบาร์โค้ดถูกต้องหรือไม่
      if (!isValidBarcode(barcode)) {
        setError(t.mobileNav.barcodeScanner.errors.invalidBarcode);
        setIsLoading(false);
        return;
      }
      
      // ค้นหาข้อมูลอาหารจากบาร์โค้ด
      const foodData = await getFoodByBarcode(barcode);
      
      if (foodData) {
        // พบข้อมูลอาหาร ส่งต่อไปยัง parent component
        onFoodFound(foodData);
      } else {
        setError(t.mobileNav.barcodeScanner.errors.notFound);
      }
    } catch (err) {
      console.error("Error looking up barcode:", err);
      setError(t.mobileNav.barcodeScanner.errors.general);
    } finally {
      setIsLoading(false);
      setManualBarcode("");
    }
  };
  
  // ค้นหาบาร์โค้ดที่ป้อนด้วยตนเอง
  const handleManualLookup = async () => {
    if (manualBarcode) {
      await lookupBarcodeData(manualBarcode);
    }
  };

  return (
    <div className="space-y-6">
      {isScanning ? (
        <div className="relative rounded-xl overflow-hidden h-64 bg-black">
          {/* กล้องสำหรับสแกนบาร์โค้ด */}
          <video ref={videoRef} className="w-full h-full object-cover" />
          
          {/* เส้นเป้าหมาย */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-white/60 rounded-lg w-3/4 h-1/3 flex items-center justify-center">
              <div className="w-full absolute h-0.5 bg-[hsl(var(--primary))]" />
            </div>
          </div>
          
          {/* ปุ่มยกเลิกการสแกน */}
          <Button
            onClick={() => setIsScanning(false)}
            variant="outline"
            className="absolute right-3 top-3 h-10 w-10 p-0 rounded-full bg-white/10 backdrop-blur-md border-white/30"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="bg-black/5 rounded-xl h-64 flex items-center justify-center border-2 border-dashed border-[hsl(var(--border))]">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))] animate-spin" />
              <p className="text-[hsl(var(--muted-foreground))]">{t.mobileNav.barcodeScanner.searching}</p>
            </div>
          ) : (
            <div className="text-center p-4">
              <Camera className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
              <p className="text-[hsl(var(--muted-foreground))] mb-4">{t.mobileNav.barcodeScanner.scanInstructions}</p>
              <Button
                className="mb-4"
                onClick={requestCameraPermission}
              >
                {t.mobileNav.barcodeScanner.openCamera}
              </Button>
              
              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-300 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* ป้อนบาร์โค้ดด้วยตนเอง */}
      <div className="space-y-2">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          {t.mobileNav.barcodeScanner.manualInput}
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="8850329112224"
            className="rounded-xl"
          />
          <Button 
            variant="outline" 
            className="flex-shrink-0"
            onClick={handleManualLookup}
            disabled={!manualBarcode || isLoading}
          >
            {t.mobileNav.barcodeScanner.searchButton}
          </Button>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {t.mobileNav.barcodeScanner.testBarcodes}
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner; 