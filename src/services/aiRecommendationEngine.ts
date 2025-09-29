// AI-driven Recommendation Engine for Rainwater Harvesting Systems

export interface AIInput {
  roofArea: number;
  location: string;
  coordinates: { lat: number; lng: number };
  annualRainfall: number;
  groundwaterDepth: number;
  soilType: string;
  roofType: string;
  availableSpace: number;
  numDwellers: number;
  budget?: number;
  waterDemand: number;
}

export interface AIRecommendation {
  systemType: string;
  confidence: number;
  reasoning: string[];
  alternativeOptions: string[];
  feasibilityScore: number;
  scoreBreakdown: {
    rainfall: number;
    roofSuitability: number;
    spaceAvailability: number;
    groundwaterConditions: number;
    costEffectiveness: number;
  };
}

export interface StructureSpecs {
  type: string;
  capacity: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    diameter?: number;
  };
  materials: string[];
  estimatedCost: number;
  installationTime: number;
  maintenanceCost: number;
}

class AIRecommendationEngine {
  private weightings = {
    rainfall: 0.25,
    roofSuitability: 0.20,
    spaceAvailability: 0.20,
    groundwaterConditions: 0.20,
    costEffectiveness: 0.15
  };

  analyzeAndRecommend(input: AIInput): AIRecommendation {
    const scores = this.calculateScores(input);
    const feasibilityScore = this.calculateOverallScore(scores);
    const systemType = this.determineOptimalSystem(input, scores);
    
    return {
      systemType,
      confidence: this.calculateConfidence(scores),
      reasoning: this.generateReasoning(input, scores, systemType),
      alternativeOptions: this.getAlternativeOptions(input, systemType),
      feasibilityScore,
      scoreBreakdown: scores
    };
  }

  private calculateScores(input: AIInput) {
    return {
      rainfall: this.scoreRainfall(input.annualRainfall),
      roofSuitability: this.scoreRoofSuitability(input.roofArea, input.roofType),
      spaceAvailability: this.scoreSpaceAvailability(input.availableSpace, input.roofArea),
      groundwaterConditions: this.scoreGroundwaterConditions(input.groundwaterDepth, input.soilType),
      costEffectiveness: this.scoreCostEffectiveness(input.roofArea, input.annualRainfall, input.numDwellers)
    };
  }

  private scoreRainfall(annualRainfall: number): number {
    if (annualRainfall >= 1500) return 100;
    if (annualRainfall >= 1000) return 80;
    if (annualRainfall >= 600) return 60;
    if (annualRainfall >= 400) return 40;
    return 20;
  }

  private scoreRoofSuitability(roofArea: number, roofType: string): number {
    let score = 0;
    
    // Area score
    if (roofArea >= 200) score += 40;
    else if (roofArea >= 100) score += 30;
    else if (roofArea >= 50) score += 20;
    else score += 10;
    
    // Roof type score
    const roofTypeScores: Record<string, number> = {
      'concrete': 35,
      'tiles': 30,
      'metal': 40,
      'asbestos': 25,
      'green': 20
    };
    
    score += roofTypeScores[roofType.toLowerCase()] || 25;
    
    // Runoff coefficient bonus
    const runoffCoefficients: Record<string, number> = {
      'concrete': 0.85,
      'tiles': 0.75,
      'metal': 0.90,
      'asbestos': 0.80,
      'green': 0.40
    };
    
    const coefficient = runoffCoefficients[roofType.toLowerCase()] || 0.80;
    score += coefficient * 25;
    
    return Math.min(100, score);
  }

  private scoreSpaceAvailability(availableSpace: number, roofArea: number): number {
    const spaceRatio = availableSpace / roofArea;
    
    if (spaceRatio >= 0.3) return 100;
    if (spaceRatio >= 0.2) return 80;
    if (spaceRatio >= 0.15) return 60;
    if (spaceRatio >= 0.1) return 40;
    return 20;
  }

  private scoreGroundwaterConditions(groundwaterDepth: number, soilType: string): number {
    let score = 0;
    
    // Groundwater depth score
    if (groundwaterDepth <= 5) score += 20; // Too shallow
    else if (groundwaterDepth <= 15) score += 50; // Excellent for recharge
    else if (groundwaterDepth <= 30) score += 40; // Good for recharge
    else if (groundwaterDepth <= 50) score += 30; // Moderate
    else score += 20; // Deep, less effective

    // Soil type score
    const soilScores: Record<string, number> = {
      'sandy': 50, // High permeability
      'loam': 40, // Medium permeability
      'clay': 20, // Low permeability
      'rocky': 15, // Very low permeability
      'black cotton': 10 // Problematic for recharge
    };
    
    const soilKey = Object.keys(soilScores).find(key => 
      soilType.toLowerCase().includes(key)
    ) || 'loam';
    
    score += soilScores[soilKey];
    
    return Math.min(100, score);
  }

