/**
 * Hybrid API Service
 * 
 * This service provides a seamless fallback mechanism between real AGMARKNET data
 * and mock data. It automatically switches to mock data if:
 * - API key is not configured
 * - API is unavailable
 * - Network errors occur
 * - Rate limits are hit
 * 
 * Modes:
 * - 'real': Only use real API (throws errors if unavailable)
 * - 'mock': Only use mock data
 * - 'hybrid': Try real API first, fallback to mock data
 */

import { MarketPrice } from '../types';
import {
  fetchAGMARKNETPrices,
  fetchCommodityPrices,
  fetchStatePrices,
  fetchLatestPrices,
  testConnection,
} from './agmarknetAPI';
import { generateMockMarketPrices } from './mockData';

type APIMode = 'real' | 'mock' | 'hybrid';

const API_MODE: APIMode = (import.meta.env.VITE_API_MODE as APIMode) || 'hybrid';
const DEBUG = import.meta.env.VITE_DEBUG_API === 'true';

// Track API health
let isAPIHealthy = true;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[Hybrid API]', ...args);
  }
}

// Suppress backend errors to prevent console spam
function suppressBackendErrors() {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    // Suppress known backend errors that don't affect frontend
    if (
      message.includes('services.agmarknet_client') ||
      message.includes('services.realtime_dashboard') ||
      message.includes('services.continuous_ml') ||
      message.includes('PricePredictor') ||
      message.includes('DataCollector') ||
      message.includes('dashboard_callback')
    ) {
      return; // Suppress these errors
    }
    originalError.apply(console, args);
  };
}

// Initialize error suppression
suppressBackendErrors();

/**
 * Check if we should use real API
 */
function shouldUseRealAPI(): boolean {
  if (API_MODE === 'mock') return false;
  if (API_MODE === 'real') return true;
  
  // Hybrid mode: check API health
  return isAPIHealthy;
}

/**
 * Perform health check on real API
 */
async function performHealthCheck(): Promise<boolean> {
  const now = Date.now();
  
  // Don't check too frequently
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return isAPIHealthy;
  }
  
  lastHealthCheck = now;
  
  try {
    debugLog('Performing health check...');
    const healthy = await testConnection();
    isAPIHealthy = healthy;
    debugLog('Health check result:', healthy ? 'HEALTHY' : 'UNHEALTHY');
    return healthy;
  } catch (error) {
    debugLog('Health check failed:', error);
    isAPIHealthy = false;
    return false;
  }
}

/**
 * Add timeout to prevent hanging API calls
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), timeoutMs)
    )
  ]);
}

/**
 * Execute API call with fallback
 */
async function executeWithFallback<T>(
  realAPICall: () => Promise<T>,
  mockDataGenerator: () => T,
  operationName: string,
  timeoutMs: number = 5000
): Promise<T> {
  const useReal = shouldUseRealAPI();
  
  debugLog(`${operationName} - Mode: ${API_MODE}, Using: ${useReal ? 'REAL' : 'MOCK'}`);
  
  if (!useReal) {
    // Use mock data directly
    return mockDataGenerator();
  }
  
  // Try real API with timeout
  try {
    const result = await withTimeout(realAPICall(), timeoutMs);
    debugLog(`${operationName} - Real API success`);
    return result;
  } catch (error: any) {
    debugLog(`${operationName} - Real API failed:`, error.message);
    
    // If in 'real' mode, throw the error
    if (API_MODE === 'real') {
      throw error;
    }
    
    // Hybrid mode: mark API as unhealthy and use mock data
    if (error.message === 'AGMARKNET_API_KEY_NOT_CONFIGURED') {
      debugLog('API key not configured, using mock data');
    } else {
      isAPIHealthy = false;
      debugLog('API unhealthy, falling back to mock data');
    }
    
    return mockDataGenerator();
  }
}

/**
 * Fetch market prices with hybrid fallback
 */
export async function getMarketPrices(filters?: {
  commodity?: string;
  state?: string;
  district?: string;
  limit?: number;
}): Promise<MarketPrice[]> {
  // Perform periodic health check
  if (API_MODE === 'hybrid') {
    await performHealthCheck();
  }
  
  return executeWithFallback(
    () => fetchAGMARKNETPrices(filters),
    () => {
      let mockPrices = generateMockMarketPrices(filters?.limit || 100);
      
      // Apply filters to mock data
      if (filters?.commodity) {
        mockPrices = mockPrices.filter(p => 
          p.commodity.toLowerCase().includes(filters.commodity!.toLowerCase())
        );
      }
      if (filters?.state) {
        mockPrices = mockPrices.filter(p => p.market.state === filters.state);
      }
      if (filters?.district) {
        mockPrices = mockPrices.filter(p => 
          p.market.location.toLowerCase().includes(filters.district!.toLowerCase())
        );
      }
      
      return mockPrices;
    },
    'getMarketPrices',
    3000 // 3 second timeout for market prices
  );
}

/**
 * Fetch commodity-specific prices with hybrid fallback
 */
export async function getCommodityPrices(commodity: string, state?: string): Promise<MarketPrice[]> {
  return executeWithFallback(
    () => fetchCommodityPrices(commodity, state),
    () => {
      let mockPrices = generateMockMarketPrices(50);
      mockPrices = mockPrices.filter(p => 
        p.commodity.toLowerCase().includes(commodity.toLowerCase())
      );
      if (state) {
        mockPrices = mockPrices.filter(p => p.market.state === state);
      }
      return mockPrices;
    },
    'getCommodityPrices',
    3000 // 3 second timeout for commodity prices
  );
}

/**
 * Fetch state-specific prices with hybrid fallback
 */
export async function getStatePrices(state: string, limit: number = 100): Promise<MarketPrice[]> {
  return executeWithFallback(
    () => fetchStatePrices(state, limit),
    () => {
      const mockPrices = generateMockMarketPrices(limit);
      return mockPrices.filter(p => p.market.state === state);
    },
    'getStatePrices',
    3000 // 3 second timeout for state prices
  );
}

/**
 * Fetch latest prices for ticker with hybrid fallback
 */
export async function getLatestPrices(limit: number = 20): Promise<MarketPrice[]> {
  return executeWithFallback(
    () => fetchLatestPrices(limit),
    () => generateMockMarketPrices(limit),
    'getLatestPrices',
    2000 // 2 second timeout for ticker (needs to be fast)
  );
}

/**
 * Get current API status
 */
export function getAPIStatus() {
  return {
    mode: API_MODE,
    healthy: isAPIHealthy,
    usingRealAPI: shouldUseRealAPI(),
    lastHealthCheck: lastHealthCheck ? new Date(lastHealthCheck) : null,
  };
}

/**
 * Force a health check
 */
export async function forceHealthCheck(): Promise<boolean> {
  lastHealthCheck = 0; // Reset to force check
  return performHealthCheck();
}

/**
 * Manually set API health status (for testing)
 */
export function setAPIHealth(healthy: boolean): void {
  isAPIHealthy = healthy;
  debugLog('API health manually set to:', healthy);
}
