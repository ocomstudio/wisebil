// src/app/dashboard/add-expense/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { categorizeExpense } from "@/ai/flows/categorize-expense";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Bot, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/context/transactions-context";
import { v4 as uuidv4 } from "uuid";

const expenseSchema = z.object({
  description: z.string().min(3, "La description doit contenir au moins 3 caractères."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
  category: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function AddExpensePage() {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "",
    },
  });

  const handleCategorize = async () => {
    const description = form.getValues("description");
    if (!description) {
      form.setError("description", { message: "Veuillez d'abord entrer une description." });
      return;
    }
    setIsCategorizing(true);
    try {
      const result = await categorizeExpense({ description });
      form.setValue("category", result.category, { shouldValidate: true });
    } catch (error) {
      console.error("La catégorisation par l'IA a échoué:", error);
      toast({
        variant: "destructive",
        title: "La catégorisation par l'IA a échoué",
        description: "Impossible de catégoriser la dépense. Veuillez entrer une catégorie manuellement.",
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  const onSubmit = (data: ExpenseFormValues) => {
    const newExpense = {
        id: uuidv4(),
        type: 'expense' as const,
        amount: data.amount,
        description: data.description,
        category: data.category,
        date: new Date().toISOString(),
    };
    addTransaction(newExpense);
    toast({
      title: "Dépense ajoutée",
      description: `La dépense "${data.description}" a été ajoutée avec succès.`,
    });
    router.push("/dashboard");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Ajouter une dépense</h1>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <div className="flex gap-2">
                       <FormControl>
                        <Input placeholder="ex: Restaurant" {...field} />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={handleCategorize} disabled={isCategorizing}>
                        {isCategorizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                        <span className="sr-only">Catégoriser avec l'IA</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Ajouter la dépense</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
