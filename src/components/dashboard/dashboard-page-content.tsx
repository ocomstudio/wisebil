// src/components/dashboard/dashboard-page-content.tsx
"use client";

import { useState, useEffect } from "react";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/context/transactions-context";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import { TipCard } from "./tip-card";
import { Tutorial, TutorialSteps } from "@/components/common/tutorial-step";
import { useAuth } from "@/context/auth-context";
import { useTutorial } from "@/context/tutorial-context";

export function DashboardPageContent() {
  const { transactions, balance, income, expenses } = useTransactions();
  const { t } = useLocale();
  const { user, updateUser } = useAuth();
  const { showTutorial, setShowTutorial } = useTutorial();

  useEffect(() => {
    // Only show tutorial if the flag is explicitly false
    if (user && user.hasCompletedTutorial === false) {
      setShowTutorial(true);
    }
  }, [user, setShowTutorial]);

  const handleTutorialFinish = () => {
    setShowTutorial(false);
    if (user && user.hasCompletedTutorial === false) {
      updateUser({ hasCompletedTutorial: true });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <Tutorial
        steps={TutorialSteps}
        isOpen={showTutorial}
        onFinish={handleTutorialFinish}
      />
      <div id="balance-card-tutorial">
        <BalanceCard balance={balance} income={income} expenses={expenses} />
      </div>

      <div className="grid grid-cols-2 gap-4" id="add-transaction-tutorial">
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

       <div id="tip-card-tutorial">
        <TipCard />
      </div>
      
       <div id="recent-transactions-tutorial">
        <RecentExpenses transactions={transactions} />
      </div>
    </div>
  );
}
