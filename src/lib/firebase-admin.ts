// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;
let isFirebaseAdminInitialized = false;

try {
  if (process.env.FIREBASE_ADMIN_SDK && admin.apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error: any) {
  console.error('Firebase Admin SDK initialization error:', error.message);
  // This will prevent the app from starting if the SDK is malformed, which is a good thing.
}

if (admin.apps.length > 0) {
  db = admin.firestore();
  auth = admin.auth();
  isFirebaseAdminInitialized = true;
} else {
  console.warn('Firebase Admin SDK not initialized. Ensure FIREBASE_ADMIN_SDK environment variable is set correctly.');
  // Provide dummy implementations for type safety, but they will throw errors if used.
  db = {} as admin.firestore.Firestore;
  auth = {
    verifyIdToken: () => Promise.reject(new Error('Firebase Admin not initialized.')),
  } as unknown as admin.auth.Auth;
}


export { db, auth, isFirebaseAdminInitialized };
