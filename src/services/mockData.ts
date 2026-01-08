import {
  MarketPrice,
  FarmProfile,
  Prediction,
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
} from '../types';

// Indian states and districts
const INDIAN_LOCATIONS = [
  { state: 'Punjab', districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'] },
  { state: 'Haryana', districts: ['Karnal', 'Panipat', 'Ambala', 'Hisar'] },
  { state: 'Uttar Pradesh', districts: ['Meerut', 'Agra', 'Lucknow', 'Kanpur'] },
  { state: 'Maharashtra', districts: ['Nashik', 'Pune', 'Nagpur', 'Aurangabad'] },
  { state: 'Gujarat', districts: ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara'] },
  { state: 'Madhya Pradesh', districts: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior'] },
  { state: 'Rajasthan', districts: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur'] },
];

// Commodities with realistic price ranges (INR per quintal)
const COMMODITIES = [
  { name: 'Wheat', variety: 'PBW 343', minPrice: 1800, maxPrice: 2500 },
  { name: 'Rice', variety: 'Basmati', minPrice: 3000, maxPrice: 5000 },
  { name: 'Cotton', variety: 'Bt Cotton', minPrice: 5000, maxPrice: 7000 },
  { name: 'Sugarcane', variety: 'Co 0238', minPrice: 280, maxPrice: 350 },
  { name: 'Onion', variety: 'Red', minPrice: 800, maxPrice: 3000 },
  { name: 'Tomato', variety: 'Hybrid', minPrice: 500, maxPrice: 2500 },
  { name: 'Potato', variety: 'Kufri Jyoti', minPrice: 600, maxPrice: 1500 },
  { name: 'Soybean', variety: 'JS 335', minPrice: 3500, maxPrice: 4500 },
  { name: 'Maize', variety: 'Hybrid', minPrice: 1400, maxPrice: 1900 },
  { name: 'Groundnut', variety: 'TMV 2', minPrice: 4500, maxPrice: 6000 },
];

// Helper function to generate random number in range
const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to generate random date in past
const randomPastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - randomInRange(0, daysAgo));
  return date;
};

// Generate mock market prices
export const generateMockMarketPrices = (count: number = 50): MarketPrice[] => {
  const prices: MarketPrice[] = [];
  
  for (let i = 0; i < count; i++) {
    const commodity = COMMODITIES[randomInRange(0, COMMODITIES.length - 1)];
    const location = INDIAN_LOCATIONS[randomInRange(0, INDIAN_LOCATIONS.length - 1)];
    const district = location.districts[randomInRange(0, location.districts.length - 1)];
    
    const basePrice = randomInRange(commodity.minPrice, commodity.maxPrice);
    const priceChange = randomInRange(-200, 200);
    const priceChangePercentage = (priceChange / basePrice) * 100;
    
    prices.push({
      id: `price_${i + 1}`,
      commodity: commodity.name,
      variety: commodity.variety,
      market: {
        name: `${district} Mandi`,
        location: district,
        state: location.state,
      },
      price: {
        value: basePrice,
        unit: 'quintal',
        currency: 'INR',
      },
      priceChange: {
        value: priceChange,
        percentage: parseFloat(priceChangePercentage.toFixed(2)),
      },
      timestamp: new Date(),
      source: 'AGMARKNET',
    });
  }
  
  return prices;
};

// Generate mock farm profiles - DEPRECATED: Use UserDataService.generateFarmProfile instead
export const generateMockFarmProfile = (userId: string): FarmProfile => {
  console.warn('⚠️ Using deprecated generateMockFarmProfile. Use UserDataService.generateFarmProfile for consistent data.');
  
  const location = INDIAN_LOCATIONS[randomInRange(0, INDIAN_LOCATIONS.length - 1)];
  const district = location.districts[randomInRange(0, location.districts.length - 1)];
  
  return {
    id: `farm_${userId}`,
    userId,
    farmName: `${district} Farm`,
    location: {
      state: location.state,
      district,
      village: `Village ${randomInRange(1, 100)}`,
      coordinates: {
        lat: randomInRange(20, 32) + Math.random(),
        lng: randomInRange(70, 85) + Math.random(),
      },
    },
    landArea: {
      total: randomInRange(2, 50),
      unit: 'acre',
    },
    soilType: ['Clay', 'Loam', 'Sandy', 'Silt'][randomInRange(0, 3)],
    irrigationType: ['Drip', 'Sprinkler', 'Flood', 'Rain-fed'][randomInRange(0, 3)],
    cropHistory: [
      {
        season: 'Kharif 2024',
        year: 2024,
        cropType: 'Sugarcane', // Default to Sugarcane for consistency
        variety: 'Co-86032',
        areaPlanted: randomInRange(5, 20),
        yield: randomInRange(20, 40),
        revenue: randomInRange(100000, 500000),
      },
    ],
    iotDevices: [],
    createdAt: randomPastDate(365),
    updatedAt: new Date(),
  };
};

// Generate mock demand forecast
export const generateMockDemandForecast = (crop: string): DemandForecast => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const predictions = months.map(month => ({
    month,
    demand: randomInRange(5000, 15000),
    confidence: 0.7 + Math.random() * 0.25,
  }));
  
  return {
    predictions,
    factors: [
      { factor: 'Global supply chain', impact: Math.random() * 0.5 },
      { factor: 'Weather patterns', impact: Math.random() * 0.3 },
      { factor: 'Government policies', impact: Math.random() * 0.2 },
    ],
    recommendation: `Based on current trends, ${crop} demand is expected to ${Math.random() > 0.5 ? 'increase' : 'remain stable'} over the next 6 months.`,
  };
};

// Generate mock yield estimation with 15-day predictions
export const generateMockYieldEstimation = (): YieldEstimation => {
  const estimatedYield = randomInRange(25, 45);
  
  return {
    estimatedYield,
    confidenceInterval: {
      lower: estimatedYield - 5,
      upper: estimatedYield + 5,
    },
    factors: [
      { factor: 'Soil quality', impact: 0.35 },
      { factor: 'Weather conditions', impact: 0.30 },
      { factor: 'Seed variety', impact: 0.20 },
      { factor: 'Irrigation', impact: 0.15 },
    ],
    recommendations: [
      'Consider using organic fertilizers to improve soil health',
      'Monitor weather forecasts for optimal planting time',
      'Ensure adequate irrigation during critical growth stages',
    ],
  };
};

// Generate 15-day yield predictions
export const generate15DayYieldPredictions = (cropType: string, currentYield: number = 0) => {
  const predictions = [];
  const baseYield = currentYield || randomInRange(25, 45);
  
  for (let day = 1; day <= 15; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    
    // Simulate yield growth over time with some randomness
    const growthFactor = 1 + (day * 0.02) + (Math.random() - 0.5) * 0.05;
    const predictedYield = baseYield * growthFactor;
    
    // Weather impact simulation
    const weatherImpact = Math.random() > 0.8 ? (Math.random() - 0.5) * 0.1 : 0;
    const finalYield = Math.max(0, predictedYield + (predictedYield * weatherImpact));
    
    predictions.push({
      date: date.toISOString().split('T')[0],
      day: day,
      predictedYield: Math.round(finalYield * 100) / 100,
      confidence: 0.95 - (day * 0.02), // Confidence decreases over time
      weatherFactor: weatherImpact,
      growthStage: getGrowthStage(day),
      recommendations: getDailyRecommendations(day, weatherImpact),
      riskFactors: getDailyRiskFactors(day, weatherImpact)
    });
  }
  
  return {
    cropType,
    currentYield: baseYield,
    predictions,
    summary: {
      averageYield: predictions.reduce((sum, p) => sum + p.predictedYield, 0) / predictions.length,
      maxYield: Math.max(...predictions.map(p => p.predictedYield)),
      minYield: Math.min(...predictions.map(p => p.predictedYield)),
      trendDirection: predictions[14].predictedYield > predictions[0].predictedYield ? 'increasing' : 'decreasing'
    },
    lastUpdated: new Date().toISOString()
  };
};

const getGrowthStage = (day: number): string => {
  if (day <= 3) return 'Early Growth';
  if (day <= 7) return 'Vegetative';
  if (day <= 10) return 'Flowering';
  if (day <= 13) return 'Grain Filling';
  return 'Maturity';
};

const getDailyRecommendations = (day: number, weatherImpact: number): string[] => {
  const recommendations = [];
  
  if (day <= 5) {
    recommendations.push('Monitor soil moisture levels');
    recommendations.push('Check for pest activity');
  } else if (day <= 10) {
    recommendations.push('Apply fertilizer if needed');
    recommendations.push('Ensure adequate water supply');
  } else {
    recommendations.push('Prepare for harvest');
    recommendations.push('Monitor grain moisture content');
  }
  
  if (weatherImpact < -0.05) {
    recommendations.push('Increase irrigation due to dry conditions');
  } else if (weatherImpact > 0.05) {
    recommendations.push('Ensure proper drainage to prevent waterlogging');
  }
  
  return recommendations;
};

const getDailyRiskFactors = (day: number, weatherImpact: number): Array<{risk: string, level: 'low' | 'medium' | 'high', mitigation: string}> => {
  const risks = [];
  
  if (weatherImpact < -0.05) {
    risks.push({
      risk: 'Drought Stress',
      level: 'high' as const,
      mitigation: 'Increase irrigation frequency'
    });
  }
  
  if (weatherImpact > 0.05) {
    risks.push({
      risk: 'Waterlogging',
      level: 'medium' as const,
      mitigation: 'Improve field drainage'
    });
  }
  
  if (day >= 7 && day <= 10) {
    risks.push({
      risk: 'Pest Infestation',
      level: Math.random() > 0.7 ? 'high' as const : 'low' as const,
      mitigation: 'Regular monitoring and IPM practices'
    });
  }
  
  return risks;
};

// Generate mock risk assessment
export const generateMockRiskAssessment = (): RiskAssessment => {
  return {
    overallRiskScore: Math.random() * 0.6 + 0.2,
    riskCategories: {
      pestRisk: Math.random() * 0.5,
      weatherRisk: Math.random() * 0.6,
      marketRisk: Math.random() * 0.4,
      financialRisk: Math.random() * 0.3,
    },
    mitigationStrategies: [
      {
        risk: 'Pest infestation',
        strategy: 'Implement integrated pest management practices',
        priority: 'high',
      },
      {
        risk: 'Drought conditions',
        strategy: 'Install drip irrigation system',
        priority: 'medium',
      },
      {
        risk: 'Price volatility',
        strategy: 'Consider forward contracts with buyers',
        priority: 'medium',
      },
    ],
  };
};

// Generate mock buyers
export const generateMockBuyers = (count: number = 20): Buyer[] => {
  const buyers: Buyer[] = [];
  const buyerTypes: ('individual' | 'cooperative' | 'company')[] = ['individual', 'cooperative', 'company'];
  
  for (let i = 0; i < count; i++) {
    const location = INDIAN_LOCATIONS[randomInRange(0, INDIAN_LOCATIONS.length - 1)];
    const district = location.districts[randomInRange(0, location.districts.length - 1)];
    
    buyers.push({
      id: `buyer_${i + 1}`,
      name: `${['Agro', 'Farm', 'Krishi', 'Green'][randomInRange(0, 3)]} ${['Traders', 'Cooperative', 'Industries', 'Exports'][randomInRange(0, 3)]}`,
      type: buyerTypes[randomInRange(0, 2)],
      location: {
        state: location.state,
        district,
        village: '',
        coordinates: { lat: 0, lng: 0 },
      },
      commoditiesInterested: COMMODITIES.slice(0, randomInRange(2, 5)).map(c => c.name),
      verificationStatus: 'verified',
      rating: 3.5 + Math.random() * 1.5,
      contactInfo: {
        phone: `+91 ${randomInRange(7000000000, 9999999999)}`,
        email: `buyer${i + 1}@example.com`,
      },
      minimumQuantity: randomInRange(10, 100),
      paymentTerms: ['Immediate', '15 days', '30 days'][randomInRange(0, 2)],
    });
  }
  
  return buyers;
};

// Generate mock transactions
export const generateMockTransactions = (userId: string, count: number = 10): Transaction[] => {
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const commodity = COMMODITIES[randomInRange(0, COMMODITIES.length - 1)];
    const quantity = randomInRange(10, 100);
    const pricePerUnit = randomInRange(commodity.minPrice, commodity.maxPrice);
    
    transactions.push({
      id: `txn_${i + 1}`,
      userId,
      type: Math.random() > 0.3 ? 'sale' : 'purchase',
      commodity: commodity.name,
      quantity,
      pricePerUnit,
      totalAmount: quantity * pricePerUnit,
      buyer: `Buyer ${randomInRange(1, 20)}`,
      transactionDate: randomPastDate(180),
      paymentMethod: ['Cash', 'Bank Transfer', 'UPI'][randomInRange(0, 2)],
      paymentStatus: 'completed',
    });
  }
  
  return transactions.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
};

