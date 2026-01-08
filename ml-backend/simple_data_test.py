#!/usr/bin/env python3
"""
Simple test of real data infrastructure
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_database():
    """Test database creation"""
    try:
        from utils.database import DatabaseManager
        db = DatabaseManager()
        stats = db.get_database_stats()
        print(f"✅ Database: {len(stats)} stats available")
        return True
    except Exception as e:
        print(f"❌ Database Error: {str(e)}")
        return False

def test_agmarknet():
    """Test AGMARKNET client"""
    try:
        import asyncio
        from services.agmarknet_client import AGMARKNETClient
        
        async def run_test():
            client = AGMARKNETClient()
            data = await client.get_current_prices("wheat", "punjab")
            return data
        
        result = asyncio.run(run_test())
        print(f"✅ AGMARKNET: ₹{result['current_price']}/quintal")
        return True
    except Exception as e:
        print(f"❌ AGMARKNET Error: {str(e)}")
        return False

def test_data_collector():
    """Test data collector"""
    try:
        import asyncio
        from services.data_collector import DataCollector
        
        async def run_test():
            collector = DataCollector()
            data = await collector.collect_price_data("wheat", "punjab")
            return data
        
        result = asyncio.run(run_test())
        print(f"✅ Data Collector: {len(result['historical_data'])} records")
        return True
    except Exception as e:
        print(f"❌ Data Collector Error: {str(e)}")
        return False

def main():
    print("🧪 Simple Data Infrastructure Test")
    print("=" * 40)
    
    tests = [
        ("Database", test_database),
        ("AGMARKNET", test_agmarknet),
        ("Data Collector", test_data_collector)
    ]
    
    results = []
    for name, test_func in tests:
        print(f"\nTesting {name}...")
        result = test_func()
        results.append(result)
    
    print("\n" + "=" * 40)
    print(f"Results: {sum(results)}/{len(results)} tests passed")
    
    if all(results):
        print("🎉 All components working!")
    else:
        print("⚠️ Some components need attention")

if __name__ == "__main__":
    main()