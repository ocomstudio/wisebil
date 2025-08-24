// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwsld5_98H5kslXgwtIOgOv3uDgVRJeYY",
  authDomain: "wisebil-596a8.firebaseapp.com",
  projectId: "wisebil-596a8",
  storageBucket: "wisebil-596a8.appspot.com",
  messagingSenderId: "1044516540078",
  appId: "1:1044516540078:web:b1d9c1f6a1b2c3d4e5f6a7"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = initializeAuth(app, {
    persistence: browserLocalPersistence
});

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
