// src/app/dashboard/accounting/invoicing/create/page.tsx
"use client";

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';
import { ArrowLeft, PlusCircle, Trash2, CalendarIcon, Loader2, Upload } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useInvoicing } from '@/context/invoicing-context';

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "La description est requise."),
  quantity: z.coerce.number().min(1, "La quantité doit être d'au moins 1."),
  unitPrice: z.coerce.number().min(0, "Le prix ne peut être négatif."),
});

const invoiceSchema = z.object({
  companyAddress: z.string().min(5, "L'adresse de votre entreprise est requise."),
  companyLogoUrl: z.string().optional(),
  signatureUrl: z.string().optional(),
  stampUrl: z.string().optional(),
  customerName: z.string().min(2, "Le nom du client est requis."),
  customerEmail: z.string().email("L'e-mail du client est invalide.").optional().or(z.literal('')),
  customerAddress: z.string().min(5, "L'adresse du client est requise."),
  issueDate: z.date(),
  dueDate: z.date(),
  lineItems: z.array(lineItemSchema).min(1, "Ajoutez au moins un article à la facture."),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const ImageUpload = ({ field, label }: { field: any, label: string }) => {
    const [preview, setPreview] = useState(field.value || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                field.onChange(result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                 <label className="cursor-pointer border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 h-32">
                    {preview ? (
                        <Image src={preview} alt={`${label} preview`} width={80} height={80} className="max-h-full w-auto object-contain" />
                    ) : (
                        <>
                            <Upload className="h-8 w-8 mb-2" />
                            <span>Cliquer pour charger</span>
                        </>
                    )}
                    <Input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                 </label>
            </FormControl>
            <FormMessage />
        </FormItem>
    );
};


export default function CreateInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, formatCurrency } = useLocale();
  const { addInvoice, isLoading } = useInvoicing();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      companyAddress: "",
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

  const onSubmit = async (data: InvoiceFormValues) => {
    setIsSubmitting(true);
    
    const newInvoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'> = {
        ...data,
        issueDate: data.issueDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
        lineItems: data.lineItems.map(item => ({
            ...item,
            total: item.quantity * item.unitPrice
        })),
        subtotal,
        tax,
        total,
    }

    try {
        await addInvoice(newInvoice);
        toast({
            title: "Facture créée",
            description: "La nouvelle facture a été enregistrée et l'écriture comptable a été générée.",
        });
        router.push('/dashboard/accounting/invoicing');
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de créer la facture."
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/accounting/invoicing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Créer une nouvelle facture</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

             <Card>
                <CardHeader>
                    <CardTitle>Informations de votre Entreprise</CardTitle>
                    <CardDescription>Personnalisez la facture avec vos informations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="companyAddress" render={({ field }) => (
                         <FormItem><FormLabel>Votre adresse</FormLabel><FormControl><Textarea placeholder="123 Rue Principale, Dakar, Sénégal" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="companyLogoUrl" render={({ field }) => (
                             <ImageUpload field={field} label="Votre Logo" />
                        )} />
                        <FormField control={form.control} name="signatureUrl" render={({ field }) => (
                             <ImageUpload field={field} label="Votre Signature" />
                        )} />
                        <FormField control={form.control} name="stampUrl" render={({ field }) => (
                             <ImageUpload field={field} label="Votre Cachet" />
                        )} />
                    </div>
                </CardContent>
            </Card>

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
                         <FormItem><FormLabel>Email du client (facultatif)</FormLabel><FormControl><Input type="email" placeholder="client@email.com" {...field} /></FormControl><FormMessage /></FormItem>
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
                 <Button type="button" variant="outline" onClick={() => router.push('/dashboard/accounting/invoicing')}>Annuler</Button>
                 <Button type="submit" disabled={isSubmitting || isLoading}>
                     {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Enregistrer la facture
                 </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
