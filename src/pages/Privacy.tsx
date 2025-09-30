import React from 'react';
import { Shield, Eye, Lock, Users, FileText, AlertCircle } from 'lucide-react';

const Privacy: React.FC = () => {
  const sections = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Information We Collect',
      content: [
        'Personal information (name, email, phone number) when you create an account',
        'Location data for rainfall and feasibility assessments',
        'Property details (roof area, number of dwellers) for calculations',
        'Usage data to improve our services and user experience',
        'Device information and IP addresses for security purposes'
      ]
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: 'How We Use Your Information',
      content: [
        'Provide personalized rainwater harvesting assessments',
        'Connect you with verified contractors in your area',
        'Send important updates about your projects and account',
        'Improve our AI algorithms and service quality',
        'Comply with legal requirements and prevent fraud'
      ]
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Information Sharing',
      content: [
        'We do not sell your personal information to third parties',
        'Verified contractors may access project details when you request quotes',
        'Anonymized data may be used for research and development',
        'Legal authorities may access data when required by law',
        'Service providers helping us operate the platform (with strict agreements)'
      ]
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: 'Data Security',
      content: [
        'Industry-standard encryption for data transmission and storage',
        'Regular security audits and vulnerability assessments',
        'Access controls and authentication for all team members',
        'Secure cloud infrastructure with backup and recovery systems',
        'Incident response procedures for any security breaches'
      ]
    }
  ];

  const rights = [
    'Access your personal data and download a copy',
    'Correct inaccurate or incomplete information',
    'Delete your account and associated data',
    'Restrict processing of your information',
    'Object to certain uses of your data',
    'Data portability to other services'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Shield className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            AquaHarvest ("we," "our," or "us") is committed to protecting your privacy and ensuring the security 
            of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard 
            your information when you use our rainwater harvesting assessment platform.
          </p>
          <p className="text-gray-600 leading-relaxed">
            By using our services, you agree to the collection and use of information in accordance with this policy. 
            If you do not agree with our policies and practices, please do not use our services.
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

        {/* Your Rights */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Under applicable data protection laws, you have the following rights regarding your personal information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rights.map((right, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-600">{right}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cookies and Tracking */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our platform. 
              These technologies help us:
            </p>
            <ul className="space-y-2 ml-6">
              <li>• Remember your preferences and settings</li>
              <li>• Analyze website traffic and usage patterns</li>
              <li>• Provide personalized content and recommendations</li>
              <li>• Ensure security and prevent fraud</li>
            </ul>
            <p>
              You can control cookie settings through your browser preferences. However, disabling certain 
              cookies may affect the functionality of our services.
            </p>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes 
              outlined in this Privacy Policy, unless a longer retention period is required by law.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Retention Periods:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Account information: Until account deletion + 30 days</li>
                <li>• Project data: 7 years for tax and legal compliance</li>
                <li>• Usage logs: 2 years for security and analytics</li>
                <li>• Marketing communications: Until you unsubscribe</li>
              </ul>
            </div>
          </div>
        </div>

        {/* International Transfers */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
          <p className="text-gray-600 mb-4">
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your data during such transfers, 
            including:
          </p>
          <ul className="space-y-2 text-gray-600 ml-6">
            <li>• Adequacy decisions by relevant authorities</li>
            <li>• Standard contractual clauses approved by regulators</li>
            <li>• Certification schemes and codes of conduct</li>
          </ul>
        </div>

        {/* Children's Privacy */}
        <div className="bg-yellow-50 rounded-xl p-8 mt-8 border border-yellow-200">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Children's Privacy</h2>
          </div>
          <p className="text-gray-600">
            Our services are not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13. If you are a parent or guardian 
            and believe your child has provided us with personal information, please contact us 
            immediately.
          </p>
        </div>

        {/* Changes to Privacy Policy */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
          <p className="text-gray-600 mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices 
            or for other operational, legal, or regulatory reasons. We will notify you of any material 
            changes by:
          </p>
          <ul className="space-y-2 text-gray-600 ml-6 mb-4">
            <li>• Posting the updated policy on our website</li>
            <li>• Sending you an email notification</li>
            <li>• Displaying a prominent notice on our platform</li>
          </ul>
          <p className="text-gray-600">
            Your continued use of our services after any changes indicates your acceptance of the 
            updated Privacy Policy.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 mt-8 border border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="space-y-2 text-gray-600">
            <p><strong>Email:</strong> privacy@aquaharvest.com</p>
            <p><strong>Phone:</strong> +91 9876543210</p>
            <p><strong>Address:</strong> AquaHarvest Privacy Office, Hyderabad, Telangana, India</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            We will respond to your inquiry within 30 days of receipt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;