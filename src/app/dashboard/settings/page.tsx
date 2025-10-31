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
import { Camera, EyeOff, FileText, Info, Lock, ShieldCheck, Languages, Wallet, Trash2, Download, HelpCircle, RefreshCw, MailWarning, Send, Building, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/context/settings-context";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Language, Currency } from "@/context/locale-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useTransactions } from "@/context/transactions-context";
import { useBudgets } from "@/context/budget-context";
import { useSavings } from "@/context/savings-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from 'firebase/firestore';
import { ExportDataDialog } from "@/components/dashboard/export-data-dialog";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useTutorial } from "@/context/tutorial-context";
import { AvatarUploadDialog } from "@/components/dashboard/settings/avatar-upload-dialog";
import { useNotifications } from "@/context/notifications-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserData } from "@/context/user-context";

export default function SettingsPage() {
  const { settings, updateSettings, checkPin } = useSettings();
  const { isReminderEnabled, setIsReminderEnabled } = useNotifications();
  const { user, updateUser, logout, sendVerificationEmail, updateUserEmail, updateUserPassword } = useAuth();
  const { toast } = useToast();
  const { t, locale, setLocale, currency, setCurrency } = useLocale();
  const { setShowTutorial } = useTutorial();
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false);
  const [notificationDisableReason, setNotificationDisableReason] = useState("");
  const isMobile = useIsMobile();
  const { updateUserData } = useUserData();

  const { resetTransactions } = useTransactions();
  const { resetBudgets } = useBudgets();
  const { resetSavings } = useSavings();
  const router = useRouter();


  const profileSchema = z.object({
    displayName: z.string().min(2, t('fullname_error')),
    email: z.string().email(t('email_error')),
    phone: z.string().refine(isValidPhoneNumber, { message: t('signup_phone_error') }),
  });

  type ProfileFormValues = z.infer<typeof profileSchema>;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phone: ""
    },
  });
  
  const emailSchema = z.object({
      newEmail: z.string().email({ message: t('signup_email_error') }),
      password: z.string().min(1, { message: t('password_required') }),
  });
  type EmailFormValues = z.infer<typeof emailSchema>;

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { newEmail: "", password: "" },
  });
  
  const passwordSchema = z.object({
      currentPassword: z.string().min(1, { message: t('password_required') }),
      newPassword: z.string().min(8, { message: t('signup_password_error') }),
  }).refine(data => data.currentPassword !== data.newPassword, {
      message: t('password_new_different_error'),
      path: ["newPassword"],
  });
  type PasswordFormValues = z.infer<typeof passwordSchema>;

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });


  useEffect(() => {
    if (user) {
        form.reset({
            displayName: user.displayName || '',
            email: user.email || '',
            phone: user.phone || ''
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

  const handleEmailChange = async (data: EmailFormValues) => {
    try {
      await updateUserEmail(data.password, data.newEmail);
      toast({
        title: t('email_update_success_title'),
        description: t('email_update_success_desc'),
      });
      setIsEmailDialogOpen(false);
      emailForm.reset();
    } catch (error: any) {
      let description = t('email_update_error');
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = t('incorrect_password_error');
        } else if (error.code === 'auth/email-already-in-use') {
           description = t('This email is already in use by another account.');
        }
      }
      toast({ variant: "destructive", title: t('error_title'), description });
    }
  };

  const handlePasswordChange = async (data: PasswordFormValues) => {
    try {
      await updateUserPassword(data.currentPassword, data.newPassword);
      toast({
        title: t('password_update_success_title'),
        description: t('password_update_success_desc'),
      });
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (error: any) {
       let description = t('password_update_error');
       if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = t('incorrect_password_error');
        }
      }
      toast({ variant: "destructive", title: t('error_title'), description });
    }
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

  const handleToggleReminderNotifications = async (isChecked: boolean) => {
    if (!isMobile) return;

    if (isChecked) {
        setIsReminderEnabled(true);
        toast({ title: t('notification_reminder_enabled_title') });
    } else {
        setIsNotificationsDialogOpen(true);
    }
  };
  
  const handleConfirmDisableNotifications = () => {
    setIsReminderEnabled(false);
    setIsNotificationsDialogOpen(false);
    toast({ title: t('notification_reminder_disabled_title') });
    console.log("Reason for disabling notifications:", notificationDisableReason);
  };


  const handleResetData = async () => {
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
      
      toast({
          title: t('reset_data_success_title'),
          description: t('reset_data_success_desc')
      });
      
    } catch (error) {
      console.error("Failed to reset app data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset financial data.",
      });
    }
  };
  
    const handleResetEnterprise = async () => {
        if (!user) {
            toast({
                variant: "destructive",
                title: t('error_title'),
                description: "User not authenticated for reset.",
            });
            return;
        }

        try {
            await updateUserData({
                products: [],
                productCategories: [],
                sales: [],
                purchases: [],
                saleInvoiceCounter: 0,
                purchaseInvoiceCounter: 0,
            });

            toast({
                title: t('reset_enterprise_success_title'),
                description: t('reset_enterprise_success_desc')
            });
            
        } catch (error) {
            console.error("Failed to reset enterprise data:", error);
            toast({
                variant: "destructive",
                title: t('error_title'),
                description: t('reset_enterprise_error_desc'),
            });
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
  
  const handleAvatarSave = (base64String: string) => {
    updateUser({ avatar: base64String });
    toast({ title: t('avatar_update_success_title') });
  };


  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }
  
  const handleReviewTutorial = () => {
    setShowTutorial(true);
    router.push('/dashboard');
  }

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    try {
        await sendVerificationEmail();
        toast({
            title: t('verification_sent_title'),
            description: t('verification_sent_desc'),
        });
    } catch (error: any) {
        console.error(error);
        let description = t('verification_sent_error');
        if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/too-many-requests') {
            description = t('Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.');
        }
        toast({
            variant: 'destructive',
            title: t('error_title'),
            description: description,
        });
    } finally {
        setIsSendingVerification(false);
    }
  };

  const isEmailPasswordUser = user?.email && !user.emailVerified;

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('nav_settings')}</h1>
        <p className="text-muted-foreground">{t('settings_subtitle')}</p>
      </div>

       {isEmailPasswordUser && (
            <Card className="border-yellow-500/50 bg-yellow-500/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                        <MailWarning className="h-5 w-5" />
                        {t('verify_email_warning_title')}
                    </CardTitle>
                    <CardDescription className="text-yellow-400/80">
                        {t('verify_email_warning_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleSendVerification} disabled={isSendingVerification}>
                        <Send className="mr-2 h-4 w-4" />
                        {isSendingVerification ? t('sending_email_button') : t('send_verification_email_button')}
                    </Button>
                </CardContent>
            </Card>
        )}

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
                  <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-7 w-7" type="button" onClick={() => setIsAvatarDialogOpen(true)}>
                    <Camera className="h-4 w-4" />
                  </Button>
                   <AvatarUploadDialog
                      isOpen={isAvatarDialogOpen}
                      onOpenChange={setIsAvatarDialogOpen}
                      onAvatarSave={handleAvatarSave}
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phone_number_label')}</FormLabel>
                    <FormControl>
                      <PhoneInput
                        international
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        value={field.value}
                        onChange={field.onChange}
                      />
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
          <CardTitle>{t('account_security_title')}</CardTitle>
          <CardDescription>{t('account_security_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{t('email_label')}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">{t('change_button')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('change_email_title')}</DialogTitle>
                            <DialogDescription>{t('change_email_desc')}</DialogDescription>
                        </DialogHeader>
                        <Form {...emailForm}>
                            <form onSubmit={emailForm.handleSubmit(handleEmailChange)} className="space-y-4">
                                <FormField
                                    control={emailForm.control}
                                    name="newEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('new_email_label')}</FormLabel>
                                            <FormControl><Input type="email" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={emailForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('current_password_label')}</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                     <DialogClose asChild><Button type="button" variant="ghost">{t('cancel')}</Button></DialogClose>
                                     <Button type="submit" disabled={emailForm.formState.isSubmitting}>{t('save_changes_button')}</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
             <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{t('password_label')}</p>
                  <p className="text-sm text-muted-foreground">********</p>
                </div>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">{t('change_button')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('change_password_title')}</DialogTitle>
                             <DialogDescription>{t('change_password_desc')}</DialogDescription>
                        </DialogHeader>
                        <Form {...passwordForm}>
                             <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                                <FormField
                                    control={passwordForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('current_password_label')}</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('new_password_label')}</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                     <DialogClose asChild><Button type="button" variant="ghost">{t('cancel')}</Button></DialogClose>
                                     <Button type="submit" disabled={passwordForm.formState.isSubmitting}>{t('change_password_button')}</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
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
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
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
                    <SelectItem value="VND">{t('currency_vnd')} (VND)</SelectItem>
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
          <CardTitle>{t('help_and_support_title')}</CardTitle>
          <CardDescription>{t('help_and_support_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
             <Button onClick={handleReviewTutorial}>
                <HelpCircle className="mr-2 h-4 w-4" />
                {t('review_tutorial_button')}
             </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t('danger_zone_title')}</CardTitle>
          <CardDescription>{t('danger_zone_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('reset_data_button')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                    <RefreshCw className="h-6 w-6 text-red-600" />
                  </div>
                  <AlertDialogTitle>{t('reset_data_warning_title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('reset_data_warning_desc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetData} className="bg-destructive hover:bg-destructive/90">
                    {t('reset_data_confirm_button')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('reset_enterprise_button')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                    <RefreshCw className="h-6 w-6 text-red-600" />
                  </div>
                  <AlertDialogTitle>{t('reset_enterprise_warning_title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('reset_enterprise_warning_desc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetEnterprise} className="bg-destructive hover:bg-destructive/90">
                    {t('reset_enterprise_confirm_button')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('reset_app_button')}
                </Button>
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
          <CardDescription>{t('app_version')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <Separator />
            <div className="space-y-2">
                 <Button variant="ghost" className="w-full justify-start p-0 h-auto" asChild>
                    <Link href="/about">
                         <Info className="mr-2 h-4 w-4"/> {t('about_title')}
                    </Link>
                </Button>
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
