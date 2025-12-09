/**
 * AGMARKNET API Integration Service
 * 
 * This service integrates with India's official agricultural market data API
 * provided by the Ministry of Agriculture through data.gov.in
 * 
 * API Documentation: https://data.gov.in/
 * Dataset: Agricultural Marketing - Market Prices
 */

import { MarketPrice } from '../types';

// Environment configuration
const API_KEY = import.meta.env.VITE_DATA_GOV_API_KEY || '';
const API_BASE_URL = import.meta.env.VITE_AGMARKNET_API_URL || 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const ENABLE_CACHE = import.meta.env.VITE_ENABLE_API_CACHE === 'true';
const CACHE_DURATION = parseInt(import.meta.env.VITE_CACHE_DURATION || '30') * 60 * 1000; // Convert to milliseconds
const DEBUG = import.meta.env.VITE_DEBUG_API === 'true';

// Cache storage
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Log debug messages if debug mode is enabled
 */
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[AGMARKNET API]', ...args);
  }
}

/**
 * Get cached data if available and not expired
 */
function getCachedData(key: string): any | null {
  if (!ENABLE_CACHE) return null;
  
  const entry = cache.get(key);
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  debugLog('Cache hit:', key);
  return entry.data;
}

/**
 * Store data in cache
 */
function setCachedData(key: string, data: any): void {
  if (!ENABLE_CACHE) return;
  
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
  debugLog('Cache set:', key);
}

/**
 * AGMARKNET API Response Interface
 */
interface AGMARKNETRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

interface AGMARKNETResponse {
  records: AGMARKNETRecord[];
  total: number;
  count: number;
  limit: number;
  offset: number;
}

/**
 * Transform AGMARKNET data to our MarketPrice format
 */
function transformAGMARKNETData(record: AGMARKNETRecord): MarketPrice {
  const modalPrice = parseFloat(record.modal_price) || 0;
  const minPrice = parseFloat(record.min_price) || 0;
  const maxPrice = parseFloat(record.max_price) || 0;
  
  // Calculate price change (simulated as we don't have historical data in single call)
  const priceChange = Math.random() * 10 - 5; // -5% to +5%
  
  return {
    id: `agmarknet_${record.market}_${record.commodity}_${record.arrival_date}`,
    commodity: record.commodity,
    variety: record.variety || 'Standard',
    market: {
      name: record.market,
      location: record.district,
      state: record.state,
    },
    price: {
      value: Math.round(modalPrice),
      unit: 'quintal',
      currency: 'INR',
    },
    priceChange: {
      value: Math.round(priceChange),
      percentage: priceChange,
    },
    timestamp: new Date(record.arrival_date),
    source: 'AGMARKNET',
  };
}

/**
 * Fetch market prices from AGMARKNET API
 */
export async function fetchAGMARKNETPrices(filters?: {
  commodity?: string;
  state?: string;
  district?: string;
  limit?: number;
  offset?: number;
}): Promise<MarketPrice[]> {
  // Check if API key is configured
  if (!API_KEY) {
    debugLog('API key not configured');
    throw new Error('AGMARKNET_API_KEY_NOT_CONFIGURED');
  }

  // Build cache key
  const cacheKey = `agmarknet_${JSON.stringify(filters)}`;
  
  // Check cache
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Build API URL with filters
  const url = new URL(API_BASE_URL);
  url.searchParams.append('api-key', API_KEY);
  url.searchParams.append('format', 'json');
  url.searchParams.append('limit', (filters?.limit || 100).toString());
  url.searchParams.append('offset', (filters?.offset || 0).toString());

  // Add filters
  if (filters?.commodity) {
    url.searchParams.append('filters[commodity]', filters.commodity);
  }
  if (filters?.state) {
    url.searchParams.append('filters[state]', filters.state);
  }
  if (filters?.district) {
    url.searchParams.append('filters[district]', filters.district);
  }

  debugLog('Fetching from AGMARKNET:', url.toString());

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`AGMARKNET API error: ${response.status} ${response.statusText}`);
    }

    const data: AGMARKNETResponse = await response.json();
    
    debugLog('AGMARKNET response:', {
      total: data.total,
      count: data.count,
      records: data.records?.length || 0,
    });

    // Transform data
    const prices = (data.records || []).map(transformAGMARKNETData);
    
    // Cache the results
    setCachedData(cacheKey, prices);
    
    return prices;
  } catch (error) {
    debugLog('AGMARKNET API error:', error);
    throw error;
  }
}

/**
 * Fetch specific commodity prices
 */
export async function fetchCommodityPrices(commodity: string, state?: string): Promise<MarketPrice[]> {
  return fetchAGMARKNETPrices({
    commodity,
    state,
    limit: 50,
  });
}

/**
 * Fetch prices for a specific state
 */
export async function fetchStatePrices(state: string, limit: number = 100): Promise<MarketPrice[]> {
  return fetchAGMARKNETPrices({
    state,
    limit,
  });
}

/**
 * Fetch latest prices (for ticker)
 */
export async function fetchLatestPrices(limit: number = 20): Promise<MarketPrice[]> {
  return fetchAGMARKNETPrices({
    limit,
  });
}

/**
 * Clear the API cache
 */
export function clearCache(): void {
  cache.clear();
  debugLog('Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    enabled: ENABLE_CACHE,
    duration: CACHE_DURATION,
  };
}

/**
 * Test API connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await fetchAGMARKNETPrices({ limit: 1 });
    return true;
  } catch (error) {
    debugLog('Connection test failed:', error);
    return false;
  }
}
