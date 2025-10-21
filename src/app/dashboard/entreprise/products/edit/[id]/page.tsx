// src/app/dashboard/entreprise/products/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from "date-fns";
import { fr, enUS, de, es, vi } from "date-fns/locale";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, CalendarIcon } from 'lucide-react';
import { useProducts } from '@/context/product-context';
import { useLocale } from '@/context/locale-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/types/product';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { getProductById, updateProduct, isLoading, productCategories, addProductCategory } = useProducts();
  const { t, currency, locale } = useLocale();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const id = params.id as string;

  const formSchema = z.object({
    name: z.string().min(2, t('product_name_required_error')),
    description: z.string().optional(),
    price: z.coerce.number().min(0, t('product_price_negative_error')),
    promoPrice: z.coerce.number().optional(),
    quantity: z.coerce.number().int().min(0, t('product_quantity_negative_error')),
    categoryId: z.string().optional(),
    purchaseDate: z.date({
      required_error: t('product_purchase_date_required_error'),
    }),
    storageLocation: z.string().min(2, t('product_storage_location_required_error')),
  });

  type ProductFormValues = z.infer<typeof formSchema>;
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {}
  });

  useEffect(() => {
    if (!isLoading && id) {
        const foundProduct = getProductById(id);
        if (foundProduct) {
            setProduct(foundProduct);
            form.reset({
                name: foundProduct.name,
                description: foundProduct.description || "",
                price: foundProduct.price,
                promoPrice: foundProduct.promoPrice || undefined,
                quantity: foundProduct.quantity,
                categoryId: foundProduct.categoryId || "",
                purchaseDate: new Date(foundProduct.purchaseDate),
                storageLocation: foundProduct.storageLocation,
            });
        } else {
             toast({ variant: 'destructive', title: t('product_not_found_error') });
             router.push('/dashboard/entreprise/products');
        }
    }
  }, [id, isLoading, getProductById, router, toast, t, form]);
  
  const handleCategoryChange = (value: string) => {
    if (value === 'CREATE_NEW') {
      setShowNewCategory(true);
      form.setValue('categoryId', '');
    } else {
      setShowNewCategory(false);
      form.setValue('categoryId', value);
    }
  };

  const handleAddNewCategory = async () => {
    if (newCategoryName.trim()) {
      const newCategory = await addProductCategory(newCategoryName.trim());
      if (newCategory) {
        form.setValue('categoryId', newCategory.id);
        setNewCategoryName("");
        setShowNewCategory(false);
      }
    }
  };


  const onSubmit = async (data: ProductFormValues) => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      await updateProduct(product.id, { ...data, purchaseDate: data.purchaseDate.toISOString() });

      toast({
        title: t('product_updated_title'),
        description: t('product_updated_desc', { productName: data.name }),
      });
      router.push('/dashboard/entreprise/products');
    } catch (error) {
       console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: t('error_title'),
        description: t('product_update_error', { message: error instanceof Error ? error.message : t('An unknown error occurred.') }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || !product) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Card>
                <CardHeader>
                     <Skeleton className="h-8 w-48" />
                     <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  const dateLocales = { fr, en: enUS, de, es, vi };
  const dateLocale = dateLocales[locale] || enUS;

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/entreprise/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">{t('edit_product_title')}</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('product_details_title')}</CardTitle>
                    <CardDescription>{t('product_details_update_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>{t('product_name_label')}</FormLabel><FormControl><Input placeholder={t('product_name_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>{t('product_description_label')}</FormLabel><FormControl><Textarea placeholder={t('product_description_placeholder')} {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="purchaseDate" render={({ field }) => (
                           <FormItem className="flex flex-col">
                           <FormLabel>{t('product_purchase_date_label')}</FormLabel>
                           <Popover>
                             <PopoverTrigger asChild>
                               <FormControl>
                                 <Button
                                   variant={"outline"}
                                   className={cn(
                                     "w-full pl-3 text-left font-normal",
                                     !field.value && "text-muted-foreground"
                                   )}
                                 >
                                   {field.value ? (
                                     format(field.value, "PPP", { locale: dateLocale })
                                   ) : (
                                     <span>{t('pick_a_date')}</span>
                                   )}
                                   <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                 </Button>
                               </FormControl>
                             </PopoverTrigger>
                             <PopoverContent className="w-auto p-0" align="start">
                               <Calendar
                                 mode="single"
                                 selected={field.value}
                                 onSelect={field.onChange}
                                 disabled={(date) =>
                                   date > new Date() || date < new Date("1900-01-01")
                                 }
                                 initialFocus
                                 locale={dateLocale}
                               />
                             </PopoverContent>
                           </Popover>
                           <FormMessage />
                         </FormItem>
                        )} />
                        <FormField control={form.control} name="storageLocation" render={({ field }) => (
                            <FormItem><FormLabel>{t('product_storage_location_label')}</FormLabel><FormControl><Input placeholder={t('product_storage_location_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                     </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('product_category_label')}</FormLabel>
                              <Select onValueChange={handleCategoryChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('select_category_placeholder')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {productCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                  <SelectItem value="CREATE_NEW" className="font-bold text-primary">{t('create_new_category_button')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {showNewCategory && (
                          <div className="grid grid-cols-[1fr_auto] gap-2 items-end md:col-span-2">
                            <Input
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder={t('new_category_name_placeholder')}
                            />
                            <Button type="button" onClick={handleAddNewCategory}>{t('add_category_button')}</Button>
                          </div>
                        )}
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>{t('product_price_label')} ({currency})</FormLabel><FormControl><Input type="number" placeholder="5000" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="promoPrice" render={({ field }) => (
                            <FormItem><FormLabel>{t('product_promo_price_label')} ({currency})</FormLabel><FormControl><Input type="number" placeholder="4500" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="quantity" render={({ field }) => (
                        <FormItem><FormLabel>{t('product_quantity_label')}</FormLabel><FormControl><Input type="number" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                 <Button type="button" variant="outline" onClick={() => router.back()}>{t('cancel')}</Button>
                 <Button type="submit" disabled={isSubmitting || isLoading}>
                     {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {t('save_changes_button')}
                 </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
