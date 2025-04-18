import React from 'react';
import { useNutritionStore } from '@/lib/store/nutrition-store';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/components/providers/language-provider';
import { aiAssistantTranslations } from '@/lib/translations/ai-assistant';

export function SyncStatus() {
  const { isLoading, error, isInitialized } = useNutritionStore();
  const { status } = useSession();
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="flex items-center text-sm">
      {isLoading && (
        <div className="flex items-center text-yellow-500">
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          <span>{t.app.sync.syncing}</span>
        </div>
      )}
      
      {!isLoading && error && (
        <div className="flex items-center text-red-500">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span>{t.app.sync.syncFailed}</span>
        </div>
      )}
      
      {/* Success message has been completely removed - nothing shows when sync completes successfully */}
    </div>
  );
} 