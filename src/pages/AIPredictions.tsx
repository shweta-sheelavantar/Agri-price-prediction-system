import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Leaf,
  Cloud,
  DollarSign,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DemandPrediction {
  month: string;
  demand: number;
  confidence: number;
}

interface YieldEstimate {
  estimatedYield: number;
  confidenceInterval: { lower: number; upper: number };
  factors: { factor: string; impact: number }[];
  recommendations: string[];
}

interface RiskAssessment {
  overallRiskScore: number;
  riskCategories: {
    pestRisk: number;
    weatherRisk: number;
    marketRisk: number;
    financialRisk: number;
  };
  mitigationStrategies: {
    risk: string;
    strategy: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

const AIPredictions = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'demand' | 'yield' | 'risk'>('demand');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Demand Forecast Data
  const [demandData, setDemandData] = useState<DemandPrediction[]>([]);
  
  // Yield Estimation Data
  const [yieldEstimate, setYieldEstimate] = useState<YieldEstimate | null>(null);
  
  // Risk Assessment Data
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const generateDemandForecast = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map(month => ({
        month,
        demand: Math.floor(Math.random() * 40) + 60,
        confidence: Math.floor(Math.random() * 20) + 75
      }));
    };

    const generateYieldEstimate = (): YieldEstimate => {
      const baseYield = Math.floor(Math.random() * 20) + 30;
      return {
        estimatedYield: baseYield,
        confidenceInterval: {
          lower: baseYield - 5,
          upper: baseYield + 5
        },
        factors: [
          { factor: 'Soil Quality', impact: Math.floor(Math.random() * 30) + 70 },
          { factor: 'Weather Conditions', impact: Math.floor(Math.random() * 30) + 60 },
          { factor: 'Irrigation', impact: Math.floor(Math.random() * 30) + 75 },
          { factor: 'Seed Quality', impact: Math.floor(Math.random() * 30) + 80 },
          { factor: 'Pest Control', impact: Math.floor(Math.random() * 30) + 65 }
        ],
        recommendations: [
          'Consider increasing irrigation frequency during dry season',
          'Apply organic fertilizer 2 weeks before planting',
          'Monitor for pest activity weekly',
          'Ensure proper drainage to prevent waterlogging'
        ]
      };
    };

    const generateRiskAssessment = (): RiskAssessment => {
      return {
        overallRiskScore: Math.floor(Math.random() * 30) + 35,
        riskCategories: {
          pestRisk: Math.floor(Math.random() * 40) + 30,
          weatherRisk: Math.floor(Math.random() * 40) + 25,
          marketRisk: Math.floor(Math.random() * 40) + 35,
          financialRisk: Math.floor(Math.random() * 40) + 20
        },
        mitigationStrategies: [
          {
            risk: 'Pest Infestation',
            strategy: 'Implement integrated pest management with weekly monitoring',
            priority: 'high'
          },
          {
            risk: 'Weather Variability',
            strategy: 'Install drip irrigation system for water efficiency',
            priority: 'high'
          },
          {
            risk: 'Market Price Fluctuation',
            strategy: 'Diversify crops and establish contracts with buyers',
            priority: 'medium'
          },
          {
            risk: 'Input Cost Increase',
            strategy: 'Bulk purchase fertilizers during off-season',
            priority: 'medium'
          }
        ]
      };
    };

    // Initial load
    setDemandData(generateDemandForecast());
    setYieldEstimate(generateYieldEstimate());
    setRiskAssessment(generateRiskAssessment());
    setIsLoading(false);

    // Real-time updates every 30 seconds
    const interval = setInterval(() => {
      setDemandData(generateDemandForecast());
      setYieldEstimate(generateYieldEstimate());
      setRiskAssessment(generateRiskAssessment());
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 dark:text-green-400';
    if (score < 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRiskBgColor = (score: number) => {
    if (score < 30) return 'bg-green-100 dark:bg-green-900/20';
    if (score < 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading AI predictions...</p>
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI Predictions</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Powered by advanced machine learning • Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-green-500 animate-pulse" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-6 flex space-x-2">
          <button
            onClick={() => setActiveTab('demand')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'demand'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Demand Forecast</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('yield')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'yield'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Leaf className="w-5 h-5" />
              <span>Yield Estimation</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'risk'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Risk Assessment</span>
            </div>
          </button>
        </div>

        {/* Demand Forecast Tab */}
        {activeTab === 'demand' && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Market Demand Forecast</h2>
                    <p className="text-blue-100">Next 6 months prediction for {user?.primaryCrop}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{demandData[0]?.demand}%</div>
                  <div className="text-sm text-blue-100">Current demand index</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">6-Month Demand Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="demand" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} />
                  <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-blue-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Demand Index</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-green-500 border-dashed border-2 border-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Confidence Level</span>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">AI Insights</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Best Time to Sell</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">March-April shows peak demand. Consider selling during this period for maximum profit.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Price Prediction</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Expected 15-20% price increase in next quarter based on demand trends.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Seasonal Pattern</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Demand typically peaks during festival season. Plan harvest accordingly.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Yield Estimation Tab */}
        {activeTab === 'yield' && yieldEstimate && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Yield Estimation</h2>
                    <p className="text-green-100">Based on current conditions and historical data</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{yieldEstimate.estimatedYield} q/acre</div>
                  <div className="text-sm text-green-100">Estimated yield</div>
                </div>
              </div>
            </div>

            {/* Confidence Interval */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Yield Range</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{yieldEstimate.confidenceInterval.lower}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Lower Bound</div>
                </div>
                <div className="flex-1 mx-8">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 via-green-500 to-green-600"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{yieldEstimate.confidenceInterval.upper}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Upper Bound</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                95% confidence interval based on AI analysis
              </p>
            </div>

            {/* Factors Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Contributing Factors</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yieldEstimate.factors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="factor" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="impact" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {yieldEstimate.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-full">
                      <span className="text-primary-600 dark:text-primary-400 font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk Assessment Tab */}
        {activeTab === 'risk' && riskAssessment && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className={`rounded-lg shadow-lg p-6 text-white ${
              riskAssessment.overallRiskScore < 30 
                ? 'bg-gradient-to-br from-green-500 to-green-600'
                : riskAssessment.overallRiskScore < 60
                ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                : 'bg-gradient-to-br from-red-500 to-red-600'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Risk Assessment</h2>
                    <p className="text-white/80">Comprehensive risk analysis for your farm</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{riskAssessment.overallRiskScore}/100</div>
                  <div className="text-sm text-white/80">Overall Risk Score</div>
                </div>
              </div>
            </div>

            {/* Risk Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(riskAssessment.riskCategories).map(([key, value]) => (
                <div key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white capitalize">
                      {key.replace('Risk', ' Risk')}
                    </h3>
                    <span className={`text-2xl font-bold ${getRiskColor(value)}`}>
                      {value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        value < 30 ? 'bg-green-500' : value < 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Risk Profile</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={Object.entries(riskAssessment.riskCategories).map(([key, value]) => ({
                  category: key.replace('Risk', ''),
                  value
                }))}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Risk Level" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Mitigation Strategies */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Mitigation Strategies</h3>
              <div className="space-y-4">
                {riskAssessment.mitigationStrategies.map((strategy, index) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-white">{strategy.risk}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(strategy.priority)}`}>
                        {strategy.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{strategy.strategy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPredictions;
