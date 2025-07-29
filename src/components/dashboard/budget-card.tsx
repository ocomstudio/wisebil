// src/components/dashboard/budget-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { expenseCategories } from "@/config/categories";
import { Budget } from "@/types/budget";
import { cn } from "@/lib/utils";

interface BudgetCardProps {
  budget: Budget;
  spent: number;
}

export function BudgetCard({ budget, spent }: BudgetCardProps) {
  const { name, amount, category } = budget;
  const remaining = amount - spent;
  const progress = (spent / amount) * 100;

  const getCategoryEmoji = (categoryName: string) => {
    const cat = expenseCategories.find(c => c.name === categoryName);
    return cat ? cat.emoji : '💰';
  };

  const getProgressColor = () => {
    if (progress > 100) return "bg-red-500";
    if (progress > 75) return "bg-orange-500";
    return "bg-primary";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryEmoji(category)}</span>
            <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          </div>
          {/* Add options dropdown here if needed */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">
              {spent.toLocaleString('fr-FR')} FCFA
            </span>
            <span className="text-muted-foreground">
              / {amount.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
          <Progress value={progress} className="h-2 [&>div]:bg-primary" indicatorClassName={getProgressColor()} />
          <p className={cn(
            "text-sm text-right font-medium",
            remaining < 0 ? "text-destructive" : "text-muted-foreground"
          )}>
            {remaining >= 0 
              ? `${remaining.toLocaleString('fr-FR')} FCFA restants`
              : `${Math.abs(remaining).toLocaleString('fr-FR')} FCFA de dépassement`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
