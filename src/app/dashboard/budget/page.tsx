// src/app/dashboard/budget/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";

export default function BudgetPage() {
  const budgets: any[] = [];

  return (
    <div className="space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Budgets</h1>
        <Button>
          Créer un budget
        </Button>
      </div>

      {budgets.length === 0 ? (
         <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed bg-card">
            <CardHeader>
                <div className="mx-auto bg-secondary p-4 rounded-full mb-4">
                    <FilePlus className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle>Aucun budget créé</CardTitle>
                <CardDescription>
                    Commencez à planifier vos dépenses en créant votre premier budget.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button>Créer un budget</Button>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Budget items would be mapped here */}
        </div>
      )}
    </div>
  );
}
