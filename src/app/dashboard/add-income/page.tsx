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

const incomeSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

export default function AddIncomePage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      description: "",
      amount: 0,
    },
  });

  const onSubmit = (data: IncomeFormValues) => {
    // Here you would typically save the income to your database
    console.log("New income added:", data);
    toast({
      title: "Income Added",
      description: `Successfully added "${data.description}".`,
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
                      <Input placeholder="e.g., Salaire mensuel" {...field} />
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
