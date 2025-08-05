// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

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
  updateUser: (newUserData: Partial<User>) => void; // This will need to be implemented with Firestore later
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        // In a real app, you would fetch profile data from Firestore here
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || 'Wisebil User',
          avatar: fbUser.photoURL
        });
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  const logout = () => signOut(auth);

  const updateUser = (newUserData: Partial<User>) => {
    // This will be implemented with Firestore in the next step.
    // For now, we can update the local state for visual feedback.
    if(user){
      setUser(prev => prev ? {...prev, ...newUserData} : null);
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
