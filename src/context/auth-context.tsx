// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

interface User {
  fullName: string;
  email: string;
  phone: string;
  avatar: string; // Data URL for the image
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (userData?: Partial<User>) => void;
  logout: () => void;
  updateUser: (newUserData: Partial<User>) => void;
}

const AUTH_STORAGE_KEY = 'wisebil-auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const { isAuthenticated, user } = JSON.parse(storedAuth);
        if (isAuthenticated && user) {
          setIsAuthenticated(true);
          setUser(user);
        }
      }
    } catch (error) {
        console.error("Could not access sessionStorage:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const saveToSession = (data: {isAuthenticated: boolean, user: User | null}) => {
    try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Could not access sessionStorage:", error);
    }
  }

  const login = useCallback((userData: Partial<User> = {}) => {
    const newUser: User = {
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        avatar: userData.avatar || `https://placehold.co/80x80.png`,
    }
    setIsAuthenticated(true);
    setUser(newUser);
    saveToSession({ isAuthenticated: true, user: newUser });
  }, []);

  const logout = () => {
    try {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setIsAuthenticated(false);
        setUser(null);
    } catch (error) {
        console.error("Could not access sessionStorage:", error);
    }
  };

  const updateUser = useCallback((newUserData: Partial<User>) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        const updatedUser = { ...currentUser, ...newUserData };
        saveToSession({ isAuthenticated: true, user: updatedUser });
        return updatedUser;
    });
  }, []);


  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, updateUser }}>
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
