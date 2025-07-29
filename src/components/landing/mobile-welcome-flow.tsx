// src/components/landing/mobile-welcome-flow.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Logo } from '@/components/common/logo';
import { Wallet, Bot, BarChart2, PartyPopper, Globe, DollarSign, Euro, CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';


const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
];

const currencies = [
    { code: 'XOF', name: 'Franc CFA', icon: <CircleDollarSign className="h-8 w-8 text-primary" /> },
    { code: 'EUR', name: 'Euro', icon: <Euro className="h-8 w-8 text-primary" /> },
    { code: 'USD', name: 'US Dollar', icon: <DollarSign className="h-8 w-8 text-primary" /> },
]

const onboardingSteps = [
  {
    icon: <Wallet className="h-12 w-12 text-primary" />,
    title: "Bienvenue sur Wisebil !",
    description: "La façon intelligente de gérer vos finances personnelles. Faisons un tour rapide.",
  },
  {
    icon: <Bot className="h-12 w-12 text-primary" />,
    title: "Catégorisation par l'IA",
    description: "Entrez simplement la description de votre dépense, et notre IA la catégorisera intelligemment pour vous.",
  },
  {
    icon: <BarChart2 className="h-12 w-12 text-primary" />,
    title: "Suivez Vos Dépenses",
    description: "Obtenez une vue claire de la destination de votre argent avec notre tableau de bord et nos rapports intuitifs.",
  },
  {
    icon: <PartyPopper className="h-12 w-12 text-primary" />,
    title: "Vous êtes prêt !",
    description: "Prêt à prendre le contrôle de vos finances ? Inscrivez-vous ou connectez-vous pour commencer.",
  }
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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const handleSelectLanguage = () => {
    setStep('currency');
  };

  const handleSelectCurrency = () => {
    setStep('done');
    setShowWelcomeModal(true);
  };

  return (
     <div className="flex flex-col h-screen w-screen bg-background p-4 overflow-hidden">
        <header className="flex justify-start">
            <Logo />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center relative">
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
        </div>

        {step === 'done' && (
            <motion.footer 
                className="py-4 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="w-full space-y-2">
                    <Button asChild size="lg" className="w-full">
                        <Link href="/auth/signup">Commencer</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="w-full">
                        <Link href="/auth/login">Se connecter</Link>
                    </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">By Ocomstudio</p>
            </motion.footer>
        )}
        
        <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
            <DialogContent className="max-w-[90vw] rounded-2xl">
                 <DialogHeader className="sr-only">
                    <DialogTitle>Bienvenue sur Wisebil</DialogTitle>
                    <DialogDescription>
                        Une brève introduction aux fonctionnalités clés de l'application.
                    </DialogDescription>
                </DialogHeader>
                 <Carousel className="w-full -mx-2">
                    <CarouselContent>
                        {onboardingSteps.map((step, index) => (
                        <CarouselItem key={index}>
                            <div className="p-1">
                                <Card className="border-0 shadow-none bg-transparent">
                                    <CardContent className="flex flex-col items-center justify-center p-6 text-center aspect-square">
                                    <div className="mb-6">{step.icon}</div>
                                    <h3 className="text-2xl font-bold mb-2 font-headline">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2"/>
                    <CarouselNext className="right-2"/>
                </Carousel>
            </DialogContent>
        </Dialog>
     </div>
  );
}
