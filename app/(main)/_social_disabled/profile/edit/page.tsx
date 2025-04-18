"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload, Camera, Edit2, ChevronLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { ImageCropDialog } from "@/components/ui/image-crop-dialog";

// Default user data structure
const DEFAULT_USER = {
  id: "user1",
  name: "Your Name",
  description: "Fitness enthusiast | Weight loss journey",
  profileImage: "https://i.pravatar.cc/150?img=10",
  stats: {
    posts: 124,
    friends: 845,
    groups: 15,
  },
};

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageFile: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setInitialLoading(true);
        
        // Fetch user data from the API with cache busting
        const response = await fetch(`/api/update-profile?_=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const data = await response.json();
        
        if (data.success && data.user) {
          // Use the fetched data
          setFormData({
            name: data.user.name || DEFAULT_USER.name,
            description: data.user.description || DEFAULT_USER.description,
            imageFile: null,
          });
          // Add cache busting parameter
          const profileImage = data.user.profileImage || DEFAULT_USER.profileImage;
          setImagePreview(profileImage.includes('?') ? profileImage : `${profileImage}?v=${Date.now()}`);
        } else {
          // If API call succeeds but doesn't return user data
          console.warn("API returned success:true but no user data");
          setFormData({
            name: DEFAULT_USER.name,
            description: DEFAULT_USER.description,
            imageFile: null,
          });
          setImagePreview(DEFAULT_USER.profileImage);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Could not load profile data. Using default data instead.",
          variant: "destructive",
        });
        setFormData({
          name: DEFAULT_USER.name,
          description: DEFAULT_USER.description,
          imageFile: null,
        });
        setImagePreview(DEFAULT_USER.profileImage);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size - max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview and show crop dialog
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setShowCropDialog(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      setImagePreview(croppedImageUrl);
      
      // Convert base64 to blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      // Create a File object
      const file = new File([blob], 'profile-image.webp', { type: 'image/webp' });
      
      setFormData({
        ...formData,
        imageFile: file,
      });
    } catch (error) {
      console.error('Error processing cropped image:', error);
      toast({
        title: "Error",
        description: "Unable to process cropped image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTakePhoto = async () => {
    // This would be implemented for mobile devices
    // Could use the device camera API
    toast({
      title: "Camera feature",
      description: "This feature will be implemented soon",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First upload the image if there is one
      let profileImageUrl = imagePreview;
      let isBase64Image = false;
      
      if (formData.imageFile) {
        try {
          // Create a FormData object to send the file
          const imageFormData = new FormData();
          imageFormData.append("file", formData.imageFile);
          
          // Upload the cropped image
          const uploadResponse = await fetch("/api/upload-profile-image", {
            method: "POST",
            body: imageFormData,
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || "Failed to upload image");
          }
          
          const imageData = await uploadResponse.json();
          profileImageUrl = imageData.url;
          isBase64Image = imageData.isBase64 || false;
          
          // ถ้าเป็นรูปภาพ base64 เก็บลงใน localStorage สำหรับใช้ระหว่าง session
          if (isBase64Image && typeof window !== 'undefined' && profileImageUrl) {
            try {
              localStorage.setItem('profileImage', profileImageUrl);
            } catch (err) {
              console.warn('Failed to save profile image to localStorage:', err);
            }
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          // ใช้ base64 จาก crop โดยตรงถ้าการอัพโหลดล้มเหลว
          profileImageUrl = imagePreview;
          isBase64Image = true;
          toast({
            title: "Warning",
            description: "Using local image only. Your image won't persist across sessions.",
            variant: "destructive",
          });
        }
      }
      
      // Update the profile data
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          profileImage: profileImageUrl,
          isBase64Image: isBase64Image
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      // Navigate back to profile page
      router.push("/social/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-[hsl(var(--primary))]"></div>
            <p>Loading profile data...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-4 px-0 sm:py-6 sm:px-0">
        {/* Mobile header with back button */}
        <div className="mb-4 flex items-center px-4 sm:px-0">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm font-medium sm:text-base"
          >
            <ChevronLeft className="mr-1 h-4 w-4 sm:h-5 sm:w-5" />
            Back to Profile
          </button>
          <h1 className="text-lg font-bold ml-4 sm:text-2xl">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-4 sm:px-0">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-[hsl(var(--background))]">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-4xl">
                    {formData.name.charAt(0)}
                  </AvatarFallback>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full bg-[hsl(var(--primary))] p-2 text-white shadow-md"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTakePhoto}
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your name"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>

      {/* Image Crop Dialog */}
      {selectedImage && (
        <ImageCropDialog
          isOpen={showCropDialog}
          onClose={() => setShowCropDialog(false)}
          onCropComplete={handleCropComplete}
          imageUrl={selectedImage}
        />
      )}
    </Container>
  );
} 