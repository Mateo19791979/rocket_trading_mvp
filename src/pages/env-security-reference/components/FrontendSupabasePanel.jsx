import React, { useState } from 'react';
import { Database, Copy, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const FrontendSupabasePanel = () => {
  const [copiedField, setCopiedField] = useState(null);
  const [showKeys, setShowKeys] = useState(false);

  const supabaseVariables = [
    { 
      key: 'VITE_SUPABASE_URL', 
      value: 'https://votre-projet.supabase.co', 
      description: 'URL de votre projet Supabase',
      placeholder: true
    },
    { 
      key: 'VITE_SUPABASE_ANON_KEY', 
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
      description: 'Clé publique anonyme Supabase',
      placeholder: true,
      secret: true
    }
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

  const formatValue = (value, isSecret, isPlaceholder) => {
    if (isSecret && !showKeys) {
      return '••••••••••••••••••••••••••••••••';
    }
    if (isPlaceholder) {
      return value;
    }
    return value;
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Database className="w-6 h-6 text-orange-400 mr-3" />
          <h3 className="text-xl font-bold text-white">🗄️ Front/Supabase (.env)</h3>
        </div>
        <button
          onClick={() => setShowKeys(!showKeys)}
          className="flex items-center text-sm text-teal-200 hover:text-white transition-colors"
        >
          {showKeys ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
          {showKeys ? 'Masquer' : 'Afficher'}
        </button>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm border border-orange-500/20">
        {supabaseVariables?.map(({ key, value, description, secret, placeholder }) => (
          <div key={key} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <span className="text-orange-400 font-medium">{key}</span>
                <span className="text-white mx-2">=</span>
                <span className="text-teal-300">
                  {formatValue(value, secret, placeholder)}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(`${key}=${value}`, key)}
                className="text-white/60 hover:text-orange-400 p-1 rounded transition-colors"
              >
                {copiedField === key ? (
                  <Check className="w-4 h-4 text-orange-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-teal-200/60 ml-0"># {description}</p>
          </div>
        ))}
      </div>

      {/* Security Warning */}
      <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-200 text-sm font-medium mb-1">
              ⚠️ Avertissement de sécurité
            </p>
            <p className="text-red-200/80 text-xs">
              <strong>Jamais exposer de service_role côté front</strong> - Utilisez uniquement 
              la clé anon_key dans les variables d'environnement frontend.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Copy */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <button
          onClick={() => {
            const envContent = supabaseVariables?.map(v => `${v?.key}=${v?.value}`)?.join('\n');
            copyToClipboard(envContent, 'all-frontend');
          }}
          className="flex items-center px-4 py-2 bg-orange-500/20 text-orange-300 text-sm rounded-lg hover:bg-orange-500/30 transition-colors border border-orange-500/30"
        >
          {copiedField === 'all-frontend' ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          Copier variables frontend
        </button>
      </div>
    </div>
  );
};

export default FrontendSupabasePanel;