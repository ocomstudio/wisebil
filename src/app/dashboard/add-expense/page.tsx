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

const expenseSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  category: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function AddExpensePage() {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
      form.setError("description", { message: "Please enter a description first." });
      return;
    }
    setIsCategorizing(true);
    try {
      const result = await categorizeExpense({ description });
      form.setValue("category", result.category, { shouldValidate: true });
    } catch (error) {
      console.error("AI categorization failed:", error);
      toast({
        variant: "destructive",
        title: "AI Categorization Failed",
        description: "Could not categorize the expense. Please enter a category manually.",
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  const onSubmit = (data: ExpenseFormValues) => {
    // Here you would typically save the expense to your database
    console.log("New expense added:", data);
    toast({
      title: "Expense Added",
      description: `Successfully added "${data.description}".`,
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
                      <Input placeholder="e.g., Café avec un ami" {...field} />
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
                        <Input placeholder="e.g., Restaurant" {...field} />
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
