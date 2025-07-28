// src/components/dashboard/balance-card.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from '@/lib/utils';

interface BalanceCardProps {
    balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);

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
                <div className='flex items-center gap-2'>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:bg-white/20 hover:text-white rounded-full" onClick={() => setIsVisible(!isVisible)}>
                        {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        <span className="sr-only">{isVisible ? 'Hide balance' : 'Show balance'}</span>
                    </Button>
                </div>
            </div>
            
            <div className="mt-8 flex justify-between items-center font-mono text-lg tracking-widest text-primary-foreground/90">
                <span>Wisebil</span>
                <span>5367</span>
            </div>
        </CardContent>
    </Card>
  );
}
