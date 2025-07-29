// src/components/dashboard/financial-summary-card.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFinancialSummary } from "@/ai/flows/financial-summary";
import { Lightbulb, Activity } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useLocale } from "@/context/locale-context";

interface FinancialSummaryCardProps {
    income: number;
    expenses: number;
    chartData: { name: string; amount: number }[];
}

export function FinancialSummaryCard({ income, expenses, chartData }: FinancialSummaryCardProps) {
    const { t, locale, currency } = useLocale();
    const [summary, setSummary] = useState("");
    const [advice, setAdvice] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true);
            try {
                const result = await getFinancialSummary({ 
                    income, 
                    expenses, 
                    expensesByCategory: chartData,
                    language: locale,
                    currency
                });
                setSummary(result.summary);
                setAdvice(result.advice);
            } catch (error) {
                console.error("Failed to get financial summary:", error);
                setSummary(t('summary_generation_error'));
                setAdvice(t('advice_generation_error'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, [income, expenses, chartData, locale, currency, t]);

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
