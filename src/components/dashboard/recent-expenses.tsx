// src/components/dashboard/recent-expenses.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import { PlusCircle, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface RecentExpensesProps {
  transactions: Transaction[];
}

export function RecentExpenses({ transactions }: RecentExpensesProps) {
  const recentTransactions = transactions.slice(-5).reverse();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-lg">Transactions récentes</CardTitle>
            <CardDescription>Vos dernières transactions</CardDescription>
        </div>
        {transactions.length > 5 && (
            <Button variant="link" asChild>
                <Link href="/dashboard/transactions">Voir tout</Link>
            </Button>
        )}
      </CardHeader>
      <CardContent>
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
                        <div className={cn(
                          "rounded-full p-2",
                          transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                        )}>
                           {transaction.type === 'income' ? 
                           <TrendingUp className="h-5 w-5 text-green-400" /> : 
                           <TrendingDown className="h-5 w-5 text-red-400" />}
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{transaction.category}</p>
                        </div>
                        <div className="text-right">
                           <p className={cn(
                             "font-bold",
                              transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                           )}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {transaction.amount.toLocaleString('fr-FR')} FCFA
                           </p>
                           <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString('fr-FR')}
                           </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
