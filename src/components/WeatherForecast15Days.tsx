import React, { useState, useEffect } from 'react';
// Using standard HTML elements instead of UI components
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind,
  AlertTriangle,
  Calendar,
  Sprout,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { TimeSeriesAnalyzer, TimeSeriesPrediction } from '../services/timeSeriesAnalysis';
import { MarketPrice } from '../types';

interface WeatherDay {
  date: string;
  temperature_min: number;
  temperature_max: number;
  temperature_avg: number;
  humidity_avg: number;
  rainfall_total: number;
  description: string;
  agricultural_conditions: string;
  irrigation_needed: boolean;
  pest_risk: string;
  disease_risk: string;
  farming_activities: string[];
  // Enhanced with price prediction
  predicted_price?: number;
  price_trend?: 'bullish' | 'bearish' | 'stable';
  price_confidence?: number;
  selling_recommendation?: string;
}

interface ForecastData {
  location: {
    city: string;
    state: string;
  };
  current_weather: any;
  forecast_15_days: WeatherDay[];
  agricultural_summary: {
    overall_condition: string;
    total_rainfall_mm: number;
    average_temperature: number;
    average_humidity: number;
    irrigation_required_days: number;
    high_risk_days: number;
    primary_recommendation: string;
    best_farming_days: string[];
  };
  // Enhanced with price analysis
  price_summary?: {
    current_price: number;
    average_predicted_price: number;
    peak_price: number;
    lowest_price: number;
    best_selling_days: number[];
    profit_potential: number;
    risk_level: 'low' | 'medium' | 'high';
  };
  data_source: string;
  confidence: string;
}

interface WeatherForecast15DaysProps {
  city?: string;
  state?: string;
  commodity?: string;
  includePricePredictions?: boolean;
}

