// src/components/landing/mobile-welcome-flow.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/common/logo';
import { Wallet, Globe, DollarSign, Euro, CircleDollarSign } from 'lucide-react';
import { useLocale } from '@/context/locale-context';
import type { Currency, Language } from '@/context/locale-context';

const languages = [
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
];

const currencies = [
    { code: 'XOF' as Currency, name: 'Franc CFA', icon: <CircleDollarSign className="h-8 w-8 text-primary" /> },
    { code: 'EUR' as Currency, name: 'Euro', icon: <Euro className="h-8 w-8 text-primary" /> },
    { code: 'USD' as Currency, name: 'US Dollar', icon: <DollarSign className="h-8 w-8 text-primary" /> },
];

export function MobileWelcomeFlow() {
  const [step, setStep] = useState('language'); // 'language', 'currency', 'done'
  const { setLocale, setCurrency, t } = useLocale();

  const handleSelectLanguage = (lang: Language) => {
    setLocale(lang);
    setStep('currency');
  };

  const handleSelectCurrency = (curr: Currency) => {
    setCurrency(curr);
    setStep('done');
  };

  return (
     <div className="flex flex-col h-screen w-screen bg-background p-6 overflow-hidden">
        <header className="flex justify-start flex-shrink-0">
            <Logo />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center relative">
             {step === 'language' && (
                <div
                    key="language"
                    className="w-full"
                >
                    <Card className="bg-transparent border-0 shadow-none text-center">
                        <CardHeader>
                            <div className="flex justify-center mb-4"><Globe className="h-12 w-12 text-primary"/></div>
                            <CardTitle className="font-headline">{t('choose_language_title')}</CardTitle>
                            <CardDescription>{t('choose_language_subtitle')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {languages.map(lang => (
                                <Button key={lang.code} size="lg" className="w-full justify-start text-lg h-14" onClick={() => handleSelectLanguage(lang.code)}>
                                    <span className="mr-4 text-2xl">{lang.flag}</span> {lang.name}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {step === 'currency' && (
                <div
                    key="currency"
                    className="w-full"
                >
                    <Card className="bg-transparent border-0 shadow-none text-center">
                        <CardHeader>
                            <div className="flex justify-center mb-4"><Wallet className="h-12 w-12 text-primary"/></div>
                            <CardTitle className="font-headline">{t('choose_currency_title')}</CardTitle>
                            <CardDescription>{t('choose_currency_subtitle')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {currencies.map(curr => (
                                 <Button key={curr.code} variant="outline" size="lg" className="w-full justify-start text-lg h-16" onClick={() => handleSelectCurrency(curr.code)}>
                                    <div className="mr-4">{curr.icon}</div> 
                                    <span>{t(`currency_${curr.code.toLowerCase()}`)} <span className="text-muted-foreground">({curr.code})</span></span>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {step === 'done' && (
                 <div
                    key="done"
                    className="w-full text-center"
                >
                    <Card className="bg-transparent border-0 shadow-none">
                        <CardHeader>
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <Logo />
                                </div>
                            </div>
                            <CardTitle className="font-headline text-2xl">{t('auth_promo_title')}</CardTitle>
                            <CardDescription className="max-w-xs mx-auto">{t('auth_promo_description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="space-y-4">
                                <Button asChild size="lg" className="w-full">
                                    <Link href="/auth/signup">{t('get_started')}</Link>
                                </Button>
                                <Button asChild size="lg" variant="ghost" className="w-full">
                                    <Link href="/auth/login">{t('login_button')}</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
     </div>
  );
}
