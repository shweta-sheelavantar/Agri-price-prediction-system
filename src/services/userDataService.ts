/**
 * User Data Service - Centralized data flow management
 * Ensures consistent auto-population across Farm Profile and Inventory
 */

import { UserProfile } from '../lib/supabase';

export interface FarmerData {
  id: string;
  fullName: string;
  phone: string;
  profession: string;
  landSize: number;
  landUnit: 'acre' | 'hectare';
  primaryCrop: string;
  cropCycle: string;
  equipment: string[];
  location: {
    state: string;
    district: string;
    village: string;
  };
}

export class UserDataService {
  /**
   * Extract comprehensive farmer data from user profile and metadata
   * Returns null if essential data is missing
   */
  static extractFarmerData(user: any, profile: UserProfile | null): FarmerData | null {
    if (!user || !profile) {
      console.log('⚠️ Missing user or profile data');
      return null;
    }

    const userData = {
      ...profile,
      ...user?.user_metadata
    };

    // Check for essential data
    if (!userData?.full_name || !userData?.primary_crop || !userData?.land_size) {
      console.log('⚠️ Essential profile data missing:', {
        hasName: !!userData?.full_name,
        hasCrop: !!userData?.primary_crop,
        hasLandSize: !!userData?.land_size
      });
      return null;
    }

    return {
      id: user.id,
      fullName: userData.full_name,
      phone: userData.phone || '',
      profession: userData.profession || 'farmer',
      landSize: userData.land_size,
      landUnit: userData.land_unit || 'acre',
      primaryCrop: userData.primary_crop,
      cropCycle: userData.crop_cycle || 'Kharif',
      equipment: userData.equipment || ['Basic Tools'],
      location: {
        state: userData?.location?.state || userData?.state || '',
        district: userData?.location?.district || userData?.district || '',
        village: userData?.location?.village || userData?.village || ''
      }
    };
  }

  /**
   * Generate farm profile data from farmer data (Flow 4 → Flow 6)
   */
  static generateFarmProfile(farmerData: FarmerData | null) {
    if (!farmerData) {
      console.log('⚠️ Cannot generate farm profile without farmer data');
      return null;
    }
    return {
      id: farmerData.id,
      userId: farmerData.id,
      farmName: `${farmerData.fullName}'s Farm`,
      location: {
        ...farmerData.location,
        coordinates: { lat: 12.9716, lng: 77.5946 }
      },
      landArea: {
        total: farmerData.landSize,
        unit: farmerData.landUnit
      },
      soilType: this.getSoilTypeForRegion(farmerData.location.state),
      irrigationType: this.getIrrigationForCrop(farmerData.primaryCrop),
      cropHistory: this.generateCropHistory(farmerData),
      iotDevices: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      description: `${farmerData.fullName}'s sustainable farming operation specializing in ${farmerData.primaryCrop} production. Located in ${farmerData.location.village}, ${farmerData.location.district}, ${farmerData.location.state}. Using modern ${farmerData.equipment.join(', ')} for optimal yield.`,
      certifications: this.getCertificationsForFarmer(farmerData),
      farmingMethods: [...farmerData.equipment, 'Organic Farming', 'Crop Rotation']
    };
  }

  /**
   * Generate inventory items from farmer data (Flow 4 → Flow 7)
   */
  static generateInventoryItems(farmerData: FarmerData | null) {
    if (!farmerData) {
      console.log('⚠️ Cannot generate inventory without farmer data');
      return [];
    }
    const inventory = [];

    // 1. Seeds based on primary crop
    inventory.push({
      id: '1',
      farmId: farmerData.id,
      category: 'seed' as const,
      name: `${farmerData.primaryCrop} Seeds - ${this.getVarietyForCrop(farmerData.primaryCrop)}`,
      quantity: Math.ceil(farmerData.landSize * this.getSeedRequirement(farmerData.primaryCrop)),
      unit: this.getSeedUnit(farmerData.primaryCrop),
      reorderThreshold: Math.ceil(farmerData.landSize * this.getSeedRequirement(farmerData.primaryCrop) * 0.3),
      cost: this.getSeedCost(farmerData.primaryCrop),
      purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      supplier: 'Premium AgriSeeds Ltd.',
      notes: `High-yield ${farmerData.primaryCrop.toLowerCase()} variety certified for ${farmerData.location.state} region`
    });

    // 2. Fertilizers
    inventory.push(...this.getFertilizersForCrop(farmerData.primaryCrop, farmerData.landSize, farmerData.id));

    // 3. Equipment-specific items
    farmerData.equipment.forEach((equipment, index) => {
      inventory.push(...this.getInventoryForEquipment(equipment, farmerData.id, index + 10));
    });

    // 4. Pesticides
    inventory.push(...this.getPesticidesForCrop(farmerData.primaryCrop, farmerData.landSize, farmerData.id));

    // 5. General supplies
    inventory.push(...this.getGeneralSupplies(farmerData.landSize, farmerData.id));

    return inventory;
  }

