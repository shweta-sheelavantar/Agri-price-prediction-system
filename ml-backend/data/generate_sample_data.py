#!/usr/bin/env python3
"""
Generate 5 years of realistic agricultural market price data
This creates the CSV files needed for ML training and historical trends
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_price_data():
    """Generate realistic 5-year price data for Indian agricultural commodities"""
    
    # Date range: 5 years of data
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5*365)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Indian commodities and markets
    commodities = ['Wheat', 'Rice', 'Onion', 'Tomato', 'Potato', 'Cotton', 'Soybean']
    markets = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad']
    
    # Base prices (INR per quintal)
    base_prices = {
        'Wheat': 2200,
        'Rice': 3500,
        'Onion': 1800,
        'Tomato': 2500,
        'Potato': 1500,
        'Cotton': 6000,
        'Soybean': 4200
    }
    
    # Market multipliers (some markets are more expensive)
    market_multipliers = {
        'Delhi': 1.15,
        'Mumbai': 1.20,
        'Kolkata': 0.95,
        'Chennai': 1.05,
        'Bangalore': 1.10,
        'Hyderabad': 1.00,
        'Pune': 1.08,
        'Ahmedabad': 1.02
    }
    
    all_data = []
    
    for commodity in commodities:
        for market in markets:
            base_price = base_prices[commodity] * market_multipliers[market]
            
            # Generate realistic price series
            prices = generate_realistic_price_series(
                base_price=base_price,
                num_days=len(dates),
                commodity=commodity,
                market=market
            )
            
            # Create records
            for date, price in zip(dates, prices):
                all_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'commodity': commodity,
                    'market': market,
                    'price': round(price, 2)
                })
    
    # Create DataFrame and save
    df = pd.DataFrame(all_data)
    
    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)
    
    # Save complete dataset
    df.to_csv('data/agricultural_prices_5years.csv', index=False)
    print(f"✅ Generated {len(df)} records of agricultural price data")
    print(f"📅 Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"🌾 Commodities: {', '.join(df['commodity'].unique())}")
    print(f"🏪 Markets: {', '.join(df['market'].unique())}")
    
    # Create individual commodity files for easier access
    for commodity in commodities:
        commodity_data = df[df['commodity'] == commodity]
        commodity_data.to_csv(f'data/{commodity.lower()}_prices.csv', index=False)
    
    return df

def generate_realistic_price_series(base_price, num_days, commodity, market):
    """Generate realistic price time series with trends, seasonality, and noise"""
    
    np.random.seed(hash(f"{commodity}{market}") % 2**32)  # Consistent but different per commodity-market
    
    # 1. Long-term trend (slight increase over 5 years)
    trend = np.linspace(0, base_price * 0.3, num_days)
    
    # 2. Seasonal patterns (different for each commodity)
    seasonal_patterns = {
        'Wheat': [0, 50, 100, 150, 80, 20, -50, -80, -60, -20, 30, 60],  # Harvest Apr-May
        'Rice': [20, 40, 60, 80, 100, 120, 80, 40, 20, 0, -20, 0],      # Harvest Oct-Nov
        'Onion': [150, 120, 80, 40, 20, 0, 30, 60, 100, 140, 160, 180], # Storage issues
        'Tomato': [80, 60, 30, 0, -40, -60, -30, 20, 50, 80, 100, 90],  # Weather sensitive
        'Potato': [100, 80, 50, 20, 0, -20, 0, 30, 60, 90, 110, 120],   # Storage crop
        'Cotton': [0, 20, 40, 60, 80, 100, 120, 100, 60, 20, 0, -20],   # Harvest Oct-Jan
        'Soybean': [40, 60, 80, 100, 120, 100, 80, 60, 40, 20, 10, 20]  # Harvest Sep-Nov
    }
    
    pattern = seasonal_patterns.get(commodity, [0] * 12)
    
    # Create seasonal component
    seasonal = []
    for i in range(num_days):
        day_of_year = i % 365
        month = int(day_of_year * 12 / 365)
        seasonal.append(pattern[month])
    
    seasonal = np.array(seasonal)
    
    # 3. Weekly pattern (lower prices on weekends)
    weekly = []
    for i in range(num_days):
        day_of_week = i % 7
        if day_of_week in [5, 6]:  # Saturday, Sunday
            weekly.append(-20)
        else:
            weekly.append(0)
    
    weekly = np.array(weekly)
    
    # 4. Random noise (daily fluctuations)
    noise = np.random.normal(0, base_price * 0.03, num_days)
    
    # 5. Price shocks (weather events, policy changes)
    shocks = np.zeros(num_days)
    num_shocks = max(1, num_days // 200)  # About 9 shocks over 5 years
    shock_days = np.random.choice(num_days, size=num_shocks, replace=False)
    
    for day in shock_days:
        shock_magnitude = np.random.choice([-1, 1]) * np.random.uniform(0.15, 0.4) * base_price
        shock_duration = np.random.randint(5, 25)
        
        for j in range(min(shock_duration, num_days - day)):
            decay_factor = np.exp(-j * 0.15)  # Exponential decay
            shocks[day + j] += shock_magnitude * decay_factor
    
    # 6. Market-specific variations
    market_variations = {
        'Delhi': 1.02,
        'Mumbai': 1.05,
        'Kolkata': 0.98,
        'Chennai': 1.01,
        'Bangalore': 1.03,
        'Hyderabad': 1.00,
        'Pune': 1.02,
        'Ahmedabad': 1.01
    }
    
    market_factor = market_variations.get(market, 1.0)
    
    # Combine all components
    prices = (base_price + trend + seasonal + weekly + noise + shocks) * market_factor
    
    # Ensure prices are positive and realistic
    prices = np.maximum(prices, base_price * 0.4)
    
    # Add some autocorrelation (prices tend to be similar to previous day)
    for i in range(1, len(prices)):
        prices[i] = 0.85 * prices[i] + 0.15 * prices[i-1]
    
    return prices

if __name__ == "__main__":
    print("🌾 Generating Agricultural Market Price Data...")
    df = generate_price_data()
    print("✅ Data generation complete!")
    
    # Show sample data
    print("\n📊 Sample data:")
    print(df.head(10))
    
    print("\n📈 Price statistics:")
    print(df.groupby('commodity')['price'].agg(['mean', 'min', 'max', 'std']).round(2))