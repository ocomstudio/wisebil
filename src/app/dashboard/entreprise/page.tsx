// src/app/dashboard/entreprise/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";

export default function EntreprisePage() {
  const { t } = useLocale();

  return (
     <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Espace Entreprise</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 hover:shadow-xl transition-all">
          <CardHeader>
            <div className="mb-4 flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Briefcase className="h-8 w-8 text-primary"/>
                </div>
            </div>
            <CardTitle className="text-center">Comptabilité</CardTitle>
            <CardDescription className="text-center">
              Accédez au module de comptabilité pour gérer les finances de votre entreprise.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
                <Link href="/dashboard/accounting">
                    Ouvrir la comptabilité <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
          </CardContent>
        </Card>

         <Card className="border-dashed flex flex-col items-center justify-center text-center p-6">
            <CardHeader>
                <CardTitle className="text-muted-foreground">Plus de fonctionnalités à venir</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Nous travaillons sur de nouveaux outils pour la gestion d'entreprise.
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
