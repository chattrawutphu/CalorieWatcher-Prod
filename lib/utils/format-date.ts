import { socialTranslations } from "@/app/locales/social";
import { formatTranslation } from "@/app/locales/social";

export function formatDate(dateString: string, locale: string = 'en'): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  const t = socialTranslations[locale as keyof typeof socialTranslations] || socialTranslations.en;
  
  if (diffSecs < 60) {
    return t.justNow;
  } else if (diffMins < 60) {
    return diffMins === 1 
      ? t.minuteAgo 
      : formatTranslation(t.minutesAgo, { count: diffMins });
  } else if (diffHours < 24) {
    return diffHours === 1 
      ? t.hourAgo 
      : formatTranslation(t.hoursAgo, { count: diffHours });
  } else if (diffDays < 7) {
    return diffDays === 1 
      ? t.dayAgo 
      : formatTranslation(t.daysAgo, { count: diffDays });
  } else {
    return date.toLocaleDateString();
  }
} 