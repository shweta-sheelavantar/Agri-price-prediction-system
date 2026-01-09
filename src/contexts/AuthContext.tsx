import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  signUp: (email: string, password: string, phone: string, fullName: string) => Promise<{ user: User; session: Session; } | null>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<{ user: User; session: Session; } | null>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Legacy method for backward compatibility
  login: (mobileNumber: string, primaryCrop: string) => Promise<void>;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false for faster initial load

  useEffect(() => {
    console.log('⚡ AuthContext initializing instantly...');
    
    // Get initial session (non-blocking)
    authService.getCurrentSession().then((session) => {
      console.log('📋 Initial session:', session ? 'Found' : 'None');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 Loading profile for user:', session.user.id);
        // Load profile in background
        setTimeout(() => {
          loadUserProfile(session.user.id);
        }, 100);
      }
    }).catch((error) => {
      console.error('❌ Error getting initial session:', error);
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session ? 'User logged in' : 'User logged out');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Loading profile after auth change for user:', session.user.id);
          // Load profile in background
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 100);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      console.log('🧹 AuthContext cleanup');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('📥 Loading user profile for:', userId);
      const userProfile = await authService.getUserProfile(userId);
      console.log('✅ User profile loaded:', userProfile ? 'Success' : 'Not found');
      setProfile(userProfile);
      
      // If profile exists, update user metadata for easier access
      if (userProfile && user) {
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            full_name: userProfile.full_name,
            phone: userProfile.phone,
            profession: userProfile.profession,
            land_size: userProfile.land_size,
            land_unit: userProfile.land_unit,
            primary_crop: userProfile.primary_crop,
            crop_cycle: userProfile.crop_cycle,
            equipment: userProfile.equipment,
            location: userProfile.location
          }
        };
        setUser(updatedUser);
        console.log('✅ User metadata updated with profile data');
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      // Don't throw error - profile might not exist yet for new users
    }
  };

  const signUp = async (email: string, password: string, phone: string, fullName: string) => {
    setIsLoading(true);
    try {
      const result = await authService.signUp(email, password, phone, fullName);
      console.log('✅ Signup successful');
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.signIn(email, password);
      console.log('✅ Sign-in successful');
      // Auth state change listener will handle the rest
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithPhone = async (phone: string) => {
    setIsLoading(true);
    try {
      await authService.signInWithPhone(phone);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    setIsLoading(true);
    try {
      const result = await authService.verifyOtp(phone, token);
      console.log('✅ OTP verification successful');
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    console.log('🔄 UpdateProfile called, current user:', user?.id);
    
    if (!user) {
      console.error('❌ No user logged in for profile update');
      throw new Error('No user logged in');
    }
    
    try {
      console.log('📝 Updating profile for user:', user.id);
      const updatedProfile = await authService.updateUserProfile(user.id, updates);
      console.log('✅ Profile update successful:', updatedProfile);
      setProfile(updatedProfile);
      
      // Immediately update user metadata for instant access across the app
      if (updatedProfile) {
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            full_name: updatedProfile.full_name,
            phone: updatedProfile.phone,
            profession: updatedProfile.profession,
            land_size: updatedProfile.land_size,
            land_unit: updatedProfile.land_unit,
            primary_crop: updatedProfile.primary_crop,
            crop_cycle: updatedProfile.crop_cycle,
            equipment: updatedProfile.equipment,
            location: updatedProfile.location
          }
        };
        setUser(updatedUser);
        console.log('✅ User metadata immediately updated with new profile data');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  };

  // Legacy login method for backward compatibility
  const login = async (mobileNumber: string, _primaryCrop: string) => {
    // For now, we'll use phone authentication
    await signInWithPhone(mobileNumber);
  };

  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        signUp,
        signIn,
        signInWithPhone,
        verifyOtp,
        logout,
        updateProfile,
        isLoading,
        isAuthenticated,
        login, // Legacy method
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};