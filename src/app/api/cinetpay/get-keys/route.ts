// src/app/api/cinetpay/get-keys/route.ts
import { NextResponse } from 'next/server';
import { auth as adminAuth, isFirebaseAdminInitialized } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  // Check if Firebase Admin is initialized first. If not, server is misconfigured.
  if (!isFirebaseAdminInitialized) {
    console.error('[API] Firebase Admin SDK is not initialized. Check server environment variables.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const authorization = headers().get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];
    
    // Verify the ID token to ensure the request is from an authenticated user.
    await adminAuth.verifyIdToken(idToken);
    
    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;

    if (!apiKey || !siteId) {
      console.error("CinetPay API Key or Site ID is not defined in environment variables.");
      return NextResponse.json({ error: "Les clés de paiement ne sont pas configurées sur le serveur." }, { status: 500 });
    }

    return NextResponse.json({ apiKey, siteId });

  } catch (error: any) {
    console.error('[API] Error in get-keys route:', error.message);
    if (error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Unauthorized: Token has expired.' }, { status: 401 });
    }
    // Generic error for other auth issues to avoid exposing details
    return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
  }
}
