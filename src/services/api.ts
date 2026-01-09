import {
  MarketPrice,
  FarmProfile,
  Buyer,
  Transaction,
  InventoryItem,
  Subsidy,
  Insurance,
  Notification,
  Task,
  DemandForecast,
  YieldEstimation,
  RiskAssessment,
  PriceAlert,
} from '../types';
import {
  generateMockMarketPrices,
  generateMockFarmProfile,
  generateMockDemandForecast,
  generateMockYieldEstimation,
  generateMockRiskAssessment,
  generateMockBuyers,
  generateMockTransactions,
  generateMockInventory,
  generateMockSubsidies,
  generateMockInsurance,
  generateMockNotifications,
  generateMockTasks,
  loadMockDataFromStorage,
  saveMockDataToStorage,
  initializeMockData,
} from './mockData';

// Initialize mock data on module load
initializeMockData();

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Import hybrid API service - using improved version with circuit breaker
import { 
  getMarketPrices, 
  getCommodityPrices, 
  getLatestPrices, 
  getAPIStatus,
  forceHealthCheck,
  resetCircuitBreaker,
  clearAllCaches
} from './hybridAPIImproved';

// Market Prices API
export const marketPricesAPI = {
  async getAll(filters?: { commodity?: string; state?: string; location?: string }): Promise<MarketPrice[]> {
    await delay();
    
    // Use hybrid API (real AGMARKNET + mock fallback) with timeout
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 5000)
      );
      
      const pricesPromise = getMarketPrices({
        commodity: filters?.commodity,
        state: filters?.state,
        district: filters?.location,
        limit: 100,
      });
      
      const prices = await Promise.race([pricesPromise, timeoutPromise]);
      return prices;
    } catch (error) {
      console.warn('API unavailable, using mock data:', error.message);
      // Final fallback to mock data
      return generateMockMarketPrices(100);
    }
  },

  async getById(id: string): Promise<MarketPrice | null> {
    await delay();
    const prices: MarketPrice[] = loadMockDataFromStorage('market_prices') || [];
    return prices.find(p => p.id === id) || null;
  },

  async getHistoricalPrices(commodity: string, days: number = 30): Promise<MarketPrice[]> {
    await delay();
    // Generate historical prices for the past N days
    const historicalPrices: MarketPrice[] = [];
    const basePrice = 2000;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const priceVariation = Math.random() * 400 - 200;
      const price = basePrice + priceVariation;
      
      historicalPrices.push({
        id: `hist_${i}`,
        commodity,
        variety: 'Standard',
        market: { name: 'Average Market', location: 'All India', state: 'All' },
        price: { value: Math.round(price), unit: 'quintal', currency: 'INR' },
        priceChange: { value: Math.round(priceVariation), percentage: (priceVariation / basePrice) * 100 },
        timestamp: date,
        source: 'AGMARKNET',
      });
    }
    
    return historicalPrices;
  },

  async getTicker(): Promise<MarketPrice[]> {
    await delay(200);
    
    // Use hybrid API for ticker with timeout
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Ticker API timeout')), 3000)
      );
      
      const pricesPromise = getLatestPrices(10);
      const prices = await Promise.race([pricesPromise, timeoutPromise]);
      return prices;
    } catch (error) {
      console.warn('Ticker API unavailable, using mock data:', error.message);
      // Fallback to mock data
      return generateMockMarketPrices(10);
    }
  },
  
  // Get API status
  getStatus() {
    return getAPIStatus();
  },
  
  // Force health check
  async forceHealthCheck() {
    return forceHealthCheck();
  },
  
  // Reset circuit breaker (for debugging)
  resetCircuitBreaker() {
    resetCircuitBreaker();
  },
  
  // Clear all caches
  clearCaches() {
    clearAllCaches();
  },
};

// Price Alerts API
export const priceAlertsAPI = {
  async getAll(userId: string): Promise<PriceAlert[]> {
    await delay();
    return loadMockDataFromStorage(`alerts_${userId}`) || [];
  },

  async create(alert: Omit<PriceAlert, 'id' | 'createdAt'>): Promise<PriceAlert> {
    await delay();
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      createdAt: new Date(),
    };
    
    const alerts = await this.getAll(alert.userId);
    alerts.push(newAlert);
    saveMockDataToStorage(`alerts_${alert.userId}`, alerts);
    
    return newAlert;
  },

  async delete(userId: string, alertId: string): Promise<void> {
    await delay();
    const alerts = await this.getAll(userId);
    const filtered = alerts.filter(a => a.id !== alertId);
    saveMockDataToStorage(`alerts_${userId}`, filtered);
  },
};

// Farm Profile API
export const farmProfileAPI = {
  async get(userId: string): Promise<FarmProfile | null> {
    await delay();
    const profile = loadMockDataFromStorage(`farm_profile_${userId}`);
    return profile || null;
  },

  async create(userId: string, data: Partial<FarmProfile>): Promise<FarmProfile> {
    await delay();
    const profile = generateMockFarmProfile(userId);
    const newProfile = { ...profile, ...data };
    saveMockDataToStorage(`farm_profile_${userId}`, newProfile);
    return newProfile;
  },

  async update(userId: string, data: Partial<FarmProfile>): Promise<FarmProfile> {
    await delay();
    const existing = await this.get(userId);
    const updated = { ...existing, ...data, updatedAt: new Date() };
    saveMockDataToStorage(`farm_profile_${userId}`, updated);
    return updated as FarmProfile;
  },
};

