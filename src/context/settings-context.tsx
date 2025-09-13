// src/context/settings-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useUserData } from './user-context';


interface Settings {
  isBalanceHidden: boolean;
  isPinLockEnabled: boolean;
  pin: string | null;
  isReminderEnabled?: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  checkPin: (pinToCheck: string) => boolean;
  isTemporarilyVisible: boolean;
  setIsTemporarilyVisible: (visible: boolean) => void;
}

const defaultSettings: Settings = {
  isBalanceHidden: false,
  isPinLockEnabled: false,
  pin: null,
  isReminderEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { userData } = useUserData();
  const [isTemporarilyVisible, setIsTemporarilyVisible] = useState(false);
  const { user } = useAuth();

  const settings = useMemo(() => {
    const loadedSettings = userData?.settings || {};
    return { ...defaultSettings, ...loadedSettings };
  }, [userData]);

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    const updatedSettings = { ...settings, ...newSettings };
    
    try {
        await updateDoc(userDocRef, { settings: updatedSettings });
    } catch(e) {
        console.error("Failed to update settings in Firestore", e);
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
