// src/app/auth/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Check, Euro, DollarSign, Wallet } from "lucide-react";


const phoneSchema = z.object({
  code: z.string().length(6, "Le code doit comporter 6 chiffres."),
});
const currencySchema = z.object({
  currency: z.enum(["XOF", "EUR", "USD"]),
});
const incomeSchema = z.object({
    incomeType: z.enum(["monthly", "daily", "mixed"]),
});

const schemas = [phoneSchema, currencySchema, incomeSchema];

type OnboardingFormValues = z.infer<typeof phoneSchema> & z.infer<typeof currencySchema> & z.infer<typeof incomeSchema>;


const StepPhoneVerification = () => (
    <>
        <CardHeader>
            <CardTitle>Vérification du téléphone</CardTitle>
            <CardDescription>
                Nous avons envoyé un code à 6 chiffres à votre numéro. Veuillez le saisir ci-dessous.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <FormField
                name="code"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Code de vérification</FormLabel>
                        <FormControl>
                            <Input placeholder="123456" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <Button variant="link" size="sm" className="p-0 mt-2">
                Renvoyer le code
            </Button>
        </CardContent>
    </>
);

const StepCurrency = () => (
     <>
        <CardHeader>
            <CardTitle>Choisissez votre devise</CardTitle>
            <CardDescription>
                Sélectionnez la devise principale que vous utilisez.
            </CardDescription>
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
                                        <p className="font-semibold">Franc CFA</p>
                                        <p className="text-sm text-muted-foreground">XOF</p>
                                    </div>
                                </Label>
                                <Label htmlFor="eur" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer">
                                     <RadioGroupItem value="EUR" id="eur" />
                                     <Euro className="h-6 w-6" />
                                    <div>
                                        <p className="font-semibold">Euro</p>
                                        <p className="text-sm text-muted-foreground">EUR</p>
                                    </div>
                                </Label>
                                <Label htmlFor="usd" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer">
                                     <RadioGroupItem value="USD" id="usd" />
                                     <DollarSign className="h-6 w-6" />
                                    <div>
                                        <p className="font-semibold">US Dollar</p>
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
            <CardTitle>Type de revenu</CardTitle>
            <CardDescription>Comment percevez-vous principalement vos revenus ?</CardDescription>
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
                                    <p className="font-semibold">Mensuel</p>
                                </Label>
                                 <Label htmlFor="daily" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer">
                                    <RadioGroupItem value="daily" id="daily" />
                                    <p className="font-semibold">Journalier</p>
                                </Label>
                                 <Label htmlFor="mixed" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer">
                                    <RadioGroupItem value="mixed" id="mixed" />
                                    <p className="font-semibold">Mixte (Journalier et Mensuel)</p>
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

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(schemas[currentStep]),
    defaultValues: {
        code: "",
        currency: "XOF",
        incomeType: "monthly",
    },
  });

  const { handleSubmit, trigger } = methods;

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
    console.log("Onboarding complete:", data);
    toast({
      title: "Profil complété !",
      description: "Bienvenue sur votre tableau de bord.",
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
                        Précédent
                    </Button>
                )}
                <div className="flex-grow"></div>
                <Button type="button" onClick={handleNext}>
                    {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
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
