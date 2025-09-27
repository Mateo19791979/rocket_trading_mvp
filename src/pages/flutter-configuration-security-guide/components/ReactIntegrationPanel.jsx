import React, { useState } from 'react';
import { Database, Code, ArrowRight, Settings, Copy, Check } from 'lucide-react';

const ReactIntegrationPanel = () => {
  const [activePattern, setActivePattern] = useState('environment');
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (code, id) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const reactPatterns = {
    environment: {
      title: 'React Environment Variables',
      description: 'Secure environment variable management in React trading platform',
      code: `// .env configuration (React/Vite)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TRADING_API_URL=your_trading_api_url

// src/lib/config.js
class AppConfig {
  static getConfig() {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const config = {};
    const missing = [];

    requiredVars.forEach(varName => {
      const value = import.meta.env[varName];
      if (!value) {
        missing.push(varName);
      } else {
        config[varName.replace('VITE_', '')] = value;
      }
    });

    if (missing.length > 0) {
      throw new Error(\`Missing environment variables: \${missing.join(', ')}\`);
    }

    return config;
  }

  static validateConfig() {
    try {
      const config = this.getConfig();
      
      // Validate Supabase URL format
      if (!config.SUPABASE_URL?.startsWith('https://')) {
        throw new Error('Invalid Supabase URL format');
      }

      return config;
    } catch (error) {
      console.error('Configuration validation failed:', error);
      throw error;
    }
  }
}`
    },
    integration: {
      title: 'Supabase Client Integration',
      description: 'Secure Supabase client initialization with configuration validation',
      code: `// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import { AppConfig } from './config';

let supabaseClient = null;

export const initializeSupabase = () => {
  try {
    const config = AppConfig.validateConfig();
    
    supabaseClient = createClient(
      config.SUPABASE_URL,
      config.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        global: {
          headers: {
            'X-Client-Platform': 'react-web'
          }
        }
      }
    );

    return supabaseClient;
  } catch (error) {
    console.error('Supabase initialization failed:', error);
    throw new Error('Application configuration error');
  }
};

export const getSupabase = () => {
  if (!supabaseClient) {
    return initializeSupabase();
  }
  return supabaseClient;
};

// Usage in React components
export default getSupabase();`
    },
    context: {
      title: 'React Configuration Context',
      description: 'Configuration provider for React application with error boundaries',
      code: `// src/contexts/ConfigContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppConfig } from '../lib/config';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const validatedConfig = AppConfig.validateConfig();
      setConfig(validatedConfig);
    } catch (err) {
      setError(err?.message || 'Configuration loading failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    config,
    loading,
    error,
    isConfigured: !!config && !error
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Configuration Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};`
    }
  };

  const comparisonFeatures = [
    {
      flutter: 'JSON Asset Loading',
      react: 'Environment Variables',
      description: 'Configuration source patterns'
    },
    {
      flutter: 'rootBundle.loadString()',
      react: 'import.meta.env.VITE_*',
      description: 'Loading mechanisms'
    },
    {
      flutter: 'flutter_secure_storage',
      react: 'Browser secure storage',
      description: 'Secure storage options'
    },
    {
      flutter: 'Platform-specific encryption',
      react: 'HTTPS + environment isolation',
      description: 'Security approaches'
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="w-6 h-6 text-white mr-3" />
            <h3 className="text-xl font-semibold text-white">React MVP Integration</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-teal-500/20 text-teal-200 text-sm rounded-full">
              Web Platform
            </span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <p className="text-blue-100 mb-4">
            Adapting Flutter security patterns to the React trading platform. This demonstrates 
            how to implement similar configuration security measures in web applications.
          </p>
        </div>

        {/* Pattern Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(reactPatterns)?.map(([key, { title }]) => (
            <button
              key={key}
              onClick={() => setActivePattern(key)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                activePattern === key
                  ? 'bg-teal-500/20 text-teal-200 border border-teal-400/30' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
              }`}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Active Pattern Code */}
        <div className="bg-slate-900/50 rounded-lg border border-white/10 mb-6">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <h4 className="text-white font-medium">{reactPatterns?.[activePattern]?.title}</h4>
              <p className="text-blue-200 text-sm">{reactPatterns?.[activePattern]?.description}</p>
            </div>
            <button
              onClick={() => copyToClipboard(reactPatterns?.[activePattern]?.code, activePattern)}
              className="flex items-center px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
            >
              {copiedCode === activePattern ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          <div className="p-4">
            <pre className="text-sm text-blue-100 overflow-x-auto">
              <code>{reactPatterns?.[activePattern]?.code}</code>
            </pre>
          </div>
        </div>

        {/* Flutter vs React Comparison */}
        <div className="bg-white/5 rounded-lg p-6">
          <h4 className="text-white font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Flutter vs React Configuration Patterns
          </h4>
          <div className="space-y-3">
            {comparisonFeatures?.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                <div className="flex items-center flex-1">
                  <div className="text-center">
                    <span className="text-xs text-blue-300 block">Flutter</span>
                    <code className="text-sm text-blue-200 bg-blue-500/10 px-2 py-1 rounded">
                      {feature?.flutter}
                    </code>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white mx-4" />
                  <div className="text-center">
                    <span className="text-xs text-teal-300 block">React</span>
                    <code className="text-sm text-teal-200 bg-teal-500/10 px-2 py-1 rounded">
                      {feature?.react}
                    </code>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-white/70 text-sm">{feature?.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactIntegrationPanel;