import { User, Session } from '@supabase/supabase-js'
import { UserProfile } from '../lib/supabase'

// Mock user data for demo purposes
const mockUsers: Array<{ email: string; password: string; profile: UserProfile }> = []

// Mock session storage
let currentSession: Session | null = null
let currentUser: User | null = null

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
      token_type: 'bearer',
      user: mockUser
    }

    currentSession = mockSession
    currentUser = mockUser

    // Store in localStorage for persistence
    localStorage.setItem('mock-session', JSON.stringify(mockSession))
    localStorage.setItem('mock-user', JSON.stringify(mockUser))

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
      token_type: 'bearer',
      user: mockUser
    }

    currentSession = mockSession
    currentUser = mockUser

    // Store in localStorage for persistence
    localStorage.setItem('mock-session', JSON.stringify(mockSession))
    localStorage.setItem('mock-user', JSON.stringify(mockUser))

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
      return { user: null, session: null }
    }
    throw new Error('Invalid OTP')
  }

  // Sign out
  async signOut() {
    currentSession = null
    currentUser = null
    localStorage.removeItem('mock-session')
    localStorage.removeItem('mock-user')
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
    const user = mockUsers.find(u => u.profile.id === userId)
    return user ? user.profile : null
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const userIndex = mockUsers.findIndex(u => u.profile.id === userId)
    if (userIndex !== -1) {
      mockUsers[userIndex].profile = {
        ...mockUsers[userIndex].profile,
        ...updates,
        updated_at: new Date().toISOString(),
      }
      return mockUsers[userIndex].profile
    }
    throw new Error('User not found')
  }

  // Listen to auth changes - mock implementation
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    // For mock, we'll just return a subscription object
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  }
}

export const mockAuthService = new MockAuthService()