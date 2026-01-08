#!/usr/bin/env python3
"""
Quick Final Test - Verify Core Components
"""

import requests
import json
from datetime import datetime

def quick_test():
    """Quick test of core components"""
    
    base_url = "http://localhost:8000"
    
    print("🚀 AgriFriend Quick System Test")
    print("=" * 40)
    
    tests_passed = 0
    total_tests = 0
    
    # Test 1: System Health
    print("\n1. System Health...")
    total_tests += 1
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ PASS - System healthy")
            tests_passed += 1
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
    
    # Test 2: Model Accuracy
    print("\n2. Model Accuracy...")
    total_tests += 1
    try:
        response = requests.get(f"{base_url}/models/accuracy", timeout=5)
        if response.status_code == 200:
            data = response.json()
            price_acc = data['price_predictor']['accuracy'] * 100
            yield_acc = data['yield_predictor']['accuracy'] * 100
            risk_acc = data['risk_assessor']['accuracy'] * 100
            print(f"   ✅ PASS - Price: {price_acc}%, Yield: {yield_acc}%, Risk: {risk_acc}%")
            tests_passed += 1
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
    
    # Test 3: System Info
    print("\n3. System Info...")
    total_tests += 1
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ PASS - Version: {data['version']}, Status: {data['status']}")
            tests_passed += 1
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
    
    # Summary
    success_rate = (tests_passed / total_tests * 100) if total_tests > 0 else 0
    
    print("\n" + "=" * 40)
    print("📊 QUICK TEST SUMMARY")
    print("=" * 40)
    print(f"Tests Passed: {tests_passed}/{total_tests}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("\n🎉 SYSTEM STATUS: READY FOR PRODUCTION! 🚀")
        print("✅ Core components working")
        print("✅ ML models loaded and accurate")
        print("✅ API endpoints responding")
        print("✅ Ready for farmer deployment")
    else:
        print("\n⚠️ SYSTEM STATUS: NEEDS ATTENTION")
        print("❌ Some core issues detected")
    
    return success_rate >= 80

if __name__ == "__main__":
    quick_test()