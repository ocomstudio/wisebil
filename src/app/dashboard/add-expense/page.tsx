// src/app/dashboard/add-expense/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { categorizeExpense } from "@/ai/flows/categorize-expense";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
import { Bot, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/context/transactions-context";

const expenseSchema = z.object({
  description: z.string().min(3, "La description doit contenir au moins 3 caractères."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
  category: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function AddExpensePage() {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const onSubmit = async (data: ExpenseFormValues) => {
    setIsSubmitting(true);
    try {
      // Create a unique ID for the transaction
      const newTransaction = {
        id: new Date().toISOString(), // Simple unique ID
        type: 'expense' as const,
        amount: data.amount,
        description: data.description,
        category: data.category || 'Autre',
        date: new Date().toISOString(),
      };
      await addTransaction(newTransaction);
      toast({
        title: "Dépense ajoutée",
        description: `La dépense "${data.description}" a été ajoutée avec succès.`,
      });
      router.push("/dashboard");
    } catch (error) {
       console.error("Failed to add expense:", error);
       toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter la dépense. Veuillez réessayer.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Ajouter une dépense</h1>
      </div>
      <Card className="shadow-lg">
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter la dépense
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
