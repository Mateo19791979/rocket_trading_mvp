import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Key, BarChart3, Zap } from 'lucide-react';

const providerInfo = {
  finnhub: {
    name: 'Finnhub',
    description: 'Real-time stock data & fundamentals',
    color: 'from-blue-600 to-blue-500',
    icon: BarChart3,
    features: ['Stock quotes', 'Company fundamentals', 'News feeds'],
    defaultQuota: 60
  },
  alpha_vantage: {
    name: 'Alpha Vantage',
    description: 'Historical data & technical indicators',
    color: 'from-green-600 to-green-500',
    icon: Activity,
    features: ['Historical data', 'Technical indicators', 'Forex data'],
    defaultQuota: 5
  },
  twelvedata: {
    name: 'TwelveData',
    description: 'Global market data & options',
    color: 'from-purple-600 to-purple-500',
    icon: Zap,
    features: ['Global stocks', 'Options data', 'Crypto data'],
    defaultQuota: 800
  }
};

export default function ProviderConfigurationPanel({ providers, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)]?.map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeProviders = Object.values(providers)?.filter(p => p?.is_active)?.length || 0;
  const totalProviders = Object.keys(providerInfo)?.length;

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Configuration Providers</h2>
          <div className="text-sm text-gray-400">
            {activeProviders}/{totalProviders} actifs
          </div>
        </div>
        
        {/* Overall Provider Status */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-300">Connectivité API</span>
              <span className="text-white font-medium">{Math.round((activeProviders / totalProviders) * 100)}%</span>
            </div>
            <div className="bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(activeProviders / totalProviders) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Provider Cards */}
      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(providerInfo)?.map(([key, info]) => {
            const provider = providers?.[key] || { api_name: key, is_active: false };
            const ProviderIcon = info?.icon;
            
            return (
              <div 
                key={key}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  provider?.is_active 
                    ? 'border-green-500/30 bg-green-500/5' :'border-gray-600 bg-gray-750 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Provider Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${info?.color} flex items-center justify-center flex-shrink-0`}>
                    <ProviderIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {info?.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {info?.description}
                        </p>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                        provider?.is_active
                          ? 'text-green-400 bg-green-500/20' :'text-gray-400 bg-gray-500/20'
                      }`}>
                        {provider?.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Actif</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Configuration requise</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {info?.features?.map((feature, idx) => (
                        <span 
                          key={idx}
                          className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Configuration Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                          <Key className="w-3 h-3" />
                          <span>API Key</span>
                        </div>
                        <div className="text-xs">
                          {provider?.api_key_encrypted ? (
                            <span className="text-green-400">Configurée</span>
                          ) : (
                            <span className="text-yellow-400">Non configurée</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                          <BarChart3 className="w-3 h-3" />
                          <span>Quota/Latence</span>
                        </div>
                        <div className="text-xs">
                          {provider?.is_active ? (
                            <span className="text-white">
                              {provider?.rate_limit_per_minute || info?.defaultQuota}/min
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Today's Usage */}
                    {provider?.is_active && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Utilisation aujourd'hui</span>
                          <span className="text-white font-medium">
                            {provider?.total_calls_today || 0} appels
                          </span>
                        </div>
                        <div className="mt-1 bg-gray-700 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full bg-gradient-to-r ${info?.color} transition-all duration-300`}
                            style={{ 
                              width: `${Math.min((provider?.total_calls_today || 0) / (provider?.rate_limit_per_minute * 60) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        
                        {provider?.last_successful_call && (
                          <div className="text-xs text-gray-500 mt-1">
                            Dernier appel: {new Date(provider?.last_successful_call)?.toLocaleTimeString('fr-FR')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Required */}
                    {!provider?.is_active && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="flex items-center space-x-2 text-yellow-400 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Clé API requise pour l'activation</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Google Sheets Fallback Info */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-blue-300 font-medium">Google Sheets Fallback</h4>
              <p className="text-blue-200 text-sm">
                Système de secours automatique en cas de panne des providers principaux
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}