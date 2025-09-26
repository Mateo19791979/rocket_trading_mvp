import React, { useState } from 'react';
import { Settings, Copy, Check, Eye, EyeOff, Server, Globe } from 'lucide-react';



const EnvExamplesPanel = () => {
  const [copiedField, setCopiedField] = useState(null);
  const [showSecrets, setShowSecrets] = useState(false);

  const backendEnvVars = [
    { key: 'PORT', value: '8080', description: 'Server port' },
    { key: 'IB_HOST', value: '127.0.0.1', description: 'Interactive Brokers host' },
    { key: 'IB_PORT', value: '7497', description: 'Interactive Brokers port' },
    { key: 'IB_CLIENT_ID', value: '42', description: 'IB client identifier' },
    { key: 'CORS_ORIGIN', value: 'https://ton-domaine.rocket.new', description: 'Allowed CORS origins' }
  ];

  const frontendEnvVars = [
    { key: 'VITE_SUPABASE_URL', value: 'https://your-project.supabase.co', description: 'Supabase project URL', secret: true },
    { key: 'VITE_SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Supabase anonymous key', secret: true }
  ];

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatValue = (value, isSecret) => {
    if (isSecret && !showSecrets) {
      return '••••••••••••••••••••';
    }
    return value;
  };

  const EnvSection = ({ title, icon, variables, type }) => (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        {React.createElement(icon, { className: "w-5 h-5 text-white mr-2" })}
        <h4 className="text-lg font-semibold text-white">{title}</h4>
      </div>
      <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
        {variables?.map(({ key, value, description, secret }) => (
          <div key={key} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <span className="text-green-400">{key}</span>
                <span className="text-white mx-2">=</span>
                <span className="text-orange-300">{formatValue(value, secret)}</span>
              </div>
              <button
                onClick={() => copyToClipboard(`${key}=${value}`, key)}
                className="text-white/60 hover:text-white p-1 rounded transition-colors"
              >
                {copiedField === key ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-orange-200/70 ml-0"># {description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Settings className="w-6 h-6 text-white mr-3" />
          <h3 className="text-xl font-bold text-white">.env (exemples)</h3>
        </div>
        <button
          onClick={() => setShowSecrets(!showSecrets)}
          className="flex items-center text-sm text-orange-100 hover:text-white transition-colors"
        >
          {showSecrets ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
          {showSecrets ? 'Hide' : 'Show'} secrets
        </button>
      </div>
      <EnvSection 
        title="BACKEND Variables" 
        icon={Server}
        variables={backendEnvVars}
        type="backend"
      />
      <EnvSection 
        title="FRONTEND Variables" 
        icon={Globe}
        variables={frontendEnvVars}
        type="frontend"
      />
      {/* Quick Copy All */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const allBackendVars = backendEnvVars?.map(v => `${v?.key}=${v?.value}`)?.join('\n');
              copyToClipboard(allBackendVars, 'backend-all');
            }}
            className="flex items-center px-3 py-2 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors"
          >
            {copiedField === 'backend-all' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            Copy Backend .env
          </button>
          <button
            onClick={() => {
              const allFrontendVars = frontendEnvVars?.map(v => `${v?.key}=${v?.value}`)?.join('\n');
              copyToClipboard(allFrontendVars, 'frontend-all');
            }}
            className="flex items-center px-3 py-2 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors"
          >
            {copiedField === 'frontend-all' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            Copy Frontend .env
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnvExamplesPanel;