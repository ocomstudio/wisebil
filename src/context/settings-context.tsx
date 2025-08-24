
// src/context/settings-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface Settings {
  isBalanceHidden: boolean;
  isPinLockEnabled: boolean;
  pin: string | null;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  checkPin: (pinToCheck: string) => boolean;
  isTemporarilyVisible: boolean;
  setIsTemporarilyVisible: (visible: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    isBalanceHidden: false,
    isPinLockEnabled: false,
    pin: null,
  });
  const [isTemporarilyVisible, setIsTemporarilyVisible] = useState(false);
  const { user } = useAuth();

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  useEffect(() => {
    if (!user) {
      // Reset to default if user logs out
      setSettings({ isBalanceHidden: false, isPinLockEnabled: false, pin: null });
      return;
    }

    const userDocRef = getUserDocRef();
    if (!userDocRef) return;

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().settings) {
        setSettings(docSnap.data().settings);
      } else {
        // Initialize with default settings in Firestore if none exist
        setDoc(userDocRef, { settings }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [user, getUserDocRef]);


  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    const updatedSettings = { ...settings, ...newSettings };
    // Optimistically update local state
    setSettings(updatedSettings);

    try {
        await setDoc(userDocRef, { settings: updatedSettings }, { merge: true });
    } catch(e) {
        console.error("Failed to update settings in Firestore", e);
        // Optionally revert local state or show an error
    }
  }, [settings, getUserDocRef]);

  const checkPin = useCallback((pinToCheck: string) => {
    return settings.pin === pinToCheck;
  }, [settings.pin]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, checkPin, isTemporarilyVisible, setIsTemporarilyVisible }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

    