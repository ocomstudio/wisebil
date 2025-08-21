// src/app/api/cinetpay/initiate-payment/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { auth as adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(authToken);
        const userId = decodedToken.uid;
        const userEmail = decodedToken.email;
        const userName = decodedToken.name;

        const { amount, currency, description } = await request.json();

        if (!amount || !currency || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        const transaction_id = uuidv4();

        const data = {
            apikey: process.env.CINETPAY_API_KEY,
            site_id: process.env.CINETPAY_SITE_ID,
            transaction_id: transaction_id,
            amount: amount,
            currency: currency,
            description: description,
            customer_id: userId,
            customer_name: userName,
            customer_surname: '',
            customer_email: userEmail,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=success`,
            notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cinetpay/notify`,
        };

        const response = await axios.post(
            'https://api-checkout.cinetpay.com/v2/payment',
            data,
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.data.code === '201') {
            return NextResponse.json({ payment_url: response.data.data.payment_url });
        } else {
            console.error("CinetPay Error:", response.data.description);
            return NextResponse.json({ error: response.data.description }, { status: 500 });
        }

    } catch (error: any) {
        if (error.response) {
          console.error('CinetPay API Error:', error.response.data);
          return NextResponse.json({ error: 'CinetPay API error', details: error.response.data }, { status: 500 });
        }
        console.error('Internal Server Error:', error.message);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
