import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { TrendingUp, TrendingDown, AlertCircle, Brain, BarChart3, RefreshCw, Wifi, WifiOff } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PricePoint {
  date: string;
  price: number;
}

interface TodayPrice {
  date: string;
  price: number;
  source: string;
}

interface PredictionPoint {
  date: string;
  predicted_price: number;
}

interface ApiResponse {
  commodities: string[];
  markets: string[];
}

const AIPredictions: React.FC = () => {
  const [selectedCommodity, setSelectedCommodity] = useState('Wheat');
  const [selectedMarket, setSelectedMarket] = useState('Delhi');
  const [pastTrend, setPastTrend] = useState<PricePoint[]>([]);
  const [todayPrice, setTodayPrice] = useState<TodayPrice | null>(null);
  const [predictions, setPredictions] = useState<PredictionPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableOptions, setAvailableOptions] = useState<ApiResponse | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const API_BASE_URL = 'http://localhost:8000/api';

  // Default options (fallback if API is not available)
  const defaultCommodities = ['Wheat', 'Rice', 'Onion', 'Tomato', 'Potato', 'Cotton', 'Soybean'];
  const defaultMarkets = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad'];

  useEffect(() => {
    checkApiStatus();
    loadAvailableOptions();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const loadAvailableOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/commodities`);
      if (response.ok) {
        const data = await response.json();
        setAvailableOptions(data);
      }
    } catch (error) {
      console.warn('Failed to load options from API, using defaults');
    }
  };

  const fetchPastTrend = async (commodity: string, market: string): Promise<PricePoint[]> => {
    const response = await fetch(`${API_BASE_URL}/past-trend?commodity=${commodity}&market=${market}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch past trend: ${response.statusText}`);
    }
    return response.json();
  };

  const fetchTodayPrice = async (commodity: string, market: string): Promise<TodayPrice> => {
    const response = await fetch(`${API_BASE_URL}/today-price?commodity=${commodity}&market=${market}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch today's price: ${response.statusText}`);
    }
    return response.json();
  };

  const fetchPredictions = async (commodity: string, market: string): Promise<PredictionPoint[]> => {
    const response = await fetch(`${API_BASE_URL}/predict?commodity=${commodity}&market=${market}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch predictions: ${response.statusText}`);
    }
    return response.json();
  };

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check API status first
      await checkApiStatus();
      
      if (apiStatus === 'offline') {
        throw new Error('API server is not available. Please ensure the backend is running on http://localhost:8000');
      }

      // Fetch all data in parallel
      const [pastData, todayData, predictionData] = await Promise.all([
        fetchPastTrend(selectedCommodity, selectedMarket),
        fetchTodayPrice(selectedCommodity, selectedMarket),
        fetchPredictions(selectedCommodity, selectedMarket)
      ]);

      setPastTrend(pastData);
      setTodayPrice(todayData);
      setPredictions(predictionData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error loading data:', err);
      
      // Generate fallback mock data if API fails
      generateFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackData = () => {
    console.log('Generating fallback data...');
    
    // Generate past 15 days
    const past: PricePoint[] = [];
    const basePrice = 2500;
    
    for (let i = 15; i >= 1; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const price = basePrice + (Math.random() - 0.5) * 200 + Math.sin(i * 0.1) * 100;
      
      past.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100
      });
    }
    
    // Today's price
    const today: TodayPrice = {
      date: new Date().toISOString().split('T')[0],
      price: Math.round((basePrice + (Math.random() - 0.5) * 100) * 100) / 100,
      source: 'FALLBACK_DATA'
    };
    
    // Future 15 days predictions
    const future: PredictionPoint[] = [];
    let lastPrice = today.price;
    
    for (let i = 1; i <= 15; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Add some trend and randomness
      const trend = Math.sin(i * 0.15) * 50;
      const noise = (Math.random() - 0.5) * 80;
      lastPrice = lastPrice + trend + noise;
      
      future.push({
        date: date.toISOString().split('T')[0],
        predicted_price: Math.round(lastPrice * 100) / 100
      });
    }
    
    setPastTrend(past);
    setTodayPrice(today);
    setPredictions(future);
  };

  // Calculate price change from yesterday
  const calculatePriceChange = () => {
    if (!todayPrice || pastTrend.length === 0) return { change: 0, percentage: 0 };
    
    const yesterdayPrice = pastTrend[pastTrend.length - 1]?.price || todayPrice.price;
    const change = todayPrice.price - yesterdayPrice;
    const percentage = (change / yesterdayPrice) * 100;
    
    return { change, percentage };
  };

  const priceChange = calculatePriceChange();

  // Prepare chart data
  const chartData = {
    labels: [
      ...pastTrend.map(d => new Date(d.date).toLocaleDateString()),
      todayPrice ? new Date(todayPrice.date).toLocaleDateString() : '',
      ...predictions.map(d => new Date(d.date).toLocaleDateString())
    ].filter(Boolean),
    datasets: [
      {
        label: 'Past 15 Days (Actual)',
        data: [
          ...pastTrend.map(d => d.price),
          todayPrice?.price,
          ...new Array(predictions.length).fill(null)
        ],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.1,
        spanGaps: false,
      },
      {
        label: 'Next 15 Days (Predicted)',
        data: [
          ...new Array(pastTrend.length).fill(null),
          todayPrice?.price,
          ...predictions.map(d => d.predicted_price)
        ],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        borderDash: [8, 4],
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.1,
        spanGaps: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `${selectedCommodity} Price Analysis - ${selectedMarket} Market`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ₹${value?.toLocaleString() || 'N/A'}/quintal`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price (₹/quintal)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const commodities = availableOptions?.commodities || defaultCommodities;
  const markets = availableOptions?.markets || defaultMarkets;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Brain className="mr-3 text-blue-600" />
                Agricultural Market Price Prediction System
              </h1>
              <p className="text-gray-600">
                ML-powered 15-day price forecasting with real-time AGMARKNET integration
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {apiStatus === 'online' ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">API Online</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">API Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commodity
              </label>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {commodities.map((commodity) => (
                  <option key={commodity} value={commodity}>
                    {commodity}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {markets.map((market) => (
                  <option key={market} value={market}>
                    {market}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={loadAllData}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Predict Prices
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Data</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <p className="text-red-600 text-xs mt-2">
                  Showing fallback data. Please ensure the ML backend is running on http://localhost:8000
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Today's Market Price */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="mr-2 text-green-600" />
            Today's Market Price
          </h2>
          {todayPrice ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-gray-900">
                  ₹{todayPrice.price.toLocaleString()}
                  <span className="text-lg font-normal text-gray-500">/quintal</span>
                </div>
                <div className={`flex items-center mt-2 ${priceChange.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange.change >= 0 ? (
                    <TrendingUp className="h-5 w-5 mr-1" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-1" />
                  )}
                  <span className="font-medium">
                    ₹{Math.abs(priceChange.change).toFixed(2)} ({Math.abs(priceChange.percentage).toFixed(2)}%)
                  </span>
                  <span className="text-gray-500 ml-2">vs yesterday</span>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    todayPrice.source === 'AGMARKNET' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {todayPrice.source === 'AGMARKNET' ? '🌐 Real-time AGMARKNET' : '📊 CSV Fallback'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Date</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(todayPrice.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Click "Predict Prices" to load current market data
            </div>
          )}
        </div>

        {/* Section 1 & 3: Combined Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Price Trend Analysis & 15-Day Predictions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Past 15 Days</h3>
              <p className="text-sm text-blue-700">Historical actual prices</p>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                {pastTrend.length} days
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Today's Price</h3>
              <p className="text-sm text-green-700">Current market rate</p>
              <div className="text-2xl font-bold text-green-600 mt-2">
                ₹{todayPrice?.price.toLocaleString() || '---'}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium text-red-900">Next 15 Days</h3>
              <p className="text-sm text-red-700">ML predictions</p>
              <div className="text-2xl font-bold text-red-600 mt-2">
                {predictions.length} days
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading price data and generating predictions...</p>
              </div>
            </div>
          ) : (
            <div className="h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Insights and Model Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="mr-2 text-yellow-500" />
              Key Insights
            </h3>
            {predictions.length > 0 ? (
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">
                    Average predicted price: ₹{Math.round(predictions.reduce((sum, p) => sum + p.predicted_price, 0) / predictions.length).toLocaleString()}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">
                    Price range: ₹{Math.min(...predictions.map(p => p.predicted_price)).toFixed(0)} - ₹{Math.max(...predictions.map(p => p.predicted_price)).toFixed(0)}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">
                    Trend: {predictions[predictions.length - 1]?.predicted_price > predictions[0]?.predicted_price ? 'Increasing' : 'Decreasing'} over 15 days
                  </span>
                </li>
              </ul>
            ) : (
              <p className="text-gray-500">Load predictions to see insights</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ML Model Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Algorithm:</span>
                <span className="font-medium">Random Forest Regressor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Training Data:</span>
                <span className="font-medium">5 Years Historical</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Features:</span>
                <span className="font-medium">12 Time-series Variables</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Forecasting Method:</span>
                <span className="font-medium">Recursive (1-day steps)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data Source:</span>
                <span className="font-medium">AGMARKNET + CSV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Status:</span>
                <span className={`font-medium ${apiStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                  {apiStatus === 'online' ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictions;