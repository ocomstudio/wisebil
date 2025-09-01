// src/app/dashboard/invoicing/create/page.tsx
"use client";

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';
import { ArrowLeft, PlusCircle, Trash2, CalendarIcon, Loader2 } from 'lucide-react';
import { Invoice, InvoiceLineItem } from '@/types/invoice';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "La description est requise."),
  quantity: z.coerce.number().min(1, "La quantité doit être d'au moins 1."),
  unitPrice: z.coerce.number().min(0, "Le prix ne peut être négatif."),
});

const invoiceSchema = z.object({
  customerName: z.string().min(2, "Le nom du client est requis."),
  customerEmail: z.string().email("L'e-mail du client est invalide."),
  customerAddress: z.string().min(5, "L'adresse du client est requise."),
  issueDate: z.date(),
  dueDate: z.date(),
  lineItems: z.array(lineItemSchema).min(1, "Ajoutez au moins un article à la facture."),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function CreateInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, formatCurrency } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerAddress: "",
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      lineItems: [{ id: uuidv4(), description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });
  
  const lineItems = form.watch('lineItems');
  const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0; // Assuming 0% tax for now
  const total = subtotal + tax;

  const onSubmit = (data: InvoiceFormValues) => {
    setIsSubmitting(true);
    // Here you would typically send the data to your backend
    console.log({ ...data, subtotal, tax, total });
    
    toast({
      title: "Facture créée",
      description: "La nouvelle facture a été enregistrée en tant que brouillon.",
    });

    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/dashboard/invoicing');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/invoicing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Créer une nouvelle facture</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Informations du Client</CardTitle>
                    <CardDescription>Entrez les détails de votre client.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                        <FormItem><FormLabel>Nom du client</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="customerEmail" render={({ field }) => (
                         <FormItem><FormLabel>Email du client</FormLabel><FormControl><Input type="email" placeholder="client@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="customerAddress" render={({ field }) => (
                         <FormItem className="md:col-span-2"><FormLabel>Adresse du client</FormLabel><FormControl><Textarea placeholder="123 Rue Principale, Dakar, Sénégal" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Dates de la Facture</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                     <FormField
                      control={form.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date d'émission</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Choisissez une date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date d'échéance</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Choisissez une date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Articles de la Facture</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                           <div key={field.id} className="grid grid-cols-[1fr_80px_120px_auto] md:grid-cols-[1fr_100px_150px_auto] gap-2 items-start">
                              <FormField control={form.control} name={`lineItems.${index}.description`} render={({ field }) => (
                                <FormItem><FormControl><Textarea placeholder="Description..." {...field} rows={1} className="min-h-[40px]"/></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name={`lineItems.${index}.quantity`} render={({ field }) => (
                                <FormItem><FormControl><Input type="number" placeholder="Qté" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name={`lineItems.${index}.unitPrice`} render={({ field }) => (
                                <FormItem><FormControl><Input type="number" placeholder="Prix Unitaire" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-2">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                           </div>
                        ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" onClick={() => append({ id: uuidv4(), description: "", quantity: 1, unitPrice: 0 })} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un article
                    </Button>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <div className="w-full md:w-1/3 space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Sous-total :</span> <span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Taxe (0%) :</span> <span>{formatCurrency(tax)}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2"><span className="text-foreground">Total :</span> <span>{formatCurrency(total)}</span></div>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                 <Button type="button" variant="outline" onClick={() => router.push('/dashboard/invoicing')}>Annuler</Button>
                 <Button type="submit" disabled={isSubmitting}>
                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Enregistrer la facture
                 </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