// Generate mock inventory items
export const generateMockInventory = (farmId: string, count: number = 15): InventoryItem[] => {
  const items: InventoryItem[] = [];
  const categories: ('seed' | 'fertilizer' | 'pesticide' | 'equipment')[] = ['seed', 'fertilizer', 'pesticide', 'equipment'];
  
  const itemNames = {
    seed: ['Wheat Seeds', 'Rice Seeds', 'Cotton Seeds', 'Maize Seeds'],
    fertilizer: ['Urea', 'DAP', 'NPK', 'Organic Compost'],
    pesticide: ['Insecticide', 'Fungicide', 'Herbicide', 'Bio-pesticide'],
    equipment: ['Tractor', 'Sprayer', 'Harvester', 'Irrigation Pump'],
  };
  
  for (let i = 0; i < count; i++) {
    const category = categories[randomInRange(0, 3)];
    const names = itemNames[category];
    
    items.push({
      id: `inv_${i + 1}`,
      farmId,
      category,
      name: names[randomInRange(0, names.length - 1)],
      quantity: randomInRange(10, 500),
      unit: category === 'equipment' ? 'units' : 'kg',
      reorderThreshold: randomInRange(5, 50),
      cost: randomInRange(500, 50000),
      purchaseDate: randomPastDate(365),
      supplier: `Supplier ${randomInRange(1, 10)}`,
      notes: 'Good quality',
    });
  }
  
  return items;
};

