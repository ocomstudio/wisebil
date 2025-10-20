// src/app/dashboard/entreprise/products/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { useProducts } from '@/context/product-context';
import { useLocale } from '@/context/locale-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/types/product';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { getProductById, updateProduct, uploadImage, isLoading } = useProducts();
  const { t, currency } = useLocale();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const id = params.id as string;

  const productSchema = z.object({
    name: z.string().min(2, t('product_name_required_error')),
    description: z.string().optional(),
    price: z.coerce.number().min(0, t('product_price_negative_error')),
    promoPrice: z.coerce.number().optional(),
    quantity: z.coerce.number().int().min(0, t('product_quantity_negative_error')),
    imageUrl: z.string().optional(),
  });

  type ProductFormValues = z.infer<typeof productSchema>;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
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
                imageUrl: foundProduct.imageUrl || "",
            });
            setImagePreview(foundProduct.imageUrl || null);
        } else {
             toast({ variant: 'destructive', title: t('product_not_found_error') });
             router.push('/dashboard/entreprise/products');
        }
    }
  }, [id, isLoading, getProductById, router, toast, form, t]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = async (data: ProductFormValues) => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      let imageUrl = product.imageUrl || '';
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `${Date.now()}-${imageFile.name}`);
      }

      await updateProduct(product.id, { ...data, imageUrl });

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
                        <FormItem><FormLabel>{t('product_description_label')}</FormLabel><FormControl><Textarea placeholder={t('product_description_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-2 gap-6">
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
                     <FormItem>
                        <FormLabel>{t('product_image_label')}</FormLabel>
                         <FormControl>
                            <label className="cursor-pointer border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 h-48 w-full">
                                {imagePreview ? (
                                    <img src={imagePreview} alt={t('product_image_preview_alt')} className="max-h-full w-auto object-contain rounded-md" />
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 mb-2" />
                                        <span>{t('product_image_upload_cta')}</span>
                                    </>
                                )}
                                <Input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
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
