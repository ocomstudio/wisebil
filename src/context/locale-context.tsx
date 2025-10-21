// src/context/locale-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import axios from 'axios';
import fr from '@/locales/fr.json';
import en from '@/locales/en.json';
import de from '@/locales/de.json';
import es from '@/locales/es.json';
import vi from '@/locales/vi.json';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export type Language = 'fr' | 'en' | 'de' | 'es' | 'vi';
export type Currency = 'XOF' | 'EUR' | 'USD' | 'VND';

// Taux de conversion approximatifs par rapport à USD (devise de base)
const conversionRates: Record<Currency, number> = {
    USD: 1,
    EUR: 0.93,    // 1 USD = 0.93 EUR
    XOF: 610,     // 1 USD = 610 XOF
    VND: 25450,   // 1 USD = 25450 VND
};


interface LocaleContextType {
  locale: Language;
  setLocale: (locale: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  formatCurrency: (amount: number, fromCurrency?: Currency) => string;
  getConvertedAmount: (amount: number, fromCurrency?: Currency, toCurrency?: Currency) => number;
  formatDate: (dateString: string) => string;
  formatDateTime: (dateString: string) => string;
  getCategoryName: (key: string) => string;
}

const translations = { fr, en, de, es, vi };

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const getLocaleFromCountry = (countryCode: string): { lang: Language, curr: Currency } => {
    const countryMap: Record<string, { lang: Language, curr: Currency }> = {
        // Europe
        'FR': { lang: 'fr', curr: 'EUR' },
        'BE': { lang: 'fr', curr: 'EUR' },
        'CH': { lang: 'de', curr: 'EUR' }, // Swiss Franc not supported, default to EUR
        'LU': { lang: 'fr', curr: 'EUR' },
        'DE': { lang: 'de', curr: 'EUR' },
        'AT': { lang: 'de', curr: 'EUR' },
        'ES': { lang: 'es', curr: 'EUR' },
        // Africa (Francophone)
        'SN': { lang: 'fr', curr: 'XOF' },
        'CM': { lang: 'fr', curr: 'XOF' },
        'CI': { lang: 'fr', curr: 'XOF' },
        'TG': { lang: 'fr', curr: 'XOF' },
        'BJ': { lang: 'fr', curr: 'XOF' },
        'BF': { lang: 'fr', curr: 'XOF' },
        'NE': { lang: 'fr', curr: 'XOF' },
        'ML': { lang: 'fr', curr: 'XOF' },
        'GA': { lang: 'fr', curr: 'XOF' },
        'CG': { lang: 'fr', curr: 'XOF' },
        'CD': { lang: 'fr', curr: 'USD' }, // Use USD for DRC
        'TN': { lang: 'fr', curr: 'EUR' }, // Use EUR for Tunisia
        // Asia
        'VN': { lang: 'vi', curr: 'VND' },
        // North America
        'US': { lang: 'en', curr: 'USD' },
        'CA': { lang: 'en', curr: 'USD' }, // Default to USD for Canada
        // UK
        'GB': { lang: 'en', curr: 'EUR' }, // Default to EUR for UK
    };

    return countryMap[countryCode] || { lang: 'en', curr: 'USD' }; // Default to English/USD
}

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Language>('en');
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);
  
  useEffect(() => {
    const initializeLocale = async () => {
        if (user) {
            // User is logged in, load from Firestore
            const userDocRef = getUserDocRef();
            if (userDocRef) {
                const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists() && docSnap.data().preferences) {
                        const { language, currency } = docSnap.data().preferences;
                        if (language) setLocaleState(language);
                        if (currency) setCurrencyState(currency);
                    } else if (!docSnap.exists() || !docSnap.data().preferences) {
                       // If user exists but has no preferences, try to autodetect and save
                        axios.get('https://ipapi.co/json/').then(response => {
                            const countryCode = response.data?.country_code;
                            if (countryCode) {
                                const { lang, curr } = getLocaleFromCountry(countryCode);
                                setLocale(lang);
                                setCurrency(curr);
                            }
                        }).catch(() => {
                            // Fallback to defaults if IP detection fails
                           setLocaleState('en');
                           setCurrencyState('USD');
                        });
                    }
                    setIsLoaded(true);
                }, () => {
                    setIsLoaded(true); // Ensure app loads even if Firestore fails
                });
                return unsubscribe;
            } else {
                 setIsLoaded(true);
            }
        } else {
            // User not logged in, auto-detect from browser/IP
            try {
                const response = await axios.get('https://ipapi.co/json/');
                const countryCode = response.data?.country_code;
                if (countryCode) {
                    const { lang, curr } = getLocaleFromCountry(countryCode);
                    setLocaleState(lang);
                    setCurrencyState(curr);
                }
            } catch (error) {
                console.warn("Could not detect user country, using defaults.", error);
            } finally {
                setIsLoaded(true);
            }
        }
    };

    initializeLocale();

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

  const getConvertedAmount = useCallback((amount: number, fromCurrency: Currency = 'XOF', toCurrency?: Currency) => {
    const targetCurrency = toCurrency || currency;
    
    // Convert amount from 'fromCurrency' to USD (base currency)
    const amountInUSD = amount / conversionRates[fromCurrency];
    
    // Convert amount from USD to the target currency
    return amountInUSD * conversionRates[targetCurrency];

  }, [currency]);
  
  const formatCurrency = useCallback((amount: number, fromCurrency: Currency = 'XOF') => {
    const convertedAmount = getConvertedAmount(amount, fromCurrency, currency);
    
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: ['XOF', 'VND'].includes(currency) ? 0 : 2,
      maximumFractionDigits: ['XOF', 'VND'].includes(currency) ? 0 : 2,
    };

    // Special formatting for XOF to place the symbol after the number.
    if (currency === 'XOF') {
      return `${Math.round(convertedAmount).toLocaleString('fr-FR')} FCFA`;
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

  const formatDateTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [locale]);

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, currency, setCurrency, t, formatCurrency, formatDate, formatDateTime, getCategoryName, getConvertedAmount }}>
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
