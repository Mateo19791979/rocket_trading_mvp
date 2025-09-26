import React, { useState } from 'react';
import { Shield, Lock, CheckCircle, XCircle } from 'lucide-react';

const SecuritySafeguardsPanel = () => {
  const [completedItems, setCompletedItems] = useState({
    rls: false,
    policies: true,
    orders: false,
    audit: true,
    debug: false
  });

  const toggleItem = (key) => {
    setCompletedItems(prev => ({
      ...prev,
      [key]: !prev?.[key]
    }));
  };

  const securityItems = [
    {
      id: 'rls',
      title: 'Activer RLS (Row Level Security) sur tables sensibles',
      description: 'Protection au niveau des lignes pour les données critiques',
      priority: 'high'
    },
    {
      id: 'policies',
      title: 'Policies minimales: lecture filtrée par auth.uid()',
      description: 'Contrôle d\'accès basé sur l\'authentification utilisateur',
      priority: 'high'
    },
    {
      id: 'orders',
      title: '/orders: auth + rate-limit + seuil qty par défaut',
      description: 'Sécurisation des endpoints de trading critiques',
      priority: 'critical'
    },
    {
      id: 'audit',
      title: 'Journalisation (audit) + rotation des logs',
      description: 'Traçabilité complète et gestion des logs',
      priority: 'medium'
    },
    {
      id: 'debug',
      title: 'Désactiver endpoints de debug en prod',
      description: 'Suppression des points d\'entrée de développement',
      priority: 'high'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-teal-400';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    }
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 text-orange-400 mr-3" />
        <h3 className="text-xl font-bold text-white">🛡️ Garde-fous sécurité</h3>
      </div>
      <div className="space-y-4">
        {securityItems?.map(({ id, title, description, priority }) => (
          <div
            key={id}
            className="bg-gray-900/30 rounded-lg p-4 border border-gray-600/30 hover:border-orange-500/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                <button
                  onClick={() => toggleItem(id)}
                  className="mr-3 mt-0.5 text-white hover:text-orange-400 transition-colors"
                >
                  {completedItems?.[id] ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-medium ${completedItems?.[id] ? 'text-white line-through' : 'text-white'}`}>
                      {title}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityBadge(priority)} font-medium`}>
                      {priority?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-teal-200/70">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Progress Summary */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-teal-200">
            <Lock className="w-4 h-4 mr-2" />
            <span>
              Progression: {Object.values(completedItems)?.filter(Boolean)?.length} / {securityItems?.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-teal-500 transition-all duration-300"
                style={{
                  width: `${(Object.values(completedItems)?.filter(Boolean)?.length / securityItems?.length) * 100}%`
                }}
              />
            </div>
            <span className="text-xs text-teal-200 font-medium">
              {Math.round((Object.values(completedItems)?.filter(Boolean)?.length / securityItems?.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySafeguardsPanel;