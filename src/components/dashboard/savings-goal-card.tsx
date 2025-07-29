// src/components/dashboard/savings-goal-card.tsx
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { SavingsGoal } from "@/types/savings-goal";
import { MoreVertical, PiggyBank, Trash2 } from "lucide-react";
import { useSettings } from "@/context/settings-context";
import { useLocale } from "@/context/locale-context";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onAddFunds: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

export function SavingsGoalCard({ goal, onAddFunds, onDelete }: SavingsGoalCardProps) {
  const [amountToAdd, setAmountToAdd] = useState(0);
  const { settings, isTemporarilyVisible } = useSettings();
  const { t, formatCurrency } = useLocale();
  const isVisible = !settings.isBalanceHidden || isTemporarilyVisible;

  const { id, name, emoji, currentAmount, targetAmount } = goal;
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  const handleAddFunds = () => {
    if (amountToAdd > 0) {
      onAddFunds(id, amountToAdd);
      setAmountToAdd(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{emoji || "🎯"}</span>
            <div>
              <CardTitle className="text-lg font-bold">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('goal')}: {isVisible ? formatCurrency(targetAmount) : '******'}
              </p>
            </div>
          </div>
           <AlertDialog>
            <Dialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DialogTrigger asChild>
                        <DropdownMenuItem>
                            <PiggyBank className="mr-2 h-4 w-4" />
                            {t('add_funds')}
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('delete')}
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>{t('add_funds_to', { goalName: name })}</DialogTitle>
                    <DialogDescription>
                        {t('add_funds_desc')}
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                        {t('amount')}
                        </Label>
                        <Input
                        id="amount"
                        type="number"
                        value={amountToAdd || ''}
                        onChange={(e) => setAmountToAdd(Number(e.target.value))}
                        className="col-span-3"
                        />
                    </div>
                    </div>
                    <DialogFooter>
                     <DialogClose asChild>
                        <Button type="button" onClick={handleAddFunds}>{t('add')}</Button>
                      </DialogClose>
                    </DialogFooter>
                </DialogContent>
                
                <AlertDialogContent>
                    <AlertDialogHeader>
                       <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('goal_delete_confirmation', { goalName: name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(id)} className="bg-destructive hover:bg-destructive/90">
                            {t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </Dialog>
           </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-xl font-bold">
            {isVisible ? formatCurrency(currentAmount) : '******'}
          </p>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-right">
            {t('percent_achieved', { progress: Math.round(progress) })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