  // Helper methods
  private static getVarietyForCrop(crop: string) {
    const varieties: { [key: string]: string } = {
      'Wheat': 'HD-2967', 'Rice': 'Basmati-370', 'Cotton': 'Bt-Cotton',
      'Sugarcane': 'Co-86032', 'Maize': 'Pioneer-30V92', 'Soybean': 'JS-335',
      'Groundnut': 'TAG-24', 'Tomato': 'Arka Rakshak', 'Onion': 'Bangalore Rose'
    };
    return varieties[crop] || 'Premium Variety';
  }

  private static getSeedRequirement(crop: string) {
    const requirements: { [key: string]: number } = {
      'Wheat': 2.5, 'Rice': 1.5, 'Cotton': 0.8, 'Maize': 1.2,
      'Soybean': 3, 'Groundnut': 4, 'Tomato': 0.2, 'Onion': 0.5
    };
    return requirements[crop] || 2;
  }

  private static getSeedUnit(crop: string) {
    const units: { [key: string]: string } = {
      'Wheat': 'kg', 'Rice': 'kg', 'Cotton': 'packets', 'Maize': 'kg',
      'Tomato': 'grams', 'Onion': 'kg'
    };
    return units[crop] || 'kg';
  }

  private static getSeedCost(crop: string) {
    const costs: { [key: string]: number } = {
      'Wheat': 150, 'Rice': 200, 'Cotton': 500, 'Maize': 180,
      'Soybean': 250, 'Tomato': 2000, 'Onion': 300
    };
    return costs[crop] || 150;
  }

  private static getSoilTypeForRegion(state: string) {
    const soilTypes: { [key: string]: string } = {
      'Karnataka': 'Red Loamy Soil',
      'Punjab': 'Alluvial Soil',
      'Maharashtra': 'Black Cotton Soil',
      'Tamil Nadu': 'Red Sandy Loam',
      'Uttar Pradesh': 'Alluvial Soil',
      'Rajasthan': 'Sandy Soil'
    };
    return soilTypes[state] || 'Loamy Soil';
  }

  private static getIrrigationForCrop(crop: string) {
    const irrigation: { [key: string]: string } = {
      'Rice': 'Flood Irrigation',
      'Sugarcane': 'Drip Irrigation',
      'Cotton': 'Drip Irrigation',
      'Wheat': 'Sprinkler Irrigation',
      'Tomato': 'Drip Irrigation',
      'Onion': 'Drip Irrigation'
    };
    return irrigation[crop] || 'Drip Irrigation';
  }

  private static generateCropHistory(farmerData: FarmerData) {
    const getYieldPerAcre = (crop: string) => {
      const yields: { [key: string]: number } = {
        'Wheat': 25, 'Rice': 30, 'Cotton': 15, 'Sugarcane': 400,
        'Maize': 35, 'Soybean': 20, 'Groundnut': 18, 'Tomato': 200,
        'Onion': 150, 'Potato': 180
      };
      return yields[crop] || 25;
    };

    const getPricePerQuintal = (crop: string) => {
      const prices: { [key: string]: number } = {
        'Wheat': 2500, 'Rice': 3000, 'Cotton': 6000, 'Sugarcane': 350,
        'Maize': 2200, 'Soybean': 4500, 'Groundnut': 5500, 'Tomato': 1500,
        'Onion': 2000, 'Potato': 1200
      };
      return prices[crop] || 2500;
    };

    return [
      {
        season: `${farmerData.cropCycle} 2024`,
        year: 2024,
        cropType: farmerData.primaryCrop,
        variety: this.getVarietyForCrop(farmerData.primaryCrop),
        areaPlanted: farmerData.landSize,
        yield: farmerData.landSize * getYieldPerAcre(farmerData.primaryCrop),
        revenue: farmerData.landSize * getYieldPerAcre(farmerData.primaryCrop) * getPricePerQuintal(farmerData.primaryCrop)
      },
      {
        season: `${farmerData.cropCycle} 2023`,
        year: 2023,
        cropType: farmerData.primaryCrop,
        variety: this.getVarietyForCrop(farmerData.primaryCrop),
        areaPlanted: farmerData.landSize * 0.8,
        yield: farmerData.landSize * 0.8 * getYieldPerAcre(farmerData.primaryCrop) * 0.9,
        revenue: farmerData.landSize * 0.8 * getYieldPerAcre(farmerData.primaryCrop) * 0.9 * getPricePerQuintal(farmerData.primaryCrop) * 0.85
      }
    ];
  }

  private static getCertificationsForFarmer(farmerData: FarmerData) {
    const certifications = ['Good Agricultural Practices (GAP)'];
    
    if (farmerData.equipment.some(eq => eq.toLowerCase().includes('organic'))) {
      certifications.push('Organic Farming Certification');
    }
    if (farmerData.landSize >= 10) {
      certifications.push('Progressive Farmer Award');
    }
    if (farmerData.equipment.some(eq => eq.toLowerCase().includes('drip'))) {
      certifications.push('Water Conservation Certificate');
    }
    
    return certifications;
  }

