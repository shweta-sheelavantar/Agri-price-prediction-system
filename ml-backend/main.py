"""
AgriFriend ML Backend - FastAPI Server
Provides AI/ML predictions for price forecasting, yield estimation, and risk assessment
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from datetime import datetime, timedelta
import logging

# Import our ML models
from models.price_predictor import PricePredictor
from models.yield_predictor import YieldPredictor
from models.risk_assessor import RiskAssessor
from services.data_collector import DataCollector
from services.model_monitor import ModelMonitor
from utils.database import DatabaseManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AgriFriend ML API",
    description="AI/ML Backend for Agricultural Predictions",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://agrifriend.com"],
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

@app.get("/")
async def root():
    return {
        "message": "AgriFriend ML API",
        "version": "1.0.0",
        "status": "active",
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