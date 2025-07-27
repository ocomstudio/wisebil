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
import { PlusCircle, Receipt } from "lucide-react";

// Mock data is cleared
const initialExpenses: any[] = [];

export function RecentExpenses() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-lg">Dépenses récentes</CardTitle>
            <CardDescription>Vos dernières transactions</CardDescription>
        </div>
        {initialExpenses.length > 0 && (
            <Button variant="link" asChild>
                <Link href="/dashboard/transactions">Voir tout</Link>
            </Button>
        )}
      </CardHeader>
      <CardContent>
        {initialExpenses.length === 0 ? (
           <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="bg-secondary p-3 rounded-full mb-4">
                    <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Aucune dépense</h3>
                <p className="text-muted-foreground text-sm mb-4">
                    Commencez à suivre vos dépenses pour les voir ici.
                </p>
                <Button asChild>
                    <Link href="/dashboard/add-expense">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Ajouter une dépense
                    </Link>
                </Button>
           </div>
        ) : (
            <div>
                {/* Table would go here */}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
