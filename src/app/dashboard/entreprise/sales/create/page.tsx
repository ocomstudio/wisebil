// src/app/dashboard/entreprise/sales/create/page.tsx
"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useProducts } from '@/context/product-context';
import { useLocale } from '@/context/locale-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useUserData } from '@/context/user-context';

const saleItemSchema = z.object({
  productId: z.string().min(1, "Veuillez sélectionner un produit."),
  quantity: z.coerce.number().min(1, "La quantité doit être d'au moins 1."),
  price: z.number(),
});

const saleSchema = z.object({
  customerName: z.string().min(2, "Le nom du client est requis."),
  customerPhone: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "Ajoutez au moins un produit à la vente."),
});

type SaleFormValues = z.infer<typeof saleSchema>;

export default function CreateSalePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { products, isLoading: isLoadingProducts } = useProducts();
  const { addUserSale, isLoading: isLoadingSales } = useUserData();
  const { formatCurrency } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      items: [{ productId: "", quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.price`, product.promoPrice || product.price);
    }
  };
  
  const watchedItems = form.watch('items');
  const total = watchedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const onSubmit = async (data: SaleFormValues) => {
    setIsSubmitting(true);
    try {
        const saleData = {
            ...data,
            items: data.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return {
                    ...item,
                    productName: product?.name || 'Produit inconnu',
                };
            }),
            total,
        };

      const newSale = await addUserSale(saleData);
      toast({
        title: "Vente enregistrée",
        description: `La vente pour ${data.customerName} a été enregistrée.`,
      });
      router.push(`/dashboard/entreprise/sales/invoice/${newSale.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer la vente. " + (error instanceof Error ? error.message : "Une erreur inconnue est survenue."),
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
        <h1 className="text-3xl font-bold font-headline">Enregistrer une nouvelle vente</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Informations du Client</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                        <FormItem><FormLabel>Nom du client</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Téléphone du client (facultatif)</FormLabel>
                            <FormControl>
                            <PhoneInput
                                international
                                defaultCountry="SN"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                value={field.value}
                                onChange={field.onChange}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Produits Vendus</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                           <div key={field.id} className="grid grid-cols-[1fr_80px_auto] gap-2 items-start">
                              <FormField control={form.control} name={`items.${index}.productId`} render={({ field }) => (
                                <FormItem>
                                     <Select onValueChange={(value) => {field.onChange(value); handleProductChange(index, value)}} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un produit" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoadingProducts ? <p>Chargement...</p> : products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                                <FormItem><FormControl><Input type="number" placeholder="Qté" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                           </div>
                        ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1, price: 0 })} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un produit
                    </Button>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <div className="w-full md:w-1/3 space-y-2">
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total :</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                 <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
                 <Button type="submit" disabled={isSubmitting || isLoadingSales || isLoadingProducts}>
                     {(isSubmitting || isLoadingSales) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Enregistrer et générer la facture
                 </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
