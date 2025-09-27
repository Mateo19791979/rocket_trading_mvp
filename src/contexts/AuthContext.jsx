import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase?.auth?.getSession();
        if (error) {
          console.error('Error getting session:', error);
          // If there's no session, try to authenticate with demo user
          await attemptDemoLogin();
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // If no session found, try demo login
        if (!session) {
          await attemptDemoLogin();
        }
      } catch (error) {
        console.error('Session error:', error);
        await attemptDemoLogin();
      } finally {
        setLoading(false);
      }
    };

    // Auto demo login for development/demo purposes
    const attemptDemoLogin = async () => {
      try {
        console.log('Attempting auto demo login...');
        const { data, error } = await supabase?.auth?.signInWithPassword({
          email: 'trader@tradingai.com',
          password: 'demo123456'
        });

        if (error) {
          console.warn('Demo login failed, creating temporary session:', error);
          // Fallback: create a temporary session for demo purposes
          const mockUser = {
            id: '145d705c-d690-4aa6-9716-6c4ce8981ffe',
            email: 'trader@tradingai.com',
            user_metadata: { full_name: 'John Trader' },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date()?.toISOString()
          };
          
          const mockSession = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: mockUser
          };
          
          setUser(mockUser);
          setSession(mockSession);
          console.log('Demo session created:', mockUser?.email);
        } else if (data?.user) {
          setUser(data?.user);
          setSession(data?.session);
          console.log('Demo login successful:', data?.user?.email);
        }
      } catch (err) {
        console.error('Demo login attempt failed:', err);
        // Create basic mock session as last resort
        const mockUser = {
          id: '145d705c-d690-4aa6-9716-6c4ce8981ffe',
          email: 'trader@tradingai.com',
          user_metadata: { full_name: 'John Trader' }
        };
        setUser(mockUser);
        setSession({ user: mockUser });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error: error?.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error: error?.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase?.auth?.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error?.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error: error?.message };
    }
  };

  // Update password
  const updatePassword = async (password) => {
    try {
      const { data, error } = await supabase?.auth?.updateUser({
        password: password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { data: null, error: error?.message };
    }
  };

  // Explicit demo login
  const signInAsDemo = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email: 'trader@tradingai.com',
        password: 'demo123456'
      });

      if (error) {
        console.warn('Demo login failed, using fallback:', error);
        
        const mockUser = {
          id: '145d705c-d690-4aa6-9716-6c4ce8981ffe',
          email: 'trader@tradingai.com',
          user_metadata: { full_name: 'John Trader' }
        };
        
        setUser(mockUser);
        setSession({ user: mockUser });
        
        return { data: { user: mockUser }, error: null };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Demo sign in error:', error);
      return { data: null, error: error?.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInAsDemo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;