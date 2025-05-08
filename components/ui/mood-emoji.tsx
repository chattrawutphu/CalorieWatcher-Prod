"use client";

import React, { memo } from "react";

interface MoodEmojiProps {
  rating: number;
  selected: boolean;
  onClick: () => void;
}

const MoodEmoji = ({
  rating,
  selected,
  onClick
}: MoodEmojiProps) => {
  const emojis = ["😖", "😔", "😐", "😊", "😁"];
  
  return (
    <button
      onClick={onClick}
      className={`text-2xl sm:text-xl transition-all ${selected ? 'transform scale-125' : 'opacity-50'}`}
      aria-label={`Mood rating ${rating}`}
    >
      {emojis[rating - 1]}
    </button>
  );
};

export default memo(MoodEmoji); 