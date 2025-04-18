import { mealsTranslations as enTranslations } from './en';
import { mealsTranslations as thTranslations } from './th';
import { mealsTranslations as jaTranslations } from './ja';
import { mealsTranslations as zhTranslations } from './zh';

export const mealsTranslations = {
  en: enTranslations,
  th: thTranslations,
  ja: jaTranslations,
  zh: zhTranslations,
};

// Helper function for formatting translations with placeholders
export const formatTranslation = (
  text: string, 
  params: Record<string, string | number> = {}
): string => {
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, text);
}; 