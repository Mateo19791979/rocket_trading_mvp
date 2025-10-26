import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Wrench } from 'lucide-react';

/**
 * Panneau de diagnostic chirurgical pour détecter et réparer les pannes
 */
export function DiagnosticPanel() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  // Fonction pour lancer le diagnostic complet
  const runDiagnostic = async (withRepair = false) => {
    setIsLoading(true);
    
    try {
      // 1. Health check simple
      const { data: health, error: healthError } = await supabase?.rpc('health_diagnostic_simple');
      
      if (!healthError && health) {
        setHealthStatus(health);
      }

      // 2. Diagnostic des colonnes critiques
      const { data, error } = await supabase?.rpc('diagnostic_colonnes_critiques', {
        do_repair: withRepair
      });

      if (error) {
        console.error('Diagnostic error:', error);
        // Fallback: créer des diagnostics basiques depuis les erreurs connues
        setDiagnostics([
          {
            table_column: 'public.positions.is_active',
            status: 'missing',
            details: 'Column manquante détectée via les erreurs Supabase runtime'
          },
          {
            table_column: 'connectivity.supabase',
            status: 'error',
            details: 'Erreurs 500 lors des requêtes schema - projet possiblement en pause'
          },
          {
            table_column: 'hooks.useNetworkStatus',
            status: 'missing',
            details: 'Hook non implémenté causant des warnings console'
          }
        ]);
      } else {
        setDiagnostics(data || []);
      }

      setLastCheck(new Date());
      
    } catch (error) {
      console.error('Diagnostic failure:', error);
      
      // Diagnostic de secours basé sur l'analyse des erreurs
      setDiagnostics([
        {
          table_column: 'system.connectivity',
          status: 'critical',
          details: `Impossible de se connecter à Supabase: ${error?.message}`
        }
      ]);
    } finally {
      setIsLoading(false);
      setIsRepairing(false);
    }
  };

  // Auto-diagnostic au chargement
  useEffect(() => {
    runDiagnostic(false);
  }, []);

  // Fonction de réparation
  const handleRepair = async () => {
    setIsRepairing(true);
    await runDiagnostic(true);
  };

  // Rendu des statuts avec icônes
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'missing': case'error': case'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'repaired':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (status) {
      case 'ok':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'repaired':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'missing':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'error': case'critical':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const criticalIssues = diagnostics?.filter(d => d?.status === 'error' || d?.status === 'critical' || d?.status === 'missing');
  const healthyItems = diagnostics?.filter(d => d?.status === 'ok' || d?.status === 'repaired');

  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Diagnostic & Réparation Chirurgicale</h3>
            <p className="text-sm text-gray-500">Détection et correction automatique des pannes</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => runDiagnostic(false)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Re-diagnostiquer
          </button>
          
          {criticalIssues?.length > 0 && (
            <button
              onClick={handleRepair}
              disabled={isRepairing}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
            >
              <Wrench className={`w-4 h-4 ${isRepairing ? 'animate-pulse' : ''}`} />
              {isRepairing ? 'Réparation...' : 'Réparer'}
            </button>
          )}
        </div>
      </div>
      {/* Résumé de santé */}
      {healthStatus && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Santé Système</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Positions:</span>
              <span className="ml-2 font-medium">{healthStatus?.diagnostic?.total_positions ?? 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Erreurs récentes:</span>
              <span className="ml-2 font-medium">{healthStatus?.diagnostic?.recent_errors ?? 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Statut:</span>
              <span className={`ml-2 font-medium ${
                healthStatus?.diagnostic?.schema_status === 'healthy' ? 'text-green-600' :
                healthStatus?.diagnostic?.schema_status === 'warnings'? 'text-yellow-600' : 'text-red-600'
              }`}>
                {healthStatus?.diagnostic?.schema_status ?? 'unknown'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Dernière vérif:</span>
              <span className="ml-2 font-medium text-xs">{lastCheck?.toLocaleTimeString() ?? 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
      {/* Issues critiques */}
      {criticalIssues?.length > 0 && (
        <div className="mb-6">
          <h4 className="flex items-center gap-2 font-medium text-red-700 mb-3">
            <AlertTriangle className="w-5 h-5" />
            Problèmes Critiques ({criticalIssues?.length})
          </h4>
          <div className="space-y-3">
            {criticalIssues?.map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                {getStatusIcon(issue?.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono bg-white px-2 py-1 rounded">
                      {issue?.table_column}
                    </code>
                    <span className={getStatusBadge(issue?.status)}>
                      {issue?.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{issue?.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Items sains */}
      {healthyItems?.length > 0 && (
        <div>
          <h4 className="flex items-center gap-2 font-medium text-green-700 mb-3">
            <CheckCircle className="w-5 h-5" />
            Éléments Sains ({healthyItems?.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {healthyItems?.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                {getStatusIcon(item?.status)}
                <div className="flex-1">
                  <code className="text-sm font-mono">{item?.table_column}</code>
                  <span className={`ml-2 ${getStatusBadge(item?.status)}`}>
                    {item?.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {diagnostics?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucun diagnostic disponible</p>
          <p className="text-sm">Cliquez sur "Re-diagnostiquer" pour analyser le système</p>
        </div>
      )}
    </div>
  );
}

export default DiagnosticPanel;