
// src/app/dashboard/billing/page.tsx
"use client";

import { useState } from "react";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocale } from "@/context/locale-context";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const pricing = {
    premium: { XOF: 3000, EUR: 5, USD: 5 },
    business: { XOF: 9900, EUR: 15, USD: 16 },
};

interface Plan {
  name: 'free' | 'premium' | 'business';
  title: string;
  prices: { XOF: number; EUR: number; USD: number };
  description: string;
  features: string[];
  isCurrent: boolean;
  buttonText: string;
  buttonVariant: string;
  isPopular?: boolean;
}

// Set this to true to enable payments, false to disable them temporarily.
const paymentsEnabled = true;

export default function BillingPage() {
    const { t, currency, formatCurrency, getConvertedAmount } = useLocale();
    const { user, firebaseUser } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    
    const isCurrentPlan = (plan: 'premium' | 'business') => {
        // This is a placeholder logic. You should replace it with your actual subscription status check.
        return user?.subscriptionStatus === 'active' && plan === 'premium';
    };
    
    const handleUpgrade = async (plan: Plan) => {
        if (!paymentsEnabled) {
             toast({ variant: 'default', title: 'Bientôt disponible', description: "Le système de paiement sera bientôt activé."});
             return;
        }

        setIsLoading(plan.name);

        if (!firebaseUser || !user) {
            toast({ variant: 'destructive', title: t('login_required_for_subscription')});
            setIsLoading(null);
            return;
        }

        try {
            const token = await firebaseUser.getIdToken();
            const response = await axios.post('/api/cinetpay/initiate-payment', {
                amount: plan.prices[currency], // Send the amount in the currently selected currency
                currency: currency,
                description: `Abonnement ${plan.title} - Wisebil`,
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                 toast({ variant: 'destructive', title: t('subscription_error'), description: response.data.error || 'Unknown error' });
                 setIsLoading(null);
            }

        } catch (error: any) {
            console.error("Payment initiation failed:", error);
            const errorMessage = error.response?.data?.error || error.response?.data?.details?.message || t('subscription_error');
            toast({ variant: 'destructive', title: t('subscription_error'), description: errorMessage });
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
                t('plan_feature_transactions'),
                t('plan_feature_budgets'),
                t('plan_feature_assistant_free'),
                t('plan_feature_agent_free')
            ],
            isCurrent: user?.subscriptionStatus === 'inactive' || !user?.subscriptionStatus,
            buttonText: t('current_plan_button'),
            buttonVariant: "outline",
        },
        {
            name: 'premium',
            title: t('plan_premium_title'),
            prices: pricing.premium,
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
        },
        {
            name: 'business',
            title: t('plan_business_title'),
            prices: pricing.business,
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
        }
    ]

    return (
      <TooltipProvider>
        <div className="space-y-8 pb-20 md:pb-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">{t('billing_page_title')}</h1>
                <p className="text-muted-foreground mt-2">{t('billing_page_subtitle')}</p>
            </div>

             <div className="mx-auto grid max-w-5xl items-stretch gap-8 grid-cols-1 lg:grid-cols-3 mt-12">
                {plans.map(plan => (
                     <Card key={plan.name} className={`flex flex-col transform-gpu transition-transform hover:scale-105 hover:shadow-primary/20 shadow-xl ${plan.isPopular ? 'border-primary shadow-2xl shadow-primary/20 scale-105' : ''}`}>
                        <CardHeader className="pb-4">
                            {plan.isPopular && <p className="text-sm font-semibold text-primary">{t('plan_premium_badge')}</p>}
                            <CardTitle className="font-headline text-2xl">{plan.title}</CardTitle>
                            <p className="text-4xl font-bold">{formatCurrency(plan.prices.XOF, 'XOF')} <span className="text-lg font-normal text-muted-foreground">/{t('monthly')}</span></p>
                            <CardDescription className="text-sm pt-2 min-h-[40px]">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <ul className="space-y-2 text-sm">
                               {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {feature}</li>
                               ))}
                            </ul>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full">
                                        <Button
                                            variant={plan.buttonVariant as any}
                                            className="w-full"
                                            disabled={plan.isCurrent || !!isLoading}
                                            onClick={() => plan.name !== 'free' && handleUpgrade(plan)}
                                        >
                                            {isLoading === plan.name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            {plan.buttonText}
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {!paymentsEnabled && plan.name !== 'free' && (
                                    <TooltipContent>
                                        <p>Le système de paiement sera bientôt disponible.</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </div>
                    </Card>
                ))}
             </div>
        </div>
      </TooltipProvider>
    )
}
