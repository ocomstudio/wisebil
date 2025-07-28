// src/app/dashboard/page.tsx
"use client";

import { BalanceCard } from "@/components/dashboard/balance-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { Lightbulb } from "lucide-react";
import Link from "next/link";
import { useTransactions } from "@/context/transactions-context";

export default function DashboardPage() {
  const { transactions, balance, income, expenses } = useTransactions();

  return (
    <div className="space-y-6">
      <BalanceCard balance={balance} income={income} expenses={expenses} />

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          <CardTitle className="text-lg">Conseil du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Revoyez vos abonnements mensuels. Vous pourriez être surpris de ce que vous pouvez économiser !
          </p>
        </CardContent>
      </Card>
      
      <RecentExpenses transactions={transactions} />
    </div>
  );
}
