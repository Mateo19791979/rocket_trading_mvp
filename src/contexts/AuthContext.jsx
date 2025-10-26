import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import tradingAccountService from '../services/tradingAccountService';

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
  const [tradingAccount, setTradingAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  // 🚀 Production Mode Detection
  const isProductionMode = import.meta.env?.VITE_PRODUCTION_MODE === 'true' && 
                          import.meta.env?.VITE_MOCK_MODE_ENABLED !== 'true';

  // Initialize with mock user immediately if Supabase is not available
  const initializeMockUser = () => {
    // ⚠️ Only allow mock mode in development
    if (isProductionMode) {
      console.warn('🚫 Mock mode disabled in production');
      setUser(null);
      setUserProfile(null);
      setTradingAccount(null);
      setIsMockMode(false);
      setLoading(false);
      return;
    }

    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'demo@trading-mvp.com',
      user_metadata: {
        full_name: 'Demo Trader',
        username: 'demo_trader',
        role: 'trader'
      }
    };
    
    const mockProfile = {
      id: mockUser?.id,
      email: mockUser?.email,
      full_name: 'Demo Trader',
      username: 'demo_trader',
      role: 'trader',
      created_at: new Date()?.toISOString()
    };

    const mockTradingAccount = {
      id: 'mock-account-id',
      user_id: mockUser?.id,
      account_type: 'demo',
      balance: 10000.00,
      currency: 'EUR',
      is_active: true,
      created_at: new Date()?.toISOString()
    };

    setUser(mockUser);
    setUserProfile(mockProfile);
    setTradingAccount(mockTradingAccount);
    setIsMockMode(true);
    setLoading(false);
  };

  // Enhanced profile operations with trading account support
  const profileOperations = {
    async load(userId) {
      if (!userId) return;
      setProfileLoading(true);
      
      try {
        if (!supabase || isMockMode) {
          // Mock profile for demo
          const mockProfile = {
            id: userId,
            email: 'demo@trading-mvp.com',
            full_name: 'Demo Trader',
            username: 'demo_trader',
            role: 'trader',
            created_at: new Date()?.toISOString()
          };

          const mockTradingAccount = {
            id: 'mock-account-id',
            user_id: userId,
            account_type: 'demo',
            balance: 10000.00,
            currency: 'EUR',
            is_active: true,
            created_at: new Date()?.toISOString()
          };

          setUserProfile(mockProfile);
          setTradingAccount(mockTradingAccount);
          setProfileLoading(false);
          return;
        }

        // Load user profile
        const { data: profile, error: profileError } = await supabase
          ?.from('user_profiles')
          ?.select('*')
          ?.eq('id', userId)
          ?.single();
        
        if (!profileError && profile) {
          setUserProfile(profile);
          
          // Load primary trading account
          const accountResult = await tradingAccountService?.getPrimaryTradingAccount();
          if (accountResult?.success) {
            setTradingAccount(accountResult?.data);
          }
        } else {
          // Create mock profile if database query fails
          const mockProfile = {
            id: userId,
            email: user?.email || 'demo@trading-mvp.com',
            full_name: user?.user_metadata?.full_name || 'Demo Trader',
            username: user?.user_metadata?.username || 'demo_trader',
            role: 'trader',
            created_at: new Date()?.toISOString()
          };

          const mockTradingAccount = {
            id: 'mock-account-id',
            user_id: userId,
            account_type: 'demo',
            balance: 10000.00,
            currency: 'EUR',
            is_active: true,
            created_at: new Date()?.toISOString()
          };

          setUserProfile(mockProfile);
          setTradingAccount(mockTradingAccount);
        }
      } catch (error) {
        console.error('Profile load error:', error);
        // Fallback to mock profile
        const mockProfile = {
          id: userId,
          email: 'demo@trading-mvp.com',
          full_name: 'Demo Trader',
          username: 'demo_trader',
          role: 'trader',
          created_at: new Date()?.toISOString()
        };

        const mockTradingAccount = {
          id: 'mock-account-id',
          user_id: userId,
          account_type: 'demo',
          balance: 10000.00,
          currency: 'EUR',
          is_active: true,
          created_at: new Date()?.toISOString()
        };

        setUserProfile(mockProfile);
        setTradingAccount(mockTradingAccount);
      } finally {
        setProfileLoading(false);
      }
    },
    
    clear() {
      setUserProfile(null);
      setTradingAccount(null);
      setProfileLoading(false);
    },

    async refreshTradingAccount() {
      if (!user?.id || isMockMode) return;
      
      try {
        const accountResult = await tradingAccountService?.getPrimaryTradingAccount();
        if (accountResult?.success) {
          setTradingAccount(accountResult?.data);
        }
      } catch (error) {
        console.error('Trading account refresh error:', error);
      }
    },

    async update(updates) {
      if (!user?.id) return { success: false, error: 'No user logged in' };
      
      setProfileLoading(true);
      try {
        if (!supabase || isMockMode) {
          // Mock update for demo
          setUserProfile(prev => ({ ...prev, ...updates }));
          setProfileLoading(false);
          return { success: true, data: { ...userProfile, ...updates } };
        }

        // Use the update function for username validation
        if (updates?.username || updates?.full_name) {
          const { data, error } = await supabase?.rpc('update_user_profile_with_username', {
            user_id_param: user?.id,
            full_name_param: updates?.full_name || null,
            username_param: updates?.username || null
          });
          
          if (error || !data?.success) {
            return { success: false, error: data?.error || error?.message };
          }
          
          setUserProfile(data?.data);
          return { success: true, data: data?.data };
        } else {
          // Regular update for other fields
          const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single();
          
          if (error) {
            return { success: false, error: error?.message };
          }
          
          setUserProfile(data);
          return { success: true, data };
        }
      } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error?.message };
      } finally {
        setProfileLoading(false);
      }
    },

    async checkUsernameAvailability(username) {
      if (!username?.trim()) return { success: false, error: 'Username is required' };
      
      try {
        if (!supabase || isMockMode) {
          // Mock check for demo
          return { success: true, available: true };
        }

        const { data, error } = await supabase?.rpc('is_username_available', {
          username_param: username?.trim()
        });
        
        if (error) {
          return { success: false, error: error?.message };
        }
        
        return { success: true, available: data };
      } catch (error) {
        console.error('Username availability check error:', error);
        return { success: false, error: error?.message };
      }
    }
  };

  // Enhanced authentication operations with production mode
  const authOperations = {
    async signUp(email, password, additionalData = {}) {
      try {
        setLoading(true);
        
        // 🚀 Production Mode: Force real authentication
        if (isProductionMode) {
          if (!supabase) {
            throw new Error('Supabase connection required in production mode');
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
        }
        
        if (!supabase || isMockMode) {
          // Mock signup for demo
          const mockUser = {
            id: 'mock-user-' + Date.now(),
            email: email,
            user_metadata: {
              ...additionalData,
              username: additionalData?.username || 'MockUser'
            }
          };
          setUser(mockUser);
          setIsMockMode(true);
          profileOperations?.load(mockUser?.id);
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
        
        // 🚀 Production Mode: Force real authentication
        if (isProductionMode) {
          if (!supabase) {
            throw new Error('Supabase connection required in production mode');
          }

          const { data, error } = await supabase?.auth?.signInWithPassword({
            email,
            password
          });

          if (error) {
            return { success: false, error: error?.message };
          }

          return { success: true, data };
        }
        
        if (!supabase || isMockMode) {
          // Mock signin for demo
          const mockUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: email,
            user_metadata: {
              full_name: 'Demo User',
              username: 'DemoUser',
              role: 'admin'
            }
          };
          setUser(mockUser);
          setIsMockMode(true);
          profileOperations?.load(mockUser?.id);
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
        
        if (!supabase || isMockMode) {
          // Mock signout - return to mock mode
          initializeMockUser();
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
        if (!supabase || isMockMode) {
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

  // Enhanced auth state handlers with production mode
  const authStateHandlers = {
    onChange: (event, session) => {
      if (session?.user) {
        setUser(session?.user);
        setIsMockMode(false);
        profileOperations?.load(session?.user?.id);
      } else if (!isProductionMode && !isMockMode) {
        // Only initialize mock user if not in production mode
        initializeMockUser();
      } else if (isProductionMode) {
        // Production mode: clear everything
        setUser(null);
        setUserProfile(null);
        setTradingAccount(null);
        setIsMockMode(false);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize authentication with production mode awareness
    const initAuth = async () => {
      try {
        if (!supabase && isProductionMode) {
          console.error('🚫 Production mode requires Supabase connection');
          setLoading(false);
          return;
        }

        if (!supabase && !isProductionMode) {
          // Initialize with mock user when Supabase is not available in dev
          console.log('Supabase not available, initializing mock mode');
          initializeMockUser();
          return;
        }

        // Get initial session
        const { data: { session }, error } = await supabase?.auth?.getSession();
        
        if (error) {
          if (isProductionMode) {
            console.error('🚫 Production mode authentication error:', error);
            setLoading(false);
            return;
          } else {
            console.warn('Session error, falling back to mock mode:', error);
            initializeMockUser();
            return;
          }
        }

        if (session?.user) {
          setUser(session?.user);
          setIsMockMode(false);
          profileOperations?.load(session?.user?.id);
          setLoading(false);
        } else {
          if (isProductionMode) {
            // Production mode: no fallback
            setLoading(false);
          } else {
            initializeMockUser();
          }
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
          authStateHandlers?.onChange
        );

        return () => subscription?.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isProductionMode) {
          console.error('🚫 Production mode authentication failed');
          setLoading(false);
        } else {
          // Fallback to mock auth on any error in dev
          initializeMockUser();
        }
      }
    };

    initAuth();
  }, []);

  const value = {
    user,
    userProfile,
    tradingAccount,
    loading,
    profileLoading,
    isMockMode,
    isProductionMode, // 🚀 Expose production mode state
    signUp: authOperations?.signUp,
    signIn: authOperations?.signIn,
    signOut: authOperations?.signOut,
    resetPassword: authOperations?.resetPassword,
    updateProfile: profileOperations?.update,
    checkUsernameAvailability: profileOperations?.checkUsernameAvailability,
    refreshTradingAccount: profileOperations?.refreshTradingAccount,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin' || (isMockMode && !isProductionMode),
    isTrader: userProfile?.role === 'trader' || userProfile?.role === 'admin' || (isMockMode && !isProductionMode)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;