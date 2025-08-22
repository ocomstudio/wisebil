// src/components/landing/mobile-welcome-flow.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/common/logo';
import { Wallet, Globe, DollarSign, Euro, CircleDollarSign, ArrowLeft } from 'lucide-react';
import { useLocale } from '@/context/locale-context';
import type { Currency, Language } from '@/context/locale-context';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogDescription } from '../ui/dialog';
import LoginPage from '@/app/auth/login/page';
import SignupPage from '@/app/auth/signup/page';

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
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const { setLocale, setCurrency, t } = useLocale();

  const handleSelectLanguage = (lang: Language) => {
    setLocale(lang);
    setStep('currency');
  };

  const handleSelectCurrency = (curr: Currency) => {
    setCurrency(curr);
    setStep('done');
  };
  
  const handleSwitchToSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
  };

  const handleSwitchToLogin = () => {
    setSignupOpen(false);
    setLoginOpen(true);
  };
  
  const handleGoBack = () => {
    if (step === 'currency') {
      setStep('language');
    } else if (step === 'done') {
      setStep('currency');
    }
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
                            <CardTitle className="font-headline text-2xl">{t('auth_promo_title')}</CardTitle>
                            <CardDescription className="max-w-xs mx-auto">{t('auth_promo_description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                             <div className="space-y-4">
                                <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
                                    <DialogTrigger asChild>
                                         <Button size="lg" className="w-full">{t('get_started')}</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle className="sr-only">Sign Up</DialogTitle>
                                          <DialogDescription className="sr-only">Create a new account to get started.</DialogDescription>
                                        </DialogHeader>
                                        <SignupPage onSwitchToLogin={handleSwitchToLogin} />
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="lg" variant="ghost" className="w-full">{t('login_button')}</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle className="sr-only">Login</DialogTitle>
                                          <DialogDescription className="sr-only">Log into your existing account.</DialogDescription>
                                        </DialogHeader>
                                        <LoginPage onSwitchToSignup={handleSwitchToSignup} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
        
        {step !== 'language' && (
          <footer className="flex-shrink-0">
            <Button variant="ghost" onClick={handleGoBack} className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('previous_button')}
            </Button>
          </footer>
        )}
     </div>
  );
}
