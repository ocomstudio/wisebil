// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// Check if the SDK has already been initialized
if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.FIREBASE_ADMIN_SDK;
    if (!serviceAccountString) {
      throw new Error('The FIREBASE_ADMIN_SDK environment variable is not set. The application will not be able to function correctly in a server environment.');
    }
    
    // Clean the string if it's quoted
    const cleanedServiceAccountString = serviceAccountString.startsWith('"') && serviceAccountString.endsWith('"')
      ? serviceAccountString.substring(1, serviceAccountString.length - 1)
      : serviceAccountString;

    const serviceAccount = JSON.parse(cleanedServiceAccountString);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");

  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // You might want to throw the error in a production environment
    // to prevent the server from starting with a misconfiguration.
    // For now, we'll log it.
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
