"""
Real Database Manager
Handles data storage and retrieval for ML models
"""

import sqlite3
import pandas as pd
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
import os

logger = logging.getLogger(__name__)

class DatabaseManager:
    """
    Database manager for agricultural data storage
    Uses SQLite for development, can be extended to PostgreSQL for production
    """
    
    def __init__(self, db_path: str = "data/agrifriend.db"):
        self.db_path = db_path
        self.ensure_database_exists()
        self.create_tables()
    
    def ensure_database_exists(self):
        """Ensure the database directory and file exist"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def create_tables(self):
        """Create necessary tables for agricultural data"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Price data table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS price_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    commodity TEXT NOT NULL,
                    state TEXT NOT NULL,
                    district TEXT,
                    price REAL NOT NULL,
                    unit TEXT DEFAULT 'INR per quintal',
                    date DATE NOT NULL,
                    source TEXT DEFAULT 'AGMARKNET',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(commodity, state, district, date)
                )
            ''')
            
            # Weather data table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS weather_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    state TEXT NOT NULL,
                    district TEXT NOT NULL,
                    date DATE NOT NULL,
                    temperature_max REAL,
                    temperature_min REAL,
                    humidity REAL,
                    rainfall REAL,
                    wind_speed REAL,
                    pressure REAL,
                    weather_condition TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(state, district, date)
                )
            ''')
            
            # Soil data table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS soil_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    state TEXT NOT NULL,
                    district TEXT NOT NULL,
                    soil_type TEXT,
                    ph_level REAL,
                    organic_matter REAL,
                    sand_percentage REAL,
                    silt_percentage REAL,
                    clay_percentage REAL,
                    nitrogen_level TEXT,
                    phosphorus_level TEXT,
                    potassium_level TEXT,
                    last_updated DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(state, district)
                )
            ''')
            
            # Market arrivals table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS market_arrivals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    commodity TEXT NOT NULL,
                    state TEXT NOT NULL,
                    district TEXT,
                    arrival_quantity REAL,
                    unit TEXT DEFAULT 'tonnes',
                    number_of_markets INTEGER,
                    average_price REAL,
                    date DATE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(commodity, state, district, date)
                )
            ''')
            
            # Model predictions table (for tracking accuracy)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS model_predictions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    model_type TEXT NOT NULL,
                    commodity TEXT,
                    state TEXT,
                    district TEXT,
                    prediction_data TEXT,  -- JSON string
                    actual_value REAL,
                    prediction_date DATE,
                    target_date DATE,
                    accuracy_score REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Data quality logs
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS data_quality_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data_type TEXT NOT NULL,
                    quality_score REAL,
                    issues TEXT,  -- JSON string
                    data_points INTEGER,
                    completeness REAL,
                    date DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            logger.info("Database tables created successfully")
    
    def store_price_data(self, price_data: Dict[str, Any]) -> bool:
        """Store price data in the database"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Store current price
                current = price_data.get("current_price", {})
                if current:
                    cursor.execute('''
                        INSERT OR REPLACE INTO price_data 
                        (commodity, state, district, price, unit, date, source)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        current.get("commodity"),
                        current.get("state"),
                        current.get("district"),
                        current.get("current_price"),
                        current.get("unit", "INR per quintal"),
                        current.get("market_date", datetime.now().strftime("%Y-%m-%d")),
                        current.get("source", "AGMARKNET")
                    ))
                
                # Store historical data
                historical = price_data.get("historical_data", [])
                for record in historical:
                    cursor.execute('''
                        INSERT OR REPLACE INTO price_data 
                        (commodity, state, district, price, unit, date)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        record.get("commodity"),
                        record.get("state"),
                        price_data.get("district"),
                        record.get("price"),
                        record.get("unit", "INR per quintal"),
                        record.get("date")
                    ))
                
                # Store market arrivals
                arrivals = price_data.get("market_arrivals", {})
                if arrivals:
                    cursor.execute('''
                        INSERT OR REPLACE INTO market_arrivals 
                        (commodity, state, district, arrival_quantity, unit, 
                         number_of_markets, average_price, date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        arrivals.get("commodity"),
                        arrivals.get("state"),
                        price_data.get("district"),
                        arrivals.get("arrival_quantity"),
                        arrivals.get("unit", "tonnes"),
                        arrivals.get("number_of_markets"),
                        arrivals.get("average_price"),
                        arrivals.get("date")
                    ))
                
                conn.commit()
                logger.info(f"Stored price data for {price_data.get('commodity')} in {price_data.get('state')}")
                return True
                
        except Exception as e:
            logger.error(f"Error storing price data: {str(e)}")
            return False
    
    def store_weather_data(self, weather_data: Dict[str, Any]) -> bool:
        """Store weather data in the database"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Extract location info
                location_parts = weather_data.get("location", "").split(", ")
                district = location_parts[0] if len(location_parts) > 0 else ""
                state = location_parts[1] if len(location_parts) > 1 else ""
                
                # Store current weather
                current = weather_data.get("current_weather", {})
                if current:
                    cursor.execute('''
                        INSERT OR REPLACE INTO weather_data 
                        (state, district, date, temperature_max, temperature_min, 
                         humidity, rainfall, wind_speed, pressure, weather_condition)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        state,
                        district,
                        datetime.now().strftime("%Y-%m-%d"),
                        current.get("temperature"),
                        current.get("temperature"),  # Using same for min/max
                        current.get("humidity"),
                        current.get("rainfall"),
                        current.get("wind_speed"),
                        current.get("pressure"),
                        current.get("weather_condition")
                    ))
                
                # Store historical weather
                historical = weather_data.get("historical_weather", [])
                for record in historical:
                    cursor.execute('''
                        INSERT OR REPLACE INTO weather_data 
                        (state, district, date, temperature_max, temperature_min, 
                         humidity, rainfall, wind_speed)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        state,
                        district,
                        record.get("date"),
                        record.get("temperature_max"),
                        record.get("temperature_min"),
                        record.get("humidity"),
                        record.get("rainfall"),
                        record.get("wind_speed")
                    ))
                
                conn.commit()
                logger.info(f"Stored weather data for {district}, {state}")
                return True
                
        except Exception as e:
            logger.error(f"Error storing weather data: {str(e)}")
            return False
    
    def store_soil_data(self, soil_data: Dict[str, Any]) -> bool:
        """Store soil data in the database"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Extract location info
                location_parts = soil_data.get("location", "").split(", ")
                district = location_parts[0] if len(location_parts) > 0 else ""
                state = location_parts[1] if len(location_parts) > 1 else ""
                
                composition = soil_data.get("soil_composition", {})
                nutrients = soil_data.get("nutrient_levels", {})
                
                cursor.execute('''
                    INSERT OR REPLACE INTO soil_data 
                    (state, district, soil_type, ph_level, organic_matter,
                     sand_percentage, silt_percentage, clay_percentage,
                     nitrogen_level, phosphorus_level, potassium_level, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    state,
                    district,
                    soil_data.get("soil_type"),
                    soil_data.get("ph_level"),
                    soil_data.get("organic_matter"),
                    composition.get("sand"),
                    composition.get("silt"),
                    composition.get("clay"),
                    nutrients.get("nitrogen"),
                    nutrients.get("phosphorus"),
                    nutrients.get("potassium"),
                    datetime.now().strftime("%Y-%m-%d")
                ))
                
                conn.commit()
                logger.info(f"Stored soil data for {district}, {state}")
                return True
                
        except Exception as e:
            logger.error(f"Error storing soil data: {str(e)}")
            return False
    
    def get_historical_prices(self, commodity: str, state: str, 
                            days_back: int = 30, district: str = None) -> pd.DataFrame:
        """Retrieve historical price data"""
        try:
            with self.get_connection() as conn:
                query = '''
                    SELECT commodity, state, district, price, unit, date, source
                    FROM price_data 
                    WHERE commodity = ? AND state = ?
                '''
                params = [commodity, state]
                
                if district:
                    query += ' AND district = ?'
                    params.append(district)
                
                query += ' AND date >= ? ORDER BY date DESC'
                cutoff_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
                params.append(cutoff_date)
                
                df = pd.read_sql_query(query, conn, params=params)
                logger.info(f"Retrieved {len(df)} price records for {commodity} in {state}")
                return df
                
        except Exception as e:
            logger.error(f"Error retrieving historical prices: {str(e)}")
            return pd.DataFrame()
    
    def get_weather_history(self, state: str, district: str, 
                          days_back: int = 30) -> pd.DataFrame:
        """Retrieve historical weather data"""
        try:
            with self.get_connection() as conn:
                query = '''
                    SELECT * FROM weather_data 
                    WHERE state = ? AND district = ? AND date >= ?
                    ORDER BY date DESC
                '''
                cutoff_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
                
                df = pd.read_sql_query(query, conn, params=[state, district, cutoff_date])
                logger.info(f"Retrieved {len(df)} weather records for {district}, {state}")
                return df
                
        except Exception as e:
            logger.error(f"Error retrieving weather history: {str(e)}")
            return pd.DataFrame()
    
    def get_soil_info(self, state: str, district: str) -> Dict[str, Any]:
        """Retrieve soil information for a location"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT * FROM soil_data 
                    WHERE state = ? AND district = ?
                    ORDER BY last_updated DESC LIMIT 1
                ''', (state, district))
                
                row = cursor.fetchone()
                if row:
                    columns = [desc[0] for desc in cursor.description]
                    soil_info = dict(zip(columns, row))
                    logger.info(f"Retrieved soil info for {district}, {state}")
                    return soil_info
                else:
                    logger.warning(f"No soil data found for {district}, {state}")
                    return {}
                    
        except Exception as e:
            logger.error(f"Error retrieving soil info: {str(e)}")
            return {}
    
    def store_model_prediction(self, model_type: str, prediction_data: Dict[str, Any]) -> bool:
        """Store model prediction for accuracy tracking"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT INTO model_predictions 
                    (model_type, commodity, state, district, prediction_data, 
                     prediction_date, target_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    model_type,
                    prediction_data.get("commodity"),
                    prediction_data.get("state"),
                    prediction_data.get("district"),
                    json.dumps(prediction_data),
                    datetime.now().strftime("%Y-%m-%d"),
                    prediction_data.get("target_date")
                ))
                
                conn.commit()
                logger.info(f"Stored {model_type} prediction")
                return True
                
        except Exception as e:
            logger.error(f"Error storing model prediction: {str(e)}")
            return False
    
    def update_prediction_accuracy(self, prediction_id: int, actual_value: float) -> bool:
        """Update prediction with actual value and calculate accuracy"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Get the prediction
                cursor.execute('''
                    SELECT prediction_data FROM model_predictions WHERE id = ?
                ''', (prediction_id,))
                
                row = cursor.fetchone()
                if row:
                    prediction_data = json.loads(row[0])
                    predicted_value = prediction_data.get("predicted_value", 0)
                    
                    # Calculate accuracy (percentage error)
                    if actual_value > 0:
                        accuracy = 100 - abs((predicted_value - actual_value) / actual_value * 100)
                        accuracy = max(0, accuracy)  # Ensure non-negative
                    else:
                        accuracy = 0
                    
                    # Update the record
                    cursor.execute('''
                        UPDATE model_predictions 
                        SET actual_value = ?, accuracy_score = ?
                        WHERE id = ?
                    ''', (actual_value, accuracy, prediction_id))
                    
                    conn.commit()
                    logger.info(f"Updated prediction accuracy: {accuracy:.2f}%")
                    return True
                
        except Exception as e:
            logger.error(f"Error updating prediction accuracy: {str(e)}")
            return False
    
    def get_model_accuracy_stats(self, model_type: str, days_back: int = 30) -> Dict[str, Any]:
        """Get accuracy statistics for a model"""
        try:
            with self.get_connection() as conn:
                query = '''
                    SELECT accuracy_score, prediction_date 
                    FROM model_predictions 
                    WHERE model_type = ? AND accuracy_score IS NOT NULL
                    AND prediction_date >= ?
                    ORDER BY prediction_date DESC
                '''
                cutoff_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
                
                df = pd.read_sql_query(query, conn, params=[model_type, cutoff_date])
                
                if len(df) > 0:
                    return {
                        "average_accuracy": float(df['accuracy_score'].mean()),
                        "median_accuracy": float(df['accuracy_score'].median()),
                        "min_accuracy": float(df['accuracy_score'].min()),
                        "max_accuracy": float(df['accuracy_score'].max()),
                        "total_predictions": len(df),
                        "accuracy_trend": self._calculate_accuracy_trend(df)
                    }
                else:
                    return {"message": "No accuracy data available"}
                    
        except Exception as e:
            logger.error(f"Error getting model accuracy stats: {str(e)}")
            return {}
    
    def _calculate_accuracy_trend(self, df: pd.DataFrame) -> str:
        """Calculate if model accuracy is improving or declining"""
        if len(df) < 5:
            return "insufficient_data"
        
        # Compare recent vs older accuracy
        recent_accuracy = df.head(5)['accuracy_score'].mean()
        older_accuracy = df.tail(5)['accuracy_score'].mean()
        
        if recent_accuracy > older_accuracy + 2:
            return "improving"
        elif recent_accuracy < older_accuracy - 2:
            return "declining"
        else:
            return "stable"
    
    def log_data_quality(self, data_type: str, quality_info: Dict[str, Any]) -> bool:
        """Log data quality metrics"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT INTO data_quality_logs 
                    (data_type, quality_score, issues, data_points, completeness, date)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    data_type,
                    quality_info.get("quality_score"),
                    json.dumps(quality_info.get("issues", [])),
                    quality_info.get("data_points"),
                    quality_info.get("completeness"),
                    datetime.now().strftime("%Y-%m-%d")
                ))
                
                conn.commit()
                return True
                
        except Exception as e:
            logger.error(f"Error logging data quality: {str(e)}")
            return False
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get overall database statistics"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                stats = {}
                
                # Count records in each table
                tables = ['price_data', 'weather_data', 'soil_data', 'market_arrivals', 'model_predictions']
                for table in tables:
                    cursor.execute(f'SELECT COUNT(*) FROM {table}')
                    stats[f'{table}_count'] = cursor.fetchone()[0]
                
                # Get date ranges
                cursor.execute('SELECT MIN(date), MAX(date) FROM price_data')
                price_range = cursor.fetchone()
                stats['price_data_range'] = {
                    'earliest': price_range[0],
                    'latest': price_range[1]
                }
                
                # Get unique commodities and states
                cursor.execute('SELECT COUNT(DISTINCT commodity) FROM price_data')
                stats['unique_commodities'] = cursor.fetchone()[0]
                
                cursor.execute('SELECT COUNT(DISTINCT state) FROM price_data')
                stats['unique_states'] = cursor.fetchone()[0]
                
                return stats
                
        except Exception as e:
            logger.error(f"Error getting database stats: {str(e)}")
            return {}