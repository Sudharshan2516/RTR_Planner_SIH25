import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import FeasibilityCheck from './pages/FeasibilityCheck';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import Projects from './pages/Projects';
import Profile from './pages/Profile';

// New Component
import HydrogeologyInfo from './components/HydrogeologyInfo';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/feasibility" element={<FeasibilityCheck />} />

                  {/* New Hydrogeology Route (open to everyone) */}
                  <Route path="/hydro" element={<HydrogeologyInfo />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  
                  {/* Placeholder routes for other pages */}
                  <Route path="/projects" element={
                    <ProtectedRoute>
                      <Projects />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/leaderboard" element={
                    <ProtectedRoute>
                      <RoleGuard allowedRoles={['user']}>
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Leaderboard</h2>
                            <p className="text-gray-600">Community leaderboard coming soon!</p>
                          </div>
                        </div>
                      </RoleGuard>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <RoleGuard allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RoleGuard>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/contractor" element={
                    <ProtectedRoute>
                      <RoleGuard allowedRoles={['contractor']}>
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contractor Dashboard</h2>
                            <p className="text-gray-600">Contractor interface coming soon!</p>
                          </div>
                        </div>
                      </RoleGuard>
                    </ProtectedRoute>
                  } />

                  <Route path="/unauthorized" element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
                        <p className="text-gray-600">You don't have permission to access this page.</p>
                      </div>
                    </div>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
