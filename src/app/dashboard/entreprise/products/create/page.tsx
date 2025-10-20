// src/app/dashboard/entreprise/products/create/page.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addProduct, isLoading, uploadImage, productCategories, addProductCategory } = useProducts();
  const { t, currency } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const productSchema = z.object({
    name: z.string().min(2, t('product_name_required_error')),
    description: z.string().optional(),
    price: z.coerce.number().min(0, t('product_price_negative_error')),
    promoPrice: z.coerce.number().optional(),
    quantity: z.coerce.number().int().min(0, t('product_quantity_negative_error')),
    imageUrl: z.string().optional(),
    categoryId: z.string().optional(),
  });

  type ProductFormValues = z.infer<typeof productSchema>;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      promoPrice: undefined,
      quantity: 0,
      imageUrl: "",
      categoryId: "",
    },
  });
  
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
    setIsSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `${Date.now()}-${imageFile.name}`);
      }

      await addProduct({ ...data, imageUrl });

      toast({
        title: t('product_added_title'),
        description: t('product_added_desc', { productName: data.name }),
      });
      router.push('/dashboard/entreprise/products');
    } catch (error) {
       console.error("Error creating product:", error);
      toast({
        variant: "destructive",
        title: t('error_title'),
        description: t('product_add_error', { message: error instanceof Error ? error.message : t('An unknown error occurred.') }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/entreprise/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">{t('add_new_product_title')}</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('product_details_title')}</CardTitle>
                    <CardDescription>{t('product_details_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>{t('product_name_label')}</FormLabel><FormControl><Input placeholder={t('product_name_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>{t('product_description_label')}</FormLabel><FormControl><Textarea placeholder={t('product_description_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
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
                            <FormItem><FormLabel>{t('product_promo_price_label')} ({currency})</FormLabel><FormControl><Input type="number" placeholder="4500" {...field} /></FormControl><FormMessage /></FormItem>
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
                     {t('save_product_button')}
                 </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
