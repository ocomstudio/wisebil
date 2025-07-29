// src/app/dashboard/edit-transaction/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/context/transactions-context";
import { TransactionForm } from "@/components/dashboard/transaction-form";
import type { Transaction } from "@/types/transaction";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditTransactionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { getTransactionById, updateTransaction } = useTransactions();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const transaction = getTransactionById(id);
      if (transaction) {
        setInitialData(transaction);
      } else {
        toast({
          variant: "destructive",
          title: "Transaction non trouvée",
        });
        router.push("/dashboard");
      }
    }
  }, [id, getTransactionById, router, toast]);

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'type'>) => {
    if (!initialData) return;
    setIsSubmitting(true);
    try {
      await updateTransaction(id, { ...initialData, ...data });
      toast({
        title: "Transaction modifiée",
        description: `La transaction a été modifiée avec succès.`,
      });
      router.push("/dashboard");
    } catch (error) {
       console.error("Failed to update transaction:", error);
       toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier la transaction. Veuillez réessayer.",
      });
      setIsSubmitting(false);
    }
  };

  if (!initialData) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-9 w-64" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Modifier la transaction</h1>
      </div>
      <TransactionForm 
        transactionType={initialData.type}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialData={initialData}
        submitButtonText="Sauvegarder les modifications"
      />
    </div>
  );
}
