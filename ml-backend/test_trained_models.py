"""
Test all trained XGBoost models
"""
import requests
import json

BASE_URL = "http://localhost:8000"

commodities = [
    "Wheat", "Rice", "Soyabean", "Cotton", "Onion", "Tomato",
    "Potato", "Maize", "Groundnut", "Green Gram", "Bengal Gram",
    "Lentil", "Mustard", "Chilli", "Garlic", "Cabbage"
]

print("=" * 70)
print("TESTING TRAINED XGBOOST MODELS")
print("=" * 70)

successful = 0
failed = 0

for commodity in commodities:
    try:
        response = requests.post(
            f"{BASE_URL}/predict/price",
            json={
                "commodity": commodity,
                "state": "Maharashtra",
                "district": "Pune",
                "days_ahead": 7
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            pred = data.get('prediction', {})
            model_type = pred.get('model_type', 'Unknown')
            accuracy = pred.get('model_accuracy', 0)
            current_price = pred.get('current_price', 0)
            
            print(f"✅ {commodity:15} | Model: {model_type:8} | Accuracy: {accuracy:5.1f}% | Price: ₹{current_price:,.0f}")
            successful += 1
        else:
            print(f"❌ {commodity:15} | Error: {response.status_code}")
            failed += 1
            
    except Exception as e:
        print(f"❌ {commodity:15} | Error: {str(e)[:40]}")
        failed += 1

print("=" * 70)
print(f"Results: {successful} successful, {failed} failed")
print("=" * 70)

# Test model accuracy endpoint
print("\nModel Accuracy Summary:")
try:
    response = requests.get(f"{BASE_URL}/models/accuracy", timeout=5)
    if response.status_code == 200:
        data = response.json()
        pp = data.get('price_predictor', {})
        print(f"  Price Predictor:")
        print(f"    - Accuracy: {pp.get('accuracy', 0)*100:.1f}%")
        print(f"    - MAE: ₹{pp.get('mae', 0):.2f}")
        print(f"    - Last Updated: {pp.get('last_updated', 'N/A')}")
        print(f"    - Predictions Made: {pp.get('predictions_made', 0)}")
except Exception as e:
    print(f"  Error: {e}")
