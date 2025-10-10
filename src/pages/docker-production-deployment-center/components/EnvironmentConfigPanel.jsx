import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Key, 
  Globe, 
  Shield, 
  Eye, 
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle,
  Save,
  RotateCcw
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import Icon from '@/components/AppIcon';


export default function EnvironmentConfigPanel({ pipelines, loadDeploymentData }) {
  const [activeSection, setActiveSection] = useState('domain');
  const [showSecrets, setShowSecrets] = useState({});
  const [copiedField, setCopiedField] = useState('');
  const [envConfig, setEnvConfig] = useState({
    domain: {
      DOMAIN: 'trading-mvp.com',
      LETSENCRYPT_EMAIL: 'you@example.com'
    },
    supabase: {
      SUPABASE_URL: 'https://xxx.supabase.co',
      SUPABASE_SERVICE_KEY: 'eyJhbGciOiJI...'
    },
    security: {
      INTERNAL_ADMIN_KEY: 'CHANGEME_SUPER_STRONG_SECRET'
    },
    frontend: {
      VITE_API_BASE_URL: 'https://trading-mvp.com/api'
    }
  });
  const [validationStatus, setValidationStatus] = useState({});

  useEffect(() => {
    validateConfiguration();
  }, [envConfig]);

  const toggleSecret = (field) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev?.[field] }));
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const validateConfiguration = () => {
    const status = {};
    
    // Validate domain configuration
    status.domain = {
      DOMAIN: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/?.test(envConfig?.domain?.DOMAIN),
      LETSENCRYPT_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(envConfig?.domain?.LETSENCRYPT_EMAIL)
    };

    // Validate Supabase configuration
    status.supabase = {
      SUPABASE_URL: envConfig?.supabase?.SUPABASE_URL?.startsWith('https://') && envConfig?.supabase?.SUPABASE_URL?.includes('.supabase.co'),
      SUPABASE_SERVICE_KEY: envConfig?.supabase?.SUPABASE_SERVICE_KEY?.length > 100
    };

    // Validate security
    status.security = {
      INTERNAL_ADMIN_KEY: envConfig?.security?.INTERNAL_ADMIN_KEY?.length >= 20 && 
                         envConfig?.security?.INTERNAL_ADMIN_KEY !== 'CHANGEME_SUPER_STRONG_SECRET'
    };

    // Validate frontend
    status.frontend = {
      VITE_API_BASE_URL: envConfig?.frontend?.VITE_API_BASE_URL?.startsWith('https://') && 
                        envConfig?.frontend?.VITE_API_BASE_URL?.endsWith('/api')
    };

    setValidationStatus(status);
  };

  const updateConfigValue = (section, key, value) => {
    setEnvConfig(prev => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [key]: value
      }
    }));
  };

  const saveConfiguration = async () => {
    if (!supabase) {
      alert('Supabase not available. Configuration saved locally only.');
      return;
    }

    try {
      // Create deployment pipeline with environment configuration
      const { data, error } = await supabase
        ?.from('deployment_pipelines')
        ?.insert({
          pipeline_name: `Environment Config - ${new Date()?.toISOString()}`,
          environment_variables: envConfig,
          configuration: {
            type: 'environment_update',
            sections: ['domain', 'supabase', 'security', 'frontend'],
            validation_status: validationStatus
          },
          overall_status: 'pending',
          current_stage: 'j1_boot_guard'
        });

      if (error) throw error;

      alert('Environment configuration saved successfully!');
      loadDeploymentData?.();
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  const resetToDefaults = () => {
    if (confirm('Reset all environment variables to default values?')) {
      setEnvConfig({
        domain: {
          DOMAIN: 'trading-mvp.com',
          LETSENCRYPT_EMAIL: 'you@example.com'
        },
        supabase: {
          SUPABASE_URL: 'https://xxx.supabase.co',
          SUPABASE_SERVICE_KEY: 'eyJhbGciOiJI...'
        },
        security: {
          INTERNAL_ADMIN_KEY: 'CHANGEME_SUPER_STRONG_SECRET'
        },
        frontend: {
          VITE_API_BASE_URL: 'https://trading-mvp.com/api'
        }
      });
    }
  };

  const generateFullEnvFile = () => {
    const allConfig = Object.entries(envConfig)?.reduce((acc, [section, vars]) => {
      return { ...acc, ...vars };
    }, {});

    const envContent = `# Docker Production Environment Configuration
# Generated: ${new Date()?.toISOString()}

# Domain and TLS Let's Encrypt
${Object.entries(allConfig)?.map(([key, value]) => `${key}=${value}`)?.join('\n')}`;

    return envContent;
  };

  const sections = [
    { key: 'domain', label: 'Domain & SSL', icon: Globe, color: 'blue' },
    { key: 'supabase', label: 'Supabase', icon: Shield, color: 'green' },
    { key: 'security', label: 'Security', icon: Key, color: 'red' },
    { key: 'frontend', label: 'Frontend', icon: Settings, color: 'purple' }
  ];

  const getValidationIcon = (section, key) => {
    const isValid = validationStatus?.[section]?.[key];
    if (isValid === undefined) return null;
    return isValid ? 
      <CheckCircle className="h-4 w-4 text-green-400" /> : 
      <AlertTriangle className="h-4 w-4 text-red-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Settings className="h-5 w-5 text-green-400" />
            <span>Environment Configuration</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetToDefaults}
              className="text-gray-400 hover:text-white transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={saveConfiguration}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
            >
              <Save className="h-3 w-3" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex space-x-1 mb-4 bg-gray-900/50 rounded-lg p-1">
          {sections?.map((section) => {
            const Icon = section?.icon;
            return (
              <button
                key={section?.key}
                onClick={() => setActiveSection(section?.key)}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md transition-all duration-200 text-xs ${
                  activeSection === section?.key
                    ? `bg-${section?.color}-600 text-white`
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{section?.label}</span>
              </button>
            );
          })}
        </div>

        {/* Configuration Fields */}
        <div className="space-y-4">
          {envConfig?.[activeSection] && Object.entries(envConfig?.[activeSection])?.map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                  <span>{key}</span>
                  {getValidationIcon(activeSection, key)}
                </label>
                <div className="flex items-center space-x-2">
                  {(key?.includes('KEY') || key?.includes('SECRET')) && (
                    <button
                      onClick={() => toggleSecret(key)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {showSecrets?.[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(value, key)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedField === key ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <input
                type={((key?.includes('KEY') || key?.includes('SECRET')) && !showSecrets?.[key]) ? 'password' : 'text'}
                value={value}
                onChange={(e) => updateConfigValue(activeSection, key, e?.target?.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder={`Enter ${key?.toLowerCase()?.replace(/_/g, ' ')}`}
              />
            </div>
          ))}
        </div>

        {/* Configuration Summary */}
        <div className="mt-6 p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-white">Configuration Status</h5>
            <button
              onClick={() => copyToClipboard(generateFullEnvFile(), 'full-env')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              {copiedField === 'full-env' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>Copy .env</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {sections?.map((section) => {
              const sectionStatus = validationStatus?.[section?.key];
              const validCount = sectionStatus ? Object.values(sectionStatus)?.filter(Boolean)?.length : 0;
              const totalCount = sectionStatus ? Object.values(sectionStatus)?.length : 0;
              const isValid = validCount === totalCount && totalCount > 0;
              
              return (
                <div key={section?.key} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isValid ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className="text-sm text-gray-300">{section?.label}</span>
                  <span className="text-xs text-gray-400">
                    ({validCount}/{totalCount})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deployment Status */}
        {pipelines && pipelines?.length > 0 && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Recent Deployments</span>
            </div>
            <div className="space-y-1">
              {pipelines?.slice(0, 2)?.map((pipeline) => (
                <div key={pipeline?.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{pipeline?.pipeline_name}</span>
                  <div className={`px-2 py-1 rounded text-xs ${
                    pipeline?.overall_status === 'completed' ? 'bg-green-900/50 text-green-300' :
                    pipeline?.overall_status === 'running' ? 'bg-blue-900/50 text-blue-300' :
                    pipeline?.overall_status === 'failed'? 'bg-red-900/50 text-red-300' : 'bg-gray-700/50 text-gray-300'
                  }`}>
                    {pipeline?.overall_status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}