// Generate mock subsidies
export const generateMockSubsidies = (): Subsidy[] => {
  return [
    {
      id: 'sub_1',
      name: 'PM-KISAN',
      description: 'Direct income support to farmers',
      eligibilityCriteria: ['Small and marginal farmers', 'Land ownership proof required'],
      benefits: '₹6,000 per year in three installments',
      applicationProcess: 'Apply online through PM-KISAN portal',
      state: 'All India',
      category: 'Income Support',
    },
    {
      id: 'sub_2',
      name: 'Soil Health Card Scheme',
      description: 'Free soil testing and health cards',
      eligibilityCriteria: ['All farmers'],
      benefits: 'Free soil testing and recommendations',
      applicationProcess: 'Contact local agriculture office',
      state: 'All India',
      category: 'Soil Management',
    },
    {
      id: 'sub_3',
      name: 'Pradhan Mantri Fasal Bima Yojana',
      description: 'Crop insurance scheme',
      eligibilityCriteria: ['All farmers growing notified crops'],
      benefits: 'Insurance coverage for crop loss',
      applicationProcess: 'Apply through banks or CSCs',
      state: 'All India',
      category: 'Insurance',
    },
  ];
};

// Generate mock insurance options
export const generateMockInsurance = (): Insurance[] => {
  return [
    {
      id: 'ins_1',
      provider: 'Agriculture Insurance Company',
      policyName: 'Comprehensive Crop Insurance',
      coverage: 'Covers all natural calamities and pest attacks',
      premium: 5000,
      sumInsured: 200000,
      eligibility: ['Farmers with land ownership', 'Growing notified crops'],
      features: ['Quick claim settlement', '24/7 support', 'Flexible payment options'],
    },
    {
      id: 'ins_2',
      provider: 'National Insurance',
      policyName: 'Weather-Based Crop Insurance',
      coverage: 'Covers weather-related crop losses',
      premium: 3500,
      sumInsured: 150000,
      eligibility: ['All farmers'],
      features: ['Automatic claim settlement', 'No survey required', 'Low premium'],
    },
  ];
};

