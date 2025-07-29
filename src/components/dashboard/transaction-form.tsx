// src/components/dashboard/transaction-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { categorizeExpense } from "@/ai/flows/categorize-expense";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Bot, Loader2, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { expenseCategories, incomeCategories, allCategories } from "@/config/categories";
import type { Transaction } from "@/types/transaction";

const formSchema = z.object({
  description: z.string().min(3, "La description doit contenir au moins 3 caractères."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
  category: z.string().min(1, "Veuillez sélectionner ou saisir une catégorie."),
  date: z.date({
    required_error: "Veuillez sélectionner une date.",
  }),
  customCategory: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  transactionType: 'income' | 'expense';
  onSubmit: (data: Omit<Transaction, 'id' | 'type'>) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Transaction | null;
  submitButtonText?: string;
}

export function TransactionForm({
  transactionType,
  onSubmit,
  isSubmitting,
  initialData,
  submitButtonText = "Soumettre",
}: TransactionFormProps) {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();

  const categories = transactionType === 'expense' ? expenseCategories : incomeCategories;
  
  const isCustomCategory = initialData?.category && !categories.some(c => c.name === initialData.category);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || "",
      amount: initialData?.amount || 0,
      category: isCustomCategory ? "Autre" : initialData?.category || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      customCategory: isCustomCategory ? initialData?.category : "",
    },
  });

  const selectedCategoryValue = form.watch("category");
  const selectedCategory = categories.find(c => c.name === selectedCategoryValue);

  const handleCategorize = async () => {
    const description = form.getValues("description");
    if (!description) {
      form.setError("description", { message: "Veuillez d'abord entrer une description." });
      return;
    }
    setIsCategorizing(true);
    try {
      const result = await categorizeExpense({ description });
      const existingCategory = expenseCategories.find(c => c.name.toLowerCase() === result.category.toLowerCase());
      if (existingCategory) {
        form.setValue("category", existingCategory.name, { shouldValidate: true });
      } else {
        form.setValue("category", "Autre", { shouldValidate: true });
        form.setValue("customCategory", result.category, { shouldValidate: true });
      }
    } catch (error) {
      console.error("La catégorisation par l'IA a échoué:", error);
      toast({
        variant: "destructive",
        title: "La catégorisation par l'IA a échoué",
        description: "Impossible de suggérer une catégorie.",
      });
    } finally {
      setIsCategorizing(false);
    }
  };
  
  const handleFormSubmit = (data: FormValues) => {
    const finalCategory = data.category === 'Autre' ? data.customCategory : data.category;
    onSubmit({
        ...data,
        category: finalCategory || "Autre",
        date: data.date.toISOString(),
    })
  }

  return (
    <Card className="shadow-xl">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Café avec un ami" {...field} />
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
                  <FormLabel>Montant (FCFA)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
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
                  <FormLabel>Catégorie</FormLabel>
                  <div className="flex items-start gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                           {selectedCategory ? (
                              <span className="flex items-center gap-2">
                                {selectedCategory.emoji} {selectedCategory.name}
                              </span>
                            ) : (
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.name} value={cat.name}>
                            <span className="mr-2">{cat.emoji}</span> {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {transactionType === 'expense' && (
                        <Button type="button" size="icon" variant="outline" onClick={handleCategorize} disabled={isCategorizing}>
                            {isCategorizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                        </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />


            {selectedCategoryValue === "Autre" && (
              <FormField
                control={form.control}
                name="customCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la nouvelle catégorie</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Cadeau d'anniversaire" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de la transaction</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Choisissez une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitButtonText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
