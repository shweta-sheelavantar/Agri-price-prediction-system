"""
Fetch today's AGMARKNET data
"""

import requests
import json
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def fetch_agmarknet_data():
    """Fetch real AGMARKNET data from data.gov.in"""
    
    api_key = os.getenv("DATA_GOV_IN_API_KEY")
    
    if not api_key:
        print("ERROR: No API key found. Set DATA_GOV_IN_API_KEY in .env")
        return None
    
    print(f"Using API key: {api_key[:10]}...")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    # AGMARKNET API endpoint
    url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    
    params = {
        'api-key': api_key,
        'format': 'json',
        'limit': 500  # Fetch more records
    }
    
    try:
        print("Fetching data from AGMARKNET API...")
        response = requests.get(url, params=params, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\nAPI Response Info:")
            print(f"  Total Records: {data.get('total', 'N/A')}")
            print(f"  Records Fetched: {len(data.get('records', []))}")
            print(f"  Updated: {data.get('updated', 'N/A')}")
            
            records = data.get('records', [])
            
            if records:
                print(f"\n{'='*60}")
                print("SAMPLE RECORDS (First 10):")
                print("="*60)
                
                for i, record in enumerate(records[:10]):
                    print(f"\n[{i+1}] {record.get('commodity', 'N/A')}")
                    print(f"    State: {record.get('state', 'N/A')}")
                    print(f"    District: {record.get('district', 'N/A')}")
                    print(f"    Market: {record.get('market', 'N/A')}")
                    print(f"    Variety: {record.get('variety', 'N/A')}")
                    print(f"    Min Price: ₹{record.get('min_price', 'N/A')}")
                    print(f"    Max Price: ₹{record.get('max_price', 'N/A')}")
                    print(f"    Modal Price: ₹{record.get('modal_price', 'N/A')}")
                    print(f"    Arrival Date: {record.get('arrival_date', 'N/A')}")
                
                # Get unique commodities
                commodities = set(r.get('commodity', '') for r in records)
                states = set(r.get('state', '') for r in records)
                
                print(f"\n{'='*60}")
                print("DATA SUMMARY:")
                print("="*60)
                print(f"Unique Commodities ({len(commodities)}): {', '.join(sorted(commodities)[:15])}...")
                print(f"Unique States ({len(states)}): {', '.join(sorted(states))}")
                
                # Save to CSV
                import csv
                filename = f"data/collected/agmarknet_{datetime.now().strftime('%Y-%m-%d')}.csv"
                os.makedirs("data/collected", exist_ok=True)
                
                with open(filename, 'w', newline='', encoding='utf-8') as f:
                    if records:
                        writer = csv.DictWriter(f, fieldnames=records[0].keys())
                        writer.writeheader()
                        writer.writerows(records)
                
                print(f"\nData saved to: {filename}")
                
                return data
            else:
                print("No records found in response")
                return None
        else:
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

if __name__ == "__main__":
    fetch_agmarknet_data()
