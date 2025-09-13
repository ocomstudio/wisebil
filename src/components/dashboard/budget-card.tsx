// src/components/dashboard/budget-card.tsx
import { useState } from "react";
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
import { MoreVertical, Trash2, Pencil } from "lucide-react";
import { useSettings } from "@/context/settings-context";
import { useLocale } from "@/context/locale-context";
import { BudgetFormDialog } from "./budget/budget-form-dialog";
import { useUserData } from "@/context/user-context";

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, spent, onDelete }: BudgetCardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { id, name, amount, category } = budget;
  const { settings, isTemporarilyVisible } = useSettings();
  const { t, formatCurrency } = useLocale();
  const { userData } = useUserData();
  const isVisible = !settings.isBalanceHidden || isTemporarilyVisible;

  const allExpenseCategories = [...expenseCategories, ...(userData?.customCategories || [])];

  const remaining = amount - spent;
  const progress = amount > 0 ? (spent / amount) * 100 : 0;

  const getCategoryEmoji = (categoryName: string) => {
    const cat = allExpenseCategories.find(c => c.name === categoryName);
    return cat ? cat.emoji : '💰';
  };

  const getProgressColor = () => {
    if (progress > 100) return "bg-red-500";
    if (progress > 75) return "bg-orange-500";
    return "bg-primary";
  };
  
  const getRemainingText = () => {
    if (remaining >= 0) {
      return `${formatCurrency(remaining)} ${t('remaining')}`;
    }
    return `${formatCurrency(Math.abs(remaining))} ${t('overspent')}`;
  }

  return (
    <>
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
                <DropdownMenuItem onSelect={() => setIsFormOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('edit')}
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
                  {t('budget_delete_confirmation', { budgetName: name })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(id)} className="bg-destructive hover:bg-destructive/90">
                  {t('delete')}
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
              {isVisible ? formatCurrency(spent) : '******'}
            </span>
            <span className="text-muted-foreground">
              / {isVisible ? formatCurrency(amount) : '******'}
            </span>
          </div>
          <Progress value={progress} className="h-2 [&>div]:bg-primary" indicatorClassName={getProgressColor()} />
          <p className={cn(
            "text-sm text-right font-medium",
            remaining < 0 ? "text-destructive" : "text-muted-foreground"
          )}>
            {isVisible ? getRemainingText() : '******'}
          </p>
        </div>
      </CardContent>
    </Card>
     <BudgetFormDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        existingBudget={budget} 
      />
    </>
  );
}
