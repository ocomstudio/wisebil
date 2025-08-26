// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, updateProfile, UserCredential, sendEmailVerification, sendPasswordResetEmail, confirmPasswordReset, EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';
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
  hasCompletedTutorial?: boolean;
  emailVerified?: boolean;
}

type SignupFunction = (
  email: string,
  password: string,
  profileData: { fullName: string; phone: string }
) => Promise<UserCredential>;

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
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
          const profileData = docSnap.exists() ? docSnap.data().profile : null;
          const combinedUser: User = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            avatar: fbUser.photoURL,
            emailVerified: fbUser.emailVerified,
            ...profileData
          };

          if (!docSnap.exists() || !profileData) {
              // This case handles initial user creation before profile is set in Firestore
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
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Unsubscribe from auth listener on cleanup
  }, []);
  
  const signupWithEmail: SignupFunction = async (email, password, { fullName, phone }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user: fbUser } = userCredential;

    // Update Firebase Auth profile
    await updateProfile(fbUser, { displayName: fullName });
    
    // Create Firestore document with all the correct data
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
      // For new Google users, create a complete profile immediately.
      const profileData: Omit<User, 'uid'> = {
        email: result.user.email,
        displayName: result.user.displayName,
        avatar: result.user.photoURL,
        profileComplete: true, // Mark as complete
        subscriptionStatus: 'inactive',
        phone: result.user.phoneNumber,
        hasCompletedTutorial: false,
        emailVerified: true, // Google emails are considered verified
      };
      await setDoc(userDocRef, { profile: profileData }, { merge: true });
      return { isNewUser: true, user: result.user };
    }
  }

  const logout = () => signOut(auth);

  const updateUser = async (newUserData: Partial<Omit<User, 'uid'>>) => {
    if(user && firebaseUser) {
        const updatedLocalUser = { ...user, ...newUserData };
        setUser(updatedLocalUser);
        
        // Update Firebase Auth profile ONLY for displayName
        if(newUserData.displayName && newUserData.displayName !== user.displayName) {
            await updateProfile(firebaseUser, {
                displayName: newUserData.displayName,
            });
        }
        
        // Update Firestore profile with all data (including avatar)
        const userDocRef = doc(db, 'users', user.uid);
        // We only pass the fields that are being updated to avoid overwriting anything unexpectedly.
        await setDoc(userDocRef, { profile: newUserData }, { merge: true });
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
    // Also update firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userDocRef, { 'profile.email': newEmail });
    await sendEmailVerification(firebaseUser); // Send verification to new email
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!firebaseUser) throw new Error("User not found.");
    await reauthenticate(currentPassword);
    await updatePassword(firebaseUser, newPassword);
  };

  const sendVerificationEmail = async () => {
    if (firebaseUser) {
      await sendEmailVerification(firebaseUser);
    } else {
      throw new Error("No user is currently signed in.");
    }
  };
  
  const value: AuthContextType = {
    user,
    firebaseUser,
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
