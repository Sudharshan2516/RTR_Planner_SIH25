import React from 'react';
import { FileText, AlertTriangle, Shield, Users, Gavel, CheckCircle } from 'lucide-react';

const Terms: React.FC = () => {
  const sections = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'User Accounts and Responsibilities',
      content: [
        'You must provide accurate and complete information when creating an account',
        'You are responsible for maintaining the confidentiality of your account credentials',
        'You must notify us immediately of any unauthorized use of your account',
        'You agree to use our services only for lawful purposes',
        'You will not attempt to interfere with or disrupt our services'
      ]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Service Availability and Accuracy',
      content: [
        'We strive to provide accurate assessments but cannot guarantee 100% accuracy',
        'Our recommendations are based on available data and AI algorithms',
        'Local conditions may vary and affect actual results',
        'We reserve the right to modify or discontinue services with notice',
        'Service availability may be affected by maintenance or technical issues'
      ]
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Intellectual Property Rights',
      content: [
        'All content, software, and technology on our platform are our property',
        'You may not copy, modify, or distribute our proprietary content',
        'User-generated content remains your property but you grant us usage rights',
        'We respect third-party intellectual property rights',
        'Report any copyright infringement to our designated agent'
      ]
    },
    {
      icon: <Gavel className="h-6 w-6" />,
      title: 'Limitation of Liability',
      content: [
        'Our liability is limited to the maximum extent permitted by law',
        'We are not liable for indirect, incidental, or consequential damages',
        'Our total liability will not exceed the amount you paid for our services',
        'We do not warrant that our services will be error-free or uninterrupted',
        'You use our services at your own risk'
      ]
    }
  ];

  const prohibitedUses = [
    'Violating any applicable laws or regulations',
    'Infringing on intellectual property rights',
    'Transmitting malicious code or viruses',
    'Attempting to gain unauthorized access to our systems',
    'Using our services for commercial purposes without permission',
    'Harassing or threatening other users',
    'Providing false or misleading information',
    'Interfering with the proper functioning of our services'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <FileText className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Please read these terms carefully before using our rainwater harvesting platform.
            </p>
            <p className="text-sm text-green-200 mt-4">
              Last updated: January 15, 2024
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            These Terms of Service ("Terms") govern your use of the AquaHarvest platform and services 
            ("Services") operated by AquaHarvest ("we," "us," or "our"). By accessing or using our 
            Services, you agree to be bound by these Terms.
          </p>
          <p className="text-gray-600 leading-relaxed">
            If you disagree with any part of these Terms, then you may not access or use our Services. 
            These Terms apply to all visitors, users, and others who access or use the Services.
          </p>
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Prohibited Uses */}
        <div className="bg-red-50 rounded-xl shadow-md p-8 mt-8 border border-red-200">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-red-100 rounded-full text-red-600 mr-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Prohibited Uses</h2>
          </div>
          <p className="text-gray-600 mb-4">
            You may not use our Services for any of the following purposes:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prohibitedUses.map((use, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-600 text-sm">{use}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Terms</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Our basic feasibility assessment service is provided free of charge. Premium features 
              and services may require payment as follows:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Premium Services:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Detailed engineering reports and blueprints</li>
                <li>• Priority contractor matching and support</li>
                <li>• Advanced simulation and modeling tools</li>
                <li>• Ongoing project monitoring and maintenance alerts</li>
              </ul>
            </div>
            <p>
              All payments are processed securely through our payment partners. Refunds are available 
              within 30 days of purchase for unused premium services.
            </p>
          </div>
        </div>

        {/* Privacy and Data */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy and Data Protection</h2>
          <p className="text-gray-600 mb-4">
            Your privacy is important to us. Our collection and use of personal information is governed 
            by our Privacy Policy, which is incorporated into these Terms by reference.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>Key Points:</strong> We collect only necessary information for providing our services, 
              use industry-standard security measures, and never sell your personal data to third parties.
            </p>
          </div>
        </div>

        {/* Third-Party Services */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Our Services may contain links to third-party websites or services that are not owned 
              or controlled by AquaHarvest. We have no control over and assume no responsibility for 
              the content, privacy policies, or practices of any third-party services.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                <strong>Contractor Network:</strong> We facilitate connections with independent contractors 
                but are not responsible for their work quality, pricing, or conduct. All agreements are 
                directly between you and the contractor.
              </p>
            </div>
          </div>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              We may terminate or suspend your account and access to our Services immediately, without 
              prior notice or liability, for any reason, including breach of these Terms.
            </p>
            <p>
              You may terminate your account at any time by contacting us or using the account deletion 
              feature in your profile settings.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Upon Termination:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Your right to use our Services will cease immediately</li>
                <li>• We may delete your account and data after 30 days</li>
                <li>• You may request a data export before deletion</li>
                <li>• Certain provisions of these Terms will survive termination</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law and Jurisdiction</h2>
          <p className="text-gray-600 mb-4">
            These Terms shall be governed by and construed in accordance with the laws of India, 
            without regard to its conflict of law provisions.
          </p>
          <p className="text-gray-600">
            Any disputes arising from these Terms or your use of our Services shall be subject to 
            the exclusive jurisdiction of the courts in Hyderabad, Telangana, India.
          </p>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to modify or replace these Terms at any time. If a revision is material, 
            we will provide at least 30 days notice before any new terms take effect.
          </p>
          <div className="flex items-start bg-green-50 p-4 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-green-800 text-sm">
              <strong>Notification Methods:</strong> We will notify you of changes via email, 
              platform notifications, or by posting the updated Terms on our website.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 mt-8 border border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2 text-gray-600">
            <p><strong>Email:</strong> legal@aquaharvest.com</p>
            <p><strong>Phone:</strong> +91 9876543210</p>
            <p><strong>Address:</strong> AquaHarvest Legal Department, Hyderabad, Telangana, India</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            We will respond to your inquiry within 7 business days.
          </p>
        </div>

        {/* Acknowledgment */}
        <div className="bg-blue-50 rounded-xl p-8 mt-8 border border-blue-200 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acknowledgment</h2>
          <p className="text-gray-600">
            By using our Services, you acknowledge that you have read these Terms of Service 
            and agree to be bound by them. Thank you for choosing AquaHarvest for your 
            rainwater harvesting needs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;