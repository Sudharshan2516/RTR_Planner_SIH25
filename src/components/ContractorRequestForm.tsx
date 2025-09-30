import React, { useState } from 'react';
import { Send, Users, MapPin, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface ContractorRequestFormProps {
  projectData: {
    projectName: string;
    location: string;
    roofArea: number;
    dwellers: number;
    availableSpace: number;
    roofType: string;
    estimatedCost: number;
    harvestPotential: number;
    coordinates?: { lat: number; lng: number };
  };
  onRequestSent?: () => void;
  onCancel?: () => void;
}

const ContractorRequestForm: React.FC<ContractorRequestFormProps> = ({
  projectData,
  onRequestSent,
  onCancel
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectName: projectData.projectName || 'Rainwater Harvesting Project',
    budget: projectData.estimatedCost,
    urgency: 'medium' as 'low' | 'medium' | 'high',
    description: '',
    phone: user?.phone || '',
    preferredContactTime: 'anytime'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      addNotification({
        title: 'Authentication Required',
        message: 'Please log in to request contractor quotes.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);

    try {
      const projectRequest = {
        id: `req-${Date.now()}`,
        projectName: formData.projectName,
        userInfo: {
          name: user.full_name,
          email: user.email,
          phone: formData.phone,
          location: user.location || projectData.location
        },
        projectDetails: {
          ...projectData,
          estimatedCost: projectData.estimatedCost
        },
        status: 'pending' as const,
        requestedAt: new Date().toISOString(),
        budget: formData.budget,
        urgency: formData.urgency,
        description: formData.description
      };

      // Save to localStorage (in real app, this would go to Supabase)
      const existingRequests = JSON.parse(localStorage.getItem('contractor_requests') || '[]');
      existingRequests.push(projectRequest);
      localStorage.setItem('contractor_requests', JSON.stringify(existingRequests));

      // Also save to user's project requests
      const userRequests = JSON.parse(localStorage.getItem(`user_contractor_requests_${user.id}`) || '[]');
      userRequests.push(projectRequest);
      localStorage.setItem(`user_contractor_requests_${user.id}`, JSON.stringify(userRequests));

      addNotification({
        title: 'Request Sent Successfully',
        message: 'Your project has been sent to contractors in your area. You will receive quotes within 24-48 hours.',
        type: 'success',
        actionUrl: '/projects',
        actionText: 'View Projects'
      });

      onRequestSent?.();
    } catch (error) {
      console.error('Error submitting contractor request:', error);
      addNotification({
        title: 'Request Failed',
        message: 'Failed to send request to contractors. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority', description: 'Flexible timeline, cost-focused', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Priority', description: 'Standard timeline, balanced approach', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', description: 'Urgent implementation needed', color: 'text-red-600' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-full">
          <Users className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Request Contractor Quotes</h3>
          <p className="text-gray-600 text-sm">Connect with verified contractors in your area</p>
        </div>
      </div>

      {/* Project Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-3">Project Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">Location:</span>
            <p className="text-blue-800">{projectData.location}</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Roof Area:</span>
            <p className="text-blue-800">{projectData.roofArea} m²</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Harvest Potential:</span>
            <p className="text-blue-800">{Math.round(projectData.harvestPotential / 1000)}K L/year</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">AI Estimate:</span>
            <p className="text-blue-800">₹{projectData.estimatedCost.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter a name for your project"
            required
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Your Budget Range (₹) *
          </label>
          <input
            type="number"
            name="budget"
            value={formData.budget || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your budget"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            AI Estimated Cost: ₹{projectData.estimatedCost.toLocaleString()}
          </p>
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your phone number"
            required
          />
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Project Urgency
          </label>
          <div className="space-y-2">
            {urgencyOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="urgency"
                  value={option.value}
                  checked={formData.urgency === option.value}
                  onChange={handleInputChange}
                  className="text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className={`font-medium ${option.color}`}>{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Preferred Contact Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Contact Time
          </label>
          <select
            name="preferredContactTime"
            value={formData.preferredContactTime}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="anytime">Anytime</option>
            <option value="morning">Morning (9 AM - 12 PM)</option>
            <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
            <option value="evening">Evening (5 PM - 8 PM)</option>
          </select>
        </div>

        {/* Additional Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Requirements or Notes
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="Any specific requirements, preferences, or questions for contractors..."
          />
        </div>

        {/* Information Notice */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900 mb-1">What happens next?</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your request will be sent to verified contractors in your area</li>
                <li>• Contractors will review your project and submit competitive quotes</li>
                <li>• You'll receive quotes within 24-48 hours via email and platform notifications</li>
                <li>• Compare quotes and choose the best contractor for your project</li>
                <li>• All contractors are verified and rated by our community</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmitRequest}
          disabled={loading || !formData.projectName || !formData.budget || !formData.phone}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send to Contractors</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContractorRequestForm;