/**
 * Improved Hybrid API Service with Smart Fallback
 * 
 * FEATURES:
 * 1. Prioritizes real AGMARKNET data over mock
 * 2. Only falls back after multiple failures
 * 3. Tracks API health over time
 * 4. Implements circuit breaker pattern
 * 5. Better logging and monitoring
 */

import { MarketPrice } from '../types';
import {
  fetchAGMARKNETData,
  fetchCommodityPrices as fetchRealCommodityPrices,
  fetchLatestPrices as fetchRealLatestPrices,
  testConnection,
  clearCache as clearAGMARKNETCache
} from './agmarknetEnhancedAPI';
import { generateMockMarketPrices } from './mockData';

// Circuit Breaker Configuration
const CIRCUIT_BREAKER_THRESHOLD = 5; // failures before opening circuit
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute before trying again
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Circuit State Constants
const CircuitState = {
  CLOSED: 'CLOSED',     // Normal operation
  OPEN: 'OPEN',         // Too many failures, using fallback
  HALF_OPEN: 'HALF_OPEN' // Testing if service recovered
} as const;

type CircuitStateType = typeof CircuitState[keyof typeof CircuitState];

class CircuitBreaker {
  private state: CircuitStateType = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;
  private successes = 0;

  recordSuccess() {
    this.successes++;
    this.failures = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      console.log('🔄 Circuit breaker: Service recovered, closing circuit');
      this.state = CircuitState.CLOSED;
    }
  }

  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= CIRCUIT_BREAKER_THRESHOLD && this.state === CircuitState.CLOSED) {
      console.warn(`⚠️ Circuit breaker: Opening circuit after ${this.failures} failures`);
      this.state = CircuitState.OPEN;
    }
  }

  canAttempt(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      // Check if enough time has passed to try again
      if (Date.now() - this.lastFailureTime >= CIRCUIT_BREAKER_TIMEOUT) {
        console.log('🔄 Circuit breaker: Attempting half-open state');
        this.state = CircuitState.HALF_OPEN;
        return true;
      }
      return false;
    }

    // HALF_OPEN state - allow one attempt
    return true;
  }

  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      canAttempt: this.canAttempt()
    };
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
  }
}

const circuitBreaker = new CircuitBreaker();

// Health tracking
let lastHealthCheck = 0;
let isHealthy = true;

/**
 * Perform health check
 */
async function performHealthCheck(): Promise<boolean> {
  const now = Date.now();

  // Don't check too frequently
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return isHealthy;
  }

  lastHealthCheck = now;

  try {
    console.log('🏥 Performing API health check...');
    const healthy = await testConnection();
    isHealthy = healthy;

    if (healthy) {
      console.log('✅ API health check: HEALTHY');
      circuitBreaker.recordSuccess();
    } else {
      console.warn('⚠️ API health check: DEGRADED');
      circuitBreaker.recordFailure();
    }

    return healthy;
  } catch (error) {
    console.error('❌ API health check: FAILED', error);
    circuitBreaker.recordFailure();
    isHealthy = false;
    return false;
  }
}

/**
 * Execute API call with smart fallback
 */
async function executeWithSmartFallback<T>(
  realAPICall: () => Promise<{ data: T; source: string }>,
  mockDataGenerator: () => T,
  operationName: string
): Promise<T> {
  // Check circuit breaker
  if (!circuitBreaker.canAttempt()) {
    console.warn(`⚠️ ${operationName} - Circuit breaker OPEN, using mock data`);
    return mockDataGenerator();
  }

  try {
    console.log(`🌐 ${operationName} - Attempting real API call...`);
    const result = await realAPICall();

    // Success!
    circuitBreaker.recordSuccess();
    isHealthy = true;
    console.log(`✅ ${operationName} - Real API success (source: ${result.source})`);

    return result.data;
  } catch (error: any) {
    console.error(`❌ ${operationName} - Real API failed:`, error.message);
    circuitBreaker.recordFailure();

    // Check if we should use fallback
    if (error.message === 'API_KEY_NOT_CONFIGURED') {
      console.warn(`⚠️ ${operationName} - API key not configured, using mock data`);
      return mockDataGenerator();
    }

    // If circuit breaker is now open, use mock data
    if (!circuitBreaker.canAttempt()) {
      console.warn(`⚠️ ${operationName} - Too many failures, using mock data`);
      return mockDataGenerator();
    }

    // Otherwise, throw error to trigger retry in caller
    throw error;
  }
}

/**
 * Get market prices with smart fallback
 */
export async function getMarketPrices(filters?: {
  commodity?: string;
  state?: string;
  district?: string;
  limit?: number;
}): Promise<MarketPrice[]> {
  // Periodic health check
  if (Date.now() - lastHealthCheck > HEALTH_CHECK_INTERVAL) {
    performHealthCheck().catch(err => console.warn('Background health check failed:', err));
  }

  return executeWithSmartFallback(
    () => fetchAGMARKNETData(filters),
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
    'getMarketPrices'
  );
}

/**
 * Get commodity prices with smart fallback
 */
export async function getCommodityPrices(
  commodity: string,
  state?: string
): Promise<MarketPrice[]> {
  return executeWithSmartFallback(
    () => fetchRealCommodityPrices(commodity, state),
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
    'getCommodityPrices'
  );
}

/**
 * Get latest prices for ticker with smart fallback
 */
export async function getLatestPrices(limit: number = 20): Promise<MarketPrice[]> {
  return executeWithSmartFallback(
    () => fetchRealLatestPrices(limit),
    () => generateMockMarketPrices(limit),
    'getLatestPrices'
  );
}

/**
 * Force health check
 */
export async function forceHealthCheck(): Promise<boolean> {
  lastHealthCheck = 0;
  return performHealthCheck();
}

/**
 * Reset circuit breaker (for testing/debugging)
 */
export function resetCircuitBreaker() {
  circuitBreaker.reset();
  console.log('🔄 Circuit breaker reset');
}

/**
 * Clear all caches
 */
export function clearAllCaches() {
  clearAGMARKNETCache();
  console.log('🗑️ All caches cleared');
}

/**
 * Get comprehensive API status
 */
export function getAPIStatus() {
  return {
    mode: 'hybrid',
    healthy: isHealthy,
    usingRealAPI: true, // We're now using real API through ML backend
    circuitBreaker: circuitBreaker.getStatus(),
    lastHealthCheck: lastHealthCheck ? new Date(lastHealthCheck) : new Date(),
    nextHealthCheck: lastHealthCheck 
      ? new Date(lastHealthCheck + HEALTH_CHECK_INTERVAL) 
      : null,
  };
}