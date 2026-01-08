#!/usr/bin/env python3
"""
Test script to check imports and identify issues
"""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.getcwd())

print("Testing imports...")

try:
    from models.price_predictor import PricePredictor
    print("✅ PricePredictor imported successfully")
except Exception as e:
    print(f"❌ PricePredictor import failed: {e}")

try:
    from models.yield_predictor import YieldPredictor
    print("✅ YieldPredictor imported successfully")
except Exception as e:
    print(f"❌ YieldPredictor import failed: {e}")

try:
    from models.risk_assessor import RiskAssessor
    print("✅ RiskAssessor imported successfully")
except Exception as e:
    print(f"❌ RiskAssessor import failed: {e}")

try:
    from services.data_collector import DataCollector
    print("✅ DataCollector imported successfully")
except Exception as e:
    print(f"❌ DataCollector import failed: {e}")

try:
    from services.model_monitor import ModelMonitor
    print("✅ ModelMonitor imported successfully")
except Exception as e:
    print(f"❌ ModelMonitor import failed: {e}")

try:
    from services.weather_service import weather_service
    print("✅ WeatherService imported successfully")
except Exception as e:
    print(f"❌ WeatherService import failed: {e}")

try:
    from utils.database import DatabaseManager
    print("✅ DatabaseManager imported successfully")
except Exception as e:
    print(f"❌ DatabaseManager import failed: {e}")

try:
    from services.realtime_notifications import RealTimeNotificationService
    print("✅ RealTimeNotificationService imported successfully")
except Exception as e:
    print(f"❌ RealTimeNotificationService import failed: {e}")

try:
    from services.realtime_dashboard import RealTimeDashboardService
    print("✅ RealTimeDashboardService imported successfully")
except Exception as e:
    print(f"❌ RealTimeDashboardService import failed: {e}")

try:
    from services.continuous_ml import ContinuousMLService
    print("✅ ContinuousMLService imported successfully")
except Exception as e:
    print(f"❌ ContinuousMLService import failed: {e}")

print("\nImport test completed!")