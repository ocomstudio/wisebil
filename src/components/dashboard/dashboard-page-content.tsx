// src/components/dashboard/dashboard-page-content.tsx
"use client";

import { BalanceCard } from "@/components/dashboard/balance-card";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/context/transactions-context";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { TipsCard } from "@/components/dashboard/tips-card";
import { useLocale } from "@/context/locale-context";

export function DashboardPageContent() {
  const { transactions, balance, income, expenses } = useTransactions();
  const { t } = useLocale();

  return (
    <div className="space-y-6 pb-20">
      <div>
        <BalanceCard balance={balance} income={income} expenses={expenses} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Button asChild className="h-20 flex-col gap-2 bg-destructive hover:bg-destructive/90 text-white shadow-lg transform-gpu transition-transform hover:scale-105 w-full rounded-2xl">
            <Link href="/dashboard/add-expense">
              <TrendingDown className="h-6 w-6" />
              <span className="font-semibold">{t('add_expense_button_short')}</span>
            </Link>
          </Button>
        </div>
        <div>
          <Button asChild className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg transform-gpu transition-transform hover:scale-105 w-full rounded-2xl">
            <Link href="/dashboard/add-income">
              <TrendingUp className="h-6 w-6" />
              <span className="font-semibold">{t('add_income_button_short')}</span>
            </Link>
          </Button>
        </div>
      </div>

       <div>
        <TipsCard />
      </div>
      
       <div>
        <RecentExpenses transactions={transactions} />
      </div>
    </div>
  );
}
