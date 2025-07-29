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
import { useLocale } from "@/context/locale-context";

export default function CreateSavingsGoalPage() {
  const { t, currency } = useLocale();

  const savingsGoalSchema = z.object({
    name: z.string().min(3, t('goal_name_error')),
    targetAmount: z.coerce.number().positive(t('target_amount_error')),
    currentAmount: z.coerce.number().min(0, t('current_amount_error')).optional().default(0),
    emoji: z.string().optional(),
  });

  type SavingsGoalFormValues = z.infer<typeof savingsGoalSchema>;

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
        title: t('goal_created_title'),
        description: t('goal_created_desc', { goalName: data.name }),
      });
      router.push("/dashboard/savings");
    } catch (error) {
      console.error("Failed to create savings goal:", error);
      toast({
        variant: "destructive",
        title: t('error_title'),
        description: t('create_goal_error'),
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
        <h1 className="text-3xl font-bold font-headline">{t('create_goal_title')}</h1>
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
                    <FormLabel>{t('goal_name_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('goal_name_placeholder')} {...field} />
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
                    <FormLabel>{t('emoji_label')}</FormLabel>
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
                    <FormLabel>{t('target_amount_label', { currency })}</FormLabel>
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
                    <FormLabel>{t('current_amount_label', { currency })}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('create_goal_button_submit')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
