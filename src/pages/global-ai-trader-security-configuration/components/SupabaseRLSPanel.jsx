import React, { useState } from 'react';
import { Database, Lock, Shield, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

const SupabaseRLSPanel = () => {
  const [rlsStatus, setRlsStatus] = useState({
    enabled: true,
    policies: {
      user_profiles: true,
      trading_positions: true,
      order_history: false,
      ai_agents: true,
      market_data: true
    }
  });

  const [backendRole, setBackendRole] = useState({
    configured: true,
    permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
  });

  const toggleRLS = (table) => {
    setRlsStatus({
      ...rlsStatus,
      policies: {
        ...rlsStatus?.policies,
        [table]: !rlsStatus?.policies?.[table]
      }
    });
  };

  const sensitiveData = [
    {
      table: 'user_profiles',
      description: 'Profils utilisateur et paramètres personnels',
      policy: 'auth.uid() = user_id',
      risk: 'high'
    },
    {
      table: 'trading_positions',
      description: 'Positions de trading actives',
      policy: 'auth.uid() = user_id',
      risk: 'critical'
    },
    {
      table: 'order_history',
      description: 'Historique des ordres exécutés',
      policy: 'auth.uid() = user_id AND created_at > now() - interval \'30 days\'',
      risk: 'high'
    },
    {
      table: 'ai_agents',
      description: 'Configuration des agents IA',
      policy: 'auth.uid() = owner_id OR role = \'admin\'',
      risk: 'medium'
    },
    {
      table: 'market_data',
      description: 'Données de marché en temps réel',
      policy: 'authenticated',
      risk: 'low'
    }
  ];

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'critical': return 'text-red-400 bg-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center mb-6">
        <Database className="w-6 h-6 text-white mr-3" />
        <h3 className="text-xl font-bold text-white">Supabase (RLS)</h3>
      </div>
      {/* RLS Master Toggle */}
      <div className="mb-6 bg-white/10 rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-white mr-2" />
            <span className="font-semibold text-white">Row Level Security</span>
          </div>
          <div className={`w-3 h-3 rounded-full ${rlsStatus?.enabled ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
        </div>
        <p className="text-sm text-orange-100 mt-2">
          Activer RLS sur toutes les tables sensibles pour la sécurité des données
        </p>
      </div>
      {/* Tables & Policies */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Policies par table
        </h4>
        <div className="space-y-3">
          {sensitiveData?.map((item) => (
            <div key={item?.table} className="bg-white/10 rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-mono text-white text-sm">{item?.table}</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getRiskColor(item?.risk)}`}>
                    {item?.risk}
                  </span>
                </div>
                <button
                  onClick={() => toggleRLS(item?.table)}
                  className="flex items-center"
                >
                  {rlsStatus?.policies?.[item?.table] ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-orange-100 mb-2">{item?.description}</p>
              <code className="text-xs text-orange-200 bg-black/30 px-2 py-1 rounded block">
                {item?.policy}
              </code>
            </div>
          ))}
        </div>
      </div>
      {/* Backend Role Configuration */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
        <div className="flex items-center mb-3">
          <Zap className="w-5 h-5 text-yellow-400 mr-2" />
          <h5 className="font-semibold text-white">Backend Server Role</h5>
          <div className={`ml-auto w-3 h-3 rounded-full ${backendRole?.configured ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
        </div>
        <div className="mb-3">
          <p className="text-sm text-orange-100 mb-2">
            Opérations sensibles (secrets IBKR) via backend role serveur
          </p>
          <div className="flex flex-wrap gap-2">
            {backendRole?.permissions?.map(permission => (
              <span key={permission} className="px-2 py-1 bg-white/20 text-white text-xs rounded">
                {permission}
              </span>
            ))}
          </div>
        </div>
        <div className="text-xs text-orange-200">
          <p>• Accès direct aux secrets IBKR via variables d'environnement serveur</p>
          <p>• Bypass RLS pour les opérations système critiques</p>
          <p>• Audit complet des actions backend</p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseRLSPanel;