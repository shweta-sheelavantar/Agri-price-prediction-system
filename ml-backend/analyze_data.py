#!/usr/bin/env python3
"""
Analyze Agricultural Prices Dataset
"""
import pandas as pd

# Load the dataset
df = pd.read_csv('data/agricultural_prices_5years.csv')

print("="*70)
print("AGRICULTURAL PRICES DATASET ANALYSIS")
print("="*70)

# Basic information
print(f"\n📊 Total Records: {len(df):,}")
print(f"📅 Date Range: {df['date'].min()} to {df['date'].max()}")
print(f"🌾 Commodities: {df['commodity'].nunique()}")
print(f"🏪 Markets: {df['market'].nunique()}")

# Commodities list
print("\n" + "─"*70)
print("COMMODITIES IN DATASET:")
print("─"*70)
commodities = df['commodity'].unique()
for i, commodity in enumerate(commodities, 1):
    count = len(df[df['commodity'] == commodity])
    print(f"{i:2d}. {commodity:20s} - {count:,} records")

# Markets list
print("\n" + "─"*70)
print("MARKETS IN DATASET:")
print("─"*70)
markets = df['market'].unique()
for i, market in enumerate(markets, 1):
    count = len(df[df['market'] == market])
    print(f"{i:2d}. {market:20s} - {count:,} records")

# Price statistics
print("\n" + "─"*70)
print("PRICE STATISTICS:")
print("─"*70)
print(df['price'].describe())

# Sample data
print("\n" + "─"*70)
print("FIRST 10 ROWS:")
print("─"*70)
print(df.head(10).to_string(index=False))

print("\n" + "─"*70)
print("LAST 10 ROWS:")
print("─"*70)
print(df.tail(10).to_string(index=False))

print("\n" + "="*70)
print("✅ Analysis Complete!")
print("="*70)
