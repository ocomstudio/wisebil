// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatar: string | null;
  phone?: string | null;
  profileComplete?: boolean;
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  loginWithEmail: typeof signInWithEmailAndPassword;
  signupWithEmail: typeof createUserWithEmailAndPassword;
  loginWithGoogle: () => Promise<{ isNewUser: boolean; user: FirebaseUser }>;
  logout: () => Promise<void>;
  updateUser: (newUserData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(db, 'users', fbUser.uid);
        
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists() && docSnap.data().profile) {
              setUser({ uid: fbUser.uid, ...docSnap.data().profile });
          } else {
               // This case handles initial user creation before profile completion
               const profileData = {
                  email: fbUser.email,
                  displayName: fbUser.displayName || 'Wisebil User',
                  avatar: fbUser.photoURL,
                  profileComplete: false,
                  subscriptionStatus: 'inactive'
               };
               setUser({ uid: fbUser.uid, ...profileData });
          }
          setIsLoading(false);
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            setIsLoading(false);
        });

        return () => unsubscribeDoc(); // Unsubscribe from doc listener when auth state changes
      } else {
        setFirebaseUser(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Unsubscribe from auth listener on cleanup
  }, []);
  
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const userDocRef = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists() && docSnap.data().profile?.profileComplete) {
      return { isNewUser: false, user: result.user };
    } else {
      const profileData = {
        email: result.user.email,
        displayName: result.user.displayName,
        avatar: result.user.photoURL,
        profileComplete: false,
        subscriptionStatus: 'inactive'
      };
      await setDoc(userDocRef, { profile: profileData }, { merge: true });
      return { isNewUser: true, user: result.user };
    }
  }

  const logout = () => signOut(auth);

  const updateUser = async (newUserData: Partial<User>) => {
    if(user && firebaseUser) {
        const updatedLocalUser = { ...user, ...newUserData };
        setUser(updatedLocalUser);
        
        // Update Firebase Auth profile if display name or avatar changes
        if(newUserData.displayName || newUserData.avatar) {
            await updateProfile(firebaseUser, {
                displayName: updatedLocalUser.displayName,
                photoURL: updatedLocalUser.avatar
            });
        }
        
        // Update Firestore profile
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { profile: updatedLocalUser }, { merge: true });
    }
  };
  
  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    loginWithEmail: signInWithEmailAndPassword.bind(null, auth),
    signupWithEmail: (email, password) => {
      // This ensures profileComplete is set to true for email sign-ups
      return createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const profileData = {
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            avatar: userCredential.user.photoURL,
            profileComplete: true,
            subscriptionStatus: 'inactive'
        };
        await setDoc(userDocRef, { profile: profileData }, { merge: true });
        return userCredential;
      });
    },
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
