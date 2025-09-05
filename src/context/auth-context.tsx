// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, updateProfile, UserCredential, sendEmailVerification as firebaseSendEmailVerification, sendPasswordResetEmail, confirmPasswordReset, EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import type { Currency } from './locale-context';
import type { UserData } from './user-context';


export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatar: string | null;
  phone?: string | null;
  profileComplete?: boolean;
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'inactive';
  hasCompletedTutorial?: boolean;
  emailVerified?: boolean;
}

type SignupFunction = (
  email: string,
  password: string,
  profileData: { fullName: string; phone: string, currency: Currency }
) => Promise<UserCredential>;

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  fullUserData: UserData | null;
  isLoading: boolean;
  loginWithEmail: typeof signInWithEmailAndPassword;
  signupWithEmail: SignupFunction;
  loginWithGoogle: () => Promise<{ isNewUser: boolean; user: FirebaseUser }>;
  logout: () => Promise<void>;
  updateUser: (newUserData: Partial<Omit<User, 'uid'>>) => Promise<void>;
  updateUserEmail: (currentPassword: string, newEmail: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  sendPasswordResetEmail: typeof sendPasswordResetEmail;
  confirmPasswordReset: typeof confirmPasswordReset;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [fullUserData, setFullUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const safeFunction = useCallback(<T extends (...args: any[]) => any>(fn: T): T => {
    return ((...args: Parameters<T>) => {
      if (isLoading) {
        console.warn("Auth context not ready, function call prevented.");
        return Promise.reject(new Error("Authentication service is not ready."));
      }
      return fn(...args);
    }) as T;
  }, [isLoading]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(db, 'users', fbUser.uid);
        
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          const data = docSnap.data() as UserData | undefined;
          setFullUserData(data || null);

          const profileData = data?.profile;
          
          const combinedUser: User = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            avatar: profileData?.avatar || fbUser.photoURL, // Prioritize Firestore avatar
            emailVerified: fbUser.emailVerified,
            ...profileData
          };

          if (!docSnap.exists() || !profileData) {
              combinedUser.profileComplete = false;
              combinedUser.subscriptionStatus = 'inactive';
              combinedUser.hasCompletedTutorial = false;
          }
          
          setUser(combinedUser);
          setIsLoading(false);
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            setIsLoading(false);
        });

        return () => unsubscribeDoc(); // Unsubscribe from doc listener when auth state changes
      } else {
        setFirebaseUser(null);
        setUser(null);
        setFullUserData(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Unsubscribe from auth listener on cleanup
  }, []);
  
  const signupWithEmail: SignupFunction = async (email, password, { fullName, phone, currency }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user: fbUser } = userCredential;

    await updateProfile(fbUser, { displayName: fullName });
    
    const userDocRef = doc(db, 'users', fbUser.uid);
    const profileData: Omit<User, 'uid' | 'avatar' | 'email' | 'displayName' | 'emailVerified'> = {
      phone,
      subscriptionStatus: 'inactive',
      profileComplete: true,
      hasCompletedTutorial: false,
    };
    
    await setDoc(userDocRef, { 
      profile: { 
        ...profileData, 
        avatar: null,
        email: fbUser.email,
        displayName: fullName
      },
      preferences: {
        currency: currency,
        language: 'en' // Default language
      }
    }, { merge: true });

    return userCredential;
  };
  
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const userDocRef = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists() && docSnap.data().profile?.profileComplete) {
      return { isNewUser: false, user: result.user };
    } else {
      const profileData: Partial<User> = {
        email: result.user.email,
        displayName: result.user.displayName,
        avatar: result.user.photoURL,
        profileComplete: true,
        subscriptionStatus: 'inactive',
        phone: result.user.phoneNumber,
        hasCompletedTutorial: false,
        emailVerified: true,
      };
      await setDoc(userDocRef, { profile: profileData, preferences: { currency: 'USD', language: 'en'} }, { merge: true });
      return { isNewUser: true, user: result.user };
    }
  }

  const logout = () => signOut(auth);

  const updateUser = async (newUserData: Partial<Omit<User, 'uid'>>) => {
    if(user && firebaseUser) {
        // Update display name in Firebase Auth if it's changed
        if(newUserData.displayName && newUserData.displayName !== user.displayName) {
            await updateProfile(firebaseUser, {
                displayName: newUserData.displayName,
            });
        }
        
        // Update user data in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        // We need to merge the new data with the existing profile data
        const docSnap = await getDoc(userDocRef);
        const existingProfile = docSnap.data()?.profile || {};
        const updatedProfile = { ...existingProfile, ...newUserData };
        
        await updateDoc(userDocRef, { profile: updatedProfile });
    }
  };

  const reauthenticate = async (password: string) => {
    if (!firebaseUser || !firebaseUser.email) throw new Error("User not found or email is missing.");
    const credential = EmailAuthProvider.credential(firebaseUser.email, password);
    await reauthenticateWithCredential(firebaseUser, credential);
  };
  
  const updateUserEmail = async (currentPassword: string, newEmail: string) => {
    if (!firebaseUser) throw new Error("User not found.");
    await reauthenticate(currentPassword);
    await updateEmail(firebaseUser, newEmail);
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userDocRef, { 'profile.email': newEmail });
    await firebaseSendEmailVerification(firebaseUser);
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!firebaseUser) throw new Error("User not found.");
    await reauthenticate(currentPassword);
    await updatePassword(firebaseUser, newPassword);
  };

  const sendVerificationEmail = async () => {
    if (firebaseUser) {
      await firebaseSendEmailVerification(firebaseUser);
    } else {
      throw new Error("No user is currently signed in.");
    }
  };
  
  const value: AuthContextType = {
    user,
    firebaseUser,
    fullUserData,
    isLoading,
    loginWithEmail: safeFunction((...args) => signInWithEmailAndPassword(auth, ...args)),
    signupWithEmail: safeFunction(signupWithEmail),
    loginWithGoogle: safeFunction(loginWithGoogle),
    logout: safeFunction(logout),
    updateUser: safeFunction(updateUser),
    updateUserEmail: safeFunction(updateUserEmail),
    updateUserPassword: safeFunction(updateUserPassword),
    sendVerificationEmail: safeFunction(sendVerificationEmail),
    sendPasswordResetEmail: safeFunction((...args) => sendPasswordResetEmail(auth, ...args)),
    confirmPasswordReset: safeFunction((...args) => confirmPasswordReset(auth, ...args)),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
