// Simple test to verify frontend works without backend
import { marketPricesAPI } from './src/services/api.js';

console.log('Testing frontend API without backend...');

try {
  const prices = await marketPricesAPI.getTicker();
  console.log('✅ Ticker API working:', prices.length, 'prices loaded');
  
  const allPrices = await marketPricesAPI.getAll();
  console.log('✅ Market prices API working:', allPrices.length, 'prices loaded');
  
  console.log('✅ Frontend is working correctly with mock data fallback');
} catch (error) {
  console.error('❌ Frontend test failed:', error);
}