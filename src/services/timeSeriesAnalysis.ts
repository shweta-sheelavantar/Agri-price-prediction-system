import { MarketPrice } from '../types';

export interface TimeSeriesPrediction {
  date: string;
  fullDate: string;
  price: number;
  confidence: number;
  trend: 'bullish' | 'bearish' | 'stable';
  factors: string[];
  volatility: number;
  seasonalIndex: number;
  trendStrength: number;
}

export interface ForecastSummary {
  averagePrice: number;
  peakPrice: number;
  lowestPrice: number;
  peakDay: number;
  lowestDay: number;
  overallTrend: 'bullish' | 'bearish' | 'stable';
  volatilityRisk: 'low' | 'medium' | 'high';
  confidenceLevel: number;
  profitPotential: number;
  bestSellingDays: number[];
  avoidSellingDays: number[];
}

export class TimeSeriesAnalyzer {
  private static seasonalFactors = {
    'Wheat': {
      harvest: [0.95, 0.92, 0.90, 0.95, 1.00, 1.05, 1.08, 1.10, 1.08, 1.05, 1.02, 1.00, 0.98, 0.96, 0.94],
      sowing: [1.02, 1.04, 1.06, 1.05, 1.03, 1.01, 0.99, 0.98, 1.00, 1.02, 1.04, 1.03, 1.01, 1.00, 0.99]
    },
    'Rice': {
      kharif: [1.01, 1.03, 1.05, 1.04, 1.02, 1.00, 0.98, 0.97, 0.99, 1.01, 1.03, 1.02, 1.01, 1.00, 0.99],
      rabi: [0.98, 0.96, 0.95, 0.97, 1.00, 1.03, 1.05, 1.06, 1.04, 1.02, 1.00, 0.99, 0.98, 0.97, 0.96]
    },
    'Onion': {
      volatile: [1.08, 1.12, 1.15, 1.10, 1.05, 0.98, 0.92, 0.88, 0.95, 1.05, 1.15, 1.20, 1.12, 1.08, 1.02],
      storage: [1.05, 1.08, 1.06, 1.03, 1.01, 0.98, 0.95, 0.97, 1.02, 1.06, 1.09, 1.07, 1.04, 1.02, 1.00]
    }
  };

  private static volatilityProfiles = {
    'Wheat': 0.04, 'Rice': 0.03, 'Cotton': 0.06, 'Onion': 0.15,
    'Tomato': 0.12, 'Potato': 0.08, 'Soybean': 0.05, 'Maize': 0.04, 'Sugarcane': 0.02
  };

