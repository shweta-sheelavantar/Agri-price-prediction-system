"""
Historical Data Collector
Fetches and stores AGMARKNET data daily for ML model training
"""

import os
import requests
import pandas as pd
from datetime import datetime, timedelta
import logging
import schedule
import time
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
API_KEY = os.getenv("DATA_GOV_IN_API_KEY", "579b464db66ec23bdd0000018b6fa4a91b50448363abcccd5f1f13be")
API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
DATA_DIR = Path(__file__).parent / "collected"

# Ensure data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)

class HistoricalDataCollector:
    """Collects and stores historical price data for ML training"""
    
    def __init__(self):
        self.api_key = API_KEY
        self.api_url = API_URL
        self.data_dir = DATA_DIR
        
    def fetch_current_data(self, limit: int = 1000) -> pd.DataFrame:
        """Fetch current day's data from AGMARKNET API"""
        try:
            params = {
                'api-key': self.api_key,
                'format': 'json',
                'limit': limit
            }
            
            response = requests.get(self.api_url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                records = data.get('records', [])
                
                if records:
                    df = pd.DataFrame(records)
                    df['fetch_timestamp'] = datetime.now().isoformat()
                    logger.info(f"Fetched {len(df)} records from AGMARKNET")
                    return df
                else:
                    logger.warning("No records returned from API")
                    return pd.DataFrame()
            else:
                logger.error(f"API error: {response.status_code}")
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            return pd.DataFrame()
    
    def save_daily_data(self, df: pd.DataFrame) -> str:
        """Save daily data to CSV file"""
        if df.empty:
            logger.warning("No data to save")
            return None
            
        # Create filename with date
        date_str = datetime.now().strftime("%Y-%m-%d")
        filename = self.data_dir / f"agmarknet_{date_str}.csv"
        
        # Save to CSV
        df.to_csv(filename, index=False)
        logger.info(f"Saved {len(df)} records to {filename}")
        
        return str(filename)
    
    def load_historical_data(self, days_back: int = 90) -> pd.DataFrame:
        """Load historical data from stored CSV files"""
        all_data = []
        
        for i in range(days_back):
            date = datetime.now() - timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            filename = self.data_dir / f"agmarknet_{date_str}.csv"
            
            if filename.exists():
                try:
                    df = pd.read_csv(filename)
                    all_data.append(df)
                except Exception as e:
                    logger.warning(f"Error reading {filename}: {e}")
        
        if all_data:
            combined = pd.concat(all_data, ignore_index=True)
            logger.info(f"Loaded {len(combined)} total records from {len(all_data)} files")
            return combined
        else:
            logger.warning("No historical data found")
            return pd.DataFrame()
    
    def get_commodity_history(self, commodity: str, state: str = None, days_back: int = 90) -> pd.DataFrame:
        """Get historical prices for a specific commodity"""
        df = self.load_historical_data(days_back)
        
        if df.empty:
            return df
        
        # Filter by commodity
        mask = df['commodity'].str.lower().str.contains(commodity.lower(), na=False)
        
        if state:
            mask &= df['state'].str.lower().str.contains(state.lower(), na=False)
        
        filtered = df[mask].copy()
        
        # Convert price columns to numeric
        for col in ['min_price', 'max_price', 'modal_price']:
            if col in filtered.columns:
                filtered[col] = pd.to_numeric(filtered[col], errors='coerce')
        
        # Parse dates
        if 'arrival_date' in filtered.columns:
            filtered['date'] = pd.to_datetime(filtered['arrival_date'], format='%d/%m/%Y', errors='coerce')
            filtered = filtered.sort_values('date')
        
        logger.info(f"Found {len(filtered)} records for {commodity}")
        return filtered
    
    def collect_and_save(self) -> bool:
        """Main collection routine - fetch and save today's data"""
        logger.info("Starting daily data collection...")
        
        df = self.fetch_current_data(limit=2000)
        
        if not df.empty:
            filepath = self.save_daily_data(df)
            self.update_master_dataset(df)
            return True
        
        return False
    
    def update_master_dataset(self, new_data: pd.DataFrame):
        """Update the master CSV with new data"""
        master_file = self.data_dir / "master_prices.csv"
        
        if master_file.exists():
            existing = pd.read_csv(master_file)
            combined = pd.concat([existing, new_data], ignore_index=True)
            # Remove duplicates based on key columns
            combined = combined.drop_duplicates(
                subset=['commodity', 'market', 'arrival_date', 'modal_price'],
                keep='last'
            )
        else:
            combined = new_data
        
        combined.to_csv(master_file, index=False)
        logger.info(f"Master dataset updated: {len(combined)} total records")
    
    def get_training_data(self, commodity: str) -> pd.DataFrame:
        """Get data formatted for ML training"""
        master_file = self.data_dir / "master_prices.csv"
        
        if not master_file.exists():
            logger.warning("Master dataset not found. Run collect_and_save() first.")
            return pd.DataFrame()
        
        df = pd.read_csv(master_file)
        
        # Filter by commodity
        mask = df['commodity'].str.lower().str.contains(commodity.lower(), na=False)
        filtered = df[mask].copy()
        
        if filtered.empty:
            return filtered
        
        # Prepare for training
        filtered['modal_price'] = pd.to_numeric(filtered['modal_price'], errors='coerce')
        filtered['date'] = pd.to_datetime(filtered['arrival_date'], format='%d/%m/%Y', errors='coerce')
        
        # Aggregate by date (average price across all markets)
        daily_prices = filtered.groupby('date').agg({
            'modal_price': 'mean',
            'min_price': 'mean',
            'max_price': 'mean'
        }).reset_index()
        
        daily_prices = daily_prices.sort_values('date')
        daily_prices = daily_prices.dropna()
        
        logger.info(f"Training data prepared: {len(daily_prices)} daily records for {commodity}")
        return daily_prices


def run_daily_collection():
    """Run the daily collection job"""
    collector = HistoricalDataCollector()
    collector.collect_and_save()


def start_scheduler():
    """Start the scheduled data collection"""
    logger.info("Starting data collection scheduler...")
    
    # Run immediately on start
    run_daily_collection()
    
    # Schedule daily at 6 PM IST (after market closes)
    schedule.every().day.at("18:00").do(run_daily_collection)
    
    while True:
        schedule.run_pending()
        time.sleep(3600)  # Check every hour


if __name__ == "__main__":
    # Run once for testing
    collector = HistoricalDataCollector()
    collector.collect_and_save()
    
    # Show what we collected
    df = collector.load_historical_data(days_back=7)
    if not df.empty:
        print(f"\nCollected {len(df)} records")
        print(f"Commodities: {df['commodity'].nunique()}")
        print(f"States: {df['state'].nunique()}")
        print(f"\nSample data:")
        print(df[['commodity', 'state', 'market', 'modal_price', 'arrival_date']].head(10))
