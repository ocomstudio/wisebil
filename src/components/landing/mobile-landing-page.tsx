// src/components/landing/mobile-landing-page.tsx
"use client";

import { useState } from 'react';
import { MobileWelcomeFlow } from '@/components/landing/mobile-welcome-flow';
import { MobileSplashScreen } from '@/components/landing/mobile-splash-screen';

export default function MobileLandingPage() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <MobileSplashScreen onFinished={() => setShowSplash(false)} />;
  }

  return <MobileWelcomeFlow />;
}
