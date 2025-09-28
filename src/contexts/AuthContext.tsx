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
    // Always use mock authentication - no Supabase calls
    let mockUser = null;
    
    // Check for demo credentials
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
      return { error: { message: 'Invalid email or password. Please use the demo credentials provided.' } };
    }
  };

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    // Mock signup - no Supabase calls
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      full_name: name,
      role: 'user',
      language_preference: 'english',
      created_at: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('aquaharvest_user', JSON.stringify(newUser));
    return { error: null };
  };

  const signOut = async () => {
    // Mock signout - no Supabase calls
    setUser(null);
    localStorage.removeItem('aquaharvest_user');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('No user logged in') };

    // Mock profile update - no Supabase calls
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