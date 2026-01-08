import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  Settings
} from 'lucide-react';
import { TimeSeriesAnalyzer, TimeSeriesPrediction, ForecastSummary } from '../services/timeSeriesAnalysis';
import { MarketPrice } from '../types';

interface AdvancedForecastChartProps {
  price: MarketPrice;
  days?: number;
  showOptimalStrategy?: boolean;
  quantity?: number;
}

const AdvancedForecastChart: React.FC<AdvancedForecastChartProps> = ({ 
  price, 
  days = 15, 
  showOptimalStrategy = true,
  quantity = 100 
}) => {
  const [predictions, setPredictions] = useState<TimeSeriesPrediction[]>([]);
  const [summary, setSummary] = useState<ForecastSummary | null>(null);
  const [strategy, setStrategy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'chart' | 'table' | 'strategy'>('chart');
  const [forecastOptions, setForecastOptions] = useState({
    includeWeatherImpact: true,
    includePolicyImpact: true,
    includeGlobalFactors: false
  });

  useEffect(() => {
    generateForecast();
  }, [price, days, forecastOptions]);

  const generateForecast = async () => {
    setLoading(true);
    
    try {
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const forecastPredictions = TimeSeriesAnalyzer.generateAdvancedForecast(
        price, 
        days, 
        forecastOptions
      );
      
      const forecastSummary = TimeSeriesAnalyzer.generateForecastSummary(
        forecastPredictions, 
        price.price.value
      );
      
      const sellingStrategy = showOptimalStrategy ? 
        TimeSeriesAnalyzer.generateOptimalSellingStrategy(
          forecastPredictions, 
          price.price.value, 
          quantity
        ) : null;
      
      setPredictions(forecastPredictions);
      setSummary(forecastSummary);
      setStrategy(sellingStrategy);
    } catch (error) {
      console.error('Forecast generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    return [
      {
        date: 'Today',
        price: price.price.value,
        confidence: 100,
        type: 'current'
      },
      ...predictions.map((pred, index) => ({
        date: pred.date,
        price: pred.price,
        confidence: Math.round(pred.confidence * 100),
        volatility: pred.volatility,
        trend: pred.trend,
        type: 'prediction',
        day: index + 1
      }))
    ];
  };
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-lg font-bold text-blue-600">
            ₹{payload[0].value}
          </p>
          {data.type === 'prediction' && (
            <>
              <p className="text-sm text-gray-600">
                Confidence: {data.confidence}%
              </p>
              <p className="text-sm text-gray-600">
                Trend: <span className={`font-medium ${
                  data.trend === 'bullish' ? 'text-green-600' :
                  data.trend === 'bearish' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {data.trend}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Volatility: {data.volatility?.toFixed(1)}%
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Generating advanced forecast...</span>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          Analyzing {days}-day price patterns for {price.commodity}
        </div>
      </div>
    );
  }

  const chartData = formatChartData();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Advanced {days}-Day Price Forecast
            </h3>
            <p className="text-gray-600">
              {price.commodity} - {price.market.location}, {price.market.state}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedView('chart')}
              className={`px-3 py-1 rounded text-sm ${
                selectedView === 'chart' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setSelectedView('table')}
              className={`px-3 py-1 rounded text-sm ${
                selectedView === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Data
            </button>
            {showOptimalStrategy && (
              <button
                onClick={() => setSelectedView('strategy')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedView === 'strategy' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Strategy
              </button>
            )}
          </div>
        </div>

        {/* Forecast Options */}
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={forecastOptions.includeWeatherImpact}
              onChange={(e) => setForecastOptions(prev => ({
                ...prev,
                includeWeatherImpact: e.target.checked
              }))}
              className="mr-2"
            />
            Weather Impact
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={forecastOptions.includePolicyImpact}
              onChange={(e) => setForecastOptions(prev => ({
                ...prev,
                includePolicyImpact: e.target.checked
              }))}
              className="mr-2"
            />
            Policy Impact
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={forecastOptions.includeGlobalFactors}
              onChange={(e) => setForecastOptions(prev => ({
                ...prev,
                includeGlobalFactors: e.target.checked
              }))}
              className="mr-2"
            />
            Global Factors
          </label>
        </div>
      </div>
      {/* Summary Cards */}
      {summary && (
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Avg Price</p>
                  <p className="text-xl font-bold text-blue-800">₹{summary.averagePrice}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {((summary.averagePrice - price.price.value) / price.price.value * 100).toFixed(1)}% from current
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Peak Price</p>
                  <p className="text-xl font-bold text-green-800">₹{summary.peakPrice}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-green-600 mt-1">
                Day {summary.peakDay} - Best to sell
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Lowest Price</p>
                  <p className="text-xl font-bold text-red-800">₹{summary.lowestPrice}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-xs text-red-600 mt-1">
                Day {summary.lowestDay} - Avoid selling
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Profit Potential</p>
                  <p className="text-xl font-bold text-purple-800">₹{summary.profitPotential}</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Max gain per quintal
              </p>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <AlertTriangle className={`h-5 w-5 mr-2 ${
                  summary.volatilityRisk === 'high' ? 'text-red-500' :
                  summary.volatilityRisk === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`} />
                <span className="text-sm font-medium">
                  Risk Level: <span className={`${
                    summary.volatilityRisk === 'high' ? 'text-red-600' :
                    summary.volatilityRisk === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {summary.volatilityRisk.toUpperCase()}
                  </span>
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  Confidence: <span className="font-medium">{summary.confidenceLevel}%</span>
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  Trend: <span className={`font-medium ${
                    summary.overallTrend === 'bullish' ? 'text-green-600' :
                    summary.overallTrend === 'bearish' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {summary.overallTrend.toUpperCase()}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-6">
        {selectedView === 'chart' && (
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={price.price.value} 
                  stroke="#EF4444" 
                  strokeDasharray="5 5"
                  label={{ value: "Current Price", position: "top" }}
                />
                {summary && (
                  <ReferenceLine 
                    y={summary.averagePrice} 
                    stroke="#10B981" 
                    strokeDasharray="3 3"
                    label={{ value: "Avg Forecast", position: "top" }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.type === 'current') {
                      return <circle cx={cx} cy={cy} r={4} fill="#EF4444" stroke="#fff" strokeWidth={2} />;
                    }
                    return <circle cx={cx} cy={cy} r={2} fill="#3B82F6" />;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {selectedView === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Day</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-right py-3 px-4">Price</th>
                  <th className="text-center py-3 px-4">Confidence</th>
                  <th className="text-center py-3 px-4">Trend</th>
                  <th className="text-center py-3 px-4">Volatility</th>
                  <th className="text-left py-3 px-4">Key Factors</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{index + 1}</td>
                    <td className="py-3 px-4">{pred.fullDate}</td>
                    <td className="py-3 px-4 text-right font-bold text-lg">₹{pred.price}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pred.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                        pred.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(pred.confidence * 100)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pred.trend === 'bullish' ? 'bg-green-100 text-green-800' :
                        pred.trend === 'bearish' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pred.trend === 'bullish' ? '📈' :
                         pred.trend === 'bearish' ? '📉' : '➡️'} {pred.trend}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-sm font-medium ${
                        pred.volatility > 5 ? 'text-red-600' :
                        pred.volatility > 2 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {pred.volatility.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-600 max-w-xs">
                        {pred.factors.slice(0, 2).map((factor, i) => (
                          <div key={i}>• {factor}</div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedView === 'strategy' && strategy && (
          <div className="space-y-6">
            {/* Strategy Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                🎯 Recommended Strategy: {strategy.strategy}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Expected Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{strategy.expectedRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
                  <p className={`text-lg font-bold ${
                    strategy.riskLevel === 'high' ? 'text-red-600' :
                    strategy.riskLevel === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {strategy.riskLevel.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profit vs Current</p>
                  <p className="text-lg font-bold text-blue-600">
                    +₹{(strategy.expectedRevenue - (price.price.value * quantity)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Selling Schedule */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">📅 Optimal Selling Schedule</h4>
              <div className="space-y-3">
                {strategy.sellingSchedule.map((batch: any, index: number) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          Day {batch.day}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{batch.date}</p>
                          <p className="text-sm text-gray-600">{batch.reasoning}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">
                          {batch.quantity} quintals @ ₹{batch.expectedPrice}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          Revenue: ₹{(batch.quantity * batch.expectedPrice).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">💡 Strategic Recommendations</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {strategy.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedForecastChart;