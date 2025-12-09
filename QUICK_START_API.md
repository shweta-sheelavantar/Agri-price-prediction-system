# 🚀 Quick Start: AGMARKNET API Integration

Get real Indian agricultural market data in 5 minutes!

## Step 1: Get API Key (2 minutes)

1. Go to https://data.gov.in/
2. Click "Sign Up" → Fill form → Verify email
3. Login → "My Account" → "API Keys" → Copy key

## Step 2: Configure (1 minute)

```bash
# Copy environment file
cp .env.example .env

# Edit .env and paste your API key
VITE_DATA_GOV_API_KEY=paste_your_key_here
```

## Step 3: Restart Server (30 seconds)

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

## Step 4: Test (30 seconds)

Open browser console and run:

```javascript
// Check API status
const status = await marketPricesAPI.getStatus();
console.log('Using Real API:', status.usingRealAPI);

// Fetch real data
const prices = await marketPricesAPI.getAll({ commodity: 'Wheat' });
console.log('Prices:', prices);
```

## ✅ Done!

You're now using real AGMARKNET data! 

### What Happens Now?

- ✅ Real market prices from 2,900+ mandis
- ✅ Automatic fallback to mock data if API fails
- ✅ Smart caching (reduces API calls)
- ✅ 30-minute cache duration

### See It Working

Look for this indicator in your app:
- 🟢 **Live AGMARKNET** = Real data
- 🟡 **Demo Data** = Mock data (fallback)

---

## 🎯 API Modes

### Current Mode: Hybrid (Recommended)

```env
VITE_API_MODE=hybrid  # ← Best for production
```

**How it works:**
1. Tries real AGMARKNET API first
2. Falls back to mock data if API fails
3. Auto-recovers when API is back

### Other Modes

```env
# Only real API (fails if unavailable)
VITE_API_MODE=real

# Only mock data (no API calls)
VITE_API_MODE=mock
```

---

## 🔍 Troubleshooting

### Not seeing real data?

1. **Check API key is set:**
   ```bash
   cat .env | grep VITE_DATA_GOV_API_KEY
   ```

2. **Enable debug mode:**
   ```env
   VITE_DEBUG_API=true
   ```

3. **Check browser console** for errors

4. **Verify API key works:**
   ```bash
   curl "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=YOUR_KEY&format=json&limit=1"
   ```

### Still having issues?

See full documentation: [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)

---

## 📚 Next Steps

- Read [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) for advanced usage
- Configure caching and rate limits
- Set up backend proxy (recommended for production)
- Explore other data.gov.in datasets

---

**Questions?** Check the [API Integration Guide](./API_INTEGRATION_GUIDE.md) or open an issue.
