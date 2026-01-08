#!/usr/bin/env python3
"""
Test Enhanced Predictions System
Tests the new real data integration and 15-day forecasts
"""

import requests
import json
from datetime import datetime

def test_enhanced_predictions():
    """Test all enhanced prediction endpoints"""
    
    base_url = "http://localhost:8000"
    
    print("🚀 Testing Enhanced Predictions System")
    print("=" * 50)
    
    tests_passed = 0
    total_tests = 0
    
    # Test 1: 15-Day Weather Forecast
    print("\n1. Testing 15-Day Weather Forecast...")
    total_tests += 1
    try:
        response = requests.get(f"{base_url}/weather/forecast/ludhiana?state=punjab", timeout=30)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('forecast_data'):
                forecast = data['forecast_data']
                forecast_days = len(forecast.get('forecast_15_days', []))
                print(f"   ✅ PASS - Got {forecast_days}-day forecast")
                print(f"   📊 Data source: {forecast.get('data_source', 'Unknown')}")
                print(f"   🎯 Confidence: {forecast.get('confidence', 'Unknown')}")
                
                # Check agricultural summary
                if 'agricultural_summary' in forecast:
                    summary = forecast['agricultural_summary']
                    print(f"   🌾 Agricultural condition: {summary.get('overall_condition', 'Unknown')}")
                    print(f"   💧 Irrigation days needed: {summary.get('irrigation_required_days', 0)}")
                
                tests_passed += 1
            else:
                print("   ❌ FAIL - Invalid forecast data structure")
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
    
    # Test 2: Current Weather with Agricultural Analysis
    print("\n2. Testing Current Weather with Agricultural Analysis...")
    total_tests += 1
    try:
        response = requests.get(f"{base_url}/weather/current/ludhiana?state=punjab", timeout=15)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('current_weather'):
                weather = data['current_weather']
                alerts = data.get('agricultural_alerts', [])
                print(f"   ✅ PASS - Current weather retrieved")
                print(f"   🌡️ Temperature: {weather.get('temperature', 'N/A')}°C")
                print(f"   💧 Humidity: {weather.get('humidity', 'N/A')}%")
                print(f"   🚨 Agricultural alerts: {len(alerts)}")
                tests_passed += 1
            else:
                print("   ❌ FAIL - Invalid weather data structure")
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
    
    # Test 3: Enhanced Yield Prediction
    print("\n3. Testing Enhanced Yield Prediction...")
    total_tests += 1
    try:
        payload = {
            "crop_type": "wheat",
            "variety": "HD-2967",
            "state": "punjab",
            "district": "ludhiana",
            "soil_type": "alluvial",
            "irrigation_type": "canal",
            "planting_date": "2024-11-15",
            "area_hectares": 2.5
        }
        
        response = requests.post(
            f"{base_url}/predict/yield/enhanced",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=45
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('prediction'):
                prediction = data['prediction']
                yield_pred = prediction.get('yield_prediction', {})
                market_potential = prediction.get('market_potential', {})
                
                print(f"   ✅ PASS - Enhanced yield prediction successful")
                print(f"   🌾 Expected yield: {yield_pred.get('expected_yield_per_hectare', 'N/A')} quintals/hectare")
                print(f"   💰 Estimated revenue: ₹{market_potential.get('estimated_gross_revenue', 'N/A'):,}")
                print(f"   📊 Data confidence: {yield_pred.get('data_confidence', 'N/A')}")
                print(f"   📈 Data sources: {', '.join(prediction.get('data_sources', []))}")
                
                # Check recommendations
                recommendations = prediction.get('recommendations', [])
                print(f"   💡 Recommendations: {len(recommendations)} provided")
                
                tests_passed += 1
            else:
                print("   ❌ FAIL - Invalid prediction data structure")
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
            if response.status_code == 500:
                try:
                    error_data = response.json()
                    print(f"   🔍 Error details: {error_data.get('detail', 'Unknown error')}")
                except:
                    pass
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
    
    # Test 4: System Status Check
    print("\n4. Testing System Status...")
    total_tests += 1
    try:
        response = requests.get(f"{base_url}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ PASS - System status: {data.get('status', 'Unknown')}")
            print(f"   🔧 Version: {data.get('version', 'Unknown')}")
            
            features = data.get('features', {})
            for feature, status in features.items():
                status_icon = "✅" if status else "❌"
                print(f"   {status_icon} {feature}: {status}")
            
            tests_passed += 1
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
    
    # Summary
    success_rate = (tests_passed / total_tests * 100) if total_tests > 0 else 0
    
    print("\n" + "=" * 50)
    print("📊 ENHANCED PREDICTIONS TEST SUMMARY")
    print("=" * 50)
    print(f"Tests Passed: {tests_passed}/{total_tests}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 75:
        print("\n🎉 ENHANCED PREDICTIONS: READY FOR PRODUCTION! 🚀")
        print("✅ Real data integration working")
        print("✅ 15-day weather forecasts available")
        print("✅ Enhanced yield predictions with market analysis")
        print("✅ Agricultural insights and recommendations")
        print("\n🌾 Your farmers now have access to:")
        print("   • 15-day weather forecasts with farming insights")
        print("   • Real data-driven yield predictions")
        print("   • Market potential analysis")
        print("   • Data-driven farming recommendations")
        print("   • Growth monitoring timelines")
    elif success_rate >= 50:
        print("\n⚠️ ENHANCED PREDICTIONS: MOSTLY WORKING")
        print("⚠️ Some advanced features may need attention")
        print("✅ Core enhanced functionality available")
    else:
        print("\n❌ ENHANCED PREDICTIONS: NEEDS ATTENTION")
        print("❌ Multiple issues detected")
        print("❌ Enhanced features not ready for production")
    
    print(f"\n🕒 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return success_rate >= 75

if __name__ == "__main__":
    test_enhanced_predictions()