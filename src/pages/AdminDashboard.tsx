import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileCheck, TrendingUp, AlertCircle, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Project, User, isSupabaseConfigured } from '../lib/supabase';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    pendingVerifications: 0,
    completedProjects: 0,
    totalWaterSaved: 0,
    totalMoneySaved: 0
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    
    if (!isSupabaseConfigured) {
      // Mock data for demo
      const mockProjects: Project[] = [
        {
          id: '1',
          user_id: 'user-123',
          project_name: 'Residential Rainwater Harvesting',
          roof_area: 150,
          location: 'Mumbai',
          number_of_dwellers: 4,
          available_space: 25,
          roof_type: 'concrete',
          monthly_water_bill: 2500,
          status: 'under_review',
          verification_status: 'pending',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          user_id: 'user-123',
          project_name: 'Community Water Conservation',
          roof_area: 300,
          location: 'Delhi',
          number_of_dwellers: 8,
          available_space: 50,
          roof_type: 'tiles',
          monthly_water_bill: 4000,
          status: 'completed',
          verification_status: 'verified',
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z'
        }
      ];

      const mockUsers: User[] = [
        {
          id: 'user-123',
          email: 'user@example.com',
          full_name: 'John Doe',
          role: 'user',
          phone: '+91 9876543211',
          location: 'Mumbai',
          language_preference: 'english',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'contractor-123',
          email: 'contractor@example.com',
          full_name: 'Mike Wilson',
          role: 'contractor',
          phone: '+91 9876543212',
          location: 'Delhi',
          language_preference: 'english',
          created_at: '2024-01-02T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z'
        }
      ];

      setProjects(mockProjects);
      setUsers(mockUsers);
      setStats({
        totalUsers: mockUsers.length,
        totalProjects: mockProjects.length,
        pendingVerifications: mockProjects.filter(p => p.verification_status === 'pending').length,
        completedProjects: mockProjects.filter(p => p.status === 'completed').length,
        totalWaterSaved: 125000,
        totalMoneySaved: 45000
      });
      setLoading(false);
      return;
    }

    try {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsData) setProjects(projectsData);
      if (usersData) setUsers(usersData);

      // Calculate stats
      setStats({
        totalUsers: usersData?.length || 0,
        totalProjects: projectsData?.length || 0,
        pendingVerifications: projectsData?.filter(p => p.verification_status === 'pending').length || 0,
        completedProjects: projectsData?.filter(p => p.status === 'completed').length || 0,
        totalWaterSaved: 125000, // This would come from gamification data
        totalMoneySaved: 45000
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (projectId: string, status: string, verificationStatus: string) => {
    if (!isSupabaseConfigured) {
      // Mock update
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, status: status as any, verification_status: verificationStatus as any }
          : p
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status, 
          verification_status: verificationStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (!error) {
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const monthlyData = [
    { name: 'Jan', projects: 12, users: 45 },
    { name: 'Feb', projects: 19, users: 52 },
    { name: 'Mar', projects: 15, users: 48 },
    { name: 'Apr', projects: 22, users: 61 },
    { name: 'May', projects: 18, users: 55 },
    { name: 'Jun', projects: 25, users: 67 }
  ];

  const statusData = [
    { name: 'Completed', value: stats.completedProjects, color: '#10B981' },
    { name: 'Under Review', value: stats.pendingVerifications, color: '#F59E0B' },
    { name: 'Draft', value: stats.totalProjects - stats.completedProjects - stats.pendingVerifications, color: '#6B7280' }
  ];

  const StatCard = ({ icon, title, value, subtitle, color = 'green' }: any) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </div>
  );

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage users, projects, and platform analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6 text-green-600" />}
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Registered users"
            color="green"
          />
          <StatCard
            icon={<FileCheck className="h-6 w-6 text-blue-600" />}
            title="Total Projects"
            value={stats.totalProjects}
            subtitle={`${stats.completedProjects} completed`}
            color="blue"
          />
          <StatCard
            icon={<AlertCircle className="h-6 w-6 text-yellow-600" />}
            title="Pending Reviews"
            value={stats.pendingVerifications}
            subtitle="Awaiting verification"
            color="yellow"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            title="Water Saved"
            value={`${Math.round(stats.totalWaterSaved / 1000)}K L`}
            subtitle="Community impact"
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Growth Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="projects" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Project Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects Management */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => {
                  const projectUser = users.find(u => u.id === project.user_id);
                  return (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {project.project_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {project.location} • {project.roof_area}m²
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {projectUser?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {projectUser?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                          project.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                          project.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.verification_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {project.verification_status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateProjectStatus(project.id, 'approved', 'verified')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateProjectStatus(project.id, 'rejected', 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const userProjects = projects.filter(p => p.user_id === user.id);
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'contractor' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.location || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userProjects.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Project Details
                </h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedProject.project_name}</h4>
                  <p className="text-sm text-gray-600">{selectedProject.location}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;