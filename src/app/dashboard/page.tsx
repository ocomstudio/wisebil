// src/app/dashboard/page.tsx
"use client";

import { BalanceCard } from "@/components/dashboard/balance-card";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactions } from "@/context/transactions-context";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { transactions, balance } = useTransactions();
  const savingsGoals = [
    { id: 1, name: "Vacances", amount: 921, icon: "🌴" },
    { id: 2, name: "Voiture", amount: 1274, icon: "🚗" },
  ];

  return (
    <div className="space-y-6 pb-20">
      <BalanceCard balance={balance} />

      <div className="grid grid-cols-2 gap-4">
        <Button asChild className="h-20 flex-col gap-2 bg-red-600 hover:bg-red-700 text-white shadow-md">
          <Link href="/dashboard/add-expense">
            <TrendingDown className="h-6 w-6" />
            <span className="font-semibold">Ajouter une dépense</span>
          </Link>
        </Button>
        <Button asChild className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md">
           <Link href="/dashboard/add-income">
            <TrendingUp className="h-6 w-6" />
            <span className="font-semibold">Ajouter un revenu</span>
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Épargne</h2>
            <Button variant="link" size="sm" asChild>
                <Link href="/dashboard/savings">Ajouter</Link>
            </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {savingsGoals.map(goal => (
            <Card key={goal.id}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-secondary mb-4">
                        <span className="text-2xl">{goal.icon}</span>
                    </div>
                    <p className="font-semibold">{goal.name}</p>
                    <p className="text-lg font-bold">{goal.amount.toLocaleString('fr-FR')} FCFA</p>
                </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <RecentExpenses transactions={transactions} />
    </div>
  );
}
