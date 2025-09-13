// src/components/pwa/ios-install-prompt.tsx
"use client";

import { ArrowDown, Share } from 'lucide-react';
import { useLocale } from '@/context/locale-context';

export function IosInstallPrompt() {
  const { t } = useLocale();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm p-4 border-t border-border shadow-lg animate-fade-in-up z-50">
      <div className="flex flex-col items-center text-center text-sm">
        <p className="font-semibold mb-2">{t('ios_install_prompt_title')}</p>
        <p className="text-muted-foreground">
          {t('ios_install_prompt_step1')} <Share className="inline-block h-4 w-4 mx-1" /> {t('ios_install_prompt_step2')}
        </p>
        <ArrowDown className="h-6 w-6 text-primary mt-2 animate-bounce" />
      </div>
    </div>
  );
}
