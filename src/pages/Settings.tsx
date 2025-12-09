import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Settings = () => {
  const { language, setLanguage, theme, setTheme, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('settings.title')}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Language Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <Globe className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('settings.language')}</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setLanguage('en')}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                language === 'en'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 dark:text-white">{t('settings.english')}</span>
                {language === 'en' && (
                  <span className="text-primary-600 dark:text-primary-400">✓</span>
                )}
              </div>
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                language === 'hi'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 dark:text-white">{t('settings.hindi')}</span>
                {language === 'hi' && (
                  <span className="text-primary-600 dark:text-primary-400">✓</span>
                )}
              </div>
            </button>
            <button
              onClick={() => setLanguage('kn')}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                language === 'kn'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 dark:text-white">{t('settings.kannada')}</span>
                {language === 'kn' && (
                  <span className="text-primary-600 dark:text-primary-400">✓</span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            {theme === 'light' ? (
              <Sun className="w-6 h-6 text-primary-600 mr-3" />
            ) : (
              <Moon className="w-6 h-6 text-primary-600 mr-3" />
            )}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('settings.theme')}</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setTheme('light')}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sun className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-800 dark:text-white">{t('settings.light')}</span>
                </div>
                {theme === 'light' && (
                  <span className="text-primary-600 dark:text-primary-400">✓</span>
                )}
              </div>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Moon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-800 dark:text-white">{t('settings.dark')}</span>
                </div>
                {theme === 'dark' && (
                  <span className="text-primary-600 dark:text-primary-400">✓</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
