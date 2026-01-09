"""
Train LSTM + XGBoost Hybrid Models for Price Prediction
This script trains both LSTM and XGBoost models for major commodities
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from models.lstm_xgboost_predictor import LSTMXGBoostPredictor, LSTM_AVAILABLE

# Paths
DATA_DIR = Path(__file__).parent / "data" / "collected"
MODEL_DIR = Path(__file__).parent / "models" / "saved"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def load_training_data(commodity: str) -> pd.DataFrame:
    """Load training data for a commodity"""
    training_file = DATA_DIR / "training_data.csv"
    
    if not training_file.exists():
        logger.error(f"Training data file not found: {training_file}")
        return pd.DataFrame()
    
    try:
        df = pd.read_csv(training_file)
        
        # Filter by commodity
        mask = df['commodity'].str.lower().str.contains(commodity.lower(), na=False)
        filtered = df[mask].copy()
        
        if filtered.empty:
            logger.warning(f"No data found for commodity: {commodity}")
            return filtered
        
        # Prepare data
        filtered['modal_price'] = pd.to_numeric(filtered['modal_price'], errors='coerce')
        filtered['min_price'] = pd.to_numeric(filtered['min_price'], errors='coerce')
        filtered['max_price'] = pd.to_numeric(filtered['max_price'], errors='coerce')
        filtered['date'] = pd.to_datetime(filtered['arrival_date'], format='%d/%m/%Y', errors='coerce')
        
        # Aggregate by date
        daily = filtered.groupby('date').agg({
            'modal_price': 'mean',
            'min_price': 'mean',
            'max_price': 'mean'
        }).reset_index()
        
        return daily.sort_values('date').dropna()
    except Exception as e:
        logger.error(f"Error loading training data: {e}")
        return pd.DataFrame()


def train_all_models():
    """Train LSTM + XGBoost models for all major commodities"""
    
    print("=" * 60)
    print("LSTM + XGBoost Hybrid Model Training")
    print("=" * 60)
    
    if LSTM_AVAILABLE:
        print("✅ TensorFlow available - Training LSTM + XGBoost hybrid models")
    else:
        print("⚠️ TensorFlow not available - Training XGBoost only")
    
    # Major commodities to train
    commodities = [
        'wheat', 'rice', 'cotton', 'onion', 'tomato', 
        'potato', 'soybean', 'maize', 'groundnut', 'gram'
    ]
    
    results = {}
    
    for commodity in commodities:
        print(f"\n{'='*50}")
        print(f"Training model for: {commodity.upper()}")
        print('='*50)
        
        # Load training data
        df = load_training_data(commodity)
        
        if len(df) < 60:
            logger.warning(f"Insufficient data for {commodity}. Need at least 60 days, got {len(df)}.")
            results[commodity] = {"error": f"Insufficient data ({len(df)} records)"}
            continue
        
        logger.info(f"Loaded {len(df)} records for {commodity}")
        
        # Train model
        try:
            predictor = LSTMXGBoostPredictor(commodity)
            metrics = predictor.train(df)
            results[commodity] = metrics
            
            # Test prediction
            prediction = predictor.predict(df, days_ahead=7)
            if 'predictions' in prediction:
                logger.info(f"Sample prediction: ₹{prediction['predictions'][0]['predicted_price']:.2f}")
            
        except Exception as e:
            logger.error(f"Error training {commodity}: {e}")
            results[commodity] = {"error": str(e)}
    
    # Print summary
    print("\n" + "=" * 60)
    print("TRAINING RESULTS SUMMARY")
    print("=" * 60)
    
    for commodity, metrics in results.items():
        print(f"\n{commodity.upper()}:")
        if 'error' in metrics:
            print(f"  ❌ Error: {metrics['error']}")
        else:
            if 'xgboost' in metrics:
                print(f"  ✅ XGBoost MAE: ₹{metrics['xgboost']['mae']:.2f}")
                print(f"     XGBoost R²: {metrics['xgboost']['r2']:.4f}")
            if 'lstm' in metrics:
                print(f"  ✅ LSTM MAE: ₹{metrics['lstm']['mae']:.2f}")
                print(f"     LSTM R²: {metrics['lstm']['r2']:.4f}")
    
    return results


if __name__ == "__main__":
    results = train_all_models()
    
    # Count successful models
    successful = sum(1 for r in results.values() if 'error' not in r)
    total = len(results)
    
    print(f"\n{'='*60}")
    print(f"Training Complete: {successful}/{total} models trained successfully")
    print("=" * 60)
