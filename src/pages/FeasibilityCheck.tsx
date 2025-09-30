import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calculator, MapPin, Home, Users, Square, Map, Layers, Eye, Download, Sliders, Droplets, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { aiRecommendationEngine, AIInput } from '../services/aiRecommendationEngine';
import { rainfallApiService } from '../services/rainfallApi';
import { locationService, LocationResult } from '../services/locationService';
import { generatePDFReport, ReportData } from '../utils/pdfGenerator';
import GISMap from '../components/GISMap';
import HydrogeologyInfo from '../components/HydrogeologyInfo';
import FeasibilityScoreCard from '../components/FeasibilityScoreCard';
import WhatIfSimulator from '../components/WhatIfSimulator';
import FieldVerificationWorkflow from '../components/FieldVerificationWorkflow';

const FeasibilityCheck: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
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
  const [showVerification, setShowVerification] = useState(false);
  const [showRainfallLayer, setShowRainfallLayer] = useState(false);
  const [showSoilLayer, setShowSoilLayer] = useState(false);
  const [rainfallData, setRainfallData] = useState<any>(null);
  const [groundwaterData, setGroundwaterData] = useState<any>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationResult[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [roofAreaUnit, setRoofAreaUnit] = useState<'sqm' | 'sqft'>('sqm');
  const [spaceUnit, setSpaceUnit] = useState<'sqm' | 'sqft'>('sqm');
  const [selectedMapLocation, setSelectedMapLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert area values based on selected units
    let processedValue = value;
    if (name === 'roofArea' && roofAreaUnit === 'sqft') {
      processedValue = (parseFloat(value) * 0.092903).toString(); // Convert sq ft to sq m
    } else if (name === 'availableSpace' && spaceUnit === 'sqft') {
      processedValue = (parseFloat(value) * 0.092903).toString(); // Convert sq ft to sq m
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roofArea' || name === 'numDwellers' || name === 'availableSpace' || name === 'groundwaterDepth' || name === 'latitude' || name === 'longitude'
        ? parseFloat(processedValue) || 0
        : value,
      waterDemand: name === 'numDwellers' ? (parseFloat(value) || 0) * 150 * 365 : prev.waterDemand
    }));
    
    // Auto-fill groundwater when coordinates change
    if (name === 'latitude' || name === 'longitude') {
      const lat = name === 'latitude' ? parseFloat(value) : formData.coordinates.lat;
      const lng = name === 'longitude' ? parseFloat(value) : formData.coordinates.lng;
      
      if (lat && lng && lat !== 0 && lng !== 0) {
        setFormData(prev => ({
          ...prev,
          coordinates: { lat, lng }
        }));
        fetchLocationData(lat, lng, formData.location || `${lat}, ${lng}`);
      }
    }
  };

  const handleLocationSearch = (searchTerm: string) => {
    locationService.searchWithDebounce(searchTerm, (results) => {
      setLocationSuggestions(results);
      setShowLocationSuggestions(results.length > 0);
    });
  };

  const handleLocationSelect = (suggestion: LocationResult) => {
    setFormData(prev => ({
      ...prev,
      location: suggestion.address,
      coordinates: suggestion.coordinates
    }));
    setShowLocationSuggestions(false);
    fetchLocationData(suggestion.coordinates.lat, suggestion.coordinates.lng, suggestion.address);
  };
  
  const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedMapLocation({ lat, lng });
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
    setLoading(true);
    
    locationService.getCurrentLocation()
      .then((result) => {
        if (result) {
          setFormData(prev => ({
            ...prev,
            location: result.address,
            coordinates: result.coordinates
          }));
          
          fetchLocationData(result.coordinates.lat, result.coordinates.lng, result.address);
          
          if (user) {
            addNotification({
              title: 'Location Updated',
              message: 'Your current location has been detected successfully.',
              type: 'success'
            });
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error getting location:', error);
        setLoading(false);
        
        let errorMessage = 'Unable to get your current location. Please enter manually.';
        if (error.code === 1) {
          errorMessage = 'Location access denied. Please allow location access and try again.';
        } else if (error.code === 2) {
          errorMessage = 'Location information unavailable. Please enter manually.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        
        if (user) {
          addNotification({
            title: 'Location Error',
            message: errorMessage,
            type: 'warning'
          });
        }
      });
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

  const handleBackNavigation = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Back Button */}
          <button
            onClick={handleBackNavigation}
            className="absolute left-0 top-0 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {t('quick.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI-powered assessment of your rainwater harvesting potential with detailed recommendations
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                <div className="relative">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={(e) => {
                        handleInputChange(e);
                        handleLocationSearch(e.target.value);
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter address or PIN code"
                      required
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={loading}
                      className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-md"
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Location Suggestions */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleLocationSelect(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 focus:bg-gradient-to-r focus:from-green-50 focus:to-blue-50 focus:outline-none transition-all"
                        >
                          <div className="font-medium text-gray-900 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-green-600" />
                            {suggestion.components.city || suggestion.components.district || 'Unknown City'}
                          </div>
                          <div className="text-sm text-gray-600 truncate">{suggestion.address}</div>
                          <div className="text-xs text-gray-500">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              suggestion.accuracy === 'high' ? 'bg-green-100 text-green-800' :
                              suggestion.accuracy === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {suggestion.accuracy} accuracy
                            </span>
                            <span className="ml-2">{suggestion.coordinates.lat.toFixed(4)}, {suggestion.coordinates.lng.toFixed(4)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.coordinates.lat || ''}
                    onChange={handleInputChange}
                    step="0.000001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="17.3850"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.coordinates.lng || ''}
                    onChange={handleInputChange}
                    step="0.000001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="78.4867"
                  />
                </div>
              </div>

              {/* Roof Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Home className="inline h-4 w-4 mr-1" />
                  {t('quick.roof_area')}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="roofArea"
                    value={roofAreaUnit === 'sqm' ? formData.roofArea || '' : Math.round((formData.roofArea || 0) / 0.092903) || ''}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder={`Enter roof area in ${roofAreaUnit === 'sqm' ? 'square meters' : 'square feet'}`}
                    required
                    min="1"
                  />
                  <select
                    value={roofAreaUnit}
                    onChange={(e) => setRoofAreaUnit(e.target.value as 'sqm' | 'sqft')}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="sqm">m²</option>
                    <option value="sqft">ft²</option>
                  </select>
                </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="availableSpace"
                    value={spaceUnit === 'sqm' ? formData.availableSpace || '' : Math.round((formData.availableSpace || 0) / 0.092903) || ''}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder={`Available space in ${spaceUnit === 'sqm' ? 'square meters' : 'square feet'}`}
                    required
                    min="1"
                  />
                  <select
                    value={spaceUnit}
                    onChange={(e) => setSpaceUnit(e.target.value as 'sqm' | 'sqft')}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="sqm">m²</option>
                    <option value="sqft">ft²</option>
                  </select>
                </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
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
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    groundwaterData ? 'bg-blue-50' : 'bg-white'
                  }`}
                  placeholder="Groundwater depth in meters"
                  min="1"
                  readOnly={groundwaterData ? true : false}
                  title={groundwaterData ? "Auto-filled based on location" : "Enter manually or select location for auto-fill"}
                />
                {groundwaterData && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Auto-filled based on location data
                  </p>
                )}
              </div>
            </div>

            {/* Map Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
              >
                <Map className="h-4 w-4" />
                <span>{showMap ? 'Hide' : 'Show'} Map</span>
              </button>
              
              {selectedMapLocation && (
                <div className="text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                  📍 Map location selected: {selectedMapLocation.lat.toFixed(4)}, {selectedMapLocation.lng.toFixed(4)}
                </div>
              )}
            </div>

            {/* GIS Map */}
            {showMap && (
              <div className="mt-6 bg-white rounded-lg p-4 shadow-inner">
                <GISMap
                  latitude={formData.coordinates.lat}
                  longitude={formData.coordinates.lng}
                  location={formData.location}
                  roofArea={formData.roofArea}
                  onLocationSelect={handleMapLocationSelect}
                  showRainfallData={showRainfallLayer}
                  showSoilData={showSoilLayer}
                />
                <div className="flex space-x-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowRainfallLayer(!showRainfallLayer)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showRainfallLayer 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Rainfall Layer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSoilLayer(!showSoilLayer)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showSoilLayer 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
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
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto shadow-lg transform hover:scale-105"
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
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Your Rainwater Harvesting Assessment
              </h2>
              <p className="text-gray-600">
                AI-powered analysis of your rainwater harvesting potential
              </p>
            </div>
            
            {/* Feasibility Score Card */}
            <FeasibilityScoreCard recommendation={results.recommendation} />
            
            {/* System Recommendation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🏗️ Recommended System</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
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
                      <span key={index} className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-3 py-1 rounded-full text-xs border border-green-200">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Alternative Options */}
                {results.recommendation.alternativeOptions.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center shadow-md border border-blue-200">
                <Droplets className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-blue-700">
                  {Math.round(results.harvestPotential / 1000)}K L
                </div>
                <div className="text-sm text-blue-600">Annual Harvest Potential</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center shadow-md border border-green-200">
                <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-green-700">
                  ₹{Math.round(results.annualSavings / 1000)}K
                </div>
                <div className="text-sm text-green-600">Annual Water Savings</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center shadow-md border border-purple-200">
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
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
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
            
            {/* Field Verification Workflow */}
            {user && (user.role === 'admin' || user.role === 'contractor') && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Field Verification</h3>
                <button
                  onClick={() => setShowVerification(!showVerification)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{showVerification ? 'Hide' : 'Show'} Verification</span>
                </button>
              </div>
            )}
            
            {showVerification && (
              <FieldVerificationWorkflow 
                projectId={`proj-${Date.now()}`}
                onStatusChange={(status) => console.log('Verification status:', status)}
              />
            )}
            
            {/* Environmental Impact */}
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 p-6 rounded-xl shadow-md border border-emerald-200">
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
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl text-center shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md transform hover:scale-105"
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
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
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
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                    >
                      Create Free Account
                    </button>
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-md"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
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
        <div className="absolute top-20 left-10 w-8 h-12 bg-blue-200 opacity-10 animate-float" 
             style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'}}>
        </div>
        <div className="absolute top-40 right-20 w-6 h-10 bg-green-200 opacity-10 animate-float" 
             style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', animationDelay: '1s'}}>
        </div>
        <div className="absolute bottom-32 left-1/4 w-10 h-14 bg-blue-100 opacity-10 animate-float" 
             style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', animationDelay: '2s'}}>
        </div>
        <div className="absolute top-60 right-1/3 w-4 h-8 bg-purple-200 opacity-10 animate-float" 
             style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', animationDelay: '0.5s'}}>
        </div>
      </div>
    </div>
  );
};

export default FeasibilityCheck;