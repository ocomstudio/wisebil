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
import { useLocale } from "@/context/locale-context";

export default function AddExpensePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLocale();
  const { toast } = useToast();
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const handleSubmit = (data: Omit<Transaction, 'id' | 'type'>) => {
    setIsSubmitting(true);
    
    const newTransaction: Transaction = {
      id: new Date().toISOString(),
      type: 'expense',
      ...data
    };
    
    // Optimistic UI update: navigate away and show toast immediately.
    toast({
      title: t('expense_added_title'),
      description: t('expense_added_desc', { expenseDesc: data.description }),
    });
    router.push("/dashboard");

    // Send to server in the background.
    addTransaction(newTransaction).catch(error => {
      console.error("Failed to add expense:", error);
      // Optionally, handle the error more gracefully, e.g., by showing a persistent error message
      // or providing a "retry" option. For now, a toast is sufficient.
      toast({
        variant: "destructive",
        title: t('error_title'),
        description: t('expense_add_error_desc'),
      });
      // We don't need to `setIsSubmitting(false)` because we've already navigated away.
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">{t('add_expense_page_title')}</h1>
      </div>
      <TransactionForm 
        transactionType="expense"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText={t('add_expense_button')}
      />
    </div>
  );
}
