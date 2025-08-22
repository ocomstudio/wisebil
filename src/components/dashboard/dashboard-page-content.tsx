// src/components/dashboard/dashboard-page-content.tsx
"use client";

import { BalanceCard } from "@/components/dashboard/balance-card";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/context/transactions-context";
import { useBudgets } from "@/context/budget-context";
import { useSavings } from "@/context/savings-context";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { TipsCard } from "@/components/dashboard/tips-card";
import { useLocale } from "@/context/locale-context";
import { FinancialSummaryCard } from "./financial-summary-card";
import { useMemo } from "react";
import { allCategories } from "@/config/categories";

export function DashboardPageContent() {
  const { transactions, balance, income, expenses } = useTransactions();
  const { budgets } = useBudgets();
  const { savingsGoals } = useSavings();
  const { t, getCategoryName } = useLocale();

  const getCategoryEmoji = (categoryName?: string) => {
    if (!categoryName) return '💸';
    const category = allCategories.find(c => c.name === categoryName);
    return category ? category.emoji : '💸';
  }

  const chartData = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    if (expenseTransactions.length === 0) {
      return [];
    }

    const expensesByCategory = expenseTransactions.reduce((acc, transaction) => {
      const category = transaction.category || "Autre";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const sortedChartData = Object.entries(expensesByCategory).map(([name, amount]) => ({
      name,
      amount,
    })).sort((a, b) => b.amount - a.amount);
    
    return sortedChartData.map(item => ({...item, name: getCategoryName(item.name)}));
  }, [transactions, getCategoryName]);

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
        <FinancialSummaryCard 
          income={income} 
          expenses={expenses} 
          chartData={chartData} 
          transactionsCount={transactions.length}
          budgetsCount={budgets.length}
          savingsGoalsCount={savingsGoals.length}
        />
      </div>
      
       <div>
        <RecentExpenses transactions={transactions} />
      </div>
    </div>
  );
}
