// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

try {
  enableIndexedDbPersistence(db)
    .then(() => console.log("Firestore offline persistence enabled."))
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Firestore offline persistence failed: Multiple tabs open. Persistence will only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('Firestore offline persistence is not available in this browser.');
        } else {
            console.error("Firestore offline persistence error:", err);
        }
    });
} catch (error) {
    console.error("An error occurred during Firestore persistence setup:", error);
}


export { app, auth, db };
