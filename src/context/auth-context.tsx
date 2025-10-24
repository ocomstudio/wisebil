// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult, updateProfile, UserCredential, sendEmailVerification as firebaseSendEmailVerification, sendPasswordResetEmail, confirmPasswordReset, EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import type { Currency, Language } from './locale-context';
import type { UserData } from './user-context';
import axios from 'axios';


export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatar: string | null;
  phone?: string | null;
  profileComplete?: boolean;
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'inactive';
  subscriptionPlan?: 'premium' | 'business';
  hasCompletedTutorial?: boolean;
  emailVerified?: boolean;
}

type SignupFunction = (
  email: string,
  password: string,
  profileData: { fullName: string; phone: string, currency: Currency, language: Language }
) => Promise<UserCredential>;

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  fullUserData: UserData | null;
  isLoading: boolean;
  loginWithEmail: typeof signInWithEmailAndPassword;
  signupWithEmail: SignupFunction;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (newUserData: Partial<Omit<User, 'uid'>>) => Promise<void>;
  updateUserEmail: (currentPassword: string, newEmail: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  sendPasswordResetEmail: typeof sendPasswordResetEmail;
  confirmPasswordReset: typeof confirmPasswordReset;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getLocaleFromCountry = (countryCode: string): { lang: Language, curr: Currency } => {
    const countryMap: Record<string, { lang: Language, curr: Currency }> = {
        'FR': { lang: 'fr', curr: 'EUR' }, 'BE': { lang: 'fr', curr: 'EUR' },
        'CH': { lang: 'fr', curr: 'EUR' }, 'LU': { lang: 'fr', curr: 'EUR' },
        'DE': { lang: 'de', curr: 'EUR' }, 'AT': { lang: 'de', curr: 'EUR' },
        'ES': { lang: 'es', curr: 'EUR' }, 'SN': { lang: 'fr', curr: 'XOF' },
        'CM': { lang: 'fr', curr: 'XOF' }, 'CI': { lang: 'fr', curr: 'XOF' },
        'TG': { lang: 'fr', curr: 'XOF' }, 'BJ': { lang: 'fr', curr: 'XOF' },
        'BF': { lang: 'fr', curr: 'XOF' }, 'NE': { lang: 'fr', curr: 'XOF' },
        'ML': { lang: 'fr', curr: 'XOF' }, 'GA': { lang: 'fr', curr: 'XOF' },
        'CG': { lang: 'fr', curr: 'XOF' }, 'CD': { lang: 'fr', curr: 'USD' },
        'TN': { lang: 'fr', curr: 'EUR' }, 'VN': { lang: 'vi', curr: 'VND' },
        'US': { lang: 'en', curr: 'USD' }, 'CA': { lang: 'en', curr: 'USD' },
        'GB': { lang: 'en', curr: 'EUR' },
    };
    return countryMap[countryCode.toUpperCase()] || { lang: 'en', curr: 'USD' };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [fullUserData, setFullUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRedirect, setIsLoadingRedirect] = useState(true);

  useEffect(() => {
    const handleGoogleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const userDocRef = doc(db, 'users', result.user.uid);
          const docSnap = await getDoc(userDocRef);

          if (!docSnap.exists() || !docSnap.data().profile?.profileComplete) {
            let userLocale: { lang: Language, curr: Currency } = { lang: 'en', curr: 'USD' };
            try {
              const response = await axios.get('https://ipapi.co/json/');
              const countryCode = response.data?.country_code;
              if (countryCode) {
                userLocale = getLocaleFromCountry(countryCode);
              }
            } catch (error) {
              console.warn("Could not detect user country for Google Sign-In, using defaults.", error);
            }

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
            await setDoc(userDocRef, { 
              profile: profileData, 
              preferences: { currency: userLocale.curr, language: userLocale.lang }
            }, { merge: true });
          }
        }
      } catch (error) {
        console.error("Firebase Redirect Result Error:", error);
      } finally {
        setIsLoadingRedirect(false);
      }
    };

    handleGoogleRedirectResult();
  }, []);

  useEffect(() => {
    if (isLoadingRedirect) return;

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
            avatar: profileData?.avatar || fbUser.photoURL,
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

        return () => unsubscribeDoc();
      } else {
        setFirebaseUser(null);
        setUser(null);
        setFullUserData(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [isLoadingRedirect]);
  
  const signupWithEmail: SignupFunction = async (email, password, { fullName, phone, currency, language }) => {
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
        language: language
      }
    });

    return userCredential;
  };
  
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  }

  const logout = () => signOut(auth);

  const updateUser = async (newUserData: Partial<Omit<User, 'uid'>>) => {
    if (user && firebaseUser) {
      if (newUserData.displayName && newUserData.displayName !== user.displayName) {
        await updateProfile(firebaseUser, {
          displayName: newUserData.displayName,
        });
      }
      
      const userDocRef = doc(db, 'users', user.uid);
      const updatePayload: { [key: string]: any } = {};
      Object.entries(newUserData).forEach(([key, value]) => {
        updatePayload[`profile.${key}`] = value;
      });

      await updateDoc(userDocRef, updatePayload);
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
    isLoading: isLoading || isLoadingRedirect,
    loginWithEmail: (...args) => signInWithEmailAndPassword(auth, ...args),
    signupWithEmail,
    loginWithGoogle,
    logout,
    updateUser,
    updateUserEmail,
    updateUserPassword,
    sendVerificationEmail,
    sendPasswordResetEmail: (...args) => sendPasswordResetEmail(auth, ...args),
    confirmPasswordReset: (...args) => confirmPasswordReset(auth, ...args),
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