const WeatherForecast15Days: React.FC<WeatherForecast15DaysProps> = ({ 
  city = 'ludhiana', 
  state = 'punjab',
  commodity = 'Wheat',
  includePricePredictions = true
}) => {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'agricultural' | 'price_analysis'>('overview');
  const [pricePredictions, setPricePredictions] = useState<TimeSeriesPrediction[]>([]);

  useEffect(() => {
    fetchForecastData();
  }, [city, state]);

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate mock forecast data
      const mockForecastData: ForecastData = {
        location: {
          city: city.charAt(0).toUpperCase() + city.slice(1),
          state: state.charAt(0).toUpperCase() + state.slice(1)
        },
        current_weather: {
          temperature: 28,
          humidity: 65,
          description: 'Partly cloudy'
        },
        forecast_15_days: Array.from({ length: 15 }, (_, index) => {
          const date = new Date();
          date.setDate(date.getDate() + index);
          
          const baseTemp = 25 + Math.sin(index * 0.3) * 8;
          const rainfall = Math.random() > 0.7 ? Math.random() * 15 : 0;
          
          return {
            date: date.toISOString().split('T')[0],
            temperature_min: Math.round(baseTemp - 5 + Math.random() * 3),
            temperature_max: Math.round(baseTemp + 5 + Math.random() * 3),
            temperature_avg: Math.round(baseTemp),
            humidity_avg: Math.round(60 + Math.random() * 30),
            rainfall_total: Math.round(rainfall * 10) / 10,
            description: rainfall > 5 ? 'Rainy' : rainfall > 0 ? 'Light rain' : Math.random() > 0.5 ? 'Sunny' : 'Partly cloudy',
            agricultural_conditions: rainfall > 10 ? 'challenging' : rainfall > 0 ? 'good' : 'moderate',
            irrigation_needed: rainfall < 2,
            pest_risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            disease_risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            farming_activities: [
              'Monitor crop growth',
              'Check irrigation systems',
              'Apply fertilizer if needed',
              'Inspect for pests',
              'Maintain equipment'
            ].slice(0, Math.floor(Math.random() * 3) + 1)
          };
        }),
        agricultural_summary: {
          overall_condition: 'good',
          total_rainfall_mm: 45.5,
          average_temperature: 26,
          average_humidity: 68,
          irrigation_required_days: 8,
          high_risk_days: 2,
          primary_recommendation: 'Monitor irrigation closely during dry periods. Good conditions expected for crop growth.',
          best_farming_days: ['Day 3', 'Day 7', 'Day 12']
        },
        data_source: 'AgriFriend Weather Service',
        confidence: 'High (85%)'
      };
      
      // Generate price predictions if enabled
      if (includePricePredictions) {
        // Create mock price data for time series analysis
        const mockPrice: MarketPrice = {
          id: `forecast-${commodity.toLowerCase()}-${state.toLowerCase()}`,
          commodity: commodity,
          variety: 'Standard',
          market: { 
            name: `${city} Mandi`,
            location: city, 
            state: state 
          },
          price: { 
            value: getBasePriceForCommodity(commodity), 
            unit: 'quintal',
            currency: 'INR' as const
          },
          priceChange: { value: Math.random() * 100 - 50, percentage: (Math.random() - 0.5) * 10 },
          timestamp: new Date(),
          source: 'AgriFriend Market Intelligence'
        };

        // Generate price predictions using time series analysis
        const predictions = TimeSeriesAnalyzer.generateAdvancedForecast(mockPrice, 15, {
          includeWeatherImpact: true,
          includePolicyImpact: true,
          includeGlobalFactors: false
        });

        setPricePredictions(predictions);

        // Enhance weather data with price predictions
        mockForecastData.forecast_15_days = mockForecastData.forecast_15_days.map((day, index) => ({
          ...day,
          predicted_price: predictions[index]?.price || mockPrice.price.value,
          price_trend: predictions[index]?.trend || 'stable',
          price_confidence: predictions[index]?.confidence || 0.8,
          selling_recommendation: getSellingRecommendation(predictions[index]?.trend || 'stable', index + 1)
        }));

        // Add price summary
        const prices = predictions.map(p => p.price);
        const avgPrice = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
        const peakPrice = Math.max(...prices);
        const lowestPrice = Math.min(...prices);
        const bestSellingDays = predictions
          .map((p, i) => ({ price: p.price, day: i + 1 }))
          .sort((a, b) => b.price - a.price)
          .slice(0, 3)
          .map(p => p.day);

        mockForecastData.price_summary = {
          current_price: mockPrice.price.value,
          average_predicted_price: avgPrice,
          peak_price: peakPrice,
          lowest_price: lowestPrice,
          best_selling_days: bestSellingDays,
          profit_potential: peakPrice - mockPrice.price.value,
          risk_level: ((peakPrice - lowestPrice) / mockPrice.price.value) > 0.15 ? 'high' : 
                     ((peakPrice - lowestPrice) / mockPrice.price.value) > 0.08 ? 'medium' : 'low'
        };
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setForecastData(mockForecastData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forecast');
      console.error('Forecast fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (description: string, temp: number) => {
    const desc = description.toLowerCase();
    if (desc.includes('rain')) return <CloudRain className="h-6 w-6 text-blue-500" />;
    if (desc.includes('cloud')) return <Cloud className="h-6 w-6 text-gray-500" />;
    if (temp > 30) return <Sun className="h-6 w-6 text-yellow-500" />;
    return <Sun className="h-6 w-6 text-orange-500" />;
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'good': return 'text-green-600';
      case 'challenging': return 'text-red-600';
      case 'moderate': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getBasePriceForCommodity = (commodity: string): number => {
    const basePrices: { [key: string]: number } = {
      'Wheat': 2485,
      'Rice': 3200,
      'Cotton': 6800,
      'Onion': 2840,
      'Tomato': 3500,
      'Potato': 2200,
      'Soybean': 4500,
      'Maize': 2100,
      'Sugarcane': 350
    };
    return basePrices[commodity] || 2500;
  };

  const getSellingRecommendation = (trend: string, day: number): string => {
    if (trend === 'bullish') {
      return day <= 5 ? 'Hold - Price Rising' : 'Consider Selling';
    } else if (trend === 'bearish') {
      return 'Sell Soon - Price Falling';
    }
    return 'Monitor Market';
  };

  const getPriceTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2">Loading 15-day forecast...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                {error}
                <button 
                  onClick={fetchForecastData}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!forecastData) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            15-Day Weather Forecast - {forecastData.location.city}, {forecastData.location.state}
          </h2>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-3 py-1 rounded text-sm ${
                selectedView === 'overview' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView('detailed')}
              className={`px-3 py-1 rounded text-sm ${
                selectedView === 'detailed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setSelectedView('agricultural')}
              className={`px-3 py-1 rounded text-sm ${
                selectedView === 'agricultural' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Agricultural Insights
            </button>
            {includePricePredictions && (
              <button
                onClick={() => setSelectedView('price_analysis')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedView === 'price_analysis' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Price Predictions
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Agricultural Summary */}
      {forecastData.agricultural_summary && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              Agricultural Summary (15 Days)
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Weather Conditions</h4>
                <p className="text-sm text-blue-600 capitalize">
                  {forecastData.agricultural_summary.overall_condition.replace('_', ' ')}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  Avg Temp: {forecastData.agricultural_summary.average_temperature}°C
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Rainfall & Irrigation</h4>
                <p className="text-sm text-green-600">
                  Total: {forecastData.agricultural_summary.total_rainfall_mm}mm
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Irrigation needed: {forecastData.agricultural_summary.irrigation_required_days} days
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Risk Assessment</h4>
                <p className="text-sm text-yellow-600">
                  High risk days: {forecastData.agricultural_summary.high_risk_days}
                </p>
                <p className="text-xs text-yellow-500 mt-1">
                  Humidity: {forecastData.agricultural_summary.average_humidity}%
                </p>
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="ml-2">
                  <strong>Recommendation:</strong> {forecastData.agricultural_summary.primary_recommendation}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Summary */}
      {includePricePredictions && forecastData.price_summary && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Price Analysis Summary (15 Days) - {commodity}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Current Price</h4>
                <p className="text-2xl font-bold text-blue-900">
                  ₹{forecastData.price_summary.current_price}
                </p>
                <p className="text-xs text-blue-500 mt-1">Per quintal</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Peak Expected</h4>
                <p className="text-2xl font-bold text-green-900">
                  ₹{forecastData.price_summary.peak_price}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Day {forecastData.price_summary.best_selling_days[0]} - Best to sell
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800">Profit Potential</h4>
                <p className="text-2xl font-bold text-purple-900">
                  ₹{forecastData.price_summary.profit_potential}
                </p>
                <p className="text-xs text-purple-500 mt-1">Max gain per quintal</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Risk Level</h4>
                <p className={`text-2xl font-bold ${
                  forecastData.price_summary.risk_level === 'high' ? 'text-red-600' :
                  forecastData.price_summary.risk_level === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {forecastData.price_summary.risk_level.toUpperCase()}
                </p>
                <p className="text-xs text-yellow-500 mt-1">Market volatility</p>
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="ml-2">
                  <strong>Smart Selling Strategy:</strong> Best selling days are {forecastData.price_summary.best_selling_days.join(', ')}. 
                  Expected average price: ₹{forecastData.price_summary.average_predicted_price}. 
                  Consider selling in batches to maximize profits and minimize risk.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Display */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          {selectedView === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forecastData.forecast_15_days.slice(0, 9).map((day, index) => (
                <div key={day.date} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    {getWeatherIcon(day.description, day.temperature_avg)}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span>{Math.round(day.temperature_min)}° - {Math.round(day.temperature_max)}°C</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span>{day.rainfall_total}mm</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <span>{Math.round(day.humidity_avg)}% humidity</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full bg-gray-100 ${getConditionColor(day.agricultural_conditions)}`}>
                      {day.agricultural_conditions}
                    </span>
                    
                    {includePricePredictions && day.predicted_price && (
                      <div className="border-t pt-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span className="font-medium">₹{day.predicted_price}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getPriceTrendIcon(day.price_trend || 'stable')}
                            <span className={`text-xs ${
                              day.price_trend === 'bullish' ? 'text-green-600' :
                              day.price_trend === 'bearish' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {day.price_trend}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {day.selling_recommendation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedView === 'detailed' && (
            <div className="space-y-4">
              {forecastData.forecast_15_days.map((day, index) => (
                <div key={day.date} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      {getWeatherIcon(day.description, day.temperature_avg)}
                      <span className="text-sm text-gray-600 capitalize">{day.description}</span>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">
                        {Math.round(day.temperature_min)}° - {Math.round(day.temperature_max)}°C
                      </div>
                      <div className="text-sm text-gray-600">
                        Avg: {Math.round(day.temperature_avg)}°C
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Rainfall:</span>
                      <div className="font-medium">{day.rainfall_total}mm</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Humidity:</span>
                      <div className="font-medium">{Math.round(day.humidity_avg)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Irrigation:</span>
                      <div className={`font-medium ${day.irrigation_needed ? 'text-red-600' : 'text-green-600'}`}>
                        {day.irrigation_needed ? 'Needed' : 'Not needed'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Conditions:</span>
                      <div className={`font-medium ${getConditionColor(day.agricultural_conditions)}`}>
                        {day.agricultural_conditions}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedView === 'agricultural' && (
            <div className="space-y-4">
              {forecastData.forecast_15_days.map((day, index) => (
                <div key={day.date} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    
                    <div className="flex gap-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getRiskBadgeColor(day.pest_risk)}`}>
                        Pest: {day.pest_risk}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getRiskBadgeColor(day.disease_risk)}`}>
                        Disease: {day.disease_risk}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Weather Summary</h4>
                      <div className="text-sm space-y-1">
                        <div>Temperature: {Math.round(day.temperature_min)}° - {Math.round(day.temperature_max)}°C</div>
                        <div>Rainfall: {day.rainfall_total}mm</div>
                        <div>Humidity: {Math.round(day.humidity_avg)}%</div>
                        <div className={`${getConditionColor(day.agricultural_conditions)}`}>
                          Conditions: {day.agricultural_conditions}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Recommended Activities</h4>
                      <div className="text-sm">
                        {day.farming_activities && day.farming_activities.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {day.farming_activities.map((activity, idx) => (
                              <li key={idx} className="text-gray-700">{activity}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No specific activities recommended</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedView === 'price_analysis' && includePricePredictions && (
            <div className="space-y-6">
              {/* Price Trend Chart Placeholder */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold text-gray-800 mb-4">📈 15-Day Price Trend Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{forecastData.price_summary?.average_predicted_price || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Average Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {pricePredictions.filter(p => p.trend === 'bullish').length}
                    </div>
                    <div className="text-sm text-gray-600">Bullish Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(pricePredictions.reduce((sum, p) => sum + p.confidence, 0) / pricePredictions.length * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Confidence</div>
                  </div>
                </div>
              </div>

              {/* Detailed Price Predictions Table */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Daily Price Predictions</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4">Day</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-right py-3 px-4">Predicted Price</th>
                        <th className="text-center py-3 px-4">Trend</th>
                        <th className="text-center py-3 px-4">Confidence</th>
                        <th className="text-left py-3 px-4">Selling Advice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastData.forecast_15_days.map((day, index) => (
                        <tr key={day.date} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{index + 1}</td>
                          <td className="py-3 px-4">
                            {new Date(day.date).toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-lg">
                            ₹{day.predicted_price || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {getPriceTrendIcon(day.price_trend || 'stable')}
                              <span className={`text-xs font-medium ${
                                day.price_trend === 'bullish' ? 'text-green-600' :
                                day.price_trend === 'bearish' ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {day.price_trend || 'stable'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (day.price_confidence || 0) > 0.8 ? 'bg-green-100 text-green-800' :
                              (day.price_confidence || 0) > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {Math.round((day.price_confidence || 0) * 100)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`font-medium ${
                              day.selling_recommendation?.includes('Sell') ? 'text-green-600' :
                              day.selling_recommendation?.includes('Hold') ? 'text-blue-600' :
                              'text-gray-600'
                            }`}>
                              {day.selling_recommendation || 'Monitor Market'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strategic Recommendations */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Strategic Selling Recommendations</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>• <strong>Best Selling Days:</strong> Days {forecastData.price_summary?.best_selling_days.join(', ') || 'N/A'} show highest price potential</p>
                  <p>• <strong>Risk Level:</strong> {forecastData.price_summary?.risk_level.toUpperCase() || 'MEDIUM'} volatility expected over 15 days</p>
                  <p>• <strong>Profit Opportunity:</strong> Up to ₹{forecastData.price_summary?.profit_potential || 0} per quintal above current price</p>
                  <p>• <strong>Strategy:</strong> Consider selling in 2-3 batches to balance profit and risk exposure</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Source Info */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Data Source: {forecastData.data_source}</span>
            <span>Confidence: {forecastData.confidence}</span>
            <span>Last Updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast15Days;