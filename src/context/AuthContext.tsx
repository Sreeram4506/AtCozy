import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authClient } from '../lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup';
  login: (email: string, pass: string) => Promise<any>;
  signup: (name: string, email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  loginSocial: (provider: 'google' | 'github') => Promise<void>;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  switchAuthMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Use session from Better Auth
  const { data: session } = authClient.useSession();

  const user: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as any).role || 'user',
  } : null;

  const login = async (email: string, pass: string) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password: pass,
    });
    if (error) throw error;
    setIsAuthModalOpen(false);
    return data;
  };

  const signup = async (name: string, email: string, pass: string) => {
    const { error } = await authClient.signUp.email({
      email,
      password: pass,
      name,
    });
    
    if (error) {
      throw new Error(error.message || 'Signup failed');
    }
    
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    await authClient.signOut();
  };
  
  const updateProfile = async (data: { name?: string; email?: string }) => {
    const { error } = await authClient.updateUser(data);
    if (error) throw error;
  };

  const loginSocial = async (provider: 'google' | 'github') => {
    await authClient.signIn.social({
      provider,
      callbackURL: window.location.origin
    });
  };

  const openAuthModal = useCallback((mode?: 'login' | 'signup') => {
    if (mode) setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const switchAuthMode = useCallback(() => {
    setAuthMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authMode,
        login,
        signup,
        logout,
        updateProfile,
        loginSocial,
        openAuthModal,
        closeAuthModal,
        switchAuthMode,
      }}
    >
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

