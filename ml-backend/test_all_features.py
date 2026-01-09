"""
Comprehensive test of all ML backend features
Tests: Price Prediction, Risk Assessment, Market Prices, Yield Prediction
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("1. HEALTH CHECK")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        data = response.json()
        print(f"✅ Status: {data['status']}")
        print(f"   Models loaded: {data['models_loaded']}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_market_prices():
    """Test market prices endpoint"""
    print("\n" + "="*60)
    print("2. MARKET PRICES (Real AGMARKNET Data)")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/market/prices?limit=5", timeout=10)
        data = response.json()
        print(f"✅ Source: {data.get('source', 'Unknown')}")
        print(f"   Records: {data.get('count', 0)}")
        
        if data.get('records'):
            for i, record in enumerate(data['records'][:3]):
                print(f"   {i+1}. {record['commodity']} - ₹{record['price']['value']}/{record['price']['unit']} ({record['market']['state']})")
        return True
    except Exception as e:
        print(f"❌ Market prices failed: {e}")
        return False

def test_price_prediction():
    """Test price prediction with trained XGBoost model"""
    print("\n" + "="*60)
    print("3. PRICE PREDICTION (XGBoost Model)")
    print("="*60)
    
    commodities = ["Wheat", "Rice", "Onion", "Cotton"]
    
    for commodity in commodities:
        try:
            response = requests.post(
                f"{BASE_URL}/predict/price",
                json={
                    "commodity": commodity,
                    "state": "Punjab",
                    "district": "Ludhiana",
                    "days_ahead": 7
                },
                timeout=10
            )
            data = response.json()
            pred = data.get('prediction', {})
            
            print(f"\n   {commodity}:")
            print(f"   ✅ Model: {pred.get('model_type', 'Unknown')}")
            print(f"   ✅ Accuracy: {pred.get('model_accuracy', 0):.1f}%")
            print(f"   ✅ Current Price: ₹{pred.get('current_price', 0):,.0f}")
            print(f"   ✅ Trend: {pred.get('trend', 'Unknown')}")
            
            if pred.get('predictions'):
                first = pred['predictions'][0]
                last = pred['predictions'][-1]
                print(f"   ✅ 7-day forecast: ₹{first['predicted_price']:,.0f} → ₹{last['predicted_price']:,.0f}")
                
        except Exception as e:
            print(f"   ❌ {commodity} prediction failed: {e}")
    
    return True

def test_risk_assessment():
    """Test risk assessment endpoint"""
    print("\n" + "="*60)
    print("4. RISK ASSESSMENT")
    print("="*60)
    try:
        response = requests.post(
            f"{BASE_URL}/assess/risk",
            json={
                "crop_type": "Wheat",
                "state": "Punjab",
                "district": "Ludhiana",
                "current_stage": "vegetative"
            },
            timeout=10
        )
        data = response.json()
        assessment = data.get('assessment', {})
        
        print(f"✅ Overall Risk Score: {assessment.get('overall_risk_score', 0):.2f}")
        print(f"   Risk Level: {assessment.get('risk_level', 'Unknown')}")
        print(f"   Confidence: {assessment.get('confidence', 0)*100:.0f}%")
        
        risks = assessment.get('risk_categories', {})
        if risks:
            print(f"\n   Risk Categories:")
            for category, details in risks.items():
                if isinstance(details, dict):
                    print(f"   - {category}: {details.get('level', 'N/A')} ({details.get('score', 0):.2f})")
        
        recommendations = assessment.get('recommendations', [])
        if recommendations:
            print(f"\n   Recommendations:")
            for rec in recommendations[:3]:
                print(f"   • {rec}")
        
        return True
    except Exception as e:
        print(f"❌ Risk assessment failed: {e}")
        return False

def test_yield_prediction():
    """Test yield prediction endpoint"""
    print("\n" + "="*60)
    print("5. YIELD PREDICTION")
    print("="*60)
    try:
        response = requests.post(
            f"{BASE_URL}/predict/yield",
            json={
                "crop_type": "Wheat",
                "variety": "HD-2967",
                "state": "Punjab",
                "district": "Ludhiana",
                "soil_type": "Alluvial",
                "irrigation_type": "Canal",
                "planting_date": "2025-11-15",
                "area_hectares": 5.0
            },
            timeout=10
        )
        data = response.json()
        pred = data.get('prediction', {})
        
        print(f"✅ Expected Yield: {pred.get('expected_yield', 0):.1f} quintals/hectare")
        print(f"   Total Production: {pred.get('total_production', 0):.1f} quintals")
        print(f"   Confidence: {pred.get('confidence', 0)*100:.0f}%")
        print(f"   Harvest Date: {pred.get('expected_harvest_date', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"❌ Yield prediction failed: {e}")
        return False

def test_model_accuracy():
    """Test model accuracy endpoint"""
    print("\n" + "="*60)
    print("6. MODEL ACCURACY METRICS")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/models/accuracy", timeout=5)
        data = response.json()
        
        for model_name, metrics in data.items():
            print(f"\n   {model_name}:")
            print(f"   - Accuracy: {metrics.get('accuracy', 0)*100:.1f}%")
            print(f"   - MAE: ₹{metrics.get('mae', 0):.2f}")
            print(f"   - Last Updated: {metrics.get('last_updated', 'N/A')}")
            print(f"   - Predictions Made: {metrics.get('predictions_made', 0)}")
        
        return True
    except Exception as e:
        print(f"❌ Model accuracy check failed: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("AGRIFRIEND ML BACKEND - COMPREHENSIVE TEST")
    print("="*60)
    
    results = {
        "Health Check": test_health(),
        "Market Prices": test_market_prices(),
        "Price Prediction": test_price_prediction(),
        "Risk Assessment": test_risk_assessment(),
        "Yield Prediction": test_yield_prediction(),
        "Model Accuracy": test_model_accuracy(),
    }
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    print(f"\n   Total: {passed}/{total} tests passed")
    print("="*60)

if __name__ == "__main__":
    main()
