// src/app/dashboard/entreprise/purchases/create/page.tsx
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
import { ArrowLeft, Loader2, PlusCircle, Shield, Trash2 } from 'lucide-react';
import { useProducts } from '@/context/product-context';
import { useLocale } from '@/context/locale-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePurchases } from '@/context/purchase-context';

export default function CreatePurchasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { products, isLoading: isLoadingProducts } = useProducts();
  const { addPurchase, isLoading: isLoadingPurchases } = usePurchases();
  const { t, formatCurrency, currency } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const purchaseItemSchema = z.object({
    productId: z.string().min(1, t('sale_item_product_error')),
    quantity: z.coerce.number().int().min(1, t('sale_item_quantity_error')),
    price: z.coerce.number().min(0, t('product_price_negative_error')),
  });

  const purchaseSchema = z.object({
    supplierName: z.string().min(2, t('supplier_name_required')),
    items: z.array(purchaseItemSchema).min(1, t('at_least_one_item_required')),
  });

  type PurchaseFormValues = z.infer<typeof purchaseSchema>;

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierName: "",
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
      // Pre-fill with the default purchase price, but allow override
      form.setValue(`items.${index}.price`, product.purchasePrice);
    }
  };
  
  const watchedItems = form.watch('items');
  const total = watchedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const onSubmit = async (data: PurchaseFormValues) => {
    setIsSubmitting(true);
    try {
        const purchaseData = {
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

      const newPurchase = await addPurchase(purchaseData);
      toast({
        title: t('purchase_recorded_title'),
        description: t('purchase_recorded_desc', { supplierName: data.supplierName }),
      });
      router.push(`/dashboard/entreprise/purchases/invoice/${newPurchase.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('error_title'),
        description: t('purchase_record_error', { message: error instanceof Error ? error.message : t('An unknown error occurred.') }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/entreprise">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">{t('record_new_purchase_title')}</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('supplier_info_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField control={form.control} name="supplierName" render={({ field }) => (
                        <FormItem><FormLabel>{t('supplier_name_label')}<span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder={t('supplier_name_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('products_purchased_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                           <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_auto] gap-2 items-start">
                              <FormField control={form.control} name={`items.${index}.productId`} render={({ field }) => (
                                <FormItem>
                                     <FormLabel className="md:hidden">Produit</FormLabel>
                                     <Select onValueChange={(value) => {field.onChange(value); handleProductChange(index, value)}} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('select_product_placeholder')} />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoadingProducts ? <p>{t('loading_tip')}</p> : products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                                <FormItem>
                                <FormLabel className="md:hidden">{t('quantity_item_placeholder')}</FormLabel>
                                <FormControl><Input type="number" placeholder={t('quantity_item_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name={`items.${index}.price`} render={({ field }) => (
                                <FormItem>
                                <FormLabel className="md:hidden">{t('product_purchase_price_label')} ({currency})</FormLabel>
                                <FormControl><Input type="number" step="any" placeholder={t('product_purchase_price_label')} {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="self-end">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                           </div>
                        ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1, price: 0 })} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('add_item_button')}
                    </Button>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <div className="w-full md:w-1/3 space-y-2">
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>{t('total_label')}</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                 <Button type="button" variant="outline" asChild><Link href="/dashboard/entreprise">{t('cancel')}</Link></Button>
                 <Button type="submit" disabled={isSubmitting || isLoadingPurchases || isLoadingProducts}>
                     {(isSubmitting || isLoadingPurchases) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {t('save_purchase_button')}
                 </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
