/**
 * Enhanced AGMARKNET API Service with Retry Logic and Smart Caching
 * 
 * IMPROVEMENTS:
 * 1. Routes through ML backend to avoid CORS issues
 * 2. Retry with exponential backoff
 * 3. Smart caching with TTL
 * 4. Better error handling
 * 5. Connection health monitoring
 */

import { MarketPrice } from '../types';

// Configuration - Use ML backend instead of direct API call
const ML_BACKEND_URL = import.meta.env.VITE_ML_BACKEND_URL || 'http://localhost:8000';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache storage
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AGMARKNETCache {
  private cache = new Map<string, CacheEntry<any>>();
  private hits = 0;
  private misses = 0;

  set<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 
        ? (this.hits / (this.hits + this.misses) * 100).toFixed(1) + '%'
        : '0%'
    };
  }
}

const apiCache = new AGMARKNETCache();

// Helper function for delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with retry and exponential backoff
 */
async function fetchWithRetry(
  url: string, 
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // Handle specific HTTP errors
      if (response.status === 429) {
        console.warn(`⚠️ Rate limited, waiting before retry ${attempt + 1}/${retries}`);
        await sleep(RETRY_DELAY * Math.pow(2, attempt + 1)); // Longer wait for rate limit
        continue;
      }

      if (response.status >= 500) {
        console.warn(`⚠️ Server error ${response.status}, retry ${attempt + 1}/${retries}`);
        await sleep(RETRY_DELAY * Math.pow(2, attempt));
        continue;
      }

      // Client errors (4xx except 429) - don't retry
      throw new Error(`API error: ${response.status} ${response.statusText}`);

    } catch (error: any) {
      lastError = error;

      if (error.name === 'AbortError') {
        console.warn(`⚠️ Request timeout, retry ${attempt + 1}/${retries}`);
      } else if (error.message?.includes('fetch')) {
        console.warn(`⚠️ Network error, retry ${attempt + 1}/${retries}`);
      } else {
        throw error; // Don't retry non-network errors
      }

      if (attempt < retries - 1) {
        await sleep(RETRY_DELAY * Math.pow(2, attempt));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Fetch AGMARKNET data through ML backend (avoids CORS issues)
 */
export async function fetchAGMARKNETData(filters?: {
  commodity?: string;
  state?: string;
  district?: string;
  limit?: number;
}): Promise<{ data: MarketPrice[]; source: string }> {
  // Build cache key
  const cacheKey = `agmarknet_${JSON.stringify(filters || {})}`;
  
  // Check cache first
  const cached = apiCache.get<MarketPrice[]>(cacheKey);
  if (cached) {
    console.log('📦 Cache hit for:', cacheKey);
    return { data: cached, source: 'AGMARKNET_CACHED' };
  }

  // Build API URL - route through ML backend
  const url = new URL(`${ML_BACKEND_URL}/market/prices`);
  
  if (filters?.commodity) {
    url.searchParams.append('commodity', filters.commodity);
  }
  if (filters?.state) {
    url.searchParams.append('state', filters.state);
  }
  if (filters?.district) {
    url.searchParams.append('district', filters.district);
  }
  url.searchParams.append('limit', (filters?.limit || 100).toString());

  console.log('🌐 Fetching from ML Backend (AGMARKNET proxy)...');

  const response = await fetchWithRetry(url.toString());
  const data = await response.json();

  console.log(`✅ ML Backend returned ${data.records?.length || 0} records`);

  // Transform data to MarketPrice format
  const prices: MarketPrice[] = (data.records || []).map((record: any) => ({
    id: record.id,
    commodity: record.commodity,
    variety: record.variety || 'Standard',
    market: record.market,
    price: record.price,
    priceChange: record.priceChange,
    timestamp: new Date(record.timestamp),
    source: record.source || 'AGMARKNET',
  }));

  // Cache the results
  apiCache.set(cacheKey, prices);

  return { data: prices, source: data.source || 'AGMARKNET_LIVE' };
}

/**
 * Fetch commodity prices
 */
export async function fetchCommodityPrices(
  commodity: string, 
  state?: string
): Promise<{ data: MarketPrice[]; source: string }> {
  return fetchAGMARKNETData({
    commodity,
    state,
    limit: 50
  });
}

/**
 * Fetch latest prices for ticker
 */
export async function fetchLatestPrices(
  limit: number = 20
): Promise<{ data: MarketPrice[]; source: string }> {
  // Build cache key
  const cacheKey = `ticker_${limit}`;
  
  // Check cache first
  const cached = apiCache.get<MarketPrice[]>(cacheKey);
  if (cached) {
    console.log('📦 Cache hit for ticker');
    return { data: cached, source: 'AGMARKNET_CACHED' };
  }

  // Use ticker endpoint for better performance
  const url = `${ML_BACKEND_URL}/market/ticker?limit=${limit}`;
  
  console.log('🌐 Fetching ticker from ML Backend...');

  const response = await fetchWithRetry(url);
  const data = await response.json();

  console.log(`✅ Ticker returned ${data.records?.length || 0} records`);

  // Transform data
  const prices: MarketPrice[] = (data.records || []).map((record: any) => ({
    id: record.id,
    commodity: record.commodity,
    variety: record.variety || 'Standard',
    market: record.market,
    price: record.price,
    priceChange: record.priceChange,
    timestamp: new Date(record.timestamp),
    source: record.source || 'AGMARKNET',
  }));

  // Cache with shorter TTL for ticker
  apiCache.set(cacheKey, prices, 60000); // 1 minute cache for ticker

  return { data: prices, source: data.source || 'AGMARKNET_LIVE' };
}

/**
 * Test API connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_BACKEND_URL}/health`, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Clear cache
 */
export function clearCache(): void {
  apiCache.clear();
  console.log('🗑️ AGMARKNET cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return apiCache.getStats();
}