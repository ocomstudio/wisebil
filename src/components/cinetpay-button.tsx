// src/components/cinetpay-button.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

// Extend window type to include CinetPay
declare global {
  interface Window {
    CinetPay: any;
  }
}

interface CinetPayButtonProps {
    amount: number;
    currency: string;
    description: string;
    buttonText: string;
}

export function CinetPayButton({ amount, currency, description, buttonText }: CinetPayButtonProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handlePayment = () => {
        if (!user) {
            toast({ variant: 'destructive', title: "Erreur", description: "Vous devez être connecté pour payer." });
            return;
        }

        if (typeof window.CinetPay === 'undefined') {
            toast({ variant: 'destructive', title: "Erreur", description: "Le service de paiement n'a pas pu être chargé." });
            return;
        }

        const [firstName, ...lastNameParts] = (user.displayName || 'Utilisateur Wisebil').split(' ');
        const lastName = lastNameParts.join(' ') || 'Utilisateur';

        try {
            window.CinetPay.setConfig({
                apikey: process.env.NEXT_PUBLIC_CINETPAY_API_KEY,
                site_id: process.env.NEXT_PUBLIC_CINETPAY_SITE_ID,
                notify_url: 'https://wisebil-596a8.web.app/api/cinetpay/notify', // You will need to create this notify URL handler
                mode: 'PRODUCTION',
            });

            window.CinetPay.getCheckout({
                transaction_id: uuidv4(),
                amount: amount,
                currency: currency,
                channels: 'ALL',
                description: description,
                customer_name: firstName,
                customer_surname: lastName,
                customer_email: user.email,
                customer_phone_number: user.phone || '000000000',
                customer_address: "N/A",
                customer_city: "N/A",
                customer_country: "SN", // Default country, can be dynamic
                customer_state: "DK", // Default state
                customer_zip_code: "10000",
            });

            window.CinetPay.waitResponse(function(data: any) {
                if (data.status === "REFUSED") {
                    toast({
                        variant: "destructive",
                        title: "Paiement Échoué",
                        description: "Votre paiement a échoué. Veuillez réessayer.",
                    });
                } else if (data.status === "ACCEPTED") {
                    toast({
                        title: "Paiement Réussi",
                        description: "Votre paiement a été effectué avec succès. Votre service sera activé.",
                    });
                    // Here you would typically call your backend to verify the transaction
                    // and update the user's subscription status.
                    router.push('/dashboard');
                }
            });

            window.CinetPay.onError(function(err: any) {
                console.error("CinetPay Error:", err);
                toast({
                    variant: "destructive",
                    title: "Erreur de Paiement",
                    description: "Une erreur technique est survenue. Veuillez réessayer.",
                });
            });

        } catch (error) {
            console.error("CinetPay SDK Error:", error);
            toast({ variant: 'destructive', title: "Erreur Critique", description: "Impossible de lancer le module de paiement." });
        }
    };

    return (
        <Button onClick={handlePayment} className="w-full">
            {buttonText}
        </Button>
    );
}
