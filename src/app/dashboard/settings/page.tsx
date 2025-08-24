
// src/app/dashboard/settings/page.tsx
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, EyeOff, FileText, Info, Lock, ShieldCheck, Languages, Wallet, Trash2, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/context/settings-context";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Language, Currency } from "@/context/locale-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTransactions } from "@/context/transactions-context";
import { useBudgets } from "@/context/budget-context";
import { useSavings } from "@/context/savings-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from 'firebase/firestore';
import { ExportDataDialog } from "@/components/dashboard/export-data-dialog";


export default function SettingsPage() {
  const { settings, updateSettings, checkPin } = useSettings();
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const { t, locale, setLocale, currency, setCurrency } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { resetTransactions } = useTransactions();
  const { resetBudgets } = useBudgets();
  const { resetSavings } = useSavings();
  const router = useRouter();


  const profileSchema = z.object({
    displayName: z.string().min(2, t('fullname_error')),
    email: z.string().email(t('email_error')),
  });

  type ProfileFormValues = z.infer<typeof profileSchema>;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
        form.reset({
            displayName: user.displayName || '',
            email: user.email || '',
        });
    }
  }, [user, form]);

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateUser(data);
    toast({
      title: t('profile_updated_title'),
      description: t('profile_updated_desc'),
    });
  };
  
  const handleTogglePinLock = (isChecked: boolean) => {
    if (isChecked) {
      if (!settings.pin) {
        const newPin = prompt(t('set_pin_prompt'));
        if (newPin && /^\d{4}$/.test(newPin)) {
          updateSettings({ isPinLockEnabled: true, pin: newPin });
          toast({ title: t('pin_lock_enabled_title') });
        } else {
          toast({ variant: "destructive", title: t('invalid_pin_error') });
        }
      } else {
         updateSettings({ isPinLockEnabled: true });
         toast({ title: t('pin_lock_enabled_title') });
      }
    } else {
      const pin = prompt(t('enter_pin_to_disable_prompt'));
      if (pin && checkPin(pin)) {
        updateSettings({ isPinLockEnabled: false, isBalanceHidden: false }); 
        toast({ title: t('pin_lock_disabled_title') });
      } else if (pin !== null) {
        toast({ variant: "destructive", title: t('incorrect_pin') });
      }
    }
  };

  const handleToggleBalanceVisibility = (isChecked: boolean) => {
    const pin = prompt(t('enter_pin_to_change_setting_prompt'));
    if (pin && checkPin(pin)) {
        updateSettings({ isBalanceHidden: isChecked });
        toast({ title: t(isChecked ? 'balance_hidden_title' : 'balance_shown_title') });
    } else if (pin !== null) {
        toast({ variant: "destructive", title: t('incorrect_pin') });
    }
  };

  const handleResetApp = async () => {
    try {
      if (!user) {
        throw new Error("User not authenticated for reset.");
      }
      
      await resetTransactions();
      await resetBudgets();
      await resetSavings();

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        conversations: {}
      });
  
      await updateSettings({
        isBalanceHidden: false,
        isPinLockEnabled: false,
        pin: null,
      });
      
      toast({
          title: t('reset_success_title'),
          description: t('reset_success_desc')
      });
      
      await logout();
      router.push('/');
    } catch (error) {
      console.error("Failed to reset app:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset application data.",
      });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateUser({ avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('nav_settings')}</h1>
        <p className="text-muted-foreground">{t('settings_subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile_title')}</CardTitle>
          <CardDescription>{t('profile_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatar || undefined} alt="User avatar" data-ai-hint="man avatar"/>
                    <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                  </Avatar>
                  <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-7 w-7" type="button" onClick={handleAvatarClick}>
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fullname_label')}</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email_label')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre@email.com" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">{t('save_changes_button')}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('data_export_title')}</CardTitle>
          <CardDescription>{t('data_export_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
            <ExportDataDialog />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('preferences_title')}</CardTitle>
          <CardDescription>{t('preferences_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium flex items-center gap-2"><Languages className="h-4 w-4" /> {t('language_label')}</h3>
              <p className="text-sm text-muted-foreground">{t('language_setting_desc')}</p>
            </div>
             <Select value={locale} onValueChange={(value) => setLocale(value as Language)}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t('language')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium flex items-center gap-2"><Wallet className="h-4 w-4" /> {t('currency_label')}</h3>
              <p className="text-sm text-muted-foreground">{t('currency_setting_desc')}</p>
            </div>
             <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t('currency')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="XOF">{t('currency_xof')} (XOF)</SelectItem>
                    <SelectItem value="EUR">{t('currency_eur')} (EUR)</SelectItem>
                    <SelectItem value="USD">{t('currency_usd')} (USD)</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>{t('security_title')}</CardTitle>
          <CardDescription>{t('security_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium flex items-center gap-2"><Lock className="h-4 w-4" /> {t('pin_lock_label')}</h3>
              <p className="text-sm text-muted-foreground">{t('pin_lock_desc')}</p>
            </div>
            <Switch
              checked={settings.isPinLockEnabled}
              onCheckedChange={handleTogglePinLock}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium flex items-center gap-2"><EyeOff className="h-4 w-4" /> {t('hide_balance_label')}</h3>
              <p className="text-sm text-muted-foreground">{t('hide_balance_desc')}</p>
            </div>
            <Switch
              checked={settings.isBalanceHidden}
              onCheckedChange={handleToggleBalanceVisibility}
              disabled={!settings.isPinLockEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t('danger_zone_title')}</CardTitle>
          <CardDescription>{t('danger_zone_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">{t('reset_app_button')}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <AlertDialogTitle>{t('reset_warning_title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('reset_warning_desc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetApp} className="bg-destructive hover:bg-destructive/90">
                    {t('reset_confirm_button')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>{t('about_title')}</CardTitle>
          <CardDescription>{t('about_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Info className="h-5 w-5"/>
                <p>{t('app_info')}</p>
            </div>
             <Separator />
            <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start p-0 h-auto" asChild>
                    <Link href="/privacy-policy">
                         <ShieldCheck className="mr-2 h-4 w-4"/> {t('privacy_policy')}
                    </Link>
                </Button>
                 <Button variant="ghost" className="w-full justify-start p-0 h-auto" asChild>
                    <Link href="/terms-of-service">
                        <FileText className="mr-2 h-4 w-4"/> {t('terms_of_service')}
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
