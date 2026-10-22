import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { authApi } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  demoLogin: (role: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('solar_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('solar_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
        } else {
          localStorage.removeItem('solar_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Session verification failed, logging out');
        localStorage.removeItem('solar_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await authApi.login({ email, password: pass });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('solar_token', newToken);
        setToken(newToken);
        setUser(newUser);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login request error',
      };
    }
  };

  const register = async (name: string, email: string, pass: string, chosenRole: UserRole = 'user') => {
    try {
      const res = await authApi.register({ name, email, password: pass, role: chosenRole });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('solar_token', newToken);
        setToken(newToken);
        setUser(newUser);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration error',
      };
    }
  };

  const demoLogin = async (demoRole: UserRole): Promise<{ success: boolean; message?: string }> => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      admin: { email: 'admin@solarfarm.com', pass: 'admin123' },
      operator: { email: 'operator@solarfarm.com', pass: 'operator123' },
      user: { email: 'user@solarfarm.com', pass: 'user123' },
    };

    const target = creds[demoRole];
    return await login(target.email, target.pass);
  };

  const logout = () => {
    localStorage.removeItem('solar_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        role: user?.role || null,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
