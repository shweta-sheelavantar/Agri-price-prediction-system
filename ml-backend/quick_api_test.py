import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("DATA_GOV_IN_API_KEY")
print(f"API Key: {api_key[:10]}...")

# Test direct API call
url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
params = {
    'api-key': api_key,
    'format': 'json',
    'limit': 5
}

try:
    response = requests.get(url, params=params, timeout=10)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Records found: {len(data.get('records', []))}")
        if data.get('records'):
            record = data['records'][0]
            print(f"Sample record: {record}")
    else:
        print(f"Error response: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")