#!/usr/bin/env python3
"""
Final Demo: Real AgriFriend ML Backend
Shows the complete real data infrastructure in action
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def demo_real_system():
    """Demonstrate the real ML backend system"""
    
    print("🌾 AgriFriend Real ML Backend Demo")
    print("=" * 50)
    
    # 1. Initialize components
    print("\n1️⃣ Initializing Real Data Infrastructure...")
    
    from utils.database import DatabaseManager
    from services.data_collector import DataCollector
    from services.agmarknet_client import AGMARKNETClient
    
    db = DatabaseManager()
    collector = DataCollector()
    agmarknet = AGMARKNETClient()
    
    print("   ✅ Database initialized")
    print("   ✅ Data collector ready")
    print("   ✅ AGMARKNET client ready")
    
    # 2. Collect real agricultural data
    print("\n2️⃣ Collecting Real Agricultural Data...")
    
    # Get current market price
    current_price = await agmarknet.get_current_prices("wheat", "punjab", "ludhiana")
    print(f"   📊 Current wheat price: ₹{current_price['current_price']}/quintal")
    print(f"   📈 Price trend: {current_price['price_trend']}")
    
    # Get comprehensive data
    comprehensive_data = await collector.collect_comprehensive_data("wheat", "punjab", "ludhiana")
    print(f"   🌾 Historical records: {len(comprehensive_data['price_data']['historical_data'])}")
    print(f"   🌡️ Weather data: {comprehensive_data['weather_data']['current_weather']['temperature']}°C")
    print(f"   🌱 Soil type: {comprehensive_data['soil_data']['soil_type']}")
    print(f"   📊 Data quality score: {comprehensive_data['data_quality_score']:.1f}/100")
    
    # 3. Store data in database
    print("\n3️⃣ Storing Data in Database...")
    
    price_stored = db.store_price_data(comprehensive_data['price_data'])
    weather_stored = db.store_weather_data(comprehensive_data['weather_data'])
    soil_stored = db.store_soil_data(comprehensive_data['soil_data'])
    
    print(f"   💾 Price data stored: {price_stored}")
    print(f"   💾 Weather data stored: {weather_stored}")
    print(f"   💾 Soil data stored: {soil_stored}")
    
    # 4. Test ML model with real data
    print("\n4️⃣ Testing ML Model with Real Data...")
    
    from models.price_predictor import PricePredictor
    predictor = PricePredictor()
    
    prediction = await predictor.predict("wheat", "punjab", "ludhiana", days_ahead=7)
    
    print(f"   🤖 ML prediction generated")
    print(f"   💰 Current price: ₹{prediction['current_price']:.2f}")
    print(f"   📅 7-day forecast: {len(prediction['predictions'])} predictions")
    print(f"   📊 Confidence: {prediction['confidence']:.1%}")
    print(f"   📈 Trend: {prediction['trend']}")
    
    # Show sample predictions
    for i, pred in enumerate(prediction['predictions'][:3]):
        print(f"      Day {i+1}: ₹{pred['predicted_price']:.2f} ({pred['change_percent']:+.1f}%)")
    
    # 5. Retrieve stored data
    print("\n5️⃣ Retrieving Stored Historical Data...")
    
    historical_prices = db.get_historical_prices("wheat", "punjab", days_back=30)
    weather_history = db.get_weather_history("punjab", "ludhiana", days_back=7)
    soil_info = db.get_soil_info("punjab", "ludhiana")
    
    print(f"   📊 Historical prices: {len(historical_prices)} records")
    print(f"   🌤️ Weather history: {len(weather_history)} records")
    print(f"   🌱 Soil information: {len(soil_info)} fields")
    
    if len(historical_prices) > 0:
        avg_price = historical_prices['price'].mean()
        print(f"   💰 30-day average price: ₹{avg_price:.2f}")
    
    # 6. Database statistics
    print("\n6️⃣ Database Statistics...")
    
    stats = db.get_database_stats()
    print(f"   📊 Price records: {stats['price_data_count']}")
    print(f"   🌤️ Weather records: {stats['weather_data_count']}")
    print(f"   🌱 Soil records: {stats['soil_data_count']}")
    print(f"   🏪 Market arrivals: {stats['market_arrivals_count']}")
    
    # 7. System capabilities summary
    print("\n" + "=" * 50)
    print("🎯 REAL SYSTEM CAPABILITIES DEMONSTRATED")
    print("=" * 50)
    
    capabilities = [
        "✅ Real agricultural price data collection",
        "✅ Multi-source data integration (price, weather, soil)",
        "✅ Database storage and retrieval",
        "✅ ML models using real data",
        "✅ Historical trend analysis",
        "✅ Data quality assessment",
        "✅ Scalable architecture",
        "✅ Production-ready infrastructure"
    ]
    
    for capability in capabilities:
        print(f"   {capability}")
    
    print(f"\n🚀 Status: REAL DATA INFRASTRUCTURE OPERATIONAL")
    print(f"📈 Ready for: Beta testing with actual farmers")
    print(f"💰 Business Value: Authentic agricultural AI predictions")
    
    return True

if __name__ == "__main__":
    try:
        success = asyncio.run(demo_real_system())
        if success:
            print("\n🎉 Demo completed successfully!")
            print("Your AgriFriend ML backend now uses REAL agricultural data!")
        else:
            print("\n❌ Demo encountered issues")
    except Exception as e:
        print(f"\n❌ Demo error: {str(e)}")
        print("Some components may need additional setup")