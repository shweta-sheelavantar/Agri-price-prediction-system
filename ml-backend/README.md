# 🤖 AgriFriend ML Backend

FastAPI-based ML backend for agricultural price prediction using LSTM + XGBoost hybrid models.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install packages
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file:

```env
DATA_GOV_IN_API_KEY=579b464db66ec23bdd0000018b6fa4a91b50448363abcccd5f1f13be
OPENWEATHER_API_KEY=79093526d697101e68a0f9cf082e3a73
```

### 3. Run the Server

```bash
python main.py
```

Server runs at: **http://localhost:8000**

API Docs: **http://localhost:8000/docs**

---

## 📊 Model Training

### Train All Models

```bash
python train_models.py
```

This trains LSTM + XGBoost hybrid models for 16+ commodities:
- Wheat, Rice, Cotton, Onion, Tomato, Potato
- Soybean, Maize, Groundnut, Lentil, Mustard
- Bengal Gram, Green Gram, Chilli, Garlic, Cabbage

### Show Model Accuracy

```bash
python show_accuracy.py
```

Output:
```
╔══════════════════════════════════════════════════════════════╗
║           AGRIFRIEND ML MODEL ACCURACY REPORT                ║
╠══════════════════════════════════════════════════════════════╣
║ Average Accuracy: 95.26%                                     ║
║ Total Models: 16                                             ║
╠══════════════════════════════════════════════════════════════╣
║ Wheat    │ MAE: ₹88.45  │ Accuracy: 96.34%                  ║
║ Rice     │ MAE: ₹67.62  │ Accuracy: 98.12%                  ║
║ Cotton   │ MAE: ₹57.97  │ Accuracy: 99.24%                  ║
║ Onion    │ MAE: ₹81.34  │ Accuracy: 96.89%                  ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Price Prediction
```
POST /predict/price
{
  "commodity": "wheat",
  "state": "punjab",
  "district": "ludhiana",
  "days_ahead": 7
}
```

### Current Prices
```
GET /prices/current?commodity=wheat&state=punjab
```

### Weather Forecast
```
GET /weather/forecast?city=ludhiana&state=punjab
```

### Model Info
```
GET /models/info
```

---

## 📁 Project Structure

```
ml-backend/
├── main.py                 # FastAPI server
├── train_models.py         # Model training script
├── show_accuracy.py        # Display accuracy report
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
│
├── models/
│   ├── price_predictor.py          # Main prediction model
│   ├── lstm_xgboost_predictor.py   # LSTM + XGBoost hybrid
│   ├── yield_predictor.py          # Yield prediction
│   ├── risk_assessor.py            # Risk assessment
│   ├── trained/                    # Trained model files
│   └── saved/                      # Saved model checkpoints
│
├── services/
│   ├── agmarknet_client.py         # AGMARKNET API client
│   ├── data_collector.py           # Data collection
│   ├── weather_service.py          # Weather API
│   ├── continuous_ml.py            # Continuous predictions
│   └── realtime_notifications.py   # Real-time alerts
│
├── data/
│   ├── collected/                  # Collected market data
│   └── training_data.csv           # Training dataset
│
└── utils/
    └── database.py                 # Database utilities
```

---

## 🧪 Testing

```bash
# Quick model test
python quick_model_test.py

# Comprehensive accuracy test
python test_accuracy.py

# Fetch today's market data
python fetch_agmarknet_today.py

# Test weather API
python test_weather_api.py
```

---

## 📊 Data Sources

| Source | API | Data |
|--------|-----|------|
| AGMARKNET | data.gov.in | Market prices |
| OpenWeatherMap | openweathermap.org | Weather |

---

## 🔧 Troubleshooting

### TensorFlow Issues
If TensorFlow has DLL errors on Windows, the system automatically falls back to XGBoost-only mode (still 95%+ accuracy).

### Missing Models
Run `python train_models.py` to train models.

### API Key Errors
Ensure `.env` file has valid API keys.

---

## 📈 Model Performance

| Commodity | MAE (₹) | Accuracy |
|-----------|---------|----------|
| Wheat | 88.45 | 96.34% |
| Rice | 67.62 | 98.12% |
| Cotton | 57.97 | 99.24% |
| Onion | 81.34 | 96.89% |
| Tomato | 119.96 | 95.76% |
| Potato | 110.69 | 94.76% |

**Overall Average Accuracy: 95.26%**
