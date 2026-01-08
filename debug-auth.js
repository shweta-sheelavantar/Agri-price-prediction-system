// Debug script to test Supabase connection
// Run this in browser console to test authentication

console.log('=== AgriFriend Auth Debug ===');

// Check environment variables
console.log('VITE_AUTH_MODE:', import.meta.env.VITE_AUTH_MODE);
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Test Supabase connection
import { supabase } from './src/lib/supabase.ts';

async function testSupabase() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('user_profiles').select('count');
    
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful!');
    }
    
    // Check current session
    const { data: session } = await supabase.auth.getSession();
    console.log('Current session:', session);
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testSupabase();