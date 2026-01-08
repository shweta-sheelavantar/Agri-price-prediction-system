import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { realtimeService } from '../services/realtimeService';
import PriceTicker from '../components/PriceTicker';
import { 
  TrendingUp, 
  Bell, 
  Search, 
  Package, 
  Brain, 
  DollarSign, 
  Users,
  Settings as SettingsIcon,
  LogOut,
  Home,
  Sprout,
  Award,
  Leaf,
  MapPin,
  ChevronRight,
  TrendingDown,
  Cloud
} from 'lucide-react';
import { marketPricesAPI, farmProfileAPI } from '../services/api';
import { UserDataService } from '../services/userDataService';
import DataFlowIndicator from '../components/DataFlowIndicator';
import ProfileCompletionGuard from '../components/ProfileCompletionGuard';
import type { MarketPrice, FarmProfile } from '../types';

const Dashboard = () => {
  const { user, profile, logout } = useAuth();

  const navigate = useNavigate();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [isLoading] = useState(false); // Start with false for instant loading
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'mock'>('mock');
  const [notifications] = useState<any[]>([]);
  // Removed annoying popup - no more data flow indicator

  useEffect(() => {
    // Load dashboard data without annoying popups
    if (!user) return;

    console.log('⚡ Dashboard loading for user:', user.email);
    
    // Create immediate data using centralized service for consistent flow
    const createIntegratedData = () => {
      // Only create data if profile is complete
      if (!profile || !profile.primary_crop || !profile.full_name) {
        console.log('⚠️ Profile incomplete, not generating dashboard data');
        setFarmProfile(null);
        setPrices([]);
        return;
      }

      // Extract farmer data using centralized service
      const farmerData = UserDataService.extractFarmerData(user, profile);
      
      if (!farmerData) {
        console.log('⚠️ Could not extract farmer data for dashboard');
        setFarmProfile(null);
        setPrices([]);
        return;
      }
      
      // Generate farm profile using centralized service (Flow 4 → Flow 6)
      const integratedProfile = UserDataService.generateFarmProfile(farmerData);
      setFarmProfile(integratedProfile as any);

      // Create price data based on farmer's primary crop
      const cropPrices = [
        {
          id: '1',
          commodity: farmerData.primaryCrop,
          market: { location: 'Local Market', state: farmerData.location.state },
          price: { value: 2500, unit: 'quintal' },
          priceChange: { value: 50, percentage: 2.1 },
          date: new Date().toISOString()
        }
      ];
      setPrices(cropPrices as any);
      
      console.log('✅ Dashboard data integrated for', farmerData.fullName, 'growing', farmerData.primaryCrop);
    };

    // Set integrated data immediately
    createIntegratedData();

    // Load real data in background (non-blocking)
    setTimeout(async () => {
      try {
        // Try to load real data without blocking UI
        const pricesData = await marketPricesAPI.getAll({ commodity: 'Wheat' });
        if (pricesData.length > 0) {
          setPrices(pricesData.slice(0, 3));
        }
      } catch (error) {
        console.warn('Background data loading failed:', error);
      }

      try {
        let profile = await farmProfileAPI.get(user.id);
        if (profile) {
          setFarmProfile(profile);
        }
      } catch (error) {
        console.warn('Background profile loading failed:', error);
      }
    }, 500);

    // Connect real-time features much later (non-blocking)
    setTimeout(() => {
      try {
        realtimeService.connect(user.id || 'demo-user');
        setConnectionStatus('connected');
      } catch (error) {
        console.warn('Real-time connection failed:', error);
        setConnectionStatus('mock');
      }
    }, 2000);

    // Cleanup
    return () => {
      realtimeService.disconnect();
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileCompletionGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
      <aside className="hidden md:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64">
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">AgriFriend</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Dashboard
            </h3>
            <Link to="/dashboard" className="flex items-center px-3 py-2 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg mb-1">
              <Home className="w-5 h-5" />
              <span className="ml-3 font-medium">Overview</span>
            </Link>
            <Link to="/farm-profile" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-1">
              <Sprout className="w-5 h-5" />
              <span className="ml-3">My Farm</span>
            </Link>
            <Link to="/inventory" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Package className="w-5 h-5" />
              <span className="ml-3">Inventory</span>
            </Link>
          </div>

          <div className="px-3 mb-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Tools</h3>
            <Link to="/market-prices" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-1">
              <TrendingUp className="w-5 h-5" />
              <span className="ml-3">Market Prices</span>
            </Link>
            <Link to="/predictions" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-1">
              <Brain className="w-5 h-5" />
              <span className="ml-3">AI Predictions</span>
            </Link>
            <Link to="/buyers" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Users className="w-5 h-5" />
              <span className="ml-3">Find Buyers</span>
            </Link>
          </div>

          <div className="px-3">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Quick Links</h3>
            <Link to="/settings" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-1">
              <SettingsIcon className="w-5 h-5" />
              <span className="ml-3">Settings</span>
            </Link>
            <button onClick={logout} className="w-full flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Farmer Dashboard</h2>
            {/* Connection Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                connectionStatus === 'mock' ? 'bg-yellow-500' :
                connectionStatus === 'connecting' ? 'bg-blue-500 animate-pulse' :
                'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {connectionStatus === 'connected' ? 'Live' :
                 connectionStatus === 'mock' ? 'Demo Mode' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 dark:text-gray-300">
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </header>

        <PriceTicker />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 md:px-6 py-6">
            {/* Hero Stats */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-2xl p-6 md:p-8 text-white mb-6">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">Farming Journey</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold">{farmProfile?.cropHistory.length || 0}</div>
                  <div className="text-sm text-primary-100 mt-1">Crops Grown</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold">{farmProfile?.landArea.total || 0}</div>
                  <div className="text-sm text-primary-100 mt-1">Acres Farmed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold">₹{(Math.random() * 5 + 2).toFixed(1)}L</div>
                  <div className="text-sm text-primary-100 mt-1">Total Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold">₹{(Math.random() * 1 + 0.5).toFixed(1)}L</div>
                  <div className="text-sm text-primary-100 mt-1">Saved This Year</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Early Adopter</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Eco Farmer</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Price Master</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">AI Expert</div>
              </div>
            </div>

            {/* Market Prices */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Market Prices - {user?.user_metadata?.primary_crop || 'Wheat'}
                  </h3>
                  <Link to="/market-prices" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center">
                    View all <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {prices.length > 0 ? (
                  <div className="space-y-4">
                    {prices.map((price) => (
                      <div key={price.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">{price.market.location}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{price.market.state}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-800 dark:text-white">₹{price.price.value}</p>
                          <p className={`text-sm font-medium flex items-center justify-end ${
                            price.priceChange.value >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {price.priceChange.value >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            {price.priceChange.value >= 0 ? '+' : ''}{price.priceChange.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading prices...</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button onClick={() => navigate('/market-prices')} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:shadow-md transition-all">
                  <Search className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Check Prices</p>
                </button>
                <button onClick={() => navigate('/predictions')} className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl hover:shadow-md transition-all">
                  <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                  <p className="text-sm font-medium text-gray-800 dark:text-white">AI Predictions</p>
                </button>
                <button onClick={() => navigate('/enhanced-predictions')} className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl hover:shadow-md transition-all">
                  <Cloud className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Weather Forecast</p>
                </button>
                <button onClick={() => navigate('/inventory')} className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover:shadow-md transition-all">
                  <Package className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Inventory</p>
                </button>
                <button onClick={() => navigate('/financial')} className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl hover:shadow-md transition-all">
                  <DollarSign className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-2" />
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Financial</p>
                </button>
                <button onClick={() => navigate('/buyers')} className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl hover:shadow-md transition-all">
                  <Users className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-2" />
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Find Buyers</p>
                </button>
                <button onClick={() => navigate('/farm-profile')} className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl hover:shadow-md transition-all">
                  <Sprout className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-2" />
                  <p className="text-sm font-medium text-gray-800 dark:text-white">My Farm</p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
        <div className="grid grid-cols-5 gap-1">
          <Link to="/dashboard" className="flex flex-col items-center py-3 text-primary-600 dark:text-primary-400">
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/market-prices" className="flex flex-col items-center py-3 text-gray-600 dark:text-gray-400">
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1">Prices</span>
          </Link>
          <Link to="/predictions" className="flex flex-col items-center py-3 text-gray-600 dark:text-gray-400">
            <Brain className="w-6 h-6" />
            <span className="text-xs mt-1">AI</span>
          </Link>
          <Link to="/inventory" className="flex flex-col items-center py-3 text-gray-600 dark:text-gray-400">
            <Package className="w-6 h-6" />
            <span className="text-xs mt-1">Inventory</span>
          </Link>
          <Link to="/settings" className="flex flex-col items-center py-3 text-gray-600 dark:text-gray-400">
            <SettingsIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </div>
    </ProfileCompletionGuard>
  );
};

export default Dashboard;
