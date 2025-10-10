import React, { useState } from 'react';
import { Wrench, Copy, Check, Code, Container, Shield, RefreshCw } from 'lucide-react';

export default function ImmediateFixesPanel() {
  const [copiedSnippets, setCopiedSnippets] = useState(new Set());

  const fixes = [
    {
      id: 'cors-express',
      title: 'CORS Backend Express',
      icon: Shield,
      description: 'Configuration CORS pour autoriser les origines',
      snippet: `import cors from "cors";
import Icon from '../../../components/AppIcon';


const app = express();
app.use(cors({
  origin: ["https://trading-mvp.com", "https://www.trading-mvp.com"],
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: false
}));`
    },
    {
      id: 'traefik-labels',
      title: 'Labels Traefik',
      icon: Container,
      description: 'Labels Docker Compose pour Traefik',
      snippet: `labels:
  - "traefik.enable=true" -"traefik.http.routers.api.rule=Host(\`api.trading-mvp.com\`)" -"traefik.http.routers.api.entrypoints=websecure" -"traefik.http.routers.api.tls.certresolver=letsencrypt" -"traefik.http.services.api.loadbalancer.server.port=8080"
  # Sécurité (headers)
  - "traefik.http.middlewares.security.headers.stsSeconds=31536000" -"traefik.http.middlewares.security.headers.stsIncludeSubdomains=true" -"traefik.http.middlewares.security.headers.forceSTSHeader=true" -"traefik.http.middlewares.security.headers.contentTypeNosniff=true" -"traefik.http.routers.api.middlewares=security@docker"`
    },
    {
      id: 'docker-network',
      title: 'Réseau Docker',
      icon: Container,
      description: 'Commandes pour créer et démarrer les services',
      snippet: `docker network create web || true
docker compose -f docker-traefik-backend.yml up -d --build`
    },
    {
      id: 'emergency-restart',
      title: 'Redémarrage d\'urgence',
      icon: RefreshCw,
      description: 'Procédures de redémarrage complet',
      snippet: `# Arrêter tous les services
docker compose down

# Nettoyer les réseaux
docker network prune -f

# Redémarrer avec rebuild
docker compose up -d --build --force-recreate

# Vérifier les logs
docker logs -f traefik
docker logs -f backend`
    }
  ];

  const copyToClipboard = async (snippet, id) => {
    try {
      await navigator.clipboard?.writeText(snippet);
      setCopiedSnippets(prev => new Set([...prev, id]));
      setTimeout(() => {
        setCopiedSnippets(prev => {
          const newSet = new Set(prev);
          newSet?.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const diagnosticCommands = [
    {
      title: 'Logs Traefik',
      command: 'docker logs -n 200 traefik'
    },
    {
      title: 'Logs Backend',
      command: 'docker logs -n 200 backend'
    },
    {
      title: 'Statut Containers',
      command: 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"'
    },
    {
      title: 'Test Local Backend',
      command: 'curl -sS http://localhost:8080/health'
    },
    {
      title: 'Test Public API',
      command: 'curl -sS https://api.trading-mvp.com/health'
    }
  ];

  return (
    <div className="bg-yellow-800/30 backdrop-blur-sm border border-yellow-600 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Wrench className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold">Correctifs Immédiats</h2>
      </div>
      <div className="space-y-6">
        {/* Code Fixes */}
        <div className="space-y-4">
          {fixes?.map((fix) => {
            const Icon = fix?.icon;
            const isCopied = copiedSnippets?.has(fix?.id);

            return (
              <div key={fix?.id} className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-yellow-400" />
                    <div>
                      <h3 className="font-semibold">{fix?.title}</h3>
                      <p className="text-sm text-gray-300">{fix?.description}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(fix?.snippet, fix?.id)}
                    className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? 'Copié!' : 'Copier'}</span>
                  </button>
                </div>
                <div className="bg-black/50 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-xs text-green-300 whitespace-pre-wrap">
                    <code>{fix?.snippet}</code>
                  </pre>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diagnostic Commands */}
        <div className="bg-black/30 border border-gray-600 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Code className="w-5 h-5" />
            <span>Commandes de Diagnostic</span>
          </h3>
          
          <div className="space-y-2">
            {diagnosticCommands?.map((cmd, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-900/50 rounded p-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-300">{cmd?.title}</div>
                  <div className="text-xs font-mono text-green-400">{cmd?.command}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(cmd?.command, `cmd-${index}`)}
                  className="bg-gray-600 hover:bg-gray-700 p-1 rounded text-xs transition-colors"
                >
                  {copiedSnippets?.has(`cmd-${index}`) ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-red-400">Actions d'urgence</h3>
          <div className="space-y-2">
            <button className="w-full bg-red-600 hover:bg-red-700 py-2 px-4 rounded font-medium transition-colors">
              🚨 Redémarrage complet des services
            </button>
            <button className="w-full bg-orange-600 hover:bg-orange-700 py-2 px-4 rounded font-medium transition-colors">
              🔄 Rebuild des conteneurs Docker
            </button>
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 px-4 rounded font-medium transition-colors">
              🔧 Test de connectivité réseau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}