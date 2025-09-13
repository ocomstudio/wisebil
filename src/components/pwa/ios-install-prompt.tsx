// src/components/pwa/ios-install-prompt.tsx
"use client";

import { ArrowDown, Share } from 'lucide-react';

export function IosInstallPrompt() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm p-4 border-t border-border shadow-lg animate-fade-in-up z-50">
      <div className="flex flex-col items-center text-center text-sm">
        <p className="font-semibold mb-2">Installez Wisebil pour une meilleure expérience !</p>
        <p className="text-muted-foreground">
          Appuyez sur l'icône de Partage <Share className="inline-block h-4 w-4 mx-1" /> puis sur "Ajouter à l'écran d'accueil".
        </p>
        <ArrowDown className="h-6 w-6 text-primary mt-2 animate-bounce" />
      </div>
    </div>
  );
}
