import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Droplets, TrendingUp, Award, Users, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Project, GamificationData } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalWaterSaved: 0,
    totalMoneySaved: 0
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch user projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsData) {
        setProjects(projectsData);
        setStats(prev => ({
          ...prev,
          totalProjects: projectsData.length,
          completedProjects: projectsData.filter(p => p.status === 'completed').length
        }));
      }

      // Fetch gamification data
      const { data: gamData } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (gamData) {
        setGamificationData(gamData);
        setStats(prev => ({
          ...prev,
          totalWaterSaved: gamData.water_saved_liters,
          totalMoneySaved: gamData.money_saved
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthlyData = [
    { name: 'Jan', waterSaved: 4000, moneySaved: 2400 },
    { name: 'Feb', waterSaved: 3000, moneySaved: 1398 },
    { name: 'Mar', waterSaved: 2000, moneySaved: 9800 },
    { name: 'Apr', waterSaved: 2780, moneySaved: 3908 },
    { name: 'May', waterSaved: 1890, moneySaved: 4800 },
    { name: 'Jun', waterSaved: 2390, moneySaved: 3800 }
  ];

  const projectStatusData = [
    { name: 'Completed', value: stats.completedProjects, color: '#10B981' },
    { name: 'In Progress', value: projects.filter(p => p.status === 'under_review').length, color: '#F59E0B' },
    { name: 'Draft', value: projects.filter(p => p.status === 'draft').length, color: '#6B7280' }
  ];

  const StatCard = ({ icon, title, value, subtitle, color = 'blue' }: any) => (
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your rainwater harvesting journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            title="Total Projects"
            value={stats.totalProjects}
            subtitle={`${stats.completedProjects} completed`}
            color="blue"
          />
          <StatCard
            icon={<Droplets className="h-6 w-6 text-blue-600" />}
            title="Water Saved"
            value={`${Math.round(stats.totalWaterSaved / 1000)}K L`}
            subtitle="This year"
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            title="Money Saved"
            value={`₹${stats.totalMoneySaved.toLocaleString()}`}
            subtitle="Annual savings"
            color="green"
          />
          <StatCard
            icon={<Award className="h-6 w-6 text-yellow-600" />}
            title="Points Earned"
            value={gamificationData?.total_points || 0}
            subtitle={`Level ${gamificationData?.level || 1}`}
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Savings Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Water Savings</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="waterSaved" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Project Status Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              <a href="/projects" className="text-blue-600 hover:text-blue-800 font-medium">
                View all →
              </a>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {project.project_name}
                    </h4>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location}
                      </div>
                      <div>{project.roof_area} sq.m roof</div>
                      <div>{project.number_of_dwellers} people</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                    
                    <span className="text-sm text-gray-500">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {projects.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Droplets className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h4>
                <p className="mb-4">Start your rainwater harvesting journey today!</p>
                <a
                  href="/feasibility"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Project
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Badges Section */}
        {gamificationData && gamificationData.badges.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gamificationData.badges.map((badge, index) => (
                <div key={index} className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {badge.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;