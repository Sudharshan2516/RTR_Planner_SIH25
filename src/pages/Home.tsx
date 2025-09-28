import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, MapPin, Calculator, FileText, ArrowRight, CheckCircle, Users, TrendingUp, Award } from 'lucide-react';
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

  const stats = [
    { icon: <Users className="h-8 w-8" />, value: '10,000+', label: 'Users Registered' },
    { icon: <Droplets className="h-8 w-8" />, value: '50M L', label: 'Water Saved' },
    { icon: <TrendingUp className="h-8 w-8" />, value: '₹2.5Cr', label: 'Money Saved' },
    { icon: <Award className="h-8 w-8" />, value: '500+', label: 'Projects Completed' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-green-100 overflow-hidden">
        {/* Animated Water Droplets */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-8 h-12 bg-blue-200 opacity-30 animate-float water-droplet"></div>
          <div className="absolute top-40 right-20 w-6 h-10 bg-green-200 opacity-25 animate-float water-droplet" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-10 h-14 bg-blue-100 opacity-35 animate-float water-droplet" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-60 right-1/3 w-4 h-8 bg-green-300 opacity-20 animate-float water-droplet" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Main Logo */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-20 h-24 bg-gradient-to-b from-blue-500 to-green-500 water-droplet flex items-center justify-center">
                <Droplets className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/feasibility"
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
              >
                {t('home.cta.start')}
                <ArrowRight className="inline ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
              >
                {t('nav.login')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full text-green-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.how_it_works')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with rainwater harvesting in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white mx-auto">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AquaHarvest?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive platform for all your rainwater harvesting needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-800 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Harvesting Rainwater?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already saving water and money with our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/feasibility"
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Free Assessment
            </Link>
            <Link
              to="/signup"
              className="bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-800 transition-colors shadow-lg"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;