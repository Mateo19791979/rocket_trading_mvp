import React from 'react';
import { Wrench, AlertTriangle, TrendingUp } from 'lucide-react';
import RecoveryPipelinePanel from './components/RecoveryPipelinePanel';
import ProgressDashboard from './components/ProgressDashboard';
import PerformanceMonitoring from './components/PerformanceMonitoring';

const ProductionReadinessRecoveryCenter = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Production Readiness Recovery Center</h1>
              <p className="text-red-100 text-lg mt-2">
                Plan d'action priorisé en 5 étapes - Récupération 94% → 100%
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-200" />
                <span className="text-2xl font-bold">-4%</span>
              </div>
              <p className="text-red-200 text-sm">Régression détectée</p>
            </div>
          </div>
          
          {/* Status Banner */}
          <div className="mt-4 bg-red-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">🚨 Status: Récupération Active</h2>
                <p className="text-red-100 text-sm">
                  Régression critique 98% → 94% - Erreurs RLS bloquent synchronisation IA
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">ETA: 4 jours</p>
                <p className="text-red-200 text-sm">Production Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Recovery Pipeline */}
        <div className="col-span-12 lg:col-span-4">
          <RecoveryPipelinePanel />
        </div>

        {/* Center Column - Progress Dashboard */}
        <div className="col-span-12 lg:col-span-4">
          <ProgressDashboard />
        </div>

        {/* Right Column - Performance Monitoring */}
        <div className="col-span-12 lg:col-span-4">
          <PerformanceMonitoring />
        </div>
      </div>

      {/* Critical Action Items */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h3 className="text-xl font-bold text-gray-900">Actions Critiques Immédiates</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <h4 className="font-semibold text-red-800 mb-2">🔹 1) Corriger RLS (Bloquant)</h4>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• autoriser les IA à insérer leurs logs d'état</li>
              <li>• alter policy "ai_insert_logs" on logs_ai for insert to system_ai</li>
              <li>• Lecture publique sur les vues agrégées</li>
              <li>• Vérifier select auth.uid() pour chaque agent IA</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">🔹 2) Tests E2E Automatisés</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Page dashboard → chargement quotes OK (&lt; 2 s)</li>
              <li>• Ingestion AltData → latence &lt; 800 ms</li>
              <li>• API InfoHunter → payload valide CMV & Wilshire</li>
              <li>• RAG → réponse embedding &gt; 3 résultats</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🔹 3) Performance Tuning</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Active compression Brotli + cache CDN Cloudflare</li>
              <li>• Limite max_clients=1000 sur WS Bridge</li>
              <li>• Scaling horizontal au-delà</li>
              <li>• Viser &lt; 700 ms p95 avec k6.quotes-ws.js</li>
            </ul>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
            <h4 className="font-semibold text-purple-800 mb-2">🔹 4) Sécurité Finale</h4>
            <ul className="text-purple-700 text-sm space-y-1">
              <li>• Importer middlewares Traefik (sec-headers, rateLimit)</li>
              <li>• npm audit fix --production</li>
              <li>• Vérifier via ZAP → aucune alerte High/Critical</li>
              <li>• SSL test → showcerts trading-mvp.com:443</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Criteria */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">🧩 Critères de Succès - 100% Production Ready</h3>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="font-semibold text-green-800">RLS</p>
            <p className="text-2xl font-bold text-green-600">OK</p>
            <p className="text-xs text-green-600">Policies validées</p>
          </div>
          
          <div className="text-center">
            <p className="font-semibold text-blue-800">E2E</p>
            <p className="text-2xl font-bold text-blue-600">100%</p>
            <p className="text-xs text-blue-600">Tests passés</p>
          </div>
          
          <div className="text-center">
            <p className="font-semibold text-yellow-800">p95</p>
            <p className="text-2xl font-bold text-yellow-600">&lt;700ms</p>
            <p className="text-xs text-yellow-600">Latence HTTP</p>
          </div>
          
          <div className="text-center">
            <p className="font-semibold text-purple-800">TLS</p>
            <p className="text-2xl font-bold text-purple-600">A+</p>
            <p className="text-xs text-purple-600">SSL Labs</p>
          </div>
          
          <div className="text-center">
            <p className="font-semibold text-indigo-800">Monitor</p>
            <p className="text-2xl font-bold text-indigo-600">0</p>
            <p className="text-xs text-indigo-600">Erreurs &gt; 5min</p>
          </div>
          
          <div className="text-center">
            <p className="font-semibold text-green-800">Status</p>
            <p className="text-2xl font-bold text-green-600">100%</p>
            <p className="text-xs text-green-600">Production Ready</p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-gray-900">
            ➡️ <span className="text-green-600">Rocket Trading MVP</span> = 
            <span className="text-green-600 font-bold"> 100% Production Ready</span> 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductionReadinessRecoveryCenter;