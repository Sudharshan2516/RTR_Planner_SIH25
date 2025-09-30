import React from 'react';
import { Droplets, Users, Target, Award, CheckCircle, TrendingUp, Globe, Heart } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: <Droplets className="h-8 w-8 text-blue-600" />,
      title: 'AI-Powered Assessment',
      description: 'Advanced algorithms analyze your location, rainfall patterns, and site conditions to provide accurate feasibility assessments.'
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: 'Expert Network',
      description: 'Connect with verified contractors and water conservation experts in your area for professional implementation.'
    },
    {
      icon: <Target className="h-8 w-8 text-purple-600" />,
      title: 'Customized Solutions',
      description: 'Get personalized recommendations based on your specific needs, budget, and local conditions.'
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-600" />,
      title: 'Proven Results',
      description: 'Join thousands of users who have successfully implemented rainwater harvesting systems with our guidance.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Users Served', icon: <Users className="h-6 w-6" /> },
    { number: '50M L', label: 'Water Saved', icon: <Droplets className="h-6 w-6" /> },
    { number: '₹2.5Cr', label: 'Money Saved', icon: <TrendingUp className="h-6 w-6" /> },
    { number: '500+', label: 'Projects Completed', icon: <CheckCircle className="h-6 w-6" /> }
  ];

  const team = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Founder & CEO',
      expertise: 'Water Conservation Expert',
      description: '15+ years in sustainable water management and environmental engineering.'
    },
    {
      name: 'Priya Sharma',
      role: 'CTO',
      expertise: 'AI & Technology',
      description: 'Leading AI development for water resource optimization and predictive analytics.'
    },
    {
      name: 'Arjun Patel',
      role: 'Head of Operations',
      expertise: 'Project Management',
      description: 'Overseeing nationwide implementation and contractor network management.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Droplets className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About AquaHarvest
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              Empowering communities to achieve water independence through intelligent rainwater harvesting solutions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            To make rainwater harvesting accessible, affordable, and effective for every household and community in India. 
            We combine cutting-edge AI technology with traditional water conservation wisdom to create sustainable solutions 
            for water scarcity challenges.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Why Choose AquaHarvest?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gray-100 rounded-full mr-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Story</h2>
          <div className="prose prose-lg max-w-4xl mx-auto text-gray-600">
            <p className="mb-6">
              AquaHarvest was born from a simple observation: while India receives abundant rainfall during monsoons, 
              most of this precious water goes to waste due to inadequate harvesting infrastructure. Our founders, 
              a team of water conservation experts and technology enthusiasts, set out to bridge this gap.
            </p>
            <p className="mb-6">
              Starting in 2023, we began developing an AI-powered platform that could assess the rainwater harvesting 
              potential of any location in India. By combining satellite data, weather patterns, soil analysis, and 
              local expertise, we created a comprehensive solution that makes water conservation accessible to everyone.
            </p>
            <p>
              Today, AquaHarvest serves thousands of users across India, from individual homeowners to large communities, 
              helping them achieve water independence while contributing to groundwater recharge and environmental sustainability.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-green-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 mb-3">{member.expertise}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Globe className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-600">
                We believe in creating solutions that benefit both people and the planet, ensuring water security for future generations.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">
                Water conservation is a collective effort. We foster communities of practice and knowledge sharing.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Heart className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Impact</h3>
              <p className="text-gray-600">
                Every drop counts. We measure our success by the positive impact we create in communities across India.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;