// Generate mock notifications
export const generateMockNotifications = (userId: string): Notification[] => {
  return [
    {
      id: 'notif_1',
      userId,
      type: 'price_alert',
      title: 'Price Alert: Wheat',
      message: 'Wheat prices have crossed ₹2,200/quintal in your area',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'notif_2',
      userId,
      type: 'insight',
      title: 'Market Insight',
      message: 'Good time to sell onions - prices expected to drop next week',
      isRead: false,
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      id: 'notif_3',
      userId,
      type: 'task_reminder',
      title: 'Task Reminder',
      message: 'Time to apply fertilizer for wheat crop',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000),
    },
  ];
};

// Generate mock tasks
export const generateMockTasks = (farmId: string): Task[] => {
  return [
    {
      id: 'task_1',
      farmId,
      title: 'Apply Fertilizer',
      description: 'Apply NPK fertilizer to wheat field',
      category: 'maintenance',
      dueDate: new Date(Date.now() + 86400000 * 2),
      isCompleted: false,
      isRecurring: false,
      createdAt: new Date(),
    },
    {
      id: 'task_2',
      farmId,
      title: 'Harvest Rice',
      description: 'Harvest rice crop from north field',
      category: 'harvesting',
      dueDate: new Date(Date.now() + 86400000 * 7),
      isCompleted: false,
      isRecurring: false,
      createdAt: new Date(),
    },
    {
      id: 'task_3',
      farmId,
      title: 'Irrigation Check',
      description: 'Check and maintain irrigation system',
      category: 'maintenance',
      dueDate: new Date(Date.now() + 86400000),
      isCompleted: true,
      isRecurring: true,
      recurringPattern: 'weekly',
      createdAt: new Date(Date.now() - 86400000 * 7),
      completedAt: new Date(Date.now() - 86400000),
    },
  ];
};

