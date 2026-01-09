import React, { useState, useEffect } from 'react';
import { CloudRain, Sprout, DollarSign, TrendingUp, BarChart3, MapPin, Search } from 'lucide-react';
import WeatherForecast15Days from '../components/WeatherForecast15Days';
import PageNavigation from '../components/PageNavigation';
import AdvancedForecastChart from '../components/AdvancedForecastChart';
import { MarketPrice } from '../types';
import { useAuth } from '../contexts/AuthContext';

// All 28 Indian states + 8 UTs
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Andaman and Nicobar', 'Dadra and Nagar Haveli', 'Lakshadweep'
];

// Major cities/districts for each state
const STATE_CITIES: { [key: string]: string[] } = {
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Moga'],
  'Haryana': ['Karnal', 'Panipat', 'Ambala', 'Hisar', 'Rohtak', 'Gurugram', 'Faridabad', 'Sonipat'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Sangli'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar', 'Bharatpur'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore'],
  'Andhra Pradesh': ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kakinada'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Kharagpur'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Begusarai'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Nainital'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi', 'Nahan', 'Kullu'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
};

// All major agricultural commodities
const COMMODITIES = [
  'Wheat', 'Rice', 'Maize', 'Bajra', 'Jowar', 'Barley', 'Ragi',
  'Cotton', 'Sugarcane', 'Jute',
  'Groundnut', 'Soybean', 'Mustard', 'Sunflower', 'Sesame',
  'Gram', 'Tur/Arhar', 'Moong', 'Urad', 'Masoor', 'Chana',
  'Onion', 'Potato', 'Tomato', 'Brinjal', 'Cabbage', 'Cauliflower', 'Carrot', 'Peas',
  'Banana', 'Mango', 'Apple', 'Orange', 'Grapes', 'Papaya', 'Guava',
  'Turmeric', 'Ginger', 'Chilli', 'Coriander', 'Cumin', 'Garlic',
  'Tea', 'Coffee', 'Rubber', 'Coconut', 'Arecanut'
];

const EnhancedPredictions: React.FC = () => {
  const { profile } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'weather' | 'yield' | 'market' | 'recommendations' | 'timeseries'>('weather');
  
  // Location and crop selection
  const [selectedState, setSelectedState] = useState<string>('Punjab');
  const [selectedCity, setSelectedCity] = useState<string>('Ludhiana');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Wheat');
  const [availableCities, setAvailableCities] = useState<string[]>(STATE_CITIES['Punjab'] || []);
  
  // Initialize from user profile if available
  useEffect(() => {
    if (profile?.location?.state) {
      setSelectedState(profile.location.state);
      const cities = STATE_CITIES[profile.location.state] || [];
      setAvailableCities(cities);
      if (profile.location.district && cities.includes(profile.location.district)) {
        setSelectedCity(profile.location.district);
      } else if (cities.length > 0) {
        setSelectedCity(cities[0]);
      }
    }
    if (profile?.primary_crop) {
      setSelectedCommodity(profile.primary_crop);
    }
  }, [profile]);

  // Update cities when state changes
  useEffect(() => {
    const cities = STATE_CITIES[selectedState] || [];
    setAvailableCities(cities);
    if (cities.length > 0 && !cities.includes(selectedCity)) {
      setSelectedCity(cities[0]);
    }
  }, [selectedState]);
  
  // Dynamic price data based on selection
  const mockPrice: MarketPrice = {
    id: `${selectedCommodity.toLowerCase()}-${selectedCity.toLowerCase()}`,
    commodity: selectedCommodity,
    variety: 'Premium',
    market: { 
      name: `${selectedCity} Mandi`,
      location: selectedCity, 
      state: selectedState 
    },
    price: { 
      value: 2485, 
      unit: 'quintal',
      currency: 'INR' as const
    },
    priceChange: { value: 35, percentage: 1.43 },
    timestamp: new Date(),
    source: 'AgriFriend Market Intelligence'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <PageNavigation title="Enhanced Predictions" />

      <div className="container mx-auto px-4 py-6">
        {/* Location & Crop Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Select Location & Crop</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* State Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            {/* City/District Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City/District
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                {availableCities.length > 0 ? (
                  availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))
                ) : (
                  <option value={selectedState}>{selectedState}</option>
                )}
              </select>
            </div>
            
            {/* Commodity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Commodity
              </label>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                {COMMODITIES.map((commodity) => (
                  <option key={commodity} value={commodity}>{commodity}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Current Selection Display */}
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary-600" />
              <span className="text-sm text-primary-800 dark:text-primary-200">
                Showing predictions for <strong>{selectedCommodity}</strong> in <strong>{selectedCity}, {selectedState}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-6 grid grid-cols-2 md:grid-cols-5 gap-2">
          <button
            onClick={() => setSelectedTab('weather')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedTab === 'weather'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CloudRain className="w-5 h-5" />
              <span className="hidden sm:inline">Weather Forecast</span>
              <span className="sm:hidden">Weather</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('yield')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedTab === 'yield'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Sprout className="w-5 h-5" />
              <span className="hidden sm:inline">Yield Analysis</span>
              <span className="sm:hidden">Yield</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('market')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedTab === 'market'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span className="hidden sm:inline">Market Potential</span>
              <span className="sm:hidden">Market</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('recommendations')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedTab === 'recommendations'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span className="hidden sm:inline">Recommendations</span>
              <span className="sm:hidden">Tips</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('timeseries')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedTab === 'timeseries'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Time Series</span>
              <span className="sm:hidden">Analysis</span>
            </div>
          </button>
        </div>

        {/* Weather Forecast Tab */}
        {selectedTab === 'weather' && (
          <div className="space-y-6">
            <WeatherForecast15Days 
              city={selectedCity.toLowerCase().replace(/\s+/g, '')} 
              state={selectedState.toLowerCase().replace(/\s+/g, '')} 
              commodity={selectedCommodity}
              includePricePredictions={true}
            />
          </div>
        )}

        {/* Yield Analysis Tab */}
        {selectedTab === 'yield' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                Yield Prediction for {selectedCommodity} in {selectedCity}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">45.2</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Quintals per Hectare</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Expected Yield</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">226.0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Quintals</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Production</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">Above Average</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Performance</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs {selectedState} Average</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Market Potential Tab */}
        {selectedTab === 'market' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Market Potential for {selectedCommodity} in {selectedCity}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹565K</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Gross Revenue</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹180K</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Net Profit</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">31.8%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Profit Margin</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">₹2,500</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Price/Quintal</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {selectedTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Recommendations for {selectedCommodity} in {selectedState}
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                  <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">Immediate Actions</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Apply appropriate fertilizer based on soil test results</li>
                    <li>• Ensure adequate irrigation based on {selectedCity} weather conditions</li>
                    <li>• Monitor for common pests in {selectedState} region</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Seasonal Planning</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Consider crop rotation suitable for {selectedState}</li>
                    <li>• Invest in efficient irrigation systems</li>
                    <li>• Plan harvesting based on local market demand</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                  <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">Long-term Strategies</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Soil testing recommended every 2 years</li>
                    <li>• Consider organic farming certification for premium pricing</li>
                    <li>• Diversify with high-value crops suitable for {selectedState}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Series Analysis Tab */}
        {selectedTab === 'timeseries' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                🔮 Price Forecasting for {selectedCommodity} in {selectedCity}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                AI-powered analysis using seasonal patterns, market trends, and external factors to predict optimal selling strategies.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">Seasonal Analysis</div>
                  <div className="text-gray-600 dark:text-gray-300">Historical patterns & crop cycles</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-semibold text-green-600 dark:text-green-400">Market Intelligence</div>
                  <div className="text-gray-600 dark:text-gray-300">Supply-demand dynamics</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-semibold text-purple-600 dark:text-purple-400">Risk Assessment</div>
                  <div className="text-gray-600 dark:text-gray-300">Volatility & confidence metrics</div>
                </div>
              </div>
            </div>
            
            <AdvancedForecastChart 
              price={mockPrice} 
              days={15} 
              showOptimalStrategy={true}
              quantity={100}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPredictions;
