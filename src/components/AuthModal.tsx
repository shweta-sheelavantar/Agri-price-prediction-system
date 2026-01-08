import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Mail, Phone, Lock, MapPin, Briefcase, Tractor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup' | 'otp' | 'profile'>(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    fullName: '',
    otp: '',
    // Profile data
    profession: 'farmer' as 'farmer' | 'agricultural_expert' | 'trader' | 'other',
    landSize: '',
    landUnit: 'acre' as 'acre' | 'hectare',
    primaryCrop: '',
    cropCycle: '',
    equipment: [] as string[],
    state: '',
    district: '',
    village: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signUp, signIn, signInWithPhone, verifyOtp, updateProfile, user, isAuthenticated } = useAuth();

  // Debug: Log authentication state changes
  React.useEffect(() => {
    console.log('🔍 AuthModal - Auth state:', { 
      user: user?.email, 
      isAuthenticated, 
      mode 
    });
    
    // If user becomes authenticated and we're still in signup mode, move to profile
    if (isAuthenticated && user && mode === 'signup') {
      console.log('🔄 User authenticated after signup, moving to profile mode');
      setMode('profile');
      setSuccess('Account created successfully! Please complete your farming profile.');
      setError('');
    }
  }, [user, isAuthenticated, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    console.log('🎯 Form submission:', { mode, formData: { ...formData, password: '***' } });

    try {
      if (mode === 'signin') {
        if (formData.email) {
          console.log('📧 Attempting email signin');
          await signIn(formData.email, formData.password);
          console.log('✅ Email signin successful');
          onClose();
        } else if (formData.phone) {
          console.log('📱 Attempting phone signin');
          await signInWithPhone(formData.phone);
          setMode('otp');
        }
      } else if (mode === 'signup') {
        console.log('📝 Attempting signup with data:', { 
          email: formData.email, 
          phone: formData.phone, 
          fullName: formData.fullName 
        });
        
        // Validate required fields
        if (!formData.fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
          throw new Error('Please enter a valid email address');
        }
        if (!formData.phone.trim()) {
          throw new Error('Please enter your phone number');
        }
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        
        const result = await signUp(formData.email, formData.password, formData.phone, formData.fullName);
        console.log('✅ Signup result:', { 
          hasResult: !!result, 
          hasUser: !!(result?.user), 
          hasSession: !!(result?.session),
          userEmail: result?.user?.email 
        });
        
        // Check if email confirmation is required
        if (result && result.user && !result.session) {
          console.log('📧 Email confirmation required');
          setError('Please check your email and click the confirmation link to complete registration.');
          return;
        }
        
        // Always move to profile completion after successful signup
        console.log('🔄 Moving to profile completion mode');
        setSuccess('Account created successfully! Please complete your farming profile.');
        setError('');
        
        // Force profile mode with a small delay to ensure state updates
        setTimeout(() => {
          console.log('🔄 Setting mode to profile');
          setMode('profile');
        }, 100);
      } else if (mode === 'otp') {
        console.log('🔢 Attempting OTP verification');
        await verifyOtp(formData.phone, formData.otp);
        setMode('profile');
      } else if (mode === 'profile') {
        console.log('👤 Updating profile');
        
        // Validate required profile fields
        if (!formData.primaryCrop) {
          throw new Error('Please select your primary crop');
        }
        if (!formData.cropCycle) {
          throw new Error('Please select your crop cycle');
        }
        if (!formData.state.trim()) {
          throw new Error('Please enter your state');
        }
        if (!formData.district.trim()) {
          throw new Error('Please enter your district');
        }
        
        try {
          // Wait for authentication state to settle
          let attempts = 0;
          while (!user && attempts < 10) {
            console.log(`⏳ Waiting for user authentication... attempt ${attempts + 1}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
          }
          
          if (!user) {
            throw new Error('Authentication session not ready. Please try again.');
          }
          
          const profileData = {
            email: formData.email || user?.email,
            phone: formData.phone || user?.phone,
            full_name: formData.fullName || user?.user_metadata?.full_name,
            profession: formData.profession,
            land_size: parseFloat(formData.landSize) || 0,
            land_unit: formData.landUnit,
            primary_crop: formData.primaryCrop,
            crop_cycle: formData.cropCycle,
            equipment: formData.equipment,
            location: {
              state: formData.state,
              district: formData.district,
              village: formData.village,
            },
          };
          
          console.log('📝 Updating profile with data:', profileData);
          await updateProfile(profileData);
          console.log('✅ Profile updated successfully');
          
          // Show success message briefly before redirecting
          setSuccess('Profile completed successfully! Welcome to AgriFriend!');
          setError('');
          
          // Close modal and let the ProfileCompletionGuard handle the flow
          setTimeout(() => {
            onClose();
            console.log('✅ Profile completion successful, closing modal');
            // Don't navigate - let the app naturally flow to dashboard with complete profile
          }, 1500);
        } catch (profileError: any) {
          console.error('❌ Profile update error:', profileError);
          if (profileError.message.includes('No user logged in') || profileError.message.includes('Authentication session')) {
            setError('Please wait a moment for your account to be set up, then try again.');
            // Retry after a short delay
            setTimeout(() => {
              setError('');
            }, 3000);
          } else {
            throw profileError;
          }
        }
      }
    } catch (err: any) {
      console.error('❌ Form submission error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipment: checked 
        ? [...prev.equipment, equipment]
        : prev.equipment.filter(e => e !== equipment)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {mode === 'signin' && 'Sign In to AgriFriend'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'otp' && 'Verify Phone Number'}
            {mode === 'profile' && 'Complete Your Profile'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {mode === 'signin' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email or Phone
                </label>
                <input
                  type="text"
                  value={formData.email || formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.includes('@')) {
                      setFormData(prev => ({ ...prev, email: value, phone: '' }));
                    } else {
                      setFormData(prev => ({ ...prev, phone: value, email: '' }));
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter email or phone number"
                  required
                />
              </div>

              {formData.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : formData.phone ? 'Send OTP' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-primary-600 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Create a password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Debug button for testing profile mode */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={() => {
                    console.log('🧪 Debug: Manually triggering profile mode');
                    setMode('profile');
                    setSuccess('Debug: Moving to profile completion');
                  }}
                  className="w-full mt-2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 text-sm"
                >
                  Debug: Skip to Profile
                </button>
              )}

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-primary-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {mode === 'otp' && (
            <>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've sent a verification code to {formData.phone}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </>
          )}

          {mode === 'profile' && (
            <>
              {/* Always show profile completion form */}
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-800">
                  <p className="font-medium">🎉 Welcome to AgriFriend!</p>
                  <p className="text-sm mt-1">Please complete your farming profile to get personalized recommendations.</p>
                </div>
              </div>

              {/* Show authentication status for debugging */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <div>Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
                    <div>User: {user?.email || 'No user'}</div>
                    <div>Mode: {mode}</div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Profession
                  </label>
                  <select
                    value={formData.profession}
                    onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="farmer">Farmer</option>
                    <option value="agricultural_expert">Agricultural Expert</option>
                    <option value="trader">Trader</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Land Size
                    </label>
                    <input
                      type="number"
                      value={formData.landSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, landSize: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit
                    </label>
                    <select
                      value={formData.landUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, landUnit: e.target.value as any }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="acre">Acre</option>
                      <option value="hectare">Hectare</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Crop
                  </label>
                  <select
                    value={formData.primaryCrop}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryCrop: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Primary Crop</option>
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Rice">Rice (चावल)</option>
                    <option value="Cotton">Cotton (कपास)</option>
                    <option value="Sugarcane">Sugarcane (गन्ना)</option>
                    <option value="Onion">Onion (प्याज)</option>
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Potato">Potato (आलू)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Maize">Maize (मक्का)</option>
                    <option value="Groundnut">Groundnut (मूंगफली)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Crop Cycle
                  </label>
                  <select
                    value={formData.cropCycle}
                    onChange={(e) => setFormData(prev => ({ ...prev, cropCycle: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Crop Cycle</option>
                    <option value="Kharif">Kharif (Monsoon Season)</option>
                    <option value="Rabi">Rabi (Winter Season)</option>
                    <option value="Zaid">Zaid (Summer Season)</option>
                    <option value="Perennial">Perennial (Year Round)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Tractor className="w-4 h-4 inline mr-2" />
                    Equipment (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['None', 'Tractor', 'Harvester', 'Plough', 'Sprayer', 'Thresher', 'Cultivator'].map((equipment) => (
                      <label key={equipment} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.equipment.includes(equipment)}
                          onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">{equipment}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="State"
                      required
                    />
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="District"
                      required
                    />
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Village"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving Profile...' : 'Complete Setup'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;