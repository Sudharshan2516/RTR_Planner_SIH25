// Rule-based calculations for rainwater harvesting

export interface QuickCheckInput {
  lat: number;
  lon: number;
  roof_area_m2: number;
  roof_type: 'rcc' | 'metal' | 'tile' | 'other';
  open_space_m2: number;
  dwellers: number;
}

export interface QuickCheckResult {
  feasibility: 'high' | 'medium' | 'low';
  gross_harvest_m3: number;
  annual_rainfall_mm: number;
  runoff_coeff: number;
  recharge_volume_m3: number;
  recommended_structure: string;
  confidence: 'high' | 'medium' | 'low';
}

// Runoff coefficients by roof type
const RUNOFF_COEFFICIENTS = {
  rcc: 0.9,
  metal: 0.85,
  tile: 0.75,
  other: 0.7
};

// Default annual rainfall by region (mm)
const RAINFALL_DATA = {
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

// Recharge efficiency by soil permeability
const RECHARGE_EFFICIENCY = {
  high: 0.9,
  medium: 0.6,
  low: 0.3
};

export const calculateQuickCheck = (input: QuickCheckInput): QuickCheckResult => {
  // Get annual rainfall (simplified location-based lookup)
  const annual_rainfall_mm = RAINFALL_DATA.default; // In production, use lat/lon lookup
  
  // Get runoff coefficient
  const runoff_coeff = RUNOFF_COEFFICIENTS[input.roof_type];
  
  // Calculate gross harvest
  const gross_harvest_m3 = (input.roof_area_m2 * annual_rainfall_mm / 1000) * runoff_coeff;
  
  // Calculate recharge volume (assuming medium soil permeability)
  const recharge_volume_m3 = gross_harvest_m3 * RECHARGE_EFFICIENCY.medium;
  
  // Determine feasibility
  const water_need_per_person_m3 = 50; // 50 m³ per person per year
  const total_water_need_m3 = input.dwellers * water_need_per_person_m3;
  
  let feasibility: 'high' | 'medium' | 'low';
  if (gross_harvest_m3 >= total_water_need_m3 * 0.8) {
    feasibility = 'high';
  } else if (gross_harvest_m3 >= total_water_need_m3 * 0.4) {
    feasibility = 'medium';
  } else {
    feasibility = 'low';
  }
  
  // Recommend structure based on space and harvest volume
  let recommended_structure = 'Underground Tank';
  if (input.open_space_m2 < 10) {
    recommended_structure = 'Overhead Tank';
  } else if (gross_harvest_m3 > 50) {
    recommended_structure = 'Modular Tank System';
  }
  
  return {
    feasibility,
    gross_harvest_m3: Math.round(gross_harvest_m3 * 100) / 100,
    annual_rainfall_mm,
    runoff_coeff,
    recharge_volume_m3: Math.round(recharge_volume_m3 * 100) / 100,
    recommended_structure,
    confidence: 'medium' // Rule-based has medium confidence
  };
};

export const calculateStructureDimensions = (volume_m3: number, structure_type: string) => {
  switch (structure_type) {
    case 'Underground Tank':
      const depth = 2.5;
      const area = volume_m3 / depth;
      const diameter = Math.sqrt(area / Math.PI) * 2;
      return {
        diameter_m: Math.round(diameter * 100) / 100,
        depth_m: depth,
        volume_m3
      };
    
    case 'Overhead Tank':
      return {
        diameter_m: Math.round(Math.sqrt(volume_m3 / Math.PI / 2) * 2 * 100) / 100,
        height_m: 2.0,
        volume_m3
      };
    
    default:
      return {
        length_m: Math.round(Math.pow(volume_m3, 1/3) * 100) / 100,
        width_m: Math.round(Math.pow(volume_m3, 1/3) * 100) / 100,
        height_m: Math.round(Math.pow(volume_m3, 1/3) * 100) / 100,
        volume_m3
      };
  }
};

export const calculateCostEstimate = (volume_m3: number, structure_type: string) => {
  const base_cost_per_m3 = {
    'Underground Tank': 8000,
    'Overhead Tank': 6000,
    'Modular Tank System': 10000
  };
  
  const cost_per_m3 = base_cost_per_m3[structure_type as keyof typeof base_cost_per_m3] || 7000;
  const material_cost = volume_m3 * cost_per_m3;
  const labor_cost = material_cost * 0.3;
  const total_cost = material_cost + labor_cost;
  
  // Calculate payback (assuming water cost savings)
  const annual_water_savings = volume_m3 * 20; // ₹20 per m³ saved
  const payback_years = total_cost / annual_water_savings;
  
  return {
    material_cost: Math.round(material_cost),
    labor_cost: Math.round(labor_cost),
    total_cost: Math.round(total_cost),
    annual_savings: Math.round(annual_water_savings),
    payback_years: Math.round(payback_years * 10) / 10
  };
};