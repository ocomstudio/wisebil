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
import { useLocale } from "@/context/locale-context";


export default function ContactPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const contactSchema = z.object({
    name: z.string().min(2, { message: t('contact_name_error') }),
    email: z.string().email({ message: t('signup_email_error') }),
    subject: z.string().min(3, { message: t('contact_subject_error') }),
    message: z.string().min(10, { message: t('contact_message_error') }),
  });

  type ContactFormValues = z.infer<typeof contactSchema>;


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
            title: t('contact_success_title'),
            description: t('contact_success_desc'),
        });
        form.reset();
        setIsLoading(false);
    }, 1500)

  };
  
    const faqs = [
        {
            question: t('faq1_q'),
            answer: t('faq1_a')
        },
        {
            question: t('faq2_q'),
            answer: t('faq2_a')
        },
        {
            question: t('faq3_q'),
            answer: t('faq3_a')
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
                {t('back_to_home')}
            </Link>
          </Button>
        </div>
      </header>

       <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">
         <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-headline mb-2 text-primary">{t('contact_title')}</h1>
            <p className="text-lg text-muted-foreground">{t('contact_subtitle')}</p>
         </div>

         <div className="grid md:grid-cols-2 gap-12 mt-12">
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><HelpCircle className="text-primary"/> {t('faq_title')}</h2>
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
                    <h2 className="text-2xl font-bold font-headline mb-4">{t('contact_details_title')}</h2>
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
                        <CardTitle className="font-headline text-2xl">{t('contact_form_title')}</CardTitle>
                        <CardDescription>{t('contact_form_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('contact_name_label')}</FormLabel>
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
                                            <FormLabel>{t('contact_email_label')}</FormLabel>
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
                                            <FormLabel>{t('contact_subject_label')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('contact_subject_placeholder')} {...field} />
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
                                            <FormLabel>{t('contact_message_label')}</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder={t('contact_message_placeholder')} {...field} rows={5} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('contact_send_button')}
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
