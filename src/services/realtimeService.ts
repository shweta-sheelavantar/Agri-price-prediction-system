import { Notification } from '../types';
import { realTimeDataService, generate15DayYieldPredictions } from './mockData';

type NotificationCallback = (notification: Notification) => void;
type DashboardUpdateCallback = (update: any) => void;
type PredictionUpdateCallback = (update: any) => void;
type YieldPredictionCallback = (predictions: any) => void;
type MarketUpdateCallback = (prices: any) => void;

class RealtimeService {
  private subscribers: NotificationCallback[] = [];
  private dashboardSubscribers: DashboardUpdateCallback[] = [];
  private predictionSubscribers: PredictionUpdateCallback[] = [];
  private yieldPredictionSubscribers: YieldPredictionCallback[] = [];
  private marketUpdateSubscribers: MarketUpdateCallback[] = [];
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private isUsingMockData = true;

  // WebSocket connection with fallback to mock data
  connect(userId: string) {
    if (this.isConnecting || (this.websocket && this.websocket.readyState === WebSocket.OPEN)) {
      return;
    }

    // Start with mock data immediately to prevent buffering issues
    this.isUsingMockData = true;
    this.setupMockDataSubscriptions();

    this.isConnecting = true;
    const wsUrl = `ws://localhost:8000/ws/${userId}`;
    
    try {
      this.websocket = new WebSocket(wsUrl);
      
      // Set a connection timeout to prevent hanging
      const connectionTimeout = setTimeout(() => {
        if (this.websocket && this.websocket.readyState === WebSocket.CONNECTING) {
          console.log('🔌 WebSocket connection timeout, using mock data');
          this.websocket.close();
          this.isConnecting = false;
          this.isUsingMockData = true;
        }
      }, 3000); // 3 second timeout
      
      this.websocket.onopen = () => {
        console.log('🔗 Real-time connection established');
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.isUsingMockData = false;
        
        // Subscribe to notifications
        this.sendMessage({
          type: 'subscribe_notifications'
        });
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.websocket.onclose = () => {
        console.log('🔌 Real-time connection closed, switching to mock data');
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        this.websocket = null;
        this.isUsingMockData = true;
        this.setupMockDataSubscriptions();
        // Don't attempt reconnect immediately to prevent buffering
        setTimeout(() => this.attemptReconnect(userId), 5000);
      };
      
      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error, using mock data:', error);
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        this.isUsingMockData = true;
        this.setupMockDataSubscriptions();
      };
      
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection, using mock data:', error);
      this.isConnecting = false;
      this.isUsingMockData = true;
      this.setupMockDataSubscriptions();
    }
  }

