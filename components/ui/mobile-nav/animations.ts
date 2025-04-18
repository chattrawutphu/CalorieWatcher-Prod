// Animation variants สำหรับใช้ใน mobile-nav components

// Container animation variants
export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

// Nav container animation (optimized)
export const navContainer = {
  hidden: { opacity: 0.8 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

// Nav item animation (optimized)
export const navItem = {
  hidden: { y: 10, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "tween",
      duration: 0.2
    }
  }
};

// Standard item animation (optimized)
export const item = {
  hidden: { y: 10, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "tween",
      duration: 0.2
    }
  }
};

// Jelly animation effect (optimized)
export const jellyItem = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: {
      duration: 0.2
    }
  }
};

// Bottom sheet overlay animation - ปรับให้เหมือนกับ Edit Layout popup
export const overlayVariants = {
  hidden: { 
    opacity: 0,
    transition: {
      duration: 0.25
    }
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.25
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.25
    }
  }
};

// Bottom sheet animation - ปรับให้เหมือนกับ Edit Layout popup
export const bottomSheetVariants = {
  hidden: { 
    y: "100%", 
    opacity: 0.8,
    transition: {
      type: "tween",
      duration: 0.3,
      ease: "easeOut"
    }
  },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "tween",
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    y: "100%",
    opacity: 0,
    transition: { 
      type: "tween",
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

// Legacy animations - keeping for backwards compatibility
export const overlayAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { 
    duration: 0.2,
    ease: "easeInOut" 
  }
};

export const sheetAnimation = {
  initial: { y: "100%" },
  animate: { 
    y: 0,
    transition: { 
      type: "tween", 
      duration: 0.3,
      ease: "easeOut"
    } 
  },
  exit: { 
    y: "100%", 
    transition: { 
      type: "tween", 
      duration: 0.2,
      ease: "easeIn"
    } 
  }
};

// Add CSS class for exit animation - จะเพิ่มไว้ใน global CSS
export const exitAnimationCSS = `
.bottom-sheet-container.exit-animation {
  animation: slideDown 0.3s ease-in forwards;
}

@keyframes slideDown {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}
`; 