import React, { useState, useEffect } from 'react';
import { Droplets, Layers, MapPin, TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface HydrogeologyData {
  location: string;
  coordinates: { lat: number; lng: number };
  soilType: string;
  permeability: string;
  groundwaterDepth: number;
  aquiferType: string;
  rechargeRate: number;
  waterQuality: string;
  seasonalVariation: {
    monsoon: number;
    postMonsoon: number;
    preMonsoon: number;
  };
  recommendations: string[];
}

interface RainfallData {
  location: string;
  annualRainfall: number;
  monthlyData: {
    month: string;
    rainfall: number;
    rainyDays: number;
  }[];
  rainfallPattern: string;
  intensity: string;
  reliability: number;
  historicalTrends: {
    year: number;
    rainfall: number;
  }[];
}

interface HydrogeologyInfoProps {
  latitude: number;
  longitude: number;
  location: string;
  rainfallData?: any;
  groundwaterData?: any;
}

const HydrogeologyInfo: React.FC<HydrogeologyInfoProps> = ({ 
  latitude, 
  longitude, 
  location, 
  rainfallData: providedRainfallData,
  groundwaterData: providedGroundwaterData 
}) => {
  const [hydroData, setHydroData] = useState<HydrogeologyData | null>(null);
  const [rainfallData, setRainfallData] = useState<RainfallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (providedRainfallData && providedGroundwaterData) {
      // Use provided data
      setRainfallData(providedRainfallData);
      setHydroData(transformGroundwaterData(providedGroundwaterData));
      setLoading(false);
    } else {
      // Fetch data
      fetchHydrogeologyData();
      fetchRainfallData();
    }
  }, [latitude, longitude, location]);

  const transformGroundwaterData = (gwData: any): HydrogeologyData => {
    return {
      location,
      coordinates: { lat: latitude, lng: longitude },
      soilType: gwData.aquiferType || 'Medium Clay',
      permeability: getPermeability(latitude, longitude),
      groundwaterDepth: gwData.depth || 15,
      aquiferType: gwData.aquiferType || 'Unconfined Aquifer',
      rechargeRate: gwData.rechargeRate || 15,
      waterQuality: gwData.quality || 'Good (TDS 300-600 mg/L)',
      seasonalVariation: gwData.seasonalVariation || {
        monsoon: gwData.depth - 2,
        postMonsoon: gwData.depth - 1,
        preMonsoon: gwData.depth + 1
      },
      recommendations: getRecommendations(latitude, longitude)
    };
  };

  const fetchHydrogeologyData = async () => {
    // Mock hydrogeology data based on location
    const mockData: HydrogeologyData = {
      location,
      coordinates: { lat: latitude, lng: longitude },
      soilType: getSoilType(latitude, longitude),
      permeability: getPermeability(latitude, longitude),
      groundwaterDepth: getGroundwaterDepth(latitude, longitude),
      aquiferType: getAquiferType(latitude, longitude),
      rechargeRate: getRechargeRate(latitude, longitude),
      waterQuality: getWaterQuality(latitude, longitude),
      seasonalVariation: {
        monsoon: getGroundwaterDepth(latitude, longitude) - 2,
        postMonsoon: getGroundwaterDepth(latitude, longitude) - 1,
        preMonsoon: getGroundwaterDepth(latitude, longitude) + 1
      },
      recommendations: getRecommendations(latitude, longitude)
    };

    setHydroData(mockData);
  };

  const fetchRainfallData = async () => {
    // Mock rainfall data based on location
    const annualRainfall = getAnnualRainfall(location);
    const mockRainfallData: RainfallData = {
      location,
      annualRainfall,
      monthlyData: generateMonthlyRainfall(annualRainfall),
      rainfallPattern: getRainfallPattern(annualRainfall),
      intensity: getRainfallIntensity(annualRainfall),
      reliability: getRainfallReliability(location),
      historicalTrends: generateHistoricalTrends(annualRainfall)
    };

    setRainfallData(mockRainfallData);
    setLoading(false);
  };

  // Helper functions for generating mock data
  const getSoilType = (lat: number, lng: number): string => {
    if (lat > 20 && lng > 75) return 'Black Cotton Soil';
    if (lat > 15 && lng > 70) return 'Red Laterite Soil';
    if (lat > 25) return 'Alluvial Soil';
    return 'Sandy Loam';
  };

  const getPermeability = (lat: number, lng: number): string => {
    const soil = getSoilType(lat, lng);
    if (soil.includes('Black Cotton')) return 'Low (0.1-1 m/day)';
    if (soil.includes('Sandy')) return 'High (10-100 m/day)';
    if (soil.includes('Red')) return 'Medium (1-10 m/day)';
    return 'Medium (1-10 m/day)';
  };

  const getGroundwaterDepth = (lat: number, lng: number): number => {
    // Simulate depth based on geography
    if (lat > 20 && lng > 75) return Math.round(8 + Math.random() * 12); // 8-20m
    if (lat > 15) return Math.round(15 + Math.random() * 25); // 15-40m
    return Math.round(5 + Math.random() * 15); // 5-20m
  };

  const getAquiferType = (lat: number, lng: number): string => {
    if (lat > 25) return 'Unconfined Alluvial Aquifer';
    if (lat > 15) return 'Semi-confined Hard Rock Aquifer';
    return 'Confined Sedimentary Aquifer';
  };

  const getRechargeRate = (lat: number, lng: number): number => {
    const permeability = getPermeability(lat, lng);
    if (permeability.includes('High')) return Math.round(15 + Math.random() * 10); // 15-25%
    if (permeability.includes('Medium')) return Math.round(8 + Math.random() * 7); // 8-15%
    return Math.round(3 + Math.random() * 5); // 3-8%
  };

  const getWaterQuality = (lat: number, lng: lng): string => {
    const random = Math.random();
    if (random > 0.7) return 'Excellent (TDS < 300 mg/L)';
    if (random > 0.4) return 'Good (TDS 300-600 mg/L)';
    if (random > 0.2) return 'Fair (TDS 600-900 mg/L)';
    return 'Poor (TDS > 900 mg/L)';
  };

  const getRecommendations = (lat: number, lng: number): string[] => {
    const recommendations = [];
    const soilType = getSoilType(lat, lng);
    const permeability = getPermeability(lat, lng);
    
    if (permeability.includes('Low')) {
      recommendations.push('Install recharge wells with filter media');
      recommendations.push('Use percolation tanks for better infiltration');
    } else if (permeability.includes('High')) {
      recommendations.push('Direct recharge through injection wells');
      recommendations.push('Construct recharge trenches along contours');
    } else {
      recommendations.push('Combination of surface and subsurface recharge');
      recommendations.push('Install check dams for enhanced recharge');
    }
    
    if (soilType.includes('Black Cotton')) {
      recommendations.push('Pre-treat water to prevent clay swelling');
    }
    
    recommendations.push('Regular monitoring of groundwater levels');
    recommendations.push('Maintain 50m distance from septic systems');
    
    return recommendations;
  };

  const getAnnualRainfall = (location: string): number => {
    const locationRainfall: Record<string, number> = {
      'mumbai': 2200, 'delhi': 600, 'bangalore': 900, 'hyderabad': 800,
      'chennai': 1200, 'kolkata': 1600, 'pune': 700, 'ahmedabad': 800,
      'jaipur': 550, 'kochi': 3000, 'thiruvananthapuram': 1800
    };
    
    const cityKey = location.toLowerCase();
    for (const [city, rainfall] of Object.entries(locationRainfall)) {
      if (cityKey.includes(city)) return rainfall;
    }
    return 800; // Default
  };

  const generateMonthlyRainfall = (annual: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Simulate monsoon pattern (Jun-Sep gets 70% of rainfall)
    return months.map((month, index) => {
      let rainfall = 0;
      let rainyDays = 0;
      
      if (index >= 5 && index <= 8) { // Jun-Sep (Monsoon)
        rainfall = Math.round((annual * 0.7 / 4) + (Math.random() - 0.5) * 100);
        rainyDays = Math.round(15 + Math.random() * 10);
      } else if (index >= 9 && index <= 11) { // Oct-Dec (Post-monsoon)
        rainfall = Math.round((annual * 0.2 / 3) + (Math.random() - 0.5) * 50);
        rainyDays = Math.round(3 + Math.random() * 5);
      } else { // Jan-May (Pre-monsoon)
        rainfall = Math.round((annual * 0.1 / 5) + (Math.random() - 0.5) * 30);
        rainyDays = Math.round(1 + Math.random() * 3);
      }
      
      return { month, rainfall: Math.max(0, rainfall), rainyDays };
    });
  };

  const getRainfallPattern = (annual: number): string => {
    if (annual > 2000) return 'Heavy Monsoon Dominated';
    if (annual > 1200) return 'Monsoon Dominated';
    if (annual > 800) return 'Moderate Monsoon';
    return 'Scanty Rainfall';
  };

  const getRainfallIntensity = (annual: number): string => {
    if (annual > 2000) return 'High Intensity (>100mm/day during monsoon)';
    if (annual > 1000) return 'Medium Intensity (50-100mm/day during monsoon)';
    return 'Low Intensity (<50mm/day during monsoon)';
  };

  const getRainfallReliability = (location: string): number => {
    // Simulate reliability based on location
    if (location.toLowerCase().includes('kerala')) return 0.9;
    if (location.toLowerCase().includes('mumbai')) return 0.85;
    if (location.toLowerCase().includes('delhi')) return 0.6;
    return 0.75;
  };

  const generateHistoricalTrends = (annual: number) => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => ({
      year: currentYear - 9 + i,
      rainfall: Math.max(0, Math.round(annual + (Math.random() - 0.5) * 400))
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Droplets className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Loading Environmental Data...</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hydroData || !rainfallData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Droplets className="h-6 w-6 text-red-600" />
          <h3 className="text-xl font-semibold">Data Unavailable</h3>
        </div>
        <p className="text-gray-600">Unable to load environmental data for this location. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hydrogeology Information */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div 
          className="p-6 bg-gradient-to-r from-blue-500 to-green-500 text-white cursor-pointer"
          onClick={() => toggleSection('hydro')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Layers className="h-6 w-6" />
              <h3 className="text-xl font-semibold">Local Hydrogeology</h3>
            </div>
            {expandedSection === 'hydro' ? <ChevronUp /> : <ChevronDown />}
          </div>
          <p className="text-blue-100 mt-2">Subsurface water conditions and soil characteristics</p>
        </div>
        
        {expandedSection === 'hydro' && hydroData && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Soil & Geology</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Soil Type:</span>
                      <span className="font-medium">{hydroData.soilType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Permeability:</span>
                      <span className="font-medium">{hydroData.permeability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aquifer Type:</span>
                      <span className="font-medium">{hydroData.aquiferType}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Groundwater</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Depth to Water:</span>
                      <span className="font-medium">{hydroData.groundwaterDepth}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recharge Rate:</span>
                      <span className="font-medium">{hydroData.rechargeRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Water Quality:</span>
                      <span className="font-medium">{hydroData.waterQuality}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Seasonal Variation</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pre-Monsoon:</span>
                      <span className="font-medium">{hydroData.seasonalVariation.preMonsoon}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monsoon:</span>
                      <span className="font-medium text-green-600">{hydroData.seasonalVariation.monsoon}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Post-Monsoon:</span>
                      <span className="font-medium">{hydroData.seasonalVariation.postMonsoon}m</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {hydroData.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rainfall Data */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div 
          className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white cursor-pointer"
          onClick={() => toggleSection('rainfall')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Droplets className="h-6 w-6" />
              <h3 className="text-xl font-semibold">Local Rainfall Data</h3>
            </div>
            {expandedSection === 'rainfall' ? <ChevronUp /> : <ChevronDown />}
          </div>
          <p className="text-blue-100 mt-2">Historical precipitation patterns and trends</p>
        </div>
        
        {expandedSection === 'rainfall' && rainfallData && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Annual Overview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Rainfall:</span>
                      <span className="font-medium text-blue-600">{rainfallData.annualRainfall}mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pattern:</span>
                      <span className="font-medium">{rainfallData.rainfallPattern}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Intensity:</span>
                      <span className="font-medium">{rainfallData.intensity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reliability:</span>
                      <span className="font-medium">{Math.round(rainfallData.reliability * 100)}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Monthly Distribution</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {rainfallData.monthlyData.map((month) => (
                      <div key={month.month} className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">{month.month}</div>
                        <div className="text-blue-600">{month.rainfall}mm</div>
                        <div className="text-gray-500 text-xs">{month.rainyDays} days</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Historical Trends (Last 10 Years)</h4>
                  <div className="space-y-1">
                    {rainfallData.historicalTrends.map((trend) => (
                      <div key={trend.year} className="flex justify-between items-center py-1">
                        <span className="text-gray-600">{trend.year}:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{trend.rainfall}mm</span>
                          <div 
                            className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"
                          >
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ 
                                width: `${Math.min(100, (trend.rainfall / rainfallData.annualRainfall) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900">Recharge Potential</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Based on local conditions, approximately{' '}
                        <strong>{Math.round(rainfallData.annualRainfall * 0.15)}mm</strong> of annual 
                        rainfall can be effectively recharged to groundwater through proper 
                        rainwater harvesting systems.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HydrogeologyInfo;