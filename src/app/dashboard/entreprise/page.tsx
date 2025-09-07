// src/app/dashboard/entreprise/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, PlusCircle, Loader2, Mail, Check, X } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import { useEnterprise } from "@/context/enterprise-context";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const enterpriseSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères."),
  description: z.string().optional(),
  ownerRole: z.string().min(2, "Votre rôle est requis.").default("Administrateur"),
});

export default function EntrepriseHubPage() {
  const { t } = useLocale();
  const { enterprises, pendingInvitations, addEnterprise, respondToInvitation, isLoading } = useEnterprise();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof enterpriseSchema>>({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: { name: "", description: "", ownerRole: "Administrateur" },
  });

  const handleCreateEnterprise = async (values: z.infer<typeof enterpriseSchema>) => {
    const { name, description, ownerRole } = values;
    const newEnterpriseId = await addEnterprise({ name, description: description || "" }, ownerRole);
    form.reset();
    setIsCreateOpen(false);
    if (newEnterpriseId) {
        router.push(`/dashboard/entreprise/management/${newEnterpriseId}`);
    }
  };
  
  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Gestion d'Entreprise</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer une entreprise
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Créer une nouvelle entreprise</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations ci-dessous pour démarrer votre espace collaboratif.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateEnterprise)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom de l'entreprise</FormLabel>
                                <FormControl><Input placeholder="Ex: Ocomstudio" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (facultatif)</FormLabel>
                                <FormControl><Textarea placeholder="Décrivez brièvement votre entreprise..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="ownerRole" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Votre rôle</FormLabel>
                                <FormControl><Input placeholder="Ex: Fondateur, CEO..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Annuler</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Créer
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </div>

       {pendingInvitations.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="text-primary"/> Invitations en attente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {pendingInvitations.map(invite => (
                    <div key={invite.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                            <p className="font-semibold">{invite.name}</p>
                            <p className="text-sm text-muted-foreground">Vous êtes invité à rejoindre cette entreprise.</p>
                        </div>
                        <div className="flex gap-2">
                             <Button size="icon" variant="outline" className="text-green-500 hover:bg-green-500/10 hover:text-green-500" onClick={() => respondToInvitation(invite.id, 'accepted')}>
                                <Check className="h-4 w-4" />
                            </Button>
                             <Button size="icon" variant="outline" className="text-red-500 hover:bg-red-500/10 hover:text-red-500" onClick={() => respondToInvitation(invite.id, 'declined')}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
         </Card>
       )}

      <Card>
        <CardHeader>
          <CardTitle>Vos Entreprises</CardTitle>
          <CardDescription>
            Accédez aux espaces de travail de vos entreprises pour gérer leurs finances en équipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {enterprises.length === 0 ? (
             <div className="flex flex-col items-center justify-center text-center p-12 border-dashed border-2 rounded-lg">
                <Building className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Aucune entreprise pour le moment</h3>
                <p className="text-muted-foreground mt-2 mb-4">Créez votre première entreprise pour collaborer avec votre équipe.</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer la première entreprise
                </Button>
            </div>
           ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enterprises.map((enterprise) => (
                    <Link key={enterprise.id} href={`/dashboard/entreprise/management/${enterprise.id}`}>
                        <Card className="hover:shadow-primary/20 hover:border-primary/50 transition-all transform-gpu hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle>{enterprise.name}</CardTitle>
                                <CardDescription>{enterprise.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{enterprise.members.length} membre(s)</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
