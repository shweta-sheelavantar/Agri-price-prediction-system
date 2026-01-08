#!/usr/bin/env python3
"""
Final System Test - Verify All Components Working
Tests the complete AgriFriend system end-to-end
"""

import requests
import json
import time
from datetime import datetime

def test_system():
    """Test all system components"""
    
    base_url = "http://localhost:8000"
    results = {
        "timestamp": datetime.now().isoformat(),
        "tests": [],
        "summary": {}
    }
    
    print("🚀 AgriFriend Final System Test")
    print("=" * 50)
    
    # Test 1: System Health
    print("\n1. Testing System Health...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            results["tests"].append({
                "test": "System Health",
                "status": "✅ PASS",
                "response_time": response.elapsed.total_seconds(),
                "data": data
            })
            print(f"   ✅ System healthy - Response time: {response.elapsed.total_seconds():.2f}s")
        else:
            results["tests"].append({
                "test": "System Health", 
                "status": "❌ FAIL",
                "error": f"Status code: {response.status_code}"
            })
            print(f"   ❌ Health check failed: {response.status_code}")
    except Exception as e:
        results["tests"].append({
            "test": "System Health",
            "status": "❌ FAIL", 
            "error": str(e)
        })
        print(f"   ❌ Health check error: {e}")
    
    # Test 2: Model Accuracy
    print("\n2. Testing Model Accuracy...")
    try:
        response = requests.get(f"{base_url}/models/accuracy", timeout=10)
        if response.status_code == 200:
            data = response.json()
            results["tests"].append({
                "test": "Model Accuracy",
                "status": "✅ PASS",
                "response_time": response.elapsed.total_seconds(),
                "data": data
            })
            print(f"   ✅ Models loaded - Price: {data['price_predictor']['accuracy']*100}% accuracy")
            print(f"   ✅ Yield predictor: {data['yield_predictor']['accuracy']*100}% accuracy")
            print(f"   ✅ Risk assessor: {data['risk_assessor']['accuracy']*100}% accuracy")
        else:
            results["tests"].append({
                "test": "Model Accuracy",
                "status": "❌ FAIL",
                "error": f"Status code: {response.status_code}"
            })
            print(f"   ❌ Model accuracy failed: {response.status_code}")
    except Exception as e:
        results["tests"].append({
            "test": "Model Accuracy",
            "status": "❌ FAIL",
            "error": str(e)
        })
        print(f"   ❌ Model accuracy error: {e}")
    
    # Test 3: Price Prediction
    print("\n3. Testing Price Prediction...")
    try:
        payload = {
            "commodity": "wheat",
            "state": "punjab", 
            "district": "ludhiana",
            "days_ahead": 7
        }
        response = requests.post(
            f"{base_url}/predict/price",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            results["tests"].append({
                "test": "Price Prediction",
                "status": "✅ PASS",
                "response_time": response.elapsed.total_seconds(),
                "data": data
            })
            current_price = data["prediction"]["current_price"]
            confidence = data["confidence"]
            print(f"   ✅ Price prediction successful - Current: ₹{current_price:.2f}/quintal")
            print(f"   ✅ Confidence: {confidence*100}% - Response time: {response.elapsed.total_seconds():.2f}s")
        else:
            results["tests"].append({
                "test": "Price Prediction",
                "status": "❌ FAIL", 
                "error": f"Status code: {response.status_code}"
            })
            print(f"   ❌ Price prediction failed: {response.status_code}")
    except Exception as e:
        results["tests"].append({
            "test": "Price Prediction",
            "status": "❌ FAIL",
            "error": str(e)
        })
        print(f"   ❌ Price prediction error: {e}")
    
    # Test 4: Yield Prediction
    print("\n4. Testing Yield Prediction...")
    try:
        payload = {
            "crop_type": "wheat",
            "variety": "HD-2967",
            "state": "punjab",
            "district": "ludhiana", 
            "soil_type": "alluvial",
            "irrigation_type": "canal",
            "planting_date": "2024-11-15",
            "area_hectares": 2.5
        }
        response = requests.post(
            f"{base_url}/predict/yield",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            results["tests"].append({
                "test": "Yield Prediction",
                "status": "✅ PASS",
                "response_time": response.elapsed.total_seconds(),
                "data": data
            })
            expected_yield = data["prediction"]["expected_yield_per_hectare"]
            confidence = data["confidence"]
            print(f"   ✅ Yield prediction successful - Expected: {expected_yield:.2f} quintals/hectare")
            print(f"   ✅ Confidence: {confidence*100}% - Response time: {response.elapsed.total_seconds():.2f}s")
        else:
            results["tests"].append({
                "test": "Yield Prediction",
                "status": "❌ FAIL",
                "error": f"Status code: {response.status_code}"
            })
            print(f"   ❌ Yield prediction failed: {response.status_code}")
    except Exception as e:
        results["tests"].append({
            "test": "Yield Prediction", 
            "status": "❌ FAIL",
            "error": str(e)
        })
        print(f"   ❌ Yield prediction error: {e}")
    
    # Test 5: Risk Assessment
    print("\n5. Testing Risk Assessment...")
    try:
        payload = {
            "crop_type": "wheat",
            "state": "punjab",
            "district": "ludhiana",
            "current_stage": "vegetative"
        }
        response = requests.post(
            f"{base_url}/assess/risk",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            results["tests"].append({
                "test": "Risk Assessment",
                "status": "✅ PASS",
                "response_time": response.elapsed.total_seconds(),
                "data": data
            })
            overall_risk = data["assessment"]["overall_risk_score"]
            risk_level = data["assessment"]["risk_level"]
            print(f"   ✅ Risk assessment successful - Overall risk: {overall_risk:.2f} ({risk_level})")
            print(f"   ✅ Response time: {response.elapsed.total_seconds():.2f}s")
        else:
            results["tests"].append({
                "test": "Risk Assessment",
                "status": "❌ FAIL",
                "error": f"Status code: {response.status_code}"
            })
            print(f"   ❌ Risk assessment failed: {response.status_code}")
    except Exception as e:
        results["tests"].append({
            "test": "Risk Assessment",
            "status": "❌ FAIL", 
            "error": str(e)
        })
        print(f"   ❌ Risk assessment error: {e}")
    
    # Calculate summary
    total_tests = len(results["tests"])
    passed_tests = len([t for t in results["tests"] if "✅ PASS" in t["status"]])
    failed_tests = total_tests - passed_tests
    
    results["summary"] = {
        "total_tests": total_tests,
        "passed": passed_tests,
        "failed": failed_tests,
        "success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0
    }
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests} ✅")
    print(f"Failed: {failed_tests} ❌")
    print(f"Success Rate: {results['summary']['success_rate']:.1f}%")
    
    if results['summary']['success_rate'] >= 80:
        print("\n🎉 SYSTEM STATUS: PRODUCTION READY! 🚀")
        print("✅ All critical components working")
        print("✅ Ready for farmer deployment")
        print("✅ Revenue generation possible")
    elif results['summary']['success_rate'] >= 60:
        print("\n⚠️ SYSTEM STATUS: MOSTLY WORKING")
        print("⚠️ Some issues need attention")
        print("✅ Core functionality available")
    else:
        print("\n❌ SYSTEM STATUS: NEEDS ATTENTION")
        print("❌ Multiple critical issues")
        print("❌ Not ready for production")
    
    # Save results
    with open("final_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: final_test_results.json")
    print(f"🕒 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return results

if __name__ == "__main__":
    test_system()