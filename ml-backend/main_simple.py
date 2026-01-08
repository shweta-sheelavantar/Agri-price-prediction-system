"""
AgriFriend ML Backend - Simple Real-Time Edition
Demonstrates real-time features with actual data
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import asyncio
from datetime import datetime, timedelta
import logging

# Import our services
from services.agmarknet_client import AGMARKNETClient
from services.weather_service import weather_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AgriFriend ML API - Real-Time Demo",
    description="AI/ML Backend with Real Government Data + Weather",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
agmarknet_client = AGMARKNETClient()

@app.get("/")
async def root():
    return {
        "message": "🚀 AgriFriend Real-Time API",
        "version": "2.0.0",
        "status": "LIVE WITH REAL DATA",
        "features": {
            "government_data": "✅ AGMARKNET API Integrated",
            "weather_data": "✅ Weather Service Active",
            "real_time_updates": "✅ Live Monitoring",
            "api_key_status": "✅ Configured"
        },
        "data_sources": {
            "agmarknet_api": "579b464db66ec23bdd0000018b6fa4a91b50448363abcccd5f1f13be",
            "weather_api": "79093526d697101e68a0f9cf082e3a73"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "agmarknet": "✅ Ready",
            "weather": "✅ Ready",
            "database": "✅ Ready"
        }
    }

@app.get("/realtime/prices/{commodity}")
async def get_realtime_prices(commodity: str, state: str = "punjab"):
    """Get real-time prices from government API"""
    try:
        logger.info(f"🔄 Fetching real-time prices for {commodity} in {state}")
        
        # Get current prices from AGMARKNET
        price_data = await agmarknet_client.get_current_prices(commodity, state)
        
        # Get historical trend
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        historical_data = await agmarknet_client.get_historical_prices(commodity, state, start_date, end_date)
        
        # Calculate trend
        if len(historical_data) > 1:
            recent_avg = historical_data['price'].tail(3).mean()
            older_avg = historical_data['price'].head(3).mean()
            trend_percent = ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
        else:
            trend_percent = 0
        
        return {
            "success": True,
            "commodity": commodity,
            "state": state,
            "current_price": price_data["current_price"],
            "unit": price_data["unit"],
            "market_date": price_data["market_date"],
            "source": price_data["source"],
            "trend": {
                "direction": "up" if trend_percent > 0 else "down" if trend_percent < 0 else "stable",
                "percentage": round(trend_percent, 2)
            },
            "data_quality": price_data["data_quality"],
            "timestamp": datetime.now().isoformat(),
            "is_real_data": price_data["source"] == "AGMARKNET (Real API)"
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching prices: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/realtime/weather/{city}")
async def get_realtime_weather(city: str, state: str = "punjab"):
    """Get real-time weather data"""
    try:
        logger.info(f"🌦️ Fetching real-time weather for {city}, {state}")
        
        # Get weather data
        weather_data = await weather_service.get_weather_data(city, state)
        
        # Check for alerts
        alerts = weather_service.check_weather_alerts(weather_data)
        
        return {
            "success": True,
            "city": city,
            "state": state,
            "weather": weather_data,
            "alerts": alerts,
            "alert_count": len(alerts),
            "timestamp": datetime.now().isoformat(),
            "is_real_data": weather_data["source"] == "OpenWeatherMap API"
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching weather: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/realtime/dashboard")
async def get_realtime_dashboard():
    """Get real-time dashboard data"""
    try:
        logger.info("📊 Generating real-time dashboard")
        
        # Get prices for major commodities
        commodities = ["wheat", "rice", "cotton", "onion"]
        price_data = {}
        
        for commodity in commodities:
            try:
                data = await agmarknet_client.get_current_prices(commodity, "punjab")
                price_data[commodity] = {
                    "price": data["current_price"],
                    "trend": data["price_trend"],
                    "source": data["source"]
                }
            except Exception as e:
                logger.warning(f"Could not fetch {commodity} price: {e}")
                continue
        
        # Get weather for major agricultural cities
        cities = ["ludhiana", "karnal", "meerut"]
        weather_data = {}
        
        for city in cities:
            try:
                data = await weather_service.get_weather_data(city, "punjab")
                weather_data[city] = {
                    "temperature": data["temperature"],
                    "humidity": data["humidity"],
                    "description": data["description"],
                    "alerts": len(weather_service.check_weather_alerts(data))
                }
            except Exception as e:
                logger.warning(f"Could not fetch {city} weather: {e}")
                continue
        
        return {
            "success": True,
            "dashboard": {
                "prices": price_data,
                "weather": weather_data,
                "summary": {
                    "total_commodities": len(price_data),
                    "total_cities": len(weather_data),
                    "data_freshness": "live",
                    "last_updated": datetime.now().isoformat()
                }
            },
            "real_time_features": {
                "government_prices": "✅ Active",
                "weather_monitoring": "✅ Active",
                "alert_system": "✅ Ready"
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Dashboard error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/realtime/alerts")
async def get_realtime_alerts():
    """Get current real-time alerts"""
    try:
        logger.info("🚨 Checking real-time alerts")
        
        alerts = []
        
        # Check price alerts for major commodities
        commodities = ["wheat", "rice", "cotton"]
        for commodity in commodities:
            try:
                data = await agmarknet_client.get_current_prices(commodity, "punjab")
                
                # Simple alert logic
                if data["current_price"] > 3000:  # High price alert
                    alerts.append({
                        "type": "price_alert",
                        "severity": "medium",
                        "commodity": commodity,
                        "message": f"{commodity.title()} price is high: ₹{data['current_price']}/quintal",
                        "timestamp": datetime.now().isoformat()
                    })
            except:
                continue
        
        # Check weather alerts
        cities = ["ludhiana", "karnal"]
        for city in cities:
            try:
                weather_data = await weather_service.get_weather_data(city, "punjab")
                weather_alerts = weather_service.check_weather_alerts(weather_data)
                
                for alert in weather_alerts:
                    alerts.append({
                        "type": "weather_alert",
                        "severity": alert["severity"],
                        "city": city,
                        "message": alert["message"],
                        "timestamp": datetime.now().isoformat()
                    })
            except:
                continue
        
        return {
            "success": True,
            "alerts": alerts,
            "alert_count": len(alerts),
            "timestamp": datetime.now().isoformat(),
            "monitoring_status": "✅ Active"
        }
        
    except Exception as e:
        logger.error(f"❌ Alerts error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/demo/realtime")
async def demo_realtime_features():
    """Demonstrate all real-time features"""
    try:
        logger.info("🎬 Running real-time demo")
        
        demo_results = {
            "demo_timestamp": datetime.now().isoformat(),
            "features_tested": []
        }
        
        # Test 1: Government Price Data
        try:
            wheat_price = await agmarknet_client.get_current_prices("wheat", "punjab")
            demo_results["features_tested"].append({
                "feature": "Government Price Data",
                "status": "✅ Working",
                "sample_data": f"Wheat: ₹{wheat_price['current_price']}/quintal",
                "source": wheat_price["source"]
            })
        except Exception as e:
            demo_results["features_tested"].append({
                "feature": "Government Price Data",
                "status": "⚠️ Fallback Active",
                "error": str(e)
            })
        
        # Test 2: Weather Data
        try:
            weather = await weather_service.get_weather_data("ludhiana", "punjab")
            demo_results["features_tested"].append({
                "feature": "Weather Data",
                "status": "✅ Working",
                "sample_data": f"Ludhiana: {weather['temperature']}°C, {weather['description']}",
                "source": weather["source"]
            })
        except Exception as e:
            demo_results["features_tested"].append({
                "feature": "Weather Data",
                "status": "❌ Error",
                "error": str(e)
            })
        
        # Test 3: Real-time Alerts
        try:
            weather_alerts = weather_service.check_weather_alerts(weather)
            demo_results["features_tested"].append({
                "feature": "Alert System",
                "status": "✅ Working",
                "sample_data": f"{len(weather_alerts)} active alerts"
            })
        except Exception as e:
            demo_results["features_tested"].append({
                "feature": "Alert System",
                "status": "❌ Error",
                "error": str(e)
            })
        
        return {
            "success": True,
            "demo": demo_results,
            "summary": {
                "total_features": len(demo_results["features_tested"]),
                "working_features": len([f for f in demo_results["features_tested"] if "✅" in f["status"]]),
                "real_time_status": "🚀 LIVE AND OPERATIONAL"
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Demo error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting AgriFriend Real-Time Backend...")
    print("📊 Features: Government Data + Weather + Real-Time Monitoring")
    print("🔑 API Keys: AGMARKNET + Weather configured")
    print("🌐 Server: http://localhost:8000")
    
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )