// src/app/api/cinetpay/notify/route.ts
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import axios from 'axios';
import { collection, doc, getDoc, runTransaction, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Import client-side db
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';


// Helper to initialize Firebase Admin SDK.
// It ensures initialization only happens once.
const initializeFirebaseAdmin = () => {
    if (!admin.apps.length) {
        try {
            const serviceAccountString = process.env.FIREBASE_ADMIN_SDK;
            if (!serviceAccountString) {
                throw new Error('The FIREBASE_ADMIN_SDK environment variable is not set.');
            }
            const serviceAccount = JSON.parse(serviceAccountString);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (error: any) {
            console.error('Firebase Admin SDK initialization error:', error.message);
        }
    }
    return admin;
};


export async function POST(request: Request) {
  const API_KEY = process.env.CINETPAY_API_KEY;
  const SITE_ID = process.env.CINETPAY_SITE_ID;

  if (!API_KEY || !SITE_ID) {
    console.error("CinetPay notify route: API Key or Site ID is not defined.");
    return NextResponse.json({ error: "Configuration du serveur de paiement incomplète." }, { status: 500 });
  }

  try {
    const adminApp = initializeFirebaseAdmin();
    const adminDb = getAdminFirestore(adminApp);
    
    const { cpm_trans_id } = await request.json();

    if (!cpm_trans_id) {
      console.warn("CinetPay notify: Received request without cpm_trans_id.");
      return NextResponse.json({ error: "ID de transaction manquant" }, { status: 400 });
    }
    
    console.log(`CinetPay notify: Processing transaction ${cpm_trans_id}`);
    
    // Check status on CinetPay using a direct API call
    const checkStatusResponse = await axios.post('https://api-checkout.cinetpay.com/v2/payment/check', {
        apikey: API_KEY,
        site_id: SITE_ID,
        transaction_id: cpm_trans_id,
    });
    
    const { data, message, code } = checkStatusResponse.data;

    if (code !== '00' || !data) {
      console.error(`CinetPay checkPayStatus failed for ${cpm_trans_id}: ${message}`);
      // Don't update transaction here as we might not know the user ID
      return NextResponse.json({ success: false, message: `Could not verify transaction: ${message}`});
    }

    const { amount, currency, metadata, status } = data;
    const userId = metadata; // We assume metadata stores the userId

    if (!userId) {
        console.error(`CinetPay notify: No userId found in metadata for transaction ${cpm_trans_id}.`);
        return NextResponse.json({ success: false, message: 'User ID is missing from transaction metadata.' });
    }

    if (status === 'ACCEPTED') {
      console.log(`CinetPay notify: Transaction ${cpm_trans_id} ACCEPTED. Updating user subscription.`);
      const userRef = adminDb.collection('users').doc(userId);
      const plan = data.description.includes('premium') ? 'premium' : 'business';
      
      await updateDoc(userRef, {
        'profile.subscriptionStatus': 'active',
        'profile.subscriptionPlan': plan,
      });

      console.log(`Subscription for user ${userId} to plan ${plan} was successful.`);

    } else {
        console.log(`CinetPay notify: Payment for transaction ${cpm_trans_id} has status: ${status}.`);
    }

    // Acknowledge receipt to CinetPay
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('CinetPay Webhook Error:', error.message, error.stack);
    // Return a generic error to avoid exposing implementation details
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
