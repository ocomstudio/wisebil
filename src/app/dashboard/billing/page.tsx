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
import Script from 'next/script';

// This declares the CinetPay object on the window
declare global {
  interface Window {
    CinetPay: any;
  }
}

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
    const { user } = useAuth();
    const { userData } = useUserData();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Handle payment status from URL redirect
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
        if (!user) {
            toast({ variant: 'destructive', title: "Veuillez vous connecter pour continuer." });
            return;
        }

        if (typeof window.CinetPay === 'undefined') {
            toast({ variant: 'destructive', title: t('payment_error_technical') });
            console.error("CinetPay SDK not loaded.");
            return;
        }

        setIsLoading(plan);

        const planDetails = pricing[plan];
        const amount = planDetails[currency] || planDetails.XOF;
        const transaction_id = `wisebil-${plan}-${Date.now()}`;
        const nameParts = (user.displayName || 'Wisebil Client').trim().split(' ');
        const customer_name = nameParts.shift() || 'Client';
        const customer_surname = nameParts.join(' ') || 'Wisebil';

        try {
            window.CinetPay.setConfig({
                apikey: '115005263965f879c0ae4c05.63857515',
                site_id: '105905440',
                notify_url: 'https://wisebil.com/api/cinetpay-notify',
                mode: 'PRODUCTION',
                close_on_error: false
            });

            window.CinetPay.getCheckout({
                transaction_id: transaction_id,
                amount: amount,
                currency: currency,
                channels: 'ALL',
                description: `Abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} Wisebil`,
                customer_name: customer_name,
                customer_surname: customer_surname,
                customer_email: user.email || 'no-email@wisebil.com',
                customer_phone_number: user.phone || '',
                customer_address: "Non spécifiée",
                customer_city: "Non spécifiée",
                customer_country: "CM",
                customer_state: "CM",
                customer_zip_code: "00000",
            });

            window.CinetPay.waitResponse((data: any) => {
                setIsLoading(null);
                if (data.status === "ACCEPTED") {
                    toast({ title: t('payment_success') });
                    // Here you would update the user's subscription status in your database.
                    router.push('/dashboard/billing?status=success');
                } else {
                    toast({ variant: "destructive", title: t('payment_refused') });
                    router.push('/dashboard/billing?status=refused');
                }
            });

            window.CinetPay.onError((data: any) => {
                setIsLoading(null);
                console.error('CinetPay Error:', data);
                toast({ variant: "destructive", title: t('payment_error_technical') });
            });
            
        } catch (error) {
            setIsLoading(null);
            console.error('Error during CinetPay checkout:', error);
            toast({ variant: 'destructive', title: t('payment_error_technical') });
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
        <>
        <Script src="https://cdn.cinetpay.com/seamless/main.js" type="text/javascript" />
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
        </>
    )
}
