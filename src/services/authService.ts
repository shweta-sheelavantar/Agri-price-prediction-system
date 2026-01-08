import { supabase, UserProfile, AuthUser } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { mockAuthService } from './mockAuthService'

// Check if we should use mock auth (when Supabase is not properly configured)
const usesMockAuth = () => {
  const authMode = import.meta.env.VITE_AUTH_MODE
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  // Debug logging
  console.log('🔍 Auth Debug:', { 
    authMode, 
    supabaseUrl: supabaseUrl?.substring(0, 50) + '...', 
    hasSupabaseKey: !!supabaseKey,
    keyLength: supabaseKey?.length 
  })
  
  const shouldUseMock = authMode === 'mock' || 
    !supabaseUrl || 
    !supabaseKey ||
    supabaseUrl.includes('your-project') || 
    supabaseUrl.includes('demo-project') ||
    supabaseKey.includes('your-anon-key')
  
  console.log('🎯 Using Mock Auth:', shouldUseMock)
  return shouldUseMock
}

export class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string, phone: string, fullName: string) {
    console.log('🚀 SignUp attempt:', { email, phone, fullName })
    
    if (usesMockAuth()) {
      console.log('📱 Using mock auth for signup')
      return await mockAuthService.signUp(email, password, phone, fullName)
    }

    console.log('🔐 Using Supabase auth for signup')
    
    // Validate inputs
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address')
    }
    
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        }
      }
    })

    if (error) {
      console.error('❌ Supabase signup error:', error)
      throw error
    }
    
    console.log('✅ Signup successful:', data)
    return data
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    console.log('🔑 SignIn attempt:', { email })
    
    if (usesMockAuth()) {
      console.log('📱 Using mock auth for signin')
      return await mockAuthService.signIn(email, password)
    }

    console.log('🔐 Using Supabase auth for signin')
    
    // Validate inputs
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address')
    }
    
    if (!password) {
      throw new Error('Please enter your password')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Supabase signin error:', error)
      
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.')
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.')
      } else {
        throw error
      }
    }
    
    console.log('✅ Signin successful:', data)
    return data
  }

  // Sign in with phone (OTP)
  async signInWithPhone(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
    })

    if (error) throw error
    return data
  }

  // Verify OTP
  async verifyOtp(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })

    if (error) throw error
    return data
  }

  // Sign out
  async signOut() {
    if (usesMockAuth()) {
      return await mockAuthService.signOut()
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (usesMockAuth()) {
      return await mockAuthService.getCurrentUser()
    }

    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    if (usesMockAuth()) {
      return await mockAuthService.getCurrentSession()
    }

    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  // Create user profile
  async createUserProfile(userId: string, profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
    if (usesMockAuth()) {
      return await mockAuthService.createUserProfile(userId, profileData)
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()

    if (error) throw error
    return data[0]
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (usesMockAuth()) {
      return await mockAuthService.getUserProfile(userId)
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    console.log('🔄 AuthService.updateUserProfile called for:', userId);
    
    if (usesMockAuth()) {
      return await mockAuthService.updateUserProfile(userId, updates)
    }

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      console.log('📝 Profile does not exist, creating new profile');
      // Create profile if it doesn't exist
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            ...updates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()

      if (error) {
        console.error('❌ Error creating profile:', error);
        throw error;
      }
      console.log('✅ Profile created successfully');
      return data[0];
    } else {
      console.log('📝 Profile exists, updating');
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()

      if (error) {
        console.error('❌ Error updating profile:', error);
        throw error;
      }
      console.log('✅ Profile updated successfully');
      return data[0];
    }
  }

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (usesMockAuth()) {
      return mockAuthService.onAuthStateChange(callback)
    }

    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()