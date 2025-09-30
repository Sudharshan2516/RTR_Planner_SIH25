import React, { useState, useEffect } from 'react';
import { Calendar, Droplets, Layers, TrendingUp, MapPin, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { rainfallApiService, RainfallData, GroundwaterData } from '../services/rainfallApi';

interface HydrogeologyInfoProps {
  latitude: number;
  longitude: number;
  location: string;
  rainfallData?: RainfallData | null;
  groundwaterData?: GroundwaterData | null;
}

const HydrogeologyInfo: React.FC<HydrogeologyInfoProps> = ({
  latitude,
  longitude,
  location,
  rainfallData: propRainfallData,
  groundwaterData: propGroundwaterData
}) => {
  const [rainfallData, setRainfallData] = useState<RainfallData | null>(propRainfallData || null);
  const [groundwaterData, setGroundwaterData] = useState<GroundwaterData | null>(propGroundwaterData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    rainfall: true,
    groundwater: true,
    calendar: false
  });

  useEffect(() => {
    if (latitude && longitude && (!rainfallData || !groundwaterData)) {
      fetchHydrogeologyData();
    }
  }, [latitude, longitude]);

  const fetchHydrogeologyData = async () => {
    if (!latitude || !longitude) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [rainfall, groundwater] = await Promise.all([
        rainfallApiService.getRainfallData(location, { lat: latitude, lng: longitude }),
        rainfallApiService.getGroundwaterData(location, { lat: latitude, lng: longitude })
      ]);
      
      setRainfallData(rainfall);
      setGroundwaterData(groundwater);
    } catch (err) {
      console.error('Error fetching hydrogeology data:', err);
      setError('Unable to fetch local hydrogeology data. Showing estimated values.');
      
      // Fallback data
      setRainfallData({
        location,
        coordinates: { lat: latitude, lng: longitude },
        annualRainfall: 800,
        monthlyData: generateFallbackMonthlyData(),
        reliability: 0.6,
        lastUpdated: new Date().toISOString(),
        source: 'Estimated Data'
      });
      
      setGroundwaterData({
        location,
        coordinates: { lat: latitude, lng: longitude },
        depth: 15,
        quality: 'Good (TDS 300-600 mg/L)',
        aquiferType: 'Unconfined Aquifer',
        seasonalVariation: { preMonsoon: 17, monsoon: 13, postMonsoon: 15 },
        rechargeRate: 12,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const distribution = [15, 18, 25, 35, 45, 125, 185, 165, 125, 85, 25, 15];
    
    return months.map((month, index) => ({
      month,
      rainfall: distribution[index],
      rainyDays: Math.round(distribution[index] / 10),
      intensity: distribution[index] > 100 ? 'high' as const : 
                distribution[index] > 50 ? 'medium' as const : 'low' as const
    }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 0.9) return 'text-green-600';
    if (reliability >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading hydrogeology data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-full">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Local Hydrogeology Information</h3>
            <p className="text-blue-100 text-sm">
              <MapPin className="inline h-4 w-4 mr-1" />
              {location} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <Info className="h-5 w-5 text-yellow-400" />
            <p className="ml-3 text-sm text-yellow-700">{error}</p>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Rainfall Data Section */}
        <div className="bg-white rounded-lg border border-blue-200">
          <button
            onClick={() => toggleSection('rainfall')}
            className="w-full p-4 flex items-center justify-between hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Droplets className="h-5 w-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Rainfall Data</h4>
            </div>
            {expandedSections.rainfall ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.rainfall && rainfallData && (
            <div className="p-4 border-t border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Rainfall:</span>
                      <span className="font-semibold text-blue-700">
                        {rainfallData.annualRainfall} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Source:</span>
                      <span className="text-sm text-gray-700">{rainfallData.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reliability:</span>
                      <span className={`font-semibold ${getReliabilityColor(rainfallData.reliability)}`}>
                        {Math.round(rainfallData.reliability * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-sm text-gray-700">
                        {new Date(rainfallData.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Peak Rainfall Months</h5>
                  <div className="space-y-2">
                    {rainfallData.monthlyData
                      .sort((a, b) => b.rainfall - a.rainfall)
                      .slice(0, 3)
                      .map((month, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">{month.month}:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{month.rainfall} mm</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getIntensityColor(month.intensity)}`}>
                              {month.intensity}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Groundwater Data Section */}
        <div className="bg-white rounded-lg border border-green-200">
          <button
            onClick={() => toggleSection('groundwater')}
            className="w-full p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h4 className="text-lg font-semibold text-gray-900">Groundwater Information</h4>
            </div>
            {expandedSections.groundwater ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.groundwater && groundwaterData && (
            <div className="p-4 border-t border-green-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Depth:</span>
                    <span className="font-semibold text-green-700">{groundwaterData.depth} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water Quality:</span>
                    <span className="text-sm text-gray-700">{groundwaterData.quality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aquifer Type:</span>
                    <span className="text-sm text-gray-700">{groundwaterData.aquiferType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recharge Rate:</span>
                    <span className="font-semibold text-green-700">{groundwaterData.rechargeRate}%</span>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Seasonal Variation</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pre-Monsoon:</span>
                      <span className="font-medium">{groundwaterData.seasonalVariation.preMonsoon} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monsoon:</span>
                      <span className="font-medium text-blue-600">{groundwaterData.seasonalVariation.monsoon} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Post-Monsoon:</span>
                      <span className="font-medium">{groundwaterData.seasonalVariation.postMonsoon} m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rainfall Calendar Section */}
        <div className="bg-white rounded-lg border border-purple-200">
          <button
            onClick={() => toggleSection('calendar')}
            className="w-full p-4 flex items-center justify-between hover:bg-purple-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Monthly Rainfall Calendar</h4>
            </div>
            {expandedSections.calendar ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.calendar && rainfallData && (
            <div className="p-4 border-t border-purple-100">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rainfallData.monthlyData.map((month, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border">
                    <div className="text-center">
                      <h6 className="font-semibold text-gray-900 mb-2">{month.month}</h6>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {month.rainfall}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">mm</div>
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${getIntensityColor(month.intensity)}`}>
                          {month.intensity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {month.rainyDays} days
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Rainfall Insights</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Peak rainfall occurs during {rainfallData.monthlyData
                    .reduce((max, month) => month.rainfall > max.rainfall ? month : max)
                    .month}
                  </li>
                  <li>• Total rainy days: {rainfallData.monthlyData.reduce((sum, month) => sum + month.rainyDays, 0)} days/year</li>
                  <li>• Monsoon season (Jun-Sep) contributes {Math.round(
                    rainfallData.monthlyData.slice(5, 9).reduce((sum, month) => sum + month.rainfall, 0) / 
                    rainfallData.annualRainfall * 100
                  )}% of annual rainfall</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HydrogeologyInfo;