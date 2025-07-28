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
    <Card className="bg-primary/90 text-primary-foreground shadow-lg rounded-2xl overflow-hidden relative">
        <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-primary-foreground/80">Solde Total</p>
                    <p className="text-3xl font-bold mt-1">
                        {isVisible ? `${balance.toLocaleString('fr-FR')} FCFA` : '******'}
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <svg width="48" height="30" viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M48 2.94318C48 1.31932 46.6859 0 45.0714 0H2.92857C1.31411 0 0 1.31932 0 2.94318V27.0568C0 28.6807 1.31411 30 2.92857 30H45.0714C46.6859 30 48 28.6807 48 27.0568V2.94318Z" fill="white"/>
                        <path d="M22.9572 17.6591C22.6841 17.3864 22.4636 16.8807 22.4636 16.4886V9.41818H20.258V16.6341C20.258 17.2045 20.4443 17.6932 20.8523 18.0682C21.2602 18.4432 21.8011 18.6364 22.4636 18.6364H25.7994V16.6341H23.5261C23.2364 16.6341 23.0602 16.5227 22.9572 16.4886V17.6591Z" fill="#003A70"/>
                        <path d="M12.2216 18.5227V9.41818H10.017V15.0455H4.80114V9.41818H2.59659V18.5227H4.80114V16.9636H10.017V18.5227H12.2216Z" fill="#003A70"/>
                        <path d="M18.1506 9.41818L15.3523 18.5227H17.6932L18.2932 16.5227H22.1881L22.7881 18.5227H25.129L22.3307 9.41818H18.1506ZM21.5716 14.8045H18.8102L20.2119 10.3636L21.5716 14.8045Z" fill="#F27221"/>
                        <path d="M37.3693 9.41818L34.125 14.9318L30.8807 9.41818H28.3068L32.8864 16.6364V18.5227H35.6136V16.6364L40.1932 9.41818H37.3693Z" fill="#F27221"/>
                        <path d="M45.4034 9.41818V18.5227H43.1989V9.41818H45.4034Z" fill="#F27221"/>
                    </svg>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:bg-white/20 hover:text-white" onClick={() => setIsVisible(!isVisible)}>
                        {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        <span className="sr-only">{isVisible ? 'Hide balance' : 'Show balance'}</span>
                    </Button>
                </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center font-mono text-lg tracking-widest">
                <span>****</span>
                <span>****</span>
                <span>****</span>
                <span>5367</span>
            </div>
             <div className="absolute -right-10 -bottom-10 opacity-20">
                <Leaf className="h-40 w-40 text-white" />
            </div>
        </CardContent>
    </Card>
  );
}
