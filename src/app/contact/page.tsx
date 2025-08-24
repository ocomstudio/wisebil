
// src/app/contact/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Mail, Phone, HelpCircle, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/logo";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const contactSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
  subject: z.string().min(3, { message: "L'objet doit contenir au moins 3 caractères." }),
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères." }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    setIsLoading(true);
    console.log(data);
    
    // Simuler un appel API
    setTimeout(() => {
        toast({
            title: "Message envoyé !",
            description: "Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.",
        });
        form.reset();
        setIsLoading(false);
    }, 1500)

  };
  
    const faqs = [
        {
            question: "Comment fonctionne Wisebil ?",
            answer: "Wisebil est une application de gestion financière qui utilise l'IA pour vous aider à suivre vos dépenses, créer des budgets et recevoir des conseils personnalisés pour atteindre vos objectifs financiers."
        },
        {
            question: "Mes données financières sont-elles en sécurité ?",
            answer: "Oui, la sécurité est notre priorité absolue. Nous utilisons un chiffrement de niveau bancaire pour toutes vos données et nous ne les partageons jamais avec des tiers à des fins de marketing."
        },
        {
            question: "Puis-je utiliser l'application hors ligne ?",
            answer: "Oui, les fonctionnalités de base comme l'ajout de transactions fonctionnent hors ligne. Une connexion internet est nécessaire pour synchroniser vos données et utiliser les fonctionnalités de l'IA."
        },
    ]

  return (
    <div className="bg-background text-foreground min-h-screen">
       <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-10">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Logo isLink={true} />
           <Button asChild variant="outline">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
            </Link>
          </Button>
        </div>
      </header>

       <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">
         <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-headline mb-2 text-primary">Centre d'Aide & Contact</h1>
            <p className="text-lg text-muted-foreground">Nous sommes là pour vous aider. Trouvez des réponses ou contactez-nous directement.</p>
         </div>

         <div className="grid md:grid-cols-2 gap-12 mt-12">
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><HelpCircle className="text-primary"/> Questions Fréquentes</h2>
                     <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left text-lg">{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-muted-foreground text-base">{faq.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold font-headline mb-4">Nos Coordonnées</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Mail className="h-6 w-6 text-primary" />
                            <a href="mailto:contact@wisebil.com" className="text-lg hover:underline">contact@wisebil.com</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Phone className="h-6 w-6 text-primary" />
                            <a href="tel:+237678127004" className="text-lg hover:underline">+237 678 127 004</a>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Envoyez-nous un message</CardTitle>
                        <CardDescription>Remplissez le formulaire ci-dessous et notre équipe vous contactera.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Votre nom</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
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
                                            <FormLabel>Votre e-mail</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="votre@email.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Objet</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Question sur la facturation" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Votre message</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Bonjour, j'aimerais avoir des informations sur..." {...field} rows={5} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Envoyer le message
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
         </div>
       </main>
    </div>
  );
}