  private scoreCostEffectiveness(roofArea: number, annualRainfall: number, numDwellers: number): number {
    const potentialHarvest = roofArea * annualRainfall * 0.8 * 0.001; // m³
    const waterDemand = numDwellers * 150 * 365 * 0.001; // m³ per year
    const demandMeetRatio = potentialHarvest / waterDemand;
    
    if (demandMeetRatio >= 0.8) return 100;
    if (demandMeetRatio >= 0.6) return 85;
    if (demandMeetRatio >= 0.4) return 70;
    if (demandMeetRatio >= 0.2) return 55;
    return 30;
  }

  private calculateOverallScore(scores: Record<string, number>): number {
    return Math.round(
      scores.rainfall * this.weightings.rainfall +
      scores.roofSuitability * this.weightings.roofSuitability +
      scores.spaceAvailability * this.weightings.spaceAvailability +
      scores.groundwaterConditions * this.weightings.groundwaterConditions +
      scores.costEffectiveness * this.weightings.costEffectiveness
    );
  }

  private calculateConfidence(scores: Record<string, number>): number {
    const variance = this.calculateVariance(Object.values(scores));
    const meanScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
    
    // Higher confidence when scores are consistent and high
    const consistencyFactor = Math.max(0, 1 - variance / 1000);
    const scoreFactor = meanScore / 100;
    
    return Math.round((consistencyFactor * 0.6 + scoreFactor * 0.4) * 100);
  }

  private calculateVariance(scores: number[]): number {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    return scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
  }

  private determineOptimalSystem(input: AIInput, scores: Record<string, number>): string {
    const { groundwaterDepth, availableSpace, roofArea, annualRainfall } = input;
    
    // Decision tree based on conditions
    if (scores.groundwaterConditions >= 70 && groundwaterDepth <= 20) {
      if (availableSpace >= roofArea * 0.2) {
        return 'recharge_pit_with_storage';
      } else {
        return 'injection_well_system';
      }
    }
    
    if (scores.spaceAvailability >= 80) {
      if (annualRainfall >= 1200) {
        return 'large_underground_tank';
      } else {
        return 'modular_tank_system';
      }
    }
    
    if (scores.spaceAvailability <= 40) {
      return 'overhead_tank_system';
    }
    
    if (scores.rainfall >= 80 && scores.roofSuitability >= 70) {
      return 'hybrid_storage_recharge';
    }
    
    return 'standard_underground_tank';
  }

  private generateReasoning(input: AIInput, scores: Record<string, number>, systemType: string): string[] {
    const reasoning: string[] = [];
    
    // Rainfall reasoning
    if (scores.rainfall >= 80) {
      reasoning.push(`Excellent rainfall (${input.annualRainfall}mm) provides strong harvesting potential`);
    } else if (scores.rainfall >= 60) {
      reasoning.push(`Moderate rainfall (${input.annualRainfall}mm) supports viable harvesting`);
    } else {
      reasoning.push(`Limited rainfall (${input.annualRainfall}mm) requires efficient collection systems`);
    }
    
    // Roof reasoning
    if (scores.roofSuitability >= 80) {
      reasoning.push(`Large roof area (${input.roofArea}m²) with suitable ${input.roofType} material`);
    } else if (scores.roofSuitability >= 60) {
      reasoning.push(`Adequate roof conditions for water collection`);
    } else {
      reasoning.push(`Roof conditions may limit collection efficiency`);
    }
    
    // Space reasoning
    if (scores.spaceAvailability >= 80) {
      reasoning.push(`Ample space (${input.availableSpace}m²) allows for optimal system design`);
    } else if (scores.spaceAvailability >= 60) {
      reasoning.push(`Sufficient space for standard installation`);
    } else {
      reasoning.push(`Limited space requires compact system design`);
    }
    
    // Groundwater reasoning
    if (scores.groundwaterConditions >= 70) {
      reasoning.push(`Favorable groundwater conditions (${input.groundwaterDepth}m depth) for recharge`);
    } else if (scores.groundwaterConditions >= 50) {
      reasoning.push(`Moderate groundwater conditions support some recharge potential`);
    } else {
      reasoning.push(`Groundwater conditions favor storage over direct recharge`);
    }
    
    // System-specific reasoning
    const systemReasons: Record<string, string> = {
      'recharge_pit_with_storage': 'Combines immediate storage with long-term groundwater recharge',
      'injection_well_system': 'Direct groundwater recharge maximizes aquifer replenishment',
      'large_underground_tank': 'Large storage capacity meets high water demand',
      'modular_tank_system': 'Scalable design allows future expansion',
      'overhead_tank_system': 'Space-efficient solution with gravity-fed distribution',
      'hybrid_storage_recharge': 'Optimal balance of storage and recharge benefits',
      'standard_underground_tank': 'Reliable storage solution for consistent water supply'
    };
    
    reasoning.push(systemReasons[systemType] || 'Balanced approach considering all factors');
    
    return reasoning;
  }

  private getAlternativeOptions(input: AIInput, primarySystem: string): string[] {
    const allSystems = [
      'recharge_pit_with_storage',
      'injection_well_system',
      'large_underground_tank',
      'modular_tank_system',
      'overhead_tank_system',
      'hybrid_storage_recharge',
      'standard_underground_tank'
    ];
    
    return allSystems
      .filter(system => system !== primarySystem)
      .slice(0, 2); // Return top 2 alternatives
  }

