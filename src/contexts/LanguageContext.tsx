import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'kn';
type Theme = 'light' | 'dark';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Landing Page
    'landing.hero.title': 'Open. Check Price. Earn More.',
    'landing.hero.subtitle': "India's #1 FREE web app for live mandi rates & AI predictions",
    'landing.hero.features': 'Works on any phone • No app install • 100% free',
    'landing.hero.form.title': 'Get Started in 10 Seconds',
    'landing.hero.form.subtitle': 'No password, no OTP, no download. Just instant access.',
    'landing.hero.form.mobile': '1. Enter your 10-digit mobile number',
    'landing.hero.form.crop': '2. Select your primary crop',
    'landing.hero.form.button': 'Open My Dashboard Instantly',
    'landing.hero.form.loading': 'Opening Dashboard...',
    'landing.hero.form.sms': 'We will send a secure login link to your mobile number via SMS',
    'landing.hero.form.time': 'Takes 8 seconds • No download • Works on any phone',
    
    // Price Checker
    'landing.priceChecker.title': "Check Your Crop's Price Instantly",
    'landing.priceChecker.subtitle': 'Select your crop to see live and predicted rates',
    'landing.priceChecker.selectCrop': 'Select Crop',
    'landing.priceChecker.location': 'Your Location (Auto-detected)',
    'landing.priceChecker.todayRate': "TODAY'S RATE",
    'landing.priceChecker.predicted': 'PREDICTED IN 12 DAYS',
    'landing.priceChecker.analysis': 'Get Full Price Analysis',
    
    // Features
    'landing.features.title': 'Why 8.4 Lakh+ Farmers Trust AgriFriend',
    'landing.features.realtime.title': 'Real-Time Prices',
    'landing.features.realtime.desc': 'Live mandi rates from 2,400+ markets across 29 states, updated every minute',
    'landing.features.ai.title': 'AI Predictions',
    'landing.features.ai.desc': 'Smart forecasts for demand, yield, and best selling time using advanced AI',
    'landing.features.buyers.title': 'Direct Buyers',
    'landing.features.buyers.desc': 'Connect directly with verified buyers - no middleman, no extra fees',
    'landing.features.secure.title': '100% Secure',
    'landing.features.secure.desc': 'Your data is encrypted and never sold. Government-backed security standards',
    'landing.features.instant.title': 'Instant Access',
    'landing.features.instant.desc': 'No password, no OTP, no download. Start in just 8 seconds',
    'landing.features.everywhere.title': 'Works Everywhere',
    'landing.features.everywhere.desc': 'Available in 10+ Indian languages. Works on any phone, even offline',
    
    // Stats
    'landing.stats.farmers': 'farmers using daily',
    'landing.stats.mandis': 'mandis in 29 states',
    'landing.stats.backed': 'Backed by',
    
    // Testimonials
    'landing.testimonials.title': 'What Farmers Say',
    'landing.testimonials.subtitle': 'Real stories from real farmers across India',
    
    // How It Works
    'landing.howItWorks.title': 'Get Started in 10 Seconds',
    'landing.howItWorks.subtitle': 'No password, no OTP, no download. Just instant access.',
    'landing.howItWorks.step1.title': 'Enter Mobile Number',
    'landing.howItWorks.step1.desc': 'Just your 10-digit number, no password needed',
    'landing.howItWorks.step2.title': 'Select Your Crop',
    'landing.howItWorks.step2.desc': 'Choose your primary crop from the dropdown',
    'landing.howItWorks.step3.title': 'Start Earning More',
    'landing.howItWorks.step3.desc': 'Get instant access to prices, predictions & buyers',
    
    // CTA
    'landing.cta.title': 'Start earning ₹1–3 Lakh extra this season',
    'landing.cta.subtitle': 'Join 8.4 Lakh+ farmers who are already earning more with AgriFriend',
    'landing.cta.button': 'OPEN AGRIFRIEND NOW – FREE',
    'landing.cta.time': 'Takes 8 seconds • No download • Works on any phone',
    'landing.cta.free': 'Free Forever',
    'landing.cta.support': 'Support Available',
    'landing.cta.languages': 'Languages',
    
    // Footer
    'landing.footer.support': 'Support & Helpline',
    'landing.footer.tollfree': 'Toll-Free: 1800-XXX-XXXX',
    'landing.footer.whatsapp': 'WhatsApp: +91 98765 43210',
    'landing.footer.made': 'Made in India for Indian Farmers',
    'landing.footer.promise': 'Our Promise',
    'landing.footer.privacy': 'We never sell your data or number',
    'landing.footer.about': 'About Us',
    'landing.footer.policy': 'Privacy Policy',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.happening': "Here's what's happening with your",
    'dashboard.today': 'today',
    'dashboard.todayPrice': "Today's Price",
    'dashboard.per': 'per',
    'dashboard.from': 'from yesterday',
    'dashboard.alerts': 'Active Alerts',
    'dashboard.unread': 'unread notifications',
    'dashboard.viewAll': 'View all →',
    'dashboard.farm': 'Your Farm',
    'dashboard.manageFarm': 'Manage farm →',
    'dashboard.setupProfile': 'Set up your farm profile',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.marketPrices': 'Market Prices',
    'dashboard.notifications': 'Notifications',
    'dashboard.noNotifications': 'No notifications',
    'dashboard.settings': 'Settings',
    'dashboard.logout': 'Logout',
    'dashboard.loading': 'Loading your dashboard...',
    'dashboard.loadingPrices': 'Loading prices...',
    
    // Quick Actions
    'actions.checkPrices': 'Check Prices',
    'actions.aiPredictions': 'AI Predictions',
    'actions.inventory': 'Inventory',
    'actions.financial': 'Financial',
    'actions.findBuyers': 'Find Buyers',
    
    // Bottom Nav
    'nav.home': 'Home',
    'nav.prices': 'Prices',
    'nav.ai': 'AI',
    'nav.inventory': 'Inventory',
    'nav.settings': 'Settings',
    
    // Market Prices
    'market.title': 'Market Prices',
    'market.compare': 'Compare',
    'market.export': 'Export',
    'market.search': 'Search commodity or market...',
    'market.filters': 'Filters',
    'market.commodity': 'Commodity',
    'market.state': 'State',
    'market.dateRange': 'Date Range',
    'market.today': 'Today',
    'market.week': 'Last 7 Days',
    'market.all': 'All Time',
    'market.showing': 'Showing',
    'market.results': 'results',
    'market.selected': 'selected for comparison',
    'market.viewTrend': 'View Price Trend',
    'market.comparison': 'Price Comparison',
    'market.market': 'Market',
    'market.price': 'Price',
    'market.change': 'Change',
    'market.trend': 'Price Trend',
    'market.historical': '30-Day Historical Data',
    'market.date': 'Date',
    'market.noResults': 'No prices found matching your filters',
    'market.clearFilters': 'Clear all filters',
    'market.loading': 'Loading market prices...',
    'market.fromYesterday': 'from yesterday',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.light': 'Light Mode',
    'settings.dark': 'Dark Mode',
    'settings.english': 'English',
    'settings.hindi': 'हिंदी (Hindi)',
    
    // Common
    'common.all': 'All',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.back': 'Back',
  },
  hi: {
    // Landing Page
    'landing.hero.title': 'खोलें। कीमत जांचें। अधिक कमाएं।',
    'landing.hero.subtitle': 'लाइव मंडी दरों और AI भविष्यवाणियों के लिए भारत का #1 मुफ्त वेब ऐप',
    'landing.hero.features': 'किसी भी फोन पर काम करता है • कोई ऐप इंस्टॉल नहीं • 100% मुफ्त',
    'landing.hero.form.title': '10 सेकंड में शुरू करें',
    'landing.hero.form.subtitle': 'कोई पासवर्ड नहीं, कोई OTP नहीं, कोई डाउनलोड नहीं। बस तुरंत एक्सेस।',
    'landing.hero.form.mobile': '1. अपना 10 अंकों का मोबाइल नंबर दर्ज करें',
    'landing.hero.form.crop': '2. अपनी प्राथमिक फसल चुनें',
    'landing.hero.form.button': 'मेरा डैशबोर्ड तुरंत खोलें',
    'landing.hero.form.loading': 'डैशबोर्ड खोल रहे हैं...',
    'landing.hero.form.sms': 'हम आपके मोबाइल नंबर पर SMS के माध्यम से एक सुरक्षित लॉगिन लिंक भेजेंगे',
    'landing.hero.form.time': '8 सेकंड लगते हैं • कोई डाउनलोड नहीं • किसी भी फोन पर काम करता है',
    
    // Price Checker
    'landing.priceChecker.title': 'अपनी फसल की कीमत तुरंत जांचें',
    'landing.priceChecker.subtitle': 'लाइव और अनुमानित दरें देखने के लिए अपनी फसल चुनें',
    'landing.priceChecker.selectCrop': 'फसल चुनें',
    'landing.priceChecker.location': 'आपका स्थान (स्वतः पता लगाया गया)',
    'landing.priceChecker.todayRate': 'आज की दर',
    'landing.priceChecker.predicted': '12 दिनों में अनुमानित',
    'landing.priceChecker.analysis': 'पूर्ण मूल्य विश्लेषण प्राप्त करें',
    
    // Features
    'landing.features.title': 'क्यों 8.4 लाख+ किसान AgriFriend पर भरोसा करते हैं',
    'landing.features.realtime.title': 'रियल-टाइम कीमतें',
    'landing.features.realtime.desc': '29 राज्यों में 2,400+ बाजारों से लाइव मंडी दरें, हर मिनट अपडेट',
    'landing.features.ai.title': 'AI भविष्यवाणियां',
    'landing.features.ai.desc': 'उन्नत AI का उपयोग करके मांग, उपज और सर्वोत्तम बिक्री समय के लिए स्मार्ट पूर्वानुमान',
    'landing.features.buyers.title': 'सीधे खरीदार',
    'landing.features.buyers.desc': 'सत्यापित खरीदारों से सीधे जुड़ें - कोई बिचौलिया नहीं, कोई अतिरिक्त शुल्क नहीं',
    'landing.features.secure.title': '100% सुरक्षित',
    'landing.features.secure.desc': 'आपका डेटा एन्क्रिप्टेड है और कभी नहीं बेचा जाता। सरकार समर्थित सुरक्षा मानक',
    'landing.features.instant.title': 'तुरंत एक्सेस',
    'landing.features.instant.desc': 'कोई पासवर्ड नहीं, कोई OTP नहीं, कोई डाउनलोड नहीं। बस 8 सेकंड में शुरू करें',
    'landing.features.everywhere.title': 'हर जगह काम करता है',
    'landing.features.everywhere.desc': '10+ भारतीय भाषाओं में उपलब्ध। किसी भी फोन पर काम करता है, ऑफलाइन भी',
    
    // Stats
    'landing.stats.farmers': 'किसान रोजाना उपयोग कर रहे हैं',
    'landing.stats.mandis': '29 राज्यों में मंडियां',
    'landing.stats.backed': 'समर्थित',
    
    // Testimonials
    'landing.testimonials.title': 'किसान क्या कहते हैं',
    'landing.testimonials.subtitle': 'पूरे भारत के वास्तविक किसानों की वास्तविक कहानियां',
    
    // How It Works
    'landing.howItWorks.title': '10 सेकंड में शुरू करें',
    'landing.howItWorks.subtitle': 'कोई पासवर्ड नहीं, कोई OTP नहीं, कोई डाउनलोड नहीं। बस तुरंत एक्सेस।',
    'landing.howItWorks.step1.title': 'मोबाइल नंबर दर्ज करें',
    'landing.howItWorks.step1.desc': 'बस आपका 10 अंकों का नंबर, कोई पासवर्ड की आवश्यकता नहीं',
    'landing.howItWorks.step2.title': 'अपनी फसल चुनें',
    'landing.howItWorks.step2.desc': 'ड्रॉपडाउन से अपनी प्राथमिक फसल चुनें',
    'landing.howItWorks.step3.title': 'अधिक कमाना शुरू करें',
    'landing.howItWorks.step3.desc': 'कीमतों, भविष्यवाणियों और खरीदारों तक तुरंत पहुंच प्राप्त करें',
    
    // CTA
    'landing.cta.title': 'इस सीजन ₹1–3 लाख अतिरिक्त कमाना शुरू करें',
    'landing.cta.subtitle': '8.4 लाख+ किसानों में शामिल हों जो पहले से ही AgriFriend के साथ अधिक कमा रहे हैं',
    'landing.cta.button': 'अभी AGRIFRIEND खोलें – मुफ्त',
    'landing.cta.time': '8 सेकंड लगते हैं • कोई डाउनलोड नहीं • किसी भी फोन पर काम करता है',
    'landing.cta.free': 'हमेशा के लिए मुफ्त',
    'landing.cta.support': 'सहायता उपलब्ध',
    'landing.cta.languages': 'भाषाएं',
    
    // Footer
    'landing.footer.support': 'सहायता और हेल्पलाइन',
    'landing.footer.tollfree': 'टोल-फ्री: 1800-XXX-XXXX',
    'landing.footer.whatsapp': 'व्हाट्सएप: +91 98765 43210',
    'landing.footer.made': 'भारतीय किसानों के लिए भारत में बनाया गया',
    'landing.footer.promise': 'हमारा वादा',
    'landing.footer.privacy': 'हम आपका डेटा या नंबर कभी नहीं बेचते',
    'landing.footer.about': 'हमारे बारे में',
    'landing.footer.policy': 'गोपनीयता नीति',
    
    // Dashboard
    'dashboard.welcome': 'वापसी पर स्वागत है',
    'dashboard.happening': 'आपकी फसल के साथ आज क्या हो रहा है',
    'dashboard.today': 'आज',
    'dashboard.todayPrice': 'आज की कीमत',
    'dashboard.per': 'प्रति',
    'dashboard.from': 'कल से',
    'dashboard.alerts': 'सक्रिय अलर्ट',
    'dashboard.unread': 'अपठित सूचनाएं',
    'dashboard.viewAll': 'सभी देखें →',
    'dashboard.farm': 'आपका फार्म',
    'dashboard.manageFarm': 'फार्म प्रबंधित करें →',
    'dashboard.setupProfile': 'अपना फार्म प्रोफाइल सेट करें',
    'dashboard.quickActions': 'त्वरित क्रियाएं',
    'dashboard.marketPrices': 'बाजार मूल्य',
    'dashboard.notifications': 'सूचनाएं',
    'dashboard.noNotifications': 'कोई सूचना नहीं',
    'dashboard.settings': 'सेटिंग्स',
    'dashboard.logout': 'लॉगआउट',
    'dashboard.loading': 'आपका डैशबोर्ड लोड हो रहा है...',
    'dashboard.loadingPrices': 'कीमतें लोड हो रही हैं...',
    
    // Quick Actions
    'actions.checkPrices': 'कीमतें जांचें',
    'actions.aiPredictions': 'AI भविष्यवाणियां',
    'actions.inventory': 'इन्वेंटरी',
    'actions.financial': 'वित्तीय',
    'actions.findBuyers': 'खरीदार खोजें',
    
    // Bottom Nav
    'nav.home': 'होम',
    'nav.prices': 'कीमतें',
    'nav.ai': 'AI',
    'nav.inventory': 'इन्वेंटरी',
    'nav.settings': 'सेटिंग्स',
    
    // Market Prices
    'market.title': 'बाजार मूल्य',
    'market.compare': 'तुलना करें',
    'market.export': 'निर्यात',
    'market.search': 'वस्तु या बाजार खोजें...',
    'market.filters': 'फ़िल्टर',
    'market.commodity': 'वस्तु',
    'market.state': 'राज्य',
    'market.dateRange': 'तिथि सीमा',
    'market.today': 'आज',
    'market.week': 'पिछले 7 दिन',
    'market.all': 'सभी समय',
    'market.showing': 'दिखा रहे हैं',
    'market.results': 'परिणाम',
    'market.selected': 'तुलना के लिए चयनित',
    'market.viewTrend': 'मूल्य प्रवृत्ति देखें',
    'market.comparison': 'मूल्य तुलना',
    'market.market': 'बाजार',
    'market.price': 'कीमत',
    'market.change': 'परिवर्तन',
    'market.trend': 'मूल्य प्रवृत्ति',
    'market.historical': '30-दिन का ऐतिहासिक डेटा',
    'market.date': 'तिथि',
    'market.noResults': 'आपके फ़िल्टर से मेल खाने वाली कोई कीमत नहीं मिली',
    'market.clearFilters': 'सभी फ़िल्टर साफ़ करें',
    'market.loading': 'बाजार मूल्य लोड हो रहे हैं...',
    'market.fromYesterday': 'कल से',
    
    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.language': 'भाषा',
    'settings.theme': 'थीम',
    'settings.light': 'लाइट मोड',
    'settings.dark': 'डार्क मोड',
    'settings.english': 'English (अंग्रेज़ी)',
    'settings.hindi': 'हिंदी',
    
    // Common
    'common.all': 'सभी',
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.close': 'बंद करें',
    'common.back': 'वापस',
  },
  kn: {
    // Landing Page
    'landing.hero.title': 'ತೆರೆಯಿರಿ. ಬೆಲೆ ಪರಿಶೀಲಿಸಿ. ಹೆಚ್ಚು ಗಳಿಸಿ.',
    'landing.hero.subtitle': 'ಲೈವ್ ಮಂಡಿ ದರಗಳು ಮತ್ತು AI ಮುನ್ಸೂಚನೆಗಳಿಗಾಗಿ ಭಾರತದ #1 ಉಚಿತ ವೆಬ್ ಅಪ್ಲಿಕೇಶನ್',
    'landing.hero.features': 'ಯಾವುದೇ ಫೋನ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ • ಅಪ್ಲಿಕೇಶನ್ ಇನ್‌ಸ್ಟಾಲ್ ಇಲ್ಲ • 100% ಉಚಿತ',
    'landing.hero.form.title': '10 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಪ್ರಾರಂಭಿಸಿ',
    'landing.hero.form.subtitle': 'ಪಾಸ್‌ವರ್ಡ್ ಇಲ್ಲ, OTP ಇಲ್ಲ, ಡೌನ್‌ಲೋಡ್ ಇಲ್ಲ. ತಕ್ಷಣ ಪ್ರವೇಶ.',
    'landing.hero.form.mobile': '1. ನಿಮ್ಮ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
    'landing.hero.form.crop': '2. ನಿಮ್ಮ ಪ್ರಾಥಮಿಕ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'landing.hero.form.button': 'ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತಕ್ಷಣ ತೆರೆಯಿರಿ',
    'landing.hero.form.loading': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ...',
    'landing.hero.form.sms': 'ನಾವು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ SMS ಮೂಲಕ ಸುರಕ್ಷಿತ ಲಾಗಿನ್ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತೇವೆ',
    'landing.hero.form.time': '8 ಸೆಕೆಂಡುಗಳು ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ • ಡೌನ್‌ಲೋಡ್ ಇಲ್ಲ • ಯಾವುದೇ ಫೋನ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    
    // Price Checker
    'landing.priceChecker.title': 'ನಿಮ್ಮ ಬೆಳೆಯ ಬೆಲೆಯನ್ನು ತಕ್ಷಣ ಪರಿಶೀಲಿಸಿ',
    'landing.priceChecker.subtitle': 'ಲೈವ್ ಮತ್ತು ಮುನ್ಸೂಚಿತ ದರಗಳನ್ನು ನೋಡಲು ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'landing.priceChecker.selectCrop': 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ',
    'landing.priceChecker.location': 'ನಿಮ್ಮ ಸ್ಥಳ (ಸ್ವಯಂ-ಪತ್ತೆ)',
    'landing.priceChecker.todayRate': 'ಇಂದಿನ ದರ',
    'landing.priceChecker.predicted': '12 ದಿನಗಳಲ್ಲಿ ಮುನ್ಸೂಚಿತ',
    'landing.priceChecker.analysis': 'ಸಂಪೂರ್ಣ ಬೆಲೆ ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಿರಿ',
    
    // Features
    'landing.features.title': 'ಏಕೆ 8.4 ಲಕ್ಷ+ ರೈತರು AgriFriend ಅನ್ನು ನಂಬುತ್ತಾರೆ',
    'landing.features.realtime.title': 'ರಿಯಲ್-ಟೈಮ್ ಬೆಲೆಗಳು',
    'landing.features.realtime.desc': '29 ರಾಜ್ಯಗಳಲ್ಲಿ 2,400+ ಮಾರುಕಟ್ಟೆಗಳಿಂದ ಲೈವ್ ಮಂಡಿ ದರಗಳು, ಪ್ರತಿ ನಿಮಿಷ ನವೀಕರಿಸಲಾಗುತ್ತದೆ',
    'landing.features.ai.title': 'AI ಮುನ್ಸೂಚನೆಗಳು',
    'landing.features.ai.desc': 'ಸುಧಾರಿತ AI ಬಳಸಿ ಬೇಡಿಕೆ, ಇಳುವರಿ ಮತ್ತು ಉತ್ತಮ ಮಾರಾಟ ಸಮಯಕ್ಕಾಗಿ ಸ್ಮಾರ್ಟ್ ಮುನ್ಸೂಚನೆಗಳು',
    'landing.features.buyers.title': 'ನೇರ ಖರೀದಿದಾರರು',
    'landing.features.buyers.desc': 'ಪರಿಶೀಲಿಸಿದ ಖರೀದಿದಾರರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ - ಮಧ್ಯವರ್ತಿ ಇಲ್ಲ, ಹೆಚ್ಚುವರಿ ಶುಲ್ಕಗಳಿಲ್ಲ',
    'landing.features.secure.title': '100% ಸುರಕ್ಷಿತ',
    'landing.features.secure.desc': 'ನಿಮ್ಮ ಡೇಟಾ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದೆ ಮತ್ತು ಎಂದಿಗೂ ಮಾರಾಟ ಮಾಡಲಾಗುವುದಿಲ್ಲ. ಸರ್ಕಾರ-ಬೆಂಬಲಿತ ಭದ್ರತಾ ಮಾನದಂಡಗಳು',
    'landing.features.instant.title': 'ತಕ್ಷಣ ಪ್ರವೇಶ',
    'landing.features.instant.desc': 'ಪಾಸ್‌ವರ್ಡ್ ಇಲ್ಲ, OTP ಇಲ್ಲ, ಡೌನ್‌ಲೋಡ್ ಇಲ್ಲ. ಕೇವಲ 8 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಪ್ರಾರಂಭಿಸಿ',
    'landing.features.everywhere.title': 'ಎಲ್ಲೆಡೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    'landing.features.everywhere.desc': '10+ ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಲಭ್ಯವಿದೆ. ಯಾವುದೇ ಫೋನ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ, ಆಫ್‌ಲೈನ್ ಕೂಡ',
    
    // Stats
    'landing.stats.farmers': 'ರೈತರು ದೈನಂದಿನ ಬಳಕೆ',
    'landing.stats.mandis': '29 ರಾಜ್ಯಗಳಲ್ಲಿ ಮಂಡಿಗಳು',
    'landing.stats.backed': 'ಬೆಂಬಲಿತ',
    
    // Testimonials
    'landing.testimonials.title': 'ರೈತರು ಏನು ಹೇಳುತ್ತಾರೆ',
    'landing.testimonials.subtitle': 'ಭಾರತದಾದ್ಯಂತ ನಿಜವಾದ ರೈತರ ನಿಜವಾದ ಕಥೆಗಳು',
    
    // How It Works
    'landing.howItWorks.title': '10 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಪ್ರಾರಂಭಿಸಿ',
    'landing.howItWorks.subtitle': 'ಪಾಸ್‌ವರ್ಡ್ ಇಲ್ಲ, OTP ಇಲ್ಲ, ಡೌನ್‌ಲೋಡ್ ಇಲ್ಲ. ತಕ್ಷಣ ಪ್ರವೇಶ.',
    'landing.howItWorks.step1.title': 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
    'landing.howItWorks.step1.desc': 'ಕೇವಲ ನಿಮ್ಮ 10-ಅಂಕಿಯ ಸಂಖ್ಯೆ, ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ',
    'landing.howItWorks.step2.title': 'ನಿಮ್ಮ ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ',
    'landing.howItWorks.step2.desc': 'ಡ್ರಾಪ್‌ಡೌನ್‌ನಿಂದ ನಿಮ್ಮ ಪ್ರಾಥಮಿಕ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'landing.howItWorks.step3.title': 'ಹೆಚ್ಚು ಗಳಿಸಲು ಪ್ರಾರಂಭಿಸಿ',
    'landing.howItWorks.step3.desc': 'ಬೆಲೆಗಳು, ಮುನ್ಸೂಚನೆಗಳು ಮತ್ತು ಖರೀದಿದಾರರಿಗೆ ತಕ್ಷಣ ಪ್ರವೇಶ ಪಡೆಯಿರಿ',
    
    // CTA
    'landing.cta.title': 'ಈ ಋತುವಿನಲ್ಲಿ ₹1–3 ಲಕ್ಷ ಹೆಚ್ಚುವರಿ ಗಳಿಸಲು ಪ್ರಾರಂಭಿಸಿ',
    'landing.cta.subtitle': 'ಈಗಾಗಲೇ AgriFriend ನೊಂದಿಗೆ ಹೆಚ್ಚು ಗಳಿಸುತ್ತಿರುವ 8.4 ಲಕ್ಷ+ ರೈತರನ್ನು ಸೇರಿ',
    'landing.cta.button': 'ಈಗ AGRIFRIEND ತೆರೆಯಿರಿ – ಉಚಿತ',
    'landing.cta.time': '8 ಸೆಕೆಂಡುಗಳು ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ • ಡೌನ್‌ಲೋಡ್ ಇಲ್ಲ • ಯಾವುದೇ ಫೋನ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    'landing.cta.free': 'ಶಾಶ್ವತವಾಗಿ ಉಚಿತ',
    'landing.cta.support': 'ಬೆಂಬಲ ಲಭ್ಯವಿದೆ',
    'landing.cta.languages': 'ಭಾಷೆಗಳು',
    
    // Footer
    'landing.footer.support': 'ಬೆಂಬಲ ಮತ್ತು ಹೆಲ್ಪ್‌ಲೈನ್',
    'landing.footer.tollfree': 'ಟೋಲ್-ಫ್ರೀ: 1800-XXX-XXXX',
    'landing.footer.whatsapp': 'ವಾಟ್ಸಾಪ್: +91 98765 43210',
    'landing.footer.made': 'ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ಭಾರತದಲ್ಲಿ ತಯಾರಿಸಲಾಗಿದೆ',
    'landing.footer.promise': 'ನಮ್ಮ ಭರವಸೆ',
    'landing.footer.privacy': 'ನಾವು ನಿಮ್ಮ ಡೇಟಾ ಅಥವಾ ಸಂಖ್ಯೆಯನ್ನು ಎಂದಿಗೂ ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ',
    'landing.footer.about': 'ನಮ್ಮ ಬಗ್ಗೆ',
    'landing.footer.policy': 'ಗೌಪ್ಯತಾ ನೀತಿ',
    
    // Dashboard
    'dashboard.welcome': 'ಮರಳಿ ಸ್ವಾಗತ',
    'dashboard.happening': 'ನಿಮ್ಮ ಬೆಳೆಯೊಂದಿಗೆ ಇಂದು ಏನಾಗುತ್ತಿದೆ',
    'dashboard.today': 'ಇಂದು',
    'dashboard.todayPrice': 'ಇಂದಿನ ಬೆಲೆ',
    'dashboard.per': 'ಪ್ರತಿ',
    'dashboard.from': 'ನಿನ್ನೆಯಿಂದ',
    'dashboard.alerts': 'ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು',
    'dashboard.unread': 'ಓದದ ಅಧಿಸೂಚನೆಗಳು',
    'dashboard.viewAll': 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ →',
    'dashboard.farm': 'ನಿಮ್ಮ ಫಾರ್ಮ್',
    'dashboard.manageFarm': 'ಫಾರ್ಮ್ ನಿರ್ವಹಿಸಿ →',
    'dashboard.setupProfile': 'ನಿಮ್ಮ ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್ ಹೊಂದಿಸಿ',
    'dashboard.quickActions': 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
    'dashboard.marketPrices': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
    'dashboard.notifications': 'ಅಧಿಸೂಚನೆಗಳು',
    'dashboard.noNotifications': 'ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ',
    'dashboard.settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    'dashboard.logout': 'ಲಾಗ್ಔಟ್',
    'dashboard.loading': 'ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'dashboard.loadingPrices': 'ಬೆಲೆಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...',
    
    // Quick Actions
    'actions.checkPrices': 'ಬೆಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    'actions.aiPredictions': 'AI ಮುನ್ಸೂಚನೆಗಳು',
    'actions.inventory': 'ದಾಸ್ತಾನು',
    'actions.financial': 'ಹಣಕಾಸು',
    'actions.findBuyers': 'ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ',
    
    // Bottom Nav
    'nav.home': 'ಮುಖಪುಟ',
    'nav.prices': 'ಬೆಲೆಗಳು',
    'nav.ai': 'AI',
    'nav.inventory': 'ದಾಸ್ತಾನು',
    'nav.settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    
    // Market Prices
    'market.title': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
    'market.compare': 'ಹೋಲಿಕೆ ಮಾಡಿ',
    'market.export': 'ರಫ್ತು',
    'market.search': 'ಸರಕು ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಹುಡುಕಿ...',
    'market.filters': 'ಫಿಲ್ಟರ್‌ಗಳು',
    'market.commodity': 'ಸರಕು',
    'market.state': 'ರಾಜ್ಯ',
    'market.dateRange': 'ದಿನಾಂಕ ವ್ಯಾಪ್ತಿ',
    'market.today': 'ಇಂದು',
    'market.week': 'ಕಳೆದ 7 ದಿನಗಳು',
    'market.all': 'ಎಲ್ಲಾ ಸಮಯ',
    'market.showing': 'ತೋರಿಸಲಾಗುತ್ತಿದೆ',
    'market.results': 'ಫಲಿತಾಂಶಗಳು',
    'market.selected': 'ಹೋಲಿಕೆಗಾಗಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ',
    'market.viewTrend': 'ಬೆಲೆ ಪ್ರವೃತ್ತಿ ವೀಕ್ಷಿಸಿ',
    'market.comparison': 'ಬೆಲೆ ಹೋಲಿಕೆ',
    'market.market': 'ಮಾರುಕಟ್ಟೆ',
    'market.price': 'ಬೆಲೆ',
    'market.change': 'ಬದಲಾವಣೆ',
    'market.trend': 'ಬೆಲೆ ಪ್ರವೃತ್ತಿ',
    'market.historical': '30-ದಿನದ ಐತಿಹಾಸಿಕ ಡೇಟಾ',
    'market.date': 'ದಿನಾಂಕ',
    'market.noResults': 'ನಿಮ್ಮ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಬೆಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    'market.clearFilters': 'ಎಲ್ಲಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ',
    'market.loading': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...',
    'market.fromYesterday': 'ನಿನ್ನೆಯಿಂದ',
    
    // Settings
    'settings.title': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    'settings.language': 'ಭಾಷೆ',
    'settings.theme': 'ಥೀಮ್',
    'settings.light': 'ಲೈಟ್ ಮೋಡ್',
    'settings.dark': 'ಡಾರ್ಕ್ ಮೋಡ್',
    'settings.english': 'English (ಇಂಗ್ಲಿಷ್)',
    'settings.hindi': 'हिंदी (ಹಿಂದಿ)',
    'settings.kannada': 'ಕನ್ನಡ',
    
    // Common
    'common.all': 'ಎಲ್ಲಾ',
    'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'common.save': 'ಉಳಿಸಿ',
    'common.cancel': 'ರದ್ದುಮಾಡಿ',
    'common.close': 'ಮುಚ್ಚಿ',
    'common.back': 'ಹಿಂದೆ',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('agrifriend-language');
    return (saved as Language) || 'en';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('agrifriend-theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('agrifriend-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('agrifriend-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
