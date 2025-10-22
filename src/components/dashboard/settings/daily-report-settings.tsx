// src/components/dashboard/settings/daily-report-settings.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/context/locale-context";
import { useCompanyProfile } from "@/context/company-profile-context";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2, Download } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSales } from "@/context/sales-context";
import { usePurchases } from "@/context/purchase-context";
import { useProducts } from "@/context/product-context";
import { format } from "date-fns";

const reportSettingsSchema = z.object({
  dailyReportEnabled: z.boolean().default(false),
  dailyReportTime: z.string().regex(/^\d{2}:\d{2}$/, "L'heure doit être au format HH:MM.").optional(),
  dailyReportFormat: z.enum(["excel", "pdf"]).optional(),
});

type ReportSettingsFormValues = z.infer<typeof reportSettingsSchema>;

export function DailyReportSettings() {
  const { companyProfile, updateCompanyProfile, isLoading: isProfileLoading } = useCompanyProfile();
  const { sales } = useSales();
  const { purchases } = usePurchases();
  const { products } = useProducts();
  const { t, formatDate } = useLocale();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportSettingsFormValues>({
    resolver: zodResolver(reportSettingsSchema),
    defaultValues: {
      dailyReportEnabled: false,
      dailyReportTime: "18:00",
      dailyReportFormat: "excel",
    },
  });

  useEffect(() => {
    if (companyProfile) {
      form.reset({
        dailyReportEnabled: companyProfile.dailyReportEnabled || false,
        dailyReportTime: companyProfile.dailyReportTime || "18:00",
        dailyReportFormat: companyProfile.dailyReportFormat || "excel",
      });
    }
  }, [companyProfile, form]);
  
  const onSubmit = async (data: ReportSettingsFormValues) => {
    setIsSubmitting(true);
    try {
        await updateCompanyProfile(data);
        toast({
            title: t('report_settings_saved_title'),
            description: t('report_settings_saved_desc'),
        });

    } catch (error) {
        console.error("Error updating report settings:", error);
        toast({
            variant: "destructive",
            title: t('error_title'),
            description: "Failed to save report settings.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDownloadTodayReport = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const dailySales = sales.filter(s => s.date.startsWith(todayString));
    const dailyPurchases = purchases.filter(p => p.date.startsWith(todayString));

    if (dailySales.length === 0 && dailyPurchases.length === 0 && products.length === 0) {
        toast({
            variant: "default",
            title: "Aucune donnée",
            description: "Aucune activité (vente, achat, produit) enregistrée pour aujourd'hui.",
        });
        return;
    }

    const wb = XLSX.utils.book_new();

    // 1. Ventes du Jour
    if (dailySales.length > 0) {
        const salesData = dailySales.flatMap(sale => 
            sale.items.map(item => ({
                'Date': formatDate(sale.date),
                'Facture': sale.invoiceNumber,
                'Client': sale.customerName,
                'Produit': item.productName,
                'Quantité': item.quantity,
                'Prix Unitaire': item.price,
                'Total': item.price * item.quantity
            }))
        );
        const ws = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(wb, ws, "Ventes du Jour");
    }

    // 2. Achats du Jour
    if (dailyPurchases.length > 0) {
        const purchasesData = dailyPurchases.flatMap(purchase => 
            purchase.items.map(item => ({
                'Date': formatDate(purchase.date),
                'Bon de Commande': purchase.invoiceNumber,
                'Fournisseur': purchase.supplierName,
                'Produit': item.productName,
                'Quantité': item.quantity,
                'Coût Unitaire': item.price,
                'Total': item.price * item.quantity
            }))
        );
        const ws = XLSX.utils.json_to_sheet(purchasesData);
        XLSX.utils.book_append_sheet(wb, ws, "Achats du Jour");
    }

    // 3. Mouvements de Stock
    const salesByProduct = dailySales.flatMap(s => s.items).reduce((acc, item) => {
        acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
        return acc;
    }, {} as Record<string, number>);

    const purchasesByProduct = dailyPurchases.flatMap(p => p.items).reduce((acc, item) => {
        acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
        return acc;
    }, {} as Record<string, number>);
    
    const inventoryData = products.map(product => {
        const soldToday = salesByProduct[product.id] || 0;
        const purchasedToday = purchasesByProduct[product.id] || 0;
        const endOfDayStock = product.quantity;
        const startOfDayStock = endOfDayStock - purchasedToday + soldToday;

        return {
            'Produit': product.name,
            'Stock Début de Journée': startOfDayStock,
            'Quantité Achetée': purchasedToday,
            'Quantité Vendue': soldToday,
            'Stock Fin de Journée': endOfDayStock
        };
    });

    if (inventoryData.length > 0) {
        const ws = XLSX.utils.json_to_sheet(inventoryData);
        XLSX.utils.book_append_sheet(wb, ws, "Mouvements de Stock");
    }
    
    const fileName = `Rapport_Journalier_${format(today, "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast({
        title: "Rapport Téléchargé",
        description: "Votre rapport journalier a été généré avec succès.",
    });
  }

  const isEnabled = form.watch("dailyReportEnabled");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('daily_reports_title')}</CardTitle>
        <CardDescription>{t('daily_reports_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="dailyReportEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('enable_daily_reports_label')}
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isEnabled && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="dailyReportTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('report_time_label')}</FormLabel>
                      <FormControl>
                         <Input type="time" {...field} className="w-full md:w-48" />
                      </FormControl>
                      <FormDescription>
                        {t('report_time_desc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="dailyReportFormat"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{t('report_format_label')}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="excel" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Excel
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="pdf" disabled />
                            </FormControl>
                            <FormLabel className="font-normal">
                              PDF ({t('coming_soon_title')})
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
             <div className="flex flex-wrap justify-between items-center gap-4">
                 <Button type="button" variant="outline" onClick={handleDownloadTodayReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le rapport du jour
                 </Button>
                 <Button type="submit" disabled={isSubmitting || isProfileLoading}>
                     {(isSubmitting || isProfileLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {t('save_changes_button')}
                 </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
