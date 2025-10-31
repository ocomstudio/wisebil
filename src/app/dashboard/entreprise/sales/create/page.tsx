// src/app/dashboard/entreprise/sales/create/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, PlusCircle, Trash2, Package } from 'lucide-react';
import { useUserData } from '@/context/user-context';
import { useLocale } from '@/context/locale-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber, type Country } from 'react-phone-number-input';
import axios from "axios";

export default function CreateSalePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { userData, addSale, isLoading } = useUserData();
  const products = userData?.products || [];
  const { t, formatCurrency } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<Country>('SN');

  useEffect(() => {
    const fetchCountry = async () => {
        try {
            const response = await axios.get('https://ipapi.co/json/');
            const countryCode = response.data?.country_code as Country | undefined;
            if (countryCode) {
                setDetectedCountry(countryCode);
            }
        } catch (error) {
            console.warn("Could not detect user country, defaulting to SN.", error);
        }
    };

    fetchCountry();
  }, []);

  const saleItemSchema = z.object({
    productId: z.string().min(1, t('sale_item_product_error')),
    quantity: z.coerce.number().int().min(1, t('sale_item_quantity_error')),
    price: z.number(),
  });

  const saleSchema = z.object({
    customerName: z.string().min(2, t('customer_name_required')),
    customerPhone: z.string().optional().refine(val => !val || isValidPhoneNumber(val), {
      message: t('signup_phone_error'),
    }),
    items: z.array(saleItemSchema).min(1, t('at_least_one_item_required')),
  });

  type SaleFormValues = z.infer<typeof saleSchema>;

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
    const product = products?.find(p => p.id === productId);
    if (product) {
        if (product.quantity <= 0) {
            toast({
                variant: 'destructive',
                title: 'Stock épuisé',
                description: `Le produit "${product.name}" n'est plus en stock.`,
            });
            form.setValue(`items.${index}.productId`, '');
            return;
        }
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
                const product = products?.find(p => p.id === item.productId);
                return {
                    ...item,
                    productName: product?.name || 'Produit inconnu',
                };
            }),
            total,
        };

      const newSale = await addSale(saleData);
      toast({
        title: t('sale_recorded_title'),
        description: t('sale_recorded_desc', { customerName: data.customerName }),
      });
      router.push(`/dashboard/entreprise/sales/invoice/${newSale.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('error_title'),
        description: error instanceof Error ? error.message : "Une erreur est survenue."
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
        <h1 className="text-3xl font-bold font-headline">{t('record_new_sale_title')}</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('customer_info_title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                        <FormItem><FormLabel>{t('customer_name_label')}<span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('customer_phone_label')}</FormLabel>
                            <FormControl>
                            <PhoneInput
                                international
                                defaultCountry={detectedCountry}
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
                    <CardTitle>{t('products_sold_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="hidden md:grid grid-cols-[1fr_120px_auto] gap-4 items-end mb-2 text-sm font-medium text-muted-foreground">
                        <div>{t('product_header')}</div>
                        <div className="text-left">{t('quantity_header')}</div>
                        <div></div>
                    </div>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                           <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-2 md:gap-4 items-start">
                              <FormField control={form.control} name={`items.${index}.productId`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="md:hidden">{t('product_header')}</FormLabel>
                                     <Select onValueChange={(value) => {field.onChange(value); handleProductChange(index, value)}} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('select_product_placeholder')} />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoading ? <p>{t('loading_tip')}</p> : products?.map(p => 
                                                <SelectItem key={p.id} value={p.id} disabled={p.quantity <= 0}>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                        <span>{p.name} ({p.quantity} en stock)</span>
                                                    </div>
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                                <FormItem>
                                <FormLabel className="md:hidden">{t('quantity_header')}</FormLabel>
                                <FormControl><Input type="number" placeholder={t('quantity_item_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="self-end md:self-center">
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
                 <Button type="submit" disabled={isSubmitting || isLoading}>
                     {(isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {t('save_and_generate_invoice_button')}
                 </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
