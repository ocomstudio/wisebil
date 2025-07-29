// src/components/dashboard/balance-card.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Leaf, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { useSettings } from '@/context/settings-context';
import { useToast } from '@/hooks/use-toast';

interface BalanceCardProps {
    balance: number;
    income: number;
    expenses: number;
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const { settings, updateSettings, checkPin } = useSettings();
  const { toast } = useToast();

  const handleToggleVisibility = () => {
    if (settings.isBalanceHidden) {
      if (settings.isPinLockEnabled) {
        const pin = prompt("Veuillez entrer votre code PIN pour afficher le solde.");
        if (pin && checkPin(pin)) {
          updateSettings({ isBalanceHidden: false });
        } else {
          toast({ variant: "destructive", title: "Code PIN incorrect" });
        }
      } else {
         updateSettings({ isBalanceHidden: false });
      }
    } else {
      updateSettings({ isBalanceHidden: true });
    }
  };

  const isVisible = !settings.isBalanceHidden;

  return (
    <Card className="bg-card text-card-foreground shadow-xl rounded-2xl overflow-hidden relative border-primary/20 transform-gpu transition-transform hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent z-0 opacity-40"></div>
        <div className="absolute -right-10 -bottom-16 opacity-10">
            <Leaf className="h-48 w-48 text-primary" />
        </div>
        <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-primary-foreground/80">Solde Total</p>
                    <p className="text-4xl font-bold mt-1">
                        {isVisible ? `${balance.toLocaleString('fr-FR')} FCFA` : '******'}
                    </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:bg-white/20 hover:text-white rounded-full" onClick={handleToggleVisibility}>
                    {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    <span className="sr-only">{isVisible ? 'Cacher le solde' : 'Afficher le solde'}</span>
                </Button>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                    <div className='flex items-center gap-2 text-sm text-green-300'>
                        <TrendingUp className="h-4 w-4" />
                        <span>Revenus</span>
                    </div>
                    <p className="font-semibold text-lg text-primary-foreground">
                       {isVisible ? `${income.toLocaleString('fr-FR')} FCFA` : '******'}
                    </p>
                </div>
                 <div>
                    <div className='flex items-center gap-2 text-sm text-red-300'>
                        <TrendingDown className="h-4 w-4" />
                        <span>Dépenses</span>
                    </div>
                    <p className="font-semibold text-lg text-primary-foreground">
                        {isVisible ? `${expenses.toLocaleString('fr-FR')} FCFA` : '******'}
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
