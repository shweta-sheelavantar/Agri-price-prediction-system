import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do I get started with AgriFriend?',
      answer: 'Simply enter your 10-digit mobile number and select your primary crop on the homepage. You\'ll get instant access to your personalized dashboard with no password, OTP, or app download required. It takes just 8 seconds!'
    },
    {
      question: 'Is AgriFriend really free?',
      answer: 'Yes! AgriFriend is 100% free forever. We never charge farmers for accessing market prices, AI predictions, or connecting with buyers. Our mission is to empower farmers, not profit from them.'
    },
    {
      question: 'How accurate are the market prices?',
      answer: 'We source live data from 2,400+ mandis across 29 states, updated every minute. Our prices come directly from AGMARKNET and other government sources, ensuring accuracy and reliability.'
    },
    {
      question: 'What are AI Predictions?',
      answer: 'Our AI analyzes historical data, weather patterns, demand trends, and market conditions to forecast future prices, estimate your crop yield, and assess risks. This helps you decide the best time to sell and which crops to plant.'
    },
    {
      question: 'How do I connect with buyers?',
      answer: 'Navigate to the "Find Buyers" section in your dashboard. You can browse verified buyers interested in your crops, view their ratings and payment terms, and connect directly without any middlemen taking a cut.'
    },
    {
      question: 'Does AgriFriend work offline?',
      answer: 'Yes! Once you\'ve loaded the app, many features work offline including viewing your saved prices, farm profile, and inventory. When you reconnect, everything syncs automatically.'
    },
    {
      question: 'Which languages are supported?',
      answer: 'Currently, AgriFriend supports English, Hindi (हिंदी), and Kannada (ಕನ್ನಡ). We\'re actively working on adding more Indian languages including Tamil, Telugu, Marathi, Gujarati, Punjabi, and Bengali.'
    },
    {
      question: 'How do I change my primary crop?',
      answer: 'Go to Settings > Farm Profile and update your primary crop. Your dashboard will automatically adjust to show relevant prices and predictions for your new crop selection.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely! We use bank-level encryption to protect your data. We never sell your information to third parties. Your mobile number and farm details are kept completely confidential.'
    },
    {
      question: 'Can I use AgriFriend on any phone?',
      answer: 'Yes! AgriFriend is a web app that works on any smartphone, tablet, or computer with a browser. No app store download needed - just visit our website and start using it immediately.'
    },
    {
      question: 'How do I get price alerts?',
      answer: 'In your dashboard, go to Market Prices and set up custom alerts. You\'ll receive notifications via SMS when prices reach your target levels, helping you sell at the right time.'
    },
    {
      question: 'What if I need help?',
      answer: 'We offer 24/7 support via our toll-free helpline (1800-XXX-XXXX) and WhatsApp (+91 98765 43210). You can also reach us through the Contact Us page. We have support staff who speak multiple Indian languages.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Find answers to common questions about AgriFriend
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our support team is here to help you 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
            >
              Contact Support
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors border border-gray-200 dark:border-gray-700"
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
