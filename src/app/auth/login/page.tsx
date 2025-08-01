// src/app/auth/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

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


export default function LoginPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();
  
  const loginSchema = z.object({
    loginId: z.string().min(1, t('phone_or_email_required')),
    password: z.string().min(1, t('password_required')),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginId: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log("Login data:", data);
    // For demo purposes, we log in with placeholder data.
    // In a real app, you would fetch user data from your backend.
    login({
        fullName: "Demo User",
        email: "demo@example.com",
        phone: "123456789",
        avatar: `https://placehold.co/80x80.png`
    });
    toast({
      title: t('login_success_title'),
      description: t('welcome_back'),
    });
    router.push("/dashboard");
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">{t('login_title')}</h1>
        <p className="text-muted-foreground">{t('login_subtitle')}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="loginId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email_or_phone_label')}</FormLabel>
                <FormControl>
                  <Input type="text" placeholder={t('email_or_phone_placeholder')} {...field} />
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
          <Button type="submit" className="w-full">
            {t('login_button')}
          </Button>
        </form>
      </Form>
      <Separator className="my-6" />
      <Button variant="outline" className="w-full">
        <FcGoogle className="mr-2 h-5 w-5" />
        {t('login_with_google')}
      </Button>
       <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('no_account_yet')}{" "}
        <Link href="/auth/signup" className="text-primary hover:underline">
          {t('signup_link')}
        </Link>
      </p>
    </>
  );
}
