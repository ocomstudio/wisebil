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

const productSchema = z.object({
  name: z.string().min(2, "Le nom du produit est requis."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Le prix ne peut être négatif."),
  promoPrice: z.coerce.number().optional(),
  quantity: z.coerce.number().int().min(0, "La quantité ne peut être négative."),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addProduct, isLoading, uploadImage } = useProducts();
  const { currency } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      promoPrice: undefined,
      quantity: 0,
      imageUrl: "",
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


  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrl = '';
      // Step 1: Upload image if it exists
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `${Date.now()}-${imageFile.name}`);
      }

      // Step 2: Add product data (with or without imageUrl) to Firestore
      await addProduct({ ...data, imageUrl });

      toast({
        title: "Produit ajouté",
        description: `Le produit "${data.name}" a été ajouté à votre inventaire.`,
      });
      router.push('/dashboard/entreprise/products');
    } catch (error) {
       console.error("Error creating product:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le produit. " + (error instanceof Error ? error.message : "Erreur inconnue."),
      });
    } finally {
      // This will now always be called, even if an error occurs
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
        <h1 className="text-3xl font-bold font-headline">Ajouter un nouveau produit</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Détails du Produit</CardTitle>
                    <CardDescription>Remplissez les informations ci-dessous.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nom du produit</FormLabel><FormControl><Input placeholder="Ex: T-shirt en coton" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description (facultatif)</FormLabel><FormControl><Textarea placeholder="Décrivez votre produit..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>Prix ({currency})</FormLabel><FormControl><Input type="number" placeholder="5000" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="promoPrice" render={({ field }) => (
                            <FormItem><FormLabel>Prix Promotionnel ({currency}) (facultatif)</FormLabel><FormControl><Input type="number" placeholder="4500" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="quantity" render={({ field }) => (
                        <FormItem><FormLabel>Quantité en stock</FormLabel><FormControl><Input type="number" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormItem>
                        <FormLabel>Image du produit (facultatif)</FormLabel>
                         <FormControl>
                            <label className="cursor-pointer border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 h-48 w-full">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Aperçu du produit" className="max-h-full w-auto object-contain rounded-md" />
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 mb-2" />
                                        <span>Cliquer pour charger une image</span>
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
                 <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
                 <Button type="submit" disabled={isSubmitting || isLoading}>
                     {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Enregistrer le produit
                 </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
