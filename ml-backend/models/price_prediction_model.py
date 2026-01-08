#!/usr/bin/env python3
"""
Agricultural Market Price Prediction Model
Uses Random Forest Regressor with time-series features for 15-day price forecasting
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgriculturePricePredictor:
    """
    Random Forest-based price prediction model for agricultural commodities
    
    Features:
    - Time-series feature engineering
    - Recursive forecasting for 15-day predictions
    - Commodity and market-specific models
    - Robust error handling and validation
    """
    
    def __init__(self):
        self.models = {}  # Store models for each commodity-market pair
        self.feature_columns = []
        self.is_trained = False
        
        # Random Forest parameters optimized for time-series
        self.rf_params = {
            'n_estimators': 100,
            'max_depth': 15,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'random_state': 42,
            'n_jobs': -1
        }
    
    def create_features(self, df):
        """
        Create supervised time-series features from price data
        
        Features created:
        - price_lag_1: Previous day price
        - price_lag_7: Price 7 days ago
        - price_lag_14: Price 14 days ago
        - rolling_mean_7: 7-day rolling average
        - rolling_mean_14: 14-day rolling average
        - day_of_week: Day of week (0-6)
        - month: Month (1-12)
        """
        
        df = df.copy()
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Lag features
        df['price_lag_1'] = df['price'].shift(1)
        df['price_lag_7'] = df['price'].shift(7)
        df['price_lag_14'] = df['price'].shift(14)
        
        # Rolling averages
        df['rolling_mean_7'] = df['price'].rolling(window=7, min_periods=1).mean()
        df['rolling_mean_14'] = df['price'].rolling(window=14, min_periods=1).mean()
        
        # Time-based features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        
        # Price change features
        df['price_change_1d'] = df['price'] - df['price_lag_1']
        df['price_change_7d'] = df['price'] - df['price_lag_7']
        
        # Volatility features
        df['price_volatility_7d'] = df['price'].rolling(window=7).std()
        df['price_volatility_14d'] = df['price'].rolling(window=14).std()
        
        # Trend features
        df['trend_7d'] = df['rolling_mean_7'] - df['rolling_mean_14']
        
        # Remove rows with NaN values (first 14 days)
        df = df.dropna()
        
        self.feature_columns = [
            'price_lag_1', 'price_lag_7', 'price_lag_14',
            'rolling_mean_7', 'rolling_mean_14',
            'day_of_week', 'month',
            'price_change_1d', 'price_change_7d',
            'price_volatility_7d', 'price_volatility_14d',
            'trend_7d'
        ]
        
        return df
    
    def train_model(self, data_path='data/agricultural_prices_5years.csv'):
        """
        Train Random Forest models for each commodity-market combination
        Uses time-series cross-validation to prevent data leakage
        """
        
        logger.info("Loading training data...")
        df = pd.read_csv(data_path)
        
        # Create features
        df = self.create_features(df)
        
        logger.info(f"Training on {len(df)} samples with {len(self.feature_columns)} features")
        
        # Train separate model for each commodity-market pair
        commodity_market_pairs = df[['commodity', 'market']].drop_duplicates()
        
        training_results = {}
        
        for _, row in commodity_market_pairs.iterrows():
            commodity = row['commodity']
            market = row['market']
            
            # Filter data for this commodity-market pair
            subset = df[(df['commodity'] == commodity) & (df['market'] == market)].copy()
            subset = subset.sort_values('date')
            
            if len(subset) < 100:  # Skip if insufficient data
                logger.warning(f"Insufficient data for {commodity}-{market}: {len(subset)} samples")
                continue
            
            # Prepare features and target
            X = subset[self.feature_columns]
            y = subset['price']
            
            # Time-series cross-validation
            tscv = TimeSeriesSplit(n_splits=5)
            cv_scores = []
            
            for train_idx, val_idx in tscv.split(X):
                X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
                y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
                
                # Train model
                rf = RandomForestRegressor(**self.rf_params)
                rf.fit(X_train, y_train)
                
                # Validate
                y_pred = rf.predict(X_val)
                score = r2_score(y_val, y_pred)
                cv_scores.append(score)
            
            # Train final model on all data
            rf_final = RandomForestRegressor(**self.rf_params)
            rf_final.fit(X, y)
            
            # Store model
            model_key = f"{commodity}_{market}"
            self.models[model_key] = rf_final
            
            # Calculate final metrics
            y_pred_final = rf_final.predict(X)
            mae = mean_absolute_error(y, y_pred_final)
            rmse = np.sqrt(mean_squared_error(y, y_pred_final))
            r2 = r2_score(y, y_pred_final)
            
            training_results[model_key] = {
                'cv_score_mean': np.mean(cv_scores),
                'cv_score_std': np.std(cv_scores),
                'final_mae': mae,
                'final_rmse': rmse,
                'final_r2': r2,
                'samples': len(subset)
            }
            
            logger.info(f"Trained {commodity}-{market}: R² = {r2:.3f}, MAE = {mae:.2f}")
        
        self.is_trained = True
        
        # Save models
        self.save_models()
        
        logger.info(f"Training complete! Trained {len(self.models)} models")
        return training_results
    
    def predict_next_15_days(self, commodity, market, data_path='data/agricultural_prices_5years.csv'):
        """
        Predict prices for the next 15 days using recursive forecasting
        
        Recursive forecasting:
        1. Predict day 1 using historical data
        2. Use day 1 prediction to predict day 2
        3. Continue for 15 days
        """
        
        model_key = f"{commodity}_{market}"
        
        if model_key not in self.models:
            raise ValueError(f"No trained model found for {commodity}-{market}")
        
        # Load recent data
        df = pd.read_csv(data_path)
        df = df[(df['commodity'] == commodity) & (df['market'] == market)]
        df = self.create_features(df)
        df = df.sort_values('date')
        
        if len(df) == 0:
            raise ValueError(f"No data found for {commodity}-{market}")
        
        # Get the most recent data point
        last_row = df.iloc[-1].copy()
        model = self.models[model_key]
        
        predictions = []
        current_date = pd.to_datetime(last_row['date'])
        
        # Recursive forecasting for 15 days
        for day in range(1, 16):
            prediction_date = current_date + timedelta(days=day)
            
            # Prepare features for prediction
            features = last_row[self.feature_columns].values.reshape(1, -1)
            
            # Make prediction
            predicted_price = model.predict(features)[0]
            
            predictions.append({
                'date': prediction_date.strftime('%Y-%m-%d'),
                'predicted_price': round(predicted_price, 2)
            })
            
            # Update features for next prediction (recursive)
            # Shift lag features
            last_row['price_lag_14'] = last_row['price_lag_7']
            last_row['price_lag_7'] = last_row['price_lag_1']
            last_row['price_lag_1'] = predicted_price
            
            # Update rolling averages (simplified)
            last_row['rolling_mean_7'] = (last_row['rolling_mean_7'] * 6 + predicted_price) / 7
            last_row['rolling_mean_14'] = (last_row['rolling_mean_14'] * 13 + predicted_price) / 14
            
            # Update time features
            last_row['day_of_week'] = prediction_date.dayofweek
            last_row['month'] = prediction_date.month
            
            # Update change features
            last_row['price_change_1d'] = predicted_price - last_row['price_lag_1']
            last_row['price_change_7d'] = predicted_price - last_row['price_lag_7']
            
            # Update trend
            last_row['trend_7d'] = last_row['rolling_mean_7'] - last_row['rolling_mean_14']
        
        return predictions
    
    def get_past_15_days(self, commodity, market, data_path='data/agricultural_prices_5years.csv'):
        """Get the last 15 days of actual prices"""
        
        df = pd.read_csv(data_path)
        df = df[(df['commodity'] == commodity) & (df['market'] == market)]
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Get last 15 days
        last_15 = df.tail(15)
        
        return [
            {
                'date': row['date'].strftime('%Y-%m-%d'),
                'price': round(row['price'], 2)
            }
            for _, row in last_15.iterrows()
        ]
    
    def get_today_price(self, commodity, market, data_path='data/agricultural_prices_5years.csv'):
        """Get today's price (most recent price from data)"""
        
        df = pd.read_csv(data_path)
        df = df[(df['commodity'] == commodity) & (df['market'] == market)]
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        if len(df) == 0:
            return None
        
        latest = df.iloc[-1]
        
        return {
            'date': latest['date'].strftime('%Y-%m-%d'),
            'price': round(latest['price'], 2),
            'source': 'CSV_FALLBACK'
        }
    
    def save_models(self, models_dir='models/saved'):
        """Save trained models to disk"""
        
        os.makedirs(models_dir, exist_ok=True)
        
        # Save individual models
        for model_key, model in self.models.items():
            model_path = os.path.join(models_dir, f'{model_key}_price_model.joblib')
            joblib.dump(model, model_path)
        
        # Save feature columns and metadata
        metadata = {
            'feature_columns': self.feature_columns,
            'model_keys': list(self.models.keys()),
            'rf_params': self.rf_params,
            'trained_at': datetime.now().isoformat()
        }
        
        metadata_path = os.path.join(models_dir, 'price_model_metadata.joblib')
        joblib.dump(metadata, metadata_path)
        
        logger.info(f"Models saved to {models_dir}")
    
    def load_models(self, models_dir='models/saved'):
        """Load trained models from disk"""
        
        metadata_path = os.path.join(models_dir, 'price_model_metadata.joblib')
        
        if not os.path.exists(metadata_path):
            raise FileNotFoundError(f"No saved models found in {models_dir}")
        
        # Load metadata
        metadata = joblib.load(metadata_path)
        self.feature_columns = metadata['feature_columns']
        self.rf_params = metadata['rf_params']
        
        # Load individual models
        self.models = {}
        for model_key in metadata['model_keys']:
            model_path = os.path.join(models_dir, f'{model_key}_price_model.joblib')
            if os.path.exists(model_path):
                self.models[model_key] = joblib.load(model_path)
        
        self.is_trained = len(self.models) > 0
        
        logger.info(f"Loaded {len(self.models)} models from {models_dir}")
    
    def get_available_commodities_markets(self):
        """Get list of available commodity-market combinations"""
        
        if not self.is_trained:
            return []
        
        return [key.replace('_', ' - ') for key in self.models.keys()]

def train_and_save_models():
    """Train models and save them"""
    
    predictor = AgriculturePricePredictor()
    
    logger.info("Starting model training...")
    results = predictor.train_model()
    
    logger.info("Training Results:")
    for model_key, metrics in results.items():
        logger.info(f"{model_key}: R² = {metrics['final_r2']:.3f}, MAE = {metrics['final_mae']:.2f}")
    
    return predictor

if __name__ == "__main__":
    # Train models
    predictor = train_and_save_models()
    
    # Test prediction
    try:
        predictions = predictor.predict_next_15_days('Wheat', 'Delhi')
        logger.info(f"Sample predictions for Wheat-Delhi: {predictions[:3]}")
    except Exception as e:
        logger.error(f"Prediction test failed: {e}")