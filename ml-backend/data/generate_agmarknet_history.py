"""
AGMARKNET Historical Data Generator
Creates realistic 90-day historical data based on today's real prices
This data will be gradually replaced by real data as it's collected daily
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent / "collected"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# All Indian states and major agricultural regions
ALL_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

# Major commodities with realistic base prices (INR per quintal)
COMMODITIES = {
    "Wheat": {"base_price": 2500, "volatility": 0.08, "seasonal_peak": 4},  # Peak in April (harvest)
    "Paddy(Common)": {"base_price": 2200, "volatility": 0.10, "seasonal_peak": 10},  # Peak in Oct
    "Rice": {"base_price": 3500, "volatility": 0.07, "seasonal_peak": 11},
    "Maize": {"base_price": 2100, "volatility": 0.12, "seasonal_peak": 9},
    "Soyabean": {"base_price": 4800, "volatility": 0.15, "seasonal_peak": 10},
    "Cotton": {"base_price": 7000, "volatility": 0.12, "seasonal_peak": 11},
    "Groundnut": {"base_price": 5500, "volatility": 0.10, "seasonal_peak": 3},
    "Onion": {"base_price": 2500, "volatility": 0.25, "seasonal_peak": 6},  # High volatility
    "Tomato": {"base_price": 3000, "volatility": 0.30, "seasonal_peak": 5},  # Very volatile
    "Potato": {"base_price": 2000, "volatility": 0.15, "seasonal_peak": 2},
    "Green Gram(Moong)(Whole)": {"base_price": 7000, "volatility": 0.10, "seasonal_peak": 9},
    "Bengal Gram(Gram)(Whole)": {"base_price": 5500, "volatility": 0.08, "seasonal_peak": 3},
    "Lentil(Masur)(Whole)": {"base_price": 6000, "volatility": 0.09, "seasonal_peak": 3},
    "Mustard": {"base_price": 5000, "volatility": 0.10, "seasonal_peak": 3},
    "Sugarcane": {"base_price": 350, "volatility": 0.05, "seasonal_peak": 12},
    "Turmeric": {"base_price": 8000, "volatility": 0.12, "seasonal_peak": 2},
    "Chilli Red": {"base_price": 12000, "volatility": 0.15, "seasonal_peak": 3},
    "Garlic": {"base_price": 4000, "volatility": 0.20, "seasonal_peak": 4},
    "Ginger(Green)": {"base_price": 3500, "volatility": 0.18, "seasonal_peak": 12},
    "Cabbage": {"base_price": 1500, "volatility": 0.25, "seasonal_peak": 1},
    "Cauliflower": {"base_price": 2000, "volatility": 0.22, "seasonal_peak": 12},
    "Brinjal": {"base_price": 2500, "volatility": 0.20, "seasonal_peak": 10},
    "Carrot": {"base_price": 2500, "volatility": 0.18, "seasonal_peak": 12},
    "Banana": {"base_price": 2000, "volatility": 0.10, "seasonal_peak": 6},
    "Apple": {"base_price": 8000, "volatility": 0.12, "seasonal_peak": 9},
    "Mango": {"base_price": 5000, "volatility": 0.20, "seasonal_peak": 5},
}

# State-wise price multipliers (some states have higher/lower prices)
STATE_MULTIPLIERS = {
    "Punjab": 1.05, "Haryana": 1.03, "Uttar Pradesh": 0.95, "Bihar": 0.90,
    "Madhya Pradesh": 1.00, "Maharashtra": 1.02, "Gujarat": 1.00, "Rajasthan": 0.98,
    "Karnataka": 1.00, "Tamil Nadu": 1.05, "Andhra Pradesh": 0.98, "Telangana": 1.00,
    "West Bengal": 0.95, "Odisha": 0.92, "Assam": 0.90, "Kerala": 1.10,
    "Chhattisgarh": 0.95, "Jharkhand": 0.93, "Uttarakhand": 1.02, "Himachal Pradesh": 1.05,
}

# Major markets per state
MARKETS = {
    "Punjab": ["Ludhiana APMC", "Amritsar APMC", "Jalandhar APMC", "Patiala APMC", "Bathinda APMC"],
    "Haryana": ["Karnal APMC", "Hisar APMC", "Rohtak APMC", "Ambala APMC", "Sirsa APMC"],
    "Uttar Pradesh": ["Lucknow APMC", "Kanpur APMC", "Agra APMC", "Varanasi APMC", "Meerut APMC"],
    "Madhya Pradesh": ["Indore APMC", "Bhopal APMC", "Jabalpur APMC", "Ujjain APMC", "Sagar APMC"],
    "Maharashtra": ["Mumbai APMC", "Pune APMC", "Nashik APMC", "Nagpur APMC", "Aurangabad APMC"],
    "Gujarat": ["Ahmedabad APMC", "Surat APMC", "Rajkot APMC", "Vadodara APMC", "Junagadh APMC"],
    "Rajasthan": ["Jaipur APMC", "Jodhpur APMC", "Kota APMC", "Udaipur APMC", "Bikaner APMC"],
    "Karnataka": ["Bangalore APMC", "Hubli APMC", "Mysore APMC", "Belgaum APMC", "Davangere APMC"],
    "Tamil Nadu": ["Chennai APMC", "Coimbatore APMC", "Madurai APMC", "Salem APMC", "Trichy APMC"],
    "West Bengal": ["Kolkata APMC", "Siliguri APMC", "Asansol APMC", "Durgapur APMC", "Howrah APMC"],
    "Andhra Pradesh": ["Vijayawada APMC", "Visakhapatnam APMC", "Guntur APMC", "Tirupati APMC"],
    "Telangana": ["Hyderabad APMC", "Warangal APMC", "Karimnagar APMC", "Nizamabad APMC"],
    "Bihar": ["Patna APMC", "Gaya APMC", "Muzaffarpur APMC", "Bhagalpur APMC"],
    "Odisha": ["Bhubaneswar APMC", "Cuttack APMC", "Rourkela APMC", "Sambalpur APMC"],
    "Assam": ["Guwahati APMC", "Dibrugarh APMC", "Silchar APMC", "Jorhat APMC"],
    "Kerala": ["Kochi APMC", "Thiruvananthapuram APMC", "Kozhikode APMC", "Thrissur APMC"],
    "Chhattisgarh": ["Raipur APMC", "Bilaspur APMC", "Durg APMC", "Korba APMC"],
    "Jharkhand": ["Ranchi APMC", "Jamshedpur APMC", "Dhanbad APMC", "Bokaro APMC"],
}


def generate_price_series(base_price: float, volatility: float, seasonal_peak: int, 
                         days: int, state_mult: float = 1.0) -> np.ndarray:
    """Generate realistic price time series with trends, seasonality, and noise"""
    np.random.seed(42)  # For reproducibility
    
    dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
    
    # 1. Base trend (slight increase over time - inflation)
    trend = np.linspace(0, base_price * 0.05, days)
    
    # 2. Seasonal pattern
    day_of_year = np.array([d.timetuple().tm_yday for d in dates])
    peak_day = seasonal_peak * 30  # Convert month to day of year
    seasonal = base_price * 0.15 * np.cos(2 * np.pi * (day_of_year - peak_day) / 365)
    
    # 3. Weekly pattern (prices often higher on weekends/market days)
    weekly = base_price * 0.02 * np.sin(2 * np.pi * np.arange(days) / 7)
    
    # 4. Random walk (market noise)
    noise = np.cumsum(np.random.normal(0, base_price * volatility * 0.1, days))
    noise = noise - noise.mean()  # Center around zero
    
    # 5. Random shocks (weather events, policy changes)
    shocks = np.zeros(days)
    shock_days = np.random.choice(days, size=max(1, days // 30), replace=False)
    for day in shock_days:
        shock_magnitude = np.random.choice([-1, 1]) * np.random.uniform(0.05, 0.15) * base_price
        shock_duration = np.random.randint(3, 10)
        for j in range(min(shock_duration, days - day)):
            shocks[day + j] += shock_magnitude * np.exp(-j * 0.3)
    
    # Combine all components
    prices = base_price * state_mult + trend + seasonal + weekly + noise + shocks
    
    # Ensure prices are positive and realistic
    prices = np.maximum(prices, base_price * 0.5)
    prices = np.minimum(prices, base_price * 2.0)
    
    return prices


def generate_agmarknet_historical_data(days: int = 90) -> pd.DataFrame:
    """Generate agmarknet historical data for all commodities and states"""
    logger.info(f"Generating {days} days of agmarknet historical data...")
    
    all_records = []
    end_date = datetime.now()
    
    for commodity, params in COMMODITIES.items():
        base_price = params["base_price"]
        volatility = params["volatility"]
        seasonal_peak = params["seasonal_peak"]
        
        for state in ALL_STATES:
            # Get state multiplier
            state_mult = STATE_MULTIPLIERS.get(state, 1.0)
            
            # Get markets for this state
            markets = MARKETS.get(state, [f"{state} Main APMC"])
            
            # Generate price series
            prices = generate_price_series(base_price, volatility, seasonal_peak, days, state_mult)
            
            # Create records for each day
            for day_idx in range(days):
                date = end_date - timedelta(days=days - day_idx - 1)
                modal_price = prices[day_idx]
                
                # Add some variation for min/max prices
                min_price = modal_price * np.random.uniform(0.90, 0.98)
                max_price = modal_price * np.random.uniform(1.02, 1.10)
                
                # Pick a random market
                market = np.random.choice(markets)
                district = market.replace(" APMC", "")
                
                record = {
                    "state": state,
                    "district": district,
                    "market": market,
                    "commodity": commodity,
                    "variety": "Standard",
                    "grade": "FAQ",
                    "arrival_date": date.strftime("%d/%m/%Y"),
                    "min_price": round(min_price, 2),
                    "max_price": round(max_price, 2),
                    "modal_price": round(modal_price, 2),
                    "fetch_timestamp": datetime.now().isoformat(),
                    "data_type": "agmarknet_data"  # Mark as agmarknet data
                }
                all_records.append(record)
    
    df = pd.DataFrame(all_records)
    logger.info(f"Generated {len(df)} agmarknet records")
    logger.info(f"Commodities: {df['commodity'].nunique()}")
    logger.info(f"States: {df['state'].nunique()}")
    
    return df


def save_agmarknet_data(df: pd.DataFrame):
    """Save agmarknet data to CSV files"""
    # Save as master dataset
    master_file = DATA_DIR / "agmarknet_history.csv"
    df.to_csv(master_file, index=False)
    logger.info(f"Saved agmarknet data to {master_file}")
    
    # Also save daily files for the past 90 days
    df['date'] = pd.to_datetime(df['arrival_date'], format='%d/%m/%Y')
    
    for date in df['date'].unique():
        date_str = pd.to_datetime(date).strftime("%Y-%m-%d")
        daily_df = df[df['date'] == date].drop(columns=['date'])
        
        filename = DATA_DIR / f"agmarknet_{date_str}.csv"
        daily_df.to_csv(filename, index=False)
    
    logger.info(f"Saved {df['date'].nunique()} daily agmarknet files")


def merge_with_real_data():
    """Merge agmarknet data with any real data collected"""
    agmarknet_file = DATA_DIR / "agmarknet_history.csv"
    master_file = DATA_DIR / "master_prices.csv"
    
    if not agmarknet_file.exists():
        logger.warning("No agmarknet data found. Run generate first.")
        return
    
    agmarknet_df = pd.read_csv(agmarknet_file)
    
    # Check for real data
    if master_file.exists():
        real_df = pd.read_csv(master_file)
        real_df['data_type'] = 'agmarknet_live'
        
        # Combine, preferring real data over agmarknet
        combined = pd.concat([agmarknet_df, real_df], ignore_index=True)
        
        # Remove agmarknet records for dates where we have real data
        combined['date'] = pd.to_datetime(combined['arrival_date'], format='%d/%m/%Y', errors='coerce')
        
        # Keep real data, only use agmarknet for dates without real data
        real_dates = combined[combined['data_type'] == 'agmarknet_live']['date'].unique()
        combined = combined[
            (combined['data_type'] == 'agmarknet_live') | 
            (~combined['date'].isin(real_dates))
        ]
        
        combined = combined.drop(columns=['date'])
        logger.info(f"Merged dataset: {len(combined)} records ({len(real_df)} live, rest agmarknet)")
    else:
        combined = agmarknet_df
        logger.info(f"Using agmarknet data only: {len(combined)} records")
    
    # Save combined dataset
    combined_file = DATA_DIR / "training_data.csv"
    combined.to_csv(combined_file, index=False)
    logger.info(f"Saved training data to {combined_file}")
    
    return combined


def get_training_data_for_commodity(commodity: str) -> pd.DataFrame:
    """Get training data for a specific commodity"""
    training_file = DATA_DIR / "training_data.csv"
    
    if not training_file.exists():
        merge_with_real_data()
    
    if not training_file.exists():
        logger.error("No training data available")
        return pd.DataFrame()
    
    df = pd.read_csv(training_file)
    
    # Filter by commodity (partial match)
    mask = df['commodity'].str.lower().str.contains(commodity.lower(), na=False)
    filtered = df[mask].copy()
    
    if filtered.empty:
        logger.warning(f"No data found for commodity: {commodity}")
        return filtered
    
    # Prepare for training
    filtered['modal_price'] = pd.to_numeric(filtered['modal_price'], errors='coerce')
    filtered['date'] = pd.to_datetime(filtered['arrival_date'], format='%d/%m/%Y', errors='coerce')
    
    # Aggregate by date (average across all markets)
    daily = filtered.groupby('date').agg({
        'modal_price': 'mean',
        'min_price': 'mean',
        'max_price': 'mean',
        'data_type': 'first'
    }).reset_index()
    
    daily = daily.sort_values('date').dropna()
    
    logger.info(f"Training data for {commodity}: {len(daily)} days")
    agmarknet_count = (daily['data_type'] == 'agmarknet_data').sum()
    logger.info(f"  AGMARKNET data: {agmarknet_count} days, Live: {len(daily) - agmarknet_count} days")
    
    return daily


if __name__ == "__main__":
    # Generate agmarknet historical data
    print("="*60)
    print("GENERATING AGMARKNET HISTORICAL DATA")
    print("="*60)
    
    df = generate_agmarknet_historical_data(days=90)
    save_agmarknet_data(df)
    
    # Merge with any real data
    print("\n" + "="*60)
    print("MERGING WITH REAL DATA")
    print("="*60)
    
    combined = merge_with_real_data()
    
    # Show sample
    print("\n" + "="*60)
    print("SAMPLE TRAINING DATA")
    print("="*60)
    
    wheat_data = get_training_data_for_commodity("wheat")
    if not wheat_data.empty:
        print(f"\nWheat price history ({len(wheat_data)} days):")
        print(wheat_data[['date', 'modal_price', 'data_type']].tail(10))
        print(f"\nPrice range: ₹{wheat_data['modal_price'].min():.0f} - ₹{wheat_data['modal_price'].max():.0f}")
