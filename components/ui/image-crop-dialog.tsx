"use client";

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ImageCropDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
  imageUrl: string;
}

export function ImageCropDialog({
  isOpen,
  onClose,
  onCropComplete,
  imageUrl
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [isLoading, setIsLoading] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // ใช้ฟังก์ชั่นนี้เพื่อสร้าง crop ตรงกลางเมื่อรูปภาพโหลดเสร็จ
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setImgDimensions({ width, height });
    
    // ทำให้ crop เป็นวงกลมตรงกลางของรูปภาพ
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1, // aspect ratio 1:1
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  }

  const getCroppedImg = async () => {
    try {
      setIsLoading(true);
      if (!imageRef.current || !crop) {
        toast({
          title: "Error",
          description: "Unable to crop image. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const canvas = document.createElement('canvas');
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
      
      // ตั้งค่าขนาด canvas เป็น 400x400 pixels (ขนาดที่ต้องการ)
      canvas.width = 400;
      canvas.height = 400;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast({
          title: "Error",
          description: "Canvas context not available. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // คำนวณพื้นที่ที่จะ crop
      const cropX = crop.x * scaleX / 100 * imgDimensions.width;
      const cropY = crop.y * scaleY / 100 * imgDimensions.height;
      const cropWidth = crop.width * scaleX / 100 * imgDimensions.width;
      const cropHeight = crop.height * scaleY / 100 * imgDimensions.height;

      // Fill with white background for transparent PNGs
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(
        imageRef.current,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // แปลง canvas เป็น URL
      const croppedImageUrl = canvas.toDataURL('image/webp', 0.8);
      onCropComplete(croppedImageUrl);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      toast({
        title: "Error",
        description: "Could not crop image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // รีเซ็ต crop เมื่อ dialog เปิด
    if (isOpen) {
      setCrop(undefined);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Crop Profile Image</DialogTitle>
        </DialogHeader>
        <div className="p-4 pt-2 max-h-[60vh] overflow-auto touch-none">
          {imageUrl && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={1}
              circularCrop
              keepSelection
            >
              <img
                ref={imageRef}
                src={imageUrl}
                style={{ maxWidth: '100%', maxHeight: '50vh' }}
                alt="Crop me"
                onLoad={onImageLoad}
              />
            </ReactCrop>
          )}
        </div>
        <DialogFooter className="p-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={getCroppedImg} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 