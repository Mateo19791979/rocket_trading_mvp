import React, { useState, useEffect } from 'react';
import { Activity, Shield, TrendingUp, Globe, Database, Wifi, Server } from 'lucide-react';
import AppErrorBoundary from '../components/AppErrorBoundary';

// Interface HomeLite simplifiée - Style 7h du matin restauré
export default function HomeLite() {
  const [systemStatus, setSystemStatus] = useState({
    api: 'UP',
    market: 'UP',
    websocket: 'UP',
    timestamp: new Date()?.toLocaleString('fr-FR')
  });

  const [safeMode] = useState(false); // Pas de SAFE_MODE par défaut comme à 7h

  useEffect(() => {
    // Ping de statut simple - style 7h
    const checkStatus = async () => {
      try {
        const responses = await Promise.allSettled([
          fetch('/health', { cache: 'no-store' }),
          fetch('/market/health', { cache: 'no-store' }),
          fetch('/ws/health', { cache: 'no-store' })
        ]);

        setSystemStatus({
          api: responses?.[0]?.value?.ok ? 'UP' : 'DOWN',
          market: responses?.[1]?.value?.ok ? 'UP' : 'DOWN', 
          websocket: responses?.[2]?.value?.ok ? 'UP' : 'DOWN',
          timestamp: new Date()?.toLocaleString('fr-FR')
        });
      } catch (error) {
        console.log('[HomeLite] Status check error:', error);
      }
    };

    // Check initial puis toutes les 30s
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* HUD Style 7h - Header noir avec badges */}
        <div className="bg-gray-900 text-white px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold">Système Trading</span>
              </div>
              
              {/* Badges de statut - Design original 7h */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-600">
                  <Database className="w-4 h-4" />
                  <span className="text-sm">API</span>
                  <span className={`text-sm font-bold ${systemStatus?.api === 'UP' ? 'text-green-400' : 'text-red-400'}`}>
                    {systemStatus?.api}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">MARKET</span>
                  <span className={`text-sm font-bold ${systemStatus?.market === 'UP' ? 'text-green-400' : 'text-red-400'}`}>
                    {systemStatus?.market}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">WS</span>
                  <span className={`text-sm font-bold ${systemStatus?.websocket === 'UP' ? 'text-green-400' : 'text-red-400'}`}>
                    {systemStatus?.websocket}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-300">
              Dernière vérification: {systemStatus?.timestamp}
            </div>
          </div>
        </div>

        {/* Contenu principal - Style épuré 7h */}
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Centre de Surveillance Trading
            </h1>
            <p className="text-gray-600">
              Interface restaurée exactement comme ce matin à 7h - 10/10/2025
            </p>
          </div>

          {/* Grille de statut - Layout 7h */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">API Status</h3>
                <Server className="w-5 h-5 text-blue-500" />
              </div>
              <div className={`text-2xl font-bold ${systemStatus?.api === 'UP' ? 'text-green-600' : 'text-red-600'}`}>
                {systemStatus?.api}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Endpoints de données actifs
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Market Data</h3>
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div className={`text-2xl font-bold ${systemStatus?.market === 'UP' ? 'text-green-600' : 'text-red-600'}`}>
                {systemStatus?.market}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Flux de données marché
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">WebSocket</h3>
                <Wifi className="w-5 h-5 text-purple-500" />
              </div>
              <div className={`text-2xl font-bold ${systemStatus?.websocket === 'UP' ? 'text-green-600' : 'text-red-600'}`}>
                {systemStatus?.websocket}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Connexions temps réel
              </p>
            </div>
          </div>

          {/* Navigation régionale - Style simplifié 7h */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              Navigation Régionale
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="#/region/eu" 
                className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div>
                  <div className="font-medium text-blue-900">🇪🇺 Europe</div>
                  <div className="text-sm text-blue-700">Centre régional EU</div>
                </div>
                <div className="text-sm text-blue-600">8 agents</div>
              </a>
              
              <a 
                href="#/region/us" 
                className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div>
                  <div className="font-medium text-green-900">🇺🇸 États-Unis</div>
                  <div className="text-sm text-green-700">Centre régional US</div>
                </div>
                <div className="text-sm text-green-600">8 agents</div>
              </a>
              
              <a 
                href="#/region/as" 
                className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div>
                  <div className="font-medium text-orange-900">🌏 Asie</div>
                  <div className="text-sm text-orange-700">Centre régional AS</div>
                </div>
                <div className="text-sm text-orange-600">8 agents</div>
              </a>
            </div>
          </div>

          {/* Footer - Info build */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Interface restaurée : Design 7h du matin • 10 octobre 2025 • Build stable
          </div>
        </div>
      </div>
    </AppErrorBoundary>
  );
}