  generateStructureSpecs(input: AIInput, systemType: string): StructureSpecs {
    const potentialHarvest = input.roofArea * input.annualRainfall * 0.8 * 0.001 * 1000; // liters
    const dailyDemand = input.numDwellers * 150; // liters per day
    const storageMonths = Math.min(6, Math.max(2, potentialHarvest / (dailyDemand * 30)));
    const requiredCapacity = Math.round(dailyDemand * storageMonths * 30);
    
    const specs = this.getSystemSpecs(systemType, requiredCapacity, input.availableSpace);
    specs.estimatedCost = this.calculateCost(specs, input.roofArea);
    specs.maintenanceCost = Math.round(specs.estimatedCost * 0.05); // 5% annual maintenance
    
    return specs;
  }

  private getSystemSpecs(systemType: string, capacity: number, availableSpace: number): StructureSpecs {
    const baseSpecs: Record<string, Partial<StructureSpecs>> = {
      'recharge_pit_with_storage': {
        type: 'Recharge Pit with Storage Tank',
        materials: ['RCC Concrete', 'Gravel Filter Media', 'Geotextile', 'PVC Pipes', 'Pump System'],
        installationTime: 15
      },
      'injection_well_system': {
        type: 'Injection Well System',
        materials: ['Borewell Casing', 'Submersible Pump', 'Filter Media', 'Control Panel'],
        installationTime: 10
      },
      'large_underground_tank': {
        type: 'Large Underground Storage Tank',
        materials: ['RCC Concrete', 'Waterproof Membrane', 'Pump System', 'Filtration Unit'],
        installationTime: 18
      },
      'modular_tank_system': {
        type: 'Modular Tank System',
        materials: ['Modular Concrete Blocks', 'HDPE Lining', 'Automated Controls', 'Multi-stage Filter'],
        installationTime: 12
      },
      'overhead_tank_system': {
        type: 'Overhead Tank System',
        materials: ['Reinforced Plastic Tank', 'Steel Support Structure', 'Pump System', 'PVC Pipes'],
        installationTime: 8
      },
      'hybrid_storage_recharge': {
        type: 'Hybrid Storage & Recharge System',
        materials: ['Underground Tank', 'Recharge Well', 'Filtration System', 'Control Valves'],
        installationTime: 20
      },
      'standard_underground_tank': {
        type: 'Standard Underground Tank',
        materials: ['RCC Concrete', 'Waterproof Coating', 'First Flush Diverter', 'Pump System'],
        installationTime: 12
      }
    };

    const spec = baseSpecs[systemType] || baseSpecs['standard_underground_tank'];
    const dimensions = this.calculateDimensions(systemType, capacity, availableSpace);

    return {
      type: spec.type!,
      capacity,
      dimensions,
      materials: spec.materials!,
      estimatedCost: 0, // Will be calculated separately
      installationTime: spec.installationTime!,
      maintenanceCost: 0 // Will be calculated separately
    };
  }

  private calculateDimensions(systemType: string, capacity: number, availableSpace: number) {
    const volume = capacity / 1000; // m³
    
    if (systemType.includes('overhead')) {
      const diameter = Math.sqrt(volume / (Math.PI * 2.5)) * 2;
      return {
        length: Math.round(diameter * 100) / 100,
        width: Math.round(diameter * 100) / 100,
        height: 2.5,
        diameter: Math.round(diameter * 100) / 100
      };
    }
    
    if (systemType.includes('injection_well')) {
      return {
        length: 1.5,
        width: 1.5,
        height: 15, // Well depth
        diameter: 0.3 // Well diameter
      };
    }
    
    // Underground tanks
    const maxArea = availableSpace * 0.8;
    const depth = Math.min(3.5, Math.max(2.0, volume / maxArea));
    const area = volume / depth;
    const length = Math.sqrt(area * 1.2);
    const width = area / length;
    
    return {
      length: Math.round(length * 100) / 100,
      width: Math.round(width * 100) / 100,
      height: Math.round(depth * 100) / 100
    };
  }

  private calculateCost(specs: StructureSpecs, roofArea: number): number {
    const baseCostPerLiter = 12; // ₹12 per liter capacity
    const materialMultipliers: Record<string, number> = {
      'Recharge Pit with Storage Tank': 1.4,
      'Injection Well System': 1.8,
      'Large Underground Storage Tank': 1.2,
      'Modular Tank System': 1.6,
      'Overhead Tank System': 0.9,
      'Hybrid Storage & Recharge System': 1.7,
      'Standard Underground Tank': 1.0
    };
    
    const multiplier = materialMultipliers[specs.type] || 1.0;
    const baseCost = specs.capacity * baseCostPerLiter * multiplier;
    
    // Add installation and auxiliary costs
    const installationCost = baseCost * 0.3;
    const auxiliaryCost = Math.min(50000, roofArea * 200); // Pipes, filters, etc.
    
    return Math.round(baseCost + installationCost + auxiliaryCost);
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();