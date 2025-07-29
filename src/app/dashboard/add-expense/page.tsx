// src/app/dashboard/add-expense/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/context/transactions-context";
import { TransactionForm } from "@/components/dashboard/transaction-form";
import type { Transaction } from "@/types/transaction";
import { useState } from "react";

export default function AddExpensePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'type'>) => {
    setIsSubmitting(true);
    try {
      const newTransaction: Transaction = {
        id: new Date().toISOString(),
        type: 'expense',
        ...data
      };
      await addTransaction(newTransaction);
      toast({
        title: "Dépense ajoutée",
        description: `La dépense "${data.description}" a été ajoutée avec succès.`,
      });
      router.push("/dashboard");
    } catch (error) {
       console.error("Failed to add expense:", error);
       toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter la dépense. Veuillez réessayer.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Ajouter une dépense</h1>
      </div>
      <TransactionForm 
        transactionType="expense"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Ajouter la dépense"
      />
    </div>
  );
}
