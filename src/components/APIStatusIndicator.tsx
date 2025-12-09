import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Database } from 'lucide-react';
import { marketPricesAPI } from '../services/api';

interface APIStatus {
  mode: string;
  healthy: boolean;
  usingRealAPI: boolean;
  lastHealthCheck: Date | null;
}

const APIStatusIndicator = () => {
  const [status, setStatus] = useState<APIStatus | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Get initial status
    const initialStatus = marketPricesAPI.getStatus();
    setStatus(initialStatus);

    // Update status every 30 seconds
    const interval = setInterval(() => {
      const currentStatus = marketPricesAPI.getStatus();
      setStatus(currentStatus);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const getStatusColor = () => {
    if (status.mode === 'mock') return 'bg-yellow-500';
    if (status.usingRealAPI && status.healthy) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (status.mode === 'mock') return 'Demo Data';
    if (status.usingRealAPI && status.healthy) return 'Live AGMARKNET';
    return 'Demo Data (Fallback)';
  };

  const getStatusIcon = () => {
    if (status.mode === 'mock') return <Database className="w-3 h-3" />;
    if (status.usingRealAPI && status.healthy) return <Wifi className="w-3 h-3" />;
    return <WifiOff className="w-3 h-3" />;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          <div className={`${getStatusColor()} rounded-full p-1 text-white`}>
            {getStatusIcon()}
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {getStatusText()}
          </span>
        </div>

        {showDetails && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
            <div className="space-y-1">
              <div>Mode: <span className="font-medium">{status.mode}</span></div>
              <div>Status: <span className="font-medium">{status.healthy ? 'Healthy' : 'Degraded'}</span></div>
              {status.lastHealthCheck && (
                <div>
                  Last Check: <span className="font-medium">
                    {new Date(status.lastHealthCheck).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIStatusIndicator;
