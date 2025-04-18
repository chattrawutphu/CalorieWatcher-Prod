"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(navigator as any).standalone;
};

const isInStandaloneMode = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || 
         ('standalone' in window.navigator && (window.navigator as any).standalone === true);
};

const hasPromptBeenShown = () => {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem('iosInstallPromptShown') === 'true';
};

const setPromptShown = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('iosInstallPromptShown', 'true');
  }
};

export default function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check after a short delay to ensure everything is loaded
    const timer = setTimeout(() => {
      const shouldShow = isIOS() && !isInStandaloneMode() && !hasPromptBeenShown();
      setShowPrompt(shouldShow);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowPrompt(false);
    setPromptShown();
  };

  const promptVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    exit: { 
      y: 100, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-20 inset-x-0 z-50 p-4 flex justify-center"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={promptVariants}
      >
        <div className="relative bg-[hsl(var(--background))] rounded-xl shadow-xl border border-[hsl(var(--border))] p-4 max-w-sm w-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[hsl(var(--primary)/0.15)] rounded-full flex-shrink-0">
              <Share className="h-6 w-6 text-[hsl(var(--primary))]" />
            </div>
            
            <div>
              <h3 className="font-semibold text-base text-[hsl(var(--foreground))]">Install CalorieWatcher</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                For the best experience, add this app to your home screen.
              </p>
              
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium text-[hsl(var(--foreground))]">How to install:</p>
                <ol className="list-decimal pl-5 space-y-1 text-[hsl(var(--muted-foreground))]">
                  <li>Tap the share button <span className="inline-block"><Share className="h-3.5 w-3.5 inline" /></span></li>
                  <li>Scroll and select "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 