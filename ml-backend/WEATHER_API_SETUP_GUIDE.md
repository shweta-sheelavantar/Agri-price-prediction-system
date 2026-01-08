# 🌦️ Weather API Setup Guide

**Time Required:** 2 minutes  
**Cost:** FREE (60,000 calls/month)

---

## 🚀 **STEP-BY-STEP GUIDE**

### **Step 1: Visit OpenWeatherMap (30 seconds)**

1. Go to: **https://openweathermap.org/api**
2. Click **"Sign Up"** (top right corner)
3. Or click **"Get API Key"** button

### **Step 2: Create Free Account (1 minute)**

**Fill out the form:**
- **Username:** Your choice (e.g., agrifriend_user)
- **Email:** Your email address
- **Password:** Create a strong password
- **Company:** AgriFriend (or your company name)
- **Purpose:** Agricultural weather monitoring
- **Country:** India

**Click "Create Account"**

### **Step 3: Verify Email (30 seconds)**

1. Check your email inbox
2. Click the verification link from OpenWeatherMap
3. This activates your account

### **Step 4: Get Your API Key (30 seconds)**

1. **Login** to your OpenWeatherMap account
2. Go to **"API Keys"** tab (in your dashboard)
3. **Copy your API key** (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

---

## 🔧 **ADD API KEY TO YOUR PROJECT**

### **Method 1: Add to .env file (Recommended)**

```bash
# Navigate to your backend folder
cd agrifriend/ml-backend

# Add the API key to your .env file
echo "OPENWEATHER_API_KEY=your_actual_api_key_here" >> .env
```

**Example:**
```bash
echo "OPENWEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" >> .env
```

### **Method 2: Edit .env file manually**

Open `agrifriend/ml-backend/.env` and add:
```
OPENWEATHER_API_KEY=your_actual_api_key_here
```

---

## ✅ **TEST YOUR API KEY**

Create a simple test script:

```python
# test_weather_api.py
import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENWEATHER_API_KEY")
city = "Ludhiana"
url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"

response = requests.get(url)
if response.status_code == 200:
    data = response.json()
    print(f"✅ Weather API working!")
    print(f"🌡️ Temperature in {city}: {data['main']['temp']}°C")
    print(f"🌤️ Weather: {data['weather'][0]['description']}")
    print(f"💧 Humidity: {data['main']['humidity']}%")
else:
    print(f"❌ API Error: {response.status_code}")
    print(f"Response: {response.text}")
```

**Run the test:**
```bash
cd agrifriend/ml-backend
python test_weather_api.py
```

---

## 📊 **WHAT YOU GET FOR FREE**

### **Free Tier Limits:**
- ✅ **60,000 API calls/month** (2,000 per day)
- ✅ **Current weather data**
- ✅ **5-day weather forecast**
- ✅ **Historical weather data**
- ✅ **Weather alerts**

### **Perfect for AgriFriend:**
- **Real-time weather monitoring** for all major agricultural regions
- **Weather alerts** for temperature, rainfall, humidity
- **Forecast data** for farming decisions
- **Historical data** for trend analysis

---

## 🌍 **WEATHER DATA FOR INDIAN AGRICULTURE**

### **Major Agricultural Cities Covered:**
- **Punjab:** Ludhiana, Amritsar, Jalandhar
- **Haryana:** Karnal, Hisar, Panipat
- **Uttar Pradesh:** Meerut, Agra, Kanpur
- **Maharashtra:** Nashik, Pune, Aurangabad
- **Gujarat:** Rajkot, Ahmedabad, Surat

### **Weather Parameters Available:**
- 🌡️ **Temperature** (current, min, max)
- 💧 **Humidity** (percentage)
- 🌧️ **Rainfall** (mm)
- 💨 **Wind Speed** (km/h)
- ☁️ **Cloud Cover** (percentage)
- 🌅 **Sunrise/Sunset** times

---

## 🚨 **WEATHER ALERTS FOR FARMERS**

Once integrated, your system will automatically send alerts for:

### **Temperature Alerts:**
- 🔥 **High Temperature:** > 40°C (heat wave warning)
- 🧊 **Low Temperature:** < 5°C (frost warning)

### **Rainfall Alerts:**
- 🌧️ **Heavy Rain:** > 50mm (flooding risk)
- ☔ **Continuous Rain:** > 3 days (disease risk)

### **Wind Alerts:**
- 💨 **Strong Wind:** > 25 km/h (crop damage risk)

### **Humidity Alerts:**
- 💧 **High Humidity:** > 90% (fungal disease risk)

---

## 🔄 **INTEGRATION STATUS**

### **Already Integrated In:**
- ✅ `services/realtime_notifications.py` - Weather alert system
- ✅ `services/data_collector.py` - Weather data collection
- ✅ `services/continuous_ml.py` - Weather-based risk updates

### **What Happens When You Add API Key:**
1. **Real weather monitoring starts** for major agricultural regions
2. **Weather alerts activate** based on farming thresholds
3. **Risk assessments improve** with real weather data
4. **Seasonal recommendations** become weather-aware

---

## 💰 **BUSINESS VALUE**

### **For Farmers:**
- **Crop Protection:** Early warnings prevent weather damage
- **Irrigation Planning:** Rainfall forecasts optimize water usage
- **Disease Prevention:** Humidity alerts prevent fungal issues
- **Harvest Timing:** Weather forecasts optimize harvest schedules

### **For Your Business:**
- **Premium Feature:** Weather alerts justify ₹299/month subscription
- **User Engagement:** Critical alerts keep farmers active
- **Competitive Advantage:** Real weather vs competitors' basic data
- **Professional Image:** Enterprise-grade weather integration

---

## 🎯 **QUICK START CHECKLIST**

- [ ] **Visit:** https://openweathermap.org/api
- [ ] **Sign up** for free account
- [ ] **Verify email** from OpenWeatherMap
- [ ] **Copy API key** from dashboard
- [ ] **Add to .env file:** `OPENWEATHER_API_KEY=your_key`
- [ ] **Test API key** with test script
- [ ] **Restart backend:** `python main.py`
- [ ] **Check logs** for weather monitoring messages

---

## 🚀 **RESULT**

**After adding the Weather API key, your AgriFriend platform will have:**

✅ **Real weather alerts** for temperature, rainfall, humidity  
✅ **Live weather monitoring** for all major agricultural regions  
✅ **Weather-based risk assessments** for crop protection  
✅ **Professional weather integration** worth premium pricing  

**Total time investment: 2 minutes**  
**Total cost: FREE**  
**Business value: ₹299/month premium feature** 💰

---

*Setup guide created on December 11, 2024*  
*Status: Ready for immediate implementation* ⚡