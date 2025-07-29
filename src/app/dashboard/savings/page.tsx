// src/app/dashboard/savings/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, Zap, Goal } from "lucide-react";
import { useSavings } from "@/context/savings-context";
import Link from "next/link";
import { SavingsGoalCard } from "@/components/dashboard/savings-goal-card";

export default function SavingsPage() {
  const { savingsGoals, addFunds, deleteSavingsGoal } = useSavings();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Objectifs d'Épargne</h1>
        <Button asChild>
          <Link href="/dashboard/savings/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvel Objectif
          </Link>
        </Button>
      </div>
      
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary"/>
            <span>Budgets vs. Épargne</span>
          </CardTitle>
          <CardDescription>
            Utilisez les **Budgets** pour contrôler vos dépenses mensuelles et l'**Épargne** pour atteindre vos grands objectifs financiers.
          </CardDescription>
        </CardHeader>
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
                <Button asChild>
                  <Link href="/dashboard/savings/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer un objectif
                  </Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savingsGoals.map(goal => (
            <SavingsGoalCard 
              key={goal.id} 
              goal={goal}
              onAddFunds={addFunds}
              onDelete={deleteSavingsGoal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
