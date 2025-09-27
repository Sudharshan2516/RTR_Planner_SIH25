// Rainwater harvesting calculation utilities

export interface FeasibilityInput {
  roofArea: number; // in square meters
  location: string;
  numDwellers: number;
  availableSpace: number; // in square meters
  roofType: string;
}

export interface HarvestPrediction {
  annualRainfall: number; // in mm
  predictedHarvestLiters: number;
  runoffCoefficient: number;
  waterQualityScore: number;
  confidenceScore: number;
}

export interface StructureRecommendation {
  structureType: string;
  tankCapacity: number; // in liters
  estimatedCost: number; // in INR
  installationTimeDays: number;
  maintenanceFrequency: string;
  efficiencyRating: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  materials: string[];
}

export interface CostAnalysis {
  materialCosts: number;
  laborCosts: number;
  equipmentCosts: number;
  totalCost: number;
  paybackPeriodYears: number;
  annualSavings: number;
  roiPercentage: number;
}

// Rainfall data for different locations (mm/year)
const locationRainfall: Record<string, number> = {
  'mumbai': 2200,
  'delhi': 600,
  'bangalore': 900,
  'hyderabad': 800,
  'chennai': 1200,
  'kolkata': 1600,
  'pune': 700,
  'ahmedabad': 800,
  'jaipur': 550,
  'kochi': 3000,
  'default': 800
};

// Runoff coefficients for different roof types
const roofTypeCoefficients: Record<string, number> = {
  'concrete': 0.85,
  'tiles': 0.75,
  'metal': 0.90,
  'asbestos': 0.80,
  'green': 0.40,
  'default': 0.80
};

export const calculateHarvestPrediction = (input: FeasibilityInput): HarvestPrediction => {
  const cityKey = input.location.toLowerCase();
  const annualRainfall = locationRainfall[cityKey] || locationRainfall.default;
  
  const runoffCoefficient = roofTypeCoefficients[input.roofType.toLowerCase()] || roofTypeCoefficients.default;
  
  // Calculate harvestable rainwater (liters)
  // Formula: Area (m²) × Rainfall (mm) × Runoff Coefficient × 0.001 (conversion factor)
  const predictedHarvestLiters = Math.round(
    input.roofArea * annualRainfall * runoffCoefficient * 0.001 * 1000
  );
  
  // Water quality score based on roof type and location
  let waterQualityScore = 85;
  if (input.roofType === 'metal') waterQualityScore = 90;
  if (input.roofType === 'green') waterQualityScore = 95;
  if (input.roofType === 'asbestos') waterQualityScore = 70;
  
  // Confidence score based on data availability
  const confidenceScore = cityKey in locationRainfall ? 0.9 : 0.7;
  
  return {
    annualRainfall,
    predictedHarvestLiters,
    runoffCoefficient,
    waterQualityScore,
    confidenceScore
  };
};

export const getStructureRecommendation = (
  input: FeasibilityInput,
  prediction: HarvestPrediction
): StructureRecommendation => {
  const dailyWaterNeed = input.numDwellers * 135; // 135 liters per person per day (WHO recommendation)
  const monthlyWaterNeed = dailyWaterNeed * 30;
  
  // Determine tank capacity based on monthly water needs and harvest potential
  let tankCapacity = Math.min(
    prediction.predictedHarvestLiters * 0.3, // Store 30% of annual harvest
    monthlyWaterNeed * 2 // Or 2 months of water needs
  );
  
  tankCapacity = Math.max(tankCapacity, 5000); // Minimum 5000 liters
  tankCapacity = Math.min(tankCapacity, 50000); // Maximum 50000 liters
  
  // Determine structure type based on space and capacity
  let structureType = 'underground_tank';
  if (input.availableSpace < 10) {
    structureType = 'overhead_tank';
  } else if (tankCapacity > 20000) {
    structureType = 'modular_tank_system';
  }
  
  // Calculate dimensions
  const depth = 2.5; // meters
  const area = tankCapacity / 1000 / depth; // tank capacity in cubic meters divided by depth
  const length = Math.sqrt(area * 1.2); // slightly rectangular
  const width = area / length;
  
  // Estimate costs
  const baseCostPerLiter = structureType === 'underground_tank' ? 25 : 30;
  const materialCosts = tankCapacity * baseCostPerLiter;
  const laborCosts = materialCosts * 0.4;
  const equipmentCosts = materialCosts * 0.3;
  const estimatedCost = materialCosts + laborCosts + equipmentCosts;
  
  // Installation time based on capacity and structure type
  let installationTimeDays = 7;
  if (tankCapacity > 20000) installationTimeDays = 14;
  if (structureType === 'underground_tank') installationTimeDays += 5;
  
  return {
    structureType,
    tankCapacity: Math.round(tankCapacity),
    estimatedCost: Math.round(estimatedCost),
    installationTimeDays,
    maintenanceFrequency: 'quarterly',
    efficiencyRating: prediction.runoffCoefficient,
    dimensions: {
      length: Math.round(length * 10) / 10,
      width: Math.round(width * 10) / 10,
      height: depth
    },
    materials: getMaterialsList(structureType)
  };
};

