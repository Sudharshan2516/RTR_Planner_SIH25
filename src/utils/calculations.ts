// Enhanced calculations for rainwater harvesting with improved structure recommendations

export interface FeasibilityInput {
  roofArea: number;
  location: string;
  numDwellers: number;
  availableSpace: number;
  roofType: string;
  latitude?: number;
  longitude?: number;
}

export interface HarvestPrediction {
  annualRainfall: number;
  predictedHarvestLiters: number;
  runoffCoefficient: number;
  waterQualityScore: number;
  confidenceScore: number;
}

export interface StructureRecommendation {
  structureType: string;
  tankCapacity: number;
  estimatedCost: number;
  installationTimeDays: number;
  efficiencyRating: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  materials: string[];
  maintenanceFrequency: string;
  suitabilityScore: number;
}

export interface CostBenefit {
  totalCost: number;
  materialCost: number;
  laborCost: number;
  annualSavings: number;
  paybackPeriodYears: number;
  roiPercentage: number;
  environmentalBenefit: string;
}

// Enhanced location-based rainfall data
const RAINFALL_DATA: Record<string, number> = {
  'mumbai': 2200, 'delhi': 600, 'bangalore': 900, 'hyderabad': 800,
  'chennai': 1200, 'kolkata': 1600, 'pune': 700, 'ahmedabad': 800,
  'jaipur': 550, 'kochi': 3000, 'thiruvananthapuram': 1800,
  'bhubaneswar': 1400, 'guwahati': 1600, 'patna': 1100,
  'lucknow': 900, 'indore': 1000, 'nagpur': 1200, 'default': 800
};

// Roof type coefficients and characteristics
const ROOF_CHARACTERISTICS = {
  'concrete': { runoff: 0.85, quality: 85, cost_factor: 1.0 },
  'tiles': { runoff: 0.75, quality: 90, cost_factor: 1.1 },
  'metal': { runoff: 0.90, quality: 80, cost_factor: 0.9 },
  'asbestos': { runoff: 0.80, quality: 70, cost_factor: 0.8 },
  'green': { runoff: 0.40, quality: 95, cost_factor: 1.3 },
  'default': { runoff: 0.80, quality: 85, cost_factor: 1.0 }
};

export const calculateHarvestPrediction = (input: FeasibilityInput): HarvestPrediction => {
  const cityKey = input.location.toLowerCase();
  const annualRainfall = RAINFALL_DATA[cityKey] || RAINFALL_DATA.default;
  
  const roofChar = ROOF_CHARACTERISTICS[input.roofType.toLowerCase() as keyof typeof ROOF_CHARACTERISTICS] 
    || ROOF_CHARACTERISTICS.default;
  
  const predictedHarvestLiters = Math.round(
    input.roofArea * annualRainfall * roofChar.runoff * 0.001 * 1000
  );

  const confidenceScore = cityKey in RAINFALL_DATA ? 0.9 : 0.7;

  return {
    annualRainfall,
    predictedHarvestLiters,
    runoffCoefficient: roofChar.runoff,
    waterQualityScore: roofChar.quality,
    confidenceScore
  };
};

