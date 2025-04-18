"use client";

import dynamic from "next/dynamic";

const IOSInstallPrompt = dynamic(() => import('@/components/ios-install-prompt'), { 
  ssr: false 
});

export default function IOSInstallPromptWrapper() {
  return <IOSInstallPrompt />;
} 