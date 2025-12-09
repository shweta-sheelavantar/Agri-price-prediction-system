# AgriFriend Backend Implementation Guide

## Overview
This document provides a comprehensive guide for implementing the backend infrastructure for AgriFriend, including database setup, API integrations, authentication, and real-time data services.

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Phase 1: Database Setup (Supabase)](#phase-1-database-setup)
3. [Phase 2: Backend API Server](#phase-2-backend-api-server)
4. [Phase 3: Authentication](#phase-3-authentication)
5. [Phase 4: Real-Time Data APIs](#phase-4-real-time-data-apis)
6. [Phase 5: Deployment](#phase-5-deployment)

---

## Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: WebSocket (Socket.io)

### External APIs
- **Market Prices**: AGMARKNET API / Data.gov.in
- **Weather**: OpenWeatherMap API
- **Maps**: Mapbox GL JS / Google Maps API
- **Soil Data**: ISRIC SoilGrids API

---

## Phase 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
```bash
# Visit https://supabase.com
# Create new project
# Note down:
# - Project URL
# - Anon/Public Key
# - Service Role Key
```

### 1.2 Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile_number VARCHAR(15) UNIQUE NOT NULL,
  primary_crop VARCHAR(100),
  preferred_language VARCHAR(10) DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Farm Profiles Table
CREATE TABLE farm_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  farm_name VARCHAR(200),
  state VARCHAR(100),
  district VARCHAR(100),
  village VARCHAR(100),
  land_area_total DECIMAL(10,2),
  land_area_unit VARCHAR(20),
  soil_type VARCHAR(100),
  irrigation_type VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crop History Table
CREATE TABLE crop_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farm_profiles(id) ON DELETE CASCADE,
  season VARCHAR(50),
  year INTEGER,
  crop_type VARCHAR(100),
  variety VARCHAR(100),
  area_planted DECIMAL(10,2),
  yield_amount DECIMAL(10,2),
  revenue DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Price Alerts Table
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  commodity VARCHAR(100),
  condition VARCHAR(10), -- 'above' or 'below'
  threshold DECIMAL(10,2),
  location VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  triggered_at TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'price_alert', 'task_reminder', 'insight', 'system'
  title VARCHAR(200),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farm_profiles(id) ON DELETE CASCADE,
  category VARCHAR(50), -- 'seed', 'fertilizer', 'pesticide', 'equipment'
  name VARCHAR(200),
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  reorder_threshold DECIMAL(10,2),
  cost DECIMAL(10,2),
  purchase_date DATE,
  expiry_date DATE,
  supplier VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20), -- 'sale' or 'purchase'
  commodity VARCHAR(100),
  quantity DECIMAL(10,2),
  price_per_unit DECIMAL(10,2),
  total_amount DECIMAL(12,2),
  buyer_seller VARCHAR(200),
  transaction_date DATE,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20), -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_farm_profiles_user ON farm_profiles(user_id);
CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_inventory_farm ON inventory(farm_id);
```

### 1.3 Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Similar policies for other tables
CREATE POLICY "Users can view own farm" ON farm_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own farm" ON farm_profiles
  FOR ALL USING (user_id = auth.uid());
```

---

## Phase 2: Backend API Server

### 2.1 Project Setup

```bash
# Create backend directory
mkdir agrifriend-backend
cd agrifriend-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors dotenv
npm install @supabase/supabase-js
npm install socket.io
npm install axios node-cron
npm install helmet express-rate-limit

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors nodemon ts-node

# Initialize TypeScript
npx tsc --init
```

### 2.2 Project Structure

```
agrifriend-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── farms.routes.ts
│   │   ├── prices.routes.ts
│   │   ├── weather.routes.ts
│   │   └── predictions.routes.ts
│   ├── services/
│   │   ├── agmarknet.service.ts
│   │   ├── weather.service.ts
│   │   ├── soil.service.ts
│   │   └── notifications.service.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── farms.controller.ts
│   │   └── prices.controller.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validators.ts
│   └── server.ts
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

### 2.3 Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# External APIs
AGMARKNET_API_KEY=your_api_key
OPENWEATHER_API_KEY=your_api_key
MAPBOX_API_KEY=your_api_key
SOILGRIDS_API_URL=https://rest.isric.org

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d

# SMS (for OTP)
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=AGRFND
```

### 2.4 Basic Server Setup (src/server.ts)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import farmRoutes from './routes/farms.routes';
import priceRoutes from './routes/prices.routes';
import weatherRoutes from './routes/weather.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/weather', weatherRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// WebSocket for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe:prices', (commodity) => {
    socket.join(`prices:${commodity}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
```

---

## Phase 3: Authentication

### 3.1 Supabase Auth Setup

```typescript
// src/config/database.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 3.2 Auth Controller (src/controllers/auth.controller.ts)

```typescript
import { Request, Response } from 'express';
import { supabase } from '../config/database';

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { mobileNumber } = req.body;
    
    // TODO: Implement SMS OTP sending
    // For now, return success
    
    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, otp, primaryCrop } = req.body;
    
    // TODO: Verify OTP
    
    // Check if user exists
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('mobile_number', mobileNumber)
      .single();
    
    // Create user if doesn't exist
    if (!user) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          mobile_number: mobileNumber,
          primary_crop: primaryCrop
        }])
        .select()
        .single();
      
      if (error) throw error;
      user = newUser;
    }
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

