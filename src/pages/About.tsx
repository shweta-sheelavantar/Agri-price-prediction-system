import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Target, Award, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            About AgriFriend
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Empowering Indian farmers with technology and real-time market intelligence
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Our Mission</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            AgriFriend is dedicated to bridging the information gap for Indian farmers by providing 
            real-time market prices, AI-powered predictions, and direct connections to buyers. We believe 
            every farmer deserves access to the same market intelligence that large agricultural corporations 
            have, enabling them to make informed decisions and maximize their earnings.
          </p>
        </div>

        {/* Vision Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-center mb-4">
            <Award className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Our Vision</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            To become India's most trusted agricultural technology platform, helping millions of farmers 
            increase their income by 20-30% through better market access, data-driven insights, and 
            elimination of middlemen. We envision a future where every farmer, regardless of their location 
            or farm size, has the tools to thrive in the modern agricultural economy.
          </p>
        </div>

        {/* Values Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-center mb-6">
            <Heart className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Farmer-First</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every decision we make prioritizes the needs and success of farmers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Transparency</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We provide honest, accurate information with no hidden fees or agendas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We leverage cutting-edge AI and technology to solve real agricultural challenges.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Accessibility</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our platform works on any device, in multiple languages, even offline.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Our Impact</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">8.4L+</div>
              <p className="text-gray-600 dark:text-gray-300">Active Farmers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">2,400+</div>
              <p className="text-gray-600 dark:text-gray-300">Markets Covered</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">29</div>
              <p className="text-gray-600 dark:text-gray-300">States Served</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
