import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Save,
  MapPin,
  Thermometer,
  Leaf,
  Calendar,
  TrendingUp,
  Award,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserDataService } from '../services/userDataService';

interface CropHistory {
  season: string;
  year: number;
  cropType: string;
  variety: string;
  areaPlanted: number;
  yield: number;
  revenue: number;
}

interface FarmProfile {
  id: string;
  userId: string;
  farmName: string;
  location: {
    state: string;
    district: string;
    village: string;
    coordinates: { lat: number; lng: number };
  };
  landArea: {
    total: number;
    unit: 'acre' | 'hectare';
  };
  soilType: string;
  irrigationType: string;
  cropHistory: CropHistory[];
  iotDevices: any[];
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  certifications?: string[];
  farmingMethods?: string[];
}

const FarmProfile = () => {
  const { user, profile: userProfile } = useAuth();
  const [profile, setProfile] = useState<FarmProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'crops' | 'equipment' | 'certifications'>('overview');

  useEffect(() => {
    // Only auto-populate if user has completed their profile
    if (!user || !userProfile) return;

    // Check if profile is complete
    const isProfileComplete = userProfile.full_name && 
                             userProfile.primary_crop && 
                             userProfile.land_size && 
                             userProfile.location?.state;

    if (!isProfileComplete) {
      console.log('⚠️ User profile incomplete, not generating farm data');
      setProfile(null);
      return;
    }

    console.log('⚡ Auto-populating farm profile from complete user data:', userProfile);
    
    // Extract farmer data using centralized service
    const farmerData = UserDataService.extractFarmerData(user, userProfile);
    
    if (!farmerData) {
      console.log('⚠️ Could not extract farmer data, profile incomplete');
      setProfile(null);
      return;
    }
    
    // Generate farm profile using centralized service
    const autoPopulatedProfile = UserDataService.generateFarmProfile(farmerData);

    // Set profile immediately for instant display
    setProfile(autoPopulatedProfile);
    
    console.log('✅ Farm profile auto-populated successfully for', farmerData.fullName);
  }, [user, userProfile]);



  const handleSave = () => {
    // Save profile changes
    setIsEditing(false);
    // In real app, this would make an API call
  };

  const addCropHistory = () => {
    if (!profile) return;
    
    const newCrop: CropHistory = {
      season: 'Kharif 2024',
      year: 2024,
      cropType: 'Wheat',
      variety: 'HD-2967',
      areaPlanted: 0,
      yield: 0,
      revenue: 0
    };

    setProfile({
      ...profile,
      cropHistory: [...profile.cropHistory, newCrop]
    });
  };

  const removeCropHistory = (index: number) => {
    if (!profile) return;
    
    const updatedHistory = profile.cropHistory.filter((_, i) => i !== index);
    setProfile({
      ...profile,
      cropHistory: updatedHistory
    });
  };

  const calculateTotalRevenue = () => {
    if (!profile) return 0;
    return profile.cropHistory.reduce((sum, crop) => sum + crop.revenue, 0);
  };

  const calculateAverageYield = () => {
    if (!profile || profile.cropHistory.length === 0) return 0;
    const totalYield = profile.cropHistory.reduce((sum, crop) => sum + crop.yield, 0);
    return totalYield / profile.cropHistory.length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading farm profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="text-yellow-800 dark:text-yellow-200">
              <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-sm mb-4">
                Please complete your farming profile to see your farm details and get personalized recommendations.
              </p>
              <Link 
                to="/dashboard" 
                className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Farm Profile</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your farm information and history
                </p>
              </div>
            </div>
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700"
            >
              {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
              <span>{isEditing ? 'Save' : 'Edit'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Farm Overview Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-4 rounded-full">
                <Leaf className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.farmName}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location.village}, {profile.location.district}, {profile.location.state}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{profile.landArea.total} {profile.landArea.unit}</div>
              <div className="text-sm text-green-100">Total Land Area</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{calculateTotalRevenue().toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Yield</p>
                <p className="text-2xl font-bold text-blue-600">{calculateAverageYield().toFixed(1)} q/acre</p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Crops Grown</p>
                <p className="text-2xl font-bold text-purple-600">{profile.cropHistory.length}</p>
              </div>
              <Leaf className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Certifications</p>
                <p className="text-2xl font-bold text-yellow-600">{profile.certifications?.length || 0}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-6 flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: Leaf },
            { id: 'crops', label: 'Crop History', icon: Calendar },
            { id: 'equipment', label: 'Equipment', icon: Thermometer },
            { id: 'certifications', label: 'Certifications', icon: Award }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Farm Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.farmName}
                        onChange={(e) => setProfile({ ...profile, farmName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-white">{profile.farmName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profile.description || ''}
                        onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">{profile.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Soil Type
                      </label>
                      {isEditing ? (
                        <select
                          value={profile.soilType}
                          onChange={(e) => setProfile({ ...profile, soilType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="Clay">Clay</option>
                          <option value="Loam">Loam</option>
                          <option value="Sandy">Sandy</option>
                          <option value="Silt">Silt</option>
                        </select>
                      ) : (
                        <p className="text-gray-800 dark:text-white">{profile.soilType}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Irrigation Type
                      </label>
                      {isEditing ? (
                        <select
                          value={profile.irrigationType}
                          onChange={(e) => setProfile({ ...profile, irrigationType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="Drip">Drip</option>
                          <option value="Sprinkler">Sprinkler</option>
                          <option value="Flood">Flood</option>
                          <option value="Rain-fed">Rain-fed</option>
                        </select>
                      ) : (
                        <p className="text-gray-800 dark:text-white">{profile.irrigationType}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Farming Methods */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Farming Methods</h3>
                <div className="space-y-3">
                  {profile.farmingMethods?.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-gray-800 dark:text-white">{method}</span>
                      {isEditing && (
                        <button
                          onClick={() => {
                            const updatedMethods = profile.farmingMethods?.filter((_, i) => i !== index);
                            setProfile({ ...profile, farmingMethods: updatedMethods });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 flex items-center justify-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Add Farming Method</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crop History Tab */}
        {activeTab === 'crops' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Crop History</h3>
              {isEditing && (
                <button
                  onClick={addCropHistory}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Crop</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.cropHistory.map((crop, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{crop.cropType}</h4>
                    {isEditing && (
                      <button
                        onClick={() => removeCropHistory(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Season</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{crop.season}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Variety</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{crop.variety}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Area Planted</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{crop.areaPlanted} acres</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Yield</span>
                      <span className="text-sm font-medium text-green-600">{crop.yield} quintals</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Revenue</span>
                      <span className="text-sm font-medium text-green-600">₹{crop.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Farm Equipment</h3>
            <div className="text-center py-12">
              <Thermometer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Equipment Management Coming Soon</h4>
              <p className="text-gray-500 dark:text-gray-400">
                Track your farm equipment, maintenance schedules, and usage history.
              </p>
            </div>
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Certifications & Awards</h3>
              {isEditing && (
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700">
                  <Plus className="w-4 h-4" />
                  <span>Add Certification</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.certifications?.map((cert, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-full">
                        <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white">{cert}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Valid until 2025</p>
                      </div>
                    </div>
                    {isEditing && (
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmProfile;
