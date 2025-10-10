import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  // Enhanced profile operations with fallback handling
  const profileOperations = {
    async load(userId) {
      if (!userId) return;
      setProfileLoading(true);
      
      try {
        if (!supabase) {
          // Mock profile for demo
          setUserProfile({
            id: userId,
            email: 'demo@trading-mvp.com',
            full_name: 'Demo User',
            role: 'admin',
            created_at: new Date()?.toISOString()
          });
          setProfileLoading(false);
          return;
        }

        const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single();
        
        if (!error && data) {
          setUserProfile(data);
        } else {
          // Create mock profile if database query fails
          setUserProfile({
            id: userId,
            email: user?.email || 'demo@trading-mvp.com',
            full_name: user?.user_metadata?.full_name || 'Demo User',
            role: 'basic_user',
            created_at: new Date()?.toISOString()
          });
        }
      } catch (error) {
        console.error('Profile load error:', error);
        // Fallback to mock profile
        setUserProfile({
          id: userId,
          email: 'demo@trading-mvp.com',
          full_name: 'Demo User',
          role: 'basic_user',
          created_at: new Date()?.toISOString()
        });
      } finally {
        setProfileLoading(false);
      }
    },
    
    clear() {
      setUserProfile(null);
      setProfileLoading(false);
    },

    async update(updates) {
      if (!user?.id) return { success: false, error: 'No user logged in' };
      
      setProfileLoading(true);
      try {
        if (!supabase) {
          // Mock update for demo
          setUserProfile(prev => ({ ...prev, ...updates }));
          setProfileLoading(false);
          return { success: true, data: { ...userProfile, ...updates } };
        }

        const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single();
        
        if (error) {
          return { success: false, error: error?.message };
        }
        
        setUserProfile(data);
        return { success: true, data };
      } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error?.message };
      } finally {
        setProfileLoading(false);
      }
    }
  };

  // Enhanced auth state handlers with fallback
  const authStateHandlers = {
    onChange: (event, session) => {
      if (session?.user) {
        setUser(session?.user);
        setIsMockMode(false);
        profileOperations?.load(session?.user?.id);
      } else {
        // Fallback to mock user if no session
        const mockUser = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'demo@trading-mvp.com',
          user_metadata: {
            full_name: 'Demo User',
            role: 'admin'
          }
        };
        setUser(mockUser);
        setIsMockMode(true);
        profileOperations?.load(mockUser?.id);
      }
      setLoading(false);
    }
  };

  // Enhanced authentication operations with fallback
  const authOperations = {
    async signUp(email, password, additionalData = {}) {
      try {
        setLoading(true);
        
        if (!supabase) {
          // Mock signup for demo
          const mockUser = {
            id: 'mock-user-' + Date.now(),
            email: email,
            user_metadata: additionalData
          };
          setUser(mockUser);
          setIsMockMode(true);
          return { success: true, data: { user: mockUser } };
        }

        const { data, error } = await supabase?.auth?.signUp({
          email,
          password,
          options: {
            data: additionalData
          }
        });

        if (error) {
          return { success: false, error: error?.message };
        }

        return { success: true, data };
      } catch (error) {
        console.error('Signup error:', error);
        return { success: false, error: error?.message };
      } finally {
        setLoading(false);
      }
    },

    async signIn(email, password) {
      try {
        setLoading(true);
        
        if (!supabase) {
          // Mock signin for demo
          const mockUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: email,
            user_metadata: {
              full_name: 'Demo User',
              role: 'admin'
            }
          };
          setUser(mockUser);
          setIsMockMode(true);
          return { success: true, data: { user: mockUser } };
        }

        const { data, error } = await supabase?.auth?.signInWithPassword({
          email,
          password
        });

        if (error) {
          return { success: false, error: error?.message };
        }

        return { success: true, data };
      } catch (error) {
        console.error('Signin error:', error);
        return { success: false, error: error?.message };
      } finally {
        setLoading(false);
      }
    },

    async signOut() {
      try {
        setLoading(true);
        
        if (!supabase) {
          // Mock signout
          setUser(null);
          profileOperations?.clear();
          setIsMockMode(false);
          return { success: true };
        }

        const { error } = await supabase?.auth?.signOut();
        
        if (error) {
          return { success: false, error: error?.message };
        }

        return { success: true };
      } catch (error) {
        console.error('Signout error:', error);
        return { success: false, error: error?.message };
      } finally {
        setLoading(false);
      }
    },

    async resetPassword(email) {
      try {
        if (!supabase) {
          // Mock reset for demo
          console.log('Mock password reset for:', email);
          return { success: true };
        }

        const { error } = await supabase?.auth?.resetPasswordForEmail(email);
        
        if (error) {
          return { success: false, error: error?.message };
        }

        return { success: true };
      } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, error: error?.message };
      }
    }
  };

  useEffect(() => {
    // Initialize authentication with fallback
    const initAuth = async () => {
      try {
        if (!supabase) {
          // Initialize with mock user when Supabase is not available
          authStateHandlers?.onChange(null, null);
          return;
        }

        // Get initial session
        const { data: { session } } = await supabase?.auth?.getSession();
        authStateHandlers?.onChange(null, session);

        // Set up auth state listener
        const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
          authStateHandlers?.onChange
        );

        return () => subscription?.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Fallback to mock auth on error
        authStateHandlers?.onChange(null, null);
      }
    };

    initAuth();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    isMockMode,
    signUp: authOperations?.signUp,
    signIn: authOperations?.signIn,
    signOut: authOperations?.signOut,
    resetPassword: authOperations?.resetPassword,
    updateProfile: profileOperations?.update,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin' || isMockMode,
    isPremium: userProfile?.role === 'premium_user' || userProfile?.role === 'admin' || isMockMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;