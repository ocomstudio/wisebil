// src/components/dashboard/budget-card.tsx
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress";
import { expenseCategories } from "@/config/categories";
import { Budget } from "@/types/budget";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MoreVertical, Trash2 } from "lucide-react";
import { useSettings } from "@/context/settings-context";

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, spent, onDelete }: BudgetCardProps) {
  const { id, name, amount, category } = budget;
  const { settings } = useSettings();
  const isVisible = !settings.isBalanceHidden;

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
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le budget "{name}" sera supprimé définitivement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(id)} className="bg-destructive hover:bg-destructive/90">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">
              {isVisible ? `${spent.toLocaleString('fr-FR')} FCFA` : '******'}
            </span>
            <span className="text-muted-foreground">
              / {isVisible ? `${amount.toLocaleString('fr-FR')} FCFA` : '******'}
            </span>
          </div>
          <Progress value={progress} className="h-2 [&>div]:bg-primary" indicatorClassName={getProgressColor()} />
          <p className={cn(
            "text-sm text-right font-medium",
            remaining < 0 ? "text-destructive" : "text-muted-foreground"
          )}>
            {isVisible ? (
              remaining >= 0 
                ? `${remaining.toLocaleString('fr-FR')} FCFA restants`
                : `${Math.abs(remaining).toLocaleString('fr-FR')} FCFA de dépassement`
            ) : '******'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
