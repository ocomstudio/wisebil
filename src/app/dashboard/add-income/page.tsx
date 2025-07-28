// src/app/dashboard/add-income/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/context/transactions-context";
import { Loader2, ArrowLeft } from "lucide-react";

const incomeSchema = z.object({
  description: z.string().min(3, "La description doit contenir au moins 3 caractères."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

export default function AddIncomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      description: "",
      amount: 0,
    },
  });

  const onSubmit = async (data: IncomeFormValues) => {
    setIsSubmitting(true);
    try {
      const newTransaction = {
        id: new Date().toISOString(), // Simple unique ID
        type: 'income' as const,
        amount: data.amount,
        description: data.description,
        category: 'Revenu',
        date: new Date().toISOString(),
      };
      await addTransaction(newTransaction);
      toast({
        title: "Revenu ajouté",
        description: `Le revenu "${data.description}" a été ajouté avec succès.`,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to add income:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le revenu. Veuillez réessayer.",
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
         <h1 className="text-3xl font-bold font-headline">Ajouter un revenu</h1>
      </div>
      <Card className="shadow-xl">
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
                      <Input placeholder="ex: Salaire mensuel" {...field} />
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter le revenu
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
