// src/app/auth/signup/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { FcGoogle } from 'react-icons/fc';


const signupSchema = z.object({
  fullName: z.string().min(2, "Le nom doit comporter au moins 2 caractères."),
  phone: z.string().min(9, "Le numéro de téléphone doit comporter au moins 9 chiffres."),
  email: z.string().email("Adresse e-mail invalide.").optional().or(z.literal('')),
  password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères."),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les termes et conditions.",
  })
}).refine(data => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    console.log("Signup data:", data);
    toast({
      title: "Inscription réussie",
      description: "Bienvenue ! Veuillez compléter votre profil.",
    });
    router.push("/auth/onboarding");
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Créer un compte</h1>
        <p className="text-muted-foreground">Commencez votre voyage vers la liberté financière.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de téléphone <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+221 77 123 45 67" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse e-mail (Facultatif)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="votre@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                     J'accepte les <Link href="/terms" className="text-primary hover:underline">Termes</Link> et la <Link href="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>.
                  </FormLabel>
                   <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Créer mon compte
          </Button>
        </form>
      </Form>
      <Separator className="my-6" />
      <Button variant="outline" className="w-full">
        <FcGoogle className="mr-2 h-5 w-5" />
        S'inscrire avec Google
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}
