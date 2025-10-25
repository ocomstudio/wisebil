// src/app/dashboard/billing/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocale } from "@/context/locale-context";
import { Check, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useUserData } from "@/context/user-context";
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { v4 as uuidv4 } from "uuid";
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


export const pricing = {
    premium: { XOF: 5000, EUR: 8, USD: 9 },
    business: { XOF: 9900, EUR: 15, USD: 16 },
};

interface Plan {
  name: 'free' | 'premium' | 'business' | 'custom';
  title: string;
  prices: { XOF: number; EUR: number; USD: number } | null;
  description: string;
  features: string[];
  isCurrent: boolean;
  buttonText: string; 
  isPopular?: boolean;
}


export default function BillingPage() {
    const { t, currency, formatCurrency } = useLocale();
    const { user, firebaseUser } = useAuth();
    const { userData } = useUserData();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Handle payment status from URL redirect if needed (backup)
    useEffect(() => {
        const status = searchParams.get('status');
        if (status === 'success') {
            toast({
                title: t('payment_success'),
                description: "Votre plan a été mis à jour.",
            });
            router.replace('/dashboard/billing');
        } else if (status === 'refused') {
            toast({
                variant: 'destructive',
                title: t('payment_refused'),
                description: "Veuillez réessayer ou contacter le support.",
            });
            router.replace('/dashboard/billing');
        }
    }, [searchParams, router, toast, t]);
    
    const isCurrentPlan = (plan: 'premium' | 'business') => {
        return userData?.profile?.subscriptionStatus === 'active' && userData?.profile?.subscriptionPlan === plan;
    };
    
    const handlePayment = async (plan: 'premium' | 'business') => {
        if (!user || !userData || !firebaseUser) {
            toast({ variant: 'destructive', title: "Veuillez vous connecter pour continuer." });
            return;
        }

        setIsLoading(plan);

        try {
            // Step 1: Securely fetch API keys from our server by providing the user's auth token
            const idToken = await firebaseUser.getIdToken(true); // Force token refresh
            const keysResponse = await axios.get('/api/cinetpay/get-keys', {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            const { apiKey, siteId } = keysResponse.data;

            if (!apiKey || !siteId) {
                throw new Error("Configuration de paiement manquante sur le serveur.");
            }
            
            const CinetPay = (window as any).CinetPay;
            if (!CinetPay) {
                throw new Error("Le SDK CinetPay n'a pas pu être chargé.");
            }

            const amount = pricing[plan][currency];
            const transaction_id = `wisebil-${plan}-${user.uid}-${Date.now()}`;
            
             // Create a pending transaction document in Firestore
            const transactionRef = doc(db, 'transactions', transaction_id);
            await setDoc(transactionRef, {
                userId: user.uid,
                plan: plan,
                amount: amount,
                currency: currency,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
            });

            CinetPay.getCheckout({
                transaction_id: transaction_id,
                amount: amount,
                currency: currency,
                channels: 'ALL',
                description: `Abonnement ${plan} Wisebil`,
                // Customer data
                customer_name: userData.profile.displayName?.split(' ')[0] || "Client",
                customer_surname: userData.profile.displayName?.split(' ').slice(1).join(' ') || "Wisebil",
                customer_email: userData.profile.email,
                customer_phone_number: userData.profile.phone,
                apikey: apiKey,
                site_id: parseInt(siteId, 10),
                // Callbacks
                notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cinetpay/notify`,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=success`,
                
                // UX configuration
                mode: 'seamless',
                onpending: () => {
                    console.log('Payment pending');
                    setIsLoading(null);
                },
                onsuccess: (paymentInfo: any) => {
                    toast({
                        title: t('payment_success'),
                        description: "Votre abonnement est en cours de mise à jour.",
                    });
                    // The notify_url will handle the actual subscription update.
                    // We just need to give the user feedback and maybe poll for status.
                    setIsLoading(null);
                    router.push('/dashboard');
                },
                onerror: (err: any) => {
                    console.error("CinetPay Error:", err);
                    let errorMessage = "Une erreur est survenue lors du paiement.";
                    if (typeof err === 'string' && err.toLowerCase().includes('montant minimum')) {
                       errorMessage = `Le montant minimum pour cette transaction est de 100 ${currency}.`;
                    } else if (typeof err === 'string') {
                        errorMessage = err;
                    }
                    toast({ variant: 'destructive', title: 'Erreur de Paiement', description: errorMessage });
                    setIsLoading(null);
                },
                onclose: () => {
                    setIsLoading(null);
                }
            });

        } catch (error) {
            console.error('Error during payment initiation:', error);
            const errorMessage = (error as any).response?.data?.error || (error as Error).message || t('payment_error_technical');
            toast({ variant: 'destructive', title: t('error_title'), description: errorMessage });
            setIsLoading(null);
        }
    };


    const plans: Plan[] = [
        {
            name: 'free',
            title: t('plan_free_title'),
            prices: { XOF: 0, EUR: 0, USD: 0 },
            description: t('plan_free_desc'),
            features: [
                t('feature_personal_finance'),
                t('feature_enterprise_trial'),
                t('feature_ai_limited'),
            ],
            isCurrent: userData?.profile?.subscriptionStatus !== 'active',
            buttonText: t('current_plan_button'),
        },
        {
            name: 'premium',
            title: t('plan_premium_title'),
            prices: pricing.premium,
            description: t('plan_premium_desc'),
            features: [
                t('feature_enterprise_full'),
                t('feature_ai_premium'),
                t('feature_reports_daily'),
                t('feature_one_business'),
            ],
            isCurrent: isCurrentPlan('premium'),
            isPopular: true,
            buttonText: t('upgrade_premium_button'),
        },
        {
            name: 'business',
            title: t('plan_business_title'),
            prices: pricing.business,
            description: t('plan_business_desc'),
            features: [
                t('feature_all_premium'),
                t('feature_ai_unlimited'),
                t('feature_reports_full'),
                t('feature_three_businesses'),
                t('feature_history_export')
            ],
            isCurrent: isCurrentPlan('business'),
            buttonText: t('upgrade_business_button'),
        },
        {
            name: 'custom',
            title: t('plan_custom_title'),
            prices: null,
            description: t('plan_custom_desc'),
            features: [
                t('feature_all_business'),
                t('feature_dedicated_support'),
                t('feature_custom_integrations'),
            ],
            isCurrent: false,
            buttonText: t('contact_us_button'),
        }
    ]

    return (
        <div className="space-y-8 pb-20 md:pb-8">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/entreprise">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold font-headline">{t('billing_page_title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('billing_page_subtitle')}</p>
                </div>
            </div>

             <div className="mx-auto grid max-w-7xl items-stretch gap-8 grid-cols-1 lg:grid-cols-4 mt-12">
                {plans.map(plan => (
                     <Card key={plan.name} className={`flex flex-col transform-gpu transition-transform hover:scale-105 hover:shadow-primary/20 shadow-xl ${plan.isPopular ? 'border-primary shadow-2xl shadow-primary/20 scale-105' : 'border-border'}`}>
                        <CardHeader className="pb-4">
                            {plan.isPopular && <p className="text-sm font-semibold text-primary">{t('plan_premium_badge')}</p>}
                            <CardTitle className="font-headline text-2xl">{plan.title}</CardTitle>
                            <p className="text-4xl font-bold">
                                {plan.prices ? formatCurrency(plan.prices[currency], currency) : <span className="text-2xl">{t('on_demand')}</span>}
                                {plan.prices && <span className="text-lg font-normal text-muted-foreground">/{t('monthly')}</span>}
                            </p>
                            <CardDescription className="text-sm pt-2 min-h-[40px]">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <ul className="space-y-2 text-sm">
                               {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-primary mt-1 shrink-0" /> 
                                        <span>{feature}</span>
                                    </li>
                               ))}
                            </ul>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                           {plan.name === 'free' || plan.isCurrent ? (
                             <Button
                                variant={"outline"}
                                className="w-full"
                                disabled={true}
                              >
                                {t('current_plan_button')}
                              </Button>
                           ) : plan.name === 'custom' ? (
                                <Button asChild className="w-full">
                                    <a href="mailto:contact@wisebil.com">
                                        {plan.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handlePayment(plan.name as 'premium' | 'business')}
                                    className="w-full"
                                    disabled={!!isLoading}
                                >
                                    {isLoading === plan.name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isLoading === plan.name ? 'Traitement...' : plan.buttonText}
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
             </div>
        </div>
    )
}
