import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, MapPin, Home, Users, Square, Map, Layers, Eye, Download, Sliders, Droplets, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { aiRecommendationEngine, AIInput } from '../services/aiRecommendationEngine';
import { rainfallApiService } from '../services/rainfallApi';
import { generatePDFReport, ReportData } from '../utils/pdfGenerator';
import GISMap from '../components/GISMap';
import HydrogeologyInfo from '../components/HydrogeologyInfo';
import FeasibilityScoreCard from '../components/FeasibilityScoreCard';
import WhatIfSimulator from '../components/WhatIfSimulator';

const FeasibilityCheck: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<AIInput>({
    roofArea: 0,
    location: '',
    coordinates: { lat: 17.3850, lng: 78.4867 },
    annualRainfall: 800,
    groundwaterDepth: 15,
    soilType: 'loam',
    numDwellers: 0,
    availableSpace: 0,
    roofType: 'concrete',
    waterDemand: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [projectName, setProjectName] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showRainfallLayer, setShowRainfallLayer] = useState(false);
  const [showSoilLayer, setShowSoilLayer] = useState(false);
  const [rainfallData, setRainfallData] = useState<any>(null);
  const [groundwaterData, setGroundwaterData] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roofArea' || name === 'numDwellers' || name === 'availableSpace' || name === 'groundwaterDepth'
        ? parseFloat(value) || 0
        : value,
      waterDemand: name === 'numDwellers' ? (parseFloat(value) || 0) * 150 * 365 : prev.waterDemand
    }));
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({ 
      ...prev, 
      location: address,
      coordinates: { lat, lng }
    }));
    
    // Fetch rainfall and groundwater data for new location
    fetchLocationData(lat, lng, address);
    
    if (user) {
      addNotification({
        title: 'Location Selected',
        message: `Location updated to: ${address}`,
        type: 'info'
      });
    }
  };

  const fetchLocationData = async (lat: number, lng: number, location: string) => {
    try {
      const [rainfall, groundwater] = await Promise.all([
        rainfallApiService.getRainfallData(location, { lat, lng }),
        rainfallApiService.getGroundwaterData(location, { lat, lng })
      ]);
      
      setRainfallData(rainfall);
      setGroundwaterData(groundwater);
      
      setFormData(prev => ({
        ...prev,
        annualRainfall: rainfall.annualRainfall,
        groundwaterDepth: groundwater.depth,
        soilType: groundwater.aquiferType.toLowerCase().includes('alluvial') ? 'sandy' : 'loam'
      }));
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          
          setFormData(prev => ({
            ...prev, 
            location: newLocation,
            coordinates: { lat: latitude, lng: longitude }
          }));
          
          fetchLocationData(latitude, longitude, newLocation);
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
      // Get AI recommendation
      const recommendation = aiRecommendationEngine.analyzeAndRecommend(formData);
      const structureSpecs = aiRecommendationEngine.generateStructureSpecs(formData, recommendation.systemType);
      
      // Calculate additional metrics
      const harvestPotential = formData.roofArea * formData.annualRainfall * 0.8 * 0.001 * 1000; // liters
      const annualSavings = Math.min(harvestPotential, formData.waterDemand) * 0.02; // ₹0.02 per liter
      const paybackPeriod = structureSpecs.estimatedCost / (annualSavings || 1); // avoid divide by zero
      
      const calculationResults = {
        input: formData,
        recommendation,
        structureSpecs,
        harvestPotential,
        annualSavings,
        paybackPeriod,
        rainfallData,
        groundwaterData
      };
      
      setResults(calculationResults);
      setLoading(false);
      
      // If user is logged in, save the project
      if (user) {
        // Save to localStorage for demo
        const projects = JSON.parse(localStorage.getItem(`projects_${user.id}`) || '[]');
        const newProject = {
          id: `proj-${Date.now()}`,
          user_id: user.id,
          project_name: projectName || `Project ${new Date().toLocaleDateString()}`,
          roof_area: formData.roofArea,
          location: formData.location,
          latitude: formData.coordinates.lat,
          longitude: formData.coordinates.lng,
          number_of_dwellers: formData.numDwellers,
          available_space: formData.availableSpace,
          roof_type: formData.roofType,
          status: 'draft',
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          estimated_harvest: harvestPotential,
          estimated_cost: structureSpecs.estimatedCost
        };
        
        projects.push(newProject);
        localStorage.setItem(`projects_${user.id}`, JSON.stringify(projects));
        
        addNotification({
          title: 'Assessment Complete',
          message: `Feasibility analysis for ${projectName || 'your project'} is ready!`,
          type: 'success',
          actionUrl: '/projects',
          actionText: 'View Projects'
        });
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
    }
  };

  const handleDownloadReport = async () => {
    if (!results) return;
    
    const reportData: ReportData = {
      projectName: projectName || 'Rainwater Harvesting Assessment',
      location: formData.location,
      roofArea: formData.roofArea,
      dwellers: formData.numDwellers,
      harvestPotential: {
        annualHarvest: results.harvestPotential,
        annualRainfall: formData.annualRainfall,
        waterQuality: 85,
        runoffCoefficient: 0.8
      },
      structure: {
        type: results.structureSpecs.type,
        capacity: results.structureSpecs.capacity,
        cost: results.structureSpecs.estimatedCost,
        installationDays: results.structureSpecs.installationTime,
        dimensions: results.structureSpecs.dimensions
      },
      costAnalysis: {
        totalCost: results.structureSpecs.estimatedCost,
        annualSavings: results.annualSavings,
        paybackPeriod: results.paybackPeriod,
        roi: (results.annualSavings / (results.structureSpecs.estimatedCost || 1)) * 100
      },
      generatedAt: new Date().toLocaleDateString(),
      userName: user?.full_name || 'User'
    };
    
    await generatePDFReport(reportData);
    
    if (user) {
      addNotification({
        title: 'Report Downloaded',
        message: 'Your detailed assessment report has been downloaded successfully.',
        type: 'success'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('quick.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI-powered assessment of your rainwater harvesting potential with detailed recommendations
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name (Optional)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter a name for your project"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  {t('quick.address')}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter address or PIN code"
                    required
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Roof Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Home className="inline h-4 w-4 mr-1" />
                  {t('quick.roof_area')}
                </label>
                <input
                  type="number"
                  name="roofArea"
                  value={formData.roofArea || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter roof area in square meters"
                  required
                  min="1"
                />
              </div>

              {/* Number of Dwellers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  {t('quick.dwellers')}
                </label>
                <input
                  type="number"
                  name="numDwellers"
                  value={formData.numDwellers || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Number of people"
                  required
                  min="1"
                />
              </div>

              {/* Available Space */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Square className="inline h-4 w-4 mr-1" />
                  {t('quick.open_space')}
                </label>
                <input
                  type="number"
                  name="availableSpace"
                  value={formData.availableSpace || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Available space in square meters"
                  required
                  min="1"
                />
              </div>

              {/* Roof Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('quick.roof_type')}
                </label>
                <select
                  name="roofType"
                  value={formData.roofType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="concrete">{t('roof.rcc')}</option>
                  <option value="metal">{t('roof.metal')}</option>
                  <option value="tiles">{t('roof.tile')}</option>
                  <option value="asbestos">Asbestos</option>
                  <option value="green">Green Roof</option>
                </select>
              </div>

              {/* Groundwater Depth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Layers className="inline h-4 w-4 mr-1" />
                  {t('quick.groundwater_depth')}
                </label>
                <input
                  type="number"
                  name="groundwaterDepth"
                  value={formData.groundwaterDepth || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Groundwater depth in meters"
                  min="1"
                />
              </div>
            </div>

            {/* Map Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Map className="h-4 w-4" />
                <span>{showMap ? 'Hide' : 'Show'} Map</span>
              </button>
            </div>

            {/* GIS Map */}
            {showMap && (
              <div className="mt-6">
                <GISMap
                  latitude={formData.coordinates.lat}
                  longitude={formData.coordinates.lng}
                  location={formData.location}
                  roofArea={formData.roofArea}
                  onLocationSelect={handleLocationSelect}
                  showRainfallData={showRainfallLayer}
                  showSoilData={showSoilLayer}
                />
                <div className="flex space-x-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowRainfallLayer(!showRainfallLayer)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showRainfallLayer 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Rainfall Layer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSoilLayer(!showSoilLayer)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showSoilLayer 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Soil Layer
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <Calculator className="h-5 w-5" />
                    <span>{t('quick.submit')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Rainwater Harvesting Assessment
              </h2>
              <p className="text-gray-600">
                AI-powered analysis of your rainwater harvesting potential
              </p>
            </div>
            
            {/* Feasibility Score Card */}
            <FeasibilityScoreCard recommendation={results.recommendation} />
            
            {/* System Recommendation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🏗️ Recommended System</h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-green-800 mb-2">
                    {results.structureSpecs.type}
                  </h4>
                  <p className="text-green-700 text-sm">
                    Capacity: {results.structureSpecs.capacity.toLocaleString()} liters
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Estimated Cost:</strong> ₹{results.structureSpecs.estimatedCost.toLocaleString()}</p>
                    <p><strong>Installation Time:</strong> {results.structureSpecs.installationTime} days</p>
                    <p><strong>Annual Maintenance:</strong> ₹{results.structureSpecs.maintenanceCost.toLocaleString()}</p>
                    <p><strong>Payback Period:</strong> {Math.round(results.paybackPeriod * 10) / 10} years</p>
                  </div>
                  <div>
                    <p><strong>Dimensions:</strong></p>
                    <ul className="ml-4 text-sm">
                      <li>Length: {results.structureSpecs.dimensions.length}m</li>
                      <li>Width: {results.structureSpecs.dimensions.width}m</li>
                      <li>Height: {results.structureSpecs.dimensions.height}m</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <p><strong>Materials Required:</strong></p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {results.structureSpecs.materials.map((material: string, index: number) => (
                      <span key={index} className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Alternative Options */}
                {results.recommendation.alternativeOptions.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Alternative Options</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {results.recommendation.alternativeOptions.map((option: string, index: number) => (
                        <li key={index}>• {option.replace(/_/g, ' ').toUpperCase()}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <Droplets className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-blue-700">
                  {Math.round(results.harvestPotential / 1000)}K L
                </div>
                <div className="text-sm text-blue-600">Annual Harvest Potential</div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-green-700">
                  ₹{Math.round(results.annualSavings / 1000)}K
                </div>
                <div className="text-sm text-green-600">Annual Water Savings</div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-purple-700">
                  {Math.round(results.paybackPeriod * 10) / 10} years
                </div>
                <div className="text-sm text-purple-600">Investment Payback</div>
              </div>
            </div>
            
            {/* What-If Simulator */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Scenario Analysis</h3>
              <button
                onClick={() => setShowSimulator(!showSimulator)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Sliders className="h-4 w-4" />
                <span>{showSimulator ? 'Hide' : 'Show'} Simulator</span>
              </button>
            </div>
            
            {showSimulator && (
              <WhatIfSimulator baseInput={formData} />
            )}
            
            {/* Hydrogeology Information */}
            <HydrogeologyInfo
              latitude={formData.coordinates.lat}
              longitude={formData.coordinates.lng}
              location={formData.location}
              rainfallData={rainfallData}
              groundwaterData={groundwaterData}
            />
            
            {/* Environmental Impact */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-emerald-900 mb-4">🌍 Environmental Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700">
                      {Math.round(results.harvestPotential / 1000)}K L
                    </div>
                    <div className="text-sm text-emerald-600">Water Conserved</div>
                  </div>
                </div>
                <div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700">
                      {Math.round(results.harvestPotential * 0.0003)}
                    </div>
                    <div className="text-sm text-emerald-600">kg CO₂ Saved</div>
                  </div>
                </div>
                <div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700">
                      {Math.round((results.harvestPotential / (formData.waterDemand || 1)) * 100)}%
                    </div>
                    <div className="text-sm text-emerald-600">Water Independence</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Detailed Report</span>
                </button>
              </div>
              
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
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Next Steps</h5>
                <ul className="text-sm text-blue-800 space-y-1 text-left max-w-md mx-auto">
                  <li>• Consult with local contractors for implementation</li>
                  <li>• Obtain necessary permits from local authorities</li>
                  <li>• Consider phased implementation for large systems</li>
                  <li>• Plan for regular maintenance and monitoring</li>
                  <li>• Explore government subsidies and incentives</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default FeasibilityCheck;