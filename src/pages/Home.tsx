import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, MapPin, Calculator, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: t('home.steps.location'),
      description: 'Enter your address or use GPS location'
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: t('home.steps.check'),
      description: 'Get instant feasibility analysis'
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: t('home.steps.report'),
      description: 'Download detailed PDF report'
    }
  ];

  const features = [
    'AI-powered feasibility analysis',
    'Structure recommendations',
    'Cost estimation & payback calculation',
    'Contractor network access',
    'Gamification & community leaderboard',
    'Multi-language support'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-green-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Animated Water Droplets */}
            <div className="mb-8 flex justify-center space-x-4">
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;