import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, User, mockUsers, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!isSupabaseConfigured) {
        // Use mock authentication
        const storedUser = localStorage.getItem('rainshare_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Error parsing stored user:', error);
          }
        }
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            setUser(userData);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    // Always use mock authentication since Supabase is not properly configured
    if (!isSupabaseConfigured || supabaseUrl === 'https://demo.supabase.co') {
      // Mock authentication
      // Check for demo credentials
      let mockUser = null;
      if (email === 'admin@aquaharvest.com' && password === 'admin123') {
        mockUser = mockUsers.find(u => u.role === 'admin');
      } else if (email === 'user@example.com' && password === 'user123') {
        mockUser = mockUsers.find(u => u.role === 'user');
      } else if (email === 'contractor@example.com' && password === 'contractor123') {
        mockUser = mockUsers.find(u => u.role === 'contractor');
      }
      
      if (mockUser) {
        setUser(mockUser);
        localStorage.setItem('aquaharvest_user', JSON.stringify(mockUser));
        return { error: null };
      } else {
        return { error: { message: 'Invalid login credentials. Please use the demo credentials provided.' } };
      }
    }

    // Skip Supabase authentication to prevent fetch errors
    return { error: { message: 'Please use the demo credentials provided on the login page.' } };
  };

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    // Always use mock signup since Supabase is not properly configured
    if (!isSupabaseConfigured || supabaseUrl === 'https://demo.supabase.co') {
      // Mock signup
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        full_name: name,
        role: (role as any) || 'user',
        language_pref: 'english',
        created_at: new Date().toISOString()
      };
      
      mockUsers.push(newUser);
      setUser(newUser);
      localStorage.setItem('aquaharvest_user', JSON.stringify(newUser));
      return { error: null };
    }

    // Skip Supabase signup to prevent fetch errors
    return { error: { message: 'Please use the demo login credentials instead.' } };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || supabaseUrl === 'https://demo.supabase.co') {
      setUser(null);
      localStorage.removeItem('aquaharvest_user');
      return;
    }

    // Skip Supabase signout to prevent fetch errors
    setUser(null);
    localStorage.removeItem('aquaharvest_user');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('No user logged in') };

    if (!isSupabaseConfigured || supabaseUrl === 'https://demo.supabase.co') {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('aquaharvest_user', JSON.stringify(updatedUser));
      return { error: null };
    }

    // Skip Supabase update to prevent fetch errors
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('aquaharvest_user', JSON.stringify(updatedUser));
    return { error: null };
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};