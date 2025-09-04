// src/app/dashboard/team/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";

export default function TeamPage() {
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
            Le module de gestion d'équipe est en cours de développement.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
               Vous pourrez bientôt inviter des membres, suivre les dépenses de l'équipe et collaborer sur les finances de votre entreprise.
            </p>
            <Button asChild>
                <Link href="/dashboard/entreprise">
                    Retour à l'Espace Entreprise
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
