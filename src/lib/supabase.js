import { createClient } from '@supabase/supabase-js';

// Environment configuration
const VITE_SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const VITE_SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Mock demo user for development/testing
const DEMO_USER = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'demo@trading-mvp.com',
  user_metadata: {
    full_name: 'Demo User',
    role: 'admin'
  }
};

// Create Supabase client if environment variables are available
let supabaseClient = null;
try {
  if (VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY) {
    supabaseClient = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      }
    });
  }
} catch (error) {
  console.warn('Failed to initialize Supabase client:', error);
}

// Export with fallback handling
export const supabase = supabaseClient;

// Mock authentication for development/testing
export const mockAuth = {
  // Check if we should use mock mode (when Supabase is not available)
  isMockMode: !supabaseClient,
  
  // Mock user session
  mockSession: {
    user: DEMO_USER,
    access_token: 'mock_token_' + Date.now()
  },
  
  // Get current user (mock or real)
  async getUser() {
    if (this.isMockMode) {
      return {
        data: { user: this.mockSession?.user },
        error: null
      };
    }
    return await supabaseClient?.auth?.getUser();
  },
  
  // Get current session (mock or real)
  async getSession() {
    if (this.isMockMode) {
      return {
        data: { session: this.mockSession },
        error: null
      };
    }
    return await supabaseClient?.auth?.getSession();
  }
};