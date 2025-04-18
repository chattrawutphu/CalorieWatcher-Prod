"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { jellyItem } from "./animations";

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
}

// Version มีการ Memoize เพื่อหลีกเลี่ยงการ re-render ที่ไม่จำเป็น
const QuickActionButton = memo(function QuickActionButton({ 
  icon, 
  label, 
  description, 
  onClick 
}: QuickActionButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Button
        onClick={onClick}
        variant="outline"
        className="w-full h-auto p-4 flex items-start gap-4 hover:bg-[hsl(var(--muted))] transition-colors relative group"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-grow text-left">
          <div className="font-medium">{label}</div>
          <div className="text-sm text-[hsl(var(--muted-foreground))]">{description}</div>
        </div>
        <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>
    </motion.div>
  );
});

export default QuickActionButton; 