// src/context/locale-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import fr from '@/locales/fr.json';
import en from '@/locales/en.json';

export type Language = 'fr' | 'en';
export type Currency = 'XOF' | 'EUR' | 'USD';

interface LocaleContextType {
  locale: Language;
  setLocale: (locale: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getCategoryName: (key: string) => string;
}

const translations = { fr, en };

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Language>('fr');
  const [currency, setCurrencyState] = useState<Currency>('XOF');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') as Language;
    const storedCurrency = localStorage.getItem('currency') as Currency;
    if (storedLocale && ['fr', 'en'].includes(storedLocale)) {
      setLocaleState(storedLocale);
    }
    if (storedCurrency && ['XOF', 'EUR', 'USD'].includes(storedCurrency)) {
      setCurrencyState(storedCurrency);
    }
    setIsLoaded(true);
  }, []);

  const setLocale = (newLocale: Language) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };
  
  const t = useCallback((key: string, options?: { [key: string]: string | number }) => {
    let translation = translations[locale][key as keyof typeof fr] || key;
    if (options) {
      Object.keys(options).forEach(optionKey => {
        translation = translation.replace(`{{${optionKey}}}`, String(options[optionKey]));
      });
    }
    return translation;
  }, [locale]);
  
  const getCategoryName = useCallback((key: string) => {
    return t(`category_${key.toLowerCase().replace(' ', '_')}`);
  }, [t]);

  const formatCurrency = useCallback((amount: number) => {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'XOF' ? 0 : 2,
      maximumFractionDigits: currency === 'XOF' ? 0 : 2,
    };
    // For XOF, use a custom format to match "FCFA"
    if (currency === 'XOF') {
      return `${amount.toLocaleString('fr-FR')} FCFA`;
    }
    return new Intl.NumberFormat(locale, options).format(amount);
  }, [currency, locale]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [locale]);

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, currency, setCurrency, t, formatCurrency, formatDate, getCategoryName }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
