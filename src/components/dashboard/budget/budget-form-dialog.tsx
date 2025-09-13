// src/components/dashboard/budget/budget-form-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useBudgets } from "@/context/budget-context";
import { Loader2 } from "lucide-react";
import { expenseCategories } from "@/config/categories";
import { useLocale } from "@/context/locale-context";
import { Budget } from "@/types/budget";
import { useUserData } from "@/context/user-context";
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from "@/context/auth-context";

interface BudgetFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  existingBudget?: Budget;
}

const budgetFormSchema = z.object({
  name: z.string().min(3, "Le nom du budget doit contenir au moins 3 caractères."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
  category: z.string().min(1, "Veuillez sélectionner une catégorie."),
  newCategoryName: z.string().optional(),
  newCategoryEmoji: z.string().optional(),
});
type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export function BudgetFormDialog({ isOpen, onOpenChange, existingBudget }: BudgetFormDialogProps) {
  const { t, currency, getCategoryName } = useLocale();
  const { toast } = useToast();
  const { user } = useAuth();
  const { userData } = useUserData();
  const { addBudget, updateBudget } = useBudgets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);

  const allExpenseCategories = [...expenseCategories, ...(userData?.customCategories || [])];

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
  });
  
  const selectedCategoryValue = form.watch("category");

  useEffect(() => {
    form.reset({
      name: existingBudget?.name || "",
      amount: existingBudget?.amount || 0,
      category: existingBudget?.category || "",
      newCategoryName: "",
      newCategoryEmoji: "",
    });
    setShowNewCategory(false);
  }, [existingBudget, form, isOpen]);

  useEffect(() => {
    if (selectedCategoryValue === 'CREATE_NEW') {
      setShowNewCategory(true);
    } else {
      setShowNewCategory(false);
    }
  }, [selectedCategoryValue]);


  const onSubmit = async (data: BudgetFormValues) => {
    setIsSubmitting(true);
    let finalCategoryName = data.category;
    
    try {
        if (showNewCategory && data.newCategoryName && user) {
            const newCategory = { name: data.newCategoryName, emoji: data.newCategoryEmoji || '💡' };
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                customCategories: arrayUnion(newCategory)
            });
            finalCategoryName = newCategory.name;
        }

      const budgetData = {
        name: data.name,
        amount: data.amount,
        category: finalCategoryName,
      };

      if (existingBudget) {
        await updateBudget(existingBudget.id, budgetData);
        toast({
          title: "Budget modifié",
          description: `Le budget "${data.name}" a été mis à jour.`,
        });
      } else {
        const newBudget = {
          id: uuidv4(),
          ...budgetData,
        };
        await addBudget(newBudget);
        toast({
          title: t('budget_created_title'),
          description: t('budget_created_desc', { budgetName: data.name }),
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save budget:", error);
      toast({
        variant: "destructive",
        title: t('error_title'),
        description: existingBudget ? "Échec de la modification du budget." : t('create_budget_error'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingBudget ? "Modifier le budget" : t('create_budget_title')}</DialogTitle>
          <DialogDescription>
            {existingBudget ? "Modifiez les détails de votre budget ci-dessous." : "Définissez une limite pour une catégorie de dépenses."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('budget_name_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('budget_name_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('allocated_amount_label', { currency: currency })}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('category_label')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('budget_category_placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allExpenseCategories.filter(c => c.name !== 'Autre' && c.name !== 'Épargne').map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          <span className="mr-2">{cat.emoji}</span> {getCategoryName(cat.name)}
                        </SelectItem>
                      ))}
                       <SelectItem value="CREATE_NEW" className="font-bold text-primary">
                          <span className="mr-2">➕</span> Créer une catégorie
                       </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showNewCategory && (
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end p-4 border rounded-md bg-muted/50">
                <FormField
                  control={form.control}
                  name="newCategoryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la nouvelle catégorie</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Cotisation annuelle" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="newCategoryEmoji"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emoji</FormLabel>
                      <FormControl>
                        <Input placeholder="💡" maxLength={2} {...field} className="w-16 text-center" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {existingBudget ? "Sauvegarder" : t('create_budget_button_submit')}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
