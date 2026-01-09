"""
LSTM + XGBoost Ensemble Price Predictor
Trained on real AGMARKNET historical data
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging
import joblib
from pathlib import Path

# ML Libraries
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

# Try to import TensorFlow/Keras for LSTM
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import EarlyStopping
    LSTM_AVAILABLE = True
    logging.info("TensorFlow available - LSTM + XGBoost hybrid mode enabled")
except ImportError as e:
    LSTM_AVAILABLE = False
    logging.warning(f"TensorFlow not available: {e}. Using XGBoost only.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
MODEL_DIR = Path(__file__).parent / "saved"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


class LSTMXGBoostPredictor:
    """
    Ensemble model combining LSTM (for sequence patterns) and XGBoost (for feature-based prediction)
    """
    
    def __init__(self, commodity: str):
        self.commodity = commodity
        self.scaler = MinMaxScaler()
        self.lstm_model = None
        self.xgb_model = None
        self.is_trained = False
        self.sequence_length = 30  # Use 30 days of history
        self.metrics = {}
        
    def prepare_sequences(self, data: np.ndarray, seq_length: int) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare sequences for LSTM training"""
        X, y = [], []
        for i in range(len(data) - seq_length):
            X.append(data[i:(i + seq_length)])
            y.append(data[i + seq_length])
        return np.array(X), np.array(y)
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create features for XGBoost"""
        features = df.copy()
        
        # Time-based features
        features['day_of_week'] = features['date'].dt.dayofweek
        features['month'] = features['date'].dt.month
        features['day_of_month'] = features['date'].dt.day
        features['week_of_year'] = features['date'].dt.isocalendar().week
        
        # Lag features
        for lag in [1, 3, 7, 14, 30]:
            features[f'price_lag_{lag}'] = features['modal_price'].shift(lag)
        
        # Rolling statistics
        for window in [7, 14, 30]:
            features[f'rolling_mean_{window}'] = features['modal_price'].rolling(window).mean()
            features[f'rolling_std_{window}'] = features['modal_price'].rolling(window).std()
            features[f'rolling_min_{window}'] = features['modal_price'].rolling(window).min()
            features[f'rolling_max_{window}'] = features['modal_price'].rolling(window).max()
        
        # Price momentum
        features['momentum_7'] = features['modal_price'] - features['modal_price'].shift(7)
        features['momentum_30'] = features['modal_price'] - features['modal_price'].shift(30)
        
        # Volatility
        features['volatility_7'] = features['modal_price'].rolling(7).std() / features['modal_price'].rolling(7).mean()
        
        return features.dropna()
    
    def train(self, df: pd.DataFrame) -> Dict:
        """Train both LSTM and XGBoost models"""
        logger.info(f"Training models for {self.commodity}...")
        
        if len(df) < self.sequence_length + 30:
            logger.error(f"Insufficient data for training. Need at least {self.sequence_length + 30} records.")
            return {"error": "Insufficient data"}
        
        # Prepare data
        prices = df['modal_price'].values.reshape(-1, 1)
        scaled_prices = self.scaler.fit_transform(prices)
        
        # Train LSTM if available
        if LSTM_AVAILABLE:
            self._train_lstm(scaled_prices)
        
        # Train XGBoost
        self._train_xgboost(df)
        
        self.is_trained = True
        self._save_models()
        
        return self.metrics
    
    def _train_lstm(self, scaled_data: np.ndarray):
        """Train LSTM model"""
        logger.info("Training LSTM model...")
        
        X, y = self.prepare_sequences(scaled_data, self.sequence_length)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
        
        # Build LSTM model
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(self.sequence_length, 1)),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        
        # Train with early stopping
        early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
        
        history = model.fit(
            X_train, y_train,
            epochs=100,
            batch_size=32,
            validation_data=(X_test, y_test),
            callbacks=[early_stop],
            verbose=0
        )
        
        self.lstm_model = model
        
        # Evaluate
        y_pred = model.predict(X_test, verbose=0)
        y_pred_inv = self.scaler.inverse_transform(y_pred)
        y_test_inv = self.scaler.inverse_transform(y_test)
        
        self.metrics['lstm'] = {
            'mae': float(mean_absolute_error(y_test_inv, y_pred_inv)),
            'rmse': float(np.sqrt(mean_squared_error(y_test_inv, y_pred_inv))),
            'r2': float(r2_score(y_test_inv, y_pred_inv))
        }
        
        logger.info(f"LSTM trained - MAE: {self.metrics['lstm']['mae']:.2f}, R2: {self.metrics['lstm']['r2']:.4f}")
    
    def _train_xgboost(self, df: pd.DataFrame):
        """Train XGBoost model"""
        logger.info("Training XGBoost model...")
        
        features_df = self.prepare_features(df)
        
        feature_cols = [col for col in features_df.columns if col not in ['date', 'modal_price', 'min_price', 'max_price']]
        
        X = features_df[feature_cols]
        y = features_df['modal_price']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
        
        # Train XGBoost
        self.xgb_model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )
        
        self.xgb_model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=False
        )
        
        # Evaluate
        y_pred = self.xgb_model.predict(X_test)
        
        self.metrics['xgboost'] = {
            'mae': float(mean_absolute_error(y_test, y_pred)),
            'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
            'r2': float(r2_score(y_test, y_pred))
        }
        
        # Feature importance
        importance = dict(zip(feature_cols, self.xgb_model.feature_importances_))
        self.metrics['xgboost']['top_features'] = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True)[:5])
        
        logger.info(f"XGBoost trained - MAE: {self.metrics['xgboost']['mae']:.2f}, R2: {self.metrics['xgboost']['r2']:.4f}")
    
    def predict(self, df: pd.DataFrame, days_ahead: int = 7) -> Dict:
        """Make predictions using ensemble"""
        if not self.is_trained:
            self._load_models()
            if not self.is_trained:
                return {"error": "Model not trained"}
        
        predictions = []
        current_data = df.copy()
        
        for day in range(days_ahead):
            pred_date = df['date'].max() + timedelta(days=day + 1)
            
            # XGBoost prediction
            xgb_pred = self._predict_xgboost(current_data)
            
            # LSTM prediction (if available)
            if self.lstm_model and LSTM_AVAILABLE:
                lstm_pred = self._predict_lstm(current_data)
                # Ensemble: weighted average (60% XGBoost, 40% LSTM)
                ensemble_pred = 0.6 * xgb_pred + 0.4 * lstm_pred
            else:
                ensemble_pred = xgb_pred
            
            predictions.append({
                'date': pred_date.strftime('%Y-%m-%d'),
                'predicted_price': round(float(ensemble_pred), 2),
                'confidence_lower': round(float(ensemble_pred * 0.95), 2),
                'confidence_upper': round(float(ensemble_pred * 1.05), 2)
            })
            
            # Add prediction to data for next iteration
            new_row = pd.DataFrame({
                'date': [pred_date],
                'modal_price': [ensemble_pred]
            })
            current_data = pd.concat([current_data, new_row], ignore_index=True)
        
        return {
            'commodity': self.commodity,
            'predictions': predictions,
            'model_metrics': self.metrics,
            'generated_at': datetime.now().isoformat()
        }
    
    def _predict_lstm(self, df: pd.DataFrame) -> float:
        """Make LSTM prediction"""
        prices = df['modal_price'].values[-self.sequence_length:].reshape(-1, 1)
        scaled = self.scaler.transform(prices)
        X = scaled.reshape(1, self.sequence_length, 1)
        pred_scaled = self.lstm_model.predict(X, verbose=0)
        pred = self.scaler.inverse_transform(pred_scaled)
        return float(pred[0, 0])
    
    def _predict_xgboost(self, df: pd.DataFrame) -> float:
        """Make XGBoost prediction"""
        features_df = self.prepare_features(df)
        if features_df.empty:
            return df['modal_price'].iloc[-1]  # Fallback to last known price
        
        feature_cols = [col for col in features_df.columns if col not in ['date', 'modal_price', 'min_price', 'max_price']]
        X = features_df[feature_cols].iloc[-1:].values
        pred = self.xgb_model.predict(X)
        return float(pred[0])
    
    def _save_models(self):
        """Save trained models to disk"""
        commodity_safe = self.commodity.lower().replace(' ', '_')
        
        # Save scaler
        joblib.dump(self.scaler, MODEL_DIR / f"{commodity_safe}_scaler.pkl")
        
        # Save XGBoost
        if self.xgb_model:
            joblib.dump(self.xgb_model, MODEL_DIR / f"{commodity_safe}_xgboost.pkl")
        
        # Save LSTM
        if self.lstm_model and LSTM_AVAILABLE:
            self.lstm_model.save(MODEL_DIR / f"{commodity_safe}_lstm.h5")
        
        # Save metrics
        joblib.dump(self.metrics, MODEL_DIR / f"{commodity_safe}_metrics.pkl")
        
        logger.info(f"Models saved for {self.commodity}")
    
    def _load_models(self):
        """Load trained models from disk"""
        commodity_safe = self.commodity.lower().replace(' ', '_')
        
        try:
            # Load scaler
            scaler_path = MODEL_DIR / f"{commodity_safe}_scaler.pkl"
            if scaler_path.exists():
                self.scaler = joblib.load(scaler_path)
            
            # Load XGBoost
            xgb_path = MODEL_DIR / f"{commodity_safe}_xgboost.pkl"
            if xgb_path.exists():
                self.xgb_model = joblib.load(xgb_path)
            
            # Load LSTM
            lstm_path = MODEL_DIR / f"{commodity_safe}_lstm.h5"
            if lstm_path.exists() and LSTM_AVAILABLE:
                self.lstm_model = load_model(lstm_path)
            
            # Load metrics
            metrics_path = MODEL_DIR / f"{commodity_safe}_metrics.pkl"
            if metrics_path.exists():
                self.metrics = joblib.load(metrics_path)
            
            self.is_trained = self.xgb_model is not None
            logger.info(f"Models loaded for {self.commodity}")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.is_trained = False


# Training script
def train_all_models():
    """Train models for all major commodities"""
    from data.historical_data_collector import HistoricalDataCollector
    
    collector = HistoricalDataCollector()
    
    commodities = ['wheat', 'rice', 'soybean', 'cotton', 'onion', 'tomato', 'potato', 'maize']
    
    results = {}
    
    for commodity in commodities:
        logger.info(f"\n{'='*50}")
        logger.info(f"Training model for: {commodity.upper()}")
        logger.info('='*50)
        
        # Get training data
        df = collector.get_training_data(commodity)
        
        if len(df) < 60:
            logger.warning(f"Insufficient data for {commodity}. Need at least 60 days.")
            results[commodity] = {"error": "Insufficient data"}
            continue
        
        # Train model
        predictor = LSTMXGBoostPredictor(commodity)
        metrics = predictor.train(df)
        results[commodity] = metrics
        
        # Test prediction
        prediction = predictor.predict(df, days_ahead=7)
        logger.info(f"Sample prediction: {prediction['predictions'][0]}")
    
    return results


if __name__ == "__main__":
    results = train_all_models()
    print("\n" + "="*50)
    print("TRAINING RESULTS")
    print("="*50)
    for commodity, metrics in results.items():
        print(f"\n{commodity.upper()}:")
        if 'error' in metrics:
            print(f"  Error: {metrics['error']}")
        else:
            if 'xgboost' in metrics:
                print(f"  XGBoost MAE: ₹{metrics['xgboost']['mae']:.2f}")
                print(f"  XGBoost R²: {metrics['xgboost']['r2']:.4f}")
            if 'lstm' in metrics:
                print(f"  LSTM MAE: ₹{metrics['lstm']['mae']:.2f}")
                print(f"  LSTM R²: {metrics['lstm']['r2']:.4f}")
