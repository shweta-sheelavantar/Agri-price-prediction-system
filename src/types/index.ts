// User and Authentication Types
export interface User {
  id: string;
  mobileNumber: string;
  primaryCrop: string;
  registrationDate: Date;
  lastLoginDate: Date;
  preferredLanguage: string;
  isActive: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notificationChannels: ('sms' | 'email' | 'push')[];
  priceAlertFrequency: 'realtime' | 'daily' | 'weekly';
  dashboardLayout: string;
  theme: 'light' | 'dark';
}

// Farm Profile Types
export interface FarmProfile {
  id: string;
  userId: string;
  farmName: string;
  location: Location;
  landArea: LandArea;
  soilType: string;
  irrigationType: string;
  cropHistory: CropHistory[];
  iotDevices: IoTDevice[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  state: string;
  district: string;
  village: string;
  coordinates: Coordinates;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LandArea {
  total: number;
  unit: 'acre' | 'hectare';
}

export interface CropHistory {
  season: string;
  year: number;
  cropType: string;
  variety: string;
  areaPlanted: number;
  yield: number;
  revenue: number;
}

export interface IoTDevice {
  deviceId: string;
  type: 'soil_moisture' | 'weather_station' | 'camera';
  status: 'active' | 'inactive';
  lastReading: Date;
}

// Market Price Types
export interface MarketPrice {
  id: string;
  commodity: string;
  variety: string;
  market: Market;
  price: Price;
  priceChange: PriceChange;
  timestamp: Date;
  source: string;
}

export interface Market {
  name: string;
  location: string;
  state: string;
}

export interface Price {
  value: number;
  unit: string;
  currency: 'INR';
}

export interface PriceChange {
  value: number;
  percentage: number;
}

// Price Alert Types
export interface PriceAlert {
  id: string;
  userId: string;
  commodity: string;
  condition: 'above' | 'below';
  threshold: number;
  location: string;
  isActive: boolean;
  notificationChannels: ('sms' | 'email' | 'push')[];
  createdAt: Date;
  triggeredAt?: Date;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  farmId: string;
  category: 'seed' | 'fertilizer' | 'pesticide' | 'equipment';
  name: string;
  quantity: number;
  unit: string;
  reorderThreshold: number;
  cost: number;
  purchaseDate: Date;
  expiryDate?: Date;
  supplier: string;
  notes: string;
}

// AI Prediction Types
export interface Prediction {
  id: string;
  userId: string;
  type: 'demand' | 'yield' | 'risk';
  inputParameters: Record<string, any>;
  results: Record<string, any>;
  confidence: number;
  createdAt: Date;
  userRating?: number;
  actualOutcome?: Record<string, any>;
}

export interface DemandForecast {
  predictions: DemandPrediction[];
  factors: Factor[];
  recommendation: string;
}

export interface DemandPrediction {
  month: string;
  demand: number;
  confidence: number;
}

export interface Factor {
  factor: string;
  impact: number;
}

export interface YieldEstimation {
  estimatedYield: number;
  confidenceInterval: ConfidenceInterval;
  factors: Factor[];
  recommendations: string[];
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
}

export interface RiskAssessment {
  overallRiskScore: number;
  riskCategories: RiskCategories;
  mitigationStrategies: MitigationStrategy[];
}

export interface RiskCategories {
  pestRisk: number;
  weatherRisk: number;
  marketRisk: number;
  financialRisk: number;
}

export interface MitigationStrategy {
  risk: string;
  strategy: string;
  priority: 'high' | 'medium' | 'low';
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  type: 'sale' | 'purchase';
  commodity: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  buyer?: string;
  seller?: string;
  transactionDate: Date;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  invoiceUrl?: string;
}

// Buyer Types
export interface Buyer {
  id: string;
  name: string;
  type: 'individual' | 'cooperative' | 'company';
  location: Location;
  commoditiesInterested: string[];
  verificationStatus: 'verified' | 'pending' | 'unverified';
  rating: number;
  contactInfo: ContactInfo;
  minimumQuantity: number;
  paymentTerms: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'price_alert' | 'task_reminder' | 'insight' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Task Types
export interface Task {
  id: string;
  farmId: string;
  title: string;
  description: string;
  category: 'planting' | 'harvesting' | 'maintenance' | 'other';
  dueDate: Date;
  isCompleted: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Subsidy Types
export interface Subsidy {
  id: string;
  name: string;
  description: string;
  eligibilityCriteria: string[];
  benefits: string;
  applicationProcess: string;
  deadline?: Date;
  state: string;
  category: string;
}

// Insurance Types
export interface Insurance {
  id: string;
  provider: string;
  policyName: string;
  coverage: string;
  premium: number;
  sumInsured: number;
  eligibility: string[];
  features: string[];
}
