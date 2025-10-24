// src/lib/cinetpay.ts
'use server';

import type { User } from '@/context/auth-context';

interface PaymentData {
  amount: number;
  currency: string;
  plan: string;
}

interface CinetPayResponse {
  code: string;
  message: string;
  data?: {
    payment_url: string;
  };
}

export async function generateCinetPayLink(paymentData: PaymentData, user: User | null): Promise<{ success: boolean; url?: string; message: string }> {
  
  const apiKey = process.env.NEXT_PUBLIC_CINETPAY_API_KEY;
  const siteId = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wisebil.com';
  
  if (!apiKey || !siteId) {
    console.error('CinetPay API Key or Site ID is not configured.');
    return { success: false, message: 'Les informations de paiement ne sont pas configurées. Veuillez contacter le support.' };
  }

  if (!user) {
    return { success: false, message: 'User not authenticated.' };
  }

  const { amount, currency, plan } = paymentData;
  const nameParts = (user.displayName || 'Wisebil Client').trim().split(' ');
  const customer_name = nameParts.shift() || 'Client';
  const customer_surname = nameParts.join(' ') || 'Wisebil';

  const transaction_id = `wisebil-${plan}-${Date.now()}`;

  const data = {
    apikey: apiKey,
    site_id: siteId,
    transaction_id,
    amount,
    currency,
    description: `Abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} Wisebil`,
    return_url: `${appUrl}/dashboard/billing?status=success`,
    notify_url: `${appUrl}/api/cinetpay-notify`,
    channels: 'ALL',
    lang: 'fr',
    // Customer information
    customer_name: customer_name,
    customer_surname: customer_surname,
    customer_email: user.email || 'no-email@wisebil.com',
    customer_phone_number: user.phone || '',
    customer_address : "BP 0024",//addresse du client
    customer_city: "Antananarivo",// La ville du client
    customer_country : "CM",// le code ISO du pays
    customer_state : "CM",// le code ISO l'état
    customer_zip_code : "06510", // code postal
  };

  try {
    const response = await fetch(
      'https://api-checkout.cinetpay.com/v2/payment',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('CinetPay API Error (non-2xx response):', errorText);
        throw new Error(`CinetPay API responded with status ${response.status}`);
    }

    const responseData: CinetPayResponse = await response.json();

    if (responseData.code === '201' && responseData.data?.payment_url) {
      return { success: true, url: responseData.data.payment_url, message: 'Payment link generated.' };
    } else {
      console.error('CinetPay API Error:', responseData.message);
      return { success: false, message: responseData.message || 'Failed to generate payment link.' };
    }
  } catch (error: any) {
    console.error('Error calling CinetPay API:', error.message);
    return { success: false, message: 'An unexpected error occurred while contacting the payment service.' };
  }
}
