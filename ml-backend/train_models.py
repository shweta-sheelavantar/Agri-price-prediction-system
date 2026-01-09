"""
Train LSTM + XGBoost Models on Historical Data
Uses agmarknet + real data for training
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
import logging
import joblib

# ML Libraries
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent / "data" / "collected"
MODEL_DIR = Path(__file__).parent / "models" / "trained"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


class PricePredictor:
    """XGBoost-based price predictor (LSTM optional)"""
    
    def __init__(self, commodity: str):
        self.commodity = commodity
        self.scaler = MinMaxScaler()
        self.model = None
        self.metrics = {}
        
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create features for XGBoost"""
        features = df.copy()
        
        # Ensure date is datetime
        if 'date' not in features.columns:
            features['date'] = pd.to_datetime(features['arrival_date'], format='%d/%m/%Y', errors='coerce')
        
        # Time-based features
        features['day_of_week'] = features['date'].dt.dayofweek
        features['month'] = features['date'].dt.month
        features['day_of_month'] = features['date'].dt.day
        features['week_of_year'] = features['date'].dt.isocalendar().week.astype(int)
        features['day_of_year'] = features['date'].dt.dayofyear
        
        # Lag features (previous prices)
        for lag in [1, 2, 3, 5, 7, 14, 21, 30]:
            features[f'price_lag_{lag}'] = features['modal_price'].shift(lag)
        
        # Rolling statistics
        for window in [3, 7, 14, 30]:
            features[f'rolling_mean_{window}'] = features['modal_price'].rolling(window).mean()
            features[f'rolling_std_{window}'] = features['modal_price'].rolling(window).std()
            features[f'rolling_min_{window}'] = features['modal_price'].rolling(window).min()
            features[f'rolling_max_{window}'] = features['modal_price'].rolling(window).max()
        
        # Price momentum
        features['momentum_3'] = features['modal_price'] - features['modal_price'].shift(3)
        features['momentum_7'] = features['modal_price'] - features['modal_price'].shift(7)
        features['momentum_14'] = features['modal_price'] - features['modal_price'].shift(14)
        
        # Volatility
        features['volatility_7'] = features['modal_price'].rolling(7).std() / features['modal_price'].rolling(7).mean()
        features['volatility_14'] = features['modal_price'].rolling(14).std() / features['modal_price'].rolling(14).mean()
        
        # Price change percentage
        features['pct_change_1'] = features['modal_price'].pct_change(1)
        features['pct_change_7'] = features['modal_price'].pct_change(7)
        
        return features.dropna()
    
    def train(self, df: pd.DataFrame) -> dict:
        """Train XGBoost model"""
        logger.info(f"Training model for {self.commodity}...")
        
        if len(df) < 60:
            logger.error(f"Insufficient data: {len(df)} records (need 60+)")
            return {"error": "Insufficient data"}
        
        # Prepare features
        features_df = self.prepare_features(df)
        
        if len(features_df) < 30:
            logger.error(f"Insufficient data after feature engineering: {len(features_df)}")
            return {"error": "Insufficient data after feature engineering"}
        
        # Define feature columns
        feature_cols = [col for col in features_df.columns 
                       if col not in ['date', 'modal_price', 'min_price', 'max_price', 
                                     'arrival_date', 'data_type', 'commodity', 'state', 
                                     'district', 'market', 'variety', 'grade', 'fetch_timestamp']]
        
        X = features_df[feature_cols]
        y = features_df['modal_price']
        
        # Split data (time-series split - no shuffle)
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        logger.info(f"Training set: {len(X_train)}, Test set: {len(X_test)}")
        
        # Train XGBoost
        self.model = xgb.XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=False
        )
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        
        self.metrics = {
            'mae': round(mae, 2),
            'rmse': round(rmse, 2),
            'r2': round(r2, 4),
            'mape': round(mape, 2),
            'accuracy': round((1 - mape/100) * 100, 2),
            'train_size': len(X_train),
            'test_size': len(X_test),
            'features_used': len(feature_cols)
        }
        
        # Feature importance
        importance = dict(zip(feature_cols, self.model.feature_importances_))
        self.metrics['top_features'] = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True)[:10])
        
        logger.info(f"Model trained - MAE: ₹{mae:.2f}, MAPE: {mape:.2f}%, R²: {r2:.4f}")
        
        return self.metrics
    
    def save(self):
        """Save model to disk"""
        if self.model is None:
            logger.error("No model to save")
            return
        
        commodity_safe = self.commodity.lower().replace(' ', '_').replace('(', '').replace(')', '')
        
        # Save model
        model_path = MODEL_DIR / f"{commodity_safe}_xgboost.pkl"
        joblib.dump(self.model, model_path)
        
        # Save metrics
        metrics_path = MODEL_DIR / f"{commodity_safe}_metrics.pkl"
        joblib.dump(self.metrics, metrics_path)
        
        logger.info(f"Model saved: {model_path}")
    
    def load(self) -> bool:
        """Load model from disk"""
        commodity_safe = self.commodity.lower().replace(' ', '_').replace('(', '').replace(')', '')
        
        model_path = MODEL_DIR / f"{commodity_safe}_xgboost.pkl"
        metrics_path = MODEL_DIR / f"{commodity_safe}_metrics.pkl"
        
        if model_path.exists():
            self.model = joblib.load(model_path)
            if metrics_path.exists():
                self.metrics = joblib.load(metrics_path)
            logger.info(f"Model loaded for {self.commodity}")
            return True
        return False
    
    def predict(self, df: pd.DataFrame, days_ahead: int = 7) -> dict:
        """Make predictions"""
        if self.model is None:
            if not self.load():
                return {"error": "Model not trained"}
        
        predictions = []
        current_data = df.copy()
        
        for day in range(days_ahead):
            # Prepare features for prediction
            features_df = self.prepare_features(current_data)
            
            if features_df.empty:
                break
            
            feature_cols = [col for col in features_df.columns 
                          if col not in ['date', 'modal_price', 'min_price', 'max_price',
                                        'arrival_date', 'data_type', 'commodity', 'state',
                                        'district', 'market', 'variety', 'grade', 'fetch_timestamp']]
            
            X = features_df[feature_cols].iloc[-1:].values
            pred = self.model.predict(X)[0]
            
            # Calculate confidence interval based on model's historical error
            confidence_margin = self.metrics.get('mae', pred * 0.05)
            
            pred_date = current_data['date'].max() + pd.Timedelta(days=1)
            
            predictions.append({
                'date': pred_date.strftime('%Y-%m-%d'),
                'predicted_price': round(float(pred), 2),
                'confidence_lower': round(float(pred - confidence_margin), 2),
                'confidence_upper': round(float(pred + confidence_margin), 2),
                'day': day + 1
            })
            
            # Add prediction to data for next iteration
            new_row = pd.DataFrame({
                'date': [pred_date],
                'modal_price': [pred]
            })
            current_data = pd.concat([current_data, new_row], ignore_index=True)
        
        return {
            'commodity': self.commodity,
            'predictions': predictions,
            'model_accuracy': self.metrics.get('accuracy', 0),
            'model_mae': self.metrics.get('mae', 0),
            'generated_at': datetime.now().isoformat()
        }


