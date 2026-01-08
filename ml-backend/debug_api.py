#!/usr/bin/env python3
"""
Debug AGMARKNET API calls to understand the issue
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_api_direct():
    """Test the API directly to see what's happening"""
    
    api_key = os.getenv("DATA_GOV_IN_API_KEY")
    print(f"🔑 API Key: {api_key[:10]}..." if api_key else "❌ No API Key")
    
    # Test the actual API endpoint
    url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    
    # Try different parameter combinations
    test_cases = [
        # Basic test - no filters
        {
            'api-key': api_key,
            'format': 'json',
            'limit': 5
        },
        # Test with commodity filter
        {
            'api-key': api_key,
            'format': 'json',
            'limit': 5,
            'filters[commodity]': 'wheat'
        },
        # Test with state filter
        {
            'api-key': api_key,
            'format': 'json', 
            'limit': 5,
            'filters[state]': 'punjab'
        },
        # Test with both filters
        {
            'api-key': api_key,
            'format': 'json',
            'limit': 5,
            'filters[commodity]': 'wheat',
            'filters[state]': 'punjab'
        }
    ]
    
    for i, params in enumerate(test_cases, 1):
        print(f"\n🧪 Test Case {i}: {params}")
        print("-" * 50)
        
        try:
            response = requests.get(url, params=params, timeout=15)
            print(f"📊 Status Code: {response.status_code}")
            print(f"🌐 URL: {response.url}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"📦 Response Keys: {list(data.keys())}")
                
                if 'records' in data:
                    print(f"📋 Records Count: {len(data['records'])}")
                    if data['records']:
                        print("📄 First Record:")
                        first_record = data['records'][0]
                        for key, value in first_record.items():
                            print(f"   {key}: {value}")
                    else:
                        print("⚠️ No records found")
                else:
                    print("❌ No 'records' key in response")
                    print(f"📄 Full Response: {json.dumps(data, indent=2)}")
            else:
                print(f"❌ Error Response: {response.text}")
                
        except Exception as e:
            print(f"💥 Exception: {str(e)}")

def test_alternative_endpoints():
    """Test alternative data.gov.in endpoints"""
    
    api_key = os.getenv("DATA_GOV_IN_API_KEY")
    
    # Alternative endpoints to try
    endpoints = [
        "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",  # Current
        "https://api.data.gov.in/catalog/9ef84268-d588-465a-a308-a864a43d0070",   # Catalog
        "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24",  # Alternative ID
    ]
    
    for endpoint in endpoints:
        print(f"\n🔗 Testing endpoint: {endpoint}")
        print("-" * 60)
        
        try:
            params = {
                'api-key': api_key,
                'format': 'json',
                'limit': 1
            }
            
            response = requests.get(endpoint, params=params, timeout=10)
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! Keys: {list(data.keys())}")
                if 'records' in data and data['records']:
                    print(f"📋 Found {len(data['records'])} records")
                    print(f"📄 Sample fields: {list(data['records'][0].keys())}")
            else:
                print(f"❌ Failed: {response.text[:200]}")
                
        except Exception as e:
            print(f"💥 Error: {str(e)}")

if __name__ == "__main__":
    print("🔍 AGMARKNET API Debug Tool")
    print("=" * 50)
    
    test_api_direct()
    
    print("\n" + "=" * 50)
    print("🔄 Testing Alternative Endpoints")
    
    test_alternative_endpoints()