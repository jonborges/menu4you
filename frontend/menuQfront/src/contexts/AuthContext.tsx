import { createContext, useState, useContext, type ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userId: number | null;
  username: string | null;
  email: string | null;
  token: string | null;
  login: (token: string, userId: number, username: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [userId, setUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem('userId');
    return stored ? Number(stored) : null;
  });
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem('email'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  const login = (newToken: string, newUserId: number, newUsername: string, newEmail: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', String(newUserId));
    localStorage.setItem('username', newUsername);
    localStorage.setItem('email', newEmail);
    
    // Manter compatibilidade com código antigo
    localStorage.setItem('menuq_user_id', String(newUserId));
    
    setToken(newToken);
    setUserId(newUserId);
    setUsername(newUsername);
    setEmail(newEmail);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('menuq_user_id');
    
    setToken(null);
    setUserId(null);
    setUsername(null);
    setEmail(null);
    setIsLoggedIn(false);
    
    try { window.dispatchEvent(new CustomEvent('app:logout')); } catch {}
  };

  return <AuthContext.Provider value={{ isLoggedIn, userId, username, email, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
