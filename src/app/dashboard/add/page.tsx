// src/app/dashboard/add/page.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddTransactionTypePage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Ajouter une transaction</h1>
      </div>

      <p className="text-muted-foreground">
        De quel type de transaction s'agit-il ? Choisissez une option ci-dessous pour continuer.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/add-income">
          <Card className="hover:bg-accent hover:border-primary transition-all duration-200 cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
               <div className="bg-green-500/20 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-xl">Revenu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ajoutez un salaire, une vente, ou toute autre forme d'entrée d'argent.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/add-expense">
          <Card className="hover:bg-accent hover:border-primary transition-all duration-200 cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
               <div className="bg-red-500/20 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
              <CardTitle className="text-xl">Dépense</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Enregistrez un achat, une facture, un loyer ou toute autre sortie d'argent.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
