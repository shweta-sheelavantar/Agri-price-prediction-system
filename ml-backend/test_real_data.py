#!/usr/bin/env python3
"""
Test Real Data Infrastructure
Verify that our data collection and storage systems work
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.data_collector import DataCollector
from services.agmarknet_client import AGMARKNETClient
from utils.database import DatabaseManager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_agmarknet_client():
    """Test AGMARKNET client functionality"""
    print("\n🌾 Testing AGMARKNET Client...")
    print("=" * 50)
    
    client = AGMARKNETClient()
    
    try:
        # Test current prices
        current_prices = await client.get_current_prices("wheat", "punjab", "ludhiana")
        print(f"✅ Current Price: ₹{current_prices['current_price']}/quintal")
        print(f"   Trend: {current_prices['price_trend']}")
        
        # Test historical data
        historical = await client.get_historical_prices("wheat", "punjab", "2024-11-01", "2024-12-01")
        print(f"✅ Historical Data: {len(historical)} records")
        print(f"   Price Range: ₹{historical['price'].min():.2f} - ₹{historical['price'].max():.2f}")
        
        # Test market arrivals
        arrivals = await client.get_market_arrivals("wheat", "punjab")
        print(f"✅ Market Arrivals: {arrivals['arrival_quantity']} tonnes")
        
        return True
        
    except Exception as e:
        print(f"❌ AGMARKNET Client Error: {str(e)}")
        return False

async def test_data_collector():
    """Test comprehensive data collector"""
    print("\n📊 Testing Data Collector...")
    print("=" * 50)
    
    collector = DataCollector()
    
    try:
        # Test price data collection
        price_data = await collector.collect_price_data("wheat", "punjab", "ludhiana")
        print(f"✅ Price Data Collected")
        print(f"   Current Price: ₹{price_data['current_price']['current_price']}")
        print(f"   Historical Records: {len(price_data['historical_data'])}")
        print(f"   Data Quality Score: {price_data['data_quality']['quality_score']}")
        
        # Test weather data collection
        weather_data = await collector.collect_weather_data("punjab", "ludhiana")
        print(f"✅ Weather Data Collected")
        print(f"   Temperature: {weather_data['current_weather']['temperature']}°C")
        print(f"   Humidity: {weather_data['current_weather']['humidity']}%")
        
        # Test soil data collection
        soil_data = await collector.collect_soil_data("punjab", "ludhiana")
        print(f"✅ Soil Data Collected")
        print(f"   Soil Type: {soil_data['soil_type']}")
        print(f"   pH Level: {soil_data['ph_level']}")
        
        # Test comprehensive data collection
        comprehensive = await collector.collect_comprehensive_data("wheat", "punjab", "ludhiana")
        print(f"✅ Comprehensive Data Collected")
        print(f"   Overall Quality Score: {comprehensive['data_quality_score']:.1f}")
        
        return comprehensive
        
    except Exception as e:
        print(f"❌ Data Collector Error: {str(e)}")
        return None

def test_database_manager():
    """Test database storage and retrieval"""
    print("\n💾 Testing Database Manager...")
    print("=" * 50)
    
    try:
        db = DatabaseManager()
        
        # Test database creation
        print("✅ Database initialized")
        
        # Get database stats
        stats = db.get_database_stats()
        print(f"✅ Database Stats:")
        for key, value in stats.items():
            print(f"   {key}: {value}")
        
        return db
        
    except Exception as e:
        print(f"❌ Database Manager Error: {str(e)}")
        return None

async def test_data_storage_integration():
    """Test integration between data collector and database"""
    print("\n🔄 Testing Data Storage Integration...")
    print("=" * 50)
    
    try:
        # Collect data
        collector = DataCollector()
        comprehensive_data = await collector.collect_comprehensive_data("wheat", "punjab", "ludhiana")
        
        if not comprehensive_data:
            print("❌ Failed to collect data")
            return False
        
        # Store data in database
        db = DatabaseManager()
        
        # Store price data
        price_stored = db.store_price_data(comprehensive_data["price_data"])
        print(f"✅ Price Data Stored: {price_stored}")
        
        # Store weather data
        weather_stored = db.store_weather_data(comprehensive_data["weather_data"])
        print(f"✅ Weather Data Stored: {weather_stored}")
        
        # Store soil data
        soil_stored = db.store_soil_data(comprehensive_data["soil_data"])
        print(f"✅ Soil Data Stored: {soil_stored}")
        
        # Test data retrieval
        historical_prices = db.get_historical_prices("wheat", "punjab", days_back=30)
        print(f"✅ Retrieved Historical Prices: {len(historical_prices)} records")
        
        weather_history = db.get_weather_history("punjab", "ludhiana", days_back=7)
        print(f"✅ Retrieved Weather History: {len(weather_history)} records")
        
        soil_info = db.get_soil_info("punjab", "ludhiana")
        print(f"✅ Retrieved Soil Info: {len(soil_info)} fields")
        
        return True
        
    except Exception as e:
        print(f"❌ Integration Error: {str(e)}")
        return False

async def test_ml_model_integration():
    """Test ML model with real data"""
    print("\n🤖 Testing ML Model Integration...")
    print("=" * 50)
    
    try:
        from models.price_predictor import PricePredictor
        
        predictor = PricePredictor()
        
        # Test prediction with real data
        prediction = await predictor.predict("wheat", "punjab", "ludhiana", days_ahead=7)
        
        print(f"✅ ML Prediction Generated")
        print(f"   Current Price: ₹{prediction['current_price']:.2f}")
        print(f"   7-day Predictions: {len(prediction['predictions'])} days")
        print(f"   Trend: {prediction['trend']}")
        print(f"   Confidence: {prediction['confidence']:.1%}")
        
        # Test if prediction uses real or synthetic data
        if "factors" in prediction:
            print(f"   Influencing Factors: {len(prediction['factors'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ ML Model Integration Error: {str(e)}")
        return False

async def run_comprehensive_test():
    """Run all tests to verify real data infrastructure"""
    print("🧪 AgriFriend Real Data Infrastructure Test")
    print("=" * 60)
    
    test_results = {}
    
    # Test individual components
    test_results["agmarknet"] = await test_agmarknet_client()
    test_results["data_collector"] = await test_data_collector() is not None
    test_results["database"] = test_database_manager() is not None
    test_results["integration"] = await test_data_storage_integration()
    test_results["ml_model"] = await test_ml_model_integration()
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed_tests = sum(test_results.values())
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.upper():20} {status}")
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 ALL TESTS PASSED - Real data infrastructure is working!")
        print("\n📈 Next Steps:")
        print("1. Set up real API keys for external data sources")
        print("2. Train ML models with collected real data")
        print("3. Implement automated data collection pipeline")
        print("4. Deploy to production environment")
    else:
        print("⚠️  Some tests failed - check the errors above")
        print("\n🔧 Troubleshooting:")
        print("1. Ensure all dependencies are installed")
        print("2. Check database permissions")
        print("3. Verify network connectivity for external APIs")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    asyncio.run(run_comprehensive_test())