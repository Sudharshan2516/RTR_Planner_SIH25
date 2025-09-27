import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, User } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>;
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
    const getSession = async () => {
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

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          let { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData && !fetchError) {
            setUser(userData);
          } else if (fetchError && fetchError.code === 'PGRST116') {
            // User profile doesn't exist, create it
            const userMetadata = session.user.user_metadata;
            await createUserProfile(
              session.user.id,
              session.user.email || '',
              userMetadata.full_name || 'User',
              userMetadata.role || 'user'
            );
            
            // Fetch the newly created profile
            const { data: newUserData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (newUserData) {
              setUser(newUserData);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role = 'user') => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      
      if (data.user && !error) {
        // Wait for the user to be confirmed before creating profile
        if (data.user.email_confirmed_at || data.user.confirmed_at) {
          await createUserProfile(data.user.id, email, fullName, role);
        }
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const createUserProfile = async (userId: string, email: string, fullName: string, role: string) => {
    try {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email,
          full_name: fullName,
          role: role as any,
          language_preference: 'english'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return;
      }

      // Initialize gamification data
      const { error: gamificationError } = await supabase
        .from('gamification')
        .upsert({
          user_id: userId,
          total_points: 0,
          level: 1,
          badges: [],
          achievements: [],
          water_saved_liters: 0,
          money_saved: 0,
          environmental_impact_score: 0
        });

      if (gamificationError) {
        console.error('Gamification initialization error:', gamificationError);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('No user logged in') };
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
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