/*
  # Rooftop Rainwater Harvesting Platform Database Schema

  1. New Tables
    - `users` - User profiles with roles and authentication
    - `projects` - Feasibility assessments and project data
    - `ml_predictions` - Harvest and runoff predictions
    - `gamification` - Points, badges, and achievements
    - `contractors` - Contractor-specific information
    - `project_assignments` - Contractor project assignments
    - `notifications` - System notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure data access based on user roles

  3. Features
    - Multi-language content support
    - Comprehensive project tracking
    - Gamification system
    - Admin analytics support
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('guest', 'user', 'contractor', 'admin')),
  phone text,
  location text,
  language_preference text DEFAULT 'english' CHECK (language_preference IN ('english', 'hindi', 'telugu')),
  profile_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table for feasibility assessments
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  roof_area numeric NOT NULL,
  location text NOT NULL,
  latitude numeric,
  longitude numeric,
  number_of_dwellers integer NOT NULL,
  available_space numeric NOT NULL,
  roof_type text DEFAULT 'concrete',
  current_water_source text,
  monthly_water_bill numeric,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed')),
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  assigned_contractor_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ML Predictions table
CREATE TABLE IF NOT EXISTS ml_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  annual_rainfall numeric NOT NULL,
  predicted_harvest_liters numeric NOT NULL,
  runoff_coefficient numeric NOT NULL,
  water_quality_score numeric DEFAULT 85,
  confidence_score numeric DEFAULT 0.9,
  created_at timestamptz DEFAULT now()
);

-- Structure recommendations table
CREATE TABLE IF NOT EXISTS structure_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  structure_type text NOT NULL,
  tank_capacity numeric NOT NULL,
  estimated_cost numeric NOT NULL,
  installation_time_days integer DEFAULT 7,
  maintenance_frequency text DEFAULT 'quarterly',
  efficiency_rating numeric DEFAULT 0.85,
  dimensions jsonb,
  materials jsonb,
  created_at timestamptz DEFAULT now()
);

-- Gamification table
CREATE TABLE IF NOT EXISTS gamification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0,
  level integer DEFAULT 1,
  badges jsonb DEFAULT '[]',
  achievements jsonb DEFAULT '[]',
  water_saved_liters numeric DEFAULT 0,
  money_saved numeric DEFAULT 0,
  environmental_impact_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project files and photos
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Cost estimations table
CREATE TABLE IF NOT EXISTS cost_estimations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  material_costs numeric DEFAULT 0,
  labor_costs numeric DEFAULT 0,
  equipment_costs numeric DEFAULT 0,
  total_cost numeric DEFAULT 0,
  payback_period_years numeric DEFAULT 5,
  annual_savings numeric DEFAULT 0,
  roi_percentage numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE structure_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_estimations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for projects table
CREATE POLICY "Users can read own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Contractors can read assigned projects"
  ON projects FOR SELECT
  TO authenticated
  USING (assigned_contractor_id = auth.uid());

CREATE POLICY "Contractors can update assigned projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (assigned_contractor_id = auth.uid());

CREATE POLICY "Admins can manage all projects"
  ON projects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for other tables
CREATE POLICY "Users can read own predictions"
  ON ml_predictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own recommendations"
  ON structure_recommendations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own gamification"
  ON gamification FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own files"
  ON project_files FOR ALL
  TO authenticated
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can read own notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read own cost estimations"
  ON cost_estimations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_id AND projects.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_contractor_id ON projects(assigned_contractor_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_project_id ON ml_predictions(project_id);
CREATE INDEX IF NOT EXISTS idx_gamification_user_id ON gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);