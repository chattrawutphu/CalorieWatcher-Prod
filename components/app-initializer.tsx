"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer = ({ children }: AppInitializerProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Simple initialization logic
    const initialize = async () => {
      // Add any app initialization logic here if needed
      
      // Mark as initialized
      setIsInitialized(true);
    };

    initialize();
  }, []);

  // Show loading state until initialized
  if (!isInitialized && pathname !== "/") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-gray-500">Starting app...</p>
      </div>
    );
  }

  return <>{children}</>;
}; 