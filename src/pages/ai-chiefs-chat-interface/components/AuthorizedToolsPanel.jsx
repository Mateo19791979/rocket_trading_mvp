import React, { useState, useEffect } from 'react';
import { Wrench, Eye, Shield, Activity, CheckCircle, AlertCircle } from 'lucide-react';

const AuthorizedToolsPanel = ({ tools = [] }) => {
  const [toolsData, setToolsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tools?.length > 0) {
      setLoading(true);
      // Add mock usage statistics
      const enrichedTools = tools?.map(tool => ({
        ...tool,
        usage_count: Math.floor(Math.random() * 1000) + 100,
        last_used: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        response_time: Math.floor(Math.random() * 200) + 50,
        success_rate: Math.floor(Math.random() * 10) + 90
      }));
      setToolsData(enrichedTools);
      setLoading(false);
    }
  }, [tools]);

  const getToolIcon = (toolName) => {
    const icons = {
      status: Activity,
      registry: Eye,
      scores: CheckCircle,
      select: Shield,
      allocate: AlertCircle
    };
    return icons?.[toolName] || Wrench;
  };

  const getStatusColor = (isEnabled) => {
    return isEnabled ? 'text-green-400' : 'text-red-400';
  };

  const formatLastUsed = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-teal-400 mb-4 flex items-center">
          <Wrench className="w-5 h-5 mr-2" />
          Outils autorisés (lecture)
        </h2>
        <div className="text-gray-300">Chargement des outils...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold text-teal-400 mb-4 flex items-center">
        <Wrench className="w-5 h-5 mr-2" />
        Outils autorisés (lecture)
      </h2>
      {toolsData?.length === 0 ? (
        <div className="text-gray-400 text-center py-4">
          Aucun outil disponible pour le moment
        </div>
      ) : (
        <div className="space-y-3">
          {toolsData?.map((tool) => {
            const ToolIcon = getToolIcon(tool?.tool_name);
            
            return (
              <div
                key={tool?.id}
                className="p-4 rounded-lg border border-gray-600 bg-gray-700 bg-opacity-30 hover:border-gray-500 transition-all duration-200"
              >
                {/* Tool Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <ToolIcon className={`w-5 h-5 ${getStatusColor(tool?.is_enabled)}`} />
                    <div>
                      <h3 className="font-semibold text-white">/{tool?.tool_name}</h3>
                      <p className="text-sm text-gray-300">{tool?.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Endpoint: {tool?.endpoint_path}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${tool?.is_enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-xs text-gray-400">
                      {tool?.is_enabled ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                {/* Tool Statistics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-600">
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Utilisations</div>
                    <div className="text-sm font-semibold text-white">{tool?.usage_count?.toLocaleString() || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Dernière utilisation</div>
                    <div className="text-sm font-semibold text-blue-400">
                      {tool?.last_used ? formatLastUsed(tool?.last_used) : 'Jamais'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Temps réponse</div>
                    <div className="text-sm font-semibold text-orange-400">{tool?.response_time || 0}ms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Succès</div>
                    <div className="text-sm font-semibold text-green-400">{tool?.success_rate || 0}%</div>
                  </div>
                </div>
                {/* Permissions */}
                {tool?.permissions && Object.keys(tool?.permissions)?.length > 0 && (
                  <div className="mt-3 p-2 bg-blue-900 bg-opacity-20 rounded">
                    <div className="text-xs text-blue-200">
                      <strong>Permissions:</strong>
                      {Object.entries(tool?.permissions)?.map(([key, value]) => (
                        <span key={key} className="ml-2 inline-block">
                          {key}: {value?.toString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Footer Info */}
      <div className="mt-4 p-3 bg-orange-900 bg-opacity-30 rounded-lg">
        <p className="text-xs text-orange-200 leading-relaxed">
          🔒 <strong>Mode lecture seule :</strong> Tous les outils sont configurés en accès lecture uniquement. 
          Aucune modification ou exécution d'ordres n'est autorisée pour garantir la sécurité du système.
        </p>
      </div>
    </div>
  );
};

export default AuthorizedToolsPanel;