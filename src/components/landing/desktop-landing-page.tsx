
// src/components/landing/desktop-landing-page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/common/logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, Eye, BarChart, Bot, Shield, Star, Twitter, Facebook, Instagram, HeartHandshake, Zap, Rocket } from 'lucide-react';
import { GooglePlayLogo } from './logos/google-play-logo';
import { AppStoreLogo } from './logos/app-store-logo';
import { LanguageSelector } from '../common/language-selector';
import { useLocale } from '@/context/locale-context';
import type { Currency } from '@/context/locale-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import LoginPage from '@/app/auth/login/page';
import SignupPage from '@/app/auth/signup/page';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


function AuthButtons() {
    const { t } = useLocale();
    const { firebaseUser, isLoading } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [signupOpen, setSignupOpen] = useState(false);
    const router = useRouter();

    const handleSwitchToSignup = () => {
        setLoginOpen(false);
        setSignupOpen(true);
    };

    const handleSwitchToLogin = () => {
        setSignupOpen(false);
        setLoginOpen(true);
    };
    
    const handleSubscriptionClick = (plan: string) => {
        if (firebaseUser) {
            router.push('/dashboard/billing');
        } else {
            sessionStorage.setItem('redirect_plan', plan);
            setSignupOpen(true);
        }
    };

    if (isLoading) {
        return (
            <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        )
    }

    if (firebaseUser) {
        return (
            <Button asChild>
                <Link href="/dashboard">
                    <Rocket className="mr-2 h-4 w-4" />
                    Ouvrir le tableau de bord
                </Link>
            </Button>
        )
    }

    return (
        <>
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">{t('login_button')}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="sr-only">{t('login_title')}</DialogTitle>
                        <DialogDescription className="sr-only">{t('login_subtitle')}</DialogDescription>
                    </DialogHeader>
                    <LoginPage onSwitchToSignup={handleSwitchToSignup} />
                </DialogContent>
            </Dialog>
            <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
                <DialogTrigger asChild>
                     <Button>{t('signup_button')}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="sr-only">{t('signup_title')}</DialogTitle>
                        <DialogDescription className="sr-only">{t('signup_subtitle')}</DialogDescription>
                    </DialogHeader>
                    <SignupPage onSwitchToLogin={handleSwitchToLogin} />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default function DesktopLandingPage() {
    const { t, currency, formatCurrency } = useLocale();
    const { firebaseUser } = useAuth();
    const router = useRouter();

    const features = [
        {
            icon: <Bot className="h-8 w-8 text-primary" />,
            title: t('feature1_title'),
            description: t('feature1_desc'),
        },
        {
            icon: <Shield className="h-8 w-8 text-primary" />,
            title: t('feature2_title'),
            description: t('feature2_desc'),
        },
        {
            icon: <BarChart className="h-8 w-8 text-primary" />,
            title: t('feature3_title'),
            description: t('feature3_desc'),
        },
        {
            icon: <Eye className="h-8 w-8 text-primary" />,
            title: t('feature4_title'),
            description: t('feature4_desc'),
        },
        {
            icon: <Zap className="h-8 w-8 text-primary" />,
            title: t('feature5_title'),
            description: t('feature5_desc'),
        },
        {
            icon: <HeartHandshake className="h-8 w-8 text-primary" />,
            title: t('feature6_title'),
            description: t('feature6_desc'),
        }
    ];

    const testimonials = [
        {
            name: "Awa C.",
            role: t('testimonial1_role'),
            quote: t('testimonial1_quote'),
            rating: 5,
            avatar: "https://placehold.co/40x40.png",
            "data-ai-hint": "woman avatar"
        },
        {
            name: "Elhadj N.",
            role: t('testimonial2_role'),
            quote: t('testimonial2_quote'),
            rating: 5,
            avatar: "https://placehold.co/40x40.png",
            "data-ai-hint": "man avatar"
        },
        {
            name: "Aminata S.",
            role: t('testimonial3_role'),
            quote: t('testimonial3_quote'),
            rating: 5,
            avatar: "https://placehold.co/40x40.png",
            "data-ai-hint": "woman avatar"
        }
    ];

    const faqs = [
        {
            question: t('faq1_q'),
            answer: t('faq1_a')
        },
        {
            question: t('faq2_q'),
            answer: t('faq2_a')
        },
        {
            question: t('faq3_q'),
            answer: t('faq3_a')
        },
        {
            question: t('faq4_q'),
            answer: t('faq4_a')
        },
        {
            question: t('faq5_q'),
            answer: t('faq5_a')
        }
    ]

    const pricing = {
        premium: { XOF: 3000 },
        business: { XOF: 9900 },
    };

    const conversionRates: Record<Currency, number> = {
        XOF: 1,
        EUR: 656, 
        USD: 610,
    };

    const getConvertedPrice = (basePriceXOF: number, targetCurrency: Currency): number => {
        if (targetCurrency === 'XOF') {
            return basePriceXOF;
        }
        const rate = conversionRates[targetCurrency];
        return Math.round(basePriceXOF / rate);
    };

  return (
    <AuthProvider>
        <TooltipProvider>
            <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
            <header className="w-full px-4 lg:px-6 h-16 flex justify-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border/50">
                <div className="w-full max-w-7xl flex items-center">
                    <Logo />
                    <nav className="ml-auto hidden lg:flex gap-6 items-center">
                        <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
                            {t('nav_features')}
                        </Link>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" href="#pricing">
                            {t('nav_pricing')}
                        </Link>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" href="#testimonials">
                            {t('nav_testimonials')}
                        </Link>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" href="#faq">
                            {t('nav_faq')}
                        </Link>
                        <LanguageSelector />
                        <AuthButtons />
                    </nav>
                    <div className="ml-auto lg:hidden">
                        <AuthButtons />
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <section 
                className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden flex justify-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-primary/5 z-0"></div>
                    <div className="w-full max-w-7xl px-4 md:px-6 z-10 relative">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24 items-center">
                            <div className="flex flex-col justify-center space-y-6">
                                <div className="space-y-4">
                                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-foreground">
                                        {t('hero_title_part1')} <span className="text-primary">{t('hero_title_part2')}</span>
                                    </h1>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        {t('hero_subtitle')}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="lg" className="shadow-lg shadow-primary/20">
                                                {t('hero_cta_free')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                             <SignupPage onSwitchToLogin={() => {}} />
                                        </DialogContent>
                                    </Dialog>
                                    <Button asChild size="lg" variant="outline">
                                        <Link href="#features">{t('hero_cta_features')}</Link>
                                    </Button>
                                </div>
                            </div>
                            <div
                                className="relative"
                            >
                                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
                                <Image
                                    src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmaW5hbmNlfGVufDB8fHx8MTc1NDk1NTgxNXww&ixlib=rb-4.1.0&q=80&w=1080"
                                    width="600"
                                    height="600"
                                    alt="Hero"
                                    data-ai-hint="finance app mobile"
                                    className="mx-auto aspect-square overflow-hidden rounded-2xl object-cover sm:w-full transform-gpu shadow-2xl shadow-primary/10"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section 
                id="features" 
                className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30 flex justify-center"
                >
                <div className="w-full max-w-7xl px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                        {t('features_badge')}
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-center mx-auto">
                            {t('features_title')}
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed text-center mx-auto">
                            {t('features_subtitle')}
                        </p>
                    </div>
                    </div>
                    <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
                    {features.map((feature, i) => (
                        <div
                            key={feature.title}
                        >
                            <Card className="text-left bg-card/50 backdrop-blur-sm border-border/50 p-4 h-full transform-gpu transition-transform hover:-translate-y-2 hover:shadow-primary/20 shadow-xl">
                                <CardHeader className="p-2">
                                    <div className="bg-primary/10 rounded-lg w-fit p-3 mb-4 border border-primary/20">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="mt-4 text-lg font-headline">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-2">
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                    </div>
                </div>
                </section>
                
                <section 
                id="pricing" 
                className="w-full py-12 md:py-24 lg:py-32 flex justify-center"
                >
                    <div className="w-full max-w-7xl px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                                    {t('pricing_badge')}
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{t('pricing_title')}</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                                    {t('pricing_subtitle')}
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-stretch gap-8 grid-cols-1 lg:grid-cols-3 mt-12">
                            <Card className="flex flex-col transform-gpu transition-transform hover:scale-105 hover:shadow-primary/10 shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="font-headline text-2xl">{t('plan_free_title')}</CardTitle>
                                    <p className="text-4xl font-bold">{formatCurrency(0)} <span className="text-lg font-normal text-muted-foreground">/{t('monthly')}</span></p>
                                    <p className="text-muted-foreground text-sm pt-2">{t('plan_free_desc')}</p>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_transactions')}</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_budgets')}</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_assistant_free')}</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_agent_free')}</li>
                                    </ul>
                                </CardContent>
                                <div className="p-6 pt-0 mt-auto">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                {t('choose_plan_button')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                             <SignupPage onSwitchToLogin={() => {}} />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </Card>
                            <Card className="flex flex-col border-primary shadow-2xl shadow-primary/20 transform-gpu scale-105">
                                <CardHeader className="pb-4">
                                    <p className="text-sm font-semibold text-primary">{t('plan_premium_badge')}</p>
                                    <CardTitle className="font-headline text-2xl">{t('plan_premium_title')}</CardTitle>
                                    <p className="text-4xl font-bold">{formatCurrency(getConvertedPrice(pricing.premium.XOF, currency))} <span className="text-lg font-normal text-muted-foreground">/{t('monthly')}</span></p>
                                    <p className="text-muted-foreground text-sm pt-2">{t('plan_premium_desc')}</p>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_all_free')}</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_assistant_premium')}</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_agent_premium')}</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_support')}</li>
                                    </ul>
                                </CardContent>
                                <div className="p-6 pt-0 mt-auto">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="w-full">
                                            <Button disabled={true} className="w-full">{t('upgrade_premium_button')}</Button>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Les paiements sont temporairement indisponibles.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                </div>
                            </Card>
                            <Card className="flex flex-col transform-gpu transition-transform hover:scale-105 hover:shadow-primary/10 shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="font-headline text-2xl">{t('plan_business_title')}</CardTitle>
                                    <p className="text-4xl font-bold">{formatCurrency(getConvertedPrice(pricing.business.XOF, currency))} <span className="text-lg font-normal text-muted-foreground">/{t('monthly')}</span></p>
                                    <p className="text-muted-foreground text-sm pt-2">{t('plan_business_desc')}</p>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_all_premium')}</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_assistant_business')}</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_agent_business')}</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {t('plan_feature_early_access')}</li>
                                    </ul>
                                </CardContent>
                                <div className="p-6 pt-0 mt-auto">
                                     <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="w-full">
                                            <Button disabled={true} variant="outline" className="w-full">{t('choose_plan_button')}</Button>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Les paiements sont temporairement indisponibles.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                <section 
                id="testimonials" 
                className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30 flex justify-center"
                >
                    <div className="w-full max-w-7xl px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{t('testimonials_title')}</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                                    {t('testimonials_subtitle')}
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
                            {testimonials.map((testimonial) => (
                                <Card key={testimonial.name} className="bg-card/50 backdrop-blur-sm border-border/50 transform-gpu transition-transform hover:scale-105 hover:shadow-primary/20 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center mb-4 gap-3">
                                            <Image src={testimonial.avatar} alt={testimonial.name} width={40} height={40} className="rounded-full" data-ai-hint={testimonial['data-ai-hint']} />
                                            <div>
                                            <div className="font-semibold">{testimonial.name}</div>
                                            <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                                        </div>
                                        <p className="text-muted-foreground text-base">"{testimonial.quote}"</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section 
                id="faq" 
                className="w-full py-12 md:py-24 lg:py-32 flex justify-center"
                >
                    <div className="w-full max-w-7xl px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{t('faq_title')}</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                                    {t('faq_subtitle')}
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto max-w-3xl mt-12">
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left text-lg">{faq.question}</AccordionTrigger>
                                        <AccordionContent>
                                            <p className="text-muted-foreground text-base">{faq.answer}</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </section>

                <section 
                className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground flex justify-center"
                >
                    <div className="w-full max-w-7xl px-4 md:px-6 text-center">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{t('cta_title')}</h2>
                        <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl/relaxed my-4">
                            {t('cta_subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                        <Button size="lg" variant="secondary" asChild className="transform-gpu transition-transform hover:scale-105">
                            <Link href="#">
                                <GooglePlayLogo className="h-8" />
                            </Link>
                        </Button>
                            <Button size="lg" variant="secondary" asChild className="transform-gpu transition-transform hover:scale-105">
                            <Link href="#">
                                <AppStoreLogo className="h-8" />
                            </Link>
                        </Button>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="bg-secondary/30 flex justify-center">
                <div className="w-full max-w-7xl px-4 md:px-6 py-8">
                <div className="grid gap-8 lg:grid-cols-4">
                    <div className="space-y-4">
                    <Logo />
                    <p className="text-sm text-muted-foreground">{t('footer_desc')}</p>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground"><Twitter className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground"><Facebook className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground"><Instagram className="h-4 w-4" /></Button>
                    </div>
                    </div>
                    <div>
                    <h4 className="font-semibold mb-2">{t('footer_product')}</h4>
                    <nav className="flex flex-col gap-2 text-sm">
                        <Link href="#features" className="text-muted-foreground hover:text-primary">{t('nav_features')}</Link>
                        <Link href="#pricing" className="text-muted-foreground hover:text-primary">{t('nav_pricing')}</Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary">{t('footer_updates')}</Link>
                    </nav>
                    </div>
                    <div>
                    <h4 className="font-semibold mb-2">{t('footer_support')}</h4>
                    <nav className="flex flex-col gap-2 text-sm">
                        <Link href="/contact" className="text-muted-foreground hover:text-primary">{t('footer_help')}</Link>
                        <Link href="/contact" className="text-muted-foreground hover:text-primary">{t('footer_contact')}</Link>
                        <Link href="#faq" className="text-muted-foreground hover:text-primary">{t('nav_faq')}</Link>
                    </nav>
                    </div>
                    <div>
                    <h4 className="font-semibold mb-2">{t('footer_legal')}</h4>
                    <nav className="flex flex-col gap-2 text-sm">
                        <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">{t('terms')}</Link>
                        <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">{t('privacy_policy')}</Link>
                    </nav>
                    </div>
                </div>
                <div className="mt-8 border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">{t('footer_copyright', { year: new Date().getFullYear() })}</p>
                    <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm hover:underline underline-offset-4" href="/terms-of-service">
                        {t('terms')}
                    </Link>
                    <Link className="text-sm hover:underline underline-offset-4" href="/privacy-policy">
                        {t('privacy_policy')}
                    </Link>
                    </nav>
                </div>
                </div>
            </footer>
            </div>
        </TooltipProvider>
    </AuthProvider>
  );
}
