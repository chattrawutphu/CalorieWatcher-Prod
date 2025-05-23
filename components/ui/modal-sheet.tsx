"use client";

import React from "react";
import BottomSheet from "./bottom-sheet";
import { useNavigationCleanup } from "@/lib/hooks/use-navigation-cleanup";

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  contentClass?: string;
  closeOnNavigation?: boolean;
  preventBodyScroll?: boolean;
}

/**
 * ModalSheet - A fullscreen modal component that uses BottomSheet for consistent UI
 * This component should be used instead of regular modal dialogs for a consistent mobile experience
 */
export const ModalSheet = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  contentClass = "",
  closeOnNavigation = true,
  preventBodyScroll = true
}: ModalSheetProps) => {
  // Navigation cleanup
  useNavigationCleanup(isOpen, onClose, {
    closeOnNavigation,
    delay: 100
  });

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      height="fullscreen"
      showCloseButton={showCloseButton}
      showDragHandle={false}
      closeOnNavigation={closeOnNavigation}
      preventBodyScroll={preventBodyScroll}
      swipeThreshold={200} // Higher threshold for fullscreen
      velocityThreshold={600}
    >
      <div className={`p-4 ${contentClass}`}>
        {children}
      </div>
    </BottomSheet>
  );
}; 