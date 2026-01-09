import { User, Session } from '@supabase/supabase-js'
import { UserProfile } from '../lib/supabase'

// Mock user data for demo purposes
const mockUsers: Array<{ email: string; password: string; profile: UserProfile }> = []

// Mock session storage
let currentSession: Session | null = null
let currentUser: User | null = null
let authStateCallbacks: Array<(event: string, session: Session | null) => void> = []

// Helper function to trigger auth state change
const triggerAuthStateChange = (event: string, session: Session | null) => {
  console.log('🔄 Mock auth state change:', event, session ? 'User logged in' : 'User logged out');
  authStateCallbacks.forEach(callback => {
    try {
      callback(event, session);
    } catch (error) {
      console.error('❌ Error in auth state callback:', error);
    }
  });
};

export class MockAuthService {
  // Sign up with email and password
  async signUp(email: string, password: string, phone: string, fullName: string) {
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    // Create mock user
    const userId = `mock-user-${Date.now()}`
    const mockUser: User = {
      id: userId,
      email,
      phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      aud: 'authenticated',
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString(),
      phone_confirmed_at: new Date().toISOString(),
      confirmation_sent_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {
        full_name: fullName,
        phone: phone,
      },
      identities: [],
      factors: []
    }

    const mockProfile: UserProfile = {
      id: userId,
      email,
      phone,
      full_name: fullName,
      profession: 'farmer',
      land_size: 0,
      land_unit: 'acre',
      primary_crop: '',
      crop_cycle: '',
      equipment: [],
      location: {
        state: '',
        district: '',
        village: ''
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Store mock user
    mockUsers.push({ email, password, profile: mockProfile })

    // Create mock session
    const mockSession: Session = {
      access_token: `mock-token-${Date.now()}`,
      refresh_token: `mock-refresh-${Date.now()}`,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer' as const,
      user: mockUser
    }

    currentSession = mockSession
    currentUser = mockUser

    // Store in localStorage for persistence
    localStorage.setItem('mock-session', JSON.stringify(mockSession))
    localStorage.setItem('mock-user', JSON.stringify(mockUser))

    // Trigger auth state change
    setTimeout(() => {
      triggerAuthStateChange('SIGNED_UP', mockSession);
    }, 100);

    return { user: mockUser, session: mockSession }
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const user = mockUsers.find(u => u.email === email && u.password === password)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const mockUser: User = {
      id: user.profile.id,
      email: user.email,
      phone: user.profile.phone,
      created_at: user.profile.created_at,
      updated_at: user.profile.updated_at,
      aud: 'authenticated',
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString(),
      phone_confirmed_at: new Date().toISOString(),
      confirmation_sent_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {
        full_name: user.profile.full_name,
        phone: user.profile.phone,
      },
      identities: [],
      factors: []
    }

    const mockSession: Session = {
      access_token: `mock-token-${Date.now()}`,
      refresh_token: `mock-refresh-${Date.now()}`,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer' as const,
      user: mockUser
    }

    currentSession = mockSession
    currentUser = mockUser

    // Store in localStorage for persistence
    localStorage.setItem('mock-session', JSON.stringify(mockSession))
    localStorage.setItem('mock-user', JSON.stringify(mockUser))

    // Trigger auth state change
    setTimeout(() => {
      triggerAuthStateChange('SIGNED_IN', mockSession);
    }, 100);

    return { user: mockUser, session: mockSession }
  }

  // Sign in with phone (OTP) - mock implementation
  async signInWithPhone(phone: string) {
    // For demo, just return success
    return { user: null, session: null }
  }

  // Verify OTP - mock implementation
  async verifyOtp(phone: string, token: string) {
    // For demo, accept any 6-digit token
    if (token.length === 6) {
      // Create a mock user for phone authentication
      const userId = `mock-phone-user-${Date.now()}`;
      const mockUser: User = {
        id: userId,
        email: '',
        phone: phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: null,
        phone_confirmed_at: new Date().toISOString(),
        confirmation_sent_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {
          phone: phone,
        },
        identities: [],
        factors: []
      };

      const mockSession: Session = {
        access_token: `mock-phone-token-${Date.now()}`,
        refresh_token: `mock-phone-refresh-${Date.now()}`,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer' as const,
        user: mockUser
      };

      // Create a basic profile for phone user
      const mockProfile: UserProfile = {
        id: userId,
        email: '',
        phone: phone,
        full_name: '',
        profession: 'farmer',
        land_size: 0,
        land_unit: 'acre',
        primary_crop: '',
        crop_cycle: '',
        equipment: [],
        location: {
          state: '',
          district: '',
          village: ''
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store the user
      mockUsers.push({ email: '', password: '', profile: mockProfile });

      currentSession = mockSession;
      currentUser = mockUser;

      // Store in localStorage for persistence
      localStorage.setItem('mock-session', JSON.stringify(mockSession));
      localStorage.setItem('mock-user', JSON.stringify(mockUser));

      // Trigger auth state change
      setTimeout(() => {
        triggerAuthStateChange('SIGNED_IN', mockSession);
      }, 100);

      return { user: mockUser, session: mockSession };
    }
    throw new Error('Invalid OTP')
  }

  // Sign out
  async signOut() {
    currentSession = null
    currentUser = null
    localStorage.removeItem('mock-session')
    localStorage.removeItem('mock-user')
    
    // Trigger auth state change
    setTimeout(() => {
      triggerAuthStateChange('SIGNED_OUT', null);
    }, 100);
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (currentUser) return currentUser

    // Try to restore from localStorage
    const storedUser = localStorage.getItem('mock-user')
    if (storedUser) {
      currentUser = JSON.parse(storedUser)
      return currentUser
    }

    return null
  }

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    if (currentSession) return currentSession

    // Try to restore from localStorage
    const storedSession = localStorage.getItem('mock-session')
    if (storedSession) {
      const session = JSON.parse(storedSession)
      // Check if session is still valid
      if (session.expires_at > Math.floor(Date.now() / 1000)) {
        currentSession = session
        return currentSession
      } else {
        // Session expired, clean up
        localStorage.removeItem('mock-session')
        localStorage.removeItem('mock-user')
      }
    }

    return null
  }

  // Create user profile
  async createUserProfile(userId: string, profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
    const profile: UserProfile = {
      id: userId,
      ...profileData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Update the stored user profile
    const userIndex = mockUsers.findIndex(u => u.profile.id === userId)
    if (userIndex !== -1) {
      mockUsers[userIndex].profile = profile
    }

    return profile
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // First try to get from localStorage (persisted data)
    const storedProfile = localStorage.getItem(`mock-profile-${userId}`);
    if (storedProfile) {
      console.log('📋 Retrieved profile from localStorage for user:', userId);
      return JSON.parse(storedProfile);
    }
    
    // Fallback to in-memory storage
    const user = mockUsers.find(u => u.profile.id === userId);
    if (user) {
      console.log('📋 Retrieved profile from memory for user:', userId);
      return user.profile;
    }
    
    console.log('⚠️ No profile found for user:', userId);
    return null;
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    console.log('📝 Updating profile for user:', userId, updates);
    
    // Get existing profile or create new one
    let existingProfile = await this.getUserProfile(userId);
    
    const updatedProfile: UserProfile = {
      id: userId,
      email: updates.email || existingProfile?.email || '',
      phone: updates.phone || existingProfile?.phone || '',
      full_name: updates.full_name || existingProfile?.full_name || '',
      profession: updates.profession || existingProfile?.profession || 'farmer',
      land_size: updates.land_size ?? existingProfile?.land_size ?? 0,
      land_unit: updates.land_unit || existingProfile?.land_unit || 'acre',
      primary_crop: updates.primary_crop || existingProfile?.primary_crop || '',
      crop_cycle: updates.crop_cycle || existingProfile?.crop_cycle || '',
      equipment: updates.equipment || existingProfile?.equipment || [],
      location: updates.location || existingProfile?.location || { state: '', district: '', village: '' },
      created_at: existingProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Update in-memory storage
    const userIndex = mockUsers.findIndex(u => u.profile.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex].profile = updatedProfile;
    }
    
    // Persist to localStorage
    localStorage.setItem(`mock-profile-${userId}`, JSON.stringify(updatedProfile));
    console.log('✅ Profile saved to localStorage:', updatedProfile);
    
    return updatedProfile;
  }

  // Listen to auth changes - mock implementation
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    // Add callback to the list
    authStateCallbacks.push(callback);
    
    // Return subscription object that matches Supabase's interface
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = authStateCallbacks.indexOf(callback);
            if (index > -1) {
              authStateCallbacks.splice(index, 1);
            }
          }
        }
      }
    }
  }
}

export const mockAuthService = new MockAuthService()