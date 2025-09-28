import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Award, Droplets, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    language_preference: user?.language_preference || 'english'
  });
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalPoints: 0,
    waterSaved: 0,
    moneySaved: 0,
    level: 1,
    badges: [] as string[]
  });

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = () => {
    if (!user) return;

    // Load projects
    const projects = JSON.parse(localStorage.getItem(`projects_${user.id}`) || '[]');
    const completedProjects = projects.filter((p: any) => p.status === 'completed');
    
    // Load gamification data
    const gamificationData = JSON.parse(localStorage.getItem(`gamification_${user.id}`) || '{}');
    
    setStats({
      totalProjects: projects.length,
      completedProjects: completedProjects.length,
      totalPoints: gamificationData.total_points || projects.length * 100,
      waterSaved: gamificationData.water_saved_liters || completedProjects.length * 50000,
      moneySaved: gamificationData.money_saved || completedProjects.length * 15000,
      level: gamificationData.level || Math.floor(projects.length / 2) + 1,
      badges: gamificationData.badges || (completedProjects.length > 0 ? ['First Project', 'Water Saver'] : [])
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        addNotification({
          title: 'Error',
          message: 'Failed to update profile.',
          type: 'error'
        });
      } else {
        // Update language if changed
        if (formData.language_preference !== language) {
          setLanguage(formData.language_preference as any);
        }
        
        setIsEditing(false);
        addNotification({
          title: 'Profile Updated',
          message: 'Your profile has been successfully updated.',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      addNotification({
        title: 'Error',
        message: 'An unexpected error occurred.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      language_preference: user?.language_preference || 'english'
    });
    setIsEditing(false);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'contractor': return 'Contractor';
      case 'user': return 'Homeowner';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'contractor': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">{user.full_name}</h1>
                  <p className="text-green-100">{user.email}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleBadgeColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-2"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user.full_name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{user.email}</span>
                    <span className="text-xs text-gray-500">(Cannot be changed)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your location"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user.location || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language Preference
                  </label>
                  {isEditing ? (
                    <select
                      name="language_preference"
                      value={formData.language_preference}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="english">English</option>
                      <option value="hindi">हिंदी (Hindi)</option>
                      <option value="telugu">తెలుగు (Telugu)</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">
                        {user.language_preference === 'hindi' ? 'हिंदी (Hindi)' :
                         user.language_preference === 'telugu' ? 'తెలుగు (Telugu)' :
                         'English'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats and Achievements */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Impact</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{stats.totalProjects}</span>
                    </div>
                    <span className="text-sm text-gray-600">Total Projects</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Water Saved</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(stats.waterSaved / 1000)}K L
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Money Saved</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{stats.moneySaved.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-gray-600">Level</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Level {stats.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Badges */}
            {stats.badges.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                <div className="grid grid-cols-2 gap-3">
                  {stats.badges.map((badge, index) => (
                    <div key={index} className="text-center p-3 bg-yellow-50 rounded-lg">
                      <Award className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                      <span className="text-xs font-medium text-gray-900">
                        {badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Role-specific Information */}
            {user.role === 'contractor' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contractor Info</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Service Areas:</span>
                    <p className="text-sm text-gray-900">{user.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Projects Completed:</span>
                    <p className="text-sm text-gray-900">{stats.completedProjects}</p>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'admin' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Access</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    You have administrative privileges to manage users, projects, and platform settings.
                  </p>
                  <a
                    href="/admin"
                    className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                  >
                    Go to Admin Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;