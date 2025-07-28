// src/components/dashboard/add-transaction-dialog.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, TrendingDown, TrendingUp } from "lucide-react";

interface AddTransactionDialogProps {
  isMobile?: boolean;
}

export function AddTransactionDialog({ isMobile = false }: AddTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const TriggerButton = isMobile ? (
    <div className="bg-primary text-primary-foreground p-4 rounded-full flex items-center justify-center">
      <PlusCircle className="h-8 w-8" />
      <span className="sr-only">Ajouter</span>
    </div>
  ) : (
    <Button size="lg" className="w-full">
      <PlusCircle className="mr-2 h-5 w-5" />
      Ajouter une transaction
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isMobile ? (
          <div className="flex flex-col items-center">
            {TriggerButton}
            <span className="text-xs mt-1 text-primary">Ajouter</span>
          </div>
        ) : (
          TriggerButton
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une transaction</DialogTitle>
          <DialogDescription>
            De quel type de transaction s'agit-il ?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 pt-4">
          <Link href="/dashboard/add-income" onClick={handleLinkClick}>
            <Card className="hover:bg-accent hover:border-primary transition-all duration-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-xl">Revenu</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-muted-foreground text-sm">
                  Ajoutez un salaire, une vente, ou toute autre forme d'entrée d'argent.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/add-expense" onClick={handleLinkClick}>
            <Card className="hover:bg-accent hover:border-primary transition-all duration-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                <div className="bg-red-500/20 p-3 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
                <CardTitle className="text-xl">Dépense</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-muted-foreground text-sm">
                  Enregistrez un achat, une facture, un loyer ou toute autre sortie d'argent.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
