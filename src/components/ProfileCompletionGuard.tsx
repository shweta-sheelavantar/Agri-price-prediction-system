import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

const ProfileCompletionGuard: React.FC<ProfileCompletionGuardProps> = ({ children }) => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🔍 ProfileCompletionGuard - Checking profile status:', {
      isAuthenticated,
      hasUser: !!user,
      hasProfile: !!profile,
      currentPath: location.pathname,
      profileData: profile ? {
        hasName: !!profile.full_name,
        hasCrop: !!profile.primary_crop,
        hasLocation: !!profile.location?.state
      } : null
    });

    // Skip check if already on profile setup page
    if (location.pathname === '/profile-setup') {
      return;
    }

    // If user is authenticated but profile is incomplete, redirect to profile setup
    if (isAuthenticated && user && (!profile || !isProfileComplete(profile))) {
      console.log('⚠️ Profile incomplete, redirecting to profile setup');
      navigate('/profile-setup', { replace: true });
    }
  }, [user, profile, isAuthenticated, navigate, location.pathname]);

  const isProfileComplete = (profile: any) => {
    if (!profile) return false;
    
    // Check required fields for a complete farming profile
    const requiredFields = [
      profile.full_name,
      profile.primary_crop,
      profile.land_size,
      profile.location?.state,
      profile.location?.district
    ];

    const isComplete = requiredFields.every(field => field && field !== '');
    
    console.log('📋 Profile completeness check:', {
      hasName: !!profile.full_name,
      hasCrop: !!profile.primary_crop,
      hasLandSize: !!profile.land_size,
      hasState: !!profile.location?.state,
      hasDistrict: !!profile.location?.district,
      isComplete
    });

    return isComplete;
  };

  return <>{children}</>;
};

export default ProfileCompletionGuard;