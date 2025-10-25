// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;
let isFirebaseAdminInitialized = false;

try {
  if (process.env.FIREBASE_ADMIN_SDK && admin.apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    isFirebaseAdminInitialized = true;
  }

  if (admin.apps.length > 0) {
    db = admin.firestore();
    auth = admin.auth();
    isFirebaseAdminInitialized = true;
  } else {
    console.warn('Firebase Admin SDK not initialized. Check FIREBASE_ADMIN_SDK environment variable.');
    // Provide dummy implementations to prevent crashes
    db = {} as admin.firestore.Firestore;
    auth = {
        verifyIdToken: () => Promise.reject(new Error('Firebase Admin not initialized.'))
    } as unknown as admin.auth.Auth;
  }
} catch (error: any) {
  console.error('Firebase admin initialization error:', error.message);
  // Provide dummy implementations to prevent crashes
  db = {} as admin.firestore.Firestore;
  auth = {
      verifyIdToken: () => Promise.reject(new Error('Firebase Admin initialization failed.'))
  } as unknown as admin.auth.Auth;
}

export { db, auth, isFirebaseAdminInitialized };
