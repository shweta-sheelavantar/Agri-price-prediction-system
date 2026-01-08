# AgriFriend Production Deployment Guide
## Step-by-Step Instructions for Real API Integration & Beta Launch

---

## 🔑 STEP 1: Get Real API Keys for Government Data Sources

### 1.1 AGMARKNET API Access (Government of India)

**Official Source:** https://data.gov.in/

#### Registration Process:
1. **Visit Data.gov.in Portal**
   ```
   URL: https://data.gov.in/
   Navigate to: API Console → Register
   ```

2. **Create Developer Account**
   - Fill registration form with:
     - Organization: AgriFriend Technologies
     - Purpose: Agricultural price prediction platform
     - Expected usage: 10,000+ API calls/month
   - Verify email and phone number

3. **Request AGMARKNET Dataset Access**
   ```
   Dataset: "Price data of commodities sold in markets"
   API Endpoint: /resource/9ef84268-d588-465a-a308-a864a43d0070
   Format: JSON
   ```

4. **Get API Key**
   - After approval (5-10 business days)
   - Copy API key from dashboard
   - Add to your `.env` file:
   ```bash
   DATA_GOV_IN_API_KEY=your_api_key_here
   ```

#### Update Code:
```python
# In agmarknet_client.py
def set_api_key(self, api_key: str):
    self.api_key = api_key
    self.session.headers.update({'api-key': api_key})
```

### 1.2 Weather API Integration

**Recommended:** OpenWeatherMap (Free tier: 1000 calls/day)

#### Setup Process:
1. **Register at OpenWeatherMap**
   ```
   URL: https://openweathermap.org/api
   Plan: Free tier (upgrade as needed)
   ```

2. **Get API Key**
   ```bash
   OPENWEATHER_API_KEY=your_weather_api_key
   ```

3. **Update Data Collector**
   ```python
   # Add to data_collector.py
   async def _get_current_weather_real(self, coordinates):
       url = f"https://api.openweathermap.org/data/2.5/weather"
       params = {
           'lat': coordinates['lat'],
           'lon': coordinates['lon'],
           'appid': self.weather_api_key,
           'units': 'metric'
       }
       response = await self.session.get(url, params=params)
       return response.json()
   ```

### 1.3 Soil Data Integration

**Source:** ISRO Bhuvan API + Soil Health Card Data

#### Access Process:
1. **ISRO Bhuvan Registration**
   ```
   URL: https://bhuvan-app1.nrsc.gov.in/
   Register for: Soil and Land Use data APIs
   ```

2. **Soil Health Card Database**
   ```
   Contact: State Agriculture Departments
   Request: District-wise soil data access
   Format: CSV/JSON exports
   ```

---

## 🚀 STEP 2: Deploy for Beta Testing (Ready Now!)

### 2.1 Prepare Production Environment

#### Server Setup (Recommended: DigitalOcean/AWS)
```bash
# 1. Create Ubuntu 20.04 server (2GB RAM minimum)
# 2. Install dependencies
sudo apt update
sudo apt install python3.9 python3-pip nginx postgresql redis-server

# 3. Clone your repository
git clone https://github.com/Chaitrashrinaik/agrifriend.git
cd agrifriend/ml-backend

# 4. Install Python dependencies
pip3 install -r requirements.txt
```

#### Environment Configuration
```bash
# Create production .env file
cat > .env << EOF
# Database
DATABASE_URL=postgresql://agrifriend:password@localhost/agrifriend_prod

# API Keys
DATA_GOV_IN_API_KEY=your_api_key
OPENWEATHER_API_KEY=your_weather_key

# Production settings
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=INFO
EOF
```

#### Database Setup
```bash
# 1. Create PostgreSQL database
sudo -u postgres createdb agrifriend_prod
sudo -u postgres createuser agrifriend

# 2. Update database.py to use PostgreSQL
# Replace SQLite with PostgreSQL connection
```

### 2.2 Deploy ML Backend

#### Using Docker (Recommended)
```bash
# 1. Create Dockerfile
cat > Dockerfile << EOF
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# 2. Build and run
docker build -t agrifriend-ml .
docker run -d -p 8000:8000 --env-file .env agrifriend-ml
```

