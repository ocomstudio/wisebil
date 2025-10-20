// src/app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/logo";


export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { sendPasswordResetEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const forgotPasswordSchema = z.object({
    email: z.string().email(t('signup_email_error')),
  });

  type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(data.email);
      setIsSent(true);
    } catch (error) {
      let description = t('An unknown error occurred.');
      if (error && typeof error === 'object' && 'code' in error) {
        if ((error as { code: string }).code === 'auth/user-not-found') {
          description = t('No user found with this email.');
        } else {
          description = (error as Error).message;
        }
      }
      toast({
        variant: "destructive",
        title: t('Error'),
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSent) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">{t('reset_email_sent_title')}</CardTitle>
                    <CardDescription>
                        {t('reset_email_sent_desc', { email: form.getValues('email') })}
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <Logo />
            </div>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="font-headline">{t('forgot_password_title')}</CardTitle>
                    <CardDescription>{t('forgot_password_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('email_label')}</FormLabel>
                                <FormControl>
                                <Input type="email" placeholder={t('email_or_phone_placeholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="animate-spin" />}
                            {t('send_reset_link_button')}
                        </Button>
                        </form>
                    </Form>
                     <Button variant="link" asChild className="w-full mt-4">
                        <Link href="/auth/login">
                           <ArrowLeft className="mr-2 h-4 w-4" /> {t('back_to_login')}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
