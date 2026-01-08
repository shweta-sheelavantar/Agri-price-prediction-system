/**
 * Farming Economics Service - Realistic financial calculations
 * Based on actual farming costs, yields, and market prices
 */

export interface CropEconomics {
  seedCostPerAcre: number;
  fertilizerCostPerAcre: number;
  pesticideCostPerAcre: number;
  laborCostPerAcre: number;
  otherCostsPerAcre: number;
  expectedYieldPerAcre: number; // quintals
  currentMarketPrice: number; // per quintal
}

export interface FarmFinancials {
  totalInvestment: number;
  expectedRevenue: number;
  expectedProfit: number;
  profitMargin: number;
  breakEvenPrice: number;
  costBreakdown: {
    seeds: number;
    fertilizers: number;
    pesticides: number;
    labor: number;
    equipment: number;
    other: number;
  };
}

export class FarmingEconomics {
  // Real crop economics data based on Indian farming
  private static cropEconomics: { [key: string]: CropEconomics } = {
    'Wheat': {
      seedCostPerAcre: 1200,
      fertilizerCostPerAcre: 3500,
      pesticideCostPerAcre: 800,
      laborCostPerAcre: 4000,
      otherCostsPerAcre: 1500,
      expectedYieldPerAcre: 20, // quintals
      currentMarketPrice: 2300
    },
    'Rice': {
      seedCostPerAcre: 800,
      fertilizerCostPerAcre: 4000,
      pesticideCostPerAcre: 1200,
      laborCostPerAcre: 5000,
      otherCostsPerAcre: 2000,
      expectedYieldPerAcre: 25,
      currentMarketPrice: 2800
    },
    'Cotton': {
      seedCostPerAcre: 2500,
      fertilizerCostPerAcre: 5000,
      pesticideCostPerAcre: 3000,
      laborCostPerAcre: 6000,
      otherCostsPerAcre: 2500,
      expectedYieldPerAcre: 8,
      currentMarketPrice: 6500
    },
    'Sugarcane': {
      seedCostPerAcre: 8000,
      fertilizerCostPerAcre: 6000,
      pesticideCostPerAcre: 2000,
      laborCostPerAcre: 8000,
      otherCostsPerAcre: 4000,
      expectedYieldPerAcre: 350,
      currentMarketPrice: 350
    },
    'Onion': {
      seedCostPerAcre: 3000,
      fertilizerCostPerAcre: 4500,
      pesticideCostPerAcre: 2500,
      laborCostPerAcre: 7000,
      otherCostsPerAcre: 3000,
      expectedYieldPerAcre: 120,
      currentMarketPrice: 2500
    },
    'Tomato': {
      seedCostPerAcre: 4000,
      fertilizerCostPerAcre: 6000,
      pesticideCostPerAcre: 3500,
      laborCostPerAcre: 8000,
      otherCostsPerAcre: 4500,
      expectedYieldPerAcre: 180,
      currentMarketPrice: 1800
    },
    'Potato': {
      seedCostPerAcre: 5000,
      fertilizerCostPerAcre: 4000,
      pesticideCostPerAcre: 2000,
      laborCostPerAcre: 6000,
      otherCostsPerAcre: 3000,
      expectedYieldPerAcre: 150,
      currentMarketPrice: 1500
    },
    'Soybean': {
      seedCostPerAcre: 1500,
      fertilizerCostPerAcre: 3000,
      pesticideCostPerAcre: 1500,
      laborCostPerAcre: 4500,
      otherCostsPerAcre: 1500,
      expectedYieldPerAcre: 15,
      currentMarketPrice: 4200
    },
    'Maize': {
      seedCostPerAcre: 1800,
      fertilizerCostPerAcre: 3500,
      pesticideCostPerAcre: 1000,
      laborCostPerAcre: 4000,
      otherCostsPerAcre: 1700,
      expectedYieldPerAcre: 28,
      currentMarketPrice: 2100
    },
    'Groundnut': {
      seedCostPerAcre: 2000,
      fertilizerCostPerAcre: 3000,
      pesticideCostPerAcre: 1500,
      laborCostPerAcre: 5000,
      otherCostsPerAcre: 2000,
      expectedYieldPerAcre: 12,
      currentMarketPrice: 5800
    }
  };