// LocalStorage persistence helpers
export const saveMockDataToStorage = (key: string, data: any) => {
  localStorage.setItem(`agrifriend_mock_${key}`, JSON.stringify(data));
};

export const loadMockDataFromStorage = (key: string): any | null => {
  const data = localStorage.getItem(`agrifriend_mock_${key}`);
  return data ? JSON.parse(data) : null;
};

// Initialize mock data on first load
export const initializeMockData = () => {
  if (!loadMockDataFromStorage('initialized')) {
    const marketPrices = generateMockMarketPrices(100);
    const buyers = generateMockBuyers(30);
    const subsidies = generateMockSubsidies();
    const insurance = generateMockInsurance();
    
    saveMockDataToStorage('market_prices', marketPrices);
    saveMockDataToStorage('buyers', buyers);
    saveMockDataToStorage('subsidies', subsidies);
    saveMockDataToStorage('insurance', insurance);
    saveMockDataToStorage('initialized', true);
  }
};

// Real-time data service class
export class RealTimeDataService {
  private static instance: RealTimeDataService;
  private subscribers: Map<string, Function[]> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  static getInstance(): RealTimeDataService {
    if (!RealTimeDataService.instance) {
      RealTimeDataService.instance = new RealTimeDataService();
    }
    return RealTimeDataService.instance;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Update market prices every 30 seconds
    this.intervals.set('marketPrices', setInterval(() => {
      const updatedPrices = this.updateMarketPrices();
      this.notifySubscribers('marketPrices', updatedPrices);
    }, 30000));

    // Update yield predictions every 5 minutes
    this.intervals.set('yieldPredictions', setInterval(() => {
      const updatedPredictions = this.updateYieldPredictions();
      this.notifySubscribers('yieldPredictions', updatedPredictions);
    }, 300000));

    // Update dashboard metrics every minute
    this.intervals.set('dashboardMetrics', setInterval(() => {
      const metrics = this.generateDashboardMetrics();
      this.notifySubscribers('dashboardMetrics', metrics);
    }, 60000));

    // Update notifications every 2 minutes
    this.intervals.set('notifications', setInterval(() => {
      const notifications = this.generateRealTimeNotifications();
      this.notifySubscribers('notifications', notifications);
    }, 120000));
  }

  stop() {
    this.isRunning = false;
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
  }

