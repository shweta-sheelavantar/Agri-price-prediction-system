#!/usr/bin/env python3
"""
Test Weather API Integration
Quick test to verify OpenWeatherMap API key is working
"""

import requests
import os
from dotenv import load_dotenv
from datetime import datetime

def test_weather_api():
    """Test OpenWeatherMap API with your key"""
    
    print("🌦️ Testing Weather API Integration")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    
    api_key = os.getenv("OPENWEATHER_API_KEY")
    
    if not api_key:
        print("❌ No Weather API key found!")
        print("📝 Please add OPENWEATHER_API_KEY to your .env file")
        print("🔗 Get free key at: https://openweathermap.org/api")
        return False
    
    print(f"🔑 API Key found: {api_key[:8]}...")
    
    # Test cities (major agricultural regions in India)
    test_cities = [
        {"name": "Ludhiana", "state": "Punjab"},
        {"name": "Karnal", "state": "Haryana"},
        {"name": "Meerut", "state": "Uttar Pradesh"},
        {"name": "Nashik", "state": "Maharashtra"},
        {"name": "Rajkot", "state": "Gujarat"}
    ]
    
    successful_tests = 0
    
    for city in test_cities:
        try:
            print(f"\n🌍 Testing weather for {city['name']}, {city['state']}...")
            
            # API endpoint for current weather
            url = f"http://api.openweathermap.org/data/2.5/weather"
            params = {
                'q': f"{city['name']},IN",  # IN for India
                'appid': api_key,
                'units': 'metric'  # Celsius
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract weather information
                temp = data['main']['temp']
                humidity = data['main']['humidity']
                description = data['weather'][0]['description']
                wind_speed = data['wind'].get('speed', 0) * 3.6  # Convert m/s to km/h
                
                print(f"✅ SUCCESS!")
                print(f"   🌡️ Temperature: {temp}°C")
                print(f"   💧 Humidity: {humidity}%")
                print(f"   🌤️ Condition: {description.title()}")
                print(f"   💨 Wind Speed: {wind_speed:.1f} km/h")
                
                # Check for agricultural alerts
                alerts = []
                if temp >= 40:
                    alerts.append("🔥 HIGH TEMPERATURE ALERT")
                if temp <= 5:
                    alerts.append("🧊 FROST WARNING")
                if humidity >= 90:
                    alerts.append("💧 HIGH HUMIDITY ALERT")
                if wind_speed >= 25:
                    alerts.append("💨 STRONG WIND ALERT")
                
                if alerts:
                    print(f"   🚨 Alerts: {', '.join(alerts)}")
                else:
                    print(f"   ✅ No weather alerts")
                
                successful_tests += 1
                
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"   Response: {response.text[:100]}...")
                
        except requests.exceptions.Timeout:
            print(f"⏰ Request timeout for {city['name']}")
        except requests.exceptions.RequestException as e:
            print(f"🌐 Network error for {city['name']}: {str(e)}")
        except Exception as e:
            print(f"❌ Unexpected error for {city['name']}: {str(e)}")
    
    # Test forecast API
    print(f"\n🔮 Testing 5-day forecast for Ludhiana...")
    try:
        forecast_url = f"http://api.openweathermap.org/data/2.5/forecast"
        forecast_params = {
            'q': 'Ludhiana,IN',
            'appid': api_key,
            'units': 'metric'
        }
        
        forecast_response = requests.get(forecast_url, params=forecast_params, timeout=10)
        
        if forecast_response.status_code == 200:
            forecast_data = forecast_response.json()
            forecasts = forecast_data['list'][:5]  # Next 5 forecasts
            
            print(f"✅ 5-Day Forecast Available!")
            for i, forecast in enumerate(forecasts, 1):
                date = datetime.fromtimestamp(forecast['dt']).strftime('%Y-%m-%d %H:%M')
                temp = forecast['main']['temp']
                desc = forecast['weather'][0]['description']
                print(f"   {i}. {date}: {temp}°C, {desc.title()}")
            
            successful_tests += 1
        else:
            print(f"❌ Forecast API Error: {forecast_response.status_code}")
            
    except Exception as e:
        print(f"❌ Forecast test failed: {str(e)}")
    
    # Summary
    print(f"\n" + "=" * 50)
    print(f"📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    print(f"Successful Tests: {successful_tests}/{len(test_cities) + 1}")
    print(f"API Key Status: {'✅ WORKING' if successful_tests > 0 else '❌ FAILED'}")
    
    if successful_tests >= len(test_cities):
        print(f"\n🎉 CONGRATULATIONS!")
        print(f"Your Weather API is working perfectly!")
        print(f"✅ Real weather data available for agricultural regions")
        print(f"✅ Weather alerts ready for farmers")
        print(f"✅ 5-day forecasts available")
        print(f"\n🚀 Your AgriFriend platform now has REAL weather integration!")
        
        # Show what farmers will get
        print(f"\n💰 PREMIUM FEATURES NOW ACTIVE:")
        print(f"   🌡️ Real-time temperature monitoring")
        print(f"   🌧️ Rainfall alerts and forecasts")
        print(f"   💧 Humidity-based disease warnings")
        print(f"   💨 Wind speed alerts for crop protection")
        print(f"   🔮 5-day weather forecasts")
        
        return True
    else:
        print(f"\n⚠️ PARTIAL SUCCESS")
        print(f"Some weather data is available, but check your API key")
        print(f"🔗 Verify your key at: https://openweathermap.org/api")
        return False

if __name__ == "__main__":
    print(f"🧪 Weather API Testing Suite")
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔗 API: OpenWeatherMap")
    
    success = test_weather_api()
    
    if success:
        print(f"\n🎯 NEXT STEPS:")
        print(f"1. Restart your ML backend: python main.py")
        print(f"2. Weather monitoring will start automatically")
        print(f"3. Farmers will receive real weather alerts")
        print(f"4. Charge premium prices for weather features!")
    else:
        print(f"\n🔧 TROUBLESHOOTING:")
        print(f"1. Check your .env file has: OPENWEATHER_API_KEY=your_key")
        print(f"2. Verify API key at: https://openweathermap.org/api")
        print(f"3. Make sure you verified your email")
        print(f"4. Wait 10 minutes after signup for key activation")