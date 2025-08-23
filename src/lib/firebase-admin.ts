// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

try {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_ADMIN_SDK) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK as string);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      console.warn('FIREBASE_ADMIN_SDK is not set. Firebase Admin features will be disabled.');
    }
  }
  db = admin.firestore();
  auth = admin.auth();
} catch (error: any) {
  console.error('Firebase admin initialization error:', error.message);
  console.warn('Firebase Admin features will be disabled due to initialization error.');
  // Fallback to dummy implementations if initialization fails
  db = {} as admin.firestore.Firestore;
  auth = {} as admin.auth.Auth;
}

export { db, auth };