export const getStructureRecommendation = (
  input: FeasibilityInput, 
  harvest: HarvestPrediction
): StructureRecommendation => {
  const { roofArea, numDwellers, availableSpace } = input;
  const harvestVolume = harvest.predictedHarvestLiters;
  
  // Calculate optimal tank capacity (3-6 months storage)
  const dailyConsumption = numDwellers * 150; // 150L per person per day
  const storageMonths = Math.min(6, Math.max(3, harvestVolume / (dailyConsumption * 30)));
  const optimalCapacity = Math.round(dailyConsumption * storageMonths * 30);
  
  // Structure selection logic based on multiple factors
  let structureType: string;
  let dimensions: { length: number; width: number; height: number };
  let materials: string[];
  let installationDays: number;
  let costMultiplier: number;
  let suitabilityScore: number;

  if (availableSpace < 15) {
    // Limited space - overhead or compact solutions
    if (roofArea > 100) {
      structureType = 'overhead_tank_system';
      const diameter = Math.sqrt(optimalCapacity / (Math.PI * 2.5)) * 2;
      dimensions = {
        length: Math.round(diameter * 100) / 100,
        width: Math.round(diameter * 100) / 100,
        height: 2.5
      };
      materials = ['Reinforced Plastic', 'Steel Support Structure', 'PVC Pipes'];
      installationDays = 5;
      costMultiplier = 0.8;
      suitabilityScore = 75;
    } else {
      structureType = 'compact_underground_tank';
      const volume = Math.min(optimalCapacity, availableSpace * 1000);
      const depth = 2.0;
      const area = volume / (depth * 1000);
      const side = Math.sqrt(area);
      dimensions = {
        length: Math.round(side * 100) / 100,
        width: Math.round(side * 100) / 100,
        height: depth
      };
      materials = ['Concrete', 'Waterproof Membrane', 'Filtration System'];
      installationDays = 8;
      costMultiplier = 1.2;
      suitabilityScore = 80;
    }
  } else if (availableSpace >= 15 && availableSpace < 50) {
    // Medium space - standard underground tank
    structureType = 'underground_tank';
    const depth = 2.5;
    const area = optimalCapacity / (depth * 1000);
    const length = Math.sqrt(area * 1.5); // Rectangular tank
    const width = area / length;
    dimensions = {
      length: Math.round(length * 100) / 100,
      width: Math.round(width * 100) / 100,
      height: depth
    };
    materials = ['RCC Concrete', 'Waterproof Coating', 'First Flush Diverter', 'Pump System'];
    installationDays = 12;
    costMultiplier = 1.0;
    suitabilityScore = 90;
  } else {
    // Large space - modular or multiple tank system
    if (harvestVolume > 50000) {
      structureType = 'modular_tank_system';
      const numTanks = Math.ceil(optimalCapacity / 15000);
      const tankVolume = optimalCapacity / numTanks;
      const depth = 3.0;
      const area = tankVolume / (depth * 1000);
      const side = Math.sqrt(area);
      dimensions = {
        length: Math.round(side * numTanks * 100) / 100,
        width: Math.round(side * 100) / 100,
        height: depth
      };
      materials = ['Modular Concrete Blocks', 'HDPE Lining', 'Automated Control System', 'Multi-stage Filtration'];
      installationDays = 18;
      costMultiplier = 1.4;
      suitabilityScore = 95;
    } else {
      structureType = 'large_underground_tank';
      const depth = 3.0;
      const area = optimalCapacity / (depth * 1000);
      const length = Math.sqrt(area * 1.2);
      const width = area / length;
      dimensions = {
        length: Math.round(length * 100) / 100,
        width: Math.round(width * 100) / 100,
        height: depth
      };
      materials = ['RCC Concrete', 'Polymer Coating', 'Advanced Filtration', 'Monitoring System'];
      installationDays = 15;
      costMultiplier = 1.1;
      suitabilityScore = 88;
    }
  }

  // Calculate cost based on capacity and structure type
  const baseCostPerLiter = 8;
  const estimatedCost = Math.round(optimalCapacity * baseCostPerLiter * costMultiplier);

  // Efficiency rating based on structure type and conditions
  const efficiencyRating = Math.min(0.95, 0.7 + (suitabilityScore / 500));

  return {
    structureType,
    tankCapacity: optimalCapacity,
    estimatedCost,
    installationTimeDays: installationDays,
    efficiencyRating,
    dimensions,
    materials,
    maintenanceFrequency: 'Quarterly',
    suitabilityScore
  };
};

export const calculateCostBenefit = (
  input: FeasibilityInput,
  structure: StructureRecommendation,
  harvest: HarvestPrediction
): CostBenefit => {
  const materialCost = Math.round(structure.estimatedCost * 0.6);
  const laborCost = Math.round(structure.estimatedCost * 0.4);
  const totalCost = materialCost + laborCost;

  // Calculate annual savings based on water cost and reduced dependency
  const waterCostPerLiter = 0.02; // ₹0.02 per liter
  const annualWaterSavings = harvest.predictedHarvestLiters * waterCostPerLiter;
  const maintenanceCost = totalCost * 0.02; // 2% annual maintenance
  const netAnnualSavings = Math.round(annualWaterSavings - maintenanceCost);

  const paybackPeriodYears = Math.round((totalCost / netAnnualSavings) * 10) / 10;
  const roiPercentage = Math.round((netAnnualSavings / totalCost) * 100 * 10) / 10;

  // Environmental benefit calculation
  const co2Saved = harvest.predictedHarvestLiters * 0.0003; // kg CO2 per liter
  const environmentalBenefit = `${Math.round(co2Saved)} kg CO2 saved annually`;

  return {
    totalCost,
    materialCost,
    laborCost,
    annualSavings: netAnnualSavings,
    paybackPeriodYears,
    roiPercentage,
    environmentalBenefit
  };
};

// Utility function to get structure type display name
export const getStructureDisplayName = (structureType: string): string => {
  const displayNames: Record<string, string> = {
    'overhead_tank_system': 'Overhead Tank System',
    'compact_underground_tank': 'Compact Underground Tank',
    'underground_tank': 'Underground Storage Tank',
    'modular_tank_system': 'Modular Tank System',
    'large_underground_tank': 'Large Underground Tank'
  };
  
  return displayNames[structureType] || structureType.replace(/_/g, ' ').toUpperCase();
};

// Utility function to get suitability color
export const getSuitabilityColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};