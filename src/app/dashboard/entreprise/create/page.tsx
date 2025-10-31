// src/app/dashboard/entreprise/create/page.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLocale } from '@/context/locale-context';
import { useEnterprise } from '@/context/enterprise-context';

export default function CreateEnterprisePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addEnterprise } = useEnterprise();
  const { t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2, "Le nom de l'entreprise est requis."),
    description: z.string().min(10, "Veuillez fournir une brève description."),
    ownerRole: z.string().min(2, "Votre rôle dans l'entreprise est requis."),
  });
  
  type EnterpriseFormValues = z.infer<typeof formSchema>;

  const form = useForm<EnterpriseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", ownerRole: "Gérant" },
  });

  const onSubmit = async (data: EnterpriseFormValues) => {
    setIsSubmitting(true);
    try {
      const { ownerRole, ...enterpriseData } = data;
      const newEnterpriseId = await addEnterprise(enterpriseData, ownerRole);
      if (newEnterpriseId) {
        router.push(`/dashboard/entreprise/management/${newEnterpriseId}`);
      } else {
        // Error toast is handled inside addEnterprise
        setIsSubmitting(false);
      }
    } catch (error) {
      // Error is already handled in context
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/entreprise">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Créer une Entreprise</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'Entreprise</CardTitle>
          <CardDescription>Remplissez les détails pour créer votre espace entreprise.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'entreprise</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ocomstudio" {...field} />
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
                      <Textarea placeholder="Ex: Agence de communication et d'innovation technologique" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre rôle</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fondateur, Gérant..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer et Accéder
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
