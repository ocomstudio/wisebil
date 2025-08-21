// src/app/auth/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from 'react';

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
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/auth-context";
import { useLocale } from "@/context/locale-context";
import { FirebaseError } from "firebase/app";
import { Loader2 } from "lucide-react";


interface LoginPageProps {
  onSwitchToSignup?: () => void;
}

export default function LoginPage({ onSwitchToSignup }: LoginPageProps) {
  const { t } = useLocale();
  const { toast } = useToast();
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const loginSchema = z.object({
    email: z.string().email(t('signup_email_error')),
    password: z.string().min(1, t('password_required')),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const handleAuthError = (error: any) => {
    let description = t('An unknown error occurred.');
    if (error instanceof FirebaseError) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                description = t('Invalid email or password.');
                break;
            case 'auth/too-many-requests':
                description = t('Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.');
                break;
            default:
                description = error.message;
        }
    }
    toast({
        variant: "destructive",
        title: t('Login failed'),
        description,
    });
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await loginWithEmail(data.email, data.password);
      // The ProtectedRoute or AuthContext will handle redirection
      toast({
        title: t('login_success_title'),
        description: t('welcome_back'),
      });
      // No need to manually redirect. The auth state change will trigger it.
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      // The ProtectedRoute or AuthContext will handle redirection
      toast({
        title: t('login_success_title'),
        description: t('welcome_back'),
      });
    } catch (error) {
      handleAuthError(error);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-headline">{t('login_title')}</h1>
        <p className="text-muted-foreground">{t('login_subtitle')}</p>
      </div>
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            {t('login_button')}
          </Button>
        </form>
      </Form>
      <Separator className="my-6" />
      <Button variant="outline" className="w-full" onClick={onGoogleLogin} disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : <FcGoogle className="mr-2 h-5 w-5" />}
        {t('login_with_google')}
      </Button>
       <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('no_account_yet')}{" "}
        {onSwitchToSignup ? (
          <Button variant="link" className="p-0 h-auto" onClick={onSwitchToSignup}>
            {t('signup_link')}
          </Button>
        ) : (
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/auth/signup">{t('signup_link')}</Link>
          </Button>
        )}
      </p>
    </>
  );
}
