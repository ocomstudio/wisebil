// src/app/actions/check-subscription.ts
'use server';

import admin from 'firebase-admin';
import { headers } from 'next/headers';
import type { UserData } from '@/context/user-context';

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

const TRIAL_PERIOD_DAYS = 28;

export async function checkUserSubscriptionStatus(): Promise<{ isActive: boolean }> {
  // Temporarily return true to allow all users to access enterprise features during launch.
  return { isActive: true };

  /*
  // Original logic to be restored later
  try {
    const adminApp = initializeFirebaseAdmin();
    const auth = adminApp.auth();
    const db = adminApp.firestore();

    const authorization = headers().get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return { isActive: false };
    }
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    if (!userId) {
      return { isActive: false };
    }

    const userDocRef = db.collection('users').doc(userId);
    const docSnap = await userDocRef.get();

    if (!docSnap.exists) {
      return { isActive: false };
    }

    const userData = docSnap.data() as UserData;
    const profile = userData.profile;

    if (profile?.subscriptionStatus === 'active') {
      return { isActive: true };
    }

    const trialStartDate = profile?.trialStartDate ? new Date(profile.trialStartDate) : null;
    if (!trialStartDate) {
      return { isActive: false };
    }
    
    const today = new Date();
    const timeDiff = today.getTime() - trialStartDate.getTime();
    const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    return { isActive: daysPassed < TRIAL_PERIOD_DAYS };

  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { isActive: false };
  }
  */
}
