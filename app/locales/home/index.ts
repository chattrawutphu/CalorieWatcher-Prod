import { homeTranslations as enTranslations } from './en';
import { homeTranslations as thTranslations } from './th';
import { homeTranslations as jaTranslations } from './ja';
import { homeTranslations as zhTranslations } from './zh';

export const homeTranslations = {
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