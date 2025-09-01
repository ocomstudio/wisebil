// src/app/dashboard/accounting/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, FileText, Scale, BookOpen } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";

export default function AccountingPage() {
  const { t } = useLocale();

  const comingFeatures = [
    {
      name: "Plan Comptable",
      icon: <FileText className="h-6 w-6 text-primary" />,
      description: "Conforme OHADA, IFRS, SYSCOHADA."
    },
    {
      name: "Journaux Automatiques",
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      description: "Achats, ventes, banque, paie, etc."
    },
    {
      name: "Balance & Grand Livre",
      icon: <Scale className="h-6 w-6 text-primary" />,
      description: "Génération automatique et en temps réel."
    }
  ]

  return (
    <div className="flex items-center justify-center h-full pt-10 md:pt-0">
      <Card className="w-full max-w-2xl text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full mb-4 w-fit">
            <Construction className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="font-headline text-3xl">Module Comptable en Construction</CardTitle>
          <CardDescription className="text-lg">
            Nous bâtissons la suite comptable la plus puissante pour vous.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground mb-8">
                Cette section est en cours de développement pour intégrer des fonctionnalités de comptabilité professionnelle de pointe.
            </p>
            <div className="space-y-4 text-left mb-8">
                <h3 className="font-semibold text-center text-xl font-headline">Fonctionnalités à venir :</h3>
                {comingFeatures.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        {feature.icon}
                        <div>
                            <p className="font-semibold">{feature.name}</p>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            <Button asChild>
                <Link href="/dashboard">
                    Retourner à l'accueil
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
