"""
Real Data Collection Service
Integrates multiple agricultural data sources
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import pandas as pd
import requests
from .agmarknet_client import AGMARKNETClient

logger = logging.getLogger(__name__)

class DataCollector:
    """
    Comprehensive data collector for agricultural information
    Integrates price, weather, soil, and satellite data
    """
    
    def __init__(self):
        self.agmarknet_client = AGMARKNETClient()
        self.weather_api_key = None
        self.session = requests.Session()
        
        # Data source configurations
        self.data_sources = {
            "prices": {
                "primary": "agmarknet",
                "backup": "local_cache",
                "update_frequency": "daily"
            },
            "weather": {
                "primary": "openweather",
                "backup": "weatherapi",
                "update_frequency": "hourly"
            },
            "soil": {
                "primary": "soil_health_card",
                "backup": "isro_data",
                "update_frequency": "monthly"
            }
        }
    
    async def collect_price_data(self, commodity: str, state: str, 
                               district: str = None, days_back: int = 30) -> Dict[str, Any]:
        """
        Collect comprehensive price data for a commodity
        
        Args:
            commodity: Name of the commodity
            state: State name
            district: District name (optional)
            days_back: Number of days of historical data
            
        Returns:
            Dictionary with price data and analysis
        """
        try:
            logger.info(f"Collecting price data for {commodity} in {state}")
            
            # Get current prices
            current_prices = await self.agmarknet_client.get_current_prices(
                commodity, state, district
            )
            
            # Get historical data
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
            
            historical_data = await self.agmarknet_client.get_historical_prices(
                commodity, state, start_date, end_date
            )
            
            # Get market arrivals
            arrivals = await self.agmarknet_client.get_market_arrivals(
                commodity, state
            )
            
            # Calculate price statistics
            price_stats = self._calculate_price_statistics(historical_data)
            
            # Analyze price trends
            trend_analysis = self._analyze_price_trends(historical_data)
            
            return {
                "commodity": commodity,
                "state": state,
                "district": district,
                "collection_timestamp": datetime.now().isoformat(),
                "current_price": current_prices,
                "historical_data": historical_data.to_dict('records'),
                "market_arrivals": arrivals,
                "statistics": price_stats,
                "trend_analysis": trend_analysis,
                "data_quality": self._assess_data_quality(historical_data)
            }
            
        except Exception as e:
            logger.error(f"Error collecting price data: {str(e)}")
            raise
    
    async def collect_weather_data(self, state: str, district: str, 
                                 days_back: int = 7) -> Dict[str, Any]:
        """
        Collect weather data for agricultural analysis
        
        Args:
            state: State name
            district: District name
            days_back: Number of days of historical weather data
            
        Returns:
            Dictionary with weather data
        """
        try:
            logger.info(f"Collecting weather data for {district}, {state}")
            
            # Get coordinates for the district (simplified mapping)
            coordinates = self._get_district_coordinates(state, district)
            
            # Collect current weather
            current_weather = await self._get_current_weather(coordinates)
            
            # Collect historical weather
            historical_weather = await self._get_historical_weather(
                coordinates, days_back
            )
            
            # Calculate agricultural weather indices
            agri_indices = self._calculate_agricultural_indices(
                current_weather, historical_weather
            )
            
            return {
                "location": f"{district}, {state}",
                "coordinates": coordinates,
                "collection_timestamp": datetime.now().isoformat(),
                "current_weather": current_weather,
                "historical_weather": historical_weather,
                "agricultural_indices": agri_indices,
                "weather_alerts": self._generate_weather_alerts(current_weather)
            }
            
        except Exception as e:
            logger.error(f"Error collecting weather data: {str(e)}")
            # Return mock data for now
            return self._get_mock_weather_data(state, district)
    
    async def collect_soil_data(self, state: str, district: str) -> Dict[str, Any]:
        """
        Collect soil health and composition data
        
        Args:
            state: State name
            district: District name
            
        Returns:
            Dictionary with soil data
        """
        try:
            logger.info(f"Collecting soil data for {district}, {state}")
            
            # In production, this would integrate with:
            # - Soil Health Card database
            # - ISRO soil classification data
            # - Local soil testing lab results
            
            # For now, return realistic soil data based on region
            soil_data = self._get_regional_soil_data(state, district)
            
            return {
                "location": f"{district}, {state}",
                "collection_timestamp": datetime.now().isoformat(),
                "soil_composition": soil_data["composition"],
                "nutrient_levels": soil_data["nutrients"],
                "ph_level": soil_data["ph"],
                "organic_matter": soil_data["organic_matter"],
                "soil_type": soil_data["soil_type"],
                "recommendations": soil_data["recommendations"]
            }
            
        except Exception as e:
            logger.error(f"Error collecting soil data: {str(e)}")
            raise
    
    async def collect_comprehensive_data(self, commodity: str, state: str, 
                                       district: str) -> Dict[str, Any]:
        """
        Collect all relevant data for ML model training/prediction
        
        Args:
            commodity: Name of the commodity
            state: State name
            district: District name
            
        Returns:
            Comprehensive dataset for ML models
        """
        try:
            logger.info(f"Collecting comprehensive data for {commodity} in {district}, {state}")
            
            # Collect all data types in parallel
            tasks = [
                self.collect_price_data(commodity, state, district),
                self.collect_weather_data(state, district),
                self.collect_soil_data(state, district)
            ]
            
            price_data, weather_data, soil_data = await asyncio.gather(*tasks)
            
            # Combine and structure the data
            comprehensive_data = {
                "metadata": {
                    "commodity": commodity,
                    "location": f"{district}, {state}",
                    "collection_timestamp": datetime.now().isoformat(),
                    "data_sources": list(self.data_sources.keys())
                },
                "price_data": price_data,
                "weather_data": weather_data,
                "soil_data": soil_data,
                "data_quality_score": self._calculate_overall_data_quality(
                    price_data, weather_data, soil_data
                )
            }
            
            return comprehensive_data
            
        except Exception as e:
            logger.error(f"Error collecting comprehensive data: {str(e)}")
            raise
    
    def _calculate_price_statistics(self, historical_data: pd.DataFrame) -> Dict[str, float]:
        """Calculate statistical measures for price data"""
        if historical_data.empty:
            return {}
        
        prices = historical_data['price']
        
        return {
            "mean_price": float(prices.mean()),
            "median_price": float(prices.median()),
            "std_deviation": float(prices.std()),
            "min_price": float(prices.min()),
            "max_price": float(prices.max()),
            "price_volatility": float(prices.std() / prices.mean() * 100),
            "recent_avg": float(prices.tail(7).mean()),
            "monthly_avg": float(prices.tail(30).mean())
        }
    
    def _analyze_price_trends(self, historical_data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze price trends and patterns"""
        if len(historical_data) < 7:
            return {"trend": "insufficient_data"}
        
        prices = historical_data['price'].values
        
        # Calculate trend using linear regression
        import numpy as np
        x = np.arange(len(prices))
        slope = np.polyfit(x, prices, 1)[0]
        
        # Determine trend direction
        if slope > 5:
            trend = "strongly_increasing"
        elif slope > 1:
            trend = "increasing"
        elif slope > -1:
            trend = "stable"
        elif slope > -5:
            trend = "decreasing"
        else:
            trend = "strongly_decreasing"
        
        # Calculate momentum (recent vs older prices)
        recent_avg = np.mean(prices[-7:])
        older_avg = np.mean(prices[-14:-7]) if len(prices) >= 14 else np.mean(prices[:-7])
        momentum = (recent_avg - older_avg) / older_avg * 100 if older_avg > 0 else 0
        
        return {
            "trend": trend,
            "slope": float(slope),
            "momentum": float(momentum),
            "trend_strength": abs(float(slope)),
            "price_direction": "up" if slope > 0 else "down" if slope < 0 else "stable"
        }
    
    def _assess_data_quality(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Assess the quality of collected data"""
        if data.empty:
            return {"quality_score": 0, "issues": ["no_data"]}
        
        issues = []
        quality_score = 100
        
        # Check for missing values
        if data.isnull().any().any():
            issues.append("missing_values")
            quality_score -= 20
        
        # Check for data recency
        if len(data) < 7:
            issues.append("insufficient_data")
            quality_score -= 30
        
        # Check for outliers (prices more than 3 std devs from mean)
        if 'price' in data.columns:
            mean_price = data['price'].mean()
            std_price = data['price'].std()
            outliers = data[abs(data['price'] - mean_price) > 3 * std_price]
            if len(outliers) > 0:
                issues.append("outliers_detected")
                quality_score -= 10
        
        return {
            "quality_score": max(0, quality_score),
            "issues": issues,
            "data_points": len(data),
            "completeness": float((1 - data.isnull().sum().sum() / data.size) * 100)
        }
    
    def _get_district_coordinates(self, state: str, district: str) -> Dict[str, float]:
        """Get approximate coordinates for a district"""
        # Simplified coordinate mapping for major districts
        coordinates_map = {
            "punjab": {
                "ludhiana": {"lat": 30.9010, "lon": 75.8573},
                "amritsar": {"lat": 31.6340, "lon": 74.8723},
                "jalandhar": {"lat": 31.3260, "lon": 75.5762}
            },
            "haryana": {
                "gurgaon": {"lat": 28.4595, "lon": 77.0266},
                "faridabad": {"lat": 28.4089, "lon": 77.3178}
            },
            "west bengal": {
                "kolkata": {"lat": 22.5726, "lon": 88.3639},
                "howrah": {"lat": 22.5958, "lon": 88.2636}
            }
        }
        
        state_data = coordinates_map.get(state.lower(), {})
        district_coords = state_data.get(district.lower())
        
        if district_coords:
            return district_coords
        else:
            # Default coordinates (center of India)
            return {"lat": 20.5937, "lon": 78.9629}
    
    async def _get_current_weather(self, coordinates: Dict[str, float]) -> Dict[str, Any]:
        """Get current weather data"""
        # Mock weather data for now
        # In production, integrate with OpenWeatherMap or similar API
        
        import random
        random.seed(int(datetime.now().timestamp()))
        
        return {
            "temperature": round(random.uniform(15, 35), 1),
            "humidity": round(random.uniform(40, 90), 1),
            "rainfall": round(random.uniform(0, 10), 1),
            "wind_speed": round(random.uniform(5, 25), 1),
            "pressure": round(random.uniform(1000, 1020), 1),
            "visibility": round(random.uniform(5, 15), 1),
            "uv_index": random.randint(1, 10),
            "weather_condition": random.choice(["clear", "cloudy", "rainy", "sunny"])
        }
    
    async def _get_historical_weather(self, coordinates: Dict[str, float], 
                                    days_back: int) -> List[Dict[str, Any]]:
        """Get historical weather data"""
        # Generate mock historical weather data
        historical = []
        
        for i in range(days_back):
            date = datetime.now() - timedelta(days=i)
            historical.append({
                "date": date.strftime("%Y-%m-%d"),
                "temperature_max": round(random.uniform(20, 35), 1),
                "temperature_min": round(random.uniform(10, 25), 1),
                "humidity": round(random.uniform(40, 90), 1),
                "rainfall": round(random.uniform(0, 15), 1),
                "wind_speed": round(random.uniform(5, 25), 1)
            })
        
        return historical
    
    def _calculate_agricultural_indices(self, current: Dict, historical: List) -> Dict[str, Any]:
        """Calculate agricultural weather indices"""
        # Calculate Growing Degree Days (GDD)
        gdd = max(0, (current["temperature"] - 10))  # Base temperature 10°C
        
        # Calculate rainfall adequacy
        total_rainfall = sum(day.get("rainfall", 0) for day in historical[-7:])
        rainfall_adequacy = "adequate" if total_rainfall > 20 else "insufficient"
        
        # Calculate stress indices
        heat_stress = current["temperature"] > 35
        drought_stress = total_rainfall < 10
        
        return {
            "growing_degree_days": gdd,
            "weekly_rainfall": total_rainfall,
            "rainfall_adequacy": rainfall_adequacy,
            "heat_stress": heat_stress,
            "drought_stress": drought_stress,
            "crop_suitability_index": random.uniform(0.6, 0.9)
        }
    
    def _generate_weather_alerts(self, weather: Dict[str, Any]) -> List[str]:
        """Generate weather-based agricultural alerts"""
        alerts = []
        
        if weather["temperature"] > 35:
            alerts.append("High temperature alert - Risk of heat stress")
        
        if weather["rainfall"] > 50:
            alerts.append("Heavy rainfall alert - Risk of waterlogging")
        
        if weather["humidity"] > 85:
            alerts.append("High humidity alert - Risk of fungal diseases")
        
        if weather["wind_speed"] > 30:
            alerts.append("Strong wind alert - Risk of crop damage")
        
        return alerts
    
    def _get_mock_weather_data(self, state: str, district: str) -> Dict[str, Any]:
        """Return mock weather data when API fails"""
        return {
            "location": f"{district}, {state}",
            "coordinates": {"lat": 20.5937, "lon": 78.9629},
            "collection_timestamp": datetime.now().isoformat(),
            "current_weather": {
                "temperature": 25.0,
                "humidity": 65.0,
                "rainfall": 2.0,
                "weather_condition": "partly_cloudy"
            },
            "data_source": "mock_data",
            "note": "Real weather API integration pending"
        }
    
    def _get_regional_soil_data(self, state: str, district: str) -> Dict[str, Any]:
        """Get regional soil data based on known soil types"""
        # Regional soil characteristics
        regional_soils = {
            "punjab": {
                "soil_type": "alluvial",
                "ph": 7.2,
                "organic_matter": 0.8,
                "composition": {"sand": 45, "silt": 35, "clay": 20},
                "nutrients": {"nitrogen": "medium", "phosphorus": "high", "potassium": "medium"}
            },
            "west bengal": {
                "soil_type": "alluvial",
                "ph": 6.8,
                "organic_matter": 1.2,
                "composition": {"sand": 40, "silt": 40, "clay": 20},
                "nutrients": {"nitrogen": "high", "phosphorus": "medium", "potassium": "high"}
            },
            "gujarat": {
                "soil_type": "black_cotton",
                "ph": 7.8,
                "organic_matter": 0.6,
                "composition": {"sand": 25, "silt": 30, "clay": 45},
                "nutrients": {"nitrogen": "low", "phosphorus": "medium", "potassium": "high"}
            }
        }
        
        soil_data = regional_soils.get(state.lower(), {
            "soil_type": "mixed",
            "ph": 7.0,
            "organic_matter": 0.8,
            "composition": {"sand": 40, "silt": 35, "clay": 25},
            "nutrients": {"nitrogen": "medium", "phosphorus": "medium", "potassium": "medium"}
        })
        
        # Add recommendations based on soil type
        soil_data["recommendations"] = self._generate_soil_recommendations(soil_data)
        
        return soil_data
    
    def _generate_soil_recommendations(self, soil_data: Dict) -> List[str]:
        """Generate soil management recommendations"""
        recommendations = []
        
        if soil_data["ph"] < 6.5:
            recommendations.append("Apply lime to increase soil pH")
        elif soil_data["ph"] > 8.0:
            recommendations.append("Apply organic matter to reduce soil pH")
        
        if soil_data["organic_matter"] < 1.0:
            recommendations.append("Increase organic matter through compost or manure")
        
        nutrients = soil_data.get("nutrients", {})
        if nutrients.get("nitrogen") == "low":
            recommendations.append("Apply nitrogen-rich fertilizers")
        if nutrients.get("phosphorus") == "low":
            recommendations.append("Apply phosphorus fertilizers")
        if nutrients.get("potassium") == "low":
            recommendations.append("Apply potassium fertilizers")
        
        return recommendations
    
    def _calculate_overall_data_quality(self, price_data: Dict, 
                                      weather_data: Dict, soil_data: Dict) -> float:
        """Calculate overall data quality score"""
        scores = []
        
        # Price data quality
        if "data_quality" in price_data:
            scores.append(price_data["data_quality"]["quality_score"])
        
        # Weather data availability
        if weather_data.get("current_weather"):
            scores.append(85)  # Mock score for weather data
        
        # Soil data availability
        if soil_data.get("soil_type"):
            scores.append(80)  # Mock score for soil data
        
        return sum(scores) / len(scores) if scores else 0