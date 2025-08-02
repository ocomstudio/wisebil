// src/components/dashboard/financial-summary-card.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, Activity } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useLocale } from "@/context/locale-context";

interface FinancialSummaryCardProps {
    income: number;
    expenses: number;
    chartData: { name: string; amount: number }[];
}

export function FinancialSummaryCard({ income, expenses, chartData }: FinancialSummaryCardProps) {
    const { t } = useLocale();
    const [summary, setSummary] = useState("");
    const [advice, setAdvice] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true);
            // AI functionality is temporarily disabled.
            if (income === 0 && expenses === 0) {
                 if (t('lang_code') === 'fr') {
                    setSummary('Bienvenue ! Ajoutez vos premières transactions pour voir votre résumé financier ici.');
                    setAdvice("Commencez par enregistrer une dépense ou un revenu pour prendre le contrôle de vos finances.");
                } else {
                    setSummary('Welcome! Add your first transactions to see your financial summary here.');
                    setAdvice('Start by recording an expense or income to take control of your finances.');
                }
            } else {
                if (t('lang_code') === 'fr') {
                    setSummary(`Ce mois-ci, vous avez gagné ${income} et dépensé ${expenses}. Continuez comme ça !`);
                    setAdvice("Essayez de revoir vos abonnements pour trouver des économies potentielles.");
                } else {
                     setSummary(`This month, you've earned ${income} and spent ${expenses}. Keep it up!`);
                    setAdvice("Try reviewing your subscriptions to find potential savings.");
                }
            }
            setIsLoading(false);
        };

        fetchSummary();
    }, [income, expenses, t]);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <Activity className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1 space-y-2">
                             <Skeleton className="h-5 w-1/4" />
                             <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Lightbulb className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-1/4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                    <Activity className="h-5 w-5 text-primary mt-1" />
                    <div>
                        <h4 className="font-semibold">{t('monthly_summary_title')}</h4>
                        <p className="text-sm text-muted-foreground">{summary}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Lightbulb className="h-5 w-5 text-yellow-400 mt-1" />
                    <div>
                        <h4 className="font-semibold">{t('advice_for_you_title')}</h4>
                        <p className="text-sm text-muted-foreground">{advice}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
