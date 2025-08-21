// src/components/dashboard/payment-form-dialog.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from 'axios';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/context/locale-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export interface Plan {
  name: string;
  title: string;
  price: number;
  description: string;
  features: string[];
  isCurrent: boolean;
  buttonText: string;
  buttonVariant: string;
  isPopular?: boolean;
}

interface PaymentFormDialogProps {
  plan: Plan;
}

export function PaymentFormDialog({ plan }: PaymentFormDialogProps) {
  const { t, currency } = useLocale();
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const paymentSchema = z.object({
    customer_name: z.string().min(2, t('firstname_error')),
    customer_surname: z.string().min(2, t('lastname_error')),
    customer_email: z.string().email(t('signup_email_error')),
    customer_phone_number: z.string().refine(isValidPhoneNumber, { message: t('signup_phone_error') }),
    customer_address: z.string().min(5, t('address_error')),
    customer_city: z.string().min(2, t('city_error')),
    customer_country: z.string().min(2).max(2).default("SN"),
    customer_state: z.string().min(2).max(2).default("DK"),
    customer_zip_code: z.string().min(5, t('zipcode_error')),
  });
  
  type PaymentFormValues = z.infer<typeof paymentSchema>;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      customer_name: "",
      customer_surname: "",
      customer_email: "",
      customer_phone_number: "",
      customer_address: "",
      customer_city: "",
      customer_country: "SN",
      customer_state: "DK",
      customer_zip_code: "",
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    setIsLoading(true);

    if (!firebaseUser) {
        toast({ variant: 'destructive', title: t('login_required_for_subscription')});
        setIsLoading(false);
        return;
    }

    try {
        const token = await firebaseUser.getIdToken();
        const response = await axios.post('/api/cinetpay/initiate-payment', {
            amount: plan.price,
            currency: currency,
            description: `Abonnement ${plan.title} - Wisebil`,
            ...data
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.payment_url) {
            window.location.href = response.data.payment_url;
        } else {
             toast({ variant: 'destructive', title: t('subscription_error'), description: response.data.error || 'Unknown error' });
        }

    } catch (error: any) {
        console.error("Payment initiation failed:", error);
        const errorMessage = error.response?.data?.error || error.response?.data?.details?.message || t('subscription_error');
        toast({ variant: 'destructive', title: t('subscription_error'), description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
            variant={plan.buttonVariant as any}
            className="w-full"
            disabled={plan.isCurrent}
        >
            {plan.buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('payment_form_title', { planName: plan.title })}</DialogTitle>
          <DialogDescription>
            {t('payment_form_desc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <FormField
                    control={form.control}
                    name="customer_name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('firstname_label')}</FormLabel>
                        <FormControl>
                            <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="customer_surname"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('lastname_label')}</FormLabel>
                        <FormControl>
                            <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="customer_email"
                    render={({ field }) => (
                    <FormItem className="md:col-span-2">
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
                    name="customer_phone_number"
                    render={({ field }) => (
                    <FormItem className="md:col-span-2">
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
                    name="customer_address"
                    render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>{t('address_label')}</FormLabel>
                        <FormControl>
                            <Input placeholder="123, Rue de la Paix" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="customer_city"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('city_label')}</FormLabel>
                        <FormControl>
                            <Input placeholder="Dakar" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="customer_zip_code"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('zipcode_label')}</FormLabel>
                        <FormControl>
                            <Input placeholder="10000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="md:col-span-2 text-right">
                    <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('proceed_to_payment_button', { amount: t(currency) === 'XOF' ? `${plan.price} FCFA` : `${plan.price} ${currency}` })}
                    </Button>
                </div>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
