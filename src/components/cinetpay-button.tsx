// src/components/cinetpay-button.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/locale-context";

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
    const { t } = useLocale();
    
    const handlePayment = () => {
        try {
            if (typeof window.CinetPay === 'undefined') {
                toast({ variant: 'destructive', title: "Erreur de Service", description: "Le service de paiement n'a pas pu être chargé. Veuillez rafraîchir la page." });
                return;
            }

            const apiKey = process.env.NEXT_PUBLIC_CINETPAY_API_KEY;
            const siteId = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID;

            if (!apiKey || !siteId) {
                console.error("CinetPay API Key or Site ID is missing.");
                toast({ variant: 'destructive', title: "Erreur de Configuration", description: "Les clés de paiement ne sont pas configurées. Veuillez contacter le support." });
                return;
            }
            
            if (!user) {
                toast({ variant: 'destructive', title: t('error_title'), description: t('login_required_for_subscription') });
                return;
            }

            let firstName = "Client";
            let lastName = "Wisebil";

            if (user.displayName) {
                const nameParts = user.displayName.split(' ');
                firstName = nameParts[0] || "Client";
                lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Utilisateur';
            }


            CinetPay.setConfig({
                apikey: apiKey,
                site_id: parseInt(siteId),
                notify_url: 'https://wisebil-596a8.web.app/api/cinetpay/notify/',
                mode: 'PRODUCTION',
            });

            CinetPay.getCheckout({
                transaction_id: uuidv4(),
                amount: amount,
                currency: currency,
                channels: 'ALL',
                description: description,
                // These fields are mandatory for card payments
                customer_name: firstName,
                customer_surname: lastName,
                customer_email: user.email || 'contact@wisebil.com',
                customer_phone_number: user.phone || '000000000',
                customer_address: "BP 0024",
                customer_city: "Dakar",
                customer_country: "SN",
                customer_state: "SN",
                customer_zip_code: "10000",
            });

            CinetPay.waitResponse(function(data: any) {
                if (data.status === "REFUSED") {
                    if (alert("Votre paiement a échoué")) {
                        window.location.reload();
                    }
                } else if (data.status === "ACCEPTED") {
                    if (alert("Votre paiement a été effectué avec succès")) {
                        window.location.reload();
                    }
                }
            });

            CinetPay.onError(function(err: any) {
                console.error("CinetPay Error:", err);
                if (alert("Une erreur technique est survenue. Veuillez réessayer.")) {
                    window.location.reload();
                }
            });

        } catch (error) {
            console.error("CinetPay SDK Critical Error:", error);
            if (alert("Impossible de lancer le module de paiement.")) {
                 window.location.reload();
            }
        }
    };

    return (
        <Button onClick={handlePayment} className="w-full">
            {buttonText}
        </Button>
    );
}
