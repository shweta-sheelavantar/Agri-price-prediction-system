import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { realtimeService } from '../services/realtimeService';
import PriceTicker from '../components/PriceTicker';
import { 
  TrendingUp, 
  Bell, 
  Search, 
  Brain, 
  Users,
  Settings as SettingsIcon,
  LogOut,
  Home,
  Sprout,
  MapPin,
  ChevronRight,
  TrendingDown,
  Cloud,
  Wheat,
  User
} from 'lucide-react';
import { marketPricesAPI } from '../services/api';
import ProfileCompletionGuard from '../components/ProfileCompletionGuard';
import type { MarketPrice } from '../types';

const Dashboard = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'mock'>('mock');

  // Extract farmer data from profile
  const farmerName = profile?.full_name || user?.user_metadata?.full_name || 'Farmer';
  const primaryCrop = profile?.primary_crop || user?.user_metadata?.primary_crop || 'Wheat';
  const landSize = profile?.land_size || user?.user_metadata?.land_size || 0;
  const landUnit = profile?.land_unit || user?.user_metadata?.land_unit || 'acres';
  const locationObj = profile?.location || user?.user_metadata?.location || null;
  const cropCycle = profile?.crop_cycle || user?.user_metadata?.crop_cycle || 'Kharif';
  
  // Format location as string
  const locationString = locationObj 
    ? [locationObj.village, locationObj.district, locationObj.state].filter(Boolean).join(', ') || 'Location not set'
    : 'Location not set';

  useEffect(() => {
    if (!user) return;

    console.log('⚡ Dashboard loading for:', farmerName, 'growing', primaryCrop);
    
    // Load real market prices for farmer's primary crop
    const loadPrices = async () => {
      setIsLoading(true);
      try {
        const pricesData = await marketPricesAPI.getAll({ commodity: primaryCrop });
        if (pricesData.length > 0) {
          setPrices(pricesData.slice(0, 5));
        } else {
          // Try without filter if no results
          const allPrices = await marketPricesAPI.getAll({});
          setPrices(allPrices.slice(0, 5));
        }
      } catch (error) {
        console.warn('Error loading prices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrices();

    // Connect real-time features
    setTimeout(() => {
      try {
        realtimeService.connect(user.id || 'demo-user');
        setConnectionStatus('connected');
      } catch (error) {
        console.warn('Real-time connection failed:', error);
        setConnectionStatus('mock');
      }
    }, 1000);

    return () => {
      realtimeService.disconnect();
    };
  }, [user, primaryCrop]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
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
              <Link to="/farm-profile" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Sprout className="w-5 h-5" />
                <span className="ml-3">My Farm</span>
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
              <Link to="/enhanced-predictions" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-1">
                <Cloud className="w-5 h-5" />
                <span className="ml-3">Weather Forecast</span>
              </Link>
              <Link to="/buyers" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Users className="w-5 h-5" />
                <span className="ml-3">Find Buyers</span>
              </Link>
            </div>

            <div className="px-3">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Account</h3>
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
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Welcome, {farmerName.split(' ')[0]}</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  connectionStatus === 'mock' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {connectionStatus === 'connected' ? 'Live Data' : 'Demo Mode'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-600 dark:text-gray-300">
                <Bell className="w-6 h-6" />
              </button>
            </div>
          </header>

          <PriceTicker />

          <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
            <div className="container mx-auto px-4 md:px-6 py-6">
              {/* Farmer Profile Card */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-2xl p-6 md:p-8 text-white mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">{farmerName}</h3>
                    <p className="text-primary-100 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {locationString}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Wheat className="w-5 h-5 mr-2" />
                      <span className="text-sm text-primary-100">Primary Crop</span>
                    </div>
                    <div className="text-xl font-bold">{primaryCrop}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Sprout className="w-5 h-5 mr-2" />
                      <span className="text-sm text-primary-100">Land Size</span>
                    </div>
                    <div className="text-xl font-bold">{landSize} {landUnit}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Cloud className="w-5 h-5 mr-2" />
                      <span className="text-sm text-primary-100">Crop Cycle</span>
                    </div>
                    <div className="text-xl font-bold">{cropCycle}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      <span className="text-sm text-primary-100">Status</span>
                    </div>
                    <div className="text-xl font-bold">Active</div>
                  </div>
                </div>
              </div>

              {/* Market Prices for Farmer's Crop */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Market Prices - {primaryCrop}
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
                              <p className="font-semibold text-gray-800 dark:text-white">{price.market?.location || price.commodity}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{price.market?.state || 'India'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-800 dark:text-white">₹{price.price?.value || 0}</p>
                            <p className={`text-sm font-medium flex items-center justify-end ${
                              (price.priceChange?.value || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(price.priceChange?.value || 0) >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                              {(price.priceChange?.value || 0) >= 0 ? '+' : ''}{(price.priceChange?.percentage || 0).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No price data available for {primaryCrop}</p>
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
                  <button onClick={() => navigate('/buyers')} className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl hover:shadow-md transition-all">
                    <Users className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-2" />
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Find Buyers</p>
                  </button>
                  <button onClick={() => navigate('/farm-profile')} className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl hover:shadow-md transition-all">
                    <Sprout className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-2" />
                    <p className="text-sm font-medium text-gray-800 dark:text-white">My Farm Profile</p>
                  </button>
                  <button onClick={() => navigate('/settings')} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl hover:shadow-md transition-all">
                    <SettingsIcon className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Settings</p>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Bottom Nav - Removed Inventory */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
          <div className="grid grid-cols-4 gap-1">
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