// AI Predictions API
export const predictionsAPI = {
  async getDemandForecast(crop: string, region: string): Promise<DemandForecast> {
    await delay(1000); // Simulate AI processing time
    return generateMockDemandForecast(crop);
  },

  async getYieldEstimation(params: any): Promise<YieldEstimation> {
    await delay(1000);
    return generateMockYieldEstimation();
  },

  async getRiskAssessment(farmId: string): Promise<RiskAssessment> {
    await delay(1000);
    return generateMockRiskAssessment();
  },

  async submitFeedback(predictionId: string, rating: number): Promise<void> {
    await delay();
    // Store feedback
    console.log(`Feedback submitted for prediction ${predictionId}: ${rating}`);
  },
};

// Buyers API
export const buyersAPI = {
  async getAll(filters?: { state?: string; commodity?: string }): Promise<Buyer[]> {
    await delay();
    let buyers: Buyer[] = loadMockDataFromStorage('buyers') || generateMockBuyers(30);
    
    if (filters?.state) {
      buyers = buyers.filter(b => b.location.state === filters.state);
    }
    if (filters?.commodity) {
      buyers = buyers.filter(b => b.commoditiesInterested.includes(filters.commodity!));
    }
    
    return buyers;
  },

  async getById(id: string): Promise<Buyer | null> {
    await delay();
    const buyers: Buyer[] = loadMockDataFromStorage('buyers') || [];
    return buyers.find(b => b.id === id) || null;
  },
};

// Transactions API
export const transactionsAPI = {
  async getAll(userId: string): Promise<Transaction[]> {
    await delay();
    const transactions = loadMockDataFromStorage(`transactions_${userId}`);
    return transactions || generateMockTransactions(userId, 20);
  },

  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    await delay();
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}`,
    };
    
    const transactions = await this.getAll(transaction.userId);
    transactions.unshift(newTransaction);
    saveMockDataToStorage(`transactions_${transaction.userId}`, transactions);
    
    return newTransaction;
  },
};

// Inventory API
export const inventoryAPI = {
  async getAll(farmId: string): Promise<InventoryItem[]> {
    await delay();
    const inventory = loadMockDataFromStorage(`inventory_${farmId}`);
    return inventory || generateMockInventory(farmId, 20);
  },

  async create(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    await delay();
    const newItem: InventoryItem = {
      ...item,
      id: `inv_${Date.now()}`,
    };
    
    const inventory = await this.getAll(item.farmId);
    inventory.push(newItem);
    saveMockDataToStorage(`inventory_${item.farmId}`, inventory);
    
    return newItem;
  },

  async update(farmId: string, itemId: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    await delay();
    const inventory = await this.getAll(farmId);
    const index = inventory.findIndex(i => i.id === itemId);
    
    if (index !== -1) {
      inventory[index] = { ...inventory[index], ...data };
      saveMockDataToStorage(`inventory_${farmId}`, inventory);
      return inventory[index];
    }
    
    throw new Error('Item not found');
  },

  async delete(farmId: string, itemId: string): Promise<void> {
    await delay();
    const inventory = await this.getAll(farmId);
    const filtered = inventory.filter(i => i.id !== itemId);
    saveMockDataToStorage(`inventory_${farmId}`, filtered);
  },
};

// Subsidies API
export const subsidiesAPI = {
  async getAll(filters?: { state?: string; category?: string }): Promise<Subsidy[]> {
    await delay();
    let subsidies: Subsidy[] = loadMockDataFromStorage('subsidies') || generateMockSubsidies();
    
    if (filters?.state && filters.state !== 'All India') {
      subsidies = subsidies.filter(s => s.state === filters.state || s.state === 'All India');
    }
    if (filters?.category) {
      subsidies = subsidies.filter(s => s.category === filters.category);
    }
    
    return subsidies;
  },
};

// Insurance API
export const insuranceAPI = {
  async getAll(): Promise<Insurance[]> {
    await delay();
    return loadMockDataFromStorage('insurance') || generateMockInsurance();
  },

  async getRecommendations(riskScore: number): Promise<Insurance[]> {
    await delay();
    const allInsurance = await this.getAll();
    // Return insurance based on risk score
    return allInsurance;
  },
};

// Notifications API
export const notificationsAPI = {
  async getAll(userId: string): Promise<Notification[]> {
    await delay();
    const notifications = loadMockDataFromStorage(`notifications_${userId}`);
    return notifications || generateMockNotifications(userId);
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await delay();
    const notifications = await this.getAll(userId);
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      saveMockDataToStorage(`notifications_${userId}`, notifications);
    }
  },
};

// Tasks API
export const tasksAPI = {
  async getAll(farmId: string): Promise<Task[]> {
    await delay();
    const tasks = loadMockDataFromStorage(`tasks_${farmId}`);
    return tasks || generateMockTasks(farmId);
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    await delay();
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date(),
    };
    
    const tasks = await this.getAll(task.farmId);
    tasks.push(newTask);
    saveMockDataToStorage(`tasks_${task.farmId}`, tasks);
    
    return newTask;
  },

  async update(farmId: string, taskId: string, data: Partial<Task>): Promise<Task> {
    await delay();
    const tasks = await this.getAll(farmId);
    const index = tasks.findIndex(t => t.id === taskId);
    
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...data };
      if (data.isCompleted && !tasks[index].completedAt) {
        tasks[index].completedAt = new Date();
      }
      saveMockDataToStorage(`tasks_${farmId}`, tasks);
      return tasks[index];
    }
    
    throw new Error('Task not found');
  },

  async delete(farmId: string, taskId: string): Promise<void> {
    await delay();
    const tasks = await this.getAll(farmId);
    const filtered = tasks.filter(t => t.id !== taskId);
    saveMockDataToStorage(`tasks_${farmId}`, filtered);
  },
};
