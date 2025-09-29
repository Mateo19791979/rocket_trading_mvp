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
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // ✅ REQUIRED: Separate async operations object
  const profileOperations = {
    async load(userId) {
      if (!userId) return;
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          ?.from('user_profiles')
          ?.select('*')
          ?.eq('id', userId)
          ?.single();
        
        if (!error && data) {
          setUserProfile(data);
        } else if (error && error?.code !== 'PGRST116') {
          // PGRST116 is "not found" - user_profile might not exist yet
          console.warn('Profile load error:', error);
        }
      } catch (error) {
        console.warn('Profile load error:', error);
      } finally {
        setProfileLoading(false);
      }
    },
    
    clear() {
      setUserProfile(null);
      setProfileLoading(false);
    }
  };

  // ✅ REQUIRED: Protected auth handlers
  const authStateHandlers = {
    // CRITICAL: This MUST remain synchronous
    onChange: (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        profileOperations?.load(session?.user?.id); // Fire-and-forget
      } else {
        profileOperations?.clear();
      }
    }
  };

  useEffect(() => {
    // Get initial session
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session);
    });

    // PROTECTED: Never modify this callback signature
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
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

      if (error) {
        return { data: null, error: error?.message };
      }
      return { data, error: null };
    } catch (error) {
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

      if (error) {
        return { data: null, error: error?.message };
      }
      return { data, error: null };
    } catch (error) {
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
      if (error) {
        return { error: error?.message };
      }
      return { error: null };
    } catch (error) {
      return { error: error?.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window?.location?.origin}/reset-password`,
      });

      if (error) {
        return { data: null, error: error?.message };
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  };

  // Update password
  const updatePassword = async (password) => {
    try {
      const { data, error } = await supabase?.auth?.updateUser({
        password: password
      });

      if (error) {
        return { data: null, error: error?.message };
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;