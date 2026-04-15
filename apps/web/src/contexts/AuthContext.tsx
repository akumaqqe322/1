import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthState } from '../types/auth';
import { api } from '../lib/api';

interface AuthContextType extends AuthState {
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Stable mock emails for dev/demo
const MOCK_EMAILS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'admin@firm.com',
  [UserRole.LAWYER]: 'lawyer@firm.com',
  [UserRole.PARTNER]: 'partner@client.com',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const syncUser = async (email: string) => {
    try {
      // We pass the email in the x-user-id header to resolve the real user from DB
      const response = await api.get('/users/me', {
        headers: { 'x-user-id': email }
      });
      const user = response.data;
      
      // Map backend role code back to frontend UserRole enum if needed
      // Assuming they match or are handled by the type
      const mappedUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.code.toUpperCase() as UserRole,
      };

      localStorage.setItem('mock_email', email);
      setState({
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to sync mock user:', error);
      logout();
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('mock_email');
    if (savedEmail) {
      syncUser(savedEmail);
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (role: UserRole) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const email = MOCK_EMAILS[role];
    await syncUser(email);
  };

  const logout = () => {
    localStorage.removeItem('mock_email');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
