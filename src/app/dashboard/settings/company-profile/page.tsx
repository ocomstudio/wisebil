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
import { useUserData } from "@/context/user-context";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { DailyReportSettings } from "@/components/dashboard/settings/daily-report-settings";

export default function CompanyProfilePage() {
  const { userData, updateCompanyProfile, isLoading: isProfileLoading } = useUserData();
  const { t } = useLocale();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (userData?.companyProfile) {
      form.reset({
        name: userData.companyProfile.name || "",
        address: userData.companyProfile.address || "",
        brandColor: userData.companyProfile.brandColor || "#179C00",
      });
    }
  }, [userData?.companyProfile, form]);
  

  const onSubmit = async (data: CompanyProfileFormValues) => {
    setIsSubmitting(true);
    try {
        await updateCompanyProfile(data);
        
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
            <Skeleton className="h-48 w-full" />
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
                 <Button type="submit" disabled={isSubmitting}>
                     {(isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {t('save_changes_button')}
                 </Button>
            </div>
        </form>
      </Form>

      <DailyReportSettings />

    </div>
  );
}
