// src/components/landing/mobile-welcome-flow.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/common/logo';
import { Wallet, Globe, DollarSign, Euro, CircleDollarSign } from 'lucide-react';

const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
];

const currencies = [
    { code: 'XOF', name: 'Franc CFA', icon: <CircleDollarSign className="h-8 w-8 text-primary" /> },
    { code: 'EUR', name: 'Euro', icon: <Euro className="h-8 w-8 text-primary" /> },
    { code: 'USD', name: 'US Dollar', icon: <DollarSign className="h-8 w-8 text-primary" /> },
];

const pageVariants = {
  initial: { opacity: 0, x: '100%' },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: '-100%' },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

export function MobileWelcomeFlow() {
  const [step, setStep] = useState('language'); // 'language', 'currency', 'done'

  const handleSelectLanguage = () => {
    setStep('currency');
  };

  const handleSelectCurrency = () => {
    setStep('done');
  };

  return (
     <div className="flex flex-col h-screen w-screen bg-background p-6 overflow-hidden">
        <header className="flex justify-start flex-shrink-0">
            <Logo />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center relative">
            <AnimatePresence mode="wait">
                 {step === 'language' && (
                    <motion.div
                        key="language"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full"
                    >
                        <Card className="bg-transparent border-0 shadow-none text-center">
                            <CardHeader>
                                <div className="flex justify-center mb-4"><Globe className="h-12 w-12 text-primary"/></div>
                                <CardTitle className="font-headline">Choisissez votre langue</CardTitle>
                                <CardDescription>Select your language</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {languages.map(lang => (
                                    <Button key={lang.code} size="lg" className="w-full justify-start text-lg h-14" onClick={handleSelectLanguage}>
                                        <span className="mr-4 text-2xl">{lang.flag}</span> {lang.name}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 'currency' && (
                    <motion.div
                        key="currency"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full"
                    >
                        <Card className="bg-transparent border-0 shadow-none text-center">
                            <CardHeader>
                                <div className="flex justify-center mb-4"><Wallet className="h-12 w-12 text-primary"/></div>
                                <CardTitle className="font-headline">Choisissez votre devise</CardTitle>
                                <CardDescription>Sélectionnez votre devise principale</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {currencies.map(curr => (
                                     <Button key={curr.code} variant="outline" size="lg" className="w-full justify-start text-lg h-16" onClick={handleSelectCurrency}>
                                        <div className="mr-4">{curr.icon}</div> 
                                        <span>{curr.name} <span className="text-muted-foreground">({curr.code})</span></span>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>

        {step === 'done' && (
            <motion.footer 
                className="py-4 space-y-2 flex-shrink-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Button asChild size="lg" className="w-full">
                    <Link href="/auth/signup">Commencer</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                    <Link href="/auth/login">Se connecter</Link>
                </Button>
            </motion.footer>
        )}
     </div>
  );
}
