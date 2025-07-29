// src/app/dashboard/savings/create/page.tsx
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
import { useToast } from "@/hooks/use-toast";
import { useSavings } from "@/context/savings-context";
import { Loader2, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const savingsGoalSchema = z.object({
  name: z.string().min(3, "Le nom de l'objectif doit contenir au moins 3 caractères."),
  targetAmount: z.coerce.number().positive("Le montant cible doit être un nombre positif."),
  currentAmount: z.coerce.number().min(0, "Le montant actuel ne peut être négatif.").optional().default(0),
  emoji: z.string().optional(),
});

type SavingsGoalFormValues = z.infer<typeof savingsGoalSchema>;

export default function CreateSavingsGoalPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addSavingsGoal } = useSavings();

  const form = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      emoji: "🎯",
    },
  });

  const onSubmit = async (data: SavingsGoalFormValues) => {
    setIsSubmitting(true);
    try {
      const newGoal = {
        id: uuidv4(),
        ...data,
      };
      await addSavingsGoal(newGoal);
      toast({
        title: "Objectif créé !",
        description: `Votre objectif "${data.name}" a été créé.`,
      });
      router.push("/dashboard/savings");
    } catch (error) {
      console.error("Failed to create savings goal:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer l'objectif. Veuillez réessayer.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/savings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Créer un objectif d'épargne</h1>
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
                    <FormLabel>Nom de l'objectif</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Voyage au Japon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: ✈️" {...field} maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant Cible (FCFA)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1500000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant Actuel (FCFA)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer l'Objectif
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
