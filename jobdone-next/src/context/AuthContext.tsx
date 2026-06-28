'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type UserRole = 'worker' | 'client' | null;

interface AuthContextType {
  user: any; // Define properly if user object is known
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  login: (token: string, role: UserRole, user?: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to manage cookies
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
};

const getCookie = (name: string) => {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Decode locally on mount
    const storedToken = getCookie('jobdone_token');
    
    if (storedToken) {
      try {
        const base64Url = storedToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        setToken(storedToken);
        setRole(payload.role || null);
        // User details might be fetched via api or decoded from JWT payload
        setUser(payload); 
      } catch (e) {
        console.error("Failed to decode token locally", e);
        logout();
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newRole: UserRole, newUser?: any) => {
    setToken(newToken);
    setRole(newRole);
    setUser(newUser || null);
    setCookie('jobdone_token', newToken);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    deleteCookie('jobdone_token');
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
