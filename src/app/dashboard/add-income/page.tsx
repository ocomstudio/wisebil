// src/app/dashboard/add-income/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/context/transactions-context";
import { TransactionForm } from "@/components/dashboard/transaction-form";
import type { Transaction } from "@/types/transaction";

export default function AddIncomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'type'>) => {
    setIsSubmitting(true);
    try {
      const newTransaction: Transaction = {
        id: new Date().toISOString(),
        type: 'income',
        ...data
      };
      await addTransaction(newTransaction);
      toast({
        title: "Revenu ajouté",
        description: `Le revenu "${data.description}" a été ajouté avec succès.`,
      });
      router.push("/dashboard");
    } catch (error) {
       console.error("Failed to add income:", error);
       toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le revenu. Veuillez réessayer.",
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
        <h1 className="text-3xl font-bold font-headline">Ajouter un revenu</h1>
      </div>
      <TransactionForm 
        transactionType="income"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Ajouter le revenu"
      />
    </div>
  );
}
