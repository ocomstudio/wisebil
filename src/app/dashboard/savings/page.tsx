// src/app/dashboard/savings/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, Zap, Goal } from "lucide-react";


const savingsGoals: any[] = [];

export default function SavingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Objectifs d'Épargne</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvel Objectif
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary"/>
              <span>Règle des 50/30/20</span>
            </CardTitle>
            <CardDescription>
              Une règle simple pour gérer votre budget : 50% pour les besoins, 30% pour les envies, et 20% pour l'épargne.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Button size="sm">En savoir plus</Button>
          </CardContent>
        </Card>
        
        {savingsGoals.length === 0 ? (
          <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed">
              <CardHeader>
                  <div className="mx-auto bg-secondary p-4 rounded-full mb-4">
                      <Goal className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardTitle>Aucun objectif d'épargne</CardTitle>
                  <CardDescription>
                      Créez votre premier objectif pour commencer à épargner pour ce qui compte.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Créer un objectif
                  </Button>
              </CardContent>
          </Card>
        ) : (
          <div className="md:col-span-2">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Savings goals would be mapped here */}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
