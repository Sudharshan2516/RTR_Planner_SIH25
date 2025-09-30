import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Users, Headphones } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const Contact: React.FC = () => {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      addNotification({
        title: 'Message Sent Successfully',
        message: 'Thank you for contacting us! We will get back to you within 24 hours.',
        type: 'success'
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
      setLoading(false);
    }, 1000);
  };

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Us',
      description: 'Send us an email anytime',
      contact: 'info@aquaharvest.com',
      action: 'mailto:info@aquaharvest.com'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Call Us',
      description: 'Mon-Fri 9AM-6PM IST',
      contact: '+91 9876543210',
      action: 'tel:+919876543210'
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Live Chat',
      description: 'Chat with our support team',
      contact: 'Available 24/7',
      action: '#'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Visit Us',
      description: 'Our office location',
      contact: 'Hyderabad, Telangana, India',
      action: '#'
    }
  ];

  const supportTypes = [
    { value: 'general', label: 'General Inquiry', icon: <MessageCircle className="h-4 w-4" /> },
    { value: 'technical', label: 'Technical Support', icon: <Headphones className="h-4 w-4" /> },
    { value: 'partnership', label: 'Partnership', icon: <Users className="h-4 w-4" /> },
    { value: 'feedback', label: 'Feedback', icon: <Mail className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Have questions about rainwater harvesting? We're here to help you every step of the way.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  {method.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{method.description}</p>
              <a
                href={method.action}
                className="text-green-600 font-medium hover:text-green-700 transition-colors"
              >
                {method.contact}
              </a>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inquiry Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  {supportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief subject of your message"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Additional Information */}
          <div className="space-y-8">
            {/* Office Hours */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Office Hours</h3>
              </div>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">How accurate are your assessments?</h4>
                  <p className="text-gray-600 text-sm">Our AI-powered assessments have 85-95% accuracy based on local data and weather patterns.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Do you provide installation services?</h4>
                  <p className="text-gray-600 text-sm">We connect you with verified contractors in your area for professional installation.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">What's the typical cost of a system?</h4>
                  <p className="text-gray-600 text-sm">Costs vary from ₹50,000 to ₹3,00,000 depending on size and complexity. Get a personalized estimate through our assessment.</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
              <h3 className="text-xl font-semibold text-red-900 mb-2">Emergency Support</h3>
              <p className="text-red-700 text-sm mb-3">
                For urgent technical issues with existing systems, call our 24/7 emergency line:
              </p>
              <a
                href="tel:+919876543211"
                className="text-red-600 font-bold text-lg hover:text-red-700 transition-colors"
              >
                +91 9876543211
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;