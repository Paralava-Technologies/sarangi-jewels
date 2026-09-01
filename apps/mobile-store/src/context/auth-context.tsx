import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, setApiAccessToken } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('sarangi_access_token').then((token) => {
      setIsAuthenticated(!!token);
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.store.login({ email, password });
      await setApiAccessToken(res.data.accessToken);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login failed', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await setApiAccessToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
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
