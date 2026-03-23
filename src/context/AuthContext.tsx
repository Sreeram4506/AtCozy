import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup';
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  openAuthModal: (mode: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  switchAuthMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Mock successful login
    setUser({
      id: '1',
      email,
      name: email.split('@')[0],
    });
    setIsAuthModalOpen(false);
    return true;
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Mock successful signup
    setUser({
      id: '1',
      email,
      name,
    });
    setIsAuthModalOpen(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const openAuthModal = useCallback((mode: 'login' | 'signup') => {
    setAuthMode(mode);
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
