// src/app/api/cinetpay/initiate-payment/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { auth as adminAuth } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase-admin';

// Set this to true to enable payments, false to disable them temporarily.
const paymentsEnabled = false;

export async function POST(request: Request) {
    if (!paymentsEnabled) {
        return NextResponse.json({ error: 'Le service de paiement est temporairement indisponible.' }, { status: 503 });
    }
  
    try {
        const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(authToken);
        const userId = decodedToken.uid;
        
        // Fetch user profile from Firestore to get additional details
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
        }
        const userProfile = userDoc.data()?.profile;
        if (!userProfile) {
            return NextResponse.json({ error: 'User profile data is missing.' }, { status: 400 });
        }

        const {
            amount,
            currency,
            description,
        } = await request.json();
        
        if (!amount || !currency || !description) {
            return NextResponse.json({ error: 'Missing required fields: amount, currency, or description' }, { status: 400 });
        }
        
        const transaction_id = uuidv4();
        
        const [firstName, ...lastNameParts] = (userProfile.displayName || 'Utilisateur Wisebil').split(' ');
        const lastName = lastNameParts.join(' ') || 'Utilisateur';

        const data = {
            apikey: process.env.CINETPAY_API_KEY,
            site_id: process.env.CINETPAY_SITE_ID,
            transaction_id: transaction_id,
            amount: amount,
            currency: currency,
            description: description,
            customer_id: userId,
            customer_name: firstName,
            customer_surname: lastName,
            customer_email: userProfile.email || decodedToken.email,
            customer_phone_number: userProfile.phone || '000000000',
            // Using generic but valid data as fallback for required fields not in user profile
            customer_address: "Adresse par défaut",
            customer_city: "Dakar",
            customer_country: "SN",
            customer_state: "DK",
            customer_zip_code: "10000",
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=success&transaction_id=${transaction_id}`,
            notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cinetpay/notify`,
            channels: 'ALL'
        };

        const response = await axios.post(
            'https://api-checkout.cinetpay.com/v2/payment',
            data,
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.data.code === '201') {
            return NextResponse.json({ payment_url: response.data.data.payment_url });
        } else {
            console.error("CinetPay Error:", response.data);
            return NextResponse.json({ error: response.data.description || response.data.message, details: response.data }, { status: 500 });
        }

    } catch (error: any) {
        if (error.response) {
          console.error('CinetPay API Error:', error.response.data);
          return NextResponse.json({ error: 'CinetPay API error', details: error.response.data }, { status: 500 });
        }
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message || String(error) }, { status: 500 });
    }
}
