import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, Square, Eye, CreditCard as Edit, Trash2, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import UserQuoteManagement from '../components/UserQuoteManagement';

interface Project {
  id: string;
  user_id: string;
  project_name: string;
  roof_area: number;
  location: string;
  latitude?: number;
  longitude?: number;
  number_of_dwellers: number;
  available_space: number;
  roof_type: string;
  current_water_source?: string;
  monthly_water_bill?: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  verification_status: 'pending' | 'verified' | 'rejected';
  assigned_contractor_id?: string;
  created_at: string;
  updated_at: string;
  estimated_harvest?: number;
  estimated_cost?: number;
}

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showQuotes, setShowQuotes] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Get projects from localStorage
      const storedProjects = JSON.parse(localStorage.getItem(`projects_${user.id}`) || '[]');
      
      // Add some mock projects if none exist
      if (storedProjects.length === 0) {
        const mockProjects: Project[] = [
          {
            id: `proj-${Date.now()}-1`,
            user_id: user.id,
            project_name: 'Residential Rainwater Harvesting',
            roof_area: 150,
            location: 'Mumbai, Maharashtra',
            latitude: 19.0760,
            longitude: 72.8777,
            number_of_dwellers: 4,
            available_space: 25,
            roof_type: 'concrete',
            current_water_source: 'Municipal Supply',
            monthly_water_bill: 2500,
            status: 'completed',
            verification_status: 'verified',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            estimated_harvest: 198000,
            estimated_cost: 125000
          },
          {
            id: `proj-${Date.now()}-2`,
            user_id: user.id,
            project_name: 'Community Water Conservation',
            roof_area: 300,
            location: 'Delhi, India',
            latitude: 28.7041,
            longitude: 77.1025,
            number_of_dwellers: 8,
            available_space: 50,
            roof_type: 'tiles',
            current_water_source: 'Borewell',
            monthly_water_bill: 4000,
            status: 'under_review',
            verification_status: 'pending',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            estimated_harvest: 153000,
            estimated_cost: 185000
          }
        ];
        
        localStorage.setItem(`projects_${user.id}`, JSON.stringify(mockProjects));
        setProjects(mockProjects);
      } else {
        setProjects(storedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to load projects.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;
    
    try {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      localStorage.setItem(`projects_${user.id}`, JSON.stringify(updatedProjects));
      
      addNotification({
        title: 'Project Deleted',
        message: 'Project has been successfully deleted.',
        type: 'success'
      });
      
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to delete project.',
        type: 'error'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'under_review': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="mt-2 text-gray-600">
              Manage your rainwater harvesting projects and track their progress
            </p>
          </div>
          <Link
            to="/feasibility"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Project</span>
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-6">
              Start your rainwater harvesting journey by creating your first project.
            </p>
            <Link
              to="/feasibility"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Project Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {project.project_name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(project.status)}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Project Details */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <Square className="h-4 w-4 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.roof_area}m²</div>
                        <div className="text-xs text-gray-500">Roof Area</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.number_of_dwellers}</div>
                        <div className="text-xs text-gray-500">People</div>
                      </div>
                    </div>
                  </div>

                  {project.estimated_harvest && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">
                        Annual Harvest: {project.estimated_harvest.toLocaleString()}L
                      </div>
                      {project.estimated_cost && (
                        <div className="text-sm text-blue-700">
                          Estimated Cost: ₹{project.estimated_cost.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => setShowQuotes(project.id)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Users className="h-4 w-4" />
                      <span>Quotes</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(project.id)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedProject.project_name}
                  </h3>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Location:</span>
                      <p className="text-sm text-gray-900">{selectedProject.location}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <p className={`text-sm px-2 py-1 rounded-full inline-block ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Roof Area:</span>
                      <p className="text-sm text-gray-900">{selectedProject.roof_area} m²</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Dwellers:</span>
                      <p className="text-sm text-gray-900">{selectedProject.number_of_dwellers}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Available Space:</span>
                      <p className="text-sm text-gray-900">{selectedProject.available_space} m²</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Roof Type:</span>
                      <p className="text-sm text-gray-900">{selectedProject.roof_type}</p>
                    </div>
                  </div>
                  
                  {selectedProject.estimated_harvest && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Project Estimates</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-green-700">Annual Harvest:</span>
                          <p className="text-sm text-green-900">{selectedProject.estimated_harvest.toLocaleString()} L</p>
                        </div>
                        {selectedProject.estimated_cost && (
                          <div>
                            <span className="text-sm font-medium text-green-700">Estimated Cost:</span>
                            <p className="text-sm text-green-900">₹{selectedProject.estimated_cost.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Close
                    </button>
                    <Link
                      to="/reports"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      onClick={() => setSelectedProject(null)}
                    >
                      Generate Report
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Quotes Management Modal */}
        {showQuotes && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  Contractor Quotes
                </h3>
                <button
                  onClick={() => setShowQuotes(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <UserQuoteManagement projectRequestId={showQuotes} />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Project</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this project? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteProject(showDeleteModal)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;