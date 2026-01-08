import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Briefcase, Tractor, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.primaryCrop) {
        throw new Error('Please select your primary crop');
      }
      if (!formData.landSize || parseFloat(formData.landSize) <= 0) {
        throw new Error('Please enter a valid land size');
      }
      if (!formData.state.trim()) {
        throw new Error('Please enter your state');
      }
      if (!formData.district.trim()) {
        throw new Error('Please enter your district');
      }

      const profileData = {
        email: user?.email,
        phone: user?.phone || user?.user_metadata?.phone,
        full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
        profession: formData.profession,
        land_size: parseFloat(formData.landSize),
        land_unit: formData.landUnit,
        primary_crop: formData.primaryCrop,
        crop_cycle: formData.cropCycle,
        equipment: formData.equipment.length > 0 ? formData.equipment : ['Basic Tools'],
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.village || 'Village',
        },
      };

      console.log('📝 Updating profile with data:', profileData);
      await updateProfile(profileData);
      console.log('✅ Profile updated successfully');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('❌ Profile setup error:', err);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Complete Your Farming Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Help us personalize your AgriFriend experience with your farming details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

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
                Land Size *
              </label>
              <input
                type="number"
                value={formData.landSize}
                onChange={(e) => setFormData(prev => ({ ...prev, landSize: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
                min="0.1"
                step="0.1"
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
              <Leaf className="w-4 h-4 inline mr-2" />
              Primary Crop *
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
              {['Tractor', 'Harvester', 'Plough', 'Sprayer', 'Thresher', 'Cultivator', 'Drip Irrigation', 'Organic Tools'].map((equipment) => (
                <label key={equipment} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.equipment.includes(equipment)}
                    onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{equipment}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location *
            </label>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="State (e.g., Karnataka)"
                required
              />
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="District (e.g., Bangalore Rural)"
                required
              />
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Village (optional)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
          >
            {isLoading ? 'Setting up your profile...' : 'Complete Setup & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;