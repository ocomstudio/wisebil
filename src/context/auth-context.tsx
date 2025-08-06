// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  loginWithEmail: typeof signInWithEmailAndPassword;
  signupWithEmail: typeof createUserWithEmailAndPassword;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (newUserData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(db, 'users', fbUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && docSnap.data().profile) {
            setUser({ uid: fbUser.uid, ...docSnap.data().profile });
        } else {
             const profileData = {
                email: fbUser.email,
                displayName: fbUser.displayName || 'Wisebil User',
                avatar: fbUser.photoURL
             };
             setUser({ uid: fbUser.uid, ...profileData });
             // Save this initial profile to Firestore
             try {
                await setDoc(userDocRef, { profile: profileData }, { merge: true });
             } catch(e) {
                console.error("Failed to save initial user profile", e);
             }
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  const logout = () => signOut(auth);

  const updateUser = async (newUserData: Partial<User>) => {
    if(user && firebaseUser) {
        const updatedLocalUser = { ...user, ...newUserData };
        setUser(updatedLocalUser);
        
        // Update Firebase Auth profile
        await updateProfile(firebaseUser, {
            displayName: updatedLocalUser.displayName,
            photoURL: updatedLocalUser.avatar
        });
        
        // Update Firestore profile
        const userDocRef = doc(db, 'users', user.uid);
        const profileToSave = {
            email: updatedLocalUser.email,
            displayName: updatedLocalUser.displayName,
            avatar: updatedLocalUser.avatar
        };
        await setDoc(userDocRef, { profile: profileToSave }, { merge: true });
    }
    console.log("User data update requested. Firestore integration needed.", newUserData);
  };
  
  const value = {
    user,
    firebaseUser,
    isLoading,
    loginWithEmail: signInWithEmailAndPassword.bind(null, auth),
    signupWithEmail: createUserWithEmailAndPassword.bind(null, auth),
    loginWithGoogle,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <Skeleton className="h-screen w-screen" /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
