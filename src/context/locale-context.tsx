// src/context/locale-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import fr from '@/locales/fr.json';
import en from '@/locales/en.json';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

export type Language = 'fr' | 'en';
export type Currency = 'XOF' | 'EUR' | 'USD';

// Taux de conversion approximatifs par rapport à XOF
const conversionRates: Record<Currency, number> = {
    XOF: 1,
    EUR: 655.957, 
    USD: 610,
};


interface LocaleContextType {
  locale: Language;
  setLocale: (locale: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  formatCurrency: (amount: number, fromCurrency?: Currency) => string;
  getConvertedAmount: (amount: number, fromCurrency?: Currency) => number;
  formatDate: (dateString: string) => string;
  getCategoryName: (key: string) => string;
}

const translations = { fr, en };

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Language>('fr');
  const [currency, setCurrencyState] = useState<Currency>('XOF');
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);
  
  useEffect(() => {
    if (user) {
        // User is logged in, load from Firestore
        const userDocRef = getUserDocRef();
        if (!userDocRef) {
            setIsLoaded(true);
            return;
        }

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists() && docSnap.data().preferences) {
            const { language, currency } = docSnap.data().preferences;
            if (language) setLocaleState(language);
            if (currency) setCurrencyState(currency);
          }
          setIsLoaded(true);
        }, () => {
          setIsLoaded(true); // Ensure app loads even if Firestore fails
        });
        return unsubscribe;

    } else {
        // User is not logged in, use default values.
        setLocaleState('fr');
        setCurrencyState('XOF');
        setIsLoaded(true);
    }
  }, [user, getUserDocRef]);


  const setLocale = async (newLocale: Language) => {
    setLocaleState(newLocale);
    document.documentElement.lang = newLocale;

    if (user) {
        const userDocRef = getUserDocRef();
        if (userDocRef) {
            await setDoc(userDocRef, { preferences: { language: newLocale } }, { merge: true });
        }
    }
  };

  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (user) {
        const userDocRef = getUserDocRef();
        if (userDocRef) {
            await setDoc(userDocRef, { preferences: { currency: newCurrency } }, { merge: true });
        }
    }
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
    return t(`category_${key.toLowerCase().replace(/ /g, '_')}`);
  }, [t]);

  const getConvertedAmount = useCallback((amount: number, fromCurrency: Currency = 'XOF') => {
    if (fromCurrency === currency) {
      return amount;
    }
    // Convert amount from 'fromCurrency' to XOF (base), then to target currency
    const amountInXOF = amount * conversionRates[fromCurrency];
    return amountInXOF / conversionRates[currency];
  }, [currency]);
  
  const formatCurrency = useCallback((amount: number, fromCurrency: Currency = 'XOF') => {
    const convertedAmount = getConvertedAmount(amount, fromCurrency);
    
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'XOF' ? 0 : 2,
      maximumFractionDigits: currency === 'XOF' ? 0 : 2,
    };

    // Special formatting for XOF to place the symbol after the number.
    if (currency === 'XOF') {
      return `${convertedAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FCFA`;
    }

    return new Intl.NumberFormat(locale, options).format(convertedAmount);
  }, [currency, locale, getConvertedAmount]);

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
    <LocaleContext.Provider value={{ locale, setLocale, currency, setCurrency, t, formatCurrency, formatDate, getCategoryName, getConvertedAmount }}>
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
