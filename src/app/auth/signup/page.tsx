// src/app/auth/signup/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import PhoneInput, { isValidPhoneNumber, type Country } from 'react-phone-number-input';
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from "@/context/auth-context";
import { useLocale } from "@/context/locale-context";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { FirebaseError } from "firebase/app";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import axios from "axios";

interface SignupPageProps {
  onSwitchToLogin?: () => void;
}

export default function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  const { t } = useLocale();
  const { toast } = useToast();
  const router = useRouter();
  const { signupWithEmail, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<Country>('SN');

  useEffect(() => {
    const fetchCountry = async () => {
        try {
            const response = await axios.get('https://ipapi.co/json/');
            if (response.data && response.data.country_code) {
                setDetectedCountry(response.data.country_code as Country);
            }
        } catch (error) {
            console.warn("Could not detect user country, defaulting to SN.", error);
        }
    };

    fetchCountry();
  }, []);

  const signupSchema = z.object({
    fullName: z.string().min(2, t('signup_fullname_error')),
    phone: z.string().refine(isValidPhoneNumber, { message: t('signup_phone_error') }),
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

  const handleAuthError = (error: any) => {
    let description = t('An unknown error occurred.');
    if (error instanceof FirebaseError) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                description = t('This email is already in use by another account.');
                break;
            case 'auth/weak-password':
                description = t('The password is too weak. Please choose a stronger password.');
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
        title: t('Signup failed'),
        description,
    });
  }

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      // Pass all necessary data to the context function
      await signupWithEmail(data.email, data.password, {
        fullName: data.fullName,
        phone: data.phone,
      });
      
      toast({
        title: t('signup_success_title'),
        description: t('signup_success_desc_verify'),
      });
      router.push("/auth/verify-email");
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
  }

  return (
    <>
       <div className="mb-8 text-center">
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
                <FormLabel>{t('fullname_label')}</FormLabel>
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
                <FormLabel>{t('phone_number_label')}</FormLabel>
                <FormControl>
                  <PhoneInput
                    international
                    defaultCountry={detectedCountry}
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email_label')}</FormLabel>
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
                <FormLabel>{t('password_label')}</FormLabel>
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('confirm_password_label')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showConfirmPassword ? "text" : "password"} placeholder="********" {...field} />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
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
                     <Button variant="link" asChild className="p-0 h-auto font-medium"><a href="/terms" target="_blank">{t('terms')}</a></Button>{" "}
                     {t('and')}{" "}
                     <Button variant="link" asChild className="p-0 h-auto font-medium"><a href="/privacy" target="_blank">{t('privacy_policy')}</a></Button>.
                  </FormLabel>
                   <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            {t('create_account_button')}
          </Button>
        </form>
      </Form>
      <Separator className="my-6" />
      <Button variant="outline" className="w-full" onClick={onGoogleLogin} disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : <FcGoogle className="mr-2 h-5 w-5" />}
        {t('signup_with_google')}
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('already_have_account')}{" "}
         {onSwitchToLogin ? (
          <Button variant="link" className="p-0 h-auto" onClick={onSwitchToLogin}>
            {t('login_link')}
          </Button>
        ) : (
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/auth/login">{t('login_link')}</Link>
          </Button>
        )}
      </p>
    </>
  );
}
