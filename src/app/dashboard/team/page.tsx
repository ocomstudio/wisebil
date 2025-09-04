// src/app/dashboard/team/page.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth-context';
import { useLocale } from '@/context/locale-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function TeamPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const teamFormSchema = z.object({
    companyName: z.string().min(2, "Le nom de l'entreprise est requis."),
    userRole: z.string().min(1, "Veuillez sélectionner votre rôle."),
    password: z.string().min(1, "Le mot de passe est requis pour vérification."),
  });

  type TeamFormValues = z.infer<typeof teamFormSchema>;

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      companyName: "",
      userRole: "",
      password: "",
    },
  });

  const onSubmit = (data: TeamFormValues) => {
    setIsLoading(true);
    console.log("Company Profile Data:", {
      ...data,
      userName: user?.displayName,
      userEmail: user?.email,
      userPhone: user?.phone,
    });
    
    // Simuler un appel API et la validation du mot de passe
    setTimeout(() => {
        // Dans une vraie application, vous vérifieriez le mot de passe ici
        toast({
            title: "Profil Entreprise créé (Simulation)",
            description: "Vous allez être redirigé vers l'interface de gestion.",
        });
        setIsLoading(false);
        // router.push('/dashboard/team/management'); // Redirection future
    }, 2000);
  };

  return (
    <div>
        <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/entreprise">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline">Gestion d'Équipe</h1>
        </div>
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <Building className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">Créer votre profil d'entreprise</CardTitle>
            <CardDescription>
                Renseignez ces informations pour commencer à gérer votre équipe et ses dépenses.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="companyName"
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
                        name="userRole"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Votre rôle</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez votre poste" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ceo">CEO / Fondateur</SelectItem>
                                        <SelectItem value="directeur">Directeur</SelectItem>
                                        <SelectItem value="manager">Manager / Chef d'équipe</SelectItem>
                                        <SelectItem value="autre">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className='bg-muted/50 p-4 rounded-lg space-y-4'>
                        <h3 className='text-sm font-semibold text-muted-foreground'>Informations de l'administrateur</h3>
                         <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                            <Input value={user?.displayName || ''} disabled />
                        </FormItem>
                         <FormItem>
                            <FormLabel>Adresse e-mail</FormLabel>
                            <Input value={user?.email || ''} disabled />
                        </FormItem>
                    </div>

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Votre mot de passe actuel</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="********" {...field} />
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-muted-foreground pt-1">
                                    Requis pour vérifier votre identité.
                                </p>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Créer et Gérer l'équipe
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
