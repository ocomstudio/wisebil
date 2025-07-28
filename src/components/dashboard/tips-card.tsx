// src/components/dashboard/tips-card.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

const tips = [
    "Créez un budget mensuel et suivez-le.",
    "Mettez de côté au moins 20% de vos revenus.",
    "Automatisez vos virements vers votre compte épargne.",
    "Évitez les achats impulsifs en attendant 24h avant de décider.",
    "Comparez les prix avant de faire un gros achat."
];

export function TipsCard() {
    const [tip, setTip] = useState("Chargement de l'astuce...");

    useEffect(() => {
        // This code runs only on the client, after hydration
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setTip(randomTip);
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <Card className="bg-secondary/50 border-dashed">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-base font-medium">Astuce du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{tip}</p>
            </CardContent>
        </Card>
    );
}
