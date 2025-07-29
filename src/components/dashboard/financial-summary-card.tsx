// src/components/dashboard/financial-summary-card.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFinancialSummary } from "@/ai/flows/financial-summary";
import { Loader2, Lightbulb, Activity } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface FinancialSummaryCardProps {
    income: number;
    expenses: number;
    chartData: { name: string; amount: number }[];
}

export function FinancialSummaryCard({ income, expenses, chartData }: FinancialSummaryCardProps) {
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
                    expensesByCategory: chartData 
                });
                setSummary(result.summary);
                setAdvice(result.advice);
            } catch (error) {
                console.error("Failed to get financial summary:", error);
                setSummary("Impossible de générer le résumé.");
                setAdvice("Une erreur est survenue lors de l'analyse de vos données.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, [income, expenses, chartData]);

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
                        <h4 className="font-semibold">Résumé du mois</h4>
                        <p className="text-sm text-muted-foreground">{summary}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Lightbulb className="h-5 w-5 text-yellow-400 mt-1" />
                    <div>
                        <h4 className="font-semibold">Conseil pour vous</h4>
                        <p className="text-sm text-muted-foreground">{advice}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