  private static trendFactors = {
    inflation: 0.0015, // 0.15% daily inflation trend
    seasonal: 0.002,   // 0.2% seasonal adjustment
    market: 0.001      // 0.1% market sentiment
  };
  static generateAdvancedForecast(
    price: MarketPrice, 
    days: number = 15,
    options: {
      includeWeatherImpact?: boolean;
      includePolicyImpact?: boolean;
      includeGlobalFactors?: boolean;
    } = {}
  ): TimeSeriesPrediction[] {
    const basePrice = price.price.value;
    const commodity = price.commodity;
    const predictions: TimeSeriesPrediction[] = [];
    
    // Get commodity-specific parameters
    const volatility = this.volatilityProfiles[commodity as keyof typeof this.volatilityProfiles] || 0.06;
    const seasonalPattern = this.getSeasonalPattern(commodity);
    
    // Generate historical trend from current price change
    const currentTrend = price.priceChange.percentage / 100;
    let trendMomentum = Math.max(-0.05, Math.min(0.05, currentTrend * 0.3)); // Dampen trend
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      // 1. Base seasonal adjustment
      const seasonalFactor = seasonalPattern[i % seasonalPattern.length];
      
      // 2. Trend component with momentum decay
      const trendDecay = Math.pow(0.95, i); // Trend weakens over time
      const trendComponent = 1 + (trendMomentum * trendDecay);
      
      // 3. Volatility component (mean-reverting random walk)
      const randomComponent = this.generateMeanRevertingNoise(volatility, i);
      
      // 4. Market cycle component (7-day and 14-day cycles)
      const cyclicalComponent = 1 + 
        0.01 * Math.sin((i * 2 * Math.PI) / 7) +  // Weekly cycle
        0.005 * Math.sin((i * 2 * Math.PI) / 14); // Bi-weekly cycle
      
      // 5. External factors
      const externalFactor = this.calculateExternalFactors(commodity, i, options);
      
      // Combine all components
      const predictedPrice = Math.round(
        basePrice * 
        seasonalFactor * 
        trendComponent * 
        randomComponent * 
        cyclicalComponent * 
        externalFactor
      );
      
      // Calculate confidence (decreases over time, affected by volatility)
      const baseConfidence = 0.95;
      const timeDecay = Math.pow(0.98, i);
      const volatilityPenalty = 1 - (volatility * 0.5);
      const confidence = Math.max(0.5, baseConfidence * timeDecay * volatilityPenalty);
      
      // Determine trend direction
      const prevPrice = i === 0 ? basePrice : predictions[i - 1].price;
      const priceChange = (predictedPrice - prevPrice) / prevPrice;
      const trend = priceChange > 0.02 ? 'bullish' : 
                   priceChange < -0.02 ? 'bearish' : 'stable';
      
      // Calculate volatility index for this prediction
      const volatilityIndex = Math.abs(priceChange) * 100;
      
      // Calculate seasonal index
      const seasonalIndex = (seasonalFactor - 1) * 100;
      
      // Calculate trend strength
      const trendStrength = Math.abs(trendMomentum * trendDecay) * 100;
      
      predictions.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        fullDate: date.toLocaleDateString('en-IN'),
        price: predictedPrice,
        confidence,
        trend,
        factors: this.generatePriceFactors(commodity, trend, i, options),
        volatility: volatilityIndex,
        seasonalIndex,
        trendStrength
      });
      
      // Update trend momentum (mean reversion)
      trendMomentum *= 0.9; // Gradual decay
    }
    
    return predictions;
  }
  private static getSeasonalPattern(commodity: string): number[] {
    const patterns = this.seasonalFactors[commodity as keyof typeof this.seasonalFactors];
    if (!patterns) {
      // Default pattern for unknown commodities
      return [1.01, 1.02, 1.01, 1.00, 0.99, 0.99, 1.00, 1.01, 1.02, 1.01, 1.00, 0.99, 1.00, 1.01, 1.00];
    }
    
    // Choose pattern based on current season (simplified)
    const month = new Date().getMonth();
    if (commodity === 'Wheat') {
      return month >= 3 && month <= 6 ? patterns.harvest : patterns.sowing;
    } else if (commodity === 'Rice') {
      return month >= 6 && month <= 10 ? patterns.kharif : patterns.rabi;
    } else if (commodity === 'Onion') {
      return month >= 10 || month <= 2 ? patterns.storage : patterns.volatile;
    }
    
    return Object.values(patterns)[0];
  }

  private static generateMeanRevertingNoise(volatility: number, day: number): number {
    // Generate correlated noise that tends to revert to mean
    const random1 = (Math.random() - 0.5) * 2;
    const random2 = (Math.random() - 0.5) * 2;
    
    // Box-Muller transformation for normal distribution
    const normal = Math.sqrt(-2 * Math.log(Math.abs(random1))) * Math.cos(2 * Math.PI * random2);
    
    // Mean reversion factor (stronger reversion over time)
    const reversionStrength = Math.min(0.1, day * 0.005);
    const meanReversion = 1 - reversionStrength;
    
    return 1 + (normal * volatility * meanReversion);
  }

  private static calculateExternalFactors(
    commodity: string, 
    day: number, 
    options: any
  ): number {
    let factor = 1.0;
    
    // Weather impact (if enabled)
    if (options.includeWeatherImpact) {
      const weatherImpact = this.getWeatherImpact(commodity, day);
      factor *= weatherImpact;
    }
    
    // Policy impact (if enabled)
    if (options.includePolicyImpact) {
      const policyImpact = this.getPolicyImpact(commodity, day);
      factor *= policyImpact;
    }
    
    // Global factors (if enabled)
    if (options.includeGlobalFactors) {
      const globalImpact = this.getGlobalImpact(commodity, day);
      factor *= globalImpact;
    }
    
    return factor;
  }

  private static getWeatherImpact(commodity: string, day: number): number {
    // Simulate weather events with decreasing probability over time
    const weatherEventProbability = Math.max(0.02, 0.1 - (day * 0.005));
    
    if (Math.random() < weatherEventProbability) {
      // Weather event occurred
      const severity = Math.random();
      if (severity > 0.8) {
        // Severe weather - significant impact
        return ['Wheat', 'Rice', 'Cotton'].includes(commodity) ? 1.15 : 1.08;
      } else if (severity > 0.5) {
        // Moderate weather impact
        return 1.05;
      }
    }
    
    return 1.0; // No weather impact
  }
  private static getPolicyImpact(commodity: string, day: number): number {
    // Simulate policy announcements with low probability
    if (Math.random() < 0.03) {
      const policyTypes = ['msp_increase', 'export_incentive', 'import_duty', 'subsidy'];
      const policyType = policyTypes[Math.floor(Math.random() * policyTypes.length)];
      
      switch (policyType) {
        case 'msp_increase':
          return ['Wheat', 'Rice', 'Cotton'].includes(commodity) ? 1.08 : 1.02;
        case 'export_incentive':
          return 1.06;
        case 'import_duty':
          return 1.04;
        case 'subsidy':
          return 0.96; // Subsidies can reduce market prices
        default:
          return 1.0;
      }
    }
    
    return 1.0;
  }

  private static getGlobalImpact(commodity: string, day: number): number {
    // Simulate global market events
    if (Math.random() < 0.02) {
      const globalEvents = ['supply_chain', 'currency', 'international_demand', 'trade_war'];
      const eventType = globalEvents[Math.floor(Math.random() * globalEvents.length)];
      
      switch (eventType) {
        case 'supply_chain':
          return Math.random() > 0.5 ? 1.07 : 0.95;
        case 'currency':
          return Math.random() > 0.5 ? 1.05 : 0.97;
        case 'international_demand':
          return 1.08;
        case 'trade_war':
          return 0.92;
        default:
          return 1.0;
      }
    }
    
    return 1.0;
  }

  private static generatePriceFactors(
    commodity: string, 
    trend: string, 
    day: number, 
    options: any
  ): string[] {
    const commodityFactors = {
      'Wheat': {
        bullish: [
          'Export demand from Middle East increasing',
          'Monsoon delay concerns in key regions',
          'Government procurement at higher rates',
          'Storage facility shortage reported',
          'Quality premium for Indian wheat',
          'Reduced global wheat production'
        ],
        bearish: [
          'Bumper harvest in Punjab and Haryana',
          'Import policy relaxation announced',
          'MSP announcement delayed',
          'Transportation cost reduction',
          'Increased competition from Ukraine',
          'Surplus stock with government agencies'
        ],
        stable: [
          'Normal sowing progress reported',
          'Adequate storage facilities available',
          'Steady export demand maintained',
          'Regular government procurement',
          'Balanced supply-demand scenario',
          'Seasonal price stability expected'
        ]
      },
      'Onion': {
        bullish: [
          'Export ban speculation in media',
          'Storage losses due to unexpected rain',
          'Festival season demand surge',
          'Transportation strikes affecting supply',
          'Cold storage shortage in key markets',
          'Crop damage reports from Maharashtra'
        ],
        bearish: [
          'New harvest arrivals from Karnataka',
          'Import from neighboring countries',
          'Cold storage availability improved',
          'Government market intervention',
          'Oversupply in major mandis',
          'Alternative vegetables gaining preference'
        ],
        stable: [
          'Normal storage conditions maintained',
          'Steady local demand patterns',
          'Regular supply chain operations',
          'Seasonal price stability',
          'Balanced inventory levels',
          'No major policy changes expected'
        ]
      }
    };

    const defaultFactors = {
      bullish: ['Increased market demand', 'Supply constraints reported', 'Positive market sentiment', 'External demand factors'],
      bearish: ['Market oversupply conditions', 'Demand reduction observed', 'Market correction phase', 'Policy intervention expected'],
      stable: ['Normal market conditions', 'Balanced supply-demand', 'Steady demand patterns', 'Regular supply operations']
    };

    const factors = commodityFactors[commodity as keyof typeof commodityFactors] || defaultFactors;
    const trendFactors = factors[trend as keyof typeof factors] || factors.stable;
    
    // Add external factors based on options
    const selectedFactors = [...trendFactors];
    
    if (options.includeWeatherImpact && Math.random() > 0.7) {
      selectedFactors.push('Weather conditions affecting production');
    }
    
    if (options.includePolicyImpact && Math.random() > 0.8) {
      selectedFactors.push('Government policy changes expected');
    }
    
    if (options.includeGlobalFactors && Math.random() > 0.8) {
      selectedFactors.push('International market dynamics');
    }
    
    // Return 2-4 factors randomly selected
    const numFactors = Math.floor(Math.random() * 3) + 2;
    return selectedFactors
      .sort(() => Math.random() - 0.5)
      .slice(0, numFactors);
  }
  static generateForecastSummary(predictions: TimeSeriesPrediction[], currentPrice: number): ForecastSummary {
    const prices = predictions.map(p => p.price);
    const averagePrice = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
    const peakPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    
    const peakDay = predictions.findIndex(p => p.price === peakPrice) + 1;
    const lowestDay = predictions.findIndex(p => p.price === lowestPrice) + 1;
    
    // Calculate overall trend
    const bullishDays = predictions.filter(p => p.trend === 'bullish').length;
    const bearishDays = predictions.filter(p => p.trend === 'bearish').length;
    const overallTrend = bullishDays > bearishDays + 2 ? 'bullish' : 
                        bearishDays > bullishDays + 2 ? 'bearish' : 'stable';
    
    // Calculate volatility risk
    const priceRange = peakPrice - lowestPrice;
    const volatilityPercentage = (priceRange / currentPrice) * 100;
    const volatilityRisk = volatilityPercentage > 20 ? 'high' : 
                          volatilityPercentage > 10 ? 'medium' : 'low';
    
    // Calculate confidence level
    const confidenceLevel = Math.round(
      predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100
    );
    
    // Calculate profit potential
    const profitPotential = peakPrice - currentPrice;
    
    // Find best and worst selling days
    const sortedByPrice = predictions
      .map((p, index) => ({ ...p, day: index + 1 }))
      .sort((a, b) => b.price - a.price);
    
    const bestSellingDays = sortedByPrice.slice(0, 3).map(p => p.day);
    const avoidSellingDays = sortedByPrice.slice(-2).map(p => p.day);
    
    return {
      averagePrice,
      peakPrice,
      lowestPrice,
      peakDay,
      lowestDay,
      overallTrend,
      volatilityRisk,
      confidenceLevel,
      profitPotential,
      bestSellingDays,
      avoidSellingDays
    };
  }

  static generateOptimalSellingStrategy(
    predictions: TimeSeriesPrediction[], 
    currentPrice: number,
    quantity: number = 100 // quintals
  ): {
    strategy: string;
    expectedRevenue: number;
    riskLevel: string;
    recommendations: string[];
    sellingSchedule: Array<{
      day: number;
      date: string;
      quantity: number;
      expectedPrice: number;
      reasoning: string;
    }>;
  } {
    const summary = this.generateForecastSummary(predictions, currentPrice);
    
    // Determine strategy based on volatility and trend
    let strategy: string;
    let sellingSchedule: any[] = [];
    let recommendations: string[] = [];
    
    if (summary.volatilityRisk === 'high' && summary.overallTrend === 'bullish') {
      strategy = 'Gradual Selling with Peak Targeting';
      // Sell in 3 batches: 30% at good prices, 40% at peak, 30% as safety
      const batch1Day = summary.bestSellingDays[1];
      const batch2Day = summary.peakDay;
      const batch3Day = summary.bestSellingDays[2];
      
      sellingSchedule = [
        {
          day: batch1Day,
          date: predictions[batch1Day - 1].fullDate,
          quantity: Math.round(quantity * 0.3),
          expectedPrice: predictions[batch1Day - 1].price,
          reasoning: 'Secure early profits at good price'
        },
        {
          day: batch2Day,
          date: predictions[batch2Day - 1].fullDate,
          quantity: Math.round(quantity * 0.4),
          expectedPrice: predictions[batch2Day - 1].price,
          reasoning: 'Target peak price for maximum profit'
        },
        {
          day: batch3Day,
          date: predictions[batch3Day - 1].fullDate,
          quantity: Math.round(quantity * 0.3),
          expectedPrice: predictions[batch3Day - 1].price,
          reasoning: 'Safety batch to avoid market downturn'
        }
      ];
      
      recommendations = [
        'Monitor market closely for early selling opportunities',
        'Keep quality high to command premium prices',
        'Have storage backup in case of price volatility',
        'Consider forward contracts for part of the produce'
      ];
      
    } else if (summary.volatilityRisk === 'low' && summary.overallTrend === 'stable') {
      strategy = 'Steady Selling Strategy';
      // Sell in 2 equal batches at best available prices
      sellingSchedule = [
        {
          day: summary.bestSellingDays[0],
          date: predictions[summary.bestSellingDays[0] - 1].fullDate,
          quantity: Math.round(quantity * 0.5),
          expectedPrice: predictions[summary.bestSellingDays[0] - 1].price,
          reasoning: 'First batch at optimal price'
        },
        {
          day: summary.bestSellingDays[1],
          date: predictions[summary.bestSellingDays[1] - 1].fullDate,
          quantity: Math.round(quantity * 0.5),
          expectedPrice: predictions[summary.bestSellingDays[1] - 1].price,
          reasoning: 'Second batch to complete sale'
        }
      ];
      
      recommendations = [
        'Stable market allows for planned selling',
        'Focus on quality and grading for better prices',
        'Consider bulk buyers for better rates',
        'No rush - market conditions are favorable'
      ];
      
    } else {
      strategy = 'Conservative Selling Strategy';
      // Sell quickly to avoid losses
      sellingSchedule = [
        {
          day: Math.min(...summary.bestSellingDays),
          date: predictions[Math.min(...summary.bestSellingDays) - 1].fullDate,
          quantity: quantity,
          expectedPrice: predictions[Math.min(...summary.bestSellingDays) - 1].price,
          reasoning: 'Sell quickly to minimize risk exposure'
        }
      ];
      
      recommendations = [
        'Market uncertainty suggests quick selling',
        'Accept current good prices rather than wait',
        'Focus on immediate buyers and cash transactions',
        'Avoid storage costs in uncertain market'
      ];
    }
    
    const expectedRevenue = sellingSchedule.reduce(
      (total, batch) => total + (batch.quantity * batch.expectedPrice), 0
    );
    
    return {
      strategy,
      expectedRevenue,
      riskLevel: summary.volatilityRisk,
      recommendations,
      sellingSchedule
    };
  }
}