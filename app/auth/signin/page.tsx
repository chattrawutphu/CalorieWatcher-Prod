"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

// Translations
const translations = {
  en: {
    welcome: "Welcome",
    subtitle: "Track your nutrition journey",
    description: "Sign in to continue",
    googleSignIn: "Continue with Google",
    appleSignIn: "Continue with Apple",
    features: ["Easy Tracking", "Smart Goals", "Daily Insights"],
  },
  th: {
    welcome: "ยินดีต้อนรับ",
    subtitle: "ติดตามการทานอาหารของคุณ",
    description: "เข้าสู่ระบบเพื่อดำเนินการต่อ",
    googleSignIn: "ดำเนินการต่อด้วย Google",
    appleSignIn: "ดำเนินการต่อด้วย Apple",
    features: ["ติดตามง่าย", "เป้าหมายอัจฉริยะ", "ข้อมูลเชิงลึกรายวัน"],
  },
  ja: {
    welcome: "ようこそ",
    subtitle: "栄養摂取を追跡",
    description: "続行するにはサインイン",
    googleSignIn: "Google で続行",
    appleSignIn: "Apple で続行",
    features: ["簡単な追跡", "スマートな目標", "日々のインサイト"],
  },
  zh: {
    welcome: "欢迎",
    subtitle: "追踪您的营养之旅",
    description: "登录以继续",
    googleSignIn: "使用 Google 继续",
    appleSignIn: "使用 Apple 继续",
    features: ["轻松追踪", "智能目标", "每日见解"],
  },
};

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
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function SignInPage() {
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const [showAppleForm, setShowAppleForm] = useState(false);
  const [appleFormData, setAppleFormData] = useState({ name: '', email: '' });
  const { status } = useSession();
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      // ใช้ setTimeout เพื่อให้แน่ใจว่า session ได้ถูกโหลดมาแล้ว
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 100);
      return () => clearTimeout(timer);
    } else if (status === "unauthenticated") {
      // ตรวจสอบว่าเคยล็อกอินไว้หรือไม่
      try {
        const isLoggedIn = localStorage.getItem('user-logged-in') === 'true';
        const lastLoginTime = localStorage.getItem('last-login-time');
        
        if (isLoggedIn && lastLoginTime) {
          const lastLogin = new Date(lastLoginTime);
          const now = new Date();
          const daysDiff = (now.getTime() - lastLogin.getTime()) / (1000 * 3600 * 24);
          
          // ถ้าเคยล็อกอินและยังไม่เกิน 7 วัน ให้พยายามใช้ session เดิม
          if (daysDiff < 7) {
            // ลองใช้ข้อมูลเดิมในการพยายามล็อกอินอีกครั้ง (auto sign-in)
            const userEmail = localStorage.getItem('user-email');
            if (userEmail) {
              console.log(`[Auth] Found recent login within ${Math.round(daysDiff * 24)} hours, attempting to restore session...`);
              // แสดง loading เพื่อรอตรวจสอบ session
              setLoadingGoogle(true);
              
              // หน่วงเวลาเล็กน้อยเพื่อให้ระบบพยายามกู้คืน session
              const timer = setTimeout(() => {
                // ถ้าตรวจสอบแล้วว่าไม่มี session จริงๆ ให้หยุด loading
                if (status === "unauthenticated") {
                  setLoadingGoogle(false);
                }
              }, 2000);
              return () => clearTimeout(timer);
            }
          }
        }
      } catch (error) {
        console.error('Error checking local storage for previous login:', error);
      }
    }
  }, [status, router]);

  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      // Redirect through root loading page after sign-in
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoadingApple(true);
      setShowAppleForm(true);
    } catch (error) {
      console.error("Apple sign in error:", error);
    } finally {
      setLoadingApple(false);
    }
  };

  const handleAppleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingApple(true);
    try {
      // Redirect through root loading page after sign-in
      await signIn("apple", {
        callbackUrl: "/",
        ...appleFormData
      });
    } catch (error) {
      console.error("Apple sign in form error:", error);
    } finally {
      setLoadingApple(false);
      setShowAppleForm(false);
    }
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    // ไม่ต้องแสดง loading screen ที่นี่ เพราะ loading จะถูกจัดการที่ layout หลักของ main แล้ว
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[hsl(var(--background))]">
      {showAppleForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[hsl(var(--background))] p-6 rounded-xl shadow-xl w-[90%] max-w-md"
          >
            <h3 className="text-xl font-bold mb-4 text-center">Apple Sign In (Dummy)</h3>
            <form onSubmit={handleAppleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 rounded border bg-[hsl(var(--input))] border-[hsl(var(--border))]" 
                  value={appleFormData.name}
                  onChange={(e) => setAppleFormData({...appleFormData, name: e.target.value})}
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-2 rounded border bg-[hsl(var(--input))] border-[hsl(var(--border))]" 
                  value={appleFormData.email}
                  onChange={(e) => setAppleFormData({...appleFormData, email: e.target.value})}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAppleForm(false)}
                  className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 rounded-lg bg-gray-900 text-white"
                  disabled={loadingApple}
                >
                  {loadingApple ? (
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                      />
                    </div>
                  ) : 'Sign In'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[hsl(var(--primary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-[hsl(var(--secondary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-4 left-20 w-32 h-32 bg-[hsl(var(--accent))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000" />
      </div>

      <Card className="p-6 rounded-3xl shadow-lg border-[hsl(var(--border))] backdrop-blur-sm bg-[hsl(var(--background))/0.7]">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={item} className="text-center space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              {t.welcome}
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">{t.subtitle}</p>
          </motion.div>
          
          <motion.div variants={item} className="flex justify-center">
            <div className="w-16 h-1 bg-[hsl(var(--primary))] rounded-full" />
          </motion.div>
          
          <motion.div variants={item} className="space-y-3">
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
            
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loadingGoogle}
              className="w-full py-6 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.9] transition-all shadow-md"
            >
              <div className="flex items-center justify-center w-full space-x-2">
                {loadingGoogle ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                  />
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>{t.googleSignIn}</span>
                  </>
                )}
              </div>
            </Button>
            
            {/* Apple Sign In Button */}
            <Button
              onClick={handleAppleSignIn}
              disabled={loadingApple && !showAppleForm}
              className="w-full py-6 rounded-xl bg-gray-900 hover:bg-gray-800 transition-all shadow-md"
            >
              <div className="flex items-center justify-center w-full space-x-2">
                {loadingApple && !showAppleForm ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                  />
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20" 
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.33-.89 3.55-.84 1.5.09 2.64.64 3.35 1.64-3.03 1.83-2.54 5.87.31 7.1-.83 1.95-1.85 3.8-3.29 5.27zm-5.1-15.62c.05-2.08 1.79-3.84 3.69-3.66.27 2.03-1.7 4.28-3.69 3.66z"/>
                    </svg>
                    <span>{t.appleSignIn}</span>
                  </>
                )}
              </div>
            </Button>
          </motion.div>
          
          <motion.div
            variants={item}
            className="pt-6 space-y-4"
          >
            <div className="flex justify-center">
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-[hsl(var(--primary))]"
              >
                <ChevronDown size={24} />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              {t.features.map((feature, i) => (
                <motion.div
                  key={i}
                  className="p-2 rounded-lg bg-[hsl(var(--accent))/0.1] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm"
                  whileHover={{ y: -5, backgroundColor: "hsl(var(--accent))" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Card>
    </div>
  );
} 