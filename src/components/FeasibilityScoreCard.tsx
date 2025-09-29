import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, TrendingUp, Droplets, Home, Layers, DollarSign } from 'lucide-react';
import { AIRecommendation } from '../services/aiRecommendationEngine';
import { useLanguage } from '../contexts/LanguageContext';

interface FeasibilityScoreCardProps {
  recommendation: AIRecommendation;
  className?: string;
}

const FeasibilityScoreCard: React.FC<FeasibilityScoreCardProps> = ({ recommendation, className = '' }) => {
  const { t } = useLanguage();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (score >= 60) return <AlertCircle className="h-6 w-6 text-yellow-600" />;
    if (score >= 40) return <AlertCircle className="h-6 w-6 text-orange-600" />;
    return <XCircle className="h-6 w-6 text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Highly recommended for rainwater harvesting implementation';
    if (score >= 60) return 'Good potential with some optimization opportunities';
    if (score >= 40) return 'Moderate potential, consider system modifications';
    return 'Limited potential, may require significant modifications';
  };

  const scoreBreakdown = [
    {
      category: 'Rainfall Adequacy',
      score: recommendation.scoreBreakdown.rainfall,
      icon: <Droplets className="h-5 w-5" />,
      description: 'Annual rainfall and seasonal distribution'
    },
    {
      category: 'Roof Suitability',
      score: recommendation.scoreBreakdown.roofSuitability,
      icon: <Home className="h-5 w-5" />,
      description: 'Roof area, type, and collection efficiency'
    },
    {
      category: 'Space Availability',
      score: recommendation.scoreBreakdown.spaceAvailability,
      icon: <Layers className="h-5 w-5" />,
      description: 'Available space for system installation'
    },
    {
      category: 'Groundwater Conditions',
      score: recommendation.scoreBreakdown.groundwaterConditions,
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Groundwater depth and soil permeability'
    },
    {
      category: 'Cost Effectiveness',
      score: recommendation.scoreBreakdown.costEffectiveness,
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Return on investment and payback period'
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Feasibility Assessment</h3>
            <p className="text-blue-100">Comprehensive analysis of your rainwater harvesting potential</p>
          </div>
          {getScoreIcon(recommendation.feasibilityScore)}
        </div>
      </div>

      {/* Overall Score */}
      <div className="p-6 border-b">
        <div className="text-center">
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(recommendation.feasibilityScore)}`}>
            {recommendation.feasibilityScore}%
          </div>
          <div className={`text-lg font-semibold mb-2 ${getScoreColor(recommendation.feasibilityScore)}`}>
            {getScoreLabel(recommendation.feasibilityScore)}
          </div>
          <p className="text-gray-600 text-sm">
            {getScoreDescription(recommendation.feasibilityScore)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                recommendation.feasibilityScore >= 80 ? 'bg-green-500' :
                recommendation.feasibilityScore >= 60 ? 'bg-yellow-500' :
                recommendation.feasibilityScore >= 40 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${recommendation.feasibilityScore}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h4>
        <div className="space-y-4">
          {scoreBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className={`p-2 rounded-full ${
                  item.score >= 80 ? 'bg-green-100 text-green-600' :
                  item.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                  item.score >= 40 ? 'bg-orange-100 text-orange-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.category}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.score >= 80 ? 'bg-green-500' :
                      item.score >= 60 ? 'bg-yellow-500' :
                      item.score >= 40 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-semibold w-8 ${getScoreColor(item.score)}`}>
                  {item.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="p-6 bg-gray-50">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="font-medium text-gray-900 mb-2">AI Analysis</h5>
            <ul className="space-y-1">
              {recommendation.reasoning.map((reason, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Confidence Level */}
      <div className="p-4 bg-blue-50 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">AI Confidence Level</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${recommendation.confidence}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-blue-900">{recommendation.confidence}%</span>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Based on data quality and parameter consistency
        </p>
      </div>
    </div>
  );
};

export default FeasibilityScoreCard;