import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Sliders, TrendingUp, Droplets, Home, Users, DollarSign } from 'lucide-react';
import { aiRecommendationEngine, AIInput } from '../services/aiRecommendationEngine';
import { useLanguage } from '../contexts/LanguageContext';

interface SimulationParams {
  roofArea: number;
  annualRainfall: number;
  numDwellers: number;
  availableSpace: number;
  groundwaterDepth: number;
  budget: number;
}

interface SimulationResult {
  scenario: string;
  harvestPotential: number;
  cost: number;
  paybackPeriod: number;
  feasibilityScore: number;
  waterSavings: number;
  moneySavings: number;
}

interface WhatIfSimulatorProps {
  baseInput: AIInput;
  onSimulationChange?: (results: SimulationResult[]) => void;
}

const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ baseInput, onSimulationChange }) => {
  const { t } = useLanguage();
  const [params, setParams] = useState<SimulationParams>({
    roofArea: baseInput.roofArea,
    annualRainfall: baseInput.annualRainfall,
    numDwellers: baseInput.numDwellers,
    availableSpace: baseInput.availableSpace,
    groundwaterDepth: baseInput.groundwaterDepth,
    budget: 200000
  });

  const [results, setResults] = useState<SimulationResult[]>([]);
  const [activeScenario, setActiveScenario] = useState<string>('current');

  useEffect(() => {
    runSimulations();
  }, [params]);

  const runSimulations = () => {
    const scenarios = [
      { name: 'current', label: 'Current Scenario', multipliers: { roofArea: 1, rainfall: 1, space: 1 } },
      { name: 'optimistic', label: 'Optimistic (20% more rain)', multipliers: { roofArea: 1, rainfall: 1.2, space: 1 } },
      { name: 'pessimistic', label: 'Pessimistic (20% less rain)', multipliers: { roofArea: 1, rainfall: 0.8, space: 1 } },
      { name: 'expanded_roof', label: 'Expanded Roof (+50%)', multipliers: { roofArea: 1.5, rainfall: 1, space: 1.2 } },
      { name: 'compact', label: 'Compact System (-30% space)', multipliers: { roofArea: 1, rainfall: 1, space: 0.7 } }
    ];

    const simulationResults = scenarios.map(scenario => {
      const adjustedInput: AIInput = {
        ...baseInput,
        roofArea: params.roofArea * scenario.multipliers.roofArea,
        annualRainfall: params.annualRainfall * scenario.multipliers.rainfall,
        availableSpace: params.availableSpace * scenario.multipliers.space,
        numDwellers: params.numDwellers,
        groundwaterDepth: params.groundwaterDepth,
        budget: params.budget
      };

      const recommendation = aiRecommendationEngine.analyzeAndRecommend(adjustedInput);
      const structureSpecs = aiRecommendationEngine.generateStructureSpecs(adjustedInput, recommendation.systemType);
      
      const harvestPotential = adjustedInput.roofArea * adjustedInput.annualRainfall * 0.8 * 0.001 * 1000; // liters
      const dailyDemand = adjustedInput.numDwellers * 150;
      const annualDemand = dailyDemand * 365;
      const waterSavings = Math.min(harvestPotential, annualDemand);
      const moneySavings = waterSavings * 0.02; // ₹0.02 per liter
      const paybackPeriod = structureSpecs.estimatedCost / moneySavings;

      return {
        scenario: scenario.label,
        harvestPotential: Math.round(harvestPotential),
        cost: structureSpecs.estimatedCost,
        paybackPeriod: Math.round(paybackPeriod * 10) / 10,
        feasibilityScore: recommendation.feasibilityScore,
        waterSavings: Math.round(waterSavings),
        moneySavings: Math.round(moneySavings)
      };
    });

    setResults(simulationResults);
    onSimulationChange?.(simulationResults);
  };

  const handleParamChange = (param: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [param]: value }));
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'Current Scenario': return '#3B82F6';
      case 'Optimistic (20% more rain)': return '#10B981';
      case 'Pessimistic (20% less rain)': return '#EF4444';
      case 'Expanded Roof (+50%)': return '#8B5CF6';
      case 'Compact System (-30% space)': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const chartData = results.map(result => ({
    scenario: result.scenario.split(' ')[0],
    harvest: result.harvestPotential / 1000, // Convert to thousands
    cost: result.cost / 1000, // Convert to thousands
    feasibility: result.feasibilityScore,
    payback: result.paybackPeriod
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Sliders className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">What-If Simulator</h3>
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Home className="inline h-4 w-4 mr-1" />
            Roof Area (m²)
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={Math.round(baseInput.roofArea * 0.5)}
              max={Math.round(baseInput.roofArea * 2)}
              value={params.roofArea}
              onChange={(e) => handleParamChange('roofArea', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.round(baseInput.roofArea * 0.5)}</span>
              <span className="font-medium text-gray-900">{params.roofArea}</span>
              <span>{Math.round(baseInput.roofArea * 2)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Droplets className="inline h-4 w-4 mr-1" />
            Annual Rainfall (mm)
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={Math.round(baseInput.annualRainfall * 0.5)}
              max={Math.round(baseInput.annualRainfall * 1.5)}
              value={params.annualRainfall}
              onChange={(e) => handleParamChange('annualRainfall', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.round(baseInput.annualRainfall * 0.5)}</span>
              <span className="font-medium text-gray-900">{params.annualRainfall}</span>
              <span>{Math.round(baseInput.annualRainfall * 1.5)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline h-4 w-4 mr-1" />
            Number of People
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={1}
              max={Math.max(10, baseInput.numDwellers * 2)}
              value={params.numDwellers}
              onChange={(e) => handleParamChange('numDwellers', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span className="font-medium text-gray-900">{params.numDwellers}</span>
              <span>{Math.max(10, baseInput.numDwellers * 2)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Space (m²)
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={Math.round(baseInput.availableSpace * 0.5)}
              max={Math.round(baseInput.availableSpace * 2)}
              value={params.availableSpace}
              onChange={(e) => handleParamChange('availableSpace', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.round(baseInput.availableSpace * 0.5)}</span>
              <span className="font-medium text-gray-900">{params.availableSpace}</span>
              <span>{Math.round(baseInput.availableSpace * 2)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Groundwater Depth (m)
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={5}
              max={50}
              value={params.groundwaterDepth}
              onChange={(e) => handleParamChange('groundwaterDepth', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5</span>
              <span className="font-medium text-gray-900">{params.groundwaterDepth}</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Budget (₹)
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={50000}
              max={500000}
              step={10000}
              value={params.budget}
              onChange={(e) => handleParamChange('budget', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹50K</span>
              <span className="font-medium text-gray-900">₹{Math.round(params.budget / 1000)}K</span>
              <span>₹500K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Harvest Potential Chart */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Harvest Potential Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'harvest' ? `${value}K L` : value,
                  name === 'harvest' ? 'Annual Harvest' : name
                ]}
              />
              <Bar dataKey="harvest" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feasibility Score Chart */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Feasibility Score Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Feasibility Score']} />
              <Line type="monotone" dataKey="feasibility" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario Comparison Table */}
      <div className="mt-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Detailed Scenario Comparison</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scenario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harvest (L/year)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payback (years)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feasibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Savings (₹)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr 
                  key={index}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    activeScenario === result.scenario ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setActiveScenario(result.scenario)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: getScenarioColor(result.scenario) }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {result.scenario}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.harvestPotential.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{result.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.paybackPeriod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${result.feasibilityScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{result.feasibilityScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{result.moneySavings.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Key Insights</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Increasing roof area by 50% can improve harvest potential by up to 50%</li>
          <li>• Rainfall variations of ±20% significantly impact feasibility scores</li>
          <li>• Compact systems may have higher costs per liter but faster payback periods</li>
          <li>• Optimal groundwater depth for recharge systems is 10-20 meters</li>
        </ul>
      </div>
    </div>
  );
};

export default WhatIfSimulator;