#### Using PM2 (Alternative)
```bash
# 1. Install PM2
npm install -g pm2

# 2. Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'agrifriend-ml',
    script: 'uvicorn',
    args: 'main:app --host 0.0.0.0 --port 8000',
    interpreter: 'python3',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# 3. Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2.3 Setup Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/agrifriend
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000/;  # React frontend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2.4 Beta User Recruitment

#### Target Farmers (Start with 50-100 users)
```
Criteria:
- Tech-savvy farmers with smartphones
- Cultivate wheat, rice, or cotton
- Located in Punjab, Haryana, or UP
- Willing to provide feedback

Recruitment Channels:
- Agricultural universities
- Farmer Producer Organizations (FPOs)
- WhatsApp groups
- Local agriculture officers
```

#### Beta Testing Plan
```
Week 1-2: Onboard 25 farmers
Week 3-4: Onboard 50 farmers  
Week 5-6: Onboard 100 farmers
Week 7-8: Collect feedback and iterate
```

---

## 🤖 STEP 3: Train Models on Accumulated Real Data

### 3.1 Data Collection Pipeline

#### Automated Data Collection
```python
# Create scheduled_data_collection.py
import schedule
import time
from services.data_collector import DataCollector
from utils.database import DatabaseManager

async def daily_data_collection():
    """Collect data daily for all supported crops and regions"""
    collector = DataCollector()
    db = DatabaseManager()
    
    crops = ["wheat", "rice", "cotton", "onion", "tomato"]
    states = ["punjab", "haryana", "uttar pradesh", "west bengal"]
    
    for crop in crops:
        for state in states:
            try:
                data = await collector.collect_price_data(crop, state)
                db.store_price_data(data)
                print(f"Collected data for {crop} in {state}")
            except Exception as e:
                print(f"Error collecting {crop} data: {e}")

# Schedule daily collection
schedule.every().day.at("06:00").do(daily_data_collection)

while True:
    schedule.run_pending()
    time.sleep(3600)  # Check every hour
```

### 3.2 Model Training Pipeline

#### Real Model Training Script
```python
# Create train_models.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
from utils.database import DatabaseManager

class RealModelTrainer:
    def __init__(self):
        self.db = DatabaseManager()
    
    def train_price_prediction_model(self, commodity: str):
        """Train price prediction model on real data"""
        
        # 1. Get historical data
        historical_data = self.db.get_historical_prices(
            commodity, "all_states", days_back=365
        )
        
        if len(historical_data) < 100:
            print(f"Insufficient data for {commodity}: {len(historical_data)} records")
            return None
        
        # 2. Feature engineering
        features = self.create_price_features(historical_data)
        
        # 3. Train model
        X = features.drop(['price', 'date'], axis=1)
        y = features['price']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # 4. Evaluate model
        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"{commodity} Model Performance:")
        print(f"  MAE: ₹{mae:.2f}")
        print(f"  R²: {r2:.3f}")
        print(f"  Accuracy: {(1 - mae/y_test.mean())*100:.1f}%")
        
        # 5. Save model
        model_path = f"models/saved/{commodity}_price_model.pkl"
        joblib.dump(model, model_path)
        
        return {
            'model': model,
            'mae': mae,
            'r2': r2,
            'accuracy': (1 - mae/y_test.mean())*100
        }
    
    def create_price_features(self, data: pd.DataFrame):
        """Create features for price prediction"""
        data = data.copy()
        data['date'] = pd.to_datetime(data['date'])
        data = data.sort_values('date')
        
        # Time-based features
        data['day_of_year'] = data['date'].dt.dayofyear
        data['month'] = data['date'].dt.month
        data['quarter'] = data['date'].dt.quarter
        
        # Price-based features
        data['price_lag_1'] = data['price'].shift(1)
        data['price_lag_7'] = data['price'].shift(7)
        data['price_ma_7'] = data['price'].rolling(7).mean()
        data['price_ma_30'] = data['price'].rolling(30).mean()
        
        # Volatility features
        data['price_volatility'] = data['price'].rolling(7).std()
        data['price_change'] = data['price'].pct_change()
        
        return data.dropna()

