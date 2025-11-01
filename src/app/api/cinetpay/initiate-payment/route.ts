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


export const pricing = {
    premium: { XOF: 5000, EUR: 8, USD: 9, VND: 200000 },
    business: { XOF: 9900, EUR: 15, USD: 16, VND: 380000 },
};

interface Plan {
  name: 'free' | 'premium' | 'business' | 'custom';
  title: string;
  prices: { XOF: number; EUR: number; USD: number, VND: number } | null;
  description: string;
  features: string[];
  isCurrent: boolean;
  buttonText: string; 
  isPopular?: boolean;
}

interface CinetPayFormProps {
    plan: 'premium' | 'business';
    amount: number;
    currency: string;
    description: string;
    customerName: string;
    customerSurname: string;
    customerEmail: string;
    customerPhone: string;
    userId: string;
}

function CinetPayForm({
    plan,
    amount,
    currency,
    description,
    customerName,
    customerSurname,
    customerEmail,
    customerPhone,
    userId,
}: CinetPayFormProps) {
    const return_url = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=success`;
    const notify_url = `${process.env.NEXT_PUBLIC_APP_URL}/api/cinetpay/notify`;
    const transactionId = `${userId}-${plan}-${Date.now()}`;
    
    useEffect(() => {
        const CinetPay = (window as any).CinetPay;
        if (!CinetPay) {
            console.error("CinetPay.js not loaded");
            return;
        }

        CinetPay.setConfig({
            apikey: process.env.NEXT_PUBLIC_CINETPAY_API_KEY,
            site_id: parseInt(process.env.NEXT_PUBLIC_CINETPAY_SITE_ID || '0', 10),
            notify_url: notify_url,
            mode: 'PRODUCTION' // Use 'PRODUCTION' for live, 'SANDBOX' for testing
        });

        CinetPay.getCheckout({
            transaction_id: transactionId,
            amount: amount,
            currency: currency,
            channels: 'ALL',
            description: description,
            customer_name: customerName,
            customer_surname: customerSurname,
            customer_email: customerEmail,
            customer_phone_number: customerPhone,
            // Pass the user ID in metadata for the webhook
            metadata: userId, 
        });

        CinetPay.waitResponse(function(data: any) {
            if (data.status === "REFUSED") {
                window.location.href = `/dashboard/billing?status=failed&trans_id=${transactionId}`;
            } else if (data.status === "ACCEPTED") {
                window.location.href = `/dashboard/billing?status=success&trans_id=${transactionId}`;
            }
        });
        
        CinetPay.onError(function(data: any) {
            console.log("CinetPay Error:", data);
            window.location.href = `/dashboard/billing?status=error`;
        });
    }, [amount, currency, customerEmail, customerName, customerPhone, customerSurname, description, plan, transactionId, userId, notify_url]);

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-lg font-semibold">Redirection vers le paiement...</p>
        </div>
    );
}


export default function BillingPage() {
    const { t, currency, formatCurrency } = useLocale();
    const { user: authUser, firebaseUser } = useAuth();
    const { userData } = useUserData();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { toast } = useToast();

    const [paymentData, setPaymentData] = useState<CinetPayFormProps | null>(null);
    
    const isCurrentPlan = (plan: 'premium' | 'business') => {
        return userData?.profile?.subscriptionStatus === 'active' && userData?.profile?.subscriptionPlan === plan;
    };
    
    const handlePayment = async (plan: 'premium' | 'business') => {
        if (!firebaseUser || !authUser) {
            toast({ variant: 'destructive', title: "Veuillez vous connecter pour continuer." });
            return;
        }
        setIsLoading(plan);
        
        try {
            const fullName = authUser.displayName || 'Utilisateur';
            const [firstName, ...lastNameParts] = fullName.split(' ');
            
            setPaymentData({
                plan,
                amount: pricing[plan][currency],
                currency: currency,
                description: `Abonnement ${plan} - Wisebil`,
                customerName: firstName,
                customerSurname: lastNameParts.join(' ') || ' ',
                customerEmail: authUser.email || '',
                customerPhone: authUser.phone || '',
                userId: firebaseUser.uid,
            });

        } catch (error) {
            console.error("Payment initiation error:", error);
            toast({ variant: 'destructive', title: 'Erreur de Paiement', description: 'Impossible de contacter le service de paiement. Veuillez réessayer.'});
            setIsLoading(null);
        }
    };


    const plans: Plan[] = [
        {
            name: 'free',
            title: t('plan_free_title'),
            prices: { XOF: 0, EUR: 0, USD: 0, VND: 0 },
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
            {paymentData && <CinetPayForm {...paymentData} />}
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard">
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
                                {plan.prices ? formatCurrency(pricing[plan.name as 'premium' | 'business']?.[currency] ?? 0, currency) : <span className="text-2xl">{t('on_demand')}</span>}
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