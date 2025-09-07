// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

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

// Initialize Firestore without offline persistence for stability
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});


export { app, auth, db };
