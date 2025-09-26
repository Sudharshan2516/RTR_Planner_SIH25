import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'guest' | 'user' | 'contractor' | 'admin';
  phone?: string;
  location?: string;
  language_preference: 'english' | 'hindi' | 'telugu';
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
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
}

export interface MLPrediction {
  id: string;
  project_id: string;
  annual_rainfall: number;
  predicted_harvest_liters: number;
  runoff_coefficient: number;
  water_quality_score: number;
  confidence_score: number;
  created_at: string;
}

export interface StructureRecommendation {
  id: string;
  project_id: string;
  structure_type: string;
  tank_capacity: number;
  estimated_cost: number;
  installation_time_days: number;
  maintenance_frequency: string;
  efficiency_rating: number;
  dimensions: Record<string, any>;
  materials: Record<string, any>;
  created_at: string;
}

export interface GamificationData {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  badges: string[];
  achievements: string[];
  water_saved_liters: number;
  money_saved: number;
  environmental_impact_score: number;
  created_at: string;
  updated_at: string;
}