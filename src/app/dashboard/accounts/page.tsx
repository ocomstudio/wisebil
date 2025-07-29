// src/app/dashboard/accounts/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";
import Link from "next/link";

export default function AccountsPage() {
  return (
    <div className="flex items-center justify-center h-full pt-10 md:pt-0">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full mb-4 w-fit">
            <Construction className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="font-headline">Bientôt disponible !</CardTitle>
          <CardDescription>
            La fonctionnalité de gestion des comptes est en cours de développement. 
            Nous travaillons dur pour vous l'apporter au plus vite.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
                Vous pourrez bientôt lier vos comptes pour une synchronisation automatique et une vue d'ensemble complète.
            </p>
            <Button asChild>
                <Link href="/dashboard">
                    Retour à l'accueil
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
