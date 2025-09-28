import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, MapPin, Calculator, FileText, ArrowRight, CheckCircle, Cloud, Waves } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calculator className="h-8 w-8" />,
      title: t('features.assessment.title'),
      description: t('features.assessment.desc')
    },
    {
      icon: <Droplet className="h-8 w-8" />,
      title: t('features.structures.title'),
      description: t('features.structures.desc')
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: t('features.tracking.title'),
      description: t('features.tracking.desc')
    }
  ];

  const stats = [
    { value: '50,000+', label: 'Liters Saved Daily' },
    { value: '2,500+', label: 'Projects Completed' },
    { value: '15+', label: 'Cities Covered' },
    { value: '95%', label: 'Success Rate' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-green-100 overflow-hidden min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Water Cycle Animation - Rain to Ground */}
            <div className="mb-12 relative h-64">
              {/* Cloud */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <Cloud className="h-16 w-16 text-gray-400 animate-pulse" />
              </div>
              
              {/* Falling Water Droplets */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-4">
                {/* Large droplet */}
                <div className="w-8 h-10 bg-blue-500 opacity-80 animate-bounce" 
                     style={{
                       borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                       animationDelay: '0s',
                       animationDuration: '2s'
                     }}>
                </div>
                
                {/* Medium droplets */}
                <div className="flex space-x-8">
                  <div className="w-6 h-8 bg-blue-400 opacity-70 animate-bounce" 
                       style={{
                         borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                         animationDelay: '0.3s',
                         animationDuration: '2.2s'
                       }}>
                  </div>
                  <div className="w-6 h-8 bg-blue-400 opacity-70 animate-bounce" 
                       style={{
                         borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                         animationDelay: '0.6s',
                         animationDuration: '1.8s'
                       }}>
                  </div>
                </div>
                
                {/* Small droplets */}
                <div className="flex space-x-12">
                  <div className="w-4 h-6 bg-blue-300 opacity-60 animate-bounce" 
                       style={{
                         borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                         animationDelay: '0.9s',
                         animationDuration: '2.5s'
                       }}>
                  </div>
                  <div className="w-4 h-6 bg-blue-300 opacity-60 animate-bounce" 
                       style={{
                         borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                         animationDelay: '1.2s',
                         animationDuration: '2.1s'
                       }}>
                  </div>
                  <div className="w-4 h-6 bg-blue-300 opacity-60 animate-bounce" 
                       style={{
                         borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                         animationDelay: '1.5s',
                         animationDuration: '1.9s'
                       }}>
                  </div>
                </div>
              </div>
              
              {/* Ground/Soil Representation */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md">
                <div className="h-16 bg-gradient-to-b from-green-600 to-green-800 rounded-t-lg relative overflow-hidden">
                  {/* Soil layers */}
                  <div className="absolute bottom-0 w-full h-8 bg-gradient-to-b from-amber-700 to-amber-900"></div>
                  <div className="absolute bottom-0 w-full h-4 bg-gradient-to-b from-stone-700 to-stone-900"></div>
                  
                  {/* Water seepage animation */}
                  <div className="absolute inset-0 flex justify-center items-end space-x-4 pb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full opacity-70 animate-ping" style={{animationDelay: '2s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full opacity-70 animate-ping" style={{animationDelay: '2.3s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full opacity-70 animate-ping" style={{animationDelay: '2.6s'}}></div>
                  </div>
                  
                  {/* Underground water flow */}
                  <Waves className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-4 w-4 text-blue-300 animate-pulse" />
                </div>
                
                {/* Ground water recharge indicator */}
                <div className="text-center mt-2">
                  <span className="text-xs text-green-700 font-medium">Groundwater Recharge</span>
                </div>
              </div>
            </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/feasibility"
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
              >
                {t('home.cta.check')}
              </Link>
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors">
                {t('home.cta.learn')}
              </button>
            </div>
        
        {/* Floating Water Droplets Around the Page */}
        <div className="absolute top-20 left-10 w-12 h-16 bg-blue-400 opacity-30 animate-bounce" 
             style={{
               borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
               animationDuration: '3s'
             }}>
        </div>
        <div className="absolute top-40 right-20 w-8 h-12 bg-green-400 opacity-25 animate-pulse" 
             style={{
               borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
               animationDelay: '0.5s'
             }}>
        </div>
        <div className="absolute bottom-32 left-20 w-10 h-14 bg-blue-300 opacity-20 animate-bounce" 
             style={{
               borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
               animationDelay: '1s',
               animationDuration: '2.5s'
             }}>
        </div>
        <div className="absolute bottom-20 right-10 w-14 h-18 bg-green-300 opacity-35 animate-pulse" 
             style={{
               borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
               animationDelay: '1.5s'
             }}>
        </div>
      </div>
      </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16 relative overflow-hidden">
        {/* Water droplet pattern in background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-1/4 w-6 h-8 bg-white" 
               style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'}}>
          </div>
          <div className="absolute top-12 right-1/3 w-4 h-6 bg-white" 
               style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'}}>
          </div>
          <div className="absolute bottom-8 left-1/3 w-8 h-10 bg-white" 
               style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'}}>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2 text-white">{stat.value}</div>
                <div className="text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AquaHarvest?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines advanced technology with sustainable practices to deliver optimal rainwater harvesting solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to transform your rooftop into a water conservation system
            </p>
            
            {/* Water cycle visualization */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-4 text-blue-600">
                <Cloud className="h-8 w-8" />
                <ArrowRight className="h-6 w-6" />
                <div className="w-6 h-8 bg-blue-500" 
                     style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'}}>
                </div>
                <ArrowRight className="h-6 w-6" />
                <div className="w-8 h-4 bg-green-600 rounded"></div>
                <ArrowRight className="h-6 w-6" />
                <Waves className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Assessment', desc: 'Enter your rooftop details and location information' },
              { step: '2', title: 'Analysis', desc: 'AI analyzes rainfall data and calculates harvest potential' },
              { step: '3', title: 'Design', desc: 'Get custom structure recommendations and cost estimates' },
              { step: '4', title: 'Implementation', desc: 'Connect with contractors and track your project progress' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Benefits of Rainwater Harvesting
              </h2>
              <div className="space-y-4">
                {[
                  'Reduce water bills by up to 40%',
                  'Sustainable water source for your home',
                  'Contribute to groundwater recharge',
                  'Reduce flooding and soil erosion',
                  'Government incentives and rebates available',
                  'Increase property value'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-lg">
              <div className="text-center">
                <Award className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Join Our Community
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect with thousands of water conservation enthusiasts and earn points for your sustainability efforts.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">5,000+ Active Members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Water Conservation Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get your free feasibility assessment today and discover how much water and money you can save.
          </p>
          <Link
            to="/feasibility"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Free Assessment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;