// src/context/settings-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Settings {
  isBalanceHidden: boolean;
  isPinLockEnabled: boolean;
  pin: string | null;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  checkPin: (pinToCheck: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    isBalanceHidden: true,
    isPinLockEnabled: false,
    pin: null, 
  });

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  }, []);

  const checkPin = useCallback((pinToCheck: string) => {
    return settings.pin === pinToCheck;
  }, [settings.pin]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, checkPin }}>
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
