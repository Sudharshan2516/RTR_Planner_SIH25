import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'guest' | 'user' | 'contractor' | 'admin';
  phone?: string;
  location?: string;
  language_preference?: 'english' | 'hindi' | 'telugu';
  created_at: string;
  updated_at?: string;
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
  roof_type: 'rcc' | 'metal' | 'tile' | 'other';
  current_water_source?: string;
  monthly_water_bill?: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  verification_status: 'pending' | 'verified' | 'rejected';
  assigned_contractor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  project_id: string;
  input_json: any;
  output_json: any;
  model_version: string;
  used_fallback: boolean;
  confidence_score: number;
  created_at: string;
}

export interface Photo {
  id: string;
  project_id: string;
  storage_url: string;
  meta_json: any;
  uploaded_at: string;
}

export interface Contractor {
  id: string;
  user_id: string;
  business_name: string;
  regions: string[];
  rating: number;
  verified: boolean;
}

export interface Gamification {
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

// Mock data for demo
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    full_name: 'Admin User',
    email: 'admin@aquaharvest.com',
    role: 'admin',
    language_preference: 'english',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-1',
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    role: 'user',
    language_preference: 'english',
    created_at: new Date().toISOString()
  },
  {
    id: 'contractor-1',
    full_name: 'Mike Wilson',
    email: 'mike@contractor.com',
    phone: '+91 9876543211',
    role: 'contractor',
    language_preference: 'english',
    created_at: new Date().toISOString()
  }
];

export const isSupabaseConfigured = supabaseUrl !== 'https://demo.supabase.co';