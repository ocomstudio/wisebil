// src/app/api/cinetpay/initiate-payment/route.ts
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

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
    try {
        const { plan, amount, currency, userId } = await request.json();

        if (!plan || !amount || !currency || !userId) {
            return NextResponse.json({ error: "Paramètres de paiement invalides." }, { status: 400 });
        }
        
        const adminApp = initializeFirebaseAdmin();
        const adminDb = getAdminFirestore(adminApp);
        
        const transactionId = uuidv4();

        // Storing the user ID in metadata is crucial for the notification webhook to identify the user.
        const metadata = userId; 

        // Create a transaction log in a secure, server-only collection
        await adminDb.collection('cinetpay_transactions').doc(transactionId).set({
            userId,
            plan,
            amount: Number(amount),
            currency,
            status: 'PENDING',
            metadata: metadata, // Save metadata for easier lookup
            createdAt: new Date().toISOString(),
        });
        
        return NextResponse.json({ transactionId });

    } catch (error: any) {
        console.error("Error creating payment transaction record:", error);
        return NextResponse.json({ error: "Erreur interne du serveur lors de l'initiation du paiement." }, { status: 500 });
    }
}
