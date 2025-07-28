// src/app/dashboard/page.tsx
"use client";

import { BalanceCard } from "@/components/dashboard/balance-card";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactions } from "@/context/transactions-context";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { transactions, balance } = useTransactions();
  const savingsGoals = [
    { id: 1, name: "Vacances", amount: 921, icon: "🌴" },
    { id: 2, name: "Voiture", amount: 1274, icon: "🚗" },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="space-y-6 pb-20">
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <BalanceCard balance={balance} />
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Button asChild className="h-20 flex-col gap-2 bg-destructive hover:bg-destructive/90 text-white shadow-lg transform-gpu transition-transform hover:scale-105 w-full">
            <Link href="/dashboard/add-expense">
              <TrendingDown className="h-6 w-6" />
              <span className="font-semibold">Ajouter dépense</span>
            </Link>
          </Button>
        </motion.div>
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Button asChild className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg transform-gpu transition-transform hover:scale-105 w-full">
            <Link href="/dashboard/add-income">
              <TrendingUp className="h-6 w-6" />
              <span className="font-semibold">Ajouter revenu</span>
            </Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Épargne</h2>
            <Button variant="link" size="sm" asChild>
                <Link href="/dashboard/savings">Ajouter</Link>
            </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {savingsGoals.map(goal => (
            <Card key={goal.id} className="shadow-lg transform-gpu transition-transform hover:scale-105">
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
      </motion.div>
      
       <motion.div
        custom={4}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <RecentExpenses transactions={transactions} />
      </motion.div>
    </div>
  );
}
