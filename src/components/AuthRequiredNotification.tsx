import React from 'react';
import { Lock, X } from 'lucide-react';

interface AuthRequiredNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  message?: string;
}

const AuthRequiredNotification: React.FC<AuthRequiredNotificationProps> = ({
  isOpen,
  onClose,
  onSignIn,
  onSignUp,
  message = "Please sign in or create an account to access this feature"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Authentication Required
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            {message}
          </p>

          <div className="space-y-3">
            <button
              onClick={onSignUp}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Create Account
            </button>
            
            <button
              onClick={onSignIn}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Join 8.4 Lakh+ farmers already using AgriFriend
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredNotification;