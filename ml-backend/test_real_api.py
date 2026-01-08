#!/usr/bin/env python3
"""
Test Real AGMARKNET API Integration
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.agmarknet_client import AGMARKNETClient
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

async def test_real_agmarknet_api():
    """Test the real AGMARKNET API with your key"""
    
    print("🌾 Testing Real AGMARKNET API Integration")
    print("=" * 50)
    
    client = AGMARKNETClient()
    
    # Check if API key is loaded
    if client.api_key:
        print(f"✅ API Key loaded: {client.api_key[:10]}...")
    else:
        print("❌ No API key found!")
        return False
    
    # Test commodities
    test_cases = [
        {"commodity": "wheat", "state": "punjab", "district": "ludhiana"},
        {"commodity": "rice", "state": "west bengal", "district": "kolkata"},
        {"commodity": "onion", "state": "maharashtra", "district": "nashik"}
    ]
    
    print(f"\n🧪 Testing {len(test_cases)} API calls...")
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing {case['commodity']} in {case['state']}...")
        
        try:
            result = await client.get_current_prices(
                case['commodity'], 
                case['state'], 
                case['district']
            )
            
            if result:
                print(f"   ✅ SUCCESS!")
                print(f"   💰 Price: ₹{result['current_price']}/quintal")
                print(f"   📅 Date: {result['market_date']}")
                print(f"   🏪 Source: {result['source']}")
                
                if "Real API" in result['source']:
                    print(f"   🎉 REAL DATA RECEIVED!")
                else:
                    print(f"   ⚠️ Fallback data (API might be down)")
            else:
                print(f"   ❌ No data received")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print(f"\n" + "=" * 50)
    print("🎯 API Integration Test Complete!")
    
    return True

if __name__ == "__main__":
    asyncio.run(test_real_agmarknet_api())