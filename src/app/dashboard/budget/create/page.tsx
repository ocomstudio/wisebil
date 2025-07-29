// src/app/dashboard/budget/create/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

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
import { useToast } from "@/hooks/use-toast";
import { useBudgets } from "@/context/budget-context";
import { Loader2, ArrowLeft } from "lucide-react";
import { expenseCategories } from "@/config/categories";

const budgetSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
  category: z.string().min(1, "Veuillez sélectionner une catégorie."),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export default function CreateBudgetPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addBudget } = useBudgets();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: "",
      amount: 0,
      category: "",
    },
  });

  const selectedCategoryValue = form.watch("category");
  const selectedCategory = expenseCategories.find(c => c.name === selectedCategoryValue);

  const onSubmit = async (data: BudgetFormValues) => {
    setIsSubmitting(true);
    try {
      const newBudget = {
        id: uuidv4(),
        ...data,
      };
      await addBudget(newBudget);
      toast({
        title: "Budget créé",
        description: `Le budget "${data.name}" a été créé avec succès.`,
      });
      router.push("/dashboard/budget");
    } catch (error) {
      console.error("Failed to create budget:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le budget. Veuillez réessayer.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/budget">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Créer un nouveau budget</h1>
      </div>
      <Card className="shadow-xl">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du budget</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Budget Alimentation Mensuel" {...field} />
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
                    <FormLabel>Montant Alloué (FCFA)</FormLabel>
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
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          {selectedCategory ? (
                            <span className="flex items-center gap-2">
                              {selectedCategory.emoji} {selectedCategory.name}
                            </span>
                          ) : (
                            <SelectValue placeholder="Sélectionnez une catégorie à budgétiser" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseCategories.filter(c => c.name !== 'Autre').map((cat) => (
                          <SelectItem key={cat.name} value={cat.name}>
                            <span className="mr-2">{cat.emoji}</span> {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer le Budget
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