def load_training_data(commodity: str) -> pd.DataFrame:
    """Load training data for a commodity"""
    training_file = DATA_DIR / "training_data.csv"
    
    if not training_file.exists():
        logger.error("Training data not found. Run generate_agmarknet_history.py first.")
        return pd.DataFrame()
    
    df = pd.read_csv(training_file)
    
    # Filter by commodity
    mask = df['commodity'].str.lower().str.contains(commodity.lower(), na=False)
    filtered = df[mask].copy()
    
    if filtered.empty:
        return filtered
    
    # Prepare data
    filtered['modal_price'] = pd.to_numeric(filtered['modal_price'], errors='coerce')
    filtered['date'] = pd.to_datetime(filtered['arrival_date'], format='%d/%m/%Y', errors='coerce')
    
    # Aggregate by date
    daily = filtered.groupby('date').agg({
        'modal_price': 'mean',
        'min_price': 'mean',
        'max_price': 'mean'
    }).reset_index()
    
    daily = daily.sort_values('date').dropna()
    
    return daily


def train_all_models():
    """Train models for all major commodities"""
    commodities = [
        'Wheat', 'Rice', 'Soyabean', 'Cotton', 'Onion', 'Tomato', 
        'Potato', 'Maize', 'Groundnut', 'Green Gram', 'Bengal Gram',
        'Lentil', 'Mustard', 'Chilli', 'Garlic', 'Cabbage'
    ]
    
    results = {}
    
    print("\n" + "="*70)
    print("TRAINING ML MODELS FOR PRICE PREDICTION")
    print("="*70)
    
    for commodity in commodities:
        print(f"\n{'─'*70}")
        print(f"Training: {commodity.upper()}")
        print('─'*70)
        
        # Load data
        df = load_training_data(commodity)
        
        if len(df) < 60:
            print(f"  ⚠️  Insufficient data: {len(df)} days (need 60+)")
            results[commodity] = {"error": "Insufficient data", "records": len(df)}
            continue
        
        print(f"  📊 Data: {len(df)} days")
        
        # Train model
        predictor = PricePredictor(commodity)
        metrics = predictor.train(df)
        
        if 'error' not in metrics:
            predictor.save()
            
            # Test prediction
            prediction = predictor.predict(df, days_ahead=7)
            
            print(f"  ✅ Accuracy: {metrics['accuracy']:.1f}%")
            print(f"  📈 MAE: ₹{metrics['mae']:.2f}")
            print(f"  📉 MAPE: {metrics['mape']:.2f}%")
            print(f"  🎯 R²: {metrics['r2']:.4f}")
            
            if prediction.get('predictions'):
                print(f"  🔮 7-day forecast: ₹{prediction['predictions'][0]['predicted_price']:.0f} → ₹{prediction['predictions'][-1]['predicted_price']:.0f}")
        
        results[commodity] = metrics
    
    # Summary
    print("\n" + "="*70)
    print("TRAINING SUMMARY")
    print("="*70)
    
    successful = [c for c, m in results.items() if 'error' not in m]
    failed = [c for c, m in results.items() if 'error' in m]
    
    print(f"\n✅ Successfully trained: {len(successful)} models")
    print(f"❌ Failed: {len(failed)} models")
    
    if successful:
        avg_accuracy = np.mean([results[c]['accuracy'] for c in successful])
        avg_mae = np.mean([results[c]['mae'] for c in successful])
        print(f"\n📊 Average Accuracy: {avg_accuracy:.1f}%")
        print(f"📈 Average MAE: ₹{avg_mae:.2f}")
    
    # Save summary
    summary_file = MODEL_DIR / "training_summary.pkl"
    joblib.dump(results, summary_file)
    print(f"\n💾 Summary saved to: {summary_file}")
    
    return results


if __name__ == "__main__":
    results = train_all_models()
