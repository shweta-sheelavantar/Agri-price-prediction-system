"""
Weather Service with Real API + Intelligent Fallback
Provides real weather data when API is available, realistic data when not
"""

import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import random
import os
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class WeatherService:
    """
    Smart weather service that uses real API when available,
    falls back to realistic weather data when not
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        self.base_url = "http://api.openweathermap.org/data/2.5"
        
        # Realistic weather patterns for Indian agricultural regions
        self.regional_patterns = {
            'punjab': {
                'winter': {'temp_range': (5, 20), 'humidity_range': (60, 80), 'rainfall_prob': 0.2},
                'summer': {'temp_range': (25, 45), 'humidity_range': (40, 70), 'rainfall_prob': 0.1},
                'monsoon': {'temp_range': (25, 35), 'humidity_range': (70, 95), 'rainfall_prob': 0.7},
                'post_monsoon': {'temp_range': (15, 30), 'humidity_range': (50, 75), 'rainfall_prob': 0.3}
            },
            'haryana': {
                'winter': {'temp_range': (3, 18), 'humidity_range': (55, 75), 'rainfall_prob': 0.15},
                'summer': {'temp_range': (28, 47), 'humidity_range': (35, 65), 'rainfall_prob': 0.08},
                'monsoon': {'temp_range': (26, 36), 'humidity_range': (65, 90), 'rainfall_prob': 0.65},
                'post_monsoon': {'temp_range': (12, 28), 'humidity_range': (45, 70), 'rainfall_prob': 0.25}
            },
            'uttar pradesh': {
                'winter': {'temp_range': (8, 22), 'humidity_range': (65, 85), 'rainfall_prob': 0.18},
                'summer': {'temp_range': (30, 46), 'humidity_range': (45, 75), 'rainfall_prob': 0.12},
                'monsoon': {'temp_range': (28, 38), 'humidity_range': (75, 95), 'rainfall_prob': 0.75},
                'post_monsoon': {'temp_range': (18, 32), 'humidity_range': (55, 80), 'rainfall_prob': 0.35}
            },
            'maharashtra': {
                'winter': {'temp_range': (12, 28), 'humidity_range': (50, 70), 'rainfall_prob': 0.1},
                'summer': {'temp_range': (25, 42), 'humidity_range': (40, 65), 'rainfall_prob': 0.15},
                'monsoon': {'temp_range': (24, 32), 'humidity_range': (80, 95), 'rainfall_prob': 0.8},
                'post_monsoon': {'temp_range': (20, 35), 'humidity_range': (60, 80), 'rainfall_prob': 0.4}
            },
            'gujarat': {
                'winter': {'temp_range': (10, 25), 'humidity_range': (45, 65), 'rainfall_prob': 0.05},
                'summer': {'temp_range': (28, 44), 'humidity_range': (35, 60), 'rainfall_prob': 0.1},
                'monsoon': {'temp_range': (26, 35), 'humidity_range': (70, 90), 'rainfall_prob': 0.7},
                'post_monsoon': {'temp_range': (22, 38), 'humidity_range': (50, 75), 'rainfall_prob': 0.3}
            }
        }
    
    async def get_weather_data(self, city: str, state: str) -> Dict[str, Any]:
        """
        Get weather data - tries real API first, falls back to realistic data
        """
        
        # Try real API first
        if self.api_key and self.api_key != "your_weather_api_key_here":
            real_data = await self._get_real_weather_data(city, state)
            if real_data:
                logger.info(f"✅ Real weather data retrieved for {city}, {state}")
                return real_data
        
        # Fallback to realistic weather data
        logger.info(f"🔄 Using realistic weather data for {city}, {state}")
        return self._generate_realistic_weather_data(city, state)
    
    async def get_15_day_forecast(self, city: str, state: str) -> Dict[str, Any]:
        """
        Get comprehensive 15-day weather forecast with real data
        """
        try:
            from services.real_data_collector import real_data_collector
            
            # Get comprehensive weather data including 15-day forecast
            weather_data = await real_data_collector.get_real_weather_data(city, state, days=15)
            
            if weather_data and weather_data.get('forecast_15_days'):
                logger.info(f"✅ 15-day forecast retrieved for {city}, {state}")
                
                # Process forecast for agricultural insights
                forecast_with_insights = []
                for day in weather_data['forecast_15_days']:
                    day_insights = self._analyze_day_for_agriculture(day)
                    day.update(day_insights)
                    forecast_with_insights.append(day)
                
                return {
                    "location": {"city": city, "state": state},
                    "current_weather": weather_data.get('current', {}),
                    "forecast_15_days": forecast_with_insights,
                    "agricultural_summary": self._generate_agricultural_summary(forecast_with_insights),
                    "data_source": weather_data.get('data_source', 'Real Weather API'),
                    "timestamp": datetime.now().isoformat(),
                    "confidence": "high" if "Real" in weather_data.get('data_source', '') else "medium"
                }
            else:
                # Fallback to extended realistic forecast
                return await self._generate_15_day_fallback_forecast(city, state)
                
        except Exception as e:
            logger.error(f"Error getting 15-day forecast: {e}")
            return await self._generate_15_day_fallback_forecast(city, state)
    
    async def _get_real_weather_data(self, city: str, state: str) -> Optional[Dict[str, Any]]:
        """
        Get real weather data from OpenWeatherMap API
        """
        try:
            url = f"{self.base_url}/weather"
            params = {
                'q': f"{city},IN",
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                return {
                    'temperature': data['main']['temp'],
                    'humidity': data['main']['humidity'],
                    'rainfall': data.get('rain', {}).get('1h', 0),
                    'wind_speed': data['wind'].get('speed', 0) * 3.6,  # Convert to km/h
                    'description': data['weather'][0]['description'],
                    'pressure': data['main']['pressure'],
                    'visibility': data.get('visibility', 10000) / 1000,  # Convert to km
                    'source': 'OpenWeatherMap API',
                    'timestamp': datetime.now().isoformat(),
                    'city': city,
                    'state': state
                }
            else:
                logger.warning(f"Weather API error {response.status_code}: {response.text[:100]}")
                return None
                
        except requests.exceptions.Timeout:
            logger.warning(f"Weather API timeout for {city}")
            return None
        except Exception as e:
            logger.error(f"Weather API error for {city}: {str(e)}")
            return None
    
    def _generate_realistic_weather_data(self, city: str, state: str) -> Dict[str, Any]:
        """
        Generate realistic weather data based on seasonal patterns
        """
        
        # Determine current season
        month = datetime.now().month
        if month in [12, 1, 2]:
            season = 'winter'
        elif month in [3, 4, 5]:
            season = 'summer'
        elif month in [6, 7, 8, 9]:
            season = 'monsoon'
        else:
            season = 'post_monsoon'
        
        # Get regional pattern
        state_lower = state.lower().replace(' ', '_')
        if state_lower not in self.regional_patterns:
            state_lower = 'punjab'  # Default to Punjab patterns
        
        pattern = self.regional_patterns[state_lower][season]
        
        # Generate realistic values
        temperature = random.uniform(*pattern['temp_range'])
        humidity = random.uniform(*pattern['humidity_range'])
        
        # Generate rainfall based on probability
        rainfall = 0
        if random.random() < pattern['rainfall_prob']:
            if season == 'monsoon':
                rainfall = random.uniform(5, 50)  # Heavy monsoon rain
            else:
                rainfall = random.uniform(0.5, 15)  # Light to moderate rain
        
        # Generate other parameters
        wind_speed = random.uniform(5, 25)
        pressure = random.uniform(1000, 1020)
        visibility = random.uniform(8, 15)
        
        # Generate weather description
        descriptions = self._get_weather_descriptions(season, rainfall > 0, temperature)
        description = random.choice(descriptions)
        
        return {
            'temperature': round(temperature, 1),
            'humidity': round(humidity, 0),
            'rainfall': round(rainfall, 1),
            'wind_speed': round(wind_speed, 1),
            'description': description,
            'pressure': round(pressure, 1),
            'visibility': round(visibility, 1),
            'source': 'Realistic Weather Model',
            'timestamp': datetime.now().isoformat(),
            'city': city,
            'state': state
        }
    
    def _get_weather_descriptions(self, season: str, has_rain: bool, temperature: float) -> List[str]:
        """
        Get appropriate weather descriptions based on conditions
        """
        
        if has_rain:
            if season == 'monsoon':
                return ['heavy rain', 'moderate rain', 'thunderstorm', 'overcast with rain']
            else:
                return ['light rain', 'drizzle', 'scattered showers', 'cloudy with rain']
        
        if temperature > 40:
            return ['very hot', 'scorching heat', 'heat wave', 'extremely hot']
        elif temperature > 35:
            return ['hot', 'very warm', 'sunny and hot', 'clear and hot']
        elif temperature > 25:
            return ['warm', 'pleasant', 'partly cloudy', 'clear sky']
        elif temperature > 15:
            return ['mild', 'cool', 'partly cloudy', 'comfortable']
        elif temperature > 5:
            return ['cold', 'chilly', 'cool and cloudy', 'winter weather']
        else:
            return ['very cold', 'freezing', 'frost possible', 'severe cold']
    
    async def get_forecast_data(self, city: str, state: str, days: int = 5) -> List[Dict[str, Any]]:
        """
        Get weather forecast data
        """
        
        # Try real API first
        if self.api_key and self.api_key != "your_weather_api_key_here":
            real_forecast = await self._get_real_forecast_data(city, state, days)
            if real_forecast:
                return real_forecast
        
        # Generate realistic forecast
        return self._generate_realistic_forecast(city, state, days)
    
    async def _get_real_forecast_data(self, city: str, state: str, days: int) -> Optional[List[Dict[str, Any]]]:
        """
        Get real forecast data from API
        """
        try:
            url = f"{self.base_url}/forecast"
            params = {
                'q': f"{city},IN",
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                forecasts = []
                
                for item in data['list'][:days * 8]:  # 8 forecasts per day (3-hour intervals)
                    forecasts.append({
                        'date': datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d'),
                        'time': datetime.fromtimestamp(item['dt']).strftime('%H:%M'),
                        'temperature': item['main']['temp'],
                        'humidity': item['main']['humidity'],
                        'rainfall': item.get('rain', {}).get('3h', 0),
                        'description': item['weather'][0]['description'],
                        'source': 'OpenWeatherMap API'
                    })
                
                return forecasts
            else:
                return None
                
        except Exception as e:
            logger.error(f"Forecast API error: {str(e)}")
            return None
    
    def _generate_realistic_forecast(self, city: str, state: str, days: int) -> List[Dict[str, Any]]:
        """
        Generate realistic weather forecast
        """
        
        forecasts = []
        base_date = datetime.now()
        
        # Get current weather as baseline
        current_weather = self._generate_realistic_weather_data(city, state)
        base_temp = current_weather['temperature']
        base_humidity = current_weather['humidity']
        
        for day in range(days):
            forecast_date = base_date + timedelta(days=day)
            
            # Add some variation to temperature and humidity
            temp_variation = random.uniform(-5, 5)
            humidity_variation = random.uniform(-10, 10)
            
            temperature = max(0, base_temp + temp_variation)
            humidity = max(10, min(100, base_humidity + humidity_variation))
            
            # Generate rainfall probability
            rainfall = 0
            if random.random() < 0.3:  # 30% chance of rain
                rainfall = random.uniform(0.5, 20)
            
            descriptions = self._get_weather_descriptions('current', rainfall > 0, temperature)
            
            forecasts.append({
                'date': forecast_date.strftime('%Y-%m-%d'),
                'time': '12:00',  # Noon forecast
                'temperature': round(temperature, 1),
                'humidity': round(humidity, 0),
                'rainfall': round(rainfall, 1),
                'description': random.choice(descriptions),
                'source': 'Realistic Weather Model'
            })
        
        return forecasts
    
    def check_weather_alerts(self, weather_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Check weather data against agricultural alert thresholds
        """
        
        alerts = []
        
        # Temperature alerts
        temp = weather_data['temperature']
        if temp >= 40:
            alerts.append({
                'type': 'high_temperature',
                'severity': 'high',
                'message': f"Heat wave alert: {temp}°C. Ensure adequate irrigation and protect livestock."
            })
        elif temp <= 5:
            alerts.append({
                'type': 'low_temperature',
                'severity': 'high',
                'message': f"Frost warning: {temp}°C. Protect sensitive crops from cold damage."
            })
        
        # Rainfall alerts
        rainfall = weather_data['rainfall']
        if rainfall >= 50:
            alerts.append({
                'type': 'heavy_rain',
                'severity': 'high',
                'message': f"Heavy rainfall alert: {rainfall}mm. Prepare drainage and protect crops."
            })
        elif rainfall >= 20:
            alerts.append({
                'type': 'moderate_rain',
                'severity': 'medium',
                'message': f"Moderate rainfall expected: {rainfall}mm. Monitor field conditions."
            })
        
        # Humidity alerts
        humidity = weather_data['humidity']
        if humidity >= 90:
            alerts.append({
                'type': 'high_humidity',
                'severity': 'medium',
                'message': f"High humidity: {humidity}%. Monitor crops for fungal diseases."
            })
        
        # Wind alerts
        wind_speed = weather_data['wind_speed']
        if wind_speed >= 25:
            alerts.append({
                'type': 'strong_wind',
                'severity': 'medium',
                'message': f"Strong winds: {wind_speed} km/h. Secure loose structures and protect crops."
            })
        
        return alerts

    def _analyze_day_for_agriculture(self, day_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze daily weather data for agricultural insights"""
        
        temp_avg = day_data.get('temperature_avg', 25)
        rainfall = day_data.get('rainfall_total', 0)
        humidity = day_data.get('humidity_avg', 60)
        
        insights = {
            "agricultural_conditions": "good",
            "irrigation_needed": False,
            "pest_risk": "low",
            "disease_risk": "low",
            "farming_activities": []
        }
        
        # Temperature analysis
        if temp_avg > 35:
            insights["agricultural_conditions"] = "challenging"
            insights["irrigation_needed"] = True
            insights["farming_activities"].append("Increase irrigation frequency")
            insights["farming_activities"].append("Provide shade for livestock")
        elif temp_avg < 10:
            insights["agricultural_conditions"] = "challenging"
            insights["farming_activities"].append("Protect crops from frost")
            insights["farming_activities"].append("Cover sensitive plants")
        
        # Rainfall analysis
        if rainfall > 50:
            insights["agricultural_conditions"] = "challenging"
            insights["farming_activities"].append("Ensure proper drainage")
            insights["farming_activities"].append("Avoid field operations")
            insights["disease_risk"] = "high"
        elif rainfall > 20:
            insights["irrigation_needed"] = False
            insights["farming_activities"].append("Good day for planting")
        elif rainfall == 0 and temp_avg > 30:
            insights["irrigation_needed"] = True
        
        # Humidity analysis
        if humidity > 85:
            insights["disease_risk"] = "high"
            insights["pest_risk"] = "medium"
            insights["farming_activities"].append("Monitor for fungal diseases")
        elif humidity < 30:
            insights["irrigation_needed"] = True
            insights["farming_activities"].append("Increase soil moisture")
        
        # Combined conditions
        if temp_avg > 30 and humidity > 80:
            insights["pest_risk"] = "high"
            insights["farming_activities"].append("Monitor for pest outbreaks")
        
        return insights
    
    def _generate_agricultural_summary(self, forecast_data: List[Dict]) -> Dict[str, Any]:
        """Generate agricultural summary for 15-day forecast"""
        
        total_rainfall = sum([day.get('rainfall_total', 0) for day in forecast_data])
        avg_temp = sum([day.get('temperature_avg', 25) for day in forecast_data]) / len(forecast_data)
        avg_humidity = sum([day.get('humidity_avg', 60) for day in forecast_data]) / len(forecast_data)
        
        irrigation_days = len([day for day in forecast_data if day.get('irrigation_needed', False)])
        high_risk_days = len([day for day in forecast_data if day.get('pest_risk') == 'high' or day.get('disease_risk') == 'high'])
        
        # Determine overall conditions
        if total_rainfall > 200:
            overall_condition = "wet_season"
            recommendation = "Focus on drainage and disease prevention"
        elif total_rainfall < 50:
            overall_condition = "dry_season"
            recommendation = "Plan for intensive irrigation"
        else:
            overall_condition = "balanced"
            recommendation = "Good conditions for most farming activities"
        
        return {
            "overall_condition": overall_condition,
            "total_rainfall_mm": round(total_rainfall, 1),
            "average_temperature": round(avg_temp, 1),
            "average_humidity": round(avg_humidity, 1),
            "irrigation_required_days": irrigation_days,
            "high_risk_days": high_risk_days,
            "primary_recommendation": recommendation,
            "best_farming_days": [
                day['date'] for day in forecast_data 
                if day.get('agricultural_conditions') == 'good' and not day.get('irrigation_needed', False)
            ][:5]  # Top 5 best days
        }
    
    async def _generate_15_day_fallback_forecast(self, city: str, state: str) -> Dict[str, Any]:
        """Generate 15-day fallback forecast when real data is unavailable"""
        
        logger.warning(f"Using fallback 15-day forecast for {city}, {state}")
        
        # Get current weather as baseline
        current_weather = self._generate_realistic_weather_data(city, state)
        base_temp = current_weather['temperature']
        base_humidity = current_weather['humidity']
        
        forecast_data = []
        
        for i in range(15):
            date = datetime.now() + timedelta(days=i+1)
            
            # Add realistic variations
            temp_variation = random.uniform(-5, 5)
            humidity_variation = random.uniform(-15, 15)
            
            temp_avg = base_temp + temp_variation
            humidity_avg = max(20, min(100, base_humidity + humidity_variation))
            
            # Generate rainfall (seasonal patterns)
            month = date.month
            rainfall_prob = self._get_seasonal_rainfall_probability(month)
            rainfall = random.uniform(5, 40) if random.random() < rainfall_prob else 0
            
            day_data = {
                'date': date.strftime('%Y-%m-%d'),
                'temperature_min': temp_avg - 5,
                'temperature_max': temp_avg + 5,
                'temperature_avg': temp_avg,
                'humidity_avg': humidity_avg,
                'pressure_avg': 1013.25,
                'wind_speed_avg': random.uniform(5, 20),
                'rainfall_total': rainfall,
                'description': self._get_weather_description(temp_avg, rainfall),
                'fallback': True
            }
            
            # Add agricultural insights
            insights = self._analyze_day_for_agriculture(day_data)
            day_data.update(insights)
            
            forecast_data.append(day_data)
        
        return {
            "location": {"city": city, "state": state},
            "current_weather": current_weather,
            "forecast_15_days": forecast_data,
            "agricultural_summary": self._generate_agricultural_summary(forecast_data),
            "data_source": "Fallback Weather Model",
            "timestamp": datetime.now().isoformat(),
            "confidence": "medium"
        }
    
    def _get_seasonal_rainfall_probability(self, month: int) -> float:
        """Get seasonal rainfall probability for Indian climate"""
        
        # Indian monsoon and seasonal patterns
        rainfall_patterns = {
            1: 0.1,   # January - Winter
            2: 0.15,  # February - Winter
            3: 0.2,   # March - Pre-monsoon
            4: 0.25,  # April - Pre-monsoon
            5: 0.3,   # May - Pre-monsoon
            6: 0.7,   # June - Monsoon
            7: 0.8,   # July - Monsoon
            8: 0.75,  # August - Monsoon
            9: 0.6,   # September - Post-monsoon
            10: 0.4,  # October - Post-monsoon
            11: 0.2,  # November - Winter
            12: 0.1   # December - Winter
        }
        
        return rainfall_patterns.get(month, 0.3)
    
    def _get_weather_description(self, temperature: float, rainfall: float) -> str:
        """Get weather description based on conditions"""
        
        if rainfall > 20:
            return "rainy"
        elif rainfall > 5:
            return "light rain"
        elif temperature > 35:
            return "hot and sunny"
        elif temperature > 25:
            return "warm and clear"
        elif temperature > 15:
            return "mild and pleasant"
        else:
            return "cool and clear"

# Global instance
weather_service = WeatherService()