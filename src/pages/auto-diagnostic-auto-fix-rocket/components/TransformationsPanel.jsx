import React, { useState } from 'react';
import { RefreshCw, Code2, Settings, Globe, CheckCircle } from 'lucide-react';

export default function TransformationsPanel({ diagnosticState }) {
  const [activeTab, setActiveTab] = useState('frontend');

  const transformationSteps = {
    frontend: {
      title: "Renommer les appels front",
      icon: <Code2 className="w-5 h-5" />,
      code: `// AVANT (problématique)
Be.getAgentsOverview()
  .then(data => displayCards(data));

// APRÈS (transformé)  
const fetchAgentsData = async () => {
  const API = "https://api.trading-mvp.com";
  const [status, registry, scores, select, allocate] = await Promise.all([
    fetch(API + "/status").then(r => r.json()),
    fetch(API + "/registry").then(r => r.json()),
    fetch(API + "/scores?window=252").then(r => r.json()),
    fetch(API + "/select").then(r => r.json()),
    fetch(API + "/allocate").then(r => r.json())
  ]);
  return { status, registry, scores, select, allocate };
};

fetchAgentsData().then(data => displayCards(data));`
    },
    module: {
      title: "Export correct (si module local)",
      icon: <Settings className="w-5 h-5" />,
      code: `// Module d'export correct
export async function getAgentsOverview() {
  const API = "https://api.trading-mvp.com";
  try {
    const [status, registry, scores, select, allocate] = await Promise.all([
      fetch(API + "/status", {mode: "cors"}),
      fetch(API + "/registry", {mode: "cors"}),
      fetch(API + "/scores?window=252", {mode: "cors"}),
      fetch(API + "/select", {mode: "cors"}),
      fetch(API + "/allocate", {mode: "cors"})
    ].map(p => p.then(r => r.ok ? r.json() : Promise.reject(r.status))));
    
    return { status, registry, scores, select, allocate };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Exposition globale pour compatibilité
window.Be = { getAgentsOverview };`
    },
    cors: {
      title: "Traefik / CORS",
      icon: <Globe className="w-5 h-5" />,
      code: `# Configuration Traefik (docker-compose.yml)
services:
  traefik:
    labels:
      - "traefik.http.routers.api.rule=Host(\`api.trading-mvp.com\`)"
      - "traefik.http.routers.api.tls=true" -"traefik.http.routers.api.tls.certresolver=letsencrypt"

# Backend CORS Configuration
app.use(cors({
  origin: [
    'https://trading-mvp.com',
    'https://www.trading-mvp.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

# Headers de sécurité
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://trading-mvp.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});`
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-teal-400 flex items-center gap-2">
          <RefreshCw className="w-6 h-6" />
          3) Transformations (si besoin)
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            diagnosticState?.apiEndpointsOk ? 'bg-green-400' : 'bg-yellow-400'
          }`}></div>
          <span className="text-sm text-gray-300">
            {diagnosticState?.apiEndpointsOk ? 'Endpoints OK' : 'En cours...'}
          </span>
        </div>
      </div>
      {/* Onglets de transformation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(transformationSteps)?.map(([key, step]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-teal-600 text-white' :'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {step?.icon}
            {key === 'frontend' ? 'Frontend' : key === 'module' ? 'Module' : 'CORS/Traefik'}
          </button>
        ))}
      </div>
      {/* Contenu de l'onglet actif */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-white font-semibold">
            • {transformationSteps?.[activeTab]?.title}
          </h4>
          {activeTab === 'cors' && diagnosticState?.corsHttpsOk && (
            <CheckCircle className="w-4 h-4 text-green-400" />
          )}
        </div>

        {/* Code d'exemple */}
        <div className="bg-black/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">
                {activeTab === 'frontend' ? 'Transformation des appels' :
                 activeTab === 'module' ? 'Module d\'export standardisé' :
                 'Configuration serveur & réseau'}
              </span>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(transformationSteps?.[activeTab]?.code)}
              className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded transition-colors"
            >
              Copier
            </button>
          </div>
          <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
            {transformationSteps?.[activeTab]?.code}
          </pre>
        </div>

        {/* Conseils spécifiques */}
        <div className="p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
          <h5 className="text-blue-300 font-semibold mb-2 text-sm">
            {activeTab === 'frontend' ? 'Bonnes pratiques Frontend :' :
             activeTab === 'module'? 'Configuration Module :' : 'Configuration Réseau :'}
          </h5>
          <div className="text-xs text-blue-200 space-y-1">
            {activeTab === 'frontend' && (
              <>
                <div>• Remplacer tous les appels <code className="bg-slate-700 px-1 rounded">Be.getAgentsOverview()</code></div>
                <div>• Utiliser async/await pour une meilleure gestion d'erreurs</div>
                <div>• Ajouter timeout et retry logic pour la robustesse</div>
              </>
            )}
            {activeTab === 'module' && (
              <>
                <div>• Export ES6 standard pour modules</div>
                <div>• Exposition <code className="bg-slate-700 px-1 rounded">window.Be</code> pour compatibilité legacy</div>
                <div>• Gestion d'erreurs avec try/catch et logging</div>
              </>
            )}
            {activeTab === 'cors' && (
              <>
                <div>• Host Traefik : <code className="bg-slate-700 px-1 rounded">api.trading-mvp.com</code> (exact)</div>
                <div>• Origin CORS : <code className="bg-slate-700 px-1 rounded">https://trading-mvp.com</code></div>
                <div>• Certificats Let's Encrypt automatiques</div>
              </>
            )}
          </div>
        </div>

        {/* Checklist de validation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600">
            <h6 className="text-orange-300 font-semibold text-sm mb-2">À vérifier :</h6>
            <div className="space-y-1 text-xs text-gray-300">
              {activeTab === 'frontend' && (
                <>
                  <div>✓ Suppression des références Be.*</div>
                  <div>✓ Ajout gestion d'erreurs</div>
                </>
              )}
              {activeTab === 'module' && (
                <>
                  <div>✓ Export correct défini</div>
                  <div>✓ window.Be exposé</div>
                </>
              )}
              {activeTab === 'cors' && (
                <>
                  <div>✓ Traefik Host configuré</div>
                  <div>✓ CORS Origin validé</div>
                </>
              )}
            </div>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600">
            <h6 className="text-green-300 font-semibold text-sm mb-2">Résultat attendu :</h6>
            <div className="space-y-1 text-xs text-gray-300">
              {activeTab === 'frontend' && (
                <>
                  <div>→ Appels API directs</div>
                  <div>→ Pas d'erreur de méthode</div>
                </>
              )}
              {activeTab === 'module' && (
                <>
                  <div>→ Module importable</div>
                  <div>→ Rétro-compatibilité</div>
                </>
              )}
              {activeTab === 'cors' && (
                <>
                  <div>→ Connexions HTTPS</div>
                  <div>→ Pas d'erreurs CORS</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}