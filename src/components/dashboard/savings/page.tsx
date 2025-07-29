// src/app/dashboard/savings/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, Zap, Goal } from "lucide-react";
import { useSavings } from "@/context/savings-context";
import Link from "next/link";
import { SavingsGoalCard } from "@/components/dashboard/savings-goal-card";
import { useLocale } from "@/context/locale-context";

export default function SavingsPage() {
  const { savingsGoals, addFunds, deleteSavingsGoal } = useSavings();
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">{t('nav_savings')}</h1>
        <Button asChild>
          <Link href="/dashboard/savings/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('new_goal_button')}
          </Link>
        </Button>
      </div>
      
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary"/>
            <span>{t('budgets_vs_savings_title')}</span>
          </CardTitle>
          <CardDescription>
            {t('budgets_vs_savings_desc')}
          </CardDescription>
        </CardHeader>
      </Card>
      
      {savingsGoals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed">
            <CardHeader>
                <div className="mx-auto bg-secondary p-4 rounded-full mb-4">
                    <Goal className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle>{t('no_savings_goals_title')}</CardTitle>
                <CardDescription>
                    {t('no_savings_goals_desc')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                  <Link href="/dashboard/savings/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('create_goal_button')}
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
