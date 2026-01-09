import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit, 
  Save,
  X,
  MapPin,
  Thermometer,
  Leaf,
  Wheat,
  Cloud,
  Sprout,
  Plus,
  Trash2
} from 'lucide-react';
import PageNavigation from '../components/PageNavigation';
import { useAuth } from '../contexts/AuthContext';

interface FarmProfileData {
  farmName: string;
  location: {
    state: string;
    district: string;
    village: string;
  };
  landArea: {
    total: number;
    unit: string;
  };
  primaryCrop: string;
  cropCycle: string;
  equipment: string[];
  description?: string;
}

const FarmProfile = () => {
  const { user, profile: userProfile, updateProfile } = useAuth();
  const [farmData, setFarmData] = useState<FarmProfileData | null>(null);
  const [editData, setEditData] = useState<FarmProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'equipment'>('overview');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [newEquipment, setNewEquipment] = useState('');

  const cropOptions = ['Wheat', 'Rice', 'Cotton', 'Onion', 'Tomato', 'Potato', 'Soybean', 'Maize', 'Sugarcane', 'Groundnut', 'Mustard', 'Chilli'];
  const cropCycleOptions = ['Kharif', 'Rabi', 'Zaid', 'Year-round'];
  const stateOptions = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Rajasthan', 'Madhya Pradesh', 'Andhra Pradesh', 'Telangana', 'Bihar', 'Odisha', 'Kerala'];
  const landUnitOptions = ['acre', 'hectare'] as const;

  useEffect(() => {
    // Debug logging
    console.log('🔍 FarmProfile Debug:', { 
      hasUser: !!user, 
      userId: user?.id,
      hasUserProfile: !!userProfile,
      userMetadata: user?.user_metadata
    });
    
    setDebugInfo(`User: ${user?.id || 'none'}, Profile: ${userProfile ? 'loaded' : 'none'}`);

    // Only show data if user is logged in
    if (!user) {
      console.log('❌ No user logged in');
      return;
    }

    // Get name from profile or user metadata
    const fullName = userProfile?.full_name || user?.user_metadata?.full_name || 'Farmer';
    const primaryCrop = userProfile?.primary_crop || user?.user_metadata?.primary_crop || '';
    const landSize = userProfile?.land_size || user?.user_metadata?.land_size || 0;
    const landUnit = userProfile?.land_unit || user?.user_metadata?.land_unit || 'acres';
    const cropCycle = userProfile?.crop_cycle || user?.user_metadata?.crop_cycle || 'Kharif';
    const equipment = userProfile?.equipment || user?.user_metadata?.equipment || [];
    const location = userProfile?.location || user?.user_metadata?.location || {};

    console.log('⚡ Loading farm profile from user data:', { fullName, primaryCrop, landSize });
    
    // Use real data from user profile
    setFarmData({
      farmName: `${fullName}'s Farm`,
      location: {
        state: location?.state || '',
        district: location?.district || '',
        village: location?.village || ''
      },
      landArea: {
        total: landSize,
        unit: landUnit
      },
      primaryCrop: primaryCrop || 'Not set',
      cropCycle: cropCycle,
      equipment: equipment,
      description: primaryCrop ? `Farm specializing in ${primaryCrop} production.` : 'Complete your profile to see farm details.'
    });
    
    console.log('✅ Farm profile loaded from real user data');
  }, [user, userProfile]);



  const handleSave = async () => {
    if (!editData || !updateProfile) return;
    
    setIsSaving(true);
    try {
      // Update profile in Supabase/Auth context
      await updateProfile({
        full_name: editData.farmName.replace("'s Farm", ''),
        primary_crop: editData.primaryCrop,
        land_size: editData.landArea.total,
        land_unit: editData.landArea.unit as 'acre' | 'hectare',
        crop_cycle: editData.cropCycle,
        equipment: editData.equipment,
        location: editData.location
      });
      
      setFarmData(editData);
      setIsEditing(false);
      console.log('✅ Farm profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(farmData);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditData(farmData);
    setIsEditing(true);
  };

  const addEquipment = () => {
    if (newEquipment.trim() && editData) {
      setEditData({
        ...editData,
        equipment: [...editData.equipment, newEquipment.trim()]
      });
      setNewEquipment('');
    }
  };

  const removeEquipment = (index: number) => {
    if (editData) {
      setEditData({
        ...editData,
        equipment: editData.equipment.filter((_, i) => i !== index)
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="text-yellow-800 dark:text-yellow-200">
              <h3 className="text-lg font-semibold mb-2">Please Log In</h3>
              <p className="text-sm mb-4">
                Log in to view your farm profile.
              </p>
              <p className="text-xs mb-4 text-gray-500">Debug: {debugInfo}</p>
              <Link 
                to="/" 
                className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!farmData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading farm profile...</p>
          <p className="mt-2 text-xs text-gray-500">Debug: {debugInfo}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <PageNavigation title="Farm Profile" />
      
      {/* Action Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={isEditing ? handleSave : startEditing}
              disabled={isSaving}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save</span>
                </>
              ) : (
                <>
                  <Edit className="w-5 h-5" />
                  <span>Edit</span>
                </>
              )}
            </button>
            {isEditing && (
              <button
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-300"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            )}
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
                <h2 className="text-2xl font-bold">{farmData.farmName}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {farmData.location.village ? `${farmData.location.village}, ` : ''}
                    {farmData.location.district ? `${farmData.location.district}, ` : ''}
                    {farmData.location.state || 'Location not set'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{farmData.landArea.total} {farmData.landArea.unit}</div>
              <div className="text-sm text-green-100">Total Land Area</div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Real Data Only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Primary Crop</p>
                <p className="text-2xl font-bold text-green-600">{farmData.primaryCrop}</p>
              </div>
              <Wheat className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Crop Cycle</p>
                <p className="text-2xl font-bold text-blue-600">{farmData.cropCycle}</p>
              </div>
              <Cloud className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Equipment</p>
                <p className="text-2xl font-bold text-purple-600">{farmData.equipment.length}</p>
              </div>
              <Sprout className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-6 flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: Leaf },
            { id: 'equipment', label: 'Equipment', icon: Thermometer }
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
                    {isEditing && editData ? (
                      <input
                        type="text"
                        value={editData.farmName}
                        onChange={(e) => setEditData({ ...editData, farmName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-white">{farmData.farmName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State
                    </label>
                    {isEditing && editData ? (
                      <select
                        value={editData.location.state}
                        onChange={(e) => setEditData({ 
                          ...editData, 
                          location: { ...editData.location, state: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select State</option>
                        {stateOptions.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">
                        {farmData.location.state || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      District
                    </label>
                    {isEditing && editData ? (
                      <input
                        type="text"
                        value={editData.location.district}
                        onChange={(e) => setEditData({ 
                          ...editData, 
                          location: { ...editData.location, district: e.target.value }
                        })}
                        placeholder="Enter district name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">
                        {farmData.location.district || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Village
                    </label>
                    {isEditing && editData ? (
                      <input
                        type="text"
                        value={editData.location.village}
                        onChange={(e) => setEditData({ 
                          ...editData, 
                          location: { ...editData.location, village: e.target.value }
                        })}
                        placeholder="Enter village name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">
                        {farmData.location.village || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Land Size
                      </label>
                      {isEditing && editData ? (
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={editData.landArea.total}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              landArea: { ...editData.landArea, total: parseFloat(e.target.value) || 0 }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <select
                            value={editData.landArea.unit}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              landArea: { ...editData.landArea, unit: e.target.value }
                            })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            {landUnitOptions.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <p className="text-gray-800 dark:text-white">{farmData.landArea.total} {farmData.landArea.unit}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Primary Crop
                      </label>
                      {isEditing && editData ? (
                        <select
                          value={editData.primaryCrop}
                          onChange={(e) => setEditData({ ...editData, primaryCrop: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select Crop</option>
                          {cropOptions.map(crop => (
                            <option key={crop} value={crop}>{crop}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-800 dark:text-white">{farmData.primaryCrop}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Crop Cycle
                    </label>
                    {isEditing && editData ? (
                      <select
                        value={editData.cropCycle}
                        onChange={(e) => setEditData({ ...editData, cropCycle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {cropCycleOptions.map(cycle => (
                          <option key={cycle} value={cycle}>{cycle}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-800 dark:text-white">{farmData.cropCycle}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">About Your Farm</h3>
                {isEditing && editData ? (
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={4}
                    placeholder="Describe your farm..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">{farmData.description}</p>
                )}
                
                {!isEditing && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Tip</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Use the AI Predictions page to get price forecasts for {farmData.primaryCrop} and find the best time to sell.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Farm Equipment</h3>
            
            {/* Add Equipment (Edit Mode) */}
            {isEditing && editData && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add New Equipment
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    placeholder="e.g., Tractor, Pump, Sprayer..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
                  />
                  <button
                    onClick={addEquipment}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}

            {/* Equipment List */}
            {(isEditing ? editData?.equipment : farmData.equipment)?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(isEditing ? editData?.equipment : farmData.equipment)?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <Thermometer className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-800 dark:text-white">{item}</span>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeEquipment(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Thermometer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Equipment Listed</h4>
                <p className="text-gray-500 dark:text-gray-400">
                  {isEditing ? 'Add your farm equipment using the form above.' : 'Click Edit to add your farm equipment.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmProfile;
