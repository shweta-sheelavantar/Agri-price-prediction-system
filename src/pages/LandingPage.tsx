import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import PriceTicker from '../components/PriceTicker';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import AuthRequiredNotification from '../components/AuthRequiredNotification';
import { Phone, Mail, TrendingUp, Brain, Users, Shield, Zap, Globe } from 'lucide-react';
import { marketPricesAPI } from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [mobileNumber, setMobileNumber] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('Wheat (गेहूं)');
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [showAuthNotification, setShowAuthNotification] = useState(false);
  
  // Price checker state
  const [selectedCrop, setSelectedCrop] = useState('Onion');
  const [userLocation, setUserLocation] = useState('Nashik, Maharashtra');
  const [currentPrice, setCurrentPrice] = useState(2840);
  const [predictedPrice, setPredictedPrice] = useState(3180);
  const [priceChange, setPriceChange] = useState(12);

  const crops = [
    'Wheat (गेहूं)',
    'Rice (चावल)',
    'Cotton (कपास)',
    'Sugarcane (गन्ना)',
    'Onion (प्याज)',
    'Tomato (टमाटर)',
    'Potato (आलू)',
    'Soybean (सोयाबीन)',
    'Maize (मक्का)',
    'Groundnut (मूंगफली)',
  ];

  const priceCheckCrops = ['Wheat', 'Rice', 'Cotton', 'Onion', 'Tomato', 'Potato', 'Soybean'];

  // DISABLED: Auto-redirect for authenticated users
  // Uncomment to re-enable automatic redirect to dashboard
  /*
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 User is authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  */

  useEffect(() => {
    // Fetch price for selected crop
    const fetchPrice = async () => {
      try {
        const prices = await marketPricesAPI.getAll({ commodity: selectedCrop });
        if (prices.length > 0) {
          setCurrentPrice(prices[0].price.value);
          setPredictedPrice(Math.round(prices[0].price.value * 1.12));
          setPriceChange(12);
        }
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };
    fetchPrice();
  }, [selectedCrop]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    // Show authentication modal if not logged in
    if (mobileNumber || primaryCrop !== 'Wheat (गेहूं)') {
      setAuthModalMode('signin');
      setShowAuthModal(true);
      return;
    }

    // Legacy login for backward compatibility
    if (mobileNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      await login(mobileNumber, primaryCrop);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
      {/* Price Ticker */}
      <PriceTicker />
      
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            {t('landing.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-gray-300">
            {t('landing.hero.subtitle')}
          </p>
          <p className="text-sm md:text-base mb-8 text-gray-400">
            {t('landing.hero.features')}
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Your Smart Farming Companion
            </h2>
            
            {/* Key Benefits */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">Live Mandi Prices</p>
                  <p className="text-xs text-gray-500">Real-time prices from 2,400+ mandis across India</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">AI Price Predictions</p>
                  <p className="text-xs text-gray-500">Know the best time to sell with 85%+ accuracy</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">Direct Buyer Connect</p>
                  <p className="text-xs text-gray-500">Skip middlemen, get better prices for your crops</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('signup');
                  setShowAuthModal(true);
                }}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Create Free Account
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('signin');
                  setShowAuthModal(true);
                }}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              100% Free • No hidden charges • Works on any phone
            </p>
          </div>

          <div className="mt-8 text-sm text-gray-400">
            {t('landing.hero.form.time')}
          </div>
        </div>
      </section>

      {/* Price Checker Widget */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
              {t('landing.priceChecker.title')}
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              {t('landing.priceChecker.subtitle')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Crop Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('landing.priceChecker.selectCrop')}
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-800"
                >
                  {priceCheckCrops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('landing.priceChecker.location')}
                </label>
                <input
                  type="text"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-800"
                  placeholder="City, State"
                />
              </div>
            </div>

            {/* Price Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Today's Rate */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">{t('landing.priceChecker.todayRate')}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-blue-900">₹{currentPrice.toLocaleString()}</span>
                  <span className="text-lg text-blue-600 ml-2">/q</span>
                </div>
              </div>

              {/* Predicted Rate */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">{t('landing.priceChecker.predicted')}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-green-900">₹{predictedPrice.toLocaleString()}</span>
                  <span className="text-lg text-green-600 ml-2">/q</span>
                  <span className="text-sm font-semibold text-green-600 ml-2">↑{priceChange}%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/market-prices');
                  } else {
                    setShowAuthNotification(true);
                  }
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                {t('landing.priceChecker.analysis')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            {t('landing.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('landing.features.realtime.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('landing.features.realtime.desc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('landing.features.ai.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('landing.features.ai.desc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('landing.features.buyers.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('landing.features.buyers.desc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 dark:bg-yellow-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('landing.features.secure.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('landing.features.secure.desc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-red-100 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('landing.features.instant.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('landing.features.instant.desc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 dark:bg-indigo-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('landing.features.everywhere.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('landing.features.everywhere.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">8.4 Lakh+</div>
              <div className="text-gray-600">farmers using daily</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">2,400+</div>
              <div className="text-gray-600">mandis in 29 states</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">Backed by</div>
              <div className="text-gray-600">[Your Partner / Government Name]</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">What Farmers Say</h2>
          <p className="text-center text-gray-600 mb-12">Real stories from real farmers across India</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Ramesh Kumar</div>
                  <div className="text-sm text-gray-500">Punjab</div>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-yellow-400 text-xl">★★★★★</span>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "This app helped me get ₹2 Lakh extra for my wheat crop. A must for every farmer."
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Sita Devi</div>
                  <div className="text-sm text-gray-500">Maharashtra</div>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-yellow-400 text-xl">★★★★★</span>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "I check the price every morning. Now I know the best time to sell my onions."
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Anand Patel</div>
                  <div className="text-sm text-gray-500">Gujarat</div>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-yellow-400 text-xl">★★★★★</span>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "Direct contact with buyers is amazing. No more middleman fees for my cotton."
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Mohan Singh</div>
                  <div className="text-sm text-gray-500">Rajasthan</div>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-yellow-400 text-xl">★★★★★</span>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "AI predictions helped me plan better. Sold at the right time and earned 40% more!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Get Started in 10 Seconds
          </h2>
          <p className="text-center text-gray-600 mb-12">
            No password, no OTP, no download. Just instant access.
          </p>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Enter Mobile Number</h3>
                <p className="text-gray-600">Just your 10-digit number, no password needed</p>
              </div>

              <div className="text-center">
                <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Select Your Crop</h3>
                <p className="text-gray-600">Choose your primary crop from the dropdown</p>
              </div>

              <div className="text-center">
                <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Start Earning More</h3>
                <p className="text-gray-600">Get instant access to prices, predictions & buyers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <TrendingUp className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                Start earning ₹1–3 Lakh extra this season
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-primary-100">
                Join 8.4 Lakh+ farmers who are already earning more with AgriFriend
              </p>
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-lg transition-all transform hover:scale-105 shadow-2xl text-lg"
            >
              OPEN AGRIFRIEND NOW – FREE
            </button>
            
            <p className="text-sm text-primary-100 mt-6">
              Takes 8 seconds • No download • Works on any phone
            </p>

            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-sm text-primary-100">Free Forever</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-primary-100">Support Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">10+</div>
                <div className="text-sm text-primary-100">Languages</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Support & Helpline</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>Toll-Free: 1800-XXX-XXXX</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>WhatsApp: +91 98765 43210</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-bold text-lg mb-4">Made in India for Indian Farmers</h3>
              <p className="text-gray-400">AgriFriend © 2025</p>
            </div>

            <div className="text-right">
              <h3 className="font-bold text-lg mb-4">Our Promise</h3>
              <p className="text-gray-400 mb-2">We never sell your data or number</p>
              <div className="space-x-4">
                <a href="#" className="text-gray-400 hover:text-white underline">About Us</a>
                <a href="#" className="text-gray-400 hover:text-white underline">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
