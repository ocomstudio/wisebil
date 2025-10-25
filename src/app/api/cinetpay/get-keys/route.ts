// src/app/api/cinetpay/get-keys/route.ts
import { NextResponse } from 'next/server';
import { auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    const authorization = headers().get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];
    
    // Verify the ID token to ensure the request is from an authenticated user.
    // This is a critical security step.
    await adminAuth.verifyIdToken(idToken);
    
    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;

    if (!apiKey || !siteId) {
      console.error("CinetPay API Key or Site ID is not defined in environment variables.");
      return NextResponse.json({ error: "Les clés de paiement ne sont pas configurées sur le serveur." }, { status: 500 });
    }

    return NextResponse.json({ apiKey, siteId });

  } catch (error: any) {
    console.error('[API] Error getting CinetPay keys:', error.message);
    return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
  }
}
