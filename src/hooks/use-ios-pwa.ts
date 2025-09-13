// src/hooks/use-ios-pwa.ts
"use client";

import { useState, useEffect } from 'react';

export function useIosPwa() {
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the user is on an iOS device
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Check if the app is running in standalone mode (i.e., installed)
    const isPWAStandalone = window.matchMedia('(display-mode: standalone)').matches;

    setIsIos(isIOSDevice);
    setIsStandalone(isPWAStandalone);
  }, []);

  return { 
    isIos,
    // True if it's an iOS device and the app is NOT installed yet
    showInstallPrompt: isIos && !isStandalone 
  };
}
