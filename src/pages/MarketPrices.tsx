import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { marketPricesAPI } from '../services/api';
import { MarketPrice } from '../types';

const MarketPrices = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<MarketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [dateRange, setDateRange] = useState('today');
  const [showFilters, setShowFilters] = useState(false);
  
  // Chart state
  const [selectedPriceForChart, setSelectedPriceForChart] = useState<MarketPrice | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Comparison state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  const commodities = ['All', 'Wheat', 'Rice', 'Cotton', 'Onion', 'Tomato', 'Potato', 'Soybean', 'Maize', 'Sugarcane'];
  const states = ['All', 'Punjab', 'Maharashtra', 'Gujarat', 'Uttar Pradesh', 'Madhya Pradesh', 'Karnataka', 'Rajasthan'];

  useEffect(() => {
    fetchPrices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [prices, searchQuery, selectedCommodity, selectedState, dateRange]);

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const data = await marketPricesAPI.getAll({});
      setPrices(data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...prices];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.market.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Commodity filter
    if (selectedCommodity !== 'All') {
      filtered = filtered.filter(p => p.commodity === selectedCommodity);
    }

    // State filter
    if (selectedState !== 'All') {
      filtered = filtered.filter(p => p.market.state === selectedState);
    }

    // Date range filter
    const now = new Date();
    if (dateRange === 'today') {
      filtered = filtered.filter(p => {
        const priceDate = new Date(p.timestamp);
        return priceDate.toDateString() === now.toDateString();
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(p => new Date(p.timestamp) >= weekAgo);
    }

    setFilteredPrices(filtered);
  };

  const generateChartData = async (price: MarketPrice) => {
    // Generate 30 days of historical data
    const data = [];
    const basePrice = price.price.value;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.15; // ±15% variation
      const value = Math.round(basePrice * (1 + variation));
      
      data.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: value
      });
    }
    
    setChartData(data);
    setSelectedPriceForChart(price);
  };

  const exportToCSV = () => {
    const headers = ['Commodity', 'Market', 'State', 'Price', 'Unit', 'Change %', 'Date'];
    const rows = filteredPrices.map(p => [
      p.commodity,
      p.market.location,
      p.market.state,
      p.price.value,
      p.price.unit,
      p.priceChange.percentage.toFixed(2),
      new Date(p.timestamp).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-prices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const toggleComparison = (priceId: string) => {
    if (selectedForComparison.includes(priceId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== priceId));
    } else if (selectedForComparison.length < 4) {
      setSelectedForComparison([...selectedForComparison, priceId]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading market prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-primary-600">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">Market Prices</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  comparisonMode ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Compare
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search commodity or market..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
                <select
                  value={selectedCommodity}
                  onChange={(e) => setSelectedCommodity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {commodities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredPrices.length} results
          {comparisonMode && selectedForComparison.length > 0 && (
            <span className="ml-2 text-primary-600">
              ({selectedForComparison.length} selected for comparison)
            </span>
          )}
        </div>

        {/* Price Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredPrices.map((price) => (
            <div
              key={price.id}
              className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 ${
                selectedForComparison.includes(price.id) ? 'ring-2 ring-primary-600' : ''
              }`}
            >
              {/* Comparison Checkbox */}
              {comparisonMode && (
                <div className="mb-3">
                  <input
                    type="checkbox"
                    checked={selectedForComparison.includes(price.id)}
                    onChange={() => toggleComparison(price.id)}
                    className="w-4 h-4 text-primary-600"
                  />
                </div>
              )}

              {/* Commodity Name */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{price.commodity}</h3>

              {/* Location */}
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{price.market.location}, {price.market.state}</span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">₹{price.price.value}</span>
                  <span className="text-gray-600 ml-2">/{price.price.unit}</span>
                </div>
              </div>

              {/* Price Change */}
              <div className={`flex items-center mb-4 ${
                price.priceChange.value >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {price.priceChange.value >= 0 ? (
                  <TrendingUp className="w-5 h-5 mr-1" />
                ) : (
                  <TrendingDown className="w-5 h-5 mr-1" />
                )}
                <span className="font-semibold">
                  {price.priceChange.value >= 0 ? '+' : ''}
                  {price.priceChange.percentage.toFixed(2)}%
                </span>
                <span className="text-gray-600 ml-2 text-sm">from yesterday</span>
              </div>

              {/* Date */}
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{new Date(price.timestamp).toLocaleDateString('en-IN')}</span>
              </div>

              {/* View Chart Button */}
              <button
                onClick={() => generateChartData(price)}
                className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                View Price Trend
              </button>
            </div>
          ))}
        </div>

        {/* Comparison View */}
        {comparisonMode && selectedForComparison.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Price Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Commodity</th>
                    <th className="text-left py-3 px-4">Market</th>
                    <th className="text-right py-3 px-4">Price</th>
                    <th className="text-right py-3 px-4">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices
                    .filter(p => selectedForComparison.includes(p.id))
                    .map(price => (
                      <tr key={price.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{price.commodity}</td>
                        <td className="py-3 px-4">{price.market.location}, {price.market.state}</td>
                        <td className="py-3 px-4 text-right font-bold">₹{price.price.value}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          price.priceChange.value >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {price.priceChange.value >= 0 ? '+' : ''}
                          {price.priceChange.percentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Price Chart Modal */}
        {selectedPriceForChart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedPriceForChart.commodity} Price Trend
                    </h2>
                    <p className="text-gray-600">
                      {selectedPriceForChart.market.location}, {selectedPriceForChart.market.state}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPriceForChart(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Chart */}
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={{ fill: '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Historical Data Table */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">30-Day Historical Data</h3>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left py-2 px-4">Date</th>
                          <th className="text-right py-2 px-4">Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{item.date}</td>
                            <td className="py-2 px-4 text-right font-medium">₹{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPrices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No prices found matching your filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCommodity('All');
                setSelectedState('All');
                setDateRange('today');
              }}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPrices;