  private setupMockDataSubscriptions() {
    console.log('📡 Setting up mock data subscriptions');
    
    // Subscribe to mock data updates
    realTimeDataService.subscribe('marketPrices', (data: any) => {
      this.marketUpdateSubscribers.forEach(callback => callback(data));
    });

    realTimeDataService.subscribe('yieldPredictions', (data: any) => {
      this.yieldPredictionSubscribers.forEach(callback => callback(data));
    });

    realTimeDataService.subscribe('dashboardMetrics', (data: any) => {
      this.dashboardSubscribers.forEach(callback => callback(data));
    });

    realTimeDataService.subscribe('notifications', (data: any) => {
      const notification: Notification = {
        id: data.id,
        userId: 'current-user',
        type: data.type as any,
        title: data.title,
        message: data.message,
        isRead: false,
        createdAt: new Date(data.timestamp),
      };
      this.notifySubscribers(notification);
    });
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'notification':
        this.handleNotification(message.data);
        break;
      case 'dashboard_update':
        this.handleDashboardUpdate(message.data);
        break;
      case 'prediction_update':
        this.handlePredictionUpdate(message.data);
        break;
      case 'pong':
        // Keep-alive response
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleNotification(data: any) {
    const notification: Notification = {
      id: data.id,
      userId: 'current-user',
      type: data.notification_type as any,
      title: data.title,
      message: data.message,
      isRead: false,
      createdAt: new Date(data.created_at),
    };
    
    this.notifySubscribers(notification);
  }

  private handleDashboardUpdate(data: any) {
    this.dashboardSubscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in dashboard update callback:', error);
      }
    });
  }

  private handlePredictionUpdate(data: any) {
    this.predictionSubscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in prediction update callback:', error);
      }
    });
  }

  private sendMessage(message: any) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  private attemptReconnect(userId: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🔄 Max reconnection attempts reached, falling back to polling');
      this.fallbackToPolling();
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(userId);
    }, delay);
  }

  private fallbackToPolling() {
    console.log('📡 Falling back to polling mode');
    this.startNotificationGenerator();
  }

  // Subscribe to real-time notifications
  subscribe(callback: NotificationCallback) {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Subscribe to dashboard updates
  subscribeToDashboard(callback: DashboardUpdateCallback) {
    this.dashboardSubscribers.push(callback);
    
    return () => {
      this.dashboardSubscribers = this.dashboardSubscribers.filter(cb => cb !== callback);
    };
  }

  // Subscribe to prediction updates
  subscribeToPredictions(callback: PredictionUpdateCallback) {
    this.predictionSubscribers.push(callback);
    
    return () => {
      this.predictionSubscribers = this.predictionSubscribers.filter(cb => cb !== callback);
    };
  }

  // Subscribe to 15-day yield predictions
  subscribeToYieldPredictions(callback: YieldPredictionCallback) {
    this.yieldPredictionSubscribers.push(callback);
    
    return () => {
      this.yieldPredictionSubscribers = this.yieldPredictionSubscribers.filter(cb => cb !== callback);
    };
  }

  // Subscribe to market updates
  subscribeToMarketUpdates(callback: MarketUpdateCallback) {
    this.marketUpdateSubscribers.push(callback);
    
    return () => {
      this.marketUpdateSubscribers = this.marketUpdateSubscribers.filter(cb => cb !== callback);
    };
  }

  private startNotificationGenerator() {
    // Fallback: Generate a notification every 45-90 seconds if WebSocket fails
    setInterval(() => {
      const notification = this.generateRandomNotification();
      this.notifySubscribers(notification);
    }, randomInRange(45000, 90000));
  }

  private notifySubscribers(notification: Notification) {
    this.subscribers.forEach(callback => callback(notification));
  }

  // Get 15-day yield predictions
  async get15DayYieldPredictions(cropType: string, farmData?: any): Promise<any> {
    if (this.isUsingMockData) {
      return generate15DayYieldPredictions(cropType);
    }

    try {
      const response = await fetch('http://localhost:8000/predict/yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_type: cropType,
          variety: farmData?.variety || 'Standard',
          state: farmData?.state || 'Punjab',
          district: farmData?.district || 'Ludhiana',
          soil_type: farmData?.soilType || 'Loam',
          irrigation_type: farmData?.irrigationType || 'Drip',
          planting_date: farmData?.plantingDate || new Date().toISOString().split('T')[0],
          area_hectares: farmData?.area || 10
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Convert backend response to 15-day format
      return this.convertToFifteenDayFormat(data, cropType);
    } catch (error) {
      console.warn('Backend unavailable for yield predictions, using mock data:', error);
      return generate15DayYieldPredictions(cropType);
    }
  }

  private convertToFifteenDayFormat(backendData: any, cropType: string) {
    // Convert backend yield prediction to 15-day format
    const baseYield = backendData.prediction?.predicted_yield?.per_hectare || 30;
    return generate15DayYieldPredictions(cropType, baseYield);
  }

  // Get current market prices
  async getCurrentMarketPrices(filters?: any): Promise<any> {
    if (this.isUsingMockData) {
      return realTimeDataService.getCurrentMarketPrices();
    }

    try {
      const response = await fetch('http://localhost:8000/realtime/dashboard/current-user');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Backend unavailable for market prices, using mock data:', error);
      return realTimeDataService.getCurrentMarketPrices();
    }
  }

  // Get dashboard metrics
  async getDashboardMetrics(userId: string): Promise<any> {
    if (this.isUsingMockData) {
      return realTimeDataService.getDashboardMetrics();
    }

    try {
      const response = await fetch(`http://localhost:8000/realtime/dashboard/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Backend unavailable for dashboard metrics, using mock data:', error);
      return realTimeDataService.getDashboardMetrics();
    }
  }

  // Get demand forecast
  async getDemandForecast(crop: string): Promise<any> {
    if (this.isUsingMockData) {
      return realTimeDataService.fetchRealTimeData('demandForecast', { crop });
    }

    try {
      const response = await fetch('http://localhost:8000/predict/demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: crop,
          state: 'Punjab',
          district: 'Ludhiana',
          days_ahead: 180
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Backend unavailable for demand forecast, using mock data:', error);
      return realTimeDataService.fetchRealTimeData('demandForecast', { crop });
    }
  }

  // Get risk assessment
  async getRiskAssessment(farmData: any): Promise<any> {
    if (this.isUsingMockData) {
      return realTimeDataService.fetchRealTimeData('riskAssessment', farmData);
    }

    try {
      const response = await fetch('http://localhost:8000/assess/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_type: farmData.cropType || 'Wheat',
          state: farmData.state || 'Punjab',
          district: farmData.district || 'Ludhiana',
          current_stage: farmData.currentStage || 'vegetative'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Backend unavailable for risk assessment, using mock data:', error);
      return realTimeDataService.fetchRealTimeData('riskAssessment', farmData);
    }
  }

  // Check connection status
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'mock' {
    if (this.isUsingMockData) return 'mock';
    if (this.isConnecting) return 'connecting';
    if (!this.websocket) return 'disconnected';
    
    switch (this.websocket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      default:
        return 'disconnected';
    }
  }

  // Check if using mock data
  isUsingMockDataSource(): boolean {
    return this.isUsingMockData;
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  private generateRandomNotification(): Notification {
    const types: Array<'price_alert' | 'task_reminder' | 'insight' | 'system'> = [
      'price_alert',
      'task_reminder',
      'insight',
      'system'
    ];

    const type = types[Math.floor(Math.random() * types.length)];

    const notifications = {
      price_alert: [
        {
          title: 'Price Alert: Wheat',
          message: 'Wheat prices increased by 5% in your region. Good time to sell!',
        },
        {
          title: 'Price Drop Alert',
          message: 'Onion prices dropped by 8%. Consider holding your stock.',
        },
        {
          title: 'Market Update',
          message: 'Cotton prices reached ₹6,500/quintal in Nashik market.',
        },
      ],
      task_reminder: [
        {
          title: 'Irrigation Reminder',
          message: 'Time to irrigate your wheat field. Weather forecast shows dry conditions.',
        },
        {
          title: 'Fertilizer Application',
          message: 'Apply organic fertilizer to your crops this week for optimal growth.',
        },
        {
          title: 'Pest Monitoring',
          message: 'Weekly pest inspection due. Check for signs of infestation.',
        },
      ],
      insight: [
        {
          title: 'AI Insight: Best Selling Time',
          message: 'Based on market trends, next week is optimal for selling your produce.',
        },
        {
          title: 'Yield Prediction Update',
          message: 'Your estimated yield increased to 32 quintals/acre based on recent weather.',
        },
        {
          title: 'Market Demand Forecast',
          message: 'High demand expected for your crop in the next 2 weeks.',
        },
      ],
      system: [
        {
          title: 'New Buyer Match',
          message: 'A verified buyer is interested in your wheat. Check buyer matching section.',
        },
        {
          title: 'Subsidy Alert',
          message: 'New government subsidy available for organic farming. Check eligibility.',
        },
        {
          title: 'Weather Alert',
          message: 'Heavy rainfall expected in 3 days. Prepare your fields accordingly.',
        },
      ],
    };

    const typeNotifications = notifications[type];
    const selected = typeNotifications[Math.floor(Math.random() * typeNotifications.length)];

    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId: 'current-user',
      type,
      title: selected.title,
      message: selected.message,
      isRead: false,
      createdAt: new Date(),
    };
  }
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const realtimeService = new RealtimeService();
