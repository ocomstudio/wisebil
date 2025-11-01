// src/app/_offline/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WifiOff, Loader2 } from 'lucide-react';
import { useLocale } from '@/context/locale-context';
import { Logo } from '@/components/common/logo';

export default function OfflinePage() {
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    // Essaie de rediriger vers le tableau de bord, qui devrait être en cache
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-8 text-center">
        <div className="mb-8">
            <Logo />
        </div>
        <WifiOff className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-bold font-headline">Vous êtes hors ligne</h1>
        <p className="mt-2 text-muted-foreground">
            L'application se charge depuis le cache de votre appareil.
        </p>
        <div className="mt-8 flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement en cours...</span>
        </div>
    </div>
  );
}
