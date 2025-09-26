import React, { useState } from 'react';
import { Key, Copy, Check, Server, Globe2 } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const BackendVariablesPanel = () => {
  const [copiedField, setCopiedField] = useState(null);

  const backendVariables = [
    { key: 'PORT', value: '8080', description: 'Port du serveur backend' },
    { key: 'CORS_ORIGIN', value: 'https://trading-mvp.com', description: 'Origine autorisée pour CORS' },
    { key: 'LOG_LEVEL', value: 'info', description: 'Niveau de journalisation' },
    { key: 'RATE_LIMIT_ORDERS', value: '30/min', description: 'Limitation des ordres par minute' }
  ];

  const ibkrVariables = [
    { key: 'IB_HOST', value: '127.0.0.1', description: 'Adresse IP du serveur IBKR' },
    { key: 'IB_PORT', value: '7497', description: 'Port de connexion IBKR' },
    { key: 'IB_CLIENT_ID', value: '42', description: 'Identifiant client IBKR' }
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

  const VariableSection = ({ title, variables, icon: Icon, subtitle = null }) => (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 text-orange-400 mr-2" />
        <h4 className="text-lg font-semibold text-white">{title}</h4>
      </div>
      {subtitle && (
        <p className="text-sm text-teal-200/70 mb-3 ml-7">{subtitle}</p>
      )}
      <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm border border-orange-500/20">
        {variables?.map(({ key, value, description }) => (
          <div key={key} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <span className="text-orange-400 font-medium">{key}</span>
                <span className="text-white mx-2">=</span>
                <span className="text-teal-300">{value}</span>
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
    </div>
  );

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center mb-6">
        <Key className="w-6 h-6 text-orange-400 mr-3" />
        <h3 className="text-xl font-bold text-white">🔑 Variables backend (.env)</h3>
      </div>

      <VariableSection 
        title="Configuration principale"
        variables={backendVariables}
        icon={Server}
      />

      <VariableSection 
        title="IBKR (si lecture marché/ordres)"
        variables={ibkrVariables}
        icon={Globe2}
        subtitle="Configuration Interactive Brokers pour données de marché"
      />

      {/* Quick Copy All */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <button
          onClick={() => {
            const allVars = [...backendVariables, ...ibkrVariables];
            const envContent = allVars?.map(v => `${v?.key}=${v?.value}`)?.join('\n');
            copyToClipboard(envContent, 'all-backend');
          }}
          className="flex items-center px-4 py-2 bg-orange-500/20 text-orange-300 text-sm rounded-lg hover:bg-orange-500/30 transition-colors border border-orange-500/30"
        >
          {copiedField === 'all-backend' ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          Copier toutes les variables backend
        </button>
      </div>
    </div>
  );
};

export default BackendVariablesPanel;