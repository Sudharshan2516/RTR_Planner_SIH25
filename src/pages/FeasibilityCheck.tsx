import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, MapPin, Home, Users, Square, Map, Layers, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { calculateHarvestPrediction, getStructureRecommendation, calculateCostBenefit, FeasibilityInput, getStructureDisplayName, getSuitabilityColor } from '../utils/calculations';
import { asyncProcessor } from '../utils/asyncProcessor';
import { supabase } from '../lib/supabase';
import GISMap from '../components/GISMap';
import HydrogeologyInfo from '../components/HydrogeologyInfo';

const FeasibilityCheck: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FeasibilityInput>({
    roofArea: 0,
    location: '',
    numDwellers: 0,
    availableSpace: 0,
    roofType: 'concrete',
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [projectName, setProjectName] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showRainfallLayer, setShowRainfallLayer] = useState(false);
  const [showSoilLayer, setShowSoilLayer] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 17.3850, lng: 78.4867 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roofArea' || name === 'numDwellers' || name === 'availableSpace'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setCoordinates({ lat, lng });
    setFormData(prev => ({ ...prev, location: address }));
    
    if (user) {
      addNotification({
        title: 'Location Selected',
        message: `Location updated to: ${address}`,
        type: 'info'
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          setFormData(prev => ({ 
            ...prev, 
            location: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` 
          }));
          setLoading(false);
          
          if (user) {
            addNotification({
              title: 'Location Updated',
              message: 'Your current location has been detected successfully.',
              type: 'success'
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          
          let errorMessage = 'Unable to get your current location. Please enter manually.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location access denied. Please allow location access and try again.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information unavailable. Please enter manually.';
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Location request timed out. Please try again.';
          }
          
          if (user) {
            addNotification({
              title: 'Location Error',
              message: errorMessage,
              type: 'warning'
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      if (user) {
        addNotification({
          title: 'Geolocation Not Supported',
          message: 'Your browser does not support geolocation. Please enter location manually.',
          type: 'warning'
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Submit ML prediction job for async processing
      const jobId = await asyncProcessor.submitJob('ml_prediction', formData);
      
      // Poll for results
      const pollResults = setInterval(async () => {
        const job = await asyncProcessor.getJobStatus(jobId);
        
        if (job?.status === 'completed') {
          clearInterval(pollResults);
          
          // Use the ML results to calculate other recommendations
          const harvestPrediction = job.result;
          const structureRecommendation = getStructureRecommendation(formData, harvestPrediction);
          const costAnalysis = calculateCostBenefit(formData, structureRecommendation, harvestPrediction);
          
          const calculationResults = {
            input: formData,
            harvest: harvestPrediction,
            structure: structureRecommendation,
            cost: costAnalysis
          };
          
          setResults(calculationResults);
          setLoading(false);
          
          // Add success notification
          if (user) {
            addNotification({
              title: 'Assessment Complete',
              message: `Feasibility analysis for ${projectName || 'your project'} is ready!`,
              type: 'success',
              actionUrl: '/feasibility',
              actionText: 'View Results'
            });
          }
          
        } else if (job?.status === 'failed') {
          clearInterval(pollResults);
          setLoading(false);
          console.error('ML prediction failed:', job.error);
          
          // Fallback to synchronous calculation
          const harvestPrediction = calculateHarvestPrediction(formData);
          const structureRecommendation = getStructureRecommendation(formData, harvestPrediction);
          const costAnalysis = calculateCostBenefit(formData, structureRecommendation, harvestPrediction);
          
          const calculationResults = {
            input: formData,
            harvest: harvestPrediction,
            structure: structureRecommendation,
            cost: costAnalysis
          };
          
          setResults(calculationResults);
        }
      }, 1000);
      
      // If user is logged in, save the project
      if (user) {
        const { error } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            project_name: projectName || `Project ${new Date().toLocaleDateString()}`,
            roof_area: formData.roofArea,
            location: formData.location,
            number_of_dwellers: formData.numDwellers,
            available_space: formData.availableSpace,
            roof_type: formData.roofType,
            status: 'draft'
          });
        
        if (error) {
          console.error('Error saving project:', error);
        } else {
          addNotification({
            title: 'Project Saved',
            message: `Project "${projectName || 'Untitled'}" has been saved to your dashboard.`,
            type: 'success',
            actionUrl: '/dashboard',
            actionText: 'View Dashboard'
          });
        }
      }
      
    } catch (error) {
      console.error('Calculation error:', error);
      setLoading(false);
      
      if (user) {
        addNotification({
          title: 'Calculation Error',
          message: 'There was an error processing your assessment. Please try again.',
          type: 'error'
        });
      }
    } finally {
      // Loading state is handled in the polling logic above
    }
  };

  const renderResults = () => {
    if (!results) return null;
    
    return (
      <div className="mt-12 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your Rainwater Harvesting Assessment
          </h2>
          <p className="text-gray-600">
            Based on your inputs, here's what we found:
          </p>
        </div>
        
        {/* Harvest Potential */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">💧 Harvest Potential</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {results.harvest.predictedHarvestLiters.toLocaleString()}L
              </div>
              <div className="text-sm text-blue-600">Annual Harvest</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {results.harvest.annualRainfall}mm
              </div>
              <div className="text-sm text-blue-600">Annual Rainfall</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {Math.round(results.harvest.waterQualityScore)}%
              </div>
              <div className="text-sm text-blue-600">Water Quality Score</div>
            </div>
          </div>
        </div>
        
        {/* Structure Recommendation */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-green-900 mb-4">🏗️ Recommended Structure</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-green-800">
                {getStructureDisplayName(results.structure.structureType)}
              </h4>
              <span className={`text-sm font-semibold ${getSuitabilityColor(results.structure.suitabilityScore)}`}>
                Suitability: {results.structure.suitabilityScore}%
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Capacity:</strong> {results.structure.tankCapacity.toLocaleString()} liters</p>
                <p><strong>Installation Time:</strong> {results.structure.installationTimeDays} days</p>
                <p><strong>Efficiency:</strong> {Math.round(results.structure.efficiencyRating * 100)}%</p>
                <p><strong>Maintenance:</strong> {results.structure.maintenanceFrequency}</p>
              </div>
              <div>
                <p><strong>Dimensions:</strong></p>
                <ul className="ml-4 text-sm">
                  <li>Length: {results.structure.dimensions.length}m</li>
                  <li>Width: {results.structure.dimensions.width}m</li>
                  <li>Height: {results.structure.dimensions.height}m</li>
                </ul>
              </div>
            </div>
            
            <div>
              <p><strong>Materials Required:</strong></p>
              <div className="flex flex-wrap gap-2 mt-2">
                {results.structure.materials.map((material: string, index: number) => (
                  <span key={index} className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">
                    {material}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Environmental Impact */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-emerald-900 mb-4">🌍 Environmental Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-700">
                  {Math.round(results.harvest.predictedHarvestLiters / 1000)}K L
                </div>
                <div className="text-sm text-emerald-600">Water Conserved</div>
              </div>
            </div>
            <div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-700">
                  {results.cost.environmentalBenefit.split(' ')[0]}
                </div>
                <div className="text-sm text-emerald-600">kg CO₂ Saved</div>
              </div>
            </div>
            <div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-700">
                  {Math.round((results.harvest.predictedHarvestLiters / (formData.numDwellers * 150 * 365)) * 100)}%
                </div>
                <div className="text-sm text-emerald-600">Water Independence</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cost Analysis */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-yellow-900 mb-4">💰 Cost Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">
                ₹{results.cost.totalCost.toLocaleString()}
              </div>
              <div className="text-sm text-yellow-600">Total Investment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">
                ₹{results.cost.annualSavings.toLocaleString()}
              </div>
              <div className="text-sm text-yellow-600">Annual Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">
                {results.cost.paybackPeriodYears} years
              </div>
              <div className="text-sm text-yellow-600">Payback Period</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">
                {results.cost.roiPercentage}%
              </div>
              <div className="text-sm text-yellow-600">Annual ROI</div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          {user ? (
            <div className="space-y-4">
              <p className="text-gray-700">Ready to move forward with this project?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/projects')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View My Projects
                </button>
                <button
                  onClick={() => navigate('/reports')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Generate Detailed Report
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700">
                Want to save this assessment and track your project? Sign up for free!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 relative overflow-hidden">
      {/* Background water droplets */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-8 h-12 bg-blue-200 opacity-20 animate-float" 
             style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'}}>
        </div>
        <div className="absolute top-40 right-20 w-6 h-10 bg-green-200 opacity-15 animate-float" 
             style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', animationDelay: '1s'}}>
        </div>
        <div className="absolute bottom-32 left-1/4 w-10 h-14 bg-blue-100 opacity-25 animate-float" 
             style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', animationDelay: '2s'}}>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          {/* Water droplet with calculator icon */}
          <div className="relative mx-auto mb-4 w-16 h-20 bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center" 
               style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'}}>
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rainwater Harvesting Feasibility Check
          </h1>
          <p className="text-gray-600">
            Get instant analysis of your rooftop's rainwater harvesting potential
          </p>
        </div>

        {/* GIS Map Integration */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Map className="h-5 w-5 mr-2" />
              Location & Environmental Data
            </h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  showMap ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-1" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
              {showMap && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRainfallLayer(!showRainfallLayer)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      showRainfallLayer ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Layers className="h-4 w-4 inline mr-1" />
                    Rainfall
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSoilLayer(!showSoilLayer)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      showSoilLayer ? 'bg-brown-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Layers className="h-4 w-4 inline mr-1" />
                    Soil
                  </button>
                </>
              )}
            </div>
          </div>
          
          {showMap && (
            <div className="mb-4">
              <GISMap
                latitude={coordinates.lat}
                longitude={coordinates.lng}
                location={formData.location}
                roofArea={formData.roofArea}
                onLocationSelect={handleLocationSelect}
                showRainfallData={showRainfallLayer}
                showSoilData={showSoilLayer}
              />
              <p className="text-sm text-gray-600 mt-2">
                Click on the map to select a different location, or use the button below to get your current location.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {user && (
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name (Optional)
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Give your project a name"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="roofArea" className="block text-sm font-medium text-gray-700 mb-2">
                  <Square className="inline h-4 w-4 mr-1" />
                  Roof Area (sq. meters) *
                </label>
                <input
                  type="number"
                  id="roofArea"
                  name="roofArea"
                  required
                  min="1"
                  step="0.1"
                  value={formData.roofArea || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location/City *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Get current location"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="numDwellers" className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Number of People *
                </label>
                <input
                  type="number"
                  id="numDwellers"
                  name="numDwellers"
                  required
                  min="1"
                  value={formData.numDwellers || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 4"
                />
              </div>

              <div>
                <label htmlFor="availableSpace" className="block text-sm font-medium text-gray-700 mb-2">
                  <Home className="inline h-4 w-4 mr-1" />
                  Available Space (sq. meters) *
                </label>
                <input
                  type="number"
                  id="availableSpace"
                  name="availableSpace"
                  required
                  min="1"
                  step="0.1"
                  value={formData.availableSpace || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 20"
                />
              </div>

              <div>
                <label htmlFor="roofType" className="block text-sm font-medium text-gray-700 mb-2">
                  Roof Type
                </label>
                <select
                  id="roofType"
                  name="roofType"
                  value={formData.roofType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="concrete">Concrete</option>
                  <option value="tiles">Tiles</option>
                  <option value="metal">Metal Sheets</option>
                  <option value="asbestos">Asbestos</option>
                  <option value="green">Green Roof</option>
                </select>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Calculating...' : 'Calculate Feasibility'}
              </button>
            </div>
          </form>
        </div>

        {renderResults()}
        
        {/* Hydrogeology and Rainfall Information */}
        {formData.location && (
          <div className="mt-12">
            <HydrogeologyInfo
              latitude={coordinates.lat}
              longitude={coordinates.lng}
              location={formData.location}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FeasibilityCheck;