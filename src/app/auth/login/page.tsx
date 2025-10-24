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
import { Loader2, Eye, EyeOff } from "lucide-react";


interface LoginPageProps {
  onSwitchToSignup?: () => void;
}

export default function LoginPage({ onSwitchToSignup }: LoginPageProps) {
  const { t } = useLocale();
  const { toast } = useToast();
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
    if (error && typeof error === 'object' && 'code' in error) {
        switch ((error as { code: string }).code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                description = t('invalid_credential_error');
                break;
            case 'auth/too-many-requests':
                description = t('too_many_requests_error');
                break;
            case 'auth/argument-error':
                description = "La connexion Google n'est pas encore configurée. Veuillez vous connecter avec e-mail et mot de passe.";
                break;
            default:
                description = (error as Error).message;
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
      toast({
        title: t('login_success_title'),
        description: t('welcome_back'),
      });
      router.push('/dashboard');
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      // The redirection will happen, and the context will handle the rest.
      // We don't need to do anything here, just wait.
    } catch (error) {
      handleAuthError(error);
      setIsGoogleLoading(false);
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-headline">{t('login_title')}</h1>
        <p className="text-muted-foreground">{t('login_subtitle')}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <div className="flex items-center justify-between">
                    <FormLabel>{t('password_label')}</FormLabel>
                    <Button variant="link" asChild className="p-0 h-auto text-sm">
                        <Link href="/auth/forgot-password">{t('forgot_password_link')}</Link>
                    </Button>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="********" {...field} />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
            {(isLoading) && <Loader2 className="animate-spin" />}
            {t('login_button')}
          </Button>
        </form>
      </Form>
      <Separator className="my-6" />
      <Button variant="outline" className="w-full" onClick={onGoogleLogin} disabled={isLoading || isGoogleLoading}>
        {isGoogleLoading ? <Loader2 className="animate-spin" /> : <FcGoogle className="mr-2 h-5 w-5" />}
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
