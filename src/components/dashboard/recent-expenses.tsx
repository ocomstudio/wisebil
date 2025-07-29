// src/components/dashboard/recent-expenses.tsx
import Link from "next/link";
import { Button } from "../ui/button";
import { PlusCircle, Receipt, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { allCategories } from "@/config/categories";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useTransactions } from "@/context/transactions-context";
import { useSettings } from "@/context/settings-context";
import { useLocale } from "@/context/locale-context";

interface RecentExpensesProps {
  transactions: Transaction[];
}

export function RecentExpenses({ transactions }: RecentExpensesProps) {
  const { deleteTransaction } = useTransactions();
  const { settings, isTemporarilyVisible } = useSettings();
  const { t, formatCurrency, formatDate } = useLocale();
  const isVisible = !settings.isBalanceHidden || isTemporarilyVisible;
  const recentTransactions = transactions.slice(0, 5);

  const getCategoryEmoji = (categoryName?: string) => {
    if (!categoryName) return '💸';
    const category = allCategories.find(c => c.name === categoryName);
    return category ? category.emoji : '💸';
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold">{t('recent_transactions')}</h2>
         {transactions.length > 5 && (
            <Button variant="link" size="sm" asChild>
                <Link href="/dashboard/transactions">{t('see_all')}</Link>
            </Button>
        )}
      </div>
      <div className="bg-background rounded-lg p-4 space-y-4">
        {transactions.length === 0 ? (
           <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="bg-secondary p-3 rounded-full mb-4">
                    <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{t('no_transactions_yet')}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                    {t('start_tracking_prompt')}
                </p>
                <Button asChild>
                    <Link href="/dashboard/add-expense">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        {t('add_transaction_button')}
                    </Link>
                </Button>
           </div>
        ) : (
            <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
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
        )}
      </div>
    </div>
  );
}
