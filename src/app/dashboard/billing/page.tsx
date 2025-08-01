// src/app/dashboard/billing/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/context/locale-context";
import { Check } from "lucide-react";
import Link from "next/link";
import type { Currency } from "@/context/locale-context";

const pricing = {
    premium: { XOF: 3000 },
    business: { XOF: 9900 },
};

const conversionRates: Record<Currency, number> = {
    XOF: 1,
    EUR: 656, // Approximate rate
    USD: 610, // Approximate rate
};


export default function BillingPage() {
    const { t, currency, formatCurrency } = useLocale();

    const getConvertedPrice = (basePriceXOF: number, targetCurrency: Currency): number => {
        if (targetCurrency === 'XOF') {
            return basePriceXOF;
        }
        const rate = conversionRates[targetCurrency];
        return Math.round(basePriceXOF / rate);
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
            isCurrent: true,
            buttonText: t('current_plan_button'),
            buttonVariant: "outline"
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
            isCurrent: false,
            buttonText: t('upgrade_premium_button'),
            buttonVariant: "default",
            isPopular: true
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
            isCurrent: false,
            buttonText: t('choose_plan_button'),
            buttonVariant: "outline"
        }
    ]

    return (
        <div className="space-y-8">
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
                             <Button asChild variant={plan.buttonVariant as any} className="w-full" disabled={plan.isCurrent}>
                                <Link href="#">{plan.buttonText}</Link>
                            </Button>
                        </div>
                    </Card>
                ))}
             </div>
        </div>
    )
}
