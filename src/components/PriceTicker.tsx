import { useEffect, useState } from 'react';
import { MarketPrice } from '../types';
import { marketPricesAPI } from '../services/api';
import { TrendingUp, TrendingDown } from 'lucide-react';

const PriceTicker = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await marketPricesAPI.getTicker();
        setPrices(data);
      } catch (error) {
        console.warn('Ticker API error, retrying...', error);
        // Don't show error to user, just retry with exponential backoff
        setTimeout(fetchPrices, 5000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-800 text-white py-2 overflow-hidden">
        <div className="animate-pulse flex space-x-4 px-4">
          <div className="h-4 bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 dark:bg-gray-950 text-white py-2 overflow-hidden relative">
      {/* Live Indicator */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 z-10 bg-gray-800 dark:bg-gray-950 pr-4">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium text-green-400">LIVE</span>
      </div>
      <div className="ticker-wrapper">
        <div className="ticker-content flex space-x-8 animate-ticker">
          {[...prices, ...prices].map((price, index) => (
            <div key={`${price.id}-${index}`} className="flex items-center space-x-2 whitespace-nowrap">
              <span className="font-medium">{price.market.location}:</span>
              <span className="font-semibold">{price.commodity}</span>
              <span className="text-yellow-400">₹{price.price.value}</span>
              <span className={`flex items-center text-sm ${price.priceChange.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {price.priceChange.value >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {price.priceChange.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .ticker-wrapper {
          width: 100%;
          overflow: hidden;
        }
        .ticker-content {
          display: inline-flex;
          padding-left: 100%;
          animation: ticker 60s linear infinite;
        }
        @keyframes ticker {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default PriceTicker;
