import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  kickLogin: (kickUsername: string) => Promise<void>;
  demoLogin: (demoType: 'fan' | 'streamer-mota' | 'streamer-kancha' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('bb_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        if (!data.user) {
          localStorage.removeItem('bb_token');
        }
      } else {
        setUser(null);
        localStorage.removeItem('bb_token');
      }
    } catch (err) {
      console.warn('Failed to verify session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign in');
    }

    if (data.token) {
      localStorage.setItem('bb_token', data.token);
    }
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register');
    }

    if (data.token) {
      localStorage.setItem('bb_token', data.token);
    }
    setUser(data.user);
  };

  const kickLogin = async (kickUsername: string) => {
    const res = await fetch('/api/auth/kick-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ kickUsername }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to authenticate Kick account');
    }

    if (data.token) {
      localStorage.setItem('bb_token', data.token);
    }
    setUser(data.user);
  };

  const demoLogin = async (demoType: 'fan' | 'streamer-mota' | 'streamer-kancha' | 'admin') => {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ demoType }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Demo login failed');
    }

    if (data.token) {
      localStorage.setItem('bb_token', data.token);
    }
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('bb_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        kickLogin,
        demoLogin,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
