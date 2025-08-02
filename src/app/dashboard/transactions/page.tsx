// src/app/dashboard/transactions/page.tsx
"use client";

import { useTransactions } from "@/context/transactions-context";
import { useSettings } from "@/context/settings-context";
import { useLocale } from "@/context/locale-context";
import type { Transaction } from "@/types/transaction";
import { allCategories } from "@/config/categories";
import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AllTransactionsPage() {
  const { transactions, deleteTransaction } = useTransactions();
  const { settings, isTemporarilyVisible } = useSettings();
  const { t, formatCurrency, formatDate } = useLocale();
  const isVisible = !settings.isBalanceHidden || isTemporarilyVisible;

  const getCategoryEmoji = (categoryName?: string) => {
    if (!categoryName) return '💸';
    const category = allCategories.find(c => c.name === categoryName);
    return category ? category.emoji : '💸';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">{t('all_transactions')}</h1>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center gap-4 p-3 rounded-lg bg-card hover:bg-muted/50 shadow-sm">
            <Avatar>
              <AvatarFallback className="text-xl bg-secondary">
                {getCategoryEmoji(transaction.category)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="font-semibold">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(transaction.date)}
              </p>
            </div>
            <div className="text-right">
              <p className={cn(
                "font-bold",
                transaction.type === 'income' ? 'text-green-600' : 'text-foreground'
              )}>
                {isVisible ? (
                  <>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </>
                ) : '******'}
              </p>
            </div>
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/edit-transaction/${transaction.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t('edit')}
                    </Link>
                  </DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('delete')}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('transaction_delete_confirmation', { transactionDesc: transaction.description })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteTransaction(transaction.id)} className="bg-destructive hover:bg-destructive/90">
                    {t('delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}