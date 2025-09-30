import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Eye, 
  MessageSquare,
  Calendar,
  Users,
  Home,
  TrendingUp,
  Award,
  FileText,
  Send,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface ProjectRequest {
  id: string;
  projectName: string;
  userInfo: {
    name: string;
    email: string;
    phone?: string;
    location: string;
  };
  projectDetails: {
    roofArea: number;
    dwellers: number;
    availableSpace: number;
    roofType: string;
    estimatedCost: number;
    harvestPotential: number;
    location: string;
    coordinates?: { lat: number; lng: number };
  };
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'completed';
  requestedAt: string;
  budget: number;
  urgency: 'low' | 'medium' | 'high';
  description?: string;
  photos?: string[];
}

interface ContractorQuote {
  id: string;
  projectRequestId: string;
  contractorId: string;
  quotedAmount: number;
  timeline: number; // days
  description: string;
  materials: string[];
  warranty: number; // months
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

const ContractorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
  const [myQuotes, setMyQuotes] = useState<ContractorQuote[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeQuotes: 0,
    completedProjects: 0,
    totalEarnings: 0,
    rating: 4.8,
    responseRate: 95
  });

  const [quoteForm, setQuoteForm] = useState({
    quotedAmount: 0,
    timeline: 0,
    description: '',
    materials: [] as string[],
    warranty: 12
  });

  useEffect(() => {
    if (user?.role === 'contractor') {
      fetchContractorData();
    }
  }, [user]);

  const fetchContractorData = () => {
    // Load project requests from localStorage
    const allRequests = JSON.parse(localStorage.getItem('contractor_requests') || '[]');
    const myQuotes = JSON.parse(localStorage.getItem(`contractor_quotes_${user?.id}`) || '[]');
    
    // Filter requests for contractor's service area
    const relevantRequests = allRequests.filter((req: ProjectRequest) => 
      req.projectDetails.location.toLowerCase().includes(user?.location?.toLowerCase() || '') ||
      req.userInfo.location.toLowerCase().includes(user?.location?.toLowerCase() || '')
    );
    
    setProjectRequests(relevantRequests);
    setMyQuotes(myQuotes);
    
    // Calculate stats
    setStats({
      totalRequests: relevantRequests.length,
      activeQuotes: myQuotes.filter((q: ContractorQuote) => q.status === 'pending').length,
      completedProjects: myQuotes.filter((q: ContractorQuote) => q.status === 'accepted').length,
      totalEarnings: myQuotes
        .filter((q: ContractorQuote) => q.status === 'accepted')
        .reduce((sum: number, q: ContractorQuote) => sum + q.quotedAmount, 0),
      rating: 4.8,
      responseRate: 95
    });
    
    setLoading(false);
  };

  const handleSubmitQuote = () => {
    if (!selectedRequest || !user) return;
    
    const newQuote: ContractorQuote = {
      id: `quote-${Date.now()}`,
      projectRequestId: selectedRequest.id,
      contractorId: user.id,
      quotedAmount: quoteForm.quotedAmount,
      timeline: quoteForm.timeline,
      description: quoteForm.description,
      materials: quoteForm.materials,
      warranty: quoteForm.warranty,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    
    // Save quote
    const existingQuotes = JSON.parse(localStorage.getItem(`contractor_quotes_${user.id}`) || '[]');
    existingQuotes.push(newQuote);
    localStorage.setItem(`contractor_quotes_${user.id}`, JSON.stringify(existingQuotes));
    
    // Update project request status
    const updatedRequests = projectRequests.map(req => 
      req.id === selectedRequest.id 
        ? { ...req, status: 'quoted' as const }
        : req
    );
    setProjectRequests(updatedRequests);
    
    // Update global requests
    const allRequests = JSON.parse(localStorage.getItem('contractor_requests') || '[]');
    const globalUpdated = allRequests.map((req: ProjectRequest) => 
      req.id === selectedRequest.id 
        ? { ...req, status: 'quoted' as const }
        : req
    );
    localStorage.setItem('contractor_requests', JSON.stringify(globalUpdated));
    
    addNotification({
      title: 'Quote Submitted',
      message: `Your quote for ${selectedRequest.projectName} has been submitted successfully.`,
      type: 'success'
    });
    
    setShowQuoteModal(false);
    setSelectedRequest(null);
    setQuoteForm({
      quotedAmount: 0,
      timeline: 0,
      description: '',
      materials: [],
      warranty: 12
    });
    
    fetchContractorData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const monthlyData = [
    { name: 'Jan', projects: 5, earnings: 125000 },
    { name: 'Feb', projects: 8, earnings: 200000 },
    { name: 'Mar', projects: 6, earnings: 150000 },
    { name: 'Apr', projects: 10, earnings: 250000 },
    { name: 'May', projects: 7, earnings: 175000 },
    { name: 'Jun', projects: 9, earnings: 225000 }
  ];

  const projectTypeData = [
    { name: 'Residential', value: 65, color: '#10B981' },
    { name: 'Commercial', value: 25, color: '#3B82F6' },
    { name: 'Community', value: 10, color: '#8B5CF6' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contractor Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.full_name}! Manage your project requests and grow your business.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                <p className="text-sm text-gray-500">Available projects</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeQuotes}</p>
                <p className="text-sm text-gray-500">Awaiting response</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
                <p className="text-sm text-gray-500">This year</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{Math.round(stats.totalEarnings / 1000)}K</p>
                <p className="text-sm text-gray-500">This year</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Performance Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'earnings' ? `₹${value.toLocaleString()}` : value,
                  name === 'earnings' ? 'Earnings' : 'Projects'
                ]} />
                <Bar dataKey="projects" fill="#3B82F6" />
                <Bar dataKey="earnings" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Project Type Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Requests */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Available Project Requests</h3>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-600">Your Rating: {stats.rating}/5.0</span>
              </div>
            </div>
          </div>

          {projectRequests.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Project Requests</h4>
              <p className="text-gray-600">New project requests will appear here when users submit them.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {projectRequests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {request.projectName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{request.projectDetails.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Home className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{request.projectDetails.roofArea}m² roof</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{request.projectDetails.dwellers} people</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">₹{request.budget.toLocaleString()} budget</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Requested {new Date(request.requestedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{Math.round(request.projectDetails.harvestPotential / 1000)}K L/year potential</span>
                        </div>
                      </div>

                      {/* Client Information */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Client Information</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-800">{request.userInfo.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-800">{request.userInfo.email}</span>
                          </div>
                          {request.userInfo.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-800">{request.userInfo.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      
                      {request.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setQuoteForm({
                              quotedAmount: request.projectDetails.estimatedCost,
                              timeline: 14,
                              description: '',
                              materials: [],
                              warranty: 12
                            });
                            setShowQuoteModal(true);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Send className="h-4 w-4" />
                          <span>Submit Quote</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Quotes */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">My Submitted Quotes</h3>
          </div>
          
          {myQuotes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Quotes Submitted</h4>
              <p className="text-gray-600">Your submitted quotes will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {myQuotes.map((quote) => {
                const request = projectRequests.find(r => r.id === quote.projectRequestId);
                return (
                  <div key={quote.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          Quote for {request?.projectName || 'Unknown Project'}
                        </h4>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>Quoted Amount: ₹{quote.quotedAmount.toLocaleString()}</div>
                          <div>Timeline: {quote.timeline} days</div>
                          <div>Warranty: {quote.warranty} months</div>
                          <div>Submitted: {new Date(quote.submittedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                        {quote.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedRequest && !showQuoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  {selectedRequest.projectName}
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Project Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{selectedRequest.projectDetails.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Roof Area:</span>
                      <span className="font-medium">{selectedRequest.projectDetails.roofArea} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available Space:</span>
                      <span className="font-medium">{selectedRequest.projectDetails.availableSpace} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Roof Type:</span>
                      <span className="font-medium">{selectedRequest.projectDetails.roofType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of People:</span>
                      <span className="font-medium">{selectedRequest.projectDetails.dwellers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Harvest Potential:</span>
                      <span className="font-medium">{selectedRequest.projectDetails.harvestPotential.toLocaleString()} L/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Cost:</span>
                      <span className="font-medium text-green-600">₹{selectedRequest.projectDetails.estimatedCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Client Budget:</span>
                      <span className="font-medium text-blue-600">₹{selectedRequest.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Client Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{selectedRequest.userInfo.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedRequest.userInfo.email}</span>
                    </div>
                    {selectedRequest.userInfo.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{selectedRequest.userInfo.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedRequest.userInfo.location}</span>
                    </div>
                  </div>

                  {selectedRequest.description && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-2">Additional Notes</h5>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        {selectedRequest.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
                {selectedRequest.status === 'pending' && (
                  <button
                    onClick={() => {
                      setQuoteForm({
                        quotedAmount: selectedRequest.projectDetails.estimatedCost,
                        timeline: 14,
                        description: '',
                        materials: [],
                        warranty: 12
                      });
                      setShowQuoteModal(true);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Submit Quote
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quote Submission Modal */}
        {showQuoteModal && selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-gray-900">
                    Submit Quote for {selectedRequest.projectName}
                  </h3>
                  <button
                    onClick={() => setShowQuoteModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Quote Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quote Amount (₹) *
                    </label>
                    <input
                      type="number"
                      value={quoteForm.quotedAmount || ''}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, quotedAmount: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your quote amount"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      AI Estimated: ₹{selectedRequest.projectDetails.estimatedCost.toLocaleString()} | 
                      Client Budget: ₹{selectedRequest.budget.toLocaleString()}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Timeline (Days) *
                    </label>
                    <input
                      type="number"
                      value={quoteForm.timeline || ''}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, timeline: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Number of days to complete"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Description & Approach *
                    </label>
                    <textarea
                      value={quoteForm.description}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={4}
                      placeholder="Describe your approach, methodology, and what's included in the quote..."
                      required
                    />
                  </div>

                  {/* Materials */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Materials & Components
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., RCC Tank, Filtration System, Pump (comma separated)"
                      onChange={(e) => setQuoteForm(prev => ({ 
                        ...prev, 
                        materials: e.target.value.split(',').map(m => m.trim()).filter(m => m) 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Warranty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Period (Months)
                    </label>
                    <select
                      value={quoteForm.warranty}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, warranty: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months</option>
                      <option value={24}>24 Months</option>
                      <option value={36}>36 Months</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setShowQuoteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuote}
                    disabled={!quoteForm.quotedAmount || !quoteForm.timeline || !quoteForm.description}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Quote
                  </button>
                </div>
              </div>
            </div>
          )}
        )}
      </div>
    </div>
  );
};

export default ContractorDashboard;