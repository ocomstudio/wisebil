// src/app/api/cinetpay/initiate-payment/route.ts
import { NextResponse } from 'next/server';
import { CinetPay } from 'cinetpay-nodejs';
import { db } from '@/lib/firebase-admin';
import { pricing } from '@/app/dashboard/billing/page';
import type { UserData } from '@/context/user-context';


export async function POST(request: Request) {
  try {
    const API_KEY = process.env.CINETPAY_API_KEY;
    const SITE_ID = process.env.CINETPAY_SITE_ID;
    
    if (!API_KEY || !SITE_ID) {
      console.error("CinetPay API Key or Site ID is not defined in environment variables.");
      return NextResponse.json({ error: "Les clés CinetPay ne sont pas configurées sur le serveur." }, { status: 500 });
    }

    const cp = new CinetPay({
        apikey: API_KEY,
        site_id: parseInt(SITE_ID, 10),
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cinetpay/notify`,
    });

    const body = await request.json();
    const { userId, plan } = body;

    if (!userId || !plan || !pricing[plan as keyof typeof pricing]) {
      return NextResponse.json({ error: 'Données de paiement invalides.' }, { status: 400 });
    }

    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    const userData = userDoc.data() as UserData;
    const currency = userData.preferences?.currency || 'XOF';
    const amount = pricing[plan as keyof typeof pricing][currency];
    const transaction_id = `wisebil-${plan}-${userId}-${Date.now()}`;
    const nameParts = (userData.profile.displayName || 'Wisebil Client').trim().split(' ');
    const customer_name = nameParts.shift() || 'Client';
    const customer_surname = nameParts.join(' ') || 'Wisebil';

    const paymentData = {
      amount,
      currency,
      transaction_id,
      description: `Abonnement ${plan} Wisebil`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=success`,
      customer_name,
      customer_surname,
      customer_email: userData.profile.email || '',
      customer_phone_number: userData.profile.phone || '',
    };
    
    // We add the transaction to our DB before sending to CinetPay
    await db.collection('transactions').doc(transaction_id).set({
      ...paymentData,
      userId,
      plan,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
    
    const { payment_url, error } = await cp.generatePaymentLink(paymentData);
    
    if (error) {
        console.error("CinetPay Error:", error);
        throw new Error("Erreur lors de la génération du lien de paiement.");
    }
    
    return NextResponse.json({ payment_url });

  } catch (error: any) {
    console.error('[API] Error initiating payment:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur.' }, { status: 500 });
  }
}
