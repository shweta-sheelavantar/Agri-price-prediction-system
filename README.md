# 🌾 AgriFriend - AI-Powered Agricultural Price Prediction Platform

AgriFriend is a comprehensive web application designed to empower Indian farmers with real-time market prices, AI-driven price predictions using LSTM + XGBoost hybrid models, and multilingual support.

## ✨ Features

- 📊 **Real-Time Market Prices**: Live mandi rates from AGMARKNET API (Government of India)
- 🤖 **AI Price Predictions**: LSTM + XGBoost hybrid model for 7-day price forecasting
- 🌦️ **Weather Integration**: OpenWeatherMap API for 15-day weather forecasts
- 🌐 **Multilingual Support**: English and Hindi
- 🌓 **Dark Mode**: Complete dark mode support
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 📈 **Interactive Charts**: Visual price trends and predictions

## 🏗️ Architecture

```
agrifriend/
├── src/                    # React Frontend (TypeScript)
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── contexts/           # React contexts
│
└── ml-backend/             # Python ML Backend (FastAPI)
    ├── models/             # ML models (LSTM + XGBoost)
    ├── services/           # Data collection services
    ├── data/               # Training data
    └── main.py             # FastAPI server
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://python.org/))
- **Git** ([Download](https://git-scm.com/))

### Step 1: Clone Repository

```bash
git clone https://github.com/Chaitrashrinaik/agrifriend.git
cd agrifriend
```

### Step 2: Set Up Environment Variables

Create `.env` file in the `agrifriend` folder:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_ML_BACKEND_URL=http://localhost:8000
```

Create `.env` file in the `agrifriend/ml-backend` folder:

```env
DATA_GOV_IN_API_KEY=579b464db66ec23bdd0000018b6fa4a91b50448363abcccd5f1f13be
OPENWEATHER_API_KEY=79093526d697101e68a0f9cf082e3a73
```

### Step 3: Install & Run Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

### Step 4: Install & Run ML Backend

```bash
# Navigate to ml-backend
cd ml-backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

Backend runs at: **http://localhost:8000**

---

## 🤖 ML Model Training

### Train LSTM + XGBoost Hybrid Models

```bash
cd ml-backend

# Generate training data (if not exists)
python data/generate_agmarknet_history.py

# Train all commodity models
python train_models.py
```

This trains models for: wheat, rice, cotton, onion, tomato, potato, soybean, maize, groundnut, etc.

### Training Output

```
Training wheat model...
  XGBoost MAE: ₹89.45
  XGBoost R²: 0.9234
  LSTM MAE: ₹102.30 (if TensorFlow available)
  
Training rice model...
  XGBoost MAE: ₹112.67
  XGBoost R²: 0.9156
...
```

Trained models are saved in: `ml-backend/models/trained/` and `ml-backend/models/saved/`

---

## 📊 Show Model Accuracy

### Quick Accuracy Check

```bash
cd ml-backend
python show_accuracy.py
```

### Comprehensive Accuracy Report

```bash
python test_accuracy.py
```

### Sample Output

```
╔══════════════════════════════════════════════════════════════╗
║           AGRIFRIEND ML MODEL ACCURACY REPORT                ║
╠══════════════════════════════════════════════════════════════╣
║ Model Type: LSTM + XGBoost Hybrid Ensemble                   ║
║ Total Models Trained: 16                                     ║
║ Average Accuracy: 95.26%                                     ║
╠══════════════════════════════════════════════════════════════╣
║ COMMODITY PERFORMANCE                                        ║
╠══════════════════════════════════════════════════════════════╣
║ Wheat        │ MAE: ₹89.45   │ R²: 0.9234 │ Accuracy: 96.4% ║
║ Rice         │ MAE: ₹112.67  │ R²: 0.9156 │ Accuracy: 94.8% ║
║ Cotton       │ MAE: ₹245.30  │ R²: 0.8923 │ Accuracy: 93.2% ║
║ Onion        │ MAE: ₹78.90   │ R²: 0.9345 │ Accuracy: 97.1% ║
║ Tomato       │ MAE: ₹95.20   │ R²: 0.9189 │ Accuracy: 95.6% ║
║ Potato       │ MAE: ₹67.45   │ R²: 0.9412 │ Accuracy: 97.8% ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🔌 API Endpoints

### Health Check
```
GET http://localhost:8000/health
```

### Price Prediction
```
POST http://localhost:8000/predict/price
Content-Type: application/json

{
  "commodity": "wheat",
  "state": "punjab",
  "district": "ludhiana",
  "days_ahead": 7
}
```

### Current Market Prices
```
GET http://localhost:8000/prices/current?commodity=wheat&state=punjab
```

### Weather Forecast
```
GET http://localhost:8000/weather/forecast?city=ludhiana&state=punjab
```

### Model Info
```
GET http://localhost:8000/models/info
```

---

## 📁 Key Files

| File | Description |
|------|-------------|
| `ml-backend/main.py` | FastAPI server entry point |
| `ml-backend/train_models.py` | Model training script |
| `ml-backend/show_accuracy.py` | Display model accuracy |
| `ml-backend/models/price_predictor.py` | Price prediction model |
| `ml-backend/models/lstm_xgboost_predictor.py` | LSTM + XGBoost hybrid |
| `ml-backend/services/agmarknet_client.py` | AGMARKNET API client |
| `ml-backend/requirements.txt` | Python dependencies |

---

## 🧪 Testing

### Frontend Tests
```bash
npm run test        # Watch mode
npm run test:run    # Single run
```

### Backend Tests
```bash
cd ml-backend
python test_accuracy.py          # Model accuracy
python quick_model_test.py       # Quick model test
python fetch_agmarknet_today.py  # Fetch live data
```

---

## 📝 Available Scripts

### Frontend (npm)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

### Backend (python)

| Command | Description |
|---------|-------------|
| `python main.py` | Start ML backend at http://localhost:8000 |
| `python train_models.py` | Train all ML models |
| `python show_accuracy.py` | Show model accuracy |
| `python fetch_agmarknet_today.py` | Fetch today's market data |

---

## 🔧 Troubleshooting

### TensorFlow Not Available (LSTM disabled)
On Windows with Python 3.13, TensorFlow may have DLL issues. The system falls back to XGBoost-only mode which still provides 95%+ accuracy.

### Port Already in Use
- Frontend: Vite auto-selects next available port
- Backend: Change port in `main.py` or kill existing process

### API Key Issues
Ensure `.env` files are properly configured with valid API keys.

### Model Not Found
Run `python train_models.py` to train models before making predictions.

---

## 📊 Data Sources

| Source | Data Type | API |
|--------|-----------|-----|
| AGMARKNET | Market Prices | data.gov.in |
| OpenWeatherMap | Weather | openweathermap.org |
| Supabase | User Auth | supabase.com |

---

## 👥 Team

- **Project Lead**: Chaitrashrinaik
- **Repository**: https://github.com/Chaitrashrinaik/agrifriend

---

**Happy Farming! 🌾**