function generateToken(userId: string): string {
  // TODO: Implement JWT token generation
  return 'dummy_token_' + userId;
}
```

---

## Phase 4: Real-Time Data APIs

### 4.1 Market Prices Service (src/services/agmarknet.service.ts)

```typescript
import axios from 'axios';

export class AgmarknetService {
  private baseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
  
  async getMarketPrices(params: {
    commodity?: string;
    state?: string;
    district?: string;
  }) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          'api-key': process.env.AGMARKNET_API_KEY,
          format: 'json',
          ...params
        }
      });
      
      return response.data.records;
    } catch (error) {
      console.error('Error fetching market prices:', error);
      throw error;
    }
  }
}
```

### 4.2 Weather Service (src/services/weather.service.ts)

```typescript
import axios from 'axios';

export class WeatherService {
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  
  async getCurrentWeather(lat: number, lon: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }
  
  async getForecast(lat: number, lon: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  }
}
```

### 4.3 Soil Data Service (src/services/soil.service.ts)

```typescript
import axios from 'axios';

export class SoilService {
  private baseUrl = 'https://rest.isric.org/soilgrids/v2.0';
  
  async getSoilData(lat: number, lon: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/properties/query`, {
        params: {
          lon,
          lat,
          property: ['phh2o', 'nitrogen', 'soc', 'clay'],
          depth: ['0-5cm', '5-15cm'],
          value: 'mean'
        }
      });
      
      return this.formatSoilData(response.data);
    } catch (error) {
      console.error('Error fetching soil data:', error);
      throw error;
    }
  }
  
  private formatSoilData(data: any) {
    return {
      ph: data.properties.layers.find((l: any) => l.name === 'phh2o'),
      nitrogen: data.properties.layers.find((l: any) => l.name === 'nitrogen'),
      organicCarbon: data.properties.layers.find((l: any) => l.name === 'soc'),
      clay: data.properties.layers.find((l: any) => l.name === 'clay')
    };
  }
}
```

---

## Phase 5: Deployment

### 5.1 Backend Deployment (Railway/Render/Heroku)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 5.2 Environment Variables Setup
- Add all .env variables to your hosting platform
- Update CORS origins to include production URL

### 5.3 Frontend Integration

Update `agrifriend/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Next Steps

1. **Immediate**: Implement dummy authentication (Phase 3)
2. **Short-term**: Set up Supabase and basic CRUD operations
3. **Medium-term**: Integrate real-time APIs (weather, prices)
4. **Long-term**: Add AI/ML predictions, advanced features

## API Endpoints Reference

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile
- `POST /api/auth/verify-otp` - Verify OTP and login

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Farms
- `GET /api/farms/:userId` - Get farm profile
- `POST /api/farms` - Create farm profile
- `PUT /api/farms/:id` - Update farm profile

### Prices
- `GET /api/prices` - Get market prices
- `GET /api/prices/commodity/:name` - Get prices for specific commodity
- `POST /api/prices/alerts` - Create price alert

### Weather
- `GET /api/weather/current?lat=&lon=` - Get current weather
- `GET /api/weather/forecast?lat=&lon=` - Get weather forecast

### Soil
- `GET /api/soil?lat=&lon=` - Get soil data for location

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [AGMARKNET API](https://data.gov.in/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [ISRIC SoilGrids](https://www.isric.org/explore/soilgrids)
- [Mapbox Documentation](https://docs.mapbox.com/)

---

**Note**: This is a comprehensive guide. Implementation should be done in phases, starting with core features and gradually adding complexity.
