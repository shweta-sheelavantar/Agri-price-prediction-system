#!/usr/bin/env python3
"""
Startup script for Agricultural Market Price Prediction API
Ensures models are trained and starts the FastAPI server
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.price_prediction_model import AgriculturePricePredictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def ensure_models_trained():
    """Ensure ML models are trained and saved"""
    
    models_dir = Path('models/saved')
    metadata_file = models_dir / 'price_model_metadata.joblib'
    
    if metadata_file.exists():
        logger.info("✅ Models already trained and saved")
        return True
    
    logger.info("🔄 Training ML models (this may take a few minutes)...")
    
    try:
        # Train models
        predictor = AgriculturePricePredictor()
        results = predictor.train_model('data/agricultural_prices_5years.csv')
        
        logger.info("✅ Model training completed successfully!")
        logger.info(f"📊 Trained {len(predictor.models)} models")
        
        # Show sample results
        sample_results = list(results.items())[:3]
        for model_key, metrics in sample_results:
            logger.info(f"   {model_key}: R² = {metrics['final_r2']:.3f}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Model training failed: {e}")
        return False

def check_data_file():
    """Check if data file exists"""
    
    data_file = Path('data/agricultural_prices_5years.csv')
    
    if not data_file.exists():
        logger.error("❌ Data file not found!")
        logger.info("🔄 Generating sample data...")
        
        try:
            # Generate data
            subprocess.run([sys.executable, 'data/generate_sample_data.py'], check=True)
            logger.info("✅ Sample data generated successfully!")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to generate data: {e}")
            return False
    
    logger.info("✅ Data file found")
    return True

def start_api_server():
    """Start the FastAPI server"""
    
    logger.info("🚀 Starting Agricultural Market Price Prediction API...")
    logger.info("📡 Server will be available at: http://localhost:8000")
    logger.info("📚 API documentation at: http://localhost:8000/docs")
    logger.info("🔄 Press Ctrl+C to stop the server")
    
    try:
        # Start the API server
        subprocess.run([
            sys.executable, '-m', 'uvicorn',
            'api.price_prediction_api:app',
            '--host', '0.0.0.0',
            '--port', '8000',
            '--reload'
        ], check=True)
        
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Server failed to start: {e}")

def main():
    """Main startup function"""
    
    print("🌾 Agricultural Market Price Prediction System")
    print("=" * 50)
    
    # Check and generate data if needed
    if not check_data_file():
        logger.error("❌ Cannot proceed without data file")
        return False
    
    # Ensure models are trained
    if not ensure_models_trained():
        logger.error("❌ Cannot proceed without trained models")
        return False
    
    # Start API server
    start_api_server()
    
    return True

if __name__ == "__main__":
    main()