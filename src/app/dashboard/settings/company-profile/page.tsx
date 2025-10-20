// src/app/dashboard/settings/company-profile/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import { useCompanyProfile } from "@/context/company-profile-context";
import { useEffect, useState } from "react";
import { useProducts } from "@/context/product-context"; // for uploadImage
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function CompanyProfilePage() {
  const { companyProfile, updateCompanyProfile, isLoading: isProfileLoading } = useCompanyProfile();
  const { uploadImage, isLoading: isUploading } = useProducts(); // Re-use upload logic
  const { t } = useLocale();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);

  const companyProfileSchema = z.object({
    name: z.string().min(2, t('company_name_required_error')),
    address: z.string().min(10, t('company_address_required')),
    brandColor: z.string().regex(/^#[0-9A-F]{6}$/i, t('invalid_color_format_error')),
  });

  type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: "",
      address: "",
      brandColor: "#179C00",
    },
  });

  useEffect(() => {
    if (companyProfile) {
      form.reset({
        name: companyProfile.name || "",
        address: companyProfile.address || "",
        brandColor: companyProfile.brandColor || "#179C00",
      });
      setLogoPreview(companyProfile.logoUrl || null);
      setSignaturePreview(companyProfile.signatureUrl || null);
      setStampPreview(companyProfile.stampUrl || null);
    }
  }, [companyProfile, form]);
  
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CompanyProfileFormValues) => {
    setIsSubmitting(true);
    try {
        let logoUrl = companyProfile?.logoUrl || "";
        let signatureUrl = companyProfile?.signatureUrl || "";
        let stampUrl = companyProfile?.stampUrl || "";

        if (logoFile) {
            logoUrl = await uploadImage(logoFile, `company/logo-${Date.now()}`);
        }
        if (signatureFile) {
            signatureUrl = await uploadImage(signatureFile, `company/signature-${Date.now()}`);
        }
        if (stampFile) {
            stampUrl = await uploadImage(stampFile, `company/stamp-${Date.now()}`);
        }

        await updateCompanyProfile({ 
            ...data,
            logoUrl,
            signatureUrl,
            stampUrl,
        });
        
        toast({
            title: t('company_profile_updated_title'),
            description: t('company_profile_updated_desc'),
        });

    } catch (error) {
        console.error("Error updating company profile:", error);
        toast({
            variant: "destructive",
            title: t('error_title'),
            description: t('company_profile_update_error'),
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (isProfileLoading) {
      return (
          <div className="space-y-6">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-80 w-full" />
          </div>
      )
  }

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/entreprise">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">{t('company_settings_title')}</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('company_details_title')}</CardTitle>
                    <CardDescription>{t('company_details_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>{t('company_name_label')}</FormLabel><FormControl><Input placeholder={t('your_company_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>{t('your_address_label')}</FormLabel><FormControl><Textarea placeholder="123 Rue de la République..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-3 gap-6">
                        <FormItem>
                            <FormLabel>{t('your_logo_label')}</FormLabel>
                            <FormControl>
                                <label className="cursor-pointer border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 h-32 w-full">
                                    {logoPreview ? (
                                        <Image src={logoPreview} alt="Aperçu du logo" width={80} height={80} className="max-h-full w-auto object-contain rounded-md" />
                                    ) : (
                                        <><Upload className="h-8 w-8 mb-2" /><span>{t('upload_image_cta')}</span></>
                                    )}
                                    <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setLogoFile, setLogoPreview)} />
                                </label>
                            </FormControl>
                        </FormItem>
                         <FormItem>
                            <FormLabel>{t('your_signature_label')}</FormLabel>
                            <FormControl>
                                <label className="cursor-pointer border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 h-32 w-full">
                                    {signaturePreview ? (
                                        <Image src={signaturePreview} alt="Aperçu de la signature" width={120} height={60} className="max-h-full w-auto object-contain" />
                                    ) : (
                                        <><Upload className="h-8 w-8 mb-2" /><span>{t('upload_image_cta')}</span></>
                                    )}
                                    <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setSignatureFile, setSignaturePreview)} />
                                </label>
                            </FormControl>
                        </FormItem>
                         <FormItem>
                            <FormLabel>{t('your_stamp_label')}</FormLabel>
                            <FormControl>
                                <label className="cursor-pointer border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 h-32 w-full">
                                    {stampPreview ? (
                                        <Image src={stampPreview} alt="Aperçu du cachet" width={80} height={80} className="max-h-full w-auto object-contain rounded-full" />
                                    ) : (
                                        <><Upload className="h-8 w-8 mb-2" /><span>{t('upload_image_cta')}</span></>
                                    )}
                                    <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setStampFile, setStampPreview)} />
                                </label>
                            </FormControl>
                        </FormItem>
                    </div>
                     <FormField control={form.control} name="brandColor" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('brand_color_label')}</FormLabel>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                    <Input type="color" className="p-1 h-10 w-14" {...field} />
                                </FormControl>
                                <span className="text-muted-foreground">{field.value}</span>
                            </div>
                             <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
             <div className="flex justify-end">
                 <Button type="submit" disabled={isSubmitting || isUploading}>
                     {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {t('save_changes_button')}
                 </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
