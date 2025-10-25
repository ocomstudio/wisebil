// src/app/api/cinetpay/notify/route.ts
import { NextResponse } from 'next/server';
import { CinetPay } from 'cinetpay-nodejs';
import { db } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  const API_KEY = process.env.CINETPAY_API_KEY;
  const SITE_ID = process.env.CINETPAY_SITE_ID;

  if (!API_KEY || !SITE_ID) {
    console.error("CinetPay notify route: API Key or Site ID is not defined.");
    return NextResponse.json({ error: "Configuration du serveur de paiement incomplète." }, { status: 500 });
  }

  const cp = new CinetPay({
    apikey: API_KEY,
    site_id: parseInt(SITE_ID, 10),
  });

  try {
    const { cpm_trans_id } = await request.json();

    if (!cpm_trans_id) {
      console.warn("CinetPay notify: Received request without cpm_trans_id.");
      return NextResponse.json({ error: "ID de transaction manquant" }, { status: 400 });
    }
    
    console.log(`CinetPay notify: Processing transaction ${cpm_trans_id}`);
    
    const transactionRef = db.collection('transactions').doc(cpm_trans_id);
    
    // Check status on CinetPay
    const { data } = await cp.checkPayStatus(cpm_trans_id);

    if (!data) {
        console.error(`CinetPay notify: No data returned from checkPayStatus for ${cpm_trans_id}`);
        await transactionRef.update({ status: 'ERROR_NO_DATA', updatedAt: new Date().toISOString() });
        return NextResponse.json({ success: false, message: 'Could not verify transaction.'});
    }

    const transactionDoc = await transactionRef.get();
    if (!transactionDoc.exists) {
        console.warn(`Transaction non trouvée dans la DB : ${cpm_trans_id}. CinetPay status: ${data.status}`);
        return NextResponse.json({ success: false, message: 'Transaction non trouvée.' });
    }
    const transactionData = transactionDoc.data();

    if (data.status === 'ACCEPTED') {
      console.log(`CinetPay notify: Transaction ${cpm_trans_id} ACCEPTED. Updating user subscription.`);
      const userRef = db.collection('users').doc(transactionData!.userId);
      
      await db.runTransaction(async (t) => {
          t.update(userRef, {
            'profile.subscriptionStatus': 'active',
            'profile.subscriptionPlan': transactionData!.plan,
          });
          t.update(transactionRef, {
              status: 'SUCCESS',
              cinetpayData: data,
              updatedAt: new Date().toISOString()
          });
      });

      console.log(`Subscription for user ${transactionData!.userId} to plan ${transactionData!.plan} was successful.`);

    } else {
        console.log(`CinetPay notify: Payment for transaction ${cpm_trans_id} has status: ${data.status}. Updating transaction doc.`);
        await transactionRef.update({
            status: 'FAILED',
            cinetpayData: data,
            updatedAt: new Date().toISOString()
        });
    }

    // Acknowledge receipt to CinetPay
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('CinetPay Webhook Error:', error.message, error.stack);
    // Return a generic error to avoid exposing implementation details
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
