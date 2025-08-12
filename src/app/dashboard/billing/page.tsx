// src/app/dashboard/billing/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/context/locale-context";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Currency } from "@/context/locale-context";
import { useAuth } from "@/context/auth-context";
import { toast } from 'react-hot-toast';

const pricing = {
    premium: { XOF: 3000, priceId: 'price_1PgQj5RxH3iN5fA2z3B1gH4e' },
    business: { XOF: 9900, priceId: 'price_1PgQkLRxH3iN5fA2a9d8vE8f' },
};

const conversionRates: Record<Currency, number> = {
    XOF: 1,
    EUR: 656, // Approximate rate
    USD: 610, // Approximate rate
};


export default function BillingPage() {
    const { t, currency, formatCurrency } = useLocale();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const getConvertedPrice = (basePriceXOF: number, targetCurrency: Currency): number => {
        if (targetCurrency === 'XOF') {
            return basePriceXOF;
        }
        const rate = conversionRates[targetCurrency];
        return Math.round(basePriceXOF / rate);
    };

    const handleCheckout = async (priceId: string) => {
        if (!user) {
            toast.error(t('login_required_for_subscription'));
            return;
        }

        setIsLoading(priceId);

        try {
            const response = await fetch('/api/stripe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: priceId,
                    userId: user.uid,
                    userEmail: user.email,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error("Stripe checkout error:", error);
            toast.error(t('subscription_error'));
            setIsLoading(null);
        }
    }
    
    const isCurrentPlan = (plan: 'premium' | 'business') => {
        return user?.subscriptionStatus === 'active'; // This is a simplified check
    };


    const plans = [
        {
            title: t('plan_free_title'),
            price: 0,
            description: t('plan_free_desc'),
            features: [
                t('plan_feature_transactions'),
                t('plan_feature_budgets'),
                t('plan_feature_assistant_free'),
                t('plan_feature_agent_free')
            ],
            isCurrent: user?.subscriptionStatus === 'inactive' || !user?.subscriptionStatus,
            buttonText: t('current_plan_button'),
            buttonVariant: "outline",
            action: () => {}
        },
        {
            title: t('plan_premium_title'),
            price: getConvertedPrice(pricing.premium.XOF, currency),
            description: t('plan_premium_desc'),
            features: [
                t('plan_feature_all_free'),
                t('plan_feature_assistant_premium'),
                t('plan_feature_agent_premium'),
                t('plan_feature_support')
            ],
            isCurrent: isCurrentPlan('premium'),
            buttonText: isCurrentPlan('premium') ? t('current_plan_button') : t('upgrade_premium_button'),
            buttonVariant: "default",
            isPopular: true,
            priceId: pricing.premium.priceId,
            action: () => handleCheckout(pricing.premium.priceId)
        },
        {
            title: t('plan_business_title'),
            price: getConvertedPrice(pricing.business.XOF, currency),
            description: t('plan_business_desc'),
            features: [
                t('plan_feature_all_premium'),
                t('plan_feature_assistant_business'),
                t('plan_feature_agent_business'),
                t('plan_feature_early_access')
            ],
            isCurrent: isCurrentPlan('business'),
            buttonText: isCurrentPlan('business') ? t('current_plan_button') : t('choose_plan_button'),
            buttonVariant: "outline",
            priceId: pricing.business.priceId,
            action: () => handleCheckout(pricing.business.priceId)
        }
    ]

    return (
        <div className="space-y-8 pb-20 md:pb-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">{t('billing_page_title')}</h1>
                <p className="text-muted-foreground mt-2">{t('billing_page_subtitle')}</p>
            </div>

             <div className="mx-auto grid max-w-5xl items-stretch gap-8 grid-cols-1 lg:grid-cols-3 mt-12">
                {plans.map(plan => (
                     <Card key={plan.title} className={`flex flex-col transform-gpu transition-transform hover:scale-105 hover:shadow-primary/20 shadow-xl ${plan.isPopular ? 'border-primary shadow-2xl shadow-primary/20 scale-105' : ''}`}>
                        <CardHeader className="pb-4">
                            {plan.isPopular && <p className="text-sm font-semibold text-primary">{t('plan_premium_badge')}</p>}
                            <CardTitle className="font-headline text-2xl">{plan.title}</CardTitle>
                            <p className="text-4xl font-bold">{formatCurrency(plan.price)} <span className="text-lg font-normal text-muted-foreground">/{t('monthly')}</span></p>
                            <p className="text-muted-foreground text-sm pt-2">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <ul className="space-y-2 text-sm">
                               {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {feature}</li>
                               ))}
                            </ul>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                             <Button onClick={plan.action} variant={plan.buttonVariant as any} className="w-full" disabled={plan.isCurrent || (!!isLoading && isLoading !== plan.priceId)}>
                                {isLoading === plan.priceId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {plan.buttonText}
                            </Button>
                        </div>
                    </Card>
                ))}
             </div>
        </div>
    )
}