  /**
   * Calculate realistic farm financials based on crop, land size, and equipment
   */
  static calculateFarmFinancials(
    crop: string, 
    landSize: number, 
    equipment: string[] = [],
    seasons: number = 1
  ): FarmFinancials {
    const cropData = this.cropEconomics[crop] || this.cropEconomics['Wheat'];
    
    // Calculate base costs per acre
    const seedCost = cropData.seedCostPerAcre * landSize;
    const fertilizerCost = cropData.fertilizerCostPerAcre * landSize;
    const pesticideCost = cropData.pesticideCostPerAcre * landSize;
    const laborCost = cropData.laborCostPerAcre * landSize;
    const otherCosts = cropData.otherCostsPerAcre * landSize;
    
    // Equipment cost adjustments (reduce labor costs if mechanized)
    let equipmentCost = 0;
    let laborReduction = 0;
    let adjustedFertilizerCost = fertilizerCost;
    
    if (equipment.includes('Tractor')) {
      equipmentCost += 2000 * landSize; // Fuel + maintenance
      laborReduction += 0.3; // 30% labor reduction
    }
    if (equipment.includes('Harvester')) {
      equipmentCost += 1500 * landSize;
      laborReduction += 0.2;
    }
    if (equipment.includes('Sprayer')) {
      equipmentCost += 500 * landSize;
      laborReduction += 0.1;
    }
    if (equipment.includes('Drip Irrigation')) {
      equipmentCost += 1000 * landSize;
      // Drip irrigation reduces water and fertilizer costs
      adjustedFertilizerCost *= 0.85;
    }
    
    // Apply labor reduction
    const adjustedLaborCost = laborCost * (1 - Math.min(laborReduction, 0.5));
    
    // Calculate total investment for the season
    const totalInvestment = seedCost + adjustedFertilizerCost + pesticideCost + 
                           adjustedLaborCost + equipmentCost + otherCosts;
    
    // Calculate expected revenue
    const expectedYield = cropData.expectedYieldPerAcre * landSize;
    const expectedRevenue = expectedYield * cropData.currentMarketPrice;
    
    // Calculate profit
    const expectedProfit = expectedRevenue - totalInvestment;
    const profitMargin = (expectedProfit / expectedRevenue) * 100;
    
    // Break-even price calculation
    const breakEvenPrice = totalInvestment / expectedYield;
    
    return {
      totalInvestment: Math.round(totalInvestment * seasons),
      expectedRevenue: Math.round(expectedRevenue * seasons),
      expectedProfit: Math.round(expectedProfit * seasons),
      profitMargin: Math.round(profitMargin * 10) / 10,
      breakEvenPrice: Math.round(breakEvenPrice),
      costBreakdown: {
        seeds: Math.round(seedCost * seasons),
        fertilizers: Math.round(fertilizerCost * seasons),
        pesticides: Math.round(pesticideCost * seasons),
        labor: Math.round(adjustedLaborCost * seasons),
        equipment: Math.round(equipmentCost * seasons),
        other: Math.round(otherCosts * seasons)
      }
    };
  }

  /**
   * Generate realistic crop history with proper financial data
   */
  static generateCropHistory(crop: string, landSize: number, equipment: string[]) {
    const currentYear = new Date().getFullYear();
    const financials = this.calculateFarmFinancials(crop, landSize, equipment);
    
    return [
      {
        season: `Kharif ${currentYear}`,
        year: currentYear,
        cropType: crop,
        variety: this.getVarietyForCrop(crop),
        areaPlanted: landSize,
        yield: Math.round((financials.expectedRevenue / this.cropEconomics[crop]?.currentMarketPrice || 2500) * 0.95), // 95% of expected
        revenue: Math.round(financials.expectedRevenue * 0.95),
        investment: financials.totalInvestment,
        profit: Math.round(financials.expectedProfit * 0.95)
      },
      {
        season: `Kharif ${currentYear - 1}`,
        year: currentYear - 1,
        cropType: crop,
        variety: this.getVarietyForCrop(crop),
        areaPlanted: landSize,
        yield: Math.round((financials.expectedRevenue / this.cropEconomics[crop]?.currentMarketPrice || 2500) * 0.88), // 88% of expected (previous year)
        revenue: Math.round(financials.expectedRevenue * 0.88),
        investment: Math.round(financials.totalInvestment * 0.92), // Slightly lower costs
        profit: Math.round(financials.expectedRevenue * 0.88 - financials.totalInvestment * 0.92)
      }
    ];
  }

  /**
   * Calculate realistic inventory costs based on actual usage
   */
  static calculateInventoryCosts(crop: string, landSize: number, equipment: string[]) {
    const cropData = this.cropEconomics[crop] || this.cropEconomics['Wheat'];
    const financials = this.calculateFarmFinancials(crop, landSize, equipment);
    
    return {
      totalInventoryValue: financials.costBreakdown.seeds + 
                          financials.costBreakdown.fertilizers + 
                          financials.costBreakdown.pesticides,
      seedsValue: financials.costBreakdown.seeds,
      fertilizersValue: financials.costBreakdown.fertilizers,
      pesticidesValue: financials.costBreakdown.pesticides,
      equipmentMaintenanceValue: financials.costBreakdown.equipment
    };
  }

  private static getVarietyForCrop(crop: string): string {
    const varieties: { [key: string]: string } = {
      'Wheat': 'HD-2967',
      'Rice': 'Basmati-370',
      'Cotton': 'Bt-Cotton',
      'Sugarcane': 'Co-86032',
      'Maize': 'Pioneer-30V92',
      'Soybean': 'JS-335',
      'Groundnut': 'TAG-24',
      'Tomato': 'Arka Rakshak',
      'Onion': 'Bangalore Rose',
      'Potato': 'Kufri Jyoti'
    };
    return varieties[crop] || 'Local Variety';
  }

  /**
   * Get realistic market price with some variation
   */
  static getCurrentMarketPrice(crop: string): number {
    const basePrice = this.cropEconomics[crop]?.currentMarketPrice || 2500;
    // Add 5-10% random variation to simulate market fluctuations
    const variation = 0.05 + Math.random() * 0.05;
    const isPositive = Math.random() > 0.5;
    return Math.round(basePrice * (1 + (isPositive ? variation : -variation)));
  }
}