# Usage
trainer = RealModelTrainer()
wheat_model = trainer.train_price_prediction_model("wheat")
rice_model = trainer.train_price_prediction_model("rice")
```

### 3.3 Model Deployment and Monitoring

#### Update Price Predictor to Use Trained Models
```python
# Update models/price_predictor.py
def load_model(self):
    """Load trained model if available"""
    try:
        model_path = f"models/saved/{self.commodity}_price_model.pkl"
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            self.model_loaded = True
            
            # Load model metadata
            metadata_path = f"models/saved/{self.commodity}_metadata.json"
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                    self.accuracy = metadata['accuracy'] / 100
                    self.mae = metadata['mae']
            
            logger.info(f"Loaded trained model for {self.commodity}")
        else:
            logger.warning(f"No trained model found for {self.commodity}")
            self.model_loaded = False
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        self.model_loaded = False
```

---

## 📊 STEP 4: Monitoring and Maintenance

### 4.1 Set Up Monitoring Dashboard

#### Create Grafana Dashboard
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### 4.2 Model Performance Tracking

#### Automated Accuracy Monitoring
```python
# Create model_performance_monitor.py
class ModelPerformanceMonitor:
    def __init__(self):
        self.db = DatabaseManager()
    
    def track_prediction_accuracy(self):
        """Compare predictions with actual prices"""
        
        # Get predictions from 7 days ago
        cutoff_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        predictions = self.db.get_predictions_for_date(cutoff_date)
        
        for prediction in predictions:
            # Get actual price for the target date
            actual_price = self.db.get_actual_price(
                prediction['commodity'],
                prediction['state'], 
                prediction['target_date']
            )
            
            if actual_price:
                # Calculate accuracy
                predicted_price = prediction['predicted_value']
                accuracy = 100 - abs((predicted_price - actual_price) / actual_price * 100)
                
                # Update database
                self.db.update_prediction_accuracy(
                    prediction['id'], 
                    actual_price, 
                    accuracy
                )
                
                print(f"Updated accuracy for {prediction['commodity']}: {accuracy:.1f}%")

# Run daily
monitor = ModelPerformanceMonitor()
schedule.every().day.at("08:00").do(monitor.track_prediction_accuracy)
```

---

## 💰 COST BREAKDOWN

### Monthly Operational Costs:
```
Server (2GB RAM): ₹1,500/month
Database (PostgreSQL): ₹800/month
API calls (10K/month): ₹500/month
Domain & SSL: ₹200/month
Monitoring tools: ₹300/month
Total: ₹3,300/month (~$40/month)
```

### One-time Setup Costs:
```
API registrations: ₹0 (free tiers)
SSL certificate: ₹0 (Let's Encrypt)
Development time: ₹15,000 (1 week)
Testing & QA: ₹10,000
Total: ₹25,000 (~$300)
```

---

## 🎯 SUCCESS METRICS TO TRACK

### Technical Metrics:
- API response time < 500ms
- Model accuracy > 80%
- System uptime > 99%
- Data freshness < 24 hours

### Business Metrics:
- Active users: Target 100 in first month
- User retention: Target 70% monthly
- Prediction usage: Target 1000/day
- User satisfaction: Target 4.0/5.0

### Growth Metrics:
- New user signups: Target 25/week
- Word-of-mouth referrals: Track source
- Feature usage: Monitor most used features
- Revenue potential: Calculate from user engagement

---

## 🚀 LAUNCH TIMELINE

### Week 1-2: API Integration
- [ ] Register for government APIs
- [ ] Integrate real data sources
- [ ] Test data quality and accuracy

### Week 3-4: Production Deployment  
- [ ] Set up production server
- [ ] Deploy ML backend
- [ ] Configure monitoring
- [ ] Security hardening

### Week 5-6: Beta Launch
- [ ] Recruit first 25 beta users
- [ ] Onboard and train users
- [ ] Collect initial feedback
- [ ] Fix critical issues

### Week 7-8: Scale and Optimize
- [ ] Expand to 100 beta users
- [ ] Optimize based on usage patterns
- [ ] Prepare for public launch
- [ ] Plan marketing strategy

**You're ready to start Week 1 immediately!** 🚀