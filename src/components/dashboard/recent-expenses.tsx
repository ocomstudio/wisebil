// src/components/dashboard/recent-expenses.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";
import { Shirt, Utensils } from "lucide-react";

// Mock data
const initialExpenses = [
  { id: '1', description: 'Vêtements et chaussures', amount: 30000, category: 'Shopping', date: new Date(), icon: <Shirt className="h-5 w-5"/> },
  { id: '2', description: 'Restaurant', amount: 15000, category: 'Dining', date: new Date(), icon: <Utensils className="h-5 w-5" /> },
];

export function RecentExpenses() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-lg">Dépenses récentes</CardTitle>
            <CardDescription>Vos dernières transactions</CardDescription>
        </div>
        <Button variant="link" asChild>
            <Link href="/dashboard/transactions">Voir tout</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {initialExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium flex items-center gap-3">
                    <div className="bg-secondary p-2 rounded-full">
                        {expense.icon}
                    </div>
                    <div>
                        <p>{expense.description}</p>
                        <p className="text-xs text-muted-foreground">{expense.category}</p>
                    </div>
                </TableCell>
                <TableCell className="text-right text-red-400 font-semibold">
                    -{expense.amount.toLocaleString('fr-FR')} FCFA
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
