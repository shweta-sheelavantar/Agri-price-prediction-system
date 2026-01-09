"""
Continuous ML Prediction Service
Automatically updates ML predictions based on new data and market changes
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json
from dataclasses import dataclass

from models.price_predictor import PricePredictor
from models.yield_predictor import YieldPredictor
from models.risk_assessor import RiskAssessor
from services.agmarknet_client import AGMARKNETClient
from services.data_collector import DataCollector
from utils.database import DatabaseManager

logger = logging.getLogger(__name__)

@dataclass
class PredictionUpdate:
    prediction_id: str
    user_id: str
    prediction_type: str  # 'price', 'yield', 'risk'
    commodity: str
    state: str
    district: str
    prediction_data: Dict[str, Any]
    confidence: float
    created_at: datetime
    expires_at: datetime

class ContinuousMLService:
    """
    Service for continuous ML predictions and automatic updates
    """
    
    def __init__(self):
        self.price_predictor = PricePredictor()
        self.yield_predictor = YieldPredictor()
        self.risk_assessor = RiskAssessor()
        self.agmarknet_client = AGMARKNETClient()
        self.data_collector = DataCollector()
        self.db_manager = DatabaseManager()
        
        # Cache for active predictions
        self.active_predictions: Dict[str, PredictionUpdate] = {}
        
        # Subscribers for prediction updates
        self.prediction_subscribers: Dict[str, List[callable]] = {}
        
        # Update intervals (in seconds)
        self.price_prediction_interval = 1800  # 30 minutes
        self.yield_prediction_interval = 3600  # 1 hour
        self.risk_assessment_interval = 900    # 15 minutes
        
        # Data change thresholds for triggering updates
        self.price_change_threshold = 3.0  # 3% price change
        self.weather_change_threshold = 5.0  # Significant weather change
        
    async def start_continuous_predictions(self):
        """Start continuous ML prediction services"""
        logger.info("Starting continuous ML prediction services...")
        
        # Start background tasks
        asyncio.create_task(self.continuous_price_predictions())
        asyncio.create_task(self.continuous_yield_predictions())
        asyncio.create_task(self.continuous_risk_assessments())
        asyncio.create_task(self.monitor_data_changes())
        asyncio.create_task(self.cleanup_expired_predictions())
        
    async def continuous_price_predictions(self):
        """Continuously update price predictions"""
        while True:
            try:
                # Get all commodities and regions to predict
                prediction_targets = await self.get_price_prediction_targets()
                
                for target in prediction_targets:
                    try:
                        # Generate new prediction
                        prediction = await self.price_predictor.predict(
                            commodity=target['commodity'],
                            state=target['state'],
                            district=target['district'],
                            days_ahead=7
                        )
                        
                        # Create prediction update
                        prediction_update = PredictionUpdate(
                            prediction_id=f"price_{target['commodity']}_{target['state']}_{int(datetime.now().timestamp())}",
                            user_id="all",  # Global prediction
                            prediction_type="price",
                            commodity=target['commodity'],
                            state=target['state'],
                            district=target['district'],
                            prediction_data=prediction,
                            confidence=prediction.get('confidence', 0.85),
                            created_at=datetime.now(),
                            expires_at=datetime.now() + timedelta(hours=2)
                        )
                        
                        # Store and broadcast
                        await self.store_and_broadcast_prediction(prediction_update)
                        
                    except Exception as e:
                        logger.error(f"Error generating price prediction for {target}: {e}")
                        continue
                
                await asyncio.sleep(self.price_prediction_interval)
                
            except Exception as e:
                logger.error(f"Error in continuous price predictions: {e}")
                await asyncio.sleep(300)
    
    async def continuous_yield_predictions(self):
        """Continuously update yield predictions"""
        while True:
            try:
                # Get all farms that need yield predictions
                farms = await self.get_farms_for_yield_prediction()
                
                for farm in farms:
                    try:
                        # Generate yield prediction
                        prediction = await self.yield_predictor.predict(
                            crop_type=farm['crop_type'],
                            variety=farm['variety'],
                            state=farm['state'],
                            district=farm['district'],
                            soil_type=farm['soil_type'],
                            irrigation_type=farm['irrigation_type'],
                            planting_date=farm['planting_date'],
                            area_hectares=farm['area_hectares']
                        )
                        
                        # Create prediction update
                        prediction_update = PredictionUpdate(
                            prediction_id=f"yield_{farm['user_id']}_{farm['crop_type']}_{int(datetime.now().timestamp())}",
                            user_id=farm['user_id'],
                            prediction_type="yield",
                            commodity=farm['crop_type'],
                            state=farm['state'],
                            district=farm['district'],
                            prediction_data=prediction,
                            confidence=prediction.get('confidence', 0.80),
                            created_at=datetime.now(),
                            expires_at=datetime.now() + timedelta(hours=6)
                        )
                        
                        # Store and broadcast
                        await self.store_and_broadcast_prediction(prediction_update)
                        
                    except Exception as e:
                        logger.error(f"Error generating yield prediction for farm {farm}: {e}")
                        continue
                
                await asyncio.sleep(self.yield_prediction_interval)
                
            except Exception as e:
                logger.error(f"Error in continuous yield predictions: {e}")
                await asyncio.sleep(600)
    
    async def continuous_risk_assessments(self):
        """Continuously update risk assessments"""
        while True:
            try:
                # Get all farms that need risk assessment
                farms = await self.get_farms_for_risk_assessment()
                
                for farm in farms:
                    try:
                        # Generate risk assessment
                        assessment = await self.risk_assessor.assess(
                            crop_type=farm['crop_type'],
                            state=farm['state'],
                            district=farm['district'],
                            current_stage=farm['current_stage']
                        )
                        
                        # Create prediction update
                        prediction_update = PredictionUpdate(
                            prediction_id=f"risk_{farm['user_id']}_{farm['crop_type']}_{int(datetime.now().timestamp())}",
                            user_id=farm['user_id'],
                            prediction_type="risk",
                            commodity=farm['crop_type'],
                            state=farm['state'],
                            district=farm['district'],
                            prediction_data=assessment,
                            confidence=assessment.get('confidence', 0.75),
                            created_at=datetime.now(),
                            expires_at=datetime.now() + timedelta(hours=4)
                        )
                        
                        # Store and broadcast
                        await self.store_and_broadcast_prediction(prediction_update)
                        
                    except Exception as e:
                        logger.error(f"Error generating risk assessment for farm {farm}: {e}")
                        continue
                
                await asyncio.sleep(self.risk_assessment_interval)
                
            except Exception as e:
                logger.error(f"Error in continuous risk assessments: {e}")
                await asyncio.sleep(300)
    
    async def monitor_data_changes(self):
        """Monitor for significant data changes that trigger immediate updates"""
        previous_prices = {}
        previous_weather = {}
        
        while True:
            try:
                # Monitor price changes
                commodities = ['wheat', 'rice', 'cotton', 'onion', 'tomato']
                states = ['punjab', 'haryana', 'uttar pradesh', 'maharashtra']
                
                for commodity in commodities:
                    for state in states:
                        try:
                            # Get current price
                            current_data = await self.agmarknet_client.get_current_prices(commodity, state)
                            current_price = current_data['current_price']
                            
                            price_key = f"{commodity}_{state}"
                            
                            # Check for significant price change
                            if price_key in previous_prices:
                                previous_price = previous_prices[price_key]
                                change_percent = abs((current_price - previous_price) / previous_price * 100)
                                
                                if change_percent >= self.price_change_threshold:
                                    logger.info(f"Significant price change detected for {commodity} in {state}: {change_percent:.1f}%")
                                    
                                    # Trigger immediate price prediction update
                                    await self.trigger_immediate_price_update(commodity, state)
                            
                            previous_prices[price_key] = current_price
                            
                        except Exception as e:
                            logger.error(f"Error monitoring price for {commodity} in {state}: {e}")
                            continue
                
                # Monitor weather changes
                major_cities = [
                    {'city': 'ludhiana', 'state': 'punjab'},
                    {'city': 'karnal', 'state': 'haryana'},
                    {'city': 'meerut', 'state': 'uttar pradesh'},
                    {'city': 'nashik', 'state': 'maharashtra'}
                ]
                
                for location in major_cities:
                    try:
                        # Get current weather
                        weather_data = await self.data_collector.collect_weather_data(
                            location['state'], location['city']
                        )
                        
                        weather_key = f"{location['city']}_{location['state']}"
                        
                        # Check for significant weather changes
                        if weather_key in previous_weather:
                            prev_weather = previous_weather[weather_key]
                            
                            temp_change = abs(weather_data.get('temperature', 0) - prev_weather.get('temperature', 0))
                            rainfall_change = abs(weather_data.get('rainfall', 0) - prev_weather.get('rainfall', 0))
                            
                            if temp_change >= self.weather_change_threshold or rainfall_change >= 10:
                                logger.info(f"Significant weather change detected in {location['city']}")
                                
                                # Trigger immediate risk assessment update for the region
                                await self.trigger_immediate_risk_update(location['state'])
                        
                        previous_weather[weather_key] = weather_data
                        
                    except Exception as e:
                        logger.error(f"Error monitoring weather for {location}: {e}")
                        continue
                
                # Check every 5 minutes
                await asyncio.sleep(300)
                
            except Exception as e:
                logger.error(f"Error in data change monitoring: {e}")
                await asyncio.sleep(60)
    
    async def trigger_immediate_price_update(self, commodity: str, state: str):
        """Trigger immediate price prediction update"""
        try:
            prediction = await self.price_predictor.predict(
                commodity=commodity,
                state=state,
                district="all",
                days_ahead=7
            )
            
            prediction_update = PredictionUpdate(
                prediction_id=f"urgent_price_{commodity}_{state}_{int(datetime.now().timestamp())}",
                user_id="all",
                prediction_type="price",
                commodity=commodity,
                state=state,
                district="all",
                prediction_data=prediction,
                confidence=prediction.get('confidence', 0.85),
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(hours=1)
            )
            
            await self.store_and_broadcast_prediction(prediction_update, urgent=True)
            
        except Exception as e:
            logger.error(f"Error in immediate price update for {commodity} in {state}: {e}")
    
    async def trigger_immediate_risk_update(self, state: str):
        """Trigger immediate risk assessment update for a state"""
        try:
            # Get farms in the affected state
            farms = await self.get_farms_in_state(state)
            
            for farm in farms:
                assessment = await self.risk_assessor.assess(
                    crop_type=farm['crop_type'],
                    state=farm['state'],
                    district=farm['district'],
                    current_stage=farm['current_stage']
                )
                
                prediction_update = PredictionUpdate(
                    prediction_id=f"urgent_risk_{farm['user_id']}_{int(datetime.now().timestamp())}",
                    user_id=farm['user_id'],
                    prediction_type="risk",
                    commodity=farm['crop_type'],
                    state=farm['state'],
                    district=farm['district'],
                    prediction_data=assessment,
                    confidence=assessment.get('confidence', 0.75),
                    created_at=datetime.now(),
                    expires_at=datetime.now() + timedelta(hours=2)
                )
                
                await self.store_and_broadcast_prediction(prediction_update, urgent=True)
                
        except Exception as e:
            logger.error(f"Error in immediate risk update for state {state}: {e}")
    
    async def cleanup_expired_predictions(self):
        """Clean up expired predictions"""
        while True:
            try:
                current_time = datetime.now()
                expired_ids = []
                
                for pred_id, prediction in self.active_predictions.items():
                    if prediction.expires_at <= current_time:
                        expired_ids.append(pred_id)
                
                # Remove expired predictions
                for pred_id in expired_ids:
                    del self.active_predictions[pred_id]
                
                if expired_ids:
                    logger.info(f"Cleaned up {len(expired_ids)} expired predictions")
                
                # Clean up every hour
                await asyncio.sleep(3600)
                
            except Exception as e:
                logger.error(f"Error in prediction cleanup: {e}")
                await asyncio.sleep(600)
    
    async def store_and_broadcast_prediction(self, prediction: PredictionUpdate, urgent: bool = False):
        """Store prediction and broadcast to subscribers"""
        
        # Store in cache
        self.active_predictions[prediction.prediction_id] = prediction
        
        # Store in database
        await self.store_prediction_in_db(prediction)
        
        # Broadcast to subscribers
        await self.broadcast_prediction_update(prediction, urgent)
    
    async def store_prediction_in_db(self, prediction: PredictionUpdate):
        """Store prediction in database"""
        try:
            prediction_data = {
                'commodity': prediction.commodity,
                'state': prediction.state,
                'district': prediction.district,
                'predicted_value': prediction.prediction_data.get('current_price', 0),
                'target_date': prediction.expires_at.strftime("%Y-%m-%d")
            }
            
            self.db_manager.store_model_prediction(prediction.prediction_type, prediction_data)
            
        except Exception as e:
            logger.error(f"Error storing prediction in database: {e}")
    
    async def broadcast_prediction_update(self, prediction: PredictionUpdate, urgent: bool = False):
        """Broadcast prediction update to subscribers"""
        
        update_data = {
            'type': 'prediction_update',
            'prediction_type': prediction.prediction_type,
            'urgent': urgent,
            'data': {
                'id': prediction.prediction_id,
                'commodity': prediction.commodity,
                'state': prediction.state,
                'district': prediction.district,
                'prediction': prediction.prediction_data,
                'confidence': prediction.confidence,
                'created_at': prediction.created_at.isoformat()
            }
        }
        
        # Send to specific user or broadcast to all
        if prediction.user_id == "all":
            # Broadcast to all subscribers
            for user_id, callbacks in self.prediction_subscribers.items():
                for callback in callbacks:
                    try:
                        # Handle both sync and async callbacks
                        if asyncio.iscoroutinefunction(callback):
                            await callback(update_data)
                        else:
                            callback(update_data)
                    except Exception as e:
                        logger.error(f"Error broadcasting prediction to user {user_id}: {e}")
        else:
            # Send to specific user
            if prediction.user_id in self.prediction_subscribers:
                for callback in self.prediction_subscribers[prediction.user_id]:
                    try:
                        # Handle both sync and async callbacks
                        if asyncio.iscoroutinefunction(callback):
                            await callback(update_data)
                        else:
                            callback(update_data)
                    except Exception as e:
                        logger.error(f"Error sending prediction to user {prediction.user_id}: {e}")
    
    async def get_price_prediction_targets(self) -> List[Dict[str, str]]:
        """Get list of commodity-state combinations for price predictions"""
        commodities = ['wheat', 'rice', 'cotton', 'onion', 'tomato', 'potato']
        states = ['punjab', 'haryana', 'uttar pradesh', 'maharashtra', 'gujarat']
        
        targets = []
        for commodity in commodities:
            for state in states:
                targets.append({
                    'commodity': commodity,
                    'state': state,
                    'district': 'all'
                })
        
        return targets
    
    async def get_farms_for_yield_prediction(self) -> List[Dict[str, Any]]:
        """Get list of farms that need yield predictions"""
        # This would query the database for active farms
        return [
            {
                'user_id': 'user_1',
                'crop_type': 'wheat',
                'variety': 'HD-2967',
                'state': 'punjab',
                'district': 'ludhiana',
                'soil_type': 'alluvial',
                'irrigation_type': 'canal',
                'planting_date': '2024-11-15',
                'area_hectares': 2.5,
                'current_stage': 'vegetative'
            }
        ]
    
    async def get_farms_for_risk_assessment(self) -> List[Dict[str, Any]]:
        """Get list of farms that need risk assessment"""
        # This would query the database for active farms
        return [
            {
                'user_id': 'user_1',
                'crop_type': 'wheat',
                'state': 'punjab',
                'district': 'ludhiana',
                'current_stage': 'vegetative'
            }
        ]
    
    async def get_farms_in_state(self, state: str) -> List[Dict[str, Any]]:
        """Get farms in a specific state"""
        all_farms = await self.get_farms_for_risk_assessment()
        return [farm for farm in all_farms if farm['state'].lower() == state.lower()]
    
    def subscribe_to_predictions(self, user_id: str, callback: callable):
        """Subscribe to prediction updates"""
        if user_id not in self.prediction_subscribers:
            self.prediction_subscribers[user_id] = []
        
        self.prediction_subscribers[user_id].append(callback)
        
        return lambda: self.prediction_subscribers[user_id].remove(callback)
    
    async def get_latest_predictions(self, user_id: str, prediction_type: str = None) -> List[PredictionUpdate]:
        """Get latest predictions for a user"""
        predictions = []
        
        for prediction in self.active_predictions.values():
            if prediction.user_id == user_id or prediction.user_id == "all":
                if prediction_type is None or prediction.prediction_type == prediction_type:
                    predictions.append(prediction)
        
        # Sort by creation time (newest first)
        predictions.sort(key=lambda x: x.created_at, reverse=True)
        
        return predictions

# Global instance
continuous_ml = ContinuousMLService()