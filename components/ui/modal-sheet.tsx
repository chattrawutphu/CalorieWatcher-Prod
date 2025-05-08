"use client";

import React from "react";
import BottomSheet from "./bottom-sheet";

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  contentClass?: string;
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
  contentClass = ""
}: ModalSheetProps) => {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      height="fullscreen"
      showCloseButton={showCloseButton}
      showDragHandle={false}
    >
      <div className={`p-4 ${contentClass}`}>
        {children}
      </div>
    </BottomSheet>
  );
}; 