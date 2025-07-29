// src/components/dashboard/balance-card.tsx
"use client";

import { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Leaf, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { useSettings } from '@/context/settings-context';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';

interface BalanceCardProps {
    balance: number;
    income: number;
    expenses: number;
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const { settings, checkPin, isTemporarilyVisible, setIsTemporarilyVisible } = useSettings();
  const { t, formatCurrency } = useLocale();
  const { toast } = useToast();

  const isVisible = !settings.isBalanceHidden || isTemporarilyVisible;

  const handleToggleVisibility = () => {
    if (isTemporarilyVisible) {
      setIsTemporarilyVisible(false);
    } else {
      if (!settings.pin) {
        toast({ variant: "destructive", title: t('no_pin_set_title'), description: t('no_pin_set_desc') });
        return;
      }
      const pin = prompt(t('enter_pin_prompt'));
      if (pin && checkPin(pin)) {
        setIsTemporarilyVisible(true);
      } else if (pin !== null) {
        toast({ variant: "destructive", title: t('incorrect_pin') });
      }
    }
  };
  
  const EyeIcon = isVisible ? EyeOff : Eye;
  
  // The toggle button is shown only if PIN lock is enabled AND balance hiding is on
  const showToggleButton = settings.isPinLockEnabled && settings.isBalanceHidden;

  return (
    <Card className="bg-card text-card-foreground shadow-xl rounded-2xl overflow-hidden relative border-primary/20 transform-gpu transition-transform hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent z-0 opacity-40"></div>
        <div className="absolute -right-10 -bottom-16 opacity-10">
            <Leaf className="h-48 w-48 text-primary" />
        </div>
        <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-primary-foreground/80">{t('total_balance')}</p>
                    <p className="text-4xl font-bold mt-1">
                        {isVisible ? formatCurrency(balance) : '******'}
                    </p>
                </div>
                {showToggleButton && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:bg-white/20 hover:text-white rounded-full" onClick={handleToggleVisibility}>
                        <EyeIcon className="h-5 w-5" />
                        <span className="sr-only">{isVisible ? t('hide_balance') : t('show_balance')}</span>
                    </Button>
                )}
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                    <div className='flex items-center gap-2 text-sm text-green-300'>
                        <TrendingUp className="h-4 w-4" />
                        <span>{t('income')}</span>
                    </div>
                    <p className="font-semibold text-lg text-primary-foreground">
                       {isVisible ? formatCurrency(income) : '******'}
                    </p>
                </div>
                 <div>
                    <div className='flex items-center gap-2 text-sm text-red-300'>
                        <TrendingDown className="h-4 w-4" />
                        <span>{t('expenses')}</span>
                    </div>
                    <p className="font-semibold text-lg text-primary-foreground">
                        {isVisible ? formatCurrency(expenses) : '******'}
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}