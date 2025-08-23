// src/components/dashboard/tip-card.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { Skeleton } from "../ui/skeleton";

export function TipCard() {
    const { t } = useLocale();
    const [tip, setTip] = useState("");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            const tips = [
                t('tip1'),
                t('tip2'),
                t('tip3'),
                t('tip4'),
                t('tip5')
            ];
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            setTip(randomTip);
        }
    }, [isClient, t]);

    if (!isClient) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    <CardTitle className="text-base font-medium">{t('tip_of_the_day')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-secondary/50 border-dashed">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-base font-medium">{t('tip_of_the_day')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{tip || t('loading_tip')}</p>
            </CardContent>
        </Card>
    );
}
