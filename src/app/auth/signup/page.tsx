// src/app/auth/signup/page.tsx
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
import { Checkbox } from "@/components/ui/checkbox";
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from "@/context/auth-context";
import { useLocale } from "@/context/locale-context";


export default function SignupPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();

  const signupSchema = z.object({
    fullName: z.string().min(2, t('signup_fullname_error')),
    phone: z.string().min(9, t('signup_phone_error')),
    email: z.string().email(t('signup_email_error')),
    password: z.string().min(8, t('signup_password_error')),
    confirmPassword: z.string(),
    terms: z.boolean().refine(val => val === true, {
      message: t('signup_terms_error'),
    })
  }).refine(data => data.password === data.confirmPassword, {
      message: t('signup_password_mismatch'),
      path: ["confirmPassword"],
  });

  type SignupFormValues = z.infer<typeof signupSchema>;


  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    console.log("Signup data:", data);
    login(); // Set authenticated state
    toast({
      title: t('signup_success_title'),
      description: t('signup_success_desc'),
    });
    router.push("/auth/onboarding");
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">{t('signup_title')}</h1>
        <p className="text-muted-foreground">{t('signup_subtitle')}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fullname_label')} <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone_number_label')} <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+221 77 123 45 67" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email_label')} <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="votre@email.com" {...field} />
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
                <FormLabel>{t('password_label')} <span className="text-destructive">*</span></FormLabel>
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
                <FormLabel>{t('confirm_password_label')} <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                     {t('i_agree_to_the')}{" "}
                     <Link href="/terms" className="text-primary hover:underline">{t('terms')}</Link>{" "}
                     {t('and')}{" "}
                     <Link href="/privacy" className="text-primary hover:underline">{t('privacy_policy')}</Link>.
                  </FormLabel>
                   <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            {t('create_account_button')}
          </Button>
        </form>
      </Form>
      <Separator className="my-6" />
      <Button variant="outline" className="w-full">
        <FcGoogle className="mr-2 h-5 w-5" />
        {t('signup_with_google')}
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('already_have_account')}{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          {t('login_link')}
        </Link>
      </p>
    </>
  );
}