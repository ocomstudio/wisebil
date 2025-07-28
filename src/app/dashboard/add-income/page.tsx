// src/app/dashboard/add-income/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

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
import { v4 as uuidv4 } from "uuid";

const incomeSchema = z.object({
  description: z.string().min(3, "La description doit contenir au moins 3 caractères."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

export default function AddIncomePage() {
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

  const onSubmit = (data: IncomeFormValues) => {
    const newIncome = {
        id: uuidv4(),
        type: 'income' as const,
        amount: data.amount,
        description: data.description,
        category: 'Revenu',
        date: new Date().toISOString(),
    };
    addTransaction(newIncome);
    toast({
      title: "Revenu ajouté",
      description: `Le revenu "${data.description}" a été ajouté avec succès.`,
    });
    router.push("/dashboard");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Ajouter un revenu</h1>
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
              <Button type="submit" className="w-full">Ajouter le revenu</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
