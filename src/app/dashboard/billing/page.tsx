// src/app/dashboard/billing/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocale } from "@/context/locale-context";
import { Check, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import axios from 'axios';
import type { Country } from 'react-phone-number-input';

// This makes CinetPay functions available in the component
declare const CinetPay: any;

export const pricing = {
    premium: { XOF: 3000, EUR: 5, USD: 6 },
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
    const { t, currency, formatCurrency, locale } = useLocale();
    const { user } = useAuth();
    const { toast: uiToast } = useToast();
    const [detectedCountry, setDetectedCountry] = useState<Country>('CM');
    
    // This is placeholder logic. Replace with actual subscription status check.
    const isCurrentPlan = (plan: 'premium' | 'business') => {
        return user?.subscriptionStatus === 'active' && user?.subscriptionPlan === plan;
    };

    useEffect(() => {
        const fetchCountry = async () => {
            try {
                const response = await axios.get('https://ipapi.co/json/');
                const countryCode = response.data?.country_code as Country | undefined;
                if (countryCode) {
                    setDetectedCountry(countryCode);
                }
            } catch (error) {
                console.warn("Could not detect user country, defaulting to CM.", error);
            }
        };

        fetchCountry();
    }, []);

    const handlePayment = (plan: 'premium' | 'business') => {
        const apiKey = process.env.NEXT_PUBLIC_CINETPAY_API_KEY;
        const siteId = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID;

        if (!apiKey || !siteId) {
            uiToast({
                variant: "destructive",
                title: "Configuration manquante",
                description: "Les informations de paiement ne sont pas configurées. Veuillez contacter le support.",
            });
            return;
        }

        const planDetails = pricing[plan];
        const amount = planDetails[currency];
        const transactionId = `wisebil-${plan}-${uuidv4()}`;
        const description = `Abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} Wisebil`;

        CinetPay.setConfig({
            apikey: apiKey,
            site_id: siteId,
            notify_url: `${window.location.origin}/api/cinetpay-notify`,
            mode: 'PRODUCTION' // Use 'PRODUCTION' for real payments
        });
        
        CinetPay.getCheckout({
            transaction_id: transactionId,
            amount: amount,
            currency: currency,
            channels: 'ALL',
            description: description,
            // Customer information
            customer_name: user?.displayName?.split(' ')[0] || "Utilisateur",
            customer_surname: user?.displayName?.split(' ').slice(1).join(' ') || "Wisebil",
            customer_email: user?.email || "",
            customer_phone_number: user?.phone || "",
            customer_address: "N/A", // Can be improved later
            customer_city: "N/A",
            customer_country : detectedCountry,
            customer_state : detectedCountry,
            customer_zip_code : "00000"
        });

        CinetPay.waitResponse(function(data: any) {
            if (data.status == "REFUSED") {
                toast.error("Votre paiement a été refusé. Veuillez réessayer.");
            } else if (data.status == "ACCEPTED") {
                // Here you would ideally verify the transaction with your backend
                // before granting the subscription.
                toast.success("Votre abonnement est maintenant actif. Bienvenue !");
                // Potentially update user context here or redirect.
            }
        });

        CinetPay.onError(function(data: any) {
            console.error("CinetPay Error:", data);
             toast.error("Une erreur technique est survenue. Veuillez réessayer plus tard.");
        });
    }

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
                           ) : (
                                plan.name === 'custom' ? (
                                    <Button asChild className="w-full">
                                        <a href="mailto:contact@wisebil.com">
                                            {plan.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handlePayment(plan.name as 'premium' | 'business')}
                                        className="w-full"
                                    >
                                        {plan.buttonText}
                                    </Button>
                                )
                           )}
                        </div>
                    </Card>
                ))}
             </div>
        </div>
    )
}
