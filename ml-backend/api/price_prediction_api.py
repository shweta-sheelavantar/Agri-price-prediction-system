#!/usr/bin/env python3
"""
FastAPI Backend for Agricultural Market Price Prediction System

Provides REST APIs for:
1. Past 15 days price trend
2. Today's real-time market price (with AGMARKNET API integration)
3. Next 15 days price predictions using ML models
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import requests
import os
import sys
import logging
from datetime import datetime, timedelta

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.price_prediction_model import AgriculturePricePredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Agricultural Market Price Prediction API",
    description="REST API for agricultural market price trends and ML-based predictions",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
predictor = None
DATA_PATH = 'data/agricultural_prices_5years.csv'
AGMARKNET_API_KEY = os.getenv('DATA_GOV_IN_API_KEY', 'your_api_key_here')

# Pydantic models for API responses
class PricePoint(BaseModel):
    date: str
    price: float

class TodayPrice(BaseModel):
    date: str
    price: float
    source: str

class PredictionPoint(BaseModel):
    date: str
    predicted_price: float

class ErrorResponse(BaseModel):
    error: str
    message: str

# Initialize ML model on startup
@app.on_event("startup")
async def startup_event():
    """Load trained ML models on startup"""
    global predictor
    
    try:
        predictor = AgriculturePricePredictor()
        predictor.load_models('models/saved')
        logger.info(f"✅ Loaded {len(predictor.models)} trained models")
    except Exception as e:
        logger.error(f"❌ Failed to load models: {e}")
        # Train models if not found
        logger.info("🔄 Training new models...")
        predictor = AgriculturePricePredictor()
        predictor.train_model(DATA_PATH)
        logger.info("✅ Models trained and ready")

@app.get("/")
async def root():
    """API health check"""
    return {
        "message": "Agricultural Market Price Prediction API",
        "status": "healthy",
        "models_loaded": len(predictor.models) if predictor else 0,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/commodities")
async def get_commodities():
    """Get list of available commodities and markets"""
    try:
        df = pd.read_csv(DATA_PATH)
        commodities = sorted(df['commodity'].unique().tolist())
        markets = sorted(df['market'].unique().tolist())
        
        return {
            "commodities": commodities,
            "markets": markets,
            "total_combinations": len(commodities) * len(markets)
        }
    except Exception as e:
        logger.error(f"Error getting commodities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/past-trend", response_model=List[PricePoint])
async def get_past_trend(
    commodity: str = Query(..., description="Commodity name (e.g., Wheat)"),
    market: str = Query(..., description="Market name (e.g., Delhi)")
):
    """
    Get past 15 days price trend for a commodity in a specific market
    
    Returns exactly the last 15 days of historical price data
    """
    try:
        if not predictor:
            raise HTTPException(status_code=503, detail="ML models not loaded")
        
        # Get past 15 days data
        past_data = predictor.get_past_15_days(commodity, market, DATA_PATH)
        
        if not past_data:
            raise HTTPException(
                status_code=404, 
                detail=f"No historical data found for {commodity} in {market}"
            )
        
        logger.info(f"📈 Retrieved past trend for {commodity}-{market}: {len(past_data)} days")
        return past_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting past trend: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/today-price", response_model=TodayPrice)
async def get_today_price(
    commodity: str = Query(..., description="Commodity name (e.g., Wheat)"),
    market: str = Query(..., description="Market name (e.g., Delhi)")
):
    """
    Get today's market price for a commodity
    
    First tries AGMARKNET API, falls back to most recent CSV data if API fails
    """
    try:
        # Try AGMARKNET API first
        agmarknet_price = await fetch_agmarknet_price(commodity, market)
        
        if agmarknet_price:
            logger.info(f"💰 Got real-time price for {commodity}-{market} from AGMARKNET")
            return agmarknet_price
        
        # Fallback to CSV data
        if not predictor:
            raise HTTPException(status_code=503, detail="ML models not loaded")
        
        csv_price = predictor.get_today_price(commodity, market, DATA_PATH)
        
        if not csv_price:
            raise HTTPException(
                status_code=404,
                detail=f"No price data found for {commodity} in {market}"
            )
        
        logger.info(f"📊 Using CSV fallback price for {commodity}-{market}")
        return csv_price
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting today's price: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/predict", response_model=List[PredictionPoint])
async def predict_prices(
    commodity: str = Query(..., description="Commodity name (e.g., Wheat)"),
    market: str = Query(..., description="Market name (e.g., Delhi)")
):
    """
    Predict next 15 days prices using Random Forest ML model
    
    Uses recursive forecasting: each day's prediction is used to predict the next day
    """
    try:
        if not predictor:
            raise HTTPException(status_code=503, detail="ML models not loaded")
        
        # Generate predictions
        predictions = predictor.predict_next_15_days(commodity, market, DATA_PATH)
        
        if not predictions:
            raise HTTPException(
                status_code=404,
                detail=f"Cannot generate predictions for {commodity} in {market}"
            )
        
        logger.info(f"🔮 Generated 15-day predictions for {commodity}-{market}")
        return predictions
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def fetch_agmarknet_price(commodity: str, market: str) -> Optional[TodayPrice]:
    """
    Fetch real-time price from AGMARKNET API
    
    Returns None if API call fails (for graceful fallback)
    """
    try:
        # AGMARKNET API endpoint
        url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
        
        # API parameters
        params = {
            'api-key': AGMARKNET_API_KEY,
            'format': 'json',
            'limit': 10,
            'filters[commodity]': commodity.lower(),
            'filters[market]': market.lower()
        }
        
        # Make API request with timeout
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('records') and len(data['records']) > 0:
                # Get the most recent record
                latest_record = data['records'][0]
                
                # Extract price (modal_price is the standard price)
                price = float(latest_record.get('modal_price', 0))
                
                if price > 0:
                    return TodayPrice(
                        date=datetime.now().strftime('%Y-%m-%d'),
                        price=round(price, 2),
                        source="AGMARKNET"
                    )
        
        logger.warning(f"AGMARKNET API returned no valid data for {commodity}-{market}")
        return None
        
    except requests.exceptions.Timeout:
        logger.warning(f"AGMARKNET API timeout for {commodity}-{market}")
        return None
    except requests.exceptions.RequestException as e:
        logger.warning(f"AGMARKNET API request failed: {e}")
        return None
    except Exception as e:
        logger.warning(f"AGMARKNET API error: {e}")
        return None

@app.get("/api/model-info")
async def get_model_info():
    """Get information about loaded ML models"""
    try:
        if not predictor:
            return {"error": "Models not loaded"}
        
        return {
            "total_models": len(predictor.models),
            "available_combinations": predictor.get_available_commodities_markets(),
            "feature_columns": predictor.feature_columns,
            "model_type": "Random Forest Regressor",
            "prediction_horizon": "15 days",
            "forecasting_method": "Recursive"
        }
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check if data file exists
        data_exists = os.path.exists(DATA_PATH)
        
        # Check if models are loaded
        models_loaded = predictor is not None and len(predictor.models) > 0
        
        # Check API key
        api_key_configured = AGMARKNET_API_KEY != 'your_api_key_here'
        
        return {
            "status": "healthy" if (data_exists and models_loaded) else "degraded",
            "data_file_exists": data_exists,
            "models_loaded": models_loaded,
            "total_models": len(predictor.models) if predictor else 0,
            "api_key_configured": api_key_configured,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Not Found", "message": str(exc.detail)}

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {"error": "Internal Server Error", "message": "An unexpected error occurred"}

if __name__ == "__main__":
    import uvicorn
    
    # Run the API server
    uvicorn.run(
        "price_prediction_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )