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
    if (!isSupabaseConfigured) {
      // Mock authentication
      const mockUser = mockUsers.find(u => u.email === email);
      const validPasswords = ['admin123', 'user123', 'contractor123', 'demo123'];
      if (mockUser && validPasswords.includes(password)) {
        setUser(mockUser);
        localStorage.setItem('aquaharvest_user', JSON.stringify(mockUser));
        return { error: null };
      } else {
        return { error: { message: 'Invalid credentials. Use admin123, user123, or contractor123 as password.' } };
      }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    if (!isSupabaseConfigured) {
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

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone }
        }
      });

      if (data.user && !error) {
        // Create user profile
        await supabase.from('users').insert({
          id: data.user.id,
          name,
          email,
          phone,
          role: 'registered',
          language_pref: 'english'
        });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      localStorage.removeItem('aquaharvest_user');
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('No user logged in') };

    if (!isSupabaseConfigured) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('aquaharvest_user', JSON.stringify(updatedUser));
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        setUser({ ...user, ...updates });
      }

      return { error };
    } catch (error) {
      return { error };
    }
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