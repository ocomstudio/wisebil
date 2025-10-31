// src/components/dashboard/entreprise/create-enterprise-form.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building, Loader2 } from "lucide-react";
import { useEnterprise } from '@/context/enterprise-context';
import { useLocale } from '@/context/locale-context';

const formSchema = z.object({
  name: z.string().min(2, "Le nom de l'entreprise est requis."),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateEnterpriseForm() {
  const { createEnterprise, isLoading } = useEnterprise();
  const { t } = useLocale();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await createEnterprise(data.name, data.description);
  };

  return (
    <div className="flex items-center justify-center h-full pt-10 md:pt-0">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-secondary p-4 rounded-full mb-4 w-fit">
            <Building className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="font-headline">Créer votre Espace Entreprise</CardTitle>
          <CardDescription>
            Commencez à gérer votre activité professionnelle en créant votre espace dédié.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'entreprise</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ma Boutique de Quartier" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description de l'activité</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Vente de produits alimentaires locaux..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer l'entreprise
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
