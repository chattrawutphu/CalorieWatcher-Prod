"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import { Check } from "lucide-react";

interface ThemeButtonProps {
  theme: string;
  icon: React.ReactNode;
  label: string;
}

export function ThemeButton({ theme, icon, label }: ThemeButtonProps) {
  const { setTheme, theme: activeTheme } = useTheme();
  
  const isActive = activeTheme === theme;
  
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => setTheme(theme)}
      className={`flex items-center justify-start h-9 px-2 ${isActive ? 'relative' : ''}`}
    >
      {icon}
      <span className="text-xs truncate max-w-[70px]">{label}</span>
      {isActive && (
        <Check className="h-3 w-3 absolute right-1" />
      )}
    </Button>
  );
} 