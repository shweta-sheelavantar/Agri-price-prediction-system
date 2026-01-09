import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Brain, 
  Cloud, 
  Users, 
  Sprout,
  Settings,
  ArrowLeft
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { path: '/market-prices', label: 'Market Prices', icon: <TrendingUp className="w-5 h-5" /> },
  { path: '/predictions', label: 'AI Predictions', icon: <Brain className="w-5 h-5" /> },
  { path: '/enhanced-predictions', label: 'Weather', icon: <Cloud className="w-5 h-5" /> },
  { path: '/buyers', label: 'Buyers', icon: <Users className="w-5 h-5" /> },
  { path: '/farm-profile', label: 'Farm Profile', icon: <Sprout className="w-5 h-5" /> },
  { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

interface PageNavigationProps {
  title: string;
  showBackButton?: boolean;
}

const PageNavigation: React.FC<PageNavigationProps> = ({ title, showBackButton = true }) => {
  const location = useLocation();

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Link 
                  to="/dashboard" 
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              )}
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.slice(0, 5).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
        <div className="grid grid-cols-5 gap-1">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-1 ${
                location.pathname === item.path
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1 truncate">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default PageNavigation;
