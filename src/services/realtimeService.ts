import { Notification } from '../types';

type NotificationCallback = (notification: Notification) => void;

class RealtimeService {
  private subscribers: NotificationCallback[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  // Subscribe to real-time notifications
  subscribe(callback: NotificationCallback) {
    this.subscribers.push(callback);
    
    // Start generating notifications if not already started
    if (!this.intervalId) {
      this.startNotificationGenerator();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
      if (this.subscribers.length === 0 && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  }

  private startNotificationGenerator() {
    // Generate a notification every 45-90 seconds
    this.intervalId = setInterval(() => {
      const notification = this.generateRandomNotification();
      this.notifySubscribers(notification);
    }, randomInRange(45000, 90000));
  }

  private notifySubscribers(notification: Notification) {
    this.subscribers.forEach(callback => callback(notification));
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
