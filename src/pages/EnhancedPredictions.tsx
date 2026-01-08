import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CloudRain, Sprout, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import WeatherForecast15Days from '../components/WeatherForecast15Days';
import AdvancedForecastChart from '../components/AdvancedForecastChart';
import { MarketPrice } from '../types';

const EnhancedPredictions: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'weather' | 'yield' | 'market' | 'recommendations' | 'timeseries'>('weather');
  
  // Mock price data for time series analysis
  const mockPrice: MarketPrice = {
    id: 'demo-wheat-punjab',
    commodity: 'Wheat',
    variety: 'HD-2967',
    market: { 
      name: 'Ludhiana Mandi',
      location: 'Ludhiana', 
      state: 'Punjab' 
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Enhanced Agricultural Predictions</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time data-driven insights for optimal farming decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
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
              city="ludhiana" 
              state="punjab" 
              commodity="Wheat"
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
                Yield Prediction Summary
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
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs Regional Average</div>
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
                Market Potential Analysis
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
                AI Recommendations
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                  <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">Immediate Actions</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Apply nitrogen fertilizer at 120 kg/ha during tillering stage</li>
                    <li>• Ensure adequate irrigation - 4-5 irrigations recommended</li>
                    <li>• Monitor for aphid infestation, apply neem oil if detected</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Seasonal Planning</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Consider crop rotation with legumes next season</li>
                    <li>• Invest in drip irrigation system for better water efficiency</li>
                    <li>• Plan for timely harvesting in April to avoid heat stress</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                  <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">Long-term Strategies</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Soil testing recommended every 2 years</li>
                    <li>• Consider organic farming certification for premium pricing</li>
                    <li>• Diversify with high-value crops like vegetables</li>
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
                🔮 Advanced Time Series Price Forecasting
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sophisticated AI-powered analysis using seasonal patterns, market trends, and external factors to predict optimal selling strategies.
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