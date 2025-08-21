// src/components/landing/mobile-splash-screen.tsx
"use client";

import { useEffect } from 'react';
import { Logo } from '@/components/common/logo';

export function MobileSplashScreen({ onFinished }: { onFinished: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished();
    }, 2500); // L'animation dure 2.5 secondes

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center bg-background p-6 overflow-hidden">
      <div className="animate-fade-in-scale">
        <Logo className="transform scale-150" />
      </div>
    </div>
  );
}
