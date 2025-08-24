// src/components/dashboard/financial-summary-card.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Activity, TrendingUp } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useLocale } from "@/context/locale-context";
import { getFinancialSummary } from "@/ai/flows/financial-summary";
import type { FinancialSummaryInput } from "@/types/ai-schemas";
import { Separator } from "../ui/separator";
import { useAuth } from "@/context/auth-context";

interface FinancialSummaryCardProps {
    income: number;
    expenses: number;
    chartData: { name: string; amount: number }[];
}

type CachedData = {
    value: string;
    timestamp: number;
};

export function FinancialSummaryCard({ income, expenses, chartData }: FinancialSummaryCardProps) {
    const { t, language, currency } = useLocale();
    const { user } = useAuth();
    
    const [summary, setSummary] = useState("");
    const [advice, setAdvice] = useState("");
    const [prediction, setPrediction] = useState("");
    
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    const [isAdviceLoading, setIsAdviceLoading] = useState(true);
    const [isPredictionLoading, setIsPredictionLoading] = useState(true);

    const getCacheKey = useCallback((key: string) => user ? `financial_${key}_${user.uid}` : null, [user]);

    const checkCache = useCallback((key: string, validityDuration: number): CachedData | null => {
        const cacheKey = getCacheKey(key);
        if (!cacheKey) return null;

        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const data: CachedData = JSON.parse(cached);
        if (Date.now() - data.timestamp < validityDuration) {
            return data;
        }
        return null;
    }, [getCacheKey]);

    const setCache = useCallback((key: string, value: string) => {
        const cacheKey = getCacheKey(key);
        if (!cacheKey) return;
        const data: CachedData = { value, timestamp: Date.now() };
        localStorage.setItem(cacheKey, JSON.stringify(data));
    }, [getCacheKey]);

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (!user) return; // Don't run if user is not available

            const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
            const TWICE_A_DAY_IN_MS = 12 * 60 * 60 * 1000;
            const DAY_IN_MS = 24 * 60 * 60 * 1000;

            const cachedSummary = checkCache('summary', MONTH_IN_MS);
            const cachedAdvice = checkCache('advice', TWICE_A_DAY_IN_MS);
            const cachedPrediction = checkCache('prediction', DAY_IN_MS);

            if (cachedSummary) {
                setSummary(cachedSummary.value);
                setIsSummaryLoading(false);
            }
            if (cachedAdvice) {
                setAdvice(cachedAdvice.value);
                setIsAdviceLoading(false);
            }
            if (cachedPrediction) {
                setPrediction(cachedPrediction.value);
                setIsPredictionLoading(false);
            }

            if (cachedSummary && cachedAdvice && cachedPrediction) {
                return;
            }

            try {
                const input: FinancialSummaryInput = {
                    income,
                    expenses,
                    expensesByCategory: chartData.map(d => ({ name: d.name, amount: d.amount })),
                    language,
                    currency,
                };
                const result = await getFinancialSummary(input);

                if (!cachedSummary) {
                    setSummary(result.summary);
                    setCache('summary', result.summary);
                }
                if (!cachedAdvice) {
                    setAdvice(result.advice);
                    setCache('advice', result.advice);
                }
                if (!cachedPrediction) {
                    setPrediction(result.prediction);
                    setCache('prediction', result.prediction);
                }
            } catch (error) {
                console.error("Error fetching financial summary:", error);
                if (!cachedSummary) setSummary(t('summary_generation_error'));
                if (!cachedAdvice) setAdvice(t('advice_generation_error'));
                if (!cachedPrediction) setPrediction(t('prediction_generation_error'));
            } finally {
                setIsSummaryLoading(false);
                setIsAdviceLoading(false);
                setIsPredictionLoading(false);
            }
        };

        fetchAndSetData();
    }, [user, income, expenses, chartData, language, currency, t, checkCache, setCache]);

    const renderField = (isLoading: boolean, value: string, title: string, Icon: React.ElementType) => (
        <div className="flex items-start gap-4">
            <Icon className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1">
                <h4 className="font-semibold">{title}</h4>
                {isLoading ? (
                    <Skeleton className="h-4 w-3/4 mt-1" />
                ) : (
                    <p className="text-sm text-muted-foreground">{value}</p>
                )}
            </div>
        </div>
    );

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                {renderField(isSummaryLoading, summary, t('monthly_summary_title'), Activity)}
                <Separator />
                {renderField(isAdviceLoading, advice, t('advice_for_you_title'), Lightbulb)}
                <Separator />
                {renderField(isPredictionLoading, prediction, t('spending_forecast_title'), TrendingUp)}
            </CardContent>
        </Card>
    );
}
