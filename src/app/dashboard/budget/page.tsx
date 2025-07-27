// src/app/dashboard/budget/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const budgets = [
  {
    name: "Shopping",
    spent: 15000,
    total: 50000,
    color: "bg-blue-500",
  },
  {
    name: "Restaurant",
    spent: 25000,
    total: 40000,
    color: "bg-green-500",
  },
  {
    name: "Transport",
    spent: 10000,
    total: 20000,
    color: "bg-orange-500",
  },
];

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Budgets</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Créer un budget
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <Card key={budget.name}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle>{budget.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Dépensé: {budget.spent.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={(budget.spent / budget.total) * 100} />
                <p className="text-sm text-right text-muted-foreground">
                  {budget.total.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
