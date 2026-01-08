#!/usr/bin/env python3
"""
Simple ML Model Accuracy Test
"""

import requests
import json
import time
from datetime import datetime

def test_models():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing AgriFriend ML Models")
    print("=" * 50)
    
    # Test 1: Price Prediction
    print("\n📊 Testing Price Prediction...")
    try:
        response = requests.post(f"{base_url}/predict/price", json={
            "commodity": "Wheat",
            "state": "Punjab", 
            "district": "Ludhiana",
            "days_ahead": 7
        }, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Price Prediction: SUCCESS")
            print(f"   Accuracy: {data.get('model_accuracy', 0):.1%}")
            print(f"   Confidence: {data.get('confidence', 0):.1%}")
            print(f"   Response Time: {response.elapsed.total_seconds():.2f}s")
        else:
            print(f"❌ Price Prediction: FAILED ({response.status_code})")
    except Exception as e:
        print(f"❌ Price Prediction: ERROR - {str(e)}")
    
    # Test 2: Yield Prediction
    print("\n🌾 Testing Yield Prediction...")
    try:
        response = requests.post(f"{base_url}/predict/yield", json={
            "crop_type": "Wheat",
            "variety": "HD-2967",
            "state": "Punjab",
            "district": "Ludhiana", 
            "soil_type": "loam",
            "irrigation_type": "drip",
            "planting_date": "2024-11-01",
            "area_hectares": 5.0
        }, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Yield Prediction: SUCCESS")
            print(f"   Accuracy: {data.get('model_accuracy', 0):.1%}")
            print(f"   Confidence: {data.get('confidence', 0):.1%}")
            print(f"   Response Time: {response.elapsed.total_seconds():.2f}s")
        else:
            print(f"❌ Yield Prediction: FAILED ({response.status_code})")
    except Exception as e:
        print(f"❌ Yield Prediction: ERROR - {str(e)}")
    
    # Test 3: Risk Assessment
    print("\n⚠️ Testing Risk Assessment...")
    try:
        response = requests.post(f"{base_url}/assess/risk", json={
            "crop_type": "Wheat",
            "state": "Punjab",
            "district": "Ludhiana",
            "current_stage": "vegetative"
        }, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Risk Assessment: SUCCESS")
            print(f"   Accuracy: {data.get('model_accuracy', 0):.1%}")
            print(f"   Response Time: {response.elapsed.total_seconds():.2f}s")
        else:
            print(f"❌ Risk Assessment: FAILED ({response.status_code})")
    except Exception as e:
        print(f"❌ Risk Assessment: ERROR - {str(e)}")
    
    # Test 4: Model Accuracy Endpoint
    print("\n📈 Getting Model Accuracy Metrics...")
    try:
        response = requests.get(f"{base_url}/models/accuracy", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Model Metrics: SUCCESS")
            print(f"   Price Model: {data['price_predictor']['accuracy']:.1%}")
            print(f"   Yield Model: {data['yield_predictor']['accuracy']:.1%}")
            print(f"   Risk Model: {data['risk_assessor']['accuracy']:.1%}")
        else:
            print(f"❌ Model Metrics: FAILED ({response.status_code})")
    except Exception as e:
        print(f"❌ Model Metrics: ERROR - {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Testing Complete!")

if __name__ == "__main__":
    test_models()