  private static getFertilizersForCrop(crop: string, landSize: number, farmId: string) {
    const baseFertilizers = [
      {
        id: '2',
        farmId,
        category: 'fertilizer' as const,
        name: 'NPK Fertilizer (10:26:26)',
        quantity: Math.ceil(landSize * 3),
        unit: 'bags',
        reorderThreshold: Math.ceil(landSize * 1),
        cost: 800,
        purchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        supplier: 'FertilizerMax Ltd.',
        notes: 'Balanced nutrition for optimal crop growth'
      },
      {
        id: '3',
        farmId,
        category: 'fertilizer' as const,
        name: 'Organic Compost',
        quantity: Math.ceil(landSize * 5),
        unit: 'bags',
        reorderThreshold: Math.ceil(landSize * 2),
        cost: 300,
        purchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        supplier: 'EcoFarm Supplies',
        notes: 'Improves soil health and water retention'
      }
    ];

    if (['Rice', 'Wheat'].includes(crop)) {
      baseFertilizers.push({
        id: '4',
        farmId,
        category: 'fertilizer' as const,
        name: 'Urea (46% N)',
        quantity: Math.ceil(landSize * 2),
        unit: 'bags',
        reorderThreshold: Math.ceil(landSize * 0.5),
        cost: 600,
        purchaseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        supplier: 'National Fertilizers',
        notes: 'High nitrogen content for cereal crops'
      });
    }

    return baseFertilizers;
  }

  private static getInventoryForEquipment(equipment: string, farmId: string, startId: number) {
    const equipmentInventory: any[] = [];

    if (equipment.toLowerCase().includes('tractor')) {
      equipmentInventory.push({
        id: `${startId}`,
        farmId,
        category: 'equipment',
        name: 'Tractor Engine Oil (15W-40)',
        quantity: 4,
        unit: 'liters',
        reorderThreshold: 1,
        cost: 800,
        purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        supplier: 'MachineMax Parts',
        notes: 'High-grade engine oil for tractor maintenance'
      });
    }

    if (equipment.toLowerCase().includes('sprayer')) {
      equipmentInventory.push({
        id: `${startId + 1}`,
        farmId,
        category: 'equipment',
        name: 'Sprayer Nozzles (Set of 4)',
        quantity: 2,
        unit: 'sets',
        reorderThreshold: 1,
        cost: 350,
        purchaseDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        supplier: 'AgriTech Solutions',
        notes: 'Replacement nozzles for uniform spray pattern'
      });
    }

    if (equipment.toLowerCase().includes('drip')) {
      equipmentInventory.push({
        id: `${startId + 2}`,
        farmId,
        category: 'equipment',
        name: 'Drip Irrigation Pipes',
        quantity: 500,
        unit: 'meters',
        reorderThreshold: 100,
        cost: 25,
        purchaseDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        supplier: 'Irrigation Systems Ltd.',
        notes: 'High-quality pipes for drip irrigation system'
      });
    }

    return equipmentInventory;
  }

  private static getPesticidesForCrop(crop: string, landSize: number, farmId: string) {
    return [
      {
        id: '20',
        farmId,
        category: 'pesticide',
        name: `Bio-Pesticide for ${crop}`,
        quantity: Math.ceil(landSize * 0.5),
        unit: 'liters',
        reorderThreshold: Math.ceil(landSize * 0.2),
        cost: 450,
        purchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        supplier: 'BioProtect Solutions',
        notes: `Organic pest control solution specifically for ${crop.toLowerCase()} crops`
      },
      {
        id: '21',
        farmId,
        category: 'pesticide',
        name: 'Fungicide Spray',
        quantity: Math.ceil(landSize * 0.3),
        unit: 'liters',
        reorderThreshold: 1,
        cost: 600,
        purchaseDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        supplier: 'CropCare Ltd.',
        notes: 'Prevents fungal diseases in crops'
      }
    ];
  }

  private static getGeneralSupplies(landSize: number, farmId: string) {
    return [
      {
        id: '30',
        farmId,
        category: 'equipment',
        name: 'Mulching Film',
        quantity: Math.ceil(landSize * 2),
        unit: 'rolls',
        reorderThreshold: Math.ceil(landSize * 0.5),
        cost: 200,
        purchaseDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
        supplier: 'AgriFilm Industries',
        notes: 'Biodegradable mulching film for weed control'
      },
      {
        id: '31',
        farmId,
        category: 'equipment',
        name: 'Soil pH Test Kit',
        quantity: 2,
        unit: 'kits',
        reorderThreshold: 1,
        cost: 150,
        purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        supplier: 'SoilTech Labs',
        notes: 'Regular soil testing for optimal crop growth'
      }
    ];
  }
}