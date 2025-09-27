import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, MapPin, Home, Users, Square } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { calculateHarvestPrediction, getStructureRecommendation, calculateCostBenefit, FeasibilityInput } from '../utils/calculations';
import { asyncProcessor } from '../utils/asyncProcessor';
import { supabase } from '../lib/supabase';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roofArea' || name === 'numDwellers' || name === 'availableSpace'
        ? parseFloat(value) || 0
        : value
    }));
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Type:</strong> {results.structure.structureType.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Capacity:</strong> {results.structure.tankCapacity.toLocaleString()} liters</p>
              <p><strong>Installation Time:</strong> {results.structure.installationTimeDays} days</p>
              <p><strong>Efficiency:</strong> {Math.round(results.structure.efficiencyRating * 100)}%</p>
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rainwater Harvesting Feasibility Check
          </h1>
          <p className="text-gray-600">
            Get instant analysis of your rooftop's rainwater harvesting potential
          </p>
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
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                />
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
      </div>
    </div>
  );
};

export default FeasibilityCheck;