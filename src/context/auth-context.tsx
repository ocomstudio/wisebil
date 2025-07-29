// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAuthState = sessionStorage.getItem('isAuthenticated');
      if (storedAuthState === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
        console.error("Could not access sessionStorage:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = () => {
    try {
        sessionStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
    } catch (error) {
        console.error("Could not access sessionStorage:", error);
    }
  };

  const logout = () => {
    try {
        sessionStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
    } catch (error) {
        console.error("Could not access sessionStorage:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
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
