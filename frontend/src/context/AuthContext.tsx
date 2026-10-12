import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { 
    email: string; 
    password: string; 
    fullName: string; 
    phone?: string;
    pinCode: string;
    panNumber?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }) => Promise<void>;
  logout: () => void;
  demoLogin: (role: 'consumer' | 'business' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('capital_core_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then(u => setUser(u))
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('capital_core_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: Parameters<typeof api.register>[0]) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      localStorage.setItem('capital_core_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'consumer' | 'business' | 'admin') => {
    const creds = {
      consumer: { email: 'alex@capitalcore.com', pass: 'password123' },
      business: { email: 'business@capitalcore.com', pass: 'password123' },
      admin: { email: 'admin@capitalcore.com', pass: 'adminpassword' }
    }[role];

    await login(creds.email, creds.pass);
  };

  const logout = () => {
    localStorage.removeItem('capital_core_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
