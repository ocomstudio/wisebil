// src/components/dashboard/balance-card.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";

interface BalanceCardProps {
    balance: number;
    income: number;
    expenses: number;
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <Card className="bg-gradient-to-br from-primary/80 to-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-primary-foreground/80">
          Solde
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground/80 hover:bg-white/20 hover:text-white" onClick={() => setIsVisible(!isVisible)}>
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">{isVisible ? 'Hide balance' : 'Show balance'}</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-primary-foreground">
          {isVisible ? `${balance.toLocaleString('fr-FR')} FCFA` : '******'}
        </div>
        <div className="mt-4 flex justify-between text-primary-foreground/90">
            <div className="text-sm">
                <p className="text-xs opacity-70">Revenus</p>
                <p className="font-semibold">{isVisible ? `${income.toLocaleString('fr-FR')} FCFA` : '******'}</p>
            </div>
             <div className="text-sm text-right">
                <p className="text-xs opacity-70">Dépenses</p>
                <p className="font-semibold">{isVisible ? `${expenses.toLocaleString('fr-FR')} FCFA` : '******'}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
