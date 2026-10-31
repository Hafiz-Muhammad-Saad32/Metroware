import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, signupRequest } from '../services/authService';
import { SessionUser } from '../types';
import { storage } from '../utils/storage';

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: SessionUser) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);
const KEY = 'metroware_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.get(KEY);
        if (saved) setUser(JSON.parse(saved).user);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const save = async (data: { token: string; user: SessionUser }) => {
    await storage.set(KEY, JSON.stringify(data));
    setUser(data.user);
  };

  const login = async (email: string, password: string) =>
    save(await loginRequest(email, password));

  const signup = async (name: string, email: string, password: string) =>
    save(await signupRequest(name, email, password));

  const logout = async () => {
    await storage.remove(KEY);
    setUser(null);
  };

  // profile update ke baad naya data session mein bhi rakho, token wahi rahe
  const updateUser = async (u: SessionUser) => {
    const saved = await storage.get(KEY);
    const token = saved ? JSON.parse(saved).token : '';
    await storage.set(KEY, JSON.stringify({ token, user: u }));
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}