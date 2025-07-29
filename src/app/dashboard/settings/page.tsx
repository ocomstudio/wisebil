// src/app/dashboard/settings/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, EyeOff, FileText, Info, Lock, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/context/settings-context";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const profileSchema = z.object({
  fullName: z.string().min(2, "Le nom est requis."),
  email: z.string().email("Adresse e-mail invalide."),
  phone: z.string().min(9, "Numéro de téléphone invalide."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { settings, updateSettings, checkPin } = useSettings();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "John Doe",
      email: "john.doe@example.com",
      phone: "+221 77 123 45 67",
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    console.log("Profile updated:", data);
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées.",
    });
  };
  
  const handleTogglePinLock = (isChecked: boolean) => {
    if (isChecked) {
      // Logic to enable PIN lock
      if (!settings.pin) {
        const newPin = prompt("Veuillez définir un nouveau code PIN à 4 chiffres.");
        if (newPin && /^\d{4}$/.test(newPin)) {
          updateSettings({ isPinLockEnabled: true, pin: newPin });
          toast({ title: "Verrouillage par code PIN activé." });
        } else {
          toast({ variant: "destructive", title: "Code PIN invalide. Le PIN doit contenir 4 chiffres." });
        }
      } else {
         updateSettings({ isPinLockEnabled: true });
         toast({ title: "Verrouillage par code PIN activé." });
      }
    } else {
      // Logic to disable PIN lock
      const pin = prompt("Veuillez entrer votre code PIN pour désactiver le verrouillage.");
      if (pin && checkPin(pin)) {
        updateSettings({ isPinLockEnabled: false, isBalanceHidden: false }); 
        toast({ title: "Verrouillage par code PIN désactivé." });
      } else if (pin !== null) {
        toast({ variant: "destructive", title: "Code PIN incorrect." });
      }
    }
  };

  const handleToggleBalanceVisibility = (isChecked: boolean) => {
    const pin = prompt("Veuillez entrer votre code PIN pour modifier ce paramètre.");
    if (pin && checkPin(pin)) {
        updateSettings({ isBalanceHidden: isChecked });
        toast({ title: `Visibilité du solde ${isChecked ? 'masquée par défaut' : 'affichée par défaut'}.` });
    } else if (pin !== null) {
        toast({ variant: "destructive", title: "Code PIN incorrect." });
    }
  };

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Paramètres</h1>
        <p className="text-muted-foreground">Gérez votre compte et vos préférences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://placehold.co/80x80.png" alt="User avatar" data-ai-hint="man avatar"/>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-7 w-7">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse e-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre@email.com" {...field} />
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
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+221 77 123 45 67" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">Sauvegarder les modifications</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>Protégez votre compte et vos informations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium flex items-center gap-2"><Lock className="h-4 w-4" /> Verrouillage par code PIN</h3>
              <p className="text-sm text-muted-foreground">Activez un code PIN pour sécuriser certaines actions.</p>
            </div>
            <Switch
              checked={settings.isPinLockEnabled}
              onCheckedChange={handleTogglePinLock}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium flex items-center gap-2"><EyeOff className="h-4 w-4" /> Masquer le solde par défaut</h3>
              <p className="text-sm text-muted-foreground">Cachez votre solde total sur le tableau de bord.</p>
            </div>
            <Switch
              checked={settings.isBalanceHidden}
              onCheckedChange={handleToggleBalanceVisibility}
              disabled={!settings.isPinLockEnabled}
            />
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>À propos</CardTitle>
          <CardDescription>Informations sur l'application et mentions légales.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Info className="h-5 w-5"/>
                <p>Wisebil est une application conçue et développée par <strong>Ocomstudio</strong>.</p>
            </div>
             <Separator />
            <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start p-0 h-auto" asChild>
                    <Link href="/privacy-policy">
                         <ShieldCheck className="mr-2 h-4 w-4"/> Politique de confidentialité
                    </Link>
                </Button>
                 <Button variant="ghost" className="w-full justify-start p-0 h-auto" asChild>
                    <Link href="/terms-of-service">
                        <FileText className="mr-2 h-4 w-4"/> Conditions d'utilisation
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
