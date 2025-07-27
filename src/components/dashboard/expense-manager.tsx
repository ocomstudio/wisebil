"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { categorizeExpense } from "@/ai/flows/categorize-expense";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const expenseSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  category: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface Expense extends ExpenseFormValues {
  id: string;
  date: Date;
}

// Mock data
const initialExpenses: Expense[] = [
  { id: '1', description: 'Groceries from Walmart', amount: 75.4, category: 'Groceries', date: new Date() },
  { id: '2', description: 'Monthly Netflix Subscription', amount: 15.99, category: 'Entertainment', date: new Date() },
];


export default function ExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();

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
    const newExpense: Expense = {
      id: uuidv4(),
      ...data,
      category: data.category || 'Other',
      date: new Date(),
    };
    setExpenses([newExpense, ...expenses]);
    form.reset();
  };
  
  // A temporary solution for uuidv4 in client components without adding the package
  if (typeof window !== 'undefined' && !window.crypto.randomUUID) {
    // Basic fallback if crypto is not available
    window.crypto.randomUUID = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
  }
  const uuidv4 = () => typeof window !== 'undefined' ? window.crypto.randomUUID() : Math.random().toString();


  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Coffee with a friend" {...field} />
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
                    <FormLabel>Amount ($)</FormLabel>
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
                    <FormLabel>Category</FormLabel>
                    <div className="flex gap-2">
                       <FormControl>
                        <Input placeholder="e.g., Dining" {...field} />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={handleCategorize} disabled={isCategorizing}>
                        {isCategorizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                        <span className="sr-only">Categorize with AI</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Add Expense</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
