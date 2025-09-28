import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'guest' | 'registered' | 'contractor' | 'admin';
  language_pref: 'english' | 'hindi' | 'telugu';
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  roof_area_m2: number;
  roof_type: 'rcc' | 'metal' | 'tile' | 'other';
  open_space_m2: number;
  dwellers: number;
  status: 'draft' | 'submitted' | 'predicted' | 'verified' | 'rejected';
  verified: boolean;
  created_at: string;
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
  points: number;
  badges: string[];
  last_updated: string;
}

// Mock data for demo
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@rainshare.com',
    role: 'admin',
    language_pref: 'english',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    role: 'registered',
    language_pref: 'english',
    created_at: new Date().toISOString()
  },
  {
    id: 'contractor-1',
    name: 'Mike Wilson',
    email: 'mike@contractor.com',
    phone: '+91 9876543211',
    role: 'contractor',
    language_pref: 'english',
    created_at: new Date().toISOString()
  }
];

export const isSupabaseConfigured = supabaseUrl !== 'https://demo.supabase.co';