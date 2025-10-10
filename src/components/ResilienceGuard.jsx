import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import Icon from '@/components/AppIcon';


function Badge({ label, state, icon: Icon }) {
  const getStateClass = () => {
    switch (state) {
      case 'UP': return 'badge bg-green-500/20 border-green-500/30 text-green-300';
      case 'DOWN': return 'badge bg-red-500/20 border-red-500/30 text-red-300';
      case 'DEGRADED': return 'badge bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      default: return 'badge bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm ${getStateClass()}`}>
      {Icon && <Icon className="w-4 h-4" />}
      <div>
        <div className="font-bold text-xs">{label}</div>
        <div className="text-xs opacity-75">{state}</div>
      </div>
    </div>
  );
}

function SystemHealthIndicators() {
  const [status, setStatus] = useState({
    api: '?',
    market: '?',
    ws: '?',
    db: '?',
    supabase: '?'
  });

  const [lastUpdate, setLastUpdate] = useState(null);
  const [safeMode, setSafeMode] = useState(false);

  useEffect(() => {
    const checkSafeMode = () => {
      const isSafe = localStorage.getItem('SAFE_MODE') === '1';
      setSafeMode(isSafe);
    };

    checkSafeMode();
    const interval = setInterval(checkSafeMode, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pingService = async (name, url, timeout = 5000) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller?.abort(), timeout);
        
        const response = await fetch(url, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
          signal: controller?.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response?.ok) {
          setStatus(prev => ({ ...prev, [name]: 'UP' }));
        } else {
          setStatus(prev => ({ ...prev, [name]: response?.status >= 500 ? 'DOWN' : 'DEGRADED' }));
        }
      } catch (error) {
        console.warn(`[ResilienceGuard] ${name} health check failed:`, error?.message);
        setStatus(prev => ({ ...prev, [name]: 'DOWN' }));
      }
    };

    const runHealthChecks = async () => {
      console.log('[ResilienceGuard] Running system health checks...');
      
      // API Health Check
      await pingService('api', '/health');
      
      // Market Data Health Check
      await pingService('market', '/market/health');
      
      // WebSocket Health Check
      await pingService('ws', '/ws/health');
      
      // Database Health Check (via API)
      await pingService('db', '/api/health/database');
      
      // Supabase Health Check (direct)
      try {
        if (typeof window !== 'undefined' && window.supabase) {
          const { data, error } = await window.supabase?.from('ai_agents')?.select('count', { count: 'exact', head: true });
          
          if (error) {
            setStatus(prev => ({ ...prev, supabase: 'DEGRADED' }));
          } else {
            setStatus(prev => ({ ...prev, supabase: 'UP' }));
          }
        } else {
          setStatus(prev => ({ ...prev, supabase: '?' }));
        }
      } catch (error) {
        console.warn('[ResilienceGuard] Supabase health check failed:', error?.message);
        setStatus(prev => ({ ...prev, supabase: 'DOWN' }));
      }
      
      setLastUpdate(new Date()?.toLocaleTimeString());
    };

    // Initial check
    runHealthChecks();
    
    // Regular health checks every 30 seconds
    const healthCheckInterval = setInterval(runHealthChecks, 30000);
    
    return () => {
      clearInterval(healthCheckInterval);
    };
  }, []);

  const getOverallHealth = () => {
    const values = Object.values(status);
    if (values?.includes('DOWN')) return 'DEGRADED';
    if (values?.includes('DEGRADED')) return 'DEGRADED';
    if (values?.every(s => s === 'UP')) return 'HEALTHY';
    return 'CHECKING';
  };

  const overallHealth = getOverallHealth();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">System Resilience</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {overallHealth === 'HEALTHY' ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : overallHealth === 'DEGRADED' ? (
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-xs font-medium ${
            overallHealth === 'HEALTHY' ? 'text-green-300' :
            overallHealth === 'DEGRADED' ? 'text-yellow-300' : 'text-red-300'
          }`}>
            {overallHealth}
          </span>
        </div>
      </div>
      {safeMode && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-300 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">SAFE MODE ACTIVE</span>
          </div>
          <p className="text-xs text-yellow-200 mt-1">
            L'application fonctionne en mode dégradé pour assurer la stabilité.
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Badge label="API" state={status?.api} />
        <Badge label="Market" state={status?.market} />
        <Badge label="WebSocket" state={status?.ws} />
        <Badge label="Database" state={status?.db} />
        <Badge label="Supabase" state={status?.supabase} />
      </div>
      {lastUpdate && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-600/30">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400">
            Dernière vérification: {lastUpdate}
          </span>
        </div>
      )}
    </div>
  );
}

// Enhanced resilience controls
function ResilienceControls({ onEmergencyAction }) {
  const [safeMode, setSafeMode] = useState(false);

  useEffect(() => {
    const checkSafeMode = () => {
      const isSafe = localStorage.getItem('SAFE_MODE') === '1';
      setSafeMode(isSafe);
    };

    checkSafeMode();
    const interval = setInterval(checkSafeMode, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleToggleSafeMode = () => {
    if (safeMode) {
      localStorage.removeItem('SAFE_MODE');
      setSafeMode(false);
      window.location?.reload();
    } else {
      localStorage.setItem('SAFE_MODE', '1');
      setSafeMode(true);
      if (onEmergencyAction) {
        onEmergencyAction('SAFE_MODE_ACTIVATED');
      }
      window.location?.reload();
    }
  };

  const handleEmergencyReload = () => {
    if (onEmergencyAction) {
      onEmergencyAction('EMERGENCY_RELOAD');
    }
    window.location?.reload();
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-red-400" />
        Emergency Controls
      </h3>
      
      <div className="space-y-3">
        <button
          onClick={handleToggleSafeMode}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
            safeMode 
              ? 'bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-300' :'bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/40 text-yellow-300'
          }`}
        >
          {safeMode ? 'Désactiver SAFE MODE' : 'Activer SAFE MODE'}
        </button>
        
        <button
          onClick={handleEmergencyReload}
          className="w-full py-3 px-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-lg text-blue-300 font-medium transition-all duration-200 hover:scale-105"
        >
          Rechargement d'urgence
        </button>
      </div>
    </div>
  );
}

// Main export object
const ResilienceGuard = {
  SystemHealthIndicators,
  ResilienceControls,
  Badge
};

export default ResilienceGuard;