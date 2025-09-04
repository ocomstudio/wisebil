// src/app/dashboard/entreprise/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";

export default function EntrepriseHubPage() {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-center h-full pt-10 md:pt-0">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full mb-4 w-fit">
            <Construction className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="font-headline">{t('coming_soon_title')}</CardTitle>
          <CardDescription>
            La gestion d'entreprise multi-utilisateurs est en cours de finalisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
                Nous travaillons dur pour vous apporter des outils puissants pour collaborer en équipe. Merci de votre patience !
            </p>
            <Button asChild>
                <Link href="/dashboard">
                    {t('back_to_dashboard')}
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
