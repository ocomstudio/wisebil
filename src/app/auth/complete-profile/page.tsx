// src/app/auth/complete-profile/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useLocale } from "@/context/locale-context";
import { Loader2 } from "lucide-react";
import { FirebaseError } from "firebase/app";
import { ProtectedRoute } from "@/components/common/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePassword } from "firebase/auth";

function CompleteProfilePage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const router = useRouter();
  const { user, firebaseUser, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const profileSchema = z.object({
    phone: z.string().refine(isValidPhoneNumber, { message: t('signup_phone_error') }),
    password: z.string().min(8, t('signup_password_error')),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
      message: t('signup_password_mismatch'),
      path: ["confirmPassword"],
  });

  type ProfileFormValues = z.infer<typeof profileSchema>;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleAuthError = (error: any) => {
    let description = t('An unknown error occurred.');
    if (error instanceof FirebaseError) {
        switch (error.code) {
            case 'auth/weak-password':
                description = t('The password is too weak. Please choose a stronger password.');
                break;
            default:
                description = error.message;
        }
    }
    toast({
        variant: "destructive",
        title: t('profile_update_failed_title'),
        description,
    });
  }

  const onSubmit = async (data: ProfileFormValues) => {
    if (!firebaseUser) return;
    setIsLoading(true);
    try {
      // Update the password in Firebase Auth
      await updatePassword(firebaseUser, data.password);
      
      // Update the phone number in our user profile (Firestore)
      await updateUser({ phone: data.phone, profileComplete: true });
      
      toast({
        title: t('profile_completed_title'),
        description: t('welcome_message'),
      });
      router.push("/dashboard");
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.profileComplete) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  if (user?.profileComplete) {
    return null; // or a loading skeleton
  }

  return (
     <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">{t('complete_profile_title')}</CardTitle>
                <CardDescription>{t('complete_profile_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormItem>
                            <FormLabel>{t('fullname_label')}</FormLabel>
                            <FormControl>
                                <Input value={user?.displayName || ''} readOnly disabled />
                            </FormControl>
                        </FormItem>
                         <FormItem>
                            <FormLabel>{t('email_label')}</FormLabel>
                            <FormControl>
                                <Input value={user?.email || ''} readOnly disabled />
                            </FormControl>
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('phone_number_label')}</FormLabel>
                                <FormControl>
                                <PhoneInput
                                    international
                                    defaultCountry="SN"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('password_label')}</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('confirm_password_label')}</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('finish_button')}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
     </div>
  );
}

export default function CompleteProfile() {
    return (
        <ProtectedRoute>
            <CompleteProfilePage />
        </ProtectedRoute>
    )
}
