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
  const [mode, setMode] = useState<'signin' | 'signup' | 'otp'>(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    fullName: '',
    otp: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signUp, signIn, signInWithPhone, verifyOtp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'signin') {
        if (formData.email) {
          // Email sign in - go directly to dashboard
          await signIn(formData.email, formData.password);
          setSuccess('Welcome back! Redirecting to dashboard...');
          setTimeout(() => {
            onClose();
            navigate('/dashboard');
          }, 1000);
        } else if (formData.phone) {
          // Phone sign in - send OTP
          await signInWithPhone(formData.phone);
          setSuccess('OTP sent! Use any 6-digit code (e.g., 123456)');
          setMode('otp');
        }
      } else if (mode === 'signup') {
        // Sign up - create account then go to profile setup
        if (!formData.fullName.trim()) throw new Error('Please enter your full name');
        if (!formData.email.trim() || !formData.email.includes('@')) throw new Error('Please enter a valid email');
        if (!formData.phone.trim()) throw new Error('Please enter your phone number');
        if (!formData.password || formData.password.length < 6) throw new Error('Password must be at least 6 characters');
        
        await signUp(formData.email, formData.password, formData.phone, formData.fullName);
        setSuccess('Account created! Setting up your profile...');
        setTimeout(() => {
          onClose();
          navigate('/profile-setup');
        }, 1000);
      } else if (mode === 'otp') {
        // OTP verification - go to dashboard
        await verifyOtp(formData.phone, formData.otp);
        setSuccess('Phone verified! Redirecting to dashboard...');
        setTimeout(() => {
          onClose();
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {mode === 'signin' && 'Sign In to AgriFriend'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'otp' && 'Verify Phone Number'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {mode === 'signin' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email or Phone Number
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
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter email or phone number"
                  required
                />
              </div>

              {formData.email && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Signing In...' : formData.phone ? 'Send OTP' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-primary-600 hover:underline font-semibold"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Create Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Create a strong password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-primary-600 hover:underline font-semibold"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}

          {mode === 'otp' && (
            <div className="space-y-6">
              <div className="text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  📱 Demo Mode: Enter any 6-digit code to continue
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  In production, you would receive an SMS to {formData.phone}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Verification Code
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg tracking-widest font-mono"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, otp: '123456' }));
                  }}
                  className="text-sm text-primary-600 hover:underline font-semibold"
                >
                  Use demo code (123456)
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;