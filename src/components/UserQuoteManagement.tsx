import React, { useState, useEffect } from 'react';
import { Star, Clock, CheckCircle, XCircle, Phone, Mail, MessageSquare, Award, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface ContractorQuote {
  id: string;
  projectRequestId: string;
  contractorInfo: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    businessName?: string;
    rating: number;
    completedProjects: number;
    location: string;
  };
  quotedAmount: number;
  timeline: number;
  description: string;
  materials: string[];
  warranty: number;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

interface UserQuoteManagementProps {
  projectRequestId: string;
}

const UserQuoteManagement: React.FC<UserQuoteManagementProps> = ({ projectRequestId }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [quotes, setQuotes] = useState<ContractorQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<ContractorQuote | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, [projectRequestId]);

  const fetchQuotes = () => {
    // Simulate fetching quotes from multiple contractors
    const mockQuotes: ContractorQuote[] = [
      {
        id: 'quote-1',
        projectRequestId,
        contractorInfo: {
          id: 'contractor-1',
          name: 'Rajesh Kumar',
          email: 'rajesh@waterworks.com',
          phone: '+91 9876543210',
          businessName: 'Kumar Water Solutions',
          rating: 4.8,
          completedProjects: 45,
          location: 'Hyderabad'
        },
        quotedAmount: 125000,
        timeline: 12,
        description: 'Complete rainwater harvesting system with underground tank, filtration, and pump setup. Includes 2-year warranty and quarterly maintenance.',
        materials: ['RCC Tank', 'Multi-stage Filter', 'Submersible Pump', 'PVC Pipes', 'Control Panel'],
        warranty: 24,
        status: 'pending',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'quote-2',
        projectRequestId,
        contractorInfo: {
          id: 'contractor-2',
          name: 'Priya Sharma',
          email: 'priya@ecowater.com',
          phone: '+91 9876543211',
          businessName: 'EcoWater Systems',
          rating: 4.9,
          completedProjects: 62,
          location: 'Mumbai'
        },
        quotedAmount: 135000,
        timeline: 10,
        description: 'Premium modular system with smart monitoring, automated controls, and mobile app integration. Eco-friendly materials with 3-year comprehensive warranty.',
        materials: ['Modular Tanks', 'Smart Controllers', 'IoT Sensors', 'Premium Filters', 'Mobile App'],
        warranty: 36,
        status: 'pending',
        submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'quote-3',
        projectRequestId,
        contractorInfo: {
          id: 'contractor-3',
          name: 'Arjun Patel',
          email: 'arjun@budgetwater.com',
          phone: '+91 9876543212',
          businessName: 'Budget Water Solutions',
          rating: 4.5,
          completedProjects: 28,
          location: 'Delhi'
        },
        quotedAmount: 98000,
        timeline: 15,
        description: 'Cost-effective solution with standard components. Basic filtration and manual controls. Good value for money with 1-year warranty.',
        materials: ['Concrete Tank', 'Basic Filter', 'Manual Pump', 'Standard Pipes'],
        warranty: 12,
        status: 'pending',
        submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];

    setQuotes(mockQuotes);
    setLoading(false);
  };

  const handleAcceptQuote = (quoteId: string) => {
    const updatedQuotes = quotes.map(quote => 
      quote.id === quoteId 
        ? { ...quote, status: 'accepted' as const }
        : quote.status === 'pending' 
          ? { ...quote, status: 'rejected' as const }
          : quote
    );
    
    setQuotes(updatedQuotes);
    
    const acceptedQuote = quotes.find(q => q.id === quoteId);
    if (acceptedQuote) {
      addNotification({
        title: 'Quote Accepted',
        message: `You have accepted the quote from ${acceptedQuote.contractorInfo.businessName}. They will contact you soon.`,
        type: 'success'
      });
    }
  };

  const handleRejectQuote = (quoteId: string) => {
    const updatedQuotes = quotes.map(quote => 
      quote.id === quoteId 
        ? { ...quote, status: 'rejected' as const }
        : quote
    );
    
    setQuotes(updatedQuotes);
    
    addNotification({
      title: 'Quote Rejected',
      message: 'Quote has been rejected. You can still accept other quotes.',
      type: 'info'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Contractor Quotes</h3>
        <p className="text-gray-600 text-sm">Compare quotes from verified contractors</p>
      </div>

      {quotes.length === 0 ? (
        <div className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Waiting for Quotes</h4>
          <p className="text-gray-600">Contractors are reviewing your project. Quotes typically arrive within 24-48 hours.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {quotes.map((quote) => (
            <div key={quote.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Contractor Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {quote.contractorInfo.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {quote.contractorInfo.businessName || quote.contractorInfo.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{quote.contractorInfo.rating}/5.0</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span>{quote.contractorInfo.completedProjects} projects</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{quote.contractorInfo.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quote Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-700">
                        ₹{quote.quotedAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">Total Cost</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {quote.timeline}
                      </div>
                      <div className="text-sm text-blue-600">Days to Complete</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-700">
                        {quote.warranty}
                      </div>
                      <div className="text-sm text-purple-600">Months Warranty</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Project Approach</h5>
                    <p className="text-gray-600 text-sm">{quote.description}</p>
                  </div>

                  {/* Materials */}
                  {quote.materials.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Key Materials</h5>
                      <div className="flex flex-wrap gap-2">
                        {quote.materials.map((material, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{quote.contractorInfo.email}</span>
                    </div>
                    {quote.contractorInfo.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{quote.contractorInfo.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Submitted {getTimeAgo(quote.submittedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  {quote.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptQuote(quote.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRejectQuote(quote.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Contact</span>
                      </button>
                    </>
                  )}
                  
                  {quote.status === 'accepted' && (
                    <div className="text-center">
                      <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                        ✓ ACCEPTED
                      </div>
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Contact</span>
                      </button>
                    </div>
                  )}
                  
                  {quote.status === 'rejected' && (
                    <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm font-medium text-center">
                      ✗ REJECTED
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Contact {selectedQuote.contractorInfo.businessName}
                </h3>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Contractor Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Business Name:</span>
                      <span className="text-blue-900 font-medium">{selectedQuote.contractorInfo.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Contact Person:</span>
                      <span className="text-blue-900 font-medium">{selectedQuote.contractorInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Rating:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-blue-900 font-medium">{selectedQuote.contractorInfo.rating}/5.0</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Experience:</span>
                      <span className="text-blue-900 font-medium">{selectedQuote.contractorInfo.completedProjects} projects</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href={`mailto:${selectedQuote.contractorInfo.email}?subject=Rainwater Harvesting Project Inquiry&body=Hi ${selectedQuote.contractorInfo.name}, I'm interested in your quote for my rainwater harvesting project.`}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Send Email</span>
                  </a>
                  
                  {selectedQuote.contractorInfo.phone && (
                    <a
                      href={`tel:${selectedQuote.contractorInfo.phone}`}
                      className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Now</span>
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      )}
    </div>
  );
};

export default UserQuoteManagement;