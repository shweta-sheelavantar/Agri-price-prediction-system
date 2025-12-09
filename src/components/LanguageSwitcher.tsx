import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex items-center space-x-2">
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded transition-colors ${
            language === 'en'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('hi')}
          className={`px-3 py-1 rounded transition-colors ${
            language === 'hi'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          हिं
        </button>
        <button
          onClick={() => setLanguage('kn')}
          className={`px-3 py-1 rounded transition-colors ${
            language === 'kn'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          ಕನ್ನ
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
