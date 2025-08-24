// src/app/auth/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLocale } from "@/context/locale-context";
import { useToast } from "@/hooks/use-toast";
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
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { FirebaseError } from "firebase/app";
import { Logo } from "@/components/common/logo";


function ResetPasswordContent() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { confirmPasswordReset } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const oobCode = searchParams.get('oobCode');

  const resetPasswordSchema = z.object({
    password: z.string().min(8, t('signup_password_error')),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
      message: t('signup_password_mismatch'),
      path: ["confirmPassword"],
  });

  type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!oobCode) {
        setError(t('invalid_reset_link_error'));
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await confirmPasswordReset(oobCode, data.password);
      setIsSuccess(true);
    } catch (err) {
      let description = t('An unknown error occurred.');
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/expired-action-code':
            description = t('expired_reset_link_error');
            break;
          case 'auth/invalid-action-code':
            description = t('invalid_reset_link_error');
            break;
          case 'auth/user-disabled':
            description = t('user_disabled_error');
            break;
          case 'auth/weak-password':
            description = t('signup_password_error');
            break;
          default:
            description = err.message;
        }
      }
      setError(description);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!oobCode) {
       return (
         <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-headline">{t('error_title')}</CardTitle>
                    <CardDescription>
                        {t('invalid_reset_link_error')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild>
                        <Link href="/auth/login">{t('back_to_login')}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      )
  }
  
  if (isSuccess) {
       return (
         <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">{t('password_reset_success_title')}</CardTitle>
                    <CardDescription>
                        {t('password_reset_success_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild>
                        <Link href="/auth/login">{t('proceed_to_login_button')}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
     <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <Logo />
            </div>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="font-headline">{t('reset_password_title')}</CardTitle>
                    <CardDescription>{t('reset_password_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                     {error && <p className="mb-4 text-center text-sm font-medium text-destructive">{error}</p>}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('new_password_label')}</FormLabel>
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
                                    <FormLabel>{t('confirm_new_password_label')}</FormLabel>
                                    <FormControl>
                                    <Input type="password" placeholder="********" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="animate-spin" />}
                                {t('reset_password_button')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
