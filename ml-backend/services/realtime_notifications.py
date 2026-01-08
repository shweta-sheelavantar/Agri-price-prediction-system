"""
Real-Time Notifications Service
Generates notifications based on actual data changes and thresholds
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json
from dataclasses import dataclass

from services.agmarknet_client import AGMARKNETClient
from services.data_collector import DataCollector
from utils.database import DatabaseManager

logger = logging.getLogger(__name__)

@dataclass
class PriceAlert:
    user_id: str
    commodity: str
    state: str
    target_price: float
    alert_type: str  # 'above', 'below', 'change_percent'
    threshold_value: float
    is_active: bool = True

@dataclass
class Notification:
    id: str
    user_id: str
    type: str
    title: str
    message: str
    data: Dict[str, Any]
    created_at: datetime
    is_read: bool = False

class RealTimeNotificationService:
    """
    Service for generating real-time notifications based on actual data
    """
    
    def __init__(self):
        self.agmarknet_client = AGMARKNETClient()
        self.data_collector = DataCollector()
        self.db_manager = DatabaseManager()
        
        # Store previous prices for change detection
        self.previous_prices: Dict[str, float] = {}
        
        # Store user alerts
        self.user_alerts: Dict[str, List[PriceAlert]] = {}
        
        # Notification subscribers
        self.subscribers: Dict[str, List[callable]] = {}
        
        # Weather thresholds for alerts
        self.weather_thresholds = {
            'heavy_rain': 50,  # mm
            'high_temperature': 40,  # celsius
            'low_temperature': 5,   # celsius
            'high_humidity': 90,    # percentage
            'strong_wind': 25       # km/h
        }
        
    async def start_monitoring(self):
        """Start real-time monitoring tasks"""
        logger.info("Starting real-time notification monitoring...")
        
        # Start background tasks
        asyncio.create_task(self.monitor_price_changes())
        asyncio.create_task(self.monitor_weather_alerts())
        asyncio.create_task(self.generate_farming_reminders())
        
    async def monitor_price_changes(self):
        """Monitor price changes and generate alerts"""
        while True:
            try:
                # Get current prices for major commodities
                commodities = ['wheat', 'rice', 'cotton', 'onion', 'tomato', 'potato']
                states = ['punjab', 'haryana', 'uttar pradesh', 'maharashtra', 'gujarat']
                
                for commodity in commodities:
                    for state in states:
                        try:
                            # Get current price
                            current_data = await self.agmarknet_client.get_current_prices(
                                commodity, state
                            )
                            
                            current_price = current_data['current_price']
                            price_key = f"{commodity}_{state}"
                            
                            # Check for significant price changes
                            if price_key in self.previous_prices:
                                previous_price = self.previous_prices[price_key]
                                change_percent = ((current_price - previous_price) / previous_price) * 100
                                
                                # Generate alert for significant changes (>5%)
                                if abs(change_percent) >= 5:
                                    await self.send_price_change_notification(
                                        commodity, state, current_price, previous_price, change_percent
                                    )
                            
                            # Update previous price
                            self.previous_prices[price_key] = current_price
                            
                            # Check user-specific price alerts
                            await self.check_user_price_alerts(commodity, state, current_price)
                            
                        except Exception as e:
                            logger.error(f"Error monitoring {commodity} in {state}: {e}")
                            continue
                
                # Wait 5 minutes before next check
                await asyncio.sleep(300)
                
            except Exception as e:
                logger.error(f"Error in price monitoring: {e}")
                await asyncio.sleep(60)
    
    async def monitor_weather_alerts(self):
        """Monitor weather conditions and generate alerts"""
        while True:
            try:
                # Get weather data for major agricultural regions
                regions = [
                    {'state': 'punjab', 'city': 'ludhiana'},
                    {'state': 'haryana', 'city': 'karnal'},
                    {'state': 'uttar pradesh', 'city': 'meerut'},
                    {'state': 'maharashtra', 'city': 'nashik'},
                    {'state': 'gujarat', 'city': 'rajkot'}
                ]
                
                for region in regions:
                    try:
                        weather_data = await self.data_collector.get_weather_data(
                            region['city'], region['state']
                        )
                        
                        # Check for weather alerts
                        await self.check_weather_thresholds(region, weather_data)
                        
                    except Exception as e:
                        logger.error(f"Error getting weather for {region}: {e}")
                        continue
                
                # Check weather every 30 minutes
                await asyncio.sleep(1800)
                
            except Exception as e:
                logger.error(f"Error in weather monitoring: {e}")
                await asyncio.sleep(300)
    
    async def generate_farming_reminders(self):
        """Generate farming task reminders based on season and crop cycles"""
        while True:
            try:
                current_date = datetime.now()
                month = current_date.month
                
                # Generate season-specific reminders
                reminders = self.get_seasonal_reminders(month)
                
                for reminder in reminders:
                    await self.send_farming_reminder_notification(reminder)
                
                # Check daily at 6 AM
                next_check = current_date.replace(hour=6, minute=0, second=0, microsecond=0)
                if next_check <= current_date:
                    next_check += timedelta(days=1)
                
                sleep_seconds = (next_check - current_date).total_seconds()
                await asyncio.sleep(sleep_seconds)
                
            except Exception as e:
                logger.error(f"Error generating farming reminders: {e}")
                await asyncio.sleep(3600)
    
    async def send_price_change_notification(self, commodity: str, state: str, 
                                           current_price: float, previous_price: float, 
                                           change_percent: float):
        """Send notification for significant price changes"""
        
        trend = "increased" if change_percent > 0 else "decreased"
        emoji = "📈" if change_percent > 0 else "📉"
        
        notification = Notification(
            id=f"price_change_{commodity}_{state}_{int(datetime.now().timestamp())}",
            user_id="all",  # Broadcast to all users
            type="price_alert",
            title=f"{emoji} {commodity.title()} Price {trend.title()}",
            message=f"{commodity.title()} prices {trend} by {abs(change_percent):.1f}% in {state.title()}. "
                   f"Current price: ₹{current_price}/quintal (was ₹{previous_price}/quintal)",
            data={
                "commodity": commodity,
                "state": state,
                "current_price": current_price,
                "previous_price": previous_price,
                "change_percent": change_percent,
                "trend": trend
            },
            created_at=datetime.now()
        )
        
        await self.broadcast_notification(notification)
    
    async def check_user_price_alerts(self, commodity: str, state: str, current_price: float):
        """Check if current price triggers any user alerts"""
        
        for user_id, alerts in self.user_alerts.items():
            for alert in alerts:
                if not alert.is_active:
                    continue
                    
                if alert.commodity.lower() != commodity.lower():
                    continue
                    
                if alert.state.lower() != state.lower():
                    continue
                
                triggered = False
                
                if alert.alert_type == 'above' and current_price >= alert.target_price:
                    triggered = True
                elif alert.alert_type == 'below' and current_price <= alert.target_price:
                    triggered = True
                
                if triggered:
                    notification = Notification(
                        id=f"user_alert_{user_id}_{int(datetime.now().timestamp())}",
                        user_id=user_id,
                        type="price_alert",
                        title=f"🎯 Price Alert: {commodity.title()}",
                        message=f"{commodity.title()} reached your target price of ₹{alert.target_price}/quintal in {state.title()}. "
                               f"Current price: ₹{current_price}/quintal",
                        data={
                            "commodity": commodity,
                            "state": state,
                            "current_price": current_price,
                            "target_price": alert.target_price,
                            "alert_type": alert.alert_type
                        },
                        created_at=datetime.now()
                    )
                    
                    await self.send_notification_to_user(user_id, notification)
                    
                    # Deactivate alert after triggering
                    alert.is_active = False
    
    async def check_weather_thresholds(self, region: Dict, weather_data: Dict):
        """Check weather data against thresholds and generate alerts"""
        
        alerts = []
        
        # Check temperature
        temp = weather_data.get('temperature', 0)
        if temp >= self.weather_thresholds['high_temperature']:
            alerts.append({
                'type': 'high_temperature',
                'message': f"High temperature alert: {temp}°C in {region['city'].title()}. "
                          f"Ensure adequate irrigation for your crops."
            })
        elif temp <= self.weather_thresholds['low_temperature']:
            alerts.append({
                'type': 'low_temperature',
                'message': f"Low temperature alert: {temp}°C in {region['city'].title()}. "
                          f"Protect sensitive crops from cold damage."
            })
        
        # Check rainfall
        rainfall = weather_data.get('rainfall', 0)
        if rainfall >= self.weather_thresholds['heavy_rain']:
            alerts.append({
                'type': 'heavy_rain',
                'message': f"Heavy rainfall alert: {rainfall}mm expected in {region['city'].title()}. "
                          f"Prepare drainage and protect crops from waterlogging."
            })
        
        # Check humidity
        humidity = weather_data.get('humidity', 0)
        if humidity >= self.weather_thresholds['high_humidity']:
            alerts.append({
                'type': 'high_humidity',
                'message': f"High humidity alert: {humidity}% in {region['city'].title()}. "
                          f"Monitor crops for fungal diseases."
            })
        
        # Send weather alerts
        for alert in alerts:
            notification = Notification(
                id=f"weather_{alert['type']}_{region['state']}_{int(datetime.now().timestamp())}",
                user_id="all",
                type="weather_alert",
                title=f"🌦️ Weather Alert: {region['city'].title()}",
                message=alert['message'],
                data={
                    "region": region,
                    "weather_data": weather_data,
                    "alert_type": alert['type']
                },
                created_at=datetime.now()
            )
            
            await self.broadcast_notification(notification)
    
    def get_seasonal_reminders(self, month: int) -> List[Dict[str, str]]:
        """Get farming reminders based on current month"""
        
        reminders = []
        
        # Kharif season (June-October)
        if month in [6, 7, 8, 9, 10]:
            if month == 6:
                reminders.append({
                    'title': '🌱 Kharif Sowing Season',
                    'message': 'Time to sow kharif crops like rice, cotton, sugarcane. Prepare your fields and check seed quality.'
                })
            elif month == 8:
                reminders.append({
                    'title': '💧 Monsoon Care',
                    'message': 'Monitor your crops for pest attacks. Ensure proper drainage to prevent waterlogging.'
                })
            elif month == 10:
                reminders.append({
                    'title': '🌾 Kharif Harvest',
                    'message': 'Kharif harvest season begins. Check crop maturity and plan harvesting schedule.'
                })
        
        # Rabi season (November-April)
        elif month in [11, 12, 1, 2, 3, 4]:
            if month == 11:
                reminders.append({
                    'title': '🌾 Rabi Sowing Season',
                    'message': 'Time to sow rabi crops like wheat, barley, peas. Ensure adequate irrigation facilities.'
                })
            elif month == 2:
                reminders.append({
                    'title': '🌡️ Winter Care',
                    'message': 'Protect crops from frost. Apply fertilizers for better growth during winter season.'
                })
            elif month == 4:
                reminders.append({
                    'title': '🚜 Rabi Harvest',
                    'message': 'Rabi harvest season. Monitor crop maturity and prepare harvesting equipment.'
                })
        
        # Summer season (May)
        elif month == 5:
            reminders.append({
                'title': '☀️ Summer Preparation',
                'message': 'Prepare for summer crops. Check irrigation systems and plan water conservation.'
            })
        
        return reminders
    
    async def send_farming_reminder_notification(self, reminder: Dict[str, str]):
        """Send farming reminder notification"""
        
        notification = Notification(
            id=f"farming_reminder_{int(datetime.now().timestamp())}",
            user_id="all",
            type="farming_reminder",
            title=reminder['title'],
            message=reminder['message'],
            data={
                "reminder_type": "seasonal",
                "month": datetime.now().month
            },
            created_at=datetime.now()
        )
        
        await self.broadcast_notification(notification)
    
    async def broadcast_notification(self, notification: Notification):
        """Broadcast notification to all subscribers"""
        
        # Store in database
        await self.store_notification(notification)
        
        # Send to all subscribers
        if "all" in self.subscribers:
            for callback in self.subscribers["all"]:
                try:
                    await callback(notification)
                except Exception as e:
                    logger.error(f"Error sending notification to subscriber: {e}")
    
    async def send_notification_to_user(self, user_id: str, notification: Notification):
        """Send notification to specific user"""
        
        # Store in database
        await self.store_notification(notification)
        
        # Send to user subscribers
        if user_id in self.subscribers:
            for callback in self.subscribers[user_id]:
                try:
                    await callback(notification)
                except Exception as e:
                    logger.error(f"Error sending notification to user {user_id}: {e}")
    
    async def store_notification(self, notification: Notification):
        """Store notification in database"""
        try:
            # Store notification data
            notification_data = {
                'id': notification.id,
                'user_id': notification.user_id,
                'type': notification.type,
                'title': notification.title,
                'message': notification.message,
                'data': json.dumps(notification.data),
                'created_at': notification.created_at.isoformat(),
                'is_read': notification.is_read
            }
            
            # Insert into database (simplified for now)
            logger.info(f"Storing notification: {notification.title}")
            
        except Exception as e:
            logger.error(f"Error storing notification: {e}")
    
    def subscribe_to_notifications(self, user_id: str, callback: callable):
        """Subscribe to notifications for a user"""
        if user_id not in self.subscribers:
            self.subscribers[user_id] = []
        
        self.subscribers[user_id].append(callback)
        
        return lambda: self.subscribers[user_id].remove(callback)
    
    def add_price_alert(self, user_id: str, alert: PriceAlert):
        """Add price alert for user"""
        if user_id not in self.user_alerts:
            self.user_alerts[user_id] = []
        
        self.user_alerts[user_id].append(alert)
    
    def remove_price_alert(self, user_id: str, alert_id: str):
        """Remove price alert for user"""
        if user_id in self.user_alerts:
            self.user_alerts[user_id] = [
                alert for alert in self.user_alerts[user_id] 
                if getattr(alert, 'id', None) != alert_id
            ]

# Global instance
realtime_notifications = RealTimeNotificationService()