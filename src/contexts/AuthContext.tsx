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
    // Check stored users for authentication
    const storedUsers = JSON.parse(localStorage.getItem('aquaharvest_all_users') || '[]');
    const allUsers = [...mockUsers, ...storedUsers];
    
    const foundUser = allUsers.find(u => u.email === email);
    
    if (!foundUser) {
      return { error: { message: 'No account found with this email address.' } };
    }
    
    // For demo purposes, we'll use a simple password check
    // In production, this would be properly hashed and verified
    const storedPassword = localStorage.getItem(`password_${foundUser.id}`);
    const isValidPassword = (
      // Demo admin credentials (hidden from UI)
      (email === 'admin@aquaharvest.com' && password === 'admin123') ||
      // User-created accounts
      (storedPassword && storedPassword === password)
    );
    
    if (isValidPassword) {
      setUser(foundUser);
      localStorage.setItem('aquaharvest_user', JSON.stringify(foundUser));
      return { error: null };
    } else {
      return { error: { message: 'Invalid password. Please check your credentials and try again.' } };
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string = 'user') => {
    // Check if user already exists
    const storedUsers = JSON.parse(localStorage.getItem('aquaharvest_all_users') || '[]');
    const allUsers = [...mockUsers, ...storedUsers];
    
    if (allUsers.find(u => u.email === email)) {
      return { error: { message: 'An account with this email already exists.' } };
    }
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      full_name: name,
      role: role as any,
      language_preference: 'english',
      created_at: new Date().toISOString()
    };
    
    // Store user and password
    storedUsers.push(newUser);
    localStorage.setItem('aquaharvest_all_users', JSON.stringify(storedUsers));
    localStorage.setItem(`password_${newUser.id}`, password);
    
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