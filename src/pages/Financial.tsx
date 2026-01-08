import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Plus,
  CreditCard,
  Wallet,
  Target,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateMockTransactions } from '../services/mockData';

interface Transaction {
  id: string;
  userId: string;
  type: 'sale' | 'purchase' | 'expense';
  commodity?: string;
  category?: string;
  quantity?: number;
  pricePerUnit?: number;
  totalAmount: number;
  description: string;
  transactionDate: Date;
  paymentMethod: string;
  paymentStatus: 'completed' | 'pending' | 'failed';
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyGrowth: number;
}

const Financial = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budget' | 'reports'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load financial data
    const loadFinancialData = () => {
      const mockTransactions = generateMockTransactions('user_1', 30);
      const transactionsWithDates = mockTransactions.map(txn => ({
        ...txn,
        transactionDate: new Date(txn.transactionDate),
        description: txn.commodity || 'General expense'
      }));
      
      setTransactions(transactionsWithDates);
      calculateSummary(transactionsWithDates);
      setIsLoading(false);
    };

    loadFinancialData();
  }, [selectedPeriod]);

  const calculateSummary = (txns: Transaction[]) => {
    const now = new Date();
    const periodStart = getPeriodStart(now, selectedPeriod);
    
    const periodTransactions = txns.filter(txn => txn.transactionDate >= periodStart);
    
    const totalIncome = periodTransactions
      .filter(txn => txn.type === 'sale')
      .reduce((sum, txn) => sum + txn.totalAmount, 0);
    
    const totalExpenses = periodTransactions
      .filter(txn => txn.type === 'purchase' || txn.type === 'expense')
      .reduce((sum, txn) => sum + txn.totalAmount, 0);
    
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    
    // Calculate growth (mock data)
    const monthlyGrowth = Math.random() * 20 - 5; // -5% to +15%
    
    setSummary({
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      monthlyGrowth
    });
  };

  const getPeriodStart = (date: Date, period: string): Date => {
    const start = new Date(date);
    switch (period) {
      case 'week':
        start.setDate(date.getDate() - 7);
        break;
      case 'month':
        start.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(date.getFullYear() - 1);
        break;
    }
    return start;
  };

  // Generate chart data
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      income: Math.floor(Math.random() * 200000) + 100000,
      expenses: Math.floor(Math.random() * 150000) + 50000,
      profit: Math.floor(Math.random() * 100000) + 20000
    }));
  };

  const generateExpenseBreakdown = () => [
    { name: 'Seeds', value: 35000, color: '#10b981' },
    { name: 'Fertilizers', value: 28000, color: '#3b82f6' },
    { name: 'Pesticides', value: 15000, color: '#f59e0b' },
    { name: 'Equipment', value: 45000, color: '#ef4444' },
    { name: 'Labor', value: 32000, color: '#8b5cf6' },
    { name: 'Others', value: 12000, color: '#6b7280' }
  ];

  const chartData = generateChartData();
  const expenseData = generateExpenseBreakdown();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading financial data...</p>
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Financial Management</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track income, expenses, and profitability
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700">
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-6 flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'transactions', label: 'Transactions', icon: CreditCard },
            { id: 'budget', label: 'Budget', icon: Target },
            { id: 'reports', label: 'Reports', icon: Download }
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
        {activeTab === 'overview' && summary && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Income</p>
                    <p className="text-2xl font-bold">₹{summary.totalIncome.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-green-100">
                    {summary.monthlyGrowth > 0 ? '+' : ''}{summary.monthlyGrowth.toFixed(1)}% from last period
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Total Expenses</p>
                    <p className="text-2xl font-bold">₹{summary.totalExpenses.toLocaleString()}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-200" />
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-red-100">
                    {Math.abs(summary.monthlyGrowth - 5).toFixed(1)}% from last period
                  </span>
                </div>
              </div>

              <div className={`bg-gradient-to-br ${summary.netProfit >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-lg shadow-lg p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={summary.netProfit >= 0 ? 'text-blue-100' : 'text-orange-100'}>Net Profit</p>
                    <p className="text-2xl font-bold">₹{summary.netProfit.toLocaleString()}</p>
                  </div>
                  <DollarSign className={`w-8 h-8 ${summary.netProfit >= 0 ? 'text-blue-200' : 'text-orange-200'}`} />
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm ${summary.netProfit >= 0 ? 'text-blue-100' : 'text-orange-100'}`}>
                    {summary.profitMargin.toFixed(1)}% profit margin
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Cash Flow</p>
                    <p className="text-2xl font-bold">₹{(summary.totalIncome * 0.7).toLocaleString()}</p>
                  </div>
                  <Wallet className="w-8 h-8 text-purple-200" />
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-purple-100">Available balance</span>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income vs Expenses Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, '']} />
                    <Bar dataKey="income" fill="#10b981" name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Expense Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, '']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profit Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Profit Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Profit']} />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        transaction.type === 'sale' 
                          ? 'bg-green-100 dark:bg-green-900/20' 
                          : 'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        {transaction.type === 'sale' ? (
                          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{transaction.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.transactionDate.toLocaleDateString()} • {transaction.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'sale' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'sale' ? '+' : '-'}₹{transaction.totalAmount.toLocaleString()}
                      </p>
                      <p className={`text-xs ${
                        transaction.paymentStatus === 'completed' 
                          ? 'text-green-600 dark:text-green-400'
                          : transaction.paymentStatus === 'pending'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.paymentStatus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Budget Planning</h3>
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Budget Planning Coming Soon</h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Set budgets, track spending, and get alerts when you're approaching limits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Financial Reports</h3>
              <div className="text-center py-12">
                <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Reports Coming Soon</h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Generate detailed financial reports for tax filing and business analysis.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Financial;
