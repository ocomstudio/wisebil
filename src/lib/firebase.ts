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

const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

// Enable offline persistence
try {
    enableIndexedDbPersistence(db)
      .catch((err) => {
          if (err.code == 'failed-precondition') {
              // Multiple tabs open, persistence can only be enabled in one tab at a a time.
              console.warn("Firebase persistence failed: multiple tabs open.");
          } else if (err.code == 'unimplemented') {
              // The current browser does not support all of the features required to enable persistence.
              console.warn("Firebase persistence not supported in this browser.");
          }
      });
} catch(e) {
    console.error("Error enabling Firebase persistence: ", e)
}


export { app, auth, db };
