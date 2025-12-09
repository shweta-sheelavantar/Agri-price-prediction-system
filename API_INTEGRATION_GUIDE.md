# AgriFriend API Integration Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [AGMARKNET API Setup](#agmarknet-api-setup)
4. [Environment Configuration](#environment-configuration)
5. [API Modes](#api-modes)
6. [Usage Examples](#usage-examples)
7. [Troubleshooting](#troubleshooting)
8. [Backend Integration](#backend-integration)

---

## 🎯 Overview

AgriFriend integrates with India's official agricultural market data through the **AGMARKNET API** provided by the Ministry of Agriculture via data.gov.in. The system includes:

- ✅ Real-time market price data from 2,900+ mandis
- ✅ 300+ commodities coverage
- ✅ Automatic fallback to mock data
- ✅ Smart caching system
- ✅ Three operation modes (real/mock/hybrid)

---

## 🚀 Getting Started

### Step 1: Get Your API Key

1. Visit [https://data.gov.in/](https://data.gov.in/)
2. Click "Sign Up" (top right)
3. Fill in your details:
   - Name
   - Email
   - Organization (optional)
   - Purpose: "Agricultural Market Data Access"
4. Verify your email
5. Login and go to "My Account" → "API Keys"
6. Copy your API key

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```env
   VITE_DATA_GOV_API_KEY=your_actual_api_key_here
   VITE_API_MODE=hybrid
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

---

## 🌾 AGMARKNET API Setup

### API Endpoint
```
https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
```

### Available Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `commodity` | Crop/commodity name | Wheat, Rice, Onion |
| `state` | Indian state | Punjab, Maharashtra |
| `district` | District name | Ludhiana, Nashik |
| `market` | Market/mandi name | Azadpur, Vashi |
| `arrival_date` | Date of arrival | 2024-01-15 |

### Example API Call

```bash
curl "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=YOUR_KEY&format=json&filters[commodity]=Wheat&filters[state]=Punjab&limit=10"
```

### Response Format

```json
{
  "records": [
    {
      "state": "Punjab",
      "district": "Ludhiana",
      "market": "Ludhiana",
      "commodity": "Wheat",
      "variety": "Lokwan",
      "arrival_date": "15/01/2024",
      "min_price": "2000",
      "max_price": "2200",
      "modal_price": "2100"
    }
  ],
  "total": 1,
  "count": 1,
  "limit": 10,
  "offset": 0
}
```

---

## ⚙️ Environment Configuration

### All Environment Variables

```env
# Required: Your data.gov.in API key
VITE_DATA_GOV_API_KEY=your_api_key_here

# API Mode: 'real', 'mock', or 'hybrid' (recommended)
VITE_API_MODE=hybrid

# AGMARKNET API Base URL (usually don't need to change)
VITE_AGMARKNET_API_URL=https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070

# Enable caching to reduce API calls
VITE_ENABLE_API_CACHE=true

# Cache duration in minutes (default: 30)
VITE_CACHE_DURATION=30

# Enable debug logging for troubleshooting
VITE_DEBUG_API=false
```

### Configuration Tips

**For Development:**
```env
VITE_API_MODE=hybrid
VITE_ENABLE_API_CACHE=true
VITE_CACHE_DURATION=5
VITE_DEBUG_API=true
```

**For Production:**
```env
VITE_API_MODE=hybrid
VITE_ENABLE_API_CACHE=true
VITE_CACHE_DURATION=30
VITE_DEBUG_API=false
```

**For Demo/Testing (No API Key):**
```env
VITE_API_MODE=mock
```

---

## 🔄 API Modes

### 1. Real Mode (`VITE_API_MODE=real`)

- **Uses**: Only real AGMARKNET API
- **Behavior**: Throws errors if API is unavailable
- **Use Case**: Production with guaranteed API access
- **Pros**: Always fresh data
- **Cons**: Fails if API is down

```typescript
// Will throw error if API fails
const prices = await marketPricesAPI.getAll();
```

### 2. Mock Mode (`VITE_API_MODE=mock`)

- **Uses**: Only mock/fake data
- **Behavior**: Never calls real API
- **Use Case**: Development, demos, no API key
- **Pros**: Always works, no API limits
- **Cons**: Not real data

```typescript
// Always returns mock data
const prices = await marketPricesAPI.getAll();
```

### 3. Hybrid Mode (`VITE_API_MODE=hybrid`) ⭐ Recommended

- **Uses**: Real API with automatic fallback to mock
- **Behavior**: 
  1. Tries real API first
  2. Falls back to mock if API fails
  3. Performs health checks
  4. Auto-recovers when API is back
- **Use Case**: Production (best reliability)
- **Pros**: Best of both worlds
- **Cons**: None

```typescript
// Tries real API, falls back to mock if needed
const prices = await marketPricesAPI.getAll();
```

---

## 💻 Usage Examples

### Basic Usage

```typescript
import { marketPricesAPI } from './services/api';

// Get all market prices
const prices = await marketPricesAPI.getAll();

// Filter by commodity
const wheatPrices = await marketPricesAPI.getAll({
  commodity: 'Wheat'
});

// Filter by state
const punjabPrices = await marketPricesAPI.getAll({
  state: 'Punjab'
});

// Multiple filters
const specificPrices = await marketPricesAPI.getAll({
  commodity: 'Onion',
  state: 'Maharashtra',
  location: 'Nashik'
});
```

### Check API Status

```typescript
import { marketPricesAPI } from './services/api';

const status = marketPricesAPI.getStatus();
console.log('API Mode:', status.mode);
console.log('Using Real API:', status.usingRealAPI);
console.log('API Healthy:', status.healthy);
```

### Advanced: Direct Hybrid API Usage

```typescript
import { 
  getMarketPrices, 
  getCommodityPrices,
  getAPIStatus,
  forceHealthCheck 
} from './services/hybridAPI';

// Get prices with specific filters
const prices = await getMarketPrices({
  commodity: 'Rice',
  state: 'West Bengal',
  limit: 50
});

// Get commodity-specific prices
const tomatoPrices = await getCommodityPrices('Tomato', 'Karnataka');

// Check API health
const isHealthy = await forceHealthCheck();
console.log('API is healthy:', isHealthy);

// Get detailed status
const status = getAPIStatus();
console.log(status);
```

### React Component Example

```typescript
import { useEffect, useState } from 'react';
import { marketPricesAPI } from '../services/api';
import { MarketPrice } from '../types';

function PriceList() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<any>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const data = await marketPricesAPI.getAll({
          commodity: 'Wheat',
          limit: 20
        });
        setPrices(data);
        
        // Check if using real or mock data
        const status = marketPricesAPI.getStatus();
        setApiStatus(status);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Show data source indicator */}
      <div className="mb-4 text-sm text-gray-600">
        Data Source: {apiStatus?.usingRealAPI ? '🟢 Live AGMARKNET' : '🟡 Demo Data'}
      </div>

      {/* Display prices */}
      {prices.map(price => (
        <div key={price.id}>
          <h3>{price.commodity}</h3>
          <p>₹{price.price.value} per {price.price.unit}</p>
          <p>{price.market.location}, {price.market.state}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### Issue: "API key not configured"

**Solution:**
1. Check `.env` file exists
2. Verify `VITE_DATA_GOV_API_KEY` is set
3. Restart dev server: `npm run dev`
4. Check browser console for errors

### Issue: "API returns empty data"

**Possible Causes:**
- Invalid filters (commodity/state names)
- No data available for that date
- API rate limit reached

**Solution:**
```typescript
// Try without filters first
const prices = await marketPricesAPI.getAll();

// Check API status
const status = marketPricesAPI.getStatus();
console.log(status);

// Enable debug mode
// In .env: VITE_DEBUG_API=true
```

### Issue: "CORS errors"

**Solution:**
AGMARKNET API supports CORS. If you see CORS errors:
1. Check API key is valid
2. Try from backend proxy (see Backend Integration)
3. Use mock mode for development

### Issue: "Rate limit exceeded"

**Solution:**
1. Enable caching:
   ```env
   VITE_ENABLE_API_CACHE=true
   VITE_CACHE_DURATION=30
   ```
2. Reduce API calls frequency
3. Use hybrid mode (auto-handles rate limits)

### Issue: "Slow API responses"

**Solution:**
1. Enable caching (see above)
2. Reduce `limit` parameter
3. Use specific filters to reduce data size
4. Consider backend caching (see Backend Integration)

---

## 🏗️ Backend Integration

### Why Use a Backend?

While the frontend can call AGMARKNET directly, a backend provides:
- ✅ API key security (not exposed to users)
- ✅ Better caching and rate limiting
- ✅ Data transformation and aggregation
- ✅ Multiple API source integration
- ✅ Analytics and logging

### Recommended Architecture

```
Frontend (React) 
    ↓
Your Backend API (Node.js/Python/Java)
    ↓
AGMARKNET API + Other Data Sources
```

### Node.js Backend Example

```javascript
// backend/routes/market-prices.js
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 1800 }); // 30 min cache

const AGMARKNET_API_KEY = process.env.AGMARKNET_API_KEY;
const AGMARKNET_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

router.get('/prices', async (req, res) => {
  try {
    const { commodity, state, limit = 100 } = req.query;
    
    // Check cache
    const cacheKey = `prices_${commodity}_${state}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ data: cached, source: 'cache' });
    }

    // Call AGMARKNET API
    const response = await axios.get(AGMARKNET_URL, {
      params: {
        'api-key': AGMARKNET_API_KEY,
        format: 'json',
        limit,
        'filters[commodity]': commodity,
        'filters[state]': state,
      },
    });

    const data = response.data.records;
    
    // Cache the result
    cache.set(cacheKey, data);
    
    res.json({ data, source: 'api' });
  } catch (error) {
    console.error('AGMARKNET API Error:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

module.exports = router;
```

### Python/Flask Backend Example

```python
# backend/routes/market_prices.py
from flask import Blueprint, request, jsonify
import requests
from functools import lru_cache
import os

bp = Blueprint('market_prices', __name__)

AGMARKNET_API_KEY = os.getenv('AGMARKNET_API_KEY')
AGMARKNET_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'

@lru_cache(maxsize=100)
def fetch_agmarknet_data(commodity, state, limit):
    """Fetch data from AGMARKNET with caching"""
    params = {
        'api-key': AGMARKNET_API_KEY,
        'format': 'json',
        'limit': limit,
    }
    
    if commodity:
        params['filters[commodity]'] = commodity
    if state:
        params['filters[state]'] = state
    
    response = requests.get(AGMARKNET_URL, params=params)
    response.raise_for_status()
    
    return response.json()['records']

@bp.route('/api/prices', methods=['GET'])
def get_prices():
    try:
        commodity = request.args.get('commodity')
        state = request.args.get('state')
        limit = request.args.get('limit', 100, type=int)
        
        data = fetch_agmarknet_data(commodity, state, limit)
        
        return jsonify({
            'data': data,
            'source': 'agmarknet'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### Frontend Configuration for Backend

```typescript
// src/services/config.ts
export const API_CONFIG = {
  // Use your backend URL instead of direct AGMARKNET
  baseURL: process.env.VITE_BACKEND_URL || 'http://localhost:3001/api',
  timeout: 10000,
};

// src/services/backendAPI.ts
import axios from 'axios';
import { API_CONFIG } from './config';

const api = axios.create(API_CONFIG);

export async function fetchPricesFromBackend(filters: any) {
  const response = await api.get('/prices', { params: filters });
  return response.data.data;
}
```

---

## 📊 API Limits and Best Practices

### Data.gov.in Rate Limits
- **Free Tier**: 1000 requests/day
- **Registered**: 10,000 requests/day
- **Premium**: Contact data.gov.in

### Best Practices

1. **Enable Caching**
   ```env
   VITE_ENABLE_API_CACHE=true
   VITE_CACHE_DURATION=30
   ```

2. **Use Specific Filters**
   ```typescript
   // Good: Specific query
   await getMarketPrices({ commodity: 'Wheat', state: 'Punjab', limit: 20 });
   
   // Avoid: Too broad
   await getMarketPrices({ limit: 1000 });
   ```

3. **Batch Requests**
   ```typescript
   // Instead of multiple calls
   const wheat = await getCommodityPrices('Wheat');
   const rice = await getCommodityPrices('Rice');
   
   // Do one call with broader filter
   const grains = await getMarketPrices({ limit: 100 });
   ```

4. **Handle Errors Gracefully**
   ```typescript
   try {
     const prices = await marketPricesAPI.getAll();
   } catch (error) {
     // Show user-friendly message
     console.error('Failed to load prices');
     // App continues with cached/mock data
   }
   ```

---

## 🎓 Additional Resources

- **AGMARKNET Official**: https://agmarknet.gov.in/
- **Data.gov.in**: https://data.gov.in/
- **API Documentation**: https://data.gov.in/help/api-documentation
- **Support**: support@data.gov.in

---

## 📝 Quick Reference

### Common Commodities
- Wheat, Rice, Maize, Bajra, Jowar
- Onion, Potato, Tomato
- Cotton, Sugarcane, Soybean
- Groundnut, Mustard, Sunflower

### Common States
- Punjab, Haryana, Uttar Pradesh
- Maharashtra, Gujarat, Rajasthan
- Madhya Pradesh, Karnataka, Andhra Pradesh

### Environment Variables Quick Copy
```env
VITE_DATA_GOV_API_KEY=
VITE_API_MODE=hybrid
VITE_ENABLE_API_CACHE=true
VITE_CACHE_DURATION=30
VITE_DEBUG_API=false
```

---

**Need Help?** Check the troubleshooting section or open an issue in the repository.
