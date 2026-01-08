// 🔍 AgriFriend Authentication Debug Script
// Run this in your browser console (F12) to diagnose auth issues

console.log('🚀 Starting AgriFriend Authentication Debug...\n');

// 1. Check Environment Variables
console.log('📋 Environment Variables:');
console.log('VITE_AUTH_MODE:', import.meta.env.VITE_AUTH_MODE);
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('VITE_SUPABASE_ANON_KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);
console.log('');

// 2. Test Supabase Connection
async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase Connection...');
  
  try {
    // Import Supabase client
    const { supabase } = await import('./src/lib/supabase.ts');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    } else {
      console.log('✅ Supabase connection successful!');
      return true;
    }
  } catch (err) {
    console.error('❌ Failed to test Supabase connection:', err);
    return false;
  }
}

// 3. Test Authentication Service
async function testAuthService() {
  console.log('🔐 Testing Authentication Service...');
  
  try {
    const { authService } = await import('./src/services/authService.ts');
    
    // Test getting current session
    const session = await authService.getCurrentSession();
    console.log('Current session:', session ? '✅ Active' : '❌ None');
    
    // Test getting current user
    const user = await authService.getCurrentUser();
    console.log('Current user:', user ? `✅ ${user.email}` : '❌ None');
    
    return true;
  } catch (err) {
    console.error('❌ Failed to test auth service:', err);
    return false;
  }
}

// 4. Test Database Tables
async function testDatabaseTables() {
  console.log('🗄️ Testing Database Tables...');
  
  try {
    const { supabase } = await import('./src/lib/supabase.ts');
    
    // Check if user_profiles table exists
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.error('❌ user_profiles table does not exist! Please run the SQL setup script.');
        return false;
      } else {
        console.error('❌ Database error:', error);
        return false;
      }
    } else {
      console.log('✅ user_profiles table exists');
      return true;
    }
  } catch (err) {
    console.error('❌ Failed to test database tables:', err);
    return false;
  }
}

// 5. Test Sample Authentication
async function testSampleAuth() {
  console.log('🧪 Testing Sample Authentication...');
  
  try {
    const { authService } = await import('./src/services/authService.ts');
    
    // Test with a sample email (this will fail, but we can see the error)
    try {
      await authService.signIn('test@example.com', 'testpassword');
    } catch (err) {
      if (err.message.includes('Invalid login credentials')) {
        console.log('✅ Authentication system is working (expected credential error)');
        return true;
      } else {
        console.error('❌ Unexpected auth error:', err);
        return false;
      }
    }
  } catch (err) {
    console.error('❌ Failed to test sample auth:', err);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🔍 Running comprehensive authentication diagnostics...\n');
  
  const results = {
    connection: await testSupabaseConnection(),
    authService: await testAuthService(),
    database: await testDatabaseTables(),
    sampleAuth: await testSampleAuth()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('Supabase Connection:', results.connection ? '✅ PASS' : '❌ FAIL');
  console.log('Auth Service:', results.authService ? '✅ PASS' : '❌ FAIL');
  console.log('Database Tables:', results.database ? '✅ PASS' : '❌ FAIL');
  console.log('Sample Auth:', results.sampleAuth ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your authentication system should be working.');
    console.log('If you\'re still having issues, try:');
    console.log('1. Clear browser cache and cookies');
    console.log('2. Check Supabase dashboard for any error logs');
    console.log('3. Verify email confirmation settings in Supabase Auth');
  } else {
    console.log('\n⚠️ Some tests failed. Please fix the issues above and try again.');
    console.log('\nCommon fixes:');
    console.log('1. Run the SQL setup script in Supabase SQL Editor');
    console.log('2. Check your .env file has correct Supabase credentials');
    console.log('3. Restart your development server after changing .env');
    console.log('4. Verify your Supabase project is active and accessible');
  }
  
  return allPassed;
}

// Auto-run the tests
runAllTests().catch(console.error);