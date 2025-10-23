// src/app/dashboard/billing/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocale } from "@/context/locale-context";
import { Check, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import toast from 'react-hot-toast';
import Link from "next/link";


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
    
    // This is placeholder logic. Replace with actual subscription status check.
    const isCurrentPlan = (plan: 'premium' | 'business') => {
        return user?.subscriptionStatus === 'active' && user?.subscriptionPlan === plan;
    };

    const handlePayment = (plan: 'premium' | 'business') => {
        const CinetPay = (window as any).CinetPay;
        if (!CinetPay || !CinetPay.getCheckout) {
            toast.error("Le service de paiement n'a pas pu être chargé. Veuillez rafraîchir la page.");
            return;
        }

        const apiKey = process.env.NEXT_PUBLIC_CINETPAY_API_KEY;
        const siteId = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID;

        if (!apiKey || !siteId) {
            toast.error("Les informations de paiement ne sont pas configurées. Veuillez contacter le support.");
            return;
        }
        
        if (!user || !user.displayName || !user.email) {
             toast.error("Informations utilisateur manquantes. Impossible de procéder au paiement.");
            return;
        }
        
        const nameParts = user.displayName.trim().split(' ');
        const customer_surname = nameParts.length > 1 ? nameParts.slice(1).join(' ').trim() : 'Wisebil';
        const customer_name = nameParts[0].trim() || 'Client';

        const planDetails = pricing[plan];
        const amount = planDetails.XOF;
        // Generate a random transaction ID
        const transaction_id = `wisebil-${plan}-${Math.random().toString(36).substring(2, 11)}`;
        const description = `Abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} Wisebil`;
        
        CinetPay.setConfig({
            apikey: apiKey,
            site_id: siteId,
            notify_url: `${window.location.origin}/api/cinetpay-notify`,
            mode: 'PRODUCTION'
        });
        
        CinetPay.getCheckout({
            transaction_id,
            amount,
            currency: 'XOF',
            channels: 'ALL',
            description,
            customer_name,
            customer_surname,
            customer_email: user.email.trim(),
            customer_phone_number: (user.phone || "").trim(),
            customer_address : "BP 0024",
            customer_city: "Dakar",
            customer_country : "SN",
            customer_state : "SN",
            customer_zip_code : "00221",
        });

        CinetPay.waitResponse((data: any) => {
            if (data.status === "REFUSED") {
                toast.error(t('payment_refused'));
            } else if (data.status === "ACCEPTED") {
                toast.success(t('payment_success'));
                // Here, you would typically update the user's subscription status in your database
            }
        });

        CinetPay.onError((data: any) => {
            console.error("CinetPay Error:", data);
            toast.error(t('payment_error_technical'));
        });
    }
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('transaction_status');
        
        if (paymentStatus) {
            if (paymentStatus === 'ACCEPTED') {
                 toast.success(t('payment_success'));
            } else if (paymentStatus === 'REFUSED') {
                toast.error(t('payment_refused'));
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [t]);


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
            isCurrent: user?.subscriptionStatus !== 'active',
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
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">{t('billing_page_title')}</h1>
                <p className="text-muted-foreground mt-2">{t('billing_page_subtitle')}</p>
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
                             ) : currency !== 'XOF' ? (
                                <Button variant="outline" className="w-full" disabled>
                                    {t('payment_by_card_soon')}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handlePayment(plan.name as 'premium' | 'business')}
                                    className="w-full"
                                >
                                    {plan.buttonText}
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
             </div>
        </div>
    )
}
