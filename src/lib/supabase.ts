import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id: string
  email: string
  phone: string
  full_name: string
  profession: 'farmer' | 'agricultural_expert' | 'trader' | 'other'
  land_size: number
  land_unit: 'acre' | 'hectare'
  primary_crop: string
  crop_cycle: string
  equipment: string[]
  location: {
    state: string
    district: string
    village: string
  }
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  phone: string
  user_metadata: {
    full_name?: string
    phone?: string
  }
}