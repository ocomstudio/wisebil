// src/app/auth/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/context/locale-context";
import type { Currency } from "@/context/locale-context";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Check, Euro, DollarSign, Wallet } from "lucide-react";


export default function OnboardingPage() {
  const { t, setCurrency, setLocale } = useLocale();
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const router = useRouter();
  
  const phoneSchema = z.object({
    code: z.string().length(6, t('onboarding_code_error')),
  });
  const currencySchema = z.object({
    currency: z.enum(["XOF", "EUR", "USD"], { required_error: t('onboarding_currency_error')}),
  });
  const incomeSchema = z.object({
    incomeType: z.enum(["monthly", "daily", "mixed"], { required_error: t('onboarding_income_type_error')}),
  });

  const schemas = [phoneSchema, currencySchema, incomeSchema];
  type OnboardingFormValues = z.infer<typeof phoneSchema> & z.infer<typeof currencySchema> & z.infer<typeof incomeSchema>;


  const StepPhoneVerification = () => (
      <>
          <CardHeader>
              <CardTitle>{t('onboarding_phone_title')}</CardTitle>
              <CardDescription>{t('onboarding_phone_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
              <FormField
                  name="code"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>{t('onboarding_code_label')}</FormLabel>
                          <FormControl>
                              <Input placeholder="123456" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <Button variant="link" size="sm" className="p-0 mt-2">
                  {t('onboarding_resend_code')}
              </Button>
          </CardContent>
      </>
  );

  const StepCurrency = () => (
      <>
          <CardHeader>
              <CardTitle>{t('onboarding_currency_title')}</CardTitle>
              <CardDescription>{t('onboarding_currency_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
              <FormField
                  name="currency"
                  render={({ field }) => (
                      <FormItem>
                          <FormControl>
                              <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-1 gap-4"
                              >
                                  <Label htmlFor="xof" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer">
                                      <RadioGroupItem value="XOF" id="xof" />
                                      <Wallet className="h-6 w-6" />
                                      <div>
                                          <p className="font-semibold">{t('currency_xof')}</p>
                                          <p className="text-sm text-muted-foreground">XOF</p>
                                      </div>
                                  </Label>
                                  <Label htmlFor="eur" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer">
                                      <RadioGroupItem value="EUR" id="eur" />
                                      <Euro className="h-6 w-6" />
                                      <div>
                                          <p className="font-semibold">{t('currency_eur')}</p>
                                          <p className="text-sm text-muted-foreground">EUR</p>
                                      </div>
                                  </Label>
                                  <Label htmlFor="usd" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer">
                                      <RadioGroupItem value="USD" id="usd" />
                                      <DollarSign className="h-6 w-6" />
                                      <div>
                                          <p className="font-semibold">{t('currency_usd')}</p>
                                          <p className="text-sm text-muted-foreground">USD</p>
                                      </div>
                                  </Label>
                              </RadioGroup>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
          </CardContent>
      </>
  );

  const StepIncomeType = () => (
      <>
          <CardHeader>
              <CardTitle>{t('onboarding_income_title')}</CardTitle>
              <CardDescription>{t('onboarding_income_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
              <FormField
                  name="incomeType"
                  render={({ field }) => (
                      <FormItem>
                          <FormControl>
                              <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-1 gap-4"
                              >
                                  <Label htmlFor="monthly" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer">
                                      <RadioGroupItem value="monthly" id="monthly" />
                                      <p className="font-semibold">{t('income_type_monthly')}</p>
                                  </Label>
                                  <Label htmlFor="daily" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer">
                                      <RadioGroupItem value="daily" id="daily" />
                                      <p className="font-semibold">{t('income_type_daily')}</p>
                                  </Label>
                                  <Label htmlFor="mixed" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer">
                                      <RadioGroupItem value="mixed" id="mixed" />
                                      <p className="font-semibold">{t('income_type_mixed')}</p>
                                  </Label>
                              </RadioGroup>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
          </CardContent>
      </>
  );

  const steps = [
      { component: StepPhoneVerification, schema: phoneSchema },
      { component: StepCurrency, schema: currencySchema },
      { component: StepIncomeType, schema: incomeSchema },
  ];

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(schemas[currentStep]),
    defaultValues: {
        code: "",
        currency: "XOF",
        incomeType: "monthly",
    },
  });

  const { handleSubmit, trigger, getValues } = methods;

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: OnboardingFormValues) => {
    setCurrency(data.currency as Currency);
    console.log("Onboarding complete:", data);
    toast({
      title: t('onboarding_success_title'),
      description: t('onboarding_success_desc'),
    });
    router.push("/dashboard");
  };
  
  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
     <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <Progress value={progress} className="mb-8" />
            <Card className="border-0 shadow-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CurrentStepComponent />
                    </motion.div>
                </AnimatePresence>
            </Card>

            <div className="flex justify-between">
                {currentStep > 0 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                        {t('previous_button')}
                    </Button>
                )}
                <div className="flex-grow"></div>
                <Button type="button" onClick={handleNext}>
                    {currentStep === steps.length - 1 ? t('finish_button') : t('next_button')}
                </Button>
            </div>
        </form>
       </Form>
    </FormProvider>
  );
}


// A helper component to make zod validation work with react-hook-form's RadioGroup
const Label = ({ htmlFor, children, ...props }: { htmlFor: string, children: React.ReactNode } & React.ComponentPropsWithoutRef<'label'>) => {
    const methods = useForm();
    return (
        <FormLabel
            htmlFor={htmlFor}
            className={methods.formState.errors[htmlFor] ? 'border-destructive' : ''}
            {...props}
        >
            {children}
        </FormLabel>
    );
};