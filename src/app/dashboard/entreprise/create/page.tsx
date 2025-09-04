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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, ArrowLeft } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { useEnterprise } from "@/context/enterprise-context";

export default function CreateEnterprisePage() {
  const { t } = useLocale();
  
  const enterpriseSchema = z.object({
    name: z.string().min(3, "Le nom de l'entreprise est requis."),
    description: z.string().optional(),
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
    },
  });

  const onSubmit = async (data: EnterpriseFormValues) => {
    setIsSubmitting(true);
    try {
      await addEnterprise({
        id: uuidv4(),
        name: data.name,
        description: data.description || "",
        ownerId: "" // This would be set by the auth context in a real app
      });
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
      <Card className="shadow-xl max-w-lg mx-auto">
        <CardHeader>
            <CardTitle>Détails de l'entreprise</CardTitle>
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
                      <Input placeholder="Agence de communication et d'innovation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer l'entreprise
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
