
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from '../lib/safe-navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer';
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // Charger l'utilisateur via l'API (cookie httpOnly)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.user) setUser(data.user);
      } catch (err) {
        console.error("Erreur chargement user:", err);
      } finally {
        setIsReady(true);
      }
    };
    loadUser();
  }, []);

  // LOGIN
  const login = (userData: User) => {
    setUser(userData);
  };

  // LOGOUT
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors
    }
    setUser(null);
    router.push("/"); // redirection propre
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isReady,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
