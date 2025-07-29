// src/app/dashboard/budget/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useBudgets } from "@/context/budget-context";
import { BudgetCard } from "@/components/dashboard/budget-card";
import { useTransactions } from "@/context/transactions-context";

export default function BudgetPage() {
  const { budgets, deleteBudget } = useBudgets();
  const { transactions } = useTransactions();

  const getSpentAmount = (category: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Budgets</h1>
        <Button asChild>
          <Link href="/dashboard/budget/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer un budget
          </Link>
        </Button>
      </div>

      {budgets.length === 0 ? (
         <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed bg-card">
            <CardHeader>
                <div className="mx-auto bg-secondary p-4 rounded-full mb-4">
                    <FilePlus className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle>Aucun budget créé</CardTitle>
                <CardDescription>
                    Les budgets vous aident à suivre et limiter vos dépenses par catégorie chaque mois.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                  <Link href="/dashboard/budget/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer votre premier budget
                  </Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map(budget => (
            <BudgetCard 
              key={budget.id} 
              budget={budget} 
              spent={getSpentAmount(budget.category)} 
              onDelete={() => deleteBudget(budget.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