  subscribe(dataType: string, callback: Function): () => void {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, []);
    }
    this.subscribers.get(dataType)!.push(callback);

    return () => {
      const callbacks = this.subscribers.get(dataType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notifySubscribers(dataType: string, data: any) {
    const callbacks = this.subscribers.get(dataType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber callback for ${dataType}:`, error);
        }
      });
    }
  }

  private updateMarketPrices(): MarketPrice[] {
    const existingPrices = loadMockDataFromStorage('market_prices') || [];
    
    // Update 20% of prices randomly
    const updatedPrices = existingPrices.map((price: MarketPrice) => {
      if (Math.random() < 0.2) {
        const changePercent = (Math.random() - 0.5) * 0.1; // ±5% change
        const newValue = Math.round(price.price.value * (1 + changePercent));
        const priceChange = newValue - price.price.value;
        
        return {
          ...price,
          price: { ...price.price, value: newValue },
          priceChange: {
            value: priceChange,
            percentage: parseFloat(((priceChange / price.price.value) * 100).toFixed(2))
          },
          timestamp: new Date()
        };
      }
      return price;
    });

    saveMockDataToStorage('market_prices', updatedPrices);
    return updatedPrices;
  }

  private updateYieldPredictions() {
    const crops = ['Wheat', 'Rice', 'Cotton', 'Maize'];
    const predictions = crops.map(crop => generate15DayYieldPredictions(crop));
    
    saveMockDataToStorage('yield_predictions_15day', predictions);
    return predictions;
  }

  private generateDashboardMetrics() {
    return {
      totalFarms: randomInRange(8400, 8500),
      activeFarmers: randomInRange(7800, 7900),
      totalMarkets: randomInRange(2380, 2420),
      avgYieldIncrease: (Math.random() * 10 + 15).toFixed(1) + '%',
      marketVolume: randomInRange(45000, 55000),
      priceStability: (Math.random() * 20 + 75).toFixed(1) + '%',
      lastUpdated: new Date().toISOString()
    };
  }

  private generateRealTimeNotifications() {
    const notificationTypes = [
      {
        type: 'price_alert',
        title: 'Price Alert',
        messages: [
          'Wheat prices increased by 3% in your area',
          'Rice prices showing upward trend',
          'Cotton prices reached monthly high'
        ]
      },
      {
        type: 'weather_alert',
        title: 'Weather Update',
        messages: [
          'Rain expected in next 24 hours',
          'Temperature rising - monitor crops',
          'Humidity levels optimal for growth'
        ]
      },
      {
        type: 'yield_update',
        title: 'Yield Prediction Update',
        messages: [
          'Your crop yield prediction updated',
          'Growth stage progressing well',
          'Harvest date estimate refined'
        ]
      }
    ];

    const randomNotif = notificationTypes[randomInRange(0, notificationTypes.length - 1)];
    const randomMessage = randomNotif.messages[randomInRange(0, randomNotif.messages.length - 1)];

    return {
      id: `notif_${Date.now()}`,
      type: randomNotif.type,
      title: randomNotif.title,
      message: randomMessage,
      timestamp: new Date().toISOString(),
      isRead: false
    };
  }

  // Get current real-time data
  getCurrentMarketPrices(): MarketPrice[] {
    return loadMockDataFromStorage('market_prices') || generateMockMarketPrices(100);
  }

  get15DayYieldPredictions(cropType?: string) {
    const allPredictions = loadMockDataFromStorage('yield_predictions_15day') || [];
    
    if (cropType) {
      return allPredictions.find((p: any) => p.cropType.toLowerCase() === cropType.toLowerCase());
    }
    
    return allPredictions;
  }

  getDashboardMetrics() {
    return this.generateDashboardMetrics();
  }

  // Simulate API calls with realistic delays
  async fetchRealTimeData(dataType: string, params?: any): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, randomInRange(100, 500)));

    switch (dataType) {
      case 'marketPrices':
        return this.getCurrentMarketPrices();
      
      case 'yieldPredictions':
        return this.get15DayYieldPredictions(params?.cropType);
      
      case 'dashboardMetrics':
        return this.getDashboardMetrics();
      
      case 'demandForecast':
        return generateMockDemandForecast(params?.crop || 'Wheat');
      
      case 'riskAssessment':
        return generateMockRiskAssessment();
      
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }
}

// Export singleton instance
export const realTimeDataService = RealTimeDataService.getInstance();

// Auto-start real-time updates when module is imported
if (typeof window !== 'undefined') {
  realTimeDataService.start();
}