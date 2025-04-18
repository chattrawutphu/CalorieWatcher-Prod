"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
  isLoading: boolean;
}

const PageTransition = ({ isLoading }: PageTransitionProps) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--background))/40] backdrop-blur-[1px]"
        >
          <motion.div 
            className="flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { 
                type: "spring", 
                damping: 20,
                stiffness: 300
              }
            }}
            exit={{ 
              scale: 0.9, 
              opacity: 0,
              transition: { duration: 0.15 } 
            }}
          >
            {/* Just dots in circular arrangement */}
            <div className="relative flex items-center justify-center h-16 w-48">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute h-5 w-5 rounded-full bg-[hsl(var(--primary))]"
                  style={{
                    left: `${24 * i + 24}px`, 
                  }}
                  initial={{ y: 0 }}
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 0.1,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageTransition; 