const getMaterialsList = (structureType: string): string[] => {
  const commonMaterials = [
    'Reinforced Concrete/Plastic Tank',
    'PVC/HDPE Pipes',
    'First Flush Diverter',
    'Leaf Catcher',
    'Storage Tank Cover',
    'Tap/Outlet Valve'
  ];
  
  if (structureType === 'underground_tank') {
    return [
      ...commonMaterials,
      'Waterproof Membrane',
      'Submersible Pump',
      'Excavation Work'
    ];
  } else if (structureType === 'modular_tank_system') {
    return [
      ...commonMaterials,
      'Modular Tank Units',
      'Steel Frame Support',
      'Distribution Manifold'
    ];
  }
  
  return commonMaterials;
};

export const calculateCostBenefit = (
  input: FeasibilityInput,
  recommendation: StructureRecommendation,
  prediction: HarvestPrediction
): CostAnalysis => {
  const totalCost = recommendation.estimatedCost;
  const materialCosts = totalCost * 0.5;
  const laborCosts = totalCost * 0.3;
  const equipmentCosts = totalCost * 0.2;
  
  // Calculate annual savings
  const waterCostPerLiter = 0.02; // Average ₹0.02 per liter
  const annualWaterSavings = prediction.predictedHarvestLiters * waterCostPerLiter;
  const annualMaintenanceCost = totalCost * 0.03; // 3% of total cost annually
  const netAnnualSavings = annualWaterSavings - annualMaintenanceCost;
  
  // Calculate payback period
  const paybackPeriodYears = totalCost / netAnnualSavings;
  
  // Calculate ROI
  const roiPercentage = (netAnnualSavings / totalCost) * 100;
  
  return {
    materialCosts: Math.round(materialCosts),
    laborCosts: Math.round(laborCosts),
    equipmentCosts: Math.round(equipmentCosts),
    totalCost: Math.round(totalCost),
    paybackPeriodYears: Math.round(paybackPeriodYears * 10) / 10,
    annualSavings: Math.round(netAnnualSavings),
    roiPercentage: Math.round(roiPercentage * 10) / 10
  };
};

export const calculateGamificationPoints = (
  harvestLiters: number,
  costSavings: number,
  projectStatus: string
): number => {
  let points = 0;
  
  // Base points for water harvesting potential
  points += Math.round(harvestLiters / 1000) * 10; // 10 points per 1000 liters
  
  // Bonus points for cost savings
  points += Math.round(costSavings / 1000) * 5; // 5 points per ₹1000 saved
  
  // Milestone bonuses
  if (projectStatus === 'completed') points += 500;
  if (projectStatus === 'approved') points += 200;
  if (projectStatus === 'submitted') points += 100;
  
  return Math.max(points, 50); // Minimum 50 points
};

export const getBadges = (
  totalPoints: number,
  waterSaved: number,
  projectsCompleted: number
): string[] => {
  const badges: string[] = [];
  
  if (totalPoints >= 1000) badges.push('water_warrior');
  if (totalPoints >= 5000) badges.push('conservation_champion');
  if (totalPoints >= 10000) badges.push('eco_hero');
  
  if (waterSaved >= 50000) badges.push('water_saver');
  if (waterSaved >= 200000) badges.push('aqua_guardian');
  
  if (projectsCompleted >= 1) badges.push('project_starter');
  if (projectsCompleted >= 5) badges.push('serial_harvester');
  
  return badges;
};