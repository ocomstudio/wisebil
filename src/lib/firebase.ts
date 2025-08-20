// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwsld5_98H5kslXgwtIOgOv3uDgVRJeYY",
  authDomain: "wisebil-a1757.firebaseapp.com",
  databaseURL: "https://wisebil-default-rtdb.firebaseio.com",
  projectId: "wisebil",
  storageBucket: "wisebil.firebasestorage.app",
  messagingSenderId: "863943790691",
  appId: "1:863943790691:web:0ee38b99a42651f099a856"
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
