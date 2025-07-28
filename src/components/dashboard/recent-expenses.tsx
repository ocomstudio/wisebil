// src/components/dashboard/recent-expenses.tsx
import Link from "next/link";
import { Button } from "../ui/button";
import { PlusCircle, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface RecentExpensesProps {
  transactions: Transaction[];
}

export function RecentExpenses({ transactions }: RecentExpensesProps) {
  const recentTransactions = transactions.slice(-5).reverse();

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold">Transactions Récentes</h2>
         {transactions.length > 5 && (
            <Button variant="link" size="sm" asChild>
                <Link href="/dashboard/transactions">Voir tout</Link>
            </Button>
        )}
      </div>
      <div className="bg-background rounded-lg p-4 space-y-4">
        {transactions.length === 0 ? (
           <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="bg-secondary p-3 rounded-full mb-4">
                    <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Aucune transaction</h3>
                <p className="text-muted-foreground text-sm mb-4">
                    Commencez à suivre vos revenus et dépenses pour les voir ici.
                </p>
                <Button asChild>
                    <Link href="/dashboard/add-expense">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Ajouter une transaction
                    </Link>
                </Button>
           </div>
        ) : (
            <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center gap-4">
                        <Avatar>
                            <AvatarFallback>
                                {transaction.description.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="text-right">
                           <p className={cn(
                             "font-bold",
                              transaction.type === 'income' ? 'text-green-600' : 'text-foreground'
                           )}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {transaction.amount.toLocaleString('fr-FR')} FCFA
                           </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
