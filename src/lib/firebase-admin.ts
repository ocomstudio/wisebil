// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    // We need to parse the environment variable to get the JSON object
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_ADMIN_SDK as string
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
    // Throw an error to make it clear that the initialization has failed
    throw new Error('Could not initialize Firebase Admin SDK. Please check your environment variables.');
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
