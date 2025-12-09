import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (mobileNumber: string, primaryCrop: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('agrifriend_user');
    const sessionExpiry = localStorage.getItem('agrifriend_session_expiry');
    
    if (storedUser && sessionExpiry) {
      const expiryDate = new Date(sessionExpiry);
      if (expiryDate > new Date()) {
        setUser(JSON.parse(storedUser));
      } else {
        // Session expired
        localStorage.removeItem('agrifriend_user');
        localStorage.removeItem('agrifriend_session_expiry');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (mobileNumber: string, primaryCrop: string) => {
    // Simulate SMS sending and authentication
    console.log(`Sending SMS to ${mobileNumber}...`);
    
    // Mock user creation
    const newUser: User = {
      id: `user_${Date.now()}`,
      mobileNumber,
      primaryCrop,
      registrationDate: new Date(),
      lastLoginDate: new Date(),
      preferredLanguage: 'en',
      isActive: true,
      preferences: {
        notificationChannels: ['push', 'sms'],
        priceAlertFrequency: 'realtime',
        dashboardLayout: 'default',
        theme: 'light',
      },
    };

    // Set session expiry to 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    localStorage.setItem('agrifriend_user', JSON.stringify(newUser));
    localStorage.setItem('agrifriend_session_expiry', expiryDate.toISOString());
    
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('agrifriend_user');
    localStorage.removeItem('agrifriend_session_expiry');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
