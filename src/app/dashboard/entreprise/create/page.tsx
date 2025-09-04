// src/app/dashboard/entreprise/create/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Loader2, ArrowLeft, Building, User, Mail, Phone, Lock } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { useEnterprise } from "@/context/enterprise-context";
import { useAuth } from "@/context/auth-context";
import { Textarea } from "@/components/ui/textarea";

export default function CreateEnterprisePage() {
  const { t } = useLocale();
  const { user } = useAuth();
  
  const enterpriseSchema = z.object({
    name: z.string().min(2, "Le nom de l'entreprise est requis (2 caractères min)."),
    description: z.string().optional(),
    ownerRole: z.string().min(2, "Votre rôle est requis (2 caractères min)."),
  });

  type EnterpriseFormValues = z.infer<typeof enterpriseSchema>;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addEnterprise } = useEnterprise();

  const form = useForm<EnterpriseFormValues>({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: {
      name: "",
      description: "",
      ownerRole: "",
    },
  });

  const onSubmit = async (data: EnterpriseFormValues) => {
    setIsSubmitting(true);
    try {
      await addEnterprise({
        id: uuidv4(),
        name: data.name,
        description: data.description || "",
      }, data.ownerRole);

      toast({
        title: "Entreprise créée",
        description: `L'entreprise "${data.name}" a été créée avec succès.`,
      });
      router.push("/dashboard/entreprise");
    } catch (error) {
      console.error("Failed to create enterprise:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer l'entreprise.",
      });
    } finally {
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
        <h1 className="text-3xl font-bold font-headline">Créer une nouvelle entreprise</h1>
      </div>
      <Card className="shadow-xl max-w-2xl mx-auto border-primary/20">
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                    <Building className="h-8 w-8 text-primary"/>
                </div>
                <div>
                    <CardTitle>Détails de l'entreprise</CardTitle>
                    <CardDescription>Renseignez les informations de base pour commencer.</CardDescription>
                </div>
            </div>
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
                      <Input placeholder="Ex: Ocomstudio SARL" {...field} />
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
                    <FormLabel>Description (Facultatif)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Agence de communication et d'innovation technologique..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-6 space-y-4">
                 <h3 className="text-lg font-semibold text-muted-foreground">Vos informations de propriétaire</h3>
                 <FormField
                    control={form.control}
                    name="ownerRole"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Votre Rôle / Poste</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Ex: Directeur Général" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <div className="grid sm:grid-cols-2 gap-4">
                    <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                         <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input value={user?.displayName || ''} disabled className="pl-10"/>
                        </div>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Adresse E-mail</FormLabel>
                         <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input value={user?.email || ''} disabled className="pl-10"/>
                        </div>
                    </FormItem>
                     <FormItem>
                        <FormLabel>Numéro de téléphone</FormLabel>
                         <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input value={user?.phone || ''} disabled className="pl-10"/>
                        </div>
                    </FormItem>
                     <FormItem>
                        <FormLabel>Mot de passe du compte</FormLabel>
                         <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input value="********" type="password" disabled className="pl-10"/>
                        </div>
                    </FormItem>
                 </div>
              </div>


              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer l'entreprise
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
