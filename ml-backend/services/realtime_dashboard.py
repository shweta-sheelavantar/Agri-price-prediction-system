"""
Real-Time Dashboard Metrics Service
Provides live dashboard data based on actual farm operations and market data
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
class FarmMetrics:
    user_id: str
    total_land_area: float
    crops_grown: int
    total_earnings: float
    current_season_earnings: float
    expenses: float
    profit_margin: float
    yield_efficiency: float
    last_updated: datetime

@dataclass
class MarketMetrics:
    commodity: str
    current_price: float
    price_change_24h: float
    price_change_7d: float
    market_volume: float
    demand_index: float
    supply_index: float
    last_updated: datetime

class RealTimeDashboardService:
    """
    Service for providing real-time dashboard metrics based on actual data
    """
    
    def __init__(self):
        self.agmarknet_client = AGMARKNETClient()
        self.data_collector = DataCollector()
        self.db_manager = DatabaseManager()
        
        # Cache for metrics
        self.farm_metrics_cache: Dict[str, FarmMetrics] = {}
        self.market_metrics_cache: Dict[str, MarketMetrics] = {}
        
        # Subscribers for real-time updates
        self.dashboard_subscribers: Dict[str, List[callable]] = {}
        
        # Update intervals (in seconds)
        self.farm_metrics_update_interval = 300  # 5 minutes
        self.market_metrics_update_interval = 60  # 1 minute
        
    async def start_monitoring(self):
        """Start real-time dashboard monitoring"""
        logger.info("Starting real-time dashboard monitoring...")
        
        # Start background tasks
        asyncio.create_task(self.update_farm_metrics_continuously())
        asyncio.create_task(self.update_market_metrics_continuously())
        asyncio.create_task(self.calculate_performance_indicators())
        
    async def update_farm_metrics_continuously(self):
        """Continuously update farm metrics for all users"""
        while True:
            try:
                # Get all active users
                users = await self.get_active_users()
                
                for user in users:
                    try:
                        metrics = await self.calculate_farm_metrics(user['id'])
                        self.farm_metrics_cache[user['id']] = metrics
                        
                        # Notify subscribers
                        await self.notify_dashboard_subscribers(user['id'], {
                            'type': 'farm_metrics_update',
                            'data': metrics.__dict__
                        })
                        
                    except Exception as e:
                        logger.error(f"Error updating farm metrics for user {user['id']}: {e}")
                        continue
                
                await asyncio.sleep(self.farm_metrics_update_interval)
                
            except Exception as e:
                logger.error(f"Error in farm metrics update loop: {e}")
                await asyncio.sleep(60)
    
    async def update_market_metrics_continuously(self):
        """Continuously update market metrics"""
        while True:
            try:
                # Major commodities to track
                commodities = ['wheat', 'rice', 'cotton', 'onion', 'tomato', 'potato', 'soybean']
                
                for commodity in commodities:
                    try:
                        metrics = await self.calculate_market_metrics(commodity)
                        self.market_metrics_cache[commodity] = metrics
                        
                        # Notify all subscribers about market updates
                        await self.broadcast_market_update({
                            'type': 'market_metrics_update',
                            'commodity': commodity,
                            'data': metrics.__dict__
                        })
                        
                    except Exception as e:
                        logger.error(f"Error updating market metrics for {commodity}: {e}")
                        continue
                
                await asyncio.sleep(self.market_metrics_update_interval)
                
            except Exception as e:
                logger.error(f"Error in market metrics update loop: {e}")
                await asyncio.sleep(30)
    
    async def calculate_performance_indicators(self):
        """Calculate and update performance indicators"""
        while True:
            try:
                # Calculate regional performance indicators
                regions = ['punjab', 'haryana', 'uttar pradesh', 'maharashtra', 'gujarat']
                
                for region in regions:
                    performance_data = await self.calculate_regional_performance(region)
                    
                    # Broadcast performance updates
                    await self.broadcast_performance_update({
                        'type': 'performance_update',
                        'region': region,
                        'data': performance_data
                    })
                
                # Update every hour
                await asyncio.sleep(3600)
                
            except Exception as e:
                logger.error(f"Error calculating performance indicators: {e}")
                await asyncio.sleep(600)
    
    async def calculate_farm_metrics(self, user_id: str) -> FarmMetrics:
        """Calculate real-time farm metrics for a user"""
        
        # Get user's farm profile
        farm_profile = await self.get_user_farm_profile(user_id)
        
        # Get user's transaction history
        transactions = await self.get_user_transactions(user_id)
        
        # Get user's inventory
        inventory = await self.get_user_inventory(user_id)
        
        # Calculate metrics
        total_land_area = farm_profile.get('land_area', {}).get('total', 0)
        crops_grown = len(farm_profile.get('crop_history', []))
        
        # Calculate earnings from transactions
        current_year = datetime.now().year
        total_earnings = 0
        current_season_earnings = 0
        expenses = 0
        
        for transaction in transactions:
            transaction_date = datetime.fromisoformat(transaction['date'])
            amount = transaction['amount']
            
            if transaction['type'] == 'sale':
                total_earnings += amount
                if transaction_date.year == current_year:
                    current_season_earnings += amount
            elif transaction['type'] == 'expense':
                expenses += amount
        
        # Calculate profit margin
        profit_margin = ((current_season_earnings - expenses) / current_season_earnings * 100) if current_season_earnings > 0 else 0
        
        # Calculate yield efficiency based on land area and production
        total_production = sum([item.get('quantity', 0) for item in inventory])
        yield_efficiency = (total_production / total_land_area) if total_land_area > 0 else 0
        
        return FarmMetrics(
            user_id=user_id,
            total_land_area=total_land_area,
            crops_grown=crops_grown,
            total_earnings=total_earnings,
            current_season_earnings=current_season_earnings,
            expenses=expenses,
            profit_margin=profit_margin,
            yield_efficiency=yield_efficiency,
            last_updated=datetime.now()
        )
    
    async def calculate_market_metrics(self, commodity: str) -> MarketMetrics:
        """Calculate real-time market metrics for a commodity"""
        
        # Get current price
        current_data = await self.agmarknet_client.get_current_prices(commodity, "all_india")
        current_price = current_data['current_price']
        
        # Get historical data for trend analysis
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date_7d = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        start_date_1d = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Get 7-day historical data
        historical_7d = await self.agmarknet_client.get_historical_prices(
            commodity, "all_india", start_date_7d, end_date
        )
        
        # Calculate price changes
        if len(historical_7d) > 0:
            price_7d_ago = historical_7d['price'].iloc[0] if len(historical_7d) > 7 else current_price
            price_1d_ago = historical_7d['price'].iloc[-2] if len(historical_7d) > 1 else current_price
            
            price_change_24h = ((current_price - price_1d_ago) / price_1d_ago * 100) if price_1d_ago > 0 else 0
            price_change_7d = ((current_price - price_7d_ago) / price_7d_ago * 100) if price_7d_ago > 0 else 0
        else:
            price_change_24h = 0
            price_change_7d = 0
        
        # Get market arrivals for volume estimation
        arrivals_data = await self.agmarknet_client.get_market_arrivals(commodity, "all_india")
        market_volume = arrivals_data.get('arrival_quantity', 0)
        
        # Calculate demand and supply indices (simplified)
        demand_index = self.calculate_demand_index(commodity, current_price, price_change_7d)
        supply_index = self.calculate_supply_index(commodity, market_volume)
        
        return MarketMetrics(
            commodity=commodity,
            current_price=current_price,
            price_change_24h=price_change_24h,
            price_change_7d=price_change_7d,
            market_volume=market_volume,
            demand_index=demand_index,
            supply_index=supply_index,
            last_updated=datetime.now()
        )
    
    def calculate_demand_index(self, commodity: str, current_price: float, price_change_7d: float) -> float:
        """Calculate demand index based on price trends"""
        
        # Base demand index
        base_demand = 50.0
        
        # Adjust based on price change (higher prices usually indicate higher demand)
        price_factor = min(max(price_change_7d * 2, -30), 30)  # Cap at ±30
        
        # Seasonal adjustments
        month = datetime.now().month
        seasonal_factor = self.get_seasonal_demand_factor(commodity, month)
        
        demand_index = base_demand + price_factor + seasonal_factor
        
        # Ensure index is between 0 and 100
        return max(0, min(100, demand_index))
    
    def calculate_supply_index(self, commodity: str, market_volume: float) -> float:
        """Calculate supply index based on market arrivals"""
        
        # Base supply index
        base_supply = 50.0
        
        # Adjust based on market volume (higher volume indicates higher supply)
        # Normalize volume (this would need calibration with actual data)
        volume_factor = min(max((market_volume - 300) / 10, -25), 25)  # Rough normalization
        
        # Seasonal adjustments
        month = datetime.now().month
        seasonal_factor = self.get_seasonal_supply_factor(commodity, month)
        
        supply_index = base_supply + volume_factor + seasonal_factor
        
        # Ensure index is between 0 and 100
        return max(0, min(100, supply_index))
    
    def get_seasonal_demand_factor(self, commodity: str, month: int) -> float:
        """Get seasonal demand adjustment factor"""
        
        seasonal_patterns = {
            'wheat': {1: 10, 2: 15, 3: 20, 4: 15, 5: 5, 6: -10, 7: -15, 8: -10, 9: -5, 10: 5, 11: 10, 12: 15},
            'rice': {1: 5, 2: 0, 3: -5, 4: -10, 5: -5, 6: 0, 7: 5, 8: 10, 9: 15, 10: 20, 11: 15, 12: 10},
            'cotton': {1: 15, 2: 20, 3: 15, 4: 10, 5: 5, 6: 0, 7: -5, 8: -10, 9: -5, 10: 0, 11: 5, 12: 10},
        }
        
        return seasonal_patterns.get(commodity, {}).get(month, 0)
    
    def get_seasonal_supply_factor(self, commodity: str, month: int) -> float:
        """Get seasonal supply adjustment factor"""
        
        seasonal_patterns = {
            'wheat': {1: -10, 2: -15, 3: -20, 4: 20, 5: 15, 6: 10, 7: 5, 8: 0, 9: -5, 10: -10, 11: -15, 12: -10},
            'rice': {1: -5, 2: 0, 3: 5, 4: 10, 5: 5, 6: 0, 7: -5, 8: -10, 9: -15, 10: 20, 11: 15, 12: 10},
            'cotton': {1: 20, 2: 15, 3: 10, 4: 5, 5: 0, 6: -5, 7: -10, 8: -15, 9: -10, 10: -5, 11: 0, 12: 5},
        }
        
        return seasonal_patterns.get(commodity, {}).get(month, 0)
    
    async def calculate_regional_performance(self, region: str) -> Dict[str, Any]:
        """Calculate regional agricultural performance indicators"""
        
        # Get regional price data
        commodities = ['wheat', 'rice', 'cotton']
        regional_data = {}
        
        for commodity in commodities:
            try:
                price_data = await self.agmarknet_client.get_current_prices(commodity, region)
                arrivals_data = await self.agmarknet_client.get_market_arrivals(commodity, region)
                
                regional_data[commodity] = {
                    'price': price_data['current_price'],
                    'volume': arrivals_data['arrival_quantity'],
                    'trend': price_data['price_trend']
                }
            except Exception as e:
                logger.error(f"Error getting regional data for {commodity} in {region}: {e}")
                continue
        
        # Calculate performance indicators
        avg_price_trend = sum([1 if data['trend'] == 'increasing' else -1 if data['trend'] == 'decreasing' else 0 
                              for data in regional_data.values()]) / len(regional_data) if regional_data else 0
        
        total_volume = sum([data['volume'] for data in regional_data.values()])
        
        performance_score = 50 + (avg_price_trend * 20) + min(max((total_volume - 1000) / 50, -30), 30)
        performance_score = max(0, min(100, performance_score))
        
        return {
            'region': region,
            'performance_score': performance_score,
            'total_market_volume': total_volume,
            'price_trend_indicator': avg_price_trend,
            'commodity_data': regional_data,
            'last_updated': datetime.now().isoformat()
        }
    
    async def get_active_users(self) -> List[Dict[str, Any]]:
        """Get list of active users"""
        # This would query the database for active users
        # For now, return mock data
        return [
            {'id': 'user_1', 'name': 'Farmer 1'},
            {'id': 'user_2', 'name': 'Farmer 2'},
        ]
    
    async def get_user_farm_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user's farm profile"""
        # This would query the database for user's farm profile
        return {
            'land_area': {'total': 10.5},
            'crop_history': ['wheat', 'rice', 'cotton'],
            'location': {'state': 'punjab', 'district': 'ludhiana'}
        }
    
    async def get_user_transactions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's transaction history"""
        # This would query the database for user's transactions
        return [
            {'date': '2024-10-15', 'type': 'sale', 'amount': 150000, 'commodity': 'wheat'},
            {'date': '2024-09-20', 'type': 'expense', 'amount': 25000, 'category': 'fertilizer'},
            {'date': '2024-08-10', 'type': 'sale', 'amount': 80000, 'commodity': 'rice'},
        ]
    
    async def get_user_inventory(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's current inventory"""
        # This would query the database for user's inventory
        return [
            {'commodity': 'wheat', 'quantity': 50, 'unit': 'quintal'},
            {'commodity': 'rice', 'quantity': 30, 'unit': 'quintal'},
        ]
    
    async def notify_dashboard_subscribers(self, user_id: str, update_data: Dict[str, Any]):
        """Notify dashboard subscribers of updates"""
        if user_id in self.dashboard_subscribers:
            for callback in self.dashboard_subscribers[user_id]:
                try:
                    # Handle both sync and async callbacks
                    if asyncio.iscoroutinefunction(callback):
                        await callback(update_data)
                    else:
                        callback(update_data)
                except Exception as e:
                    logger.error(f"Error notifying dashboard subscriber for user {user_id}: {e}")
    
    async def broadcast_market_update(self, update_data: Dict[str, Any]):
        """Broadcast market updates to all subscribers"""
        for user_id, callbacks in self.dashboard_subscribers.items():
            for callback in callbacks:
                try:
                    # Handle both sync and async callbacks
                    if asyncio.iscoroutinefunction(callback):
                        await callback(update_data)
                    else:
                        callback(update_data)
                except Exception as e:
                    logger.error(f"Error broadcasting market update to user {user_id}: {e}")
    
    async def broadcast_performance_update(self, update_data: Dict[str, Any]):
        """Broadcast performance updates to all subscribers"""
        for user_id, callbacks in self.dashboard_subscribers.items():
            for callback in callbacks:
                try:
                    # Handle both sync and async callbacks
                    if asyncio.iscoroutinefunction(callback):
                        await callback(update_data)
                    else:
                        callback(update_data)
                except Exception as e:
                    logger.error(f"Error broadcasting performance update to user {user_id}: {e}")
    
    def subscribe_to_dashboard_updates(self, user_id: str, callback: callable):
        """Subscribe to dashboard updates for a user"""
        if user_id not in self.dashboard_subscribers:
            self.dashboard_subscribers[user_id] = []
        
        self.dashboard_subscribers[user_id].append(callback)
        
        return lambda: self.dashboard_subscribers[user_id].remove(callback)
    
    async def get_current_farm_metrics(self, user_id: str) -> Optional[FarmMetrics]:
        """Get current farm metrics for a user"""
        if user_id in self.farm_metrics_cache:
            return self.farm_metrics_cache[user_id]
        
        # Calculate if not in cache
        metrics = await self.calculate_farm_metrics(user_id)
        self.farm_metrics_cache[user_id] = metrics
        return metrics
    
    async def get_current_market_metrics(self, commodity: str) -> Optional[MarketMetrics]:
        """Get current market metrics for a commodity"""
        if commodity in self.market_metrics_cache:
            return self.market_metrics_cache[commodity]
        
        # Calculate if not in cache
        metrics = await self.calculate_market_metrics(commodity)
        self.market_metrics_cache[commodity] = metrics
        return metrics

# Global instance
realtime_dashboard = RealTimeDashboardService()