#!/usr/bin/env python3
"""
Test Official Government AGMARKNET API
"""

import requests
import json
from datetime import datetime

def test_government_api():
    """Test the real government API with your official key"""
    
    print("🇮🇳 Testing Official Government AGMARKNET API")
    print("=" * 60)
    
    api_key = "579b464db66ec23bdd0000018b6fa4a91b50448363abcccd5f1f13be"
    
    # Official AGMARKNET API endpoint
    url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    
    # Test parameters
    params = {
        'api-key': api_key,
        'format': 'json',
        'limit': 10
    }
    
    print(f"🔑 API Key: {api_key[:15]}...")
    print(f"🌐 Endpoint: {url}")
    print(f"📋 Testing with {params['limit']} records...")
    
    try:
        print(f"\n⏳ Making API request...")
        response = requests.get(url, params=params, timeout=15)
        
        print(f"📡 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"✅ SUCCESS! API is working!")
            print(f"📊 Records received: {len(data.get('records', []))}")
            
            if data.get('records'):
                print(f"\n📋 Sample Agricultural Data:")
                record = data['records'][0]
                
                # Display key fields
                fields_to_show = [
                    'state', 'district', 'market', 'commodity', 
                    'variety', 'arrival_date', 'min_price', 
                    'max_price', 'modal_price'
                ]
                
                for field in fields_to_show:
                    if field in record:
                        print(f"   {field.title()}: {record[field]}")
                
                print(f"\n🎯 This is REAL government agricultural data!")
                print(f"💰 Modal Price: ₹{record.get('modal_price', 'N/A')}/quintal")
                print(f"📅 Date: {record.get('arrival_date', 'N/A')}")
                
                return True
            else:
                print(f"⚠️ No records in response")
                return False
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except requests.exceptions.Timeout:
        print(f"⏰ Request timed out - API might be slow")
        return False
    except requests.exceptions.RequestException as e:
        print(f"🌐 Network error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_specific_commodity():
    """Test API with specific commodity filters"""
    
    print(f"\n" + "=" * 60)
    print(f"🌾 Testing Specific Commodity (Wheat)")
    print("=" * 60)
    
    api_key = "579b464db66ec23bdd0000018b6fa4a91b50448363abcccd5f1f13be"
    url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    
    # Test with wheat filter
    params = {
        'api-key': api_key,
        'format': 'json',
        'limit': 5,
        'filters[commodity]': 'Wheat'
    }
    
    try:
        response = requests.get(url, params=params, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            wheat_records = data.get('records', [])
            
            print(f"🌾 Wheat records found: {len(wheat_records)}")
            
            if wheat_records:
                for i, record in enumerate(wheat_records[:3], 1):
                    print(f"\n   {i}. {record.get('state', 'Unknown')} - {record.get('district', 'Unknown')}")
                    print(f"      Price: ₹{record.get('modal_price', 'N/A')}/quintal")
                    print(f"      Market: {record.get('market', 'Unknown')}")
                    print(f"      Date: {record.get('arrival_date', 'Unknown')}")
                
                return True
            else:
                print(f"⚠️ No wheat records found")
                return False
        else:
            print(f"❌ Wheat query failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing wheat: {str(e)}")
        return False

if __name__ == "__main__":
    print(f"🧪 Government API Testing Suite")
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: General API access
    general_test = test_government_api()
    
    # Test 2: Specific commodity
    wheat_test = test_specific_commodity()
    
    # Summary
    print(f"\n" + "=" * 60)
    print(f"📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"General API Access: {'✅ PASS' if general_test else '❌ FAIL'}")
    print(f"Commodity Filtering: {'✅ PASS' if wheat_test else '❌ FAIL'}")
    
    if general_test and wheat_test:
        print(f"\n🎉 CONGRATULATIONS!")
        print(f"Your government API key is working perfectly!")
        print(f"You now have access to real agricultural data!")
        print(f"\n🚀 Ready for production deployment!")
    elif general_test:
        print(f"\n✅ API is working but filtering needs adjustment")
        print(f"You can proceed with basic functionality")
    else:
        print(f"\n⚠️ API needs troubleshooting")
        print(f"Check network connection and API key validity")