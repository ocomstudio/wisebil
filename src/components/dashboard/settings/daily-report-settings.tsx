// src/components/dashboard/settings/daily-report-settings.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const reportSettingsSchema = z.object({
  dailyReportEnabled: z.boolean().default(false),
  dailyReportTime: z.string().regex(/^\d{2}:\d{2}$/, "L'heure doit être au format HH:MM.").optional(),
  dailyReportFormat: z.enum(["excel", "pdf"]).optional(),
});

type ReportSettingsFormValues = z.infer<typeof reportSettingsSchema>;

export function DailyReportSettings() {
  const { companyProfile, updateCompanyProfile, isLoading: isProfileLoading } = useCompanyProfile();
  const { t } = useLocale();
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
             <div className="flex justify-end">
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
