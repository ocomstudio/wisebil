// src/app/dashboard/add-income/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/context/transactions-context";
import { Loader2, ArrowLeft, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const incomeSchema = z.object({
  description: z.string().min(3, "La description doit contenir au moins 3 caractères."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
  category: z.string().min(1, "Veuillez sélectionner une catégorie."),
  date: z.date({
    required_error: "Veuillez sélectionner une date.",
  }),
  customCategory: z.string().optional(),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

const predefinedCategories = [
  "Salaire",
  "Vente",
  "Bonus",
  "Cadeau",
  "Remboursement",
  "Autre",
];

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
      category: "",
      date: new Date(),
      customCategory: "",
    },
  });

  const selectedCategory = form.watch("category");

  const onSubmit = async (data: IncomeFormValues) => {
    setIsSubmitting(true);
    try {
      const finalCategory = data.category === 'Autre' ? data.customCategory : data.category;
      
      const newTransaction = {
        id: new Date().toISOString(),
        type: 'income' as const,
        amount: data.amount,
        description: data.description,
        category: finalCategory || 'Autre',
        date: data.date.toISOString(),
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
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {predefinedCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedCategory === "Autre" && (
                <FormField
                  control={form.control}
                  name="customCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la nouvelle catégorie</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Vente en ligne" {...field} />
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
                    <FormLabel>Date du revenu</FormLabel>
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
                Ajouter le revenu
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
