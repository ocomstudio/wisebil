// src/app/dashboard/edit-transaction/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/context/transactions-context";
import { TransactionForm } from "@/components/dashboard/transaction-form";
import type { Transaction } from "@/types/transaction";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/context/locale-context";

export default function EditTransactionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { getTransactionById, updateTransaction } = useTransactions();
  const { t } = useLocale();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const transaction = getTransactionById(id);
      if (transaction) {
        setInitialData(transaction);
      } else {
        toast({
          variant: "destructive",
          title: t('transaction_not_found'),
        });
        router.push("/dashboard");
      }
      setIsLoading(false);
    }
  }, [id, getTransactionById, router, toast, t]);

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'type'>) => {
    if (!initialData) return;
    setIsSubmitting(true);
    
    // Use the callback-based version of updateTransaction
    await updateTransaction(id, {
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date
    });

    toast({
      title: t('transaction_updated_title'),
      description: t('transaction_updated_desc'),
    });
    router.push("/dashboard");

    // No need for a catch block here as the context handles it
    // No need to setIsSubmitting(false) as we navigate away
  };

  if (isLoading) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-9 w-64" />
            </div>
            <div className="space-y-6 bg-card p-6 rounded-lg">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
            </div>
        </div>
    );
  }

  if (!initialData) {
    return null; // or a not found component
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">{t('edit_transaction_page_title')}</h1>
      </div>
      <TransactionForm 
        transactionType={initialData.type}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialData={initialData}
        submitButtonText={t('save_changes_button')}
      />
    </div>
  );
}
