import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';

/**
 * Hook personnalisé pour faire des requêtes JSON avec gestion d'erreur robuste
 */
function useJson(url) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let cancel = false;
    
    (async () => {
      try {
        const r = await fetch(url, { 
          headers: { 'accept': 'application/json' },
          timeout: 5000
        });
        
        const ct = r?.headers?.get('content-type') || '';
        const isJson = ct?.includes('application/json');
        
        let data;
        if (isJson) {
          data = await r?.json();
        } else {
          // Forcer une structure JSON même si la réponse n'est pas JSON
          data = { 
            ok: false, 
            kind: 'non_json', 
            status: r?.status,
            content_type: ct,
            url: url
          };
        }
        
        if (!cancel) setState({ loading: false, data });
      } catch (e) {
        if (!cancel) {
          setState({ 
            loading: false, 
            data: { 
              ok: false, 
              kind: 'fetch_error', 
              error: String(e?.message || e),
              url: url
            } 
          });
        }
      }
    })();

    return () => { cancel = true; };
  }, [url]);

  return state;
}

/**
 * Composant pour afficher un item de diagnostic avec statut
 */
function DiagnosticItem({ label, state, url }) {
  let data = state?.data;
  const isLoading = state?.loading;
  
  // Déterminer le statut
  let status = 'unknown';
  let icon = AlertTriangle;
  let badgeClass = 'bg-gray-100 text-gray-800';
  let details = '';

  if (isLoading) {
    status = 'LOADING';
    icon = Wifi;
    badgeClass = 'bg-blue-100 text-blue-800';
    details = 'Vérification en cours...';
  } else if (data?.ok === true) {
    status = 'OK';
    icon = CheckCircle;
    badgeClass = 'bg-emerald-100 text-emerald-700';
    details = 'Service accessible et répond correctement';
  } else {
    status = 'CHECK';
    icon = XCircle;
    badgeClass = 'bg-amber-100 text-amber-800';
    
    // Détails d'erreur plus précis
    if (data?.kind === 'fetch_error') {
      details = `Erreur de connexion: ${data?.error}`;
      if (data?.error?.includes('Failed to fetch')) {
        details += ' (Service inaccessible ou CORS)';
      }
    } else if (data?.kind === 'non_json') {
      details = `Réponse non-JSON reçue (${data?.content_type || 'unknown'}) - Status: ${data?.status}`;
    } else {
      details = data?.error || 'Service inaccessible ou erreur inconnue';
    }
  }

  const IconComponent = icon;

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <IconComponent className={`w-5 h-5 ${
          status === 'OK' ? 'text-green-500' :
          status === 'LOADING'? 'text-blue-500 animate-pulse' : 'text-amber-500'
        }`} />
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          {url && (
            <div className="text-xs text-gray-500 font-mono">{url}</div>
          )}
          {details && (
            <div className="text-xs text-gray-600 mt-1 max-w-sm truncate" title={details}>
              {details}
            </div>
          )}
        </div>
      </div>
      <span className={`text-xs px-3 py-1 rounded-full font-medium ${badgeClass}`}>
        {status}
      </span>
    </div>
  );
}

/**
 * Widget de diagnostic système amélioré
 */
export function CoreHealthDiagnostics() {
  const [networkStatus, setNetworkStatus] = useState({ online: true });

  // Tests des endpoints critiques
  const apiHealth = useJson('/api/health');
  const marketHealth = useJson('/api/market/health');
  const rlsCheck = useJson('/internal/rls-check');
  const internalHealth = useJson('/internal/health');

  // Détection du statut réseau
  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus({
        online: navigator.onLine,
        connectionType: navigator?.connection?.effectiveType || 'unknown'
      });
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Calcul du statut global
  const allChecks = [apiHealth, marketHealth, rlsCheck, internalHealth];
  const completedChecks = allChecks?.filter(check => !check?.loading);
  const successfulChecks = completedChecks?.filter(check => check?.data?.ok === true);
  const failedChecks = completedChecks?.filter(check => check?.data?.ok !== true);

  const globalStatus = completedChecks?.length === 0 ? 'loading' :
    successfulChecks?.length === allChecks?.length ? 'healthy' :
    successfulChecks?.length > 0 ? 'partial' : 'critical';

  const globalStatusConfig = {
    loading: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Vérification...' },
    healthy: { color: 'text-green-600', bg: 'bg-green-50', label: 'Système Opérationnel' },
    partial: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Problèmes Détectés' },
    critical: { color: 'text-red-600', bg: 'bg-red-50', label: 'Problèmes Critiques' }
  };

  const currentStatus = globalStatusConfig?.[globalStatus];

  return (
    <div className="p-6 rounded-xl bg-white border shadow-sm">
      {/* Header avec statut global */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            globalStatus === 'healthy' ? 'bg-green-500' :
            globalStatus === 'partial' ? 'bg-amber-500' :
            globalStatus === 'critical'? 'bg-red-500' : 'bg-blue-500 animate-pulse'
          }`} />
          <h3 className="text-lg font-semibold text-gray-900">Diagnostic Système</h3>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus?.bg} ${currentStatus?.color}`}>
          {currentStatus?.label}
        </div>
      </div>
      {/* Indicateur réseau */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        {networkStatus?.online ? (
          <>
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-green-700">En ligne</span>
            {networkStatus?.connectionType && (
              <span className="text-gray-500">({networkStatus?.connectionType})</span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-red-700">Hors ligne</span>
          </>
        )}
      </div>
      {/* Grille de diagnostics */}
      <div className="space-y-3 mb-4">
        <DiagnosticItem 
          label="API Principal" 
          state={apiHealth} 
          url="/api/health" 
        />
        <DiagnosticItem 
          label="Service Market Data" 
          state={marketHealth} 
          url="/api/market/health" 
        />
        <DiagnosticItem 
          label="Contrôle RLS & Sécurité" 
          state={rlsCheck} 
          url="/internal/rls-check" 
        />
        <DiagnosticItem 
          label="Santé Interne" 
          state={internalHealth} 
          url="/internal/health" 
        />
      </div>
      {/* Résumé statistique */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{successfulChecks?.length}</div>
          <div className="text-xs text-gray-500">Services OK</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">{failedChecks?.length}</div>
          <div className="text-xs text-gray-500">Problèmes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{allChecks?.length}</div>
          <div className="text-xs text-gray-500">Total Vérif.</div>
        </div>
      </div>
      {/* Astuce d'investigation */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-800">
          <strong>💡 Astuce Debug:</strong> Si statut "CHECK", ouvrir DevTools &gt; Réseau pour voir les détails de réponse. 
          Toute réponse doit être en JSON pour fonctionner correctement.
        </div>
      </div>
    </div>
  );
}

export default CoreHealthDiagnostics;