// src/app/dashboard/page.tsx
"use client";

import { BalanceCard } from "@/components/dashboard/balance-card";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { useTransactions } from "@/context/transactions-context";
import { ArrowUpRight, Plus, Repeat } from "lucide-react";
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

      <div className="grid grid-cols-3 gap-3 text-center">
        <Button variant="outline" className="flex-col h-20">
          <Repeat className="h-5 w-5 mb-1 text-primary"/>
          <span className="text-xs">Envoyer</span>
        </Button>
         <Button variant="outline" className="flex-col h-20">
          <ArrowUpRight className="h-5 w-5 mb-1 text-primary"/>
          <span className="text-xs">Recevoir</span>
        </Button>
        <AddTransactionDialog>
            <Button variant="outline" className="flex-col h-20">
                <Plus className="h-5 w-5 mb-1 text-primary"/>
                <span className="text-xs">Ajouter</span>
            </Button>
        </AddTransactionDialog>
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
