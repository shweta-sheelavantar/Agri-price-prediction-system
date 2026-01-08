import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const AuthTest: React.FC = () => {
  const { user, profile, session, isAuthenticated, isLoading } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runDiagnostics = async () => {
    setIsRunningTests(true);
    const results: any = {};

    try {
      // Test 1: Environment Variables
      results.envVars = {
        authMode: import.meta.env.VITE_AUTH_MODE,
        hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        supabaseUrlPreview: import.meta.env.VITE_SUPABASE_URL?.substring(0, 50) + '...'
      };

      // Test 2: Current Session
      try {
        const currentSession = await authService.getCurrentSession();
        results.session = {
          exists: !!currentSession,
          userId: currentSession?.user?.id,
          email: currentSession?.user?.email
        };
      } catch (error: any) {
        results.session = { error: error.message };
      }

      // Test 3: Current User
      try {
        const currentUser = await authService.getCurrentUser();
        results.user = {
          exists: !!currentUser,
          id: currentUser?.id,
          email: currentUser?.email
        };
      } catch (error: any) {
        results.user = { error: error.message };
      }

      // Test 4: Database Connection (if user exists)
      if (user) {
        try {
          const userProfile = await authService.getUserProfile(user.id);
          results.profile = {
            exists: !!userProfile,
            fullName: userProfile?.full_name,
            profession: userProfile?.profession
          };
        } catch (error: any) {
          results.profile = { error: error.message };
        }
      }

      setTestResults(results);
    } catch (error: any) {
      console.error('Diagnostic error:', error);
      results.error = error.message;
      setTestResults(results);
    } finally {
      setIsRunningTests(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            🔍 AgriFriend Authentication Diagnostics
          </h1>

          {/* Current Status */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">Current Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Loading:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${isLoading ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                  {isLoading ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Authenticated:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${isAuthenticated ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">User:</span>
                <span className="ml-2">{user ? user.email : 'None'}</span>
              </div>
              <div>
                <span className="font-medium">Profile:</span>
                <span className="ml-2">{profile ? profile.full_name : 'None'}</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Results */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Diagnostic Results</h2>
              <button
                onClick={runDiagnostics}
                disabled={isRunningTests}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isRunningTests ? 'Running...' : 'Run Tests'}
              </button>
            </div>

            {Object.keys(testResults).length > 0 && (
              <div className="space-y-4">
                {/* Environment Variables */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Environment Variables</h3>
                  <div className="text-sm space-y-1">
                    <div>Auth Mode: <code className="bg-gray-100 px-1 rounded">{testResults.envVars?.authMode}</code></div>
                    <div>Has Supabase URL: <span className={testResults.envVars?.hasSupabaseUrl ? 'text-green-600' : 'text-red-600'}>{testResults.envVars?.hasSupabaseUrl ? '✅' : '❌'}</span></div>
                    <div>Has Supabase Key: <span className={testResults.envVars?.hasSupabaseKey ? 'text-green-600' : 'text-red-600'}>{testResults.envVars?.hasSupabaseKey ? '✅' : '❌'}</span></div>
                    <div>URL Preview: <code className="bg-gray-100 px-1 rounded text-xs">{testResults.envVars?.supabaseUrlPreview}</code></div>
                  </div>
                </div>

                {/* Session Test */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Session Test</h3>
                  <div className="text-sm">
                    {testResults.session?.error ? (
                      <div className="text-red-600">❌ Error: {testResults.session.error}</div>
                    ) : (
                      <div>
                        <div>Session Exists: <span className={testResults.session?.exists ? 'text-green-600' : 'text-red-600'}>{testResults.session?.exists ? '✅' : '❌'}</span></div>
                        {testResults.session?.exists && (
                          <>
                            <div>User ID: <code className="bg-gray-100 px-1 rounded">{testResults.session.userId}</code></div>
                            <div>Email: <code className="bg-gray-100 px-1 rounded">{testResults.session.email}</code></div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* User Test */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">User Test</h3>
                  <div className="text-sm">
                    {testResults.user?.error ? (
                      <div className="text-red-600">❌ Error: {testResults.user.error}</div>
                    ) : (
                      <div>
                        <div>User Exists: <span className={testResults.user?.exists ? 'text-green-600' : 'text-red-600'}>{testResults.user?.exists ? '✅' : '❌'}</span></div>
                        {testResults.user?.exists && (
                          <>
                            <div>User ID: <code className="bg-gray-100 px-1 rounded">{testResults.user.id}</code></div>
                            <div>Email: <code className="bg-gray-100 px-1 rounded">{testResults.user.email}</code></div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Test */}
                {user && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Profile Test</h3>
                    <div className="text-sm">
                      {testResults.profile?.error ? (
                        <div className="text-red-600">❌ Error: {testResults.profile.error}</div>
                      ) : (
                        <div>
                          <div>Profile Exists: <span className={testResults.profile?.exists ? 'text-green-600' : 'text-red-600'}>{testResults.profile?.exists ? '✅' : '❌'}</span></div>
                          {testResults.profile?.exists && (
                            <>
                              <div>Full Name: <code className="bg-gray-100 px-1 rounded">{testResults.profile.fullName}</code></div>
                              <div>Profession: <code className="bg-gray-100 px-1 rounded">{testResults.profile.profession}</code></div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Tips</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• If environment variables are missing, check your <code>.env</code> file</li>
              <li>• If session/user tests fail, try logging out and back in</li>
              <li>• If profile test fails, complete your profile setup</li>
              <li>• Check browser console (F12) for detailed error messages</li>
              <li>• See <code>AUTH_TROUBLESHOOTING.md</code> for detailed help</li>
            </ul>
          </div>

          {/* Raw Data */}
          <details className="mt-6">
            <summary className="cursor-pointer font-semibold text-gray-700">Raw Test Data (for debugging)</summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;