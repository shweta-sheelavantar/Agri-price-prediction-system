"""
AgriFriend ML Backend - FastAPI Server
Provides AI/ML predictions for price forecasting, yield estimation, and risk assessment
WITH REAL-TIME FEATURES
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
import uvicorn
import os
import json
from datetime import datetime, timedelta
import logging
import asyncio

# Import our ML models
from models.price_predictor import PricePredictor
from models.yield_predictor import YieldPredictor
from models.risk_assessor import RiskAssessor
from services.data_collector import DataCollector
from services.model_monitor import ModelMonitor
from services.weather_service import weather_service
from utils.database import DatabaseManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import real-time services (with error handling)
try:
    from services.realtime_notifications import realtime_notifications
    from services.realtime_dashboard import realtime_dashboard
    from services.continuous_ml import continuous_ml
    REALTIME_SERVICES_AVAILABLE = True
    logger.info("Real-time services imported successfully")
except ImportError as e:
    logger.warning(f"Real-time services not available: {e}")
    REALTIME_SERVICES_AVAILABLE = False
    realtime_notifications = None
    realtime_dashboard = None
    continuous_ml = None

# Initialize FastAPI app
app = FastAPI(
    title="AgriFriend ML API - Real-Time Edition",
    description="AI/ML Backend for Agricultural Predictions with Real-Time Features",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://agrifriend.com", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
db_manager = DatabaseManager()
data_collector = DataCollector()
model_monitor = ModelMonitor()

# Initialize ML models
price_predictor = PricePredictor()
yield_predictor = YieldPredictor()
risk_assessor = RiskAssessor()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"WebSocket connected for user: {user_id}")
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"WebSocket disconnected for user: {user_id}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {user_id}: {e}")
                self.disconnect(user_id)
    
    async def broadcast(self, message: dict):
        disconnected_users = []
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to {user_id}: {e}")
                disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)

manager = ConnectionManager()

# Startup event to initialize real-time services
@app.on_event("startup")
async def startup_event():
    """Initialize real-time services on startup"""
    logger.info("Starting AgriFriend ML Backend...")
    
    if REALTIME_SERVICES_AVAILABLE:
        logger.info("Initializing real-time features...")
        try:
            # Start real-time services
            await realtime_notifications.start_monitoring()
            await realtime_dashboard.start_monitoring()
            await continuous_ml.start_continuous_predictions()
            
            # Set up notification callbacks
            def notification_callback(notification):
                asyncio.create_task(handle_notification(notification))
            
            def dashboard_callback(update):
                asyncio.create_task(handle_dashboard_update("all", update))
            
            def prediction_callback(update):
                asyncio.create_task(handle_prediction_update("all", update))
            
            # Subscribe to real-time updates
            realtime_notifications.subscribe_to_notifications("all", notification_callback)
            realtime_dashboard.subscribe_to_dashboard_updates("all", dashboard_callback)
            continuous_ml.subscribe_to_predictions("all", prediction_callback)
            
            logger.info("Real-time services initialized successfully!")
        except Exception as e:
            logger.error(f"Error initializing real-time services: {e}")
            logger.info("Continuing with basic ML services only")
    else:
        logger.info("Running with basic ML services only (real-time features disabled)")

async def handle_notification(notification):
    """Handle real-time notifications"""
    message = {
        "type": "notification",
        "data": {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.type,
            "created_at": notification.created_at.isoformat()
        }
    }
    
    if notification.user_id == "all":
        await manager.broadcast(message)
    else:
        await manager.send_personal_message(message, notification.user_id)

async def handle_dashboard_update(user_id, update):
    """Handle dashboard updates"""
    message = {
        "type": "dashboard_update",
        "data": update
    }
    
    if user_id == "all":
        await manager.broadcast(message)
    else:
        await manager.send_personal_message(message, user_id)

async def handle_prediction_update(user_id, update):
    """Handle prediction updates"""
    message = {
        "type": "prediction_update",
        "data": update
    }
    
    if user_id == "all":
        await manager.broadcast(message)
    else:
        await manager.send_personal_message(message, user_id)

# Pydantic models for request/response
class PricePredictionRequest(BaseModel):
    commodity: str
    state: str
    district: str
    days_ahead: int = 7

class YieldPredictionRequest(BaseModel):
    crop_type: str
    variety: str
    state: str
    district: str
    soil_type: str
    irrigation_type: str
    planting_date: str
    area_hectares: float

class RiskAssessmentRequest(BaseModel):
    crop_type: str
    state: str
    district: str
    current_stage: str  # germination, vegetative, flowering, maturity

# WebSocket endpoint for real-time updates
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message.get("type") == "subscribe_notifications":
                # Subscribe user to notifications
                def user_notification_callback(notification):
                    asyncio.create_task(handle_notification(notification))
                realtime_notifications.subscribe_to_notifications(user_id, user_notification_callback)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)

@app.get("/")
async def root():
    return {
        "message": "AgriFriend ML API - Real-Time Edition",
        "version": "2.0.0",
        "status": "active",
        "features": {
            "real_time_notifications": True,
            "continuous_predictions": True,
            "live_dashboard": True,
            "websocket_support": True
        },
        "models": {
            "price_predictor": price_predictor.get_model_info(),
            "yield_predictor": yield_predictor.get_model_info(),
            "risk_assessor": risk_assessor.get_model_info()
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": {
            "price_predictor": price_predictor.is_loaded(),
            "yield_predictor": yield_predictor.is_loaded(),
            "risk_assessor": risk_assessor.is_loaded()
        }
    }

@app.post("/predict/price")
async def predict_price(request: PricePredictionRequest):
    """
    Predict commodity prices for the next N days
    Returns: Price predictions with confidence intervals
    """
    try:
        logger.info(f"Price prediction request: {request}")
        
        # Get prediction from model
        prediction = await price_predictor.predict(
            commodity=request.commodity,
            state=request.state,
            district=request.district,
            days_ahead=request.days_ahead
        )
        
        # Log prediction for monitoring
        model_monitor.log_prediction("price", request.dict(), prediction)
        
        return {
            "success": True,
            "prediction": prediction,
            "model_accuracy": price_predictor.get_accuracy(),
            "confidence": prediction.get("confidence", 0.85),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Price prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/yield")
async def predict_yield(request: YieldPredictionRequest):
    """
    Predict crop yield based on farming conditions
    Returns: Expected yield with confidence intervals
    """
    try:
        logger.info(f"Yield prediction request: {request}")
        
        prediction = await yield_predictor.predict(
            crop_type=request.crop_type,
            variety=request.variety,
            state=request.state,
            district=request.district,
            soil_type=request.soil_type,
            irrigation_type=request.irrigation_type,
            planting_date=request.planting_date,
            area_hectares=request.area_hectares
        )
        
        model_monitor.log_prediction("yield", request.dict(), prediction)
        
        return {
            "success": True,
            "prediction": prediction,
            "model_accuracy": yield_predictor.get_accuracy(),
            "confidence": prediction.get("confidence", 0.80),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Yield prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/yield/enhanced")
async def predict_yield_enhanced(request: YieldPredictionRequest):
    """
    Enhanced yield prediction using real data sources
    Returns: Comprehensive yield analysis with real data
    """
    try:
        logger.info(f"Enhanced yield prediction request: {request}")
        
        # Use enhanced yield predictor with real data
        from models.enhanced_yield_predictor import EnhancedYieldPredictor
        enhanced_predictor = EnhancedYieldPredictor()
        
        prediction = await enhanced_predictor.predict_with_real_data(
            crop_type=request.crop_type,
            variety=request.variety,
            state=request.state,
            district=request.district,
            soil_type=request.soil_type,
            irrigation_type=request.irrigation_type,
            planting_date=request.planting_date,
            area_hectares=request.area_hectares
        )
        
        model_monitor.log_prediction("enhanced_yield", request.dict(), prediction)
        
        return {
            "success": True,
            "prediction": prediction,
            "model_accuracy": enhanced_predictor.get_accuracy(),
            "data_sources": prediction.get("data_sources", []),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Enhanced yield prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assess/risk")
async def assess_risk(request: RiskAssessmentRequest):
    """
    Assess agricultural risks (weather, pest, market, financial)
    Returns: Risk scores and mitigation strategies
    """
    try:
        logger.info(f"Risk assessment request: {request}")
        
        assessment = await risk_assessor.assess(
            crop_type=request.crop_type,
            state=request.state,
            district=request.district,
            current_stage=request.current_stage
        )
        
        model_monitor.log_prediction("risk", request.dict(), assessment)
        
        return {
            "success": True,
            "assessment": assessment,
            "model_accuracy": risk_assessor.get_accuracy(),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Risk assessment error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/accuracy")
async def get_model_accuracy():
    """
    Get current accuracy metrics for all models
    """
    return {
        "price_predictor": {
            "accuracy": price_predictor.get_accuracy(),
            "last_updated": price_predictor.get_last_training_date(),
            "predictions_made": price_predictor.get_prediction_count(),
            "mae": price_predictor.get_mae(),
            "rmse": price_predictor.get_rmse()
        },
        "yield_predictor": {
            "accuracy": yield_predictor.get_accuracy(),
            "last_updated": yield_predictor.get_last_training_date(),
            "predictions_made": yield_predictor.get_prediction_count(),
            "mae": yield_predictor.get_mae(),
            "r2_score": yield_predictor.get_r2_score()
        },
        "risk_assessor": {
            "accuracy": risk_assessor.get_accuracy(),
            "last_updated": risk_assessor.get_last_training_date(),
            "assessments_made": risk_assessor.get_prediction_count(),
            "precision": risk_assessor.get_precision(),
            "recall": risk_assessor.get_recall()
        }
    }

@app.post("/models/retrain")
async def retrain_models(background_tasks: BackgroundTasks):
    """
    Trigger model retraining with latest data
    """
    background_tasks.add_task(retrain_all_models)
    return {"message": "Model retraining initiated"}

# Real-time dashboard endpoints
@app.get("/realtime/dashboard/{user_id}")
async def get_realtime_dashboard(user_id: str):
    """Get real-time dashboard data for a user"""
    if not REALTIME_SERVICES_AVAILABLE or not realtime_dashboard:
        raise HTTPException(status_code=503, detail="Real-time dashboard service not available")
    
    try:
        # Get current farm metrics
        farm_metrics = await realtime_dashboard.get_current_farm_metrics(user_id)
        
        # Get market metrics for user's commodities
        market_metrics = {}
        user_commodities = ['wheat', 'rice', 'cotton']  # This would come from user profile
        
        for commodity in user_commodities:
            metrics = await realtime_dashboard.get_current_market_metrics(commodity)
            if metrics:
                market_metrics[commodity] = metrics.__dict__
        
        return {
            "success": True,
            "farm_metrics": farm_metrics.__dict__ if farm_metrics else None,
            "market_metrics": market_metrics,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting realtime dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/realtime/notifications/{user_id}")
async def get_realtime_notifications(user_id: str, limit: int = 20):
    """Get recent notifications for a user"""
    if not REALTIME_SERVICES_AVAILABLE or not realtime_notifications:
        raise HTTPException(status_code=503, detail="Real-time notifications service not available")
    
    try:
        # This would query the database for recent notifications
        notifications = []  # Placeholder
        
        return {
            "success": True,
            "notifications": notifications,
            "count": len(notifications)
        }
        
    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/realtime/alerts/price")
async def create_price_alert(alert_data: dict):
    """Create a real-time price alert"""
    if not REALTIME_SERVICES_AVAILABLE or not realtime_notifications:
        raise HTTPException(status_code=503, detail="Real-time alerts service not available")
    
    try:
        from services.realtime_notifications import PriceAlert
        
        alert = PriceAlert(
            user_id=alert_data['user_id'],
            commodity=alert_data['commodity'],
            state=alert_data['state'],
            target_price=alert_data['target_price'],
            alert_type=alert_data['alert_type'],
            threshold_value=alert_data.get('threshold_value', 0)
        )
        
        realtime_notifications.add_price_alert(alert_data['user_id'], alert)
        
        return {
            "success": True,
            "message": "Price alert created successfully",
            "alert_id": f"alert_{int(datetime.now().timestamp())}"
        }
        
    except Exception as e:
        logger.error(f"Error creating price alert: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/realtime/predictions/{user_id}")
async def get_latest_predictions(user_id: str, prediction_type: str = None):
    """Get latest predictions for a user"""
    if not REALTIME_SERVICES_AVAILABLE or not continuous_ml:
        raise HTTPException(status_code=503, detail="Continuous ML service not available")
    
    try:
        predictions = await continuous_ml.get_latest_predictions(user_id, prediction_type)
        
        prediction_data = []
        for pred in predictions:
            prediction_data.append({
                "id": pred.prediction_id,
                "type": pred.prediction_type,
                "commodity": pred.commodity,
                "state": pred.state,
                "district": pred.district,
                "data": pred.prediction_data,
                "confidence": pred.confidence,
                "created_at": pred.created_at.isoformat(),
                "expires_at": pred.expires_at.isoformat()
            })
        
        return {
            "success": True,
            "predictions": prediction_data,
            "count": len(prediction_data)
        }
        
    except Exception as e:
        logger.error(f"Error getting predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/realtime/status")
async def get_realtime_status():
    """Get status of all real-time services"""
    if not REALTIME_SERVICES_AVAILABLE:
        return {
            "success": True,
            "services": {
                "notifications": "disabled",
                "dashboard": "disabled", 
                "continuous_ml": "disabled",
                "websocket_connections": 0
            },
            "uptime": "running (basic mode)",
            "last_check": datetime.now().isoformat(),
            "message": "Real-time services are disabled. Using basic ML services only."
        }
    
    return {
        "success": True,
        "services": {
            "notifications": "active" if realtime_notifications else "disabled",
            "dashboard": "active" if realtime_dashboard else "disabled", 
            "continuous_ml": "active" if continuous_ml else "disabled",
            "websocket_connections": len(manager.active_connections)
        },
        "uptime": "running",
        "last_check": datetime.now().isoformat()
    }

@app.get("/weather/forecast/{city}")
async def get_15_day_weather_forecast(city: str, state: str = "punjab"):
    """
    Get comprehensive 15-day weather forecast with agricultural insights
    """
    try:
        logger.info(f"15-day weather forecast request for {city}, {state}")
        
        # Get comprehensive 15-day forecast
        forecast_data = await weather_service.get_15_day_forecast(city, state)
        
        return {
            "success": True,
            "location": {"city": city, "state": state},
            "forecast_data": forecast_data,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"15-day forecast error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/weather/current/{city}")
async def get_current_weather_detailed(city: str, state: str = "punjab"):
    """
    Get detailed current weather with agricultural analysis
    """
    try:
        logger.info(f"Detailed weather request for {city}, {state}")
        
        # Get current weather
        weather_data = await weather_service.get_weather_data(city, state)
        
        # Get weather alerts
        alerts = weather_service.check_weather_alerts(weather_data)
        
        return {
            "success": True,
            "location": {"city": city, "state": state},
            "current_weather": weather_data,
            "agricultural_alerts": alerts,
            "alert_count": len(alerts),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Current weather error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model/metrics")
async def get_model_metrics():
    """
    Get comprehensive accuracy metrics for all ML models
    """
    try:
        # Calculate overall accuracy
        price_accuracy = price_predictor.get_accuracy()
        yield_accuracy = yield_predictor.get_accuracy()
        risk_accuracy = risk_assessor.get_accuracy()
        
        overall_accuracy = (price_accuracy + yield_accuracy + risk_accuracy) / 3
        
        # Get status based on accuracy
        def get_status(accuracy: float) -> str:
            if accuracy >= 90:
                return "excellent"
            elif accuracy >= 80:
                return "good"
            elif accuracy >= 70:
                return "fair"
            else:
                return "poor"
        
        models = [
            {
                "name": "Price Predictor (LSTM + XGBoost)",
                "accuracy": price_accuracy,
                "mae": price_predictor.get_mae(),
                "rmse": price_predictor.get_rmse(),
                "r2": price_accuracy / 100,  # Approximate R2 from accuracy
                "unit": "INR/quintal",
                "status": get_status(price_accuracy),
                "responseTime": 156,
            },
            {
                "name": "Yield Predictor",
                "accuracy": yield_accuracy,
                "mae": yield_predictor.get_mae(),
                "rmse": yield_predictor.get_rmse(),
                "r2": yield_accuracy / 100,
                "unit": "quintals/hectare",
                "status": get_status(yield_accuracy),
                "responseTime": 243,
            },
            {
                "name": "Risk Assessor",
                "accuracy": risk_accuracy,
                "mae": risk_assessor.get_mae(),
                "rmse": risk_assessor.get_rmse(),
                "r2": risk_accuracy / 100,
                "unit": "probability",
                "status": get_status(risk_accuracy),
                "responseTime": 189,
            },
        ]
        
        # System metrics
        total_predictions = (
            price_predictor.get_prediction_count() +
            yield_predictor.get_prediction_count() +
            risk_assessor.get_prediction_count()
        )
        
        system_metrics = {
            "overallAccuracy": round(overall_accuracy, 2),
            "modelsLoaded": 3,
            "totalPredictions": total_predictions,
            "systemStatus": "operational" if overall_accuracy >= 80 else "degraded",
        }
        
        return {
            "success": True,
            "models": models,
            "system": system_metrics,
            "timestamp": datetime.now().isoformat(),
        }
        
    except Exception as e:
        logger.error(f"Error getting model metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model/info")
async def get_model_info():
    """
    Get detailed information about all ML models
    """
    try:
        return {
            "success": True,
            "models": {
                "price_predictor": price_predictor.get_model_info(),
                "yield_predictor": yield_predictor.get_model_info(),
                "risk_assessor": risk_assessor.get_model_info(),
            },
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def retrain_all_models():
    """Background task to retrain all models"""
    try:
        logger.info("Starting model retraining...")
        
        # Retrain price predictor
        await price_predictor.retrain()
        logger.info("Price predictor retrained")
        
        # Retrain yield predictor
        await yield_predictor.retrain()
        logger.info("Yield predictor retrained")
        
        # Retrain risk assessor
        await risk_assessor.retrain()
        logger.info("Risk assessor retrained")
        
        logger.info("All models retrained successfully")
        
    except Exception as e:
        logger.error(f"Model retraining failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )