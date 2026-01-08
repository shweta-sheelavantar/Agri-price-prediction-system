# 🧪 15-Day Forecast Testing Guide

## 🎯 **How to Test the Enhanced Forecast System**

### **Step 1: Access Market Prices**
1. Go to `/market-prices` page
2. You should see the "🔮 AI Price Prediction Center" section at the top

### **Step 2: Quick Test with Presets**
Click any of these preset buttons for instant testing:
- **🧅 Onion - Maharashtra (High Volatility)** - Shows dramatic price swings
- **🌾 Wheat - Punjab (Stable)** - Shows steady, predictable patterns  
- **🍚 Rice - West Bengal (Export Focus)** - Shows export-driven factors
- **🍅 Tomato - Karnataka (Seasonal)** - Shows seasonal variations

### **Step 3: Generate Custom Forecast**
1. **Select Your Crop**: Choose from dropdown (Wheat, Rice, Cotton, Onion, etc.)
2. **Select Market**: Choose state (Punjab, Maharashtra, Gujarat, etc.)
3. **Click "Generate AI Forecast"** (button will be enabled when both are selected)

### **Step 4: Review Detailed Analysis**
The forecast modal will show:

#### **📊 Key Insights & Recommendations:**
- Current price vs 15-day average
- Expected price range and volatility
- Best selling days (specific days with highest prices)
- Days to avoid selling (lowest expected prices)
- Maximum profit potential per quintal

#### **📈 Interactive Chart:**
- 15-day price prediction line chart
- Hover over points to see specific predictions
- Visual trend indicators

#### **📋 Detailed Day-by-Day Table:**
- Specific date and predicted price
- Confidence level (95% → 60% over 15 days)
- Trend indicator (Bullish 📈, Bearish 📉, Stable ➡️)
- Market factors affecting each day

#### **⚠️ Risk Assessment:**
- **Price Volatility Risk**: HIGH/MEDIUM/LOW
- **Market Sentiment**: BULLISH/BEARISH/NEUTRAL
- **Prediction Confidence**: Overall accuracy percentage

## 🔍 **What to Look For:**

### **Onion - Maharashtra Example:**
```
Current Price: ₹2,840/quintal
15-Day Average: ₹3,156/quintal (+11%)
Best Selling: Day 3, Day 7, Day 12
Avoid Selling: Day 9, Day 14
Profit Potential: ₹580 per quintal
Risk Level: HIGH (27% volatility)

Market Factors:
• Export ban speculation
• Storage losses due to rain
• Festival season demand
```

### **Wheat - Punjab Example:**
```
Current Price: ₹2,500/quintal
15-Day Average: ₹2,563/quintal (+3%)
Best Selling: Day 8, Day 11, Day 15
Avoid Selling: Day 4, Day 6
Profit Potential: ₹150 per quintal
Risk Level: MEDIUM (9% volatility)

Market Factors:
• Export demand from Middle East
• Government procurement increase
• Normal sowing progress
```

## 🐛 **Troubleshooting:**

### **If Forecast Section Not Loading:**
1. **Check Console**: Open browser console (F12) for error messages
2. **Verify Page Load**: Ensure MarketPrices page loads completely
3. **Check Network**: Look for any API call failures
4. **Try Preset Buttons**: Use the colored preset buttons for quick testing

### **If Generate Button Disabled:**
- Make sure both crop and market are selected
- Button text should change from "Select Crop & Market" to "Generate AI Forecast"

### **If Modal Not Opening:**
- Check console for JavaScript errors
- Verify that forecast data is being generated
- Try different crop/market combinations

## 📱 **Mobile Testing:**
- All features work on mobile devices
- Responsive design adapts to smaller screens
- Touch-friendly buttons and interactions

---

**The forecast system should now provide detailed, actionable predictions with specific market intelligence for each crop/market combination!**