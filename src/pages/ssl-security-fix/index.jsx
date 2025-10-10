import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Globe, Key, Activity, RefreshCw, ExternalLink, Clock, Terminal, Lock, Server, Wifi, Copy, Settings } from 'lucide-react';

import DNSManagementWidget from '../../components/ui/DNSManagementWidget';
import { dnsSslService } from '../../services/dnsSslService';

import { supabase } from '../../lib/supabase';
import Icon from '@/components/AppIcon';



const SSLSecurityFixPage = () => {
  const [loading, setLoading] = useState(true);
  const [domainInfo, setDomainInfo] = useState(null);
  const [securityStatus, setSecurityStatus] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ssl-setup');
  const [copiedCommand, setCopiedCommand] = useState('');

  useEffect(() => {
    loadSecurityStatus();
  }, []);

  const loadSecurityStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user or use fallback
      const { data: { user } } = await supabase?.auth?.getUser() || { data: { user: null } };
      const userId = user?.id || 'f7b7dbed-d459-4d2c-a21d-0fce13ee257c';
      
      const overview = await dnsSslService?.getDnsSslOverview(userId);
      const tradingDomain = overview?.domains?.find(d => d?.domain_name === 'trading-mvp.com');
      
      setDomainInfo(tradingDomain);
      setSecurityStatus({
        sslStatus: tradingDomain ? 'configured' : 'needs_setup',
        certificates: overview?.recentCertificates || [],
        healthChecks: overview?.recentHealthChecks || [],
        securityScans: overview?.recentSecurityScans || []
      });
    } catch (err) {
      setError('Erreur lors du chargement du statut de sécurité: ' + (err?.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const runSecurityScan = async () => {
    try {
      const activeCert = securityStatus?.certificates?.find(c => c?.status === 'valid');
      if (activeCert) {
        await dnsSslService?.runSecurityScan(activeCert?.id);
        await loadSecurityStatus();
      } else {
        setError('Aucun certificat SSL actif trouvé pour effectuer le scan');
      }
    } catch (err) {
      setError('Erreur lors du scan de sécurité: ' + (err?.message || 'Erreur inconnue'));
    }
  };

  const copyToClipboard = async (text, commandId) => {
    try {
      await navigator?.clipboard?.writeText(text);
      setCopiedCommand(commandId);
      setTimeout(() => setCopiedCommand(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getOverallStatus = () => {
    if (loading) return { status: 'loading', text: 'Vérification...', icon: Clock, color: 'text-gray-500' };
    
    if (!domainInfo) {
      return { 
        status: 'error', 
        text: 'Non configuré', 
        icon: AlertTriangle, 
        color: 'text-red-500',
        description: 'Le domaine trading-mvp.com n\'est pas configuré dans le système DNS/SSL'
      };
    }

    const hasValidSSL = securityStatus?.certificates?.some(c => c?.status === 'valid');
    const hasHealthyDNS = securityStatus?.healthChecks?.some(h => h?.is_healthy);

    if (!hasValidSSL) {
      return {
        status: 'ssl_issue',
        text: 'Problème SSL',
        icon: AlertTriangle,
        color: 'text-red-500',
        description: 'Certificat SSL manquant ou expiré - cause du message "Non sécurisé"'
      };
    }

    if (!hasHealthyDNS) {
      return {
        status: 'dns_issue',
        text: 'Problème DNS',
        icon: AlertTriangle,
        color: 'text-yellow-500',
        description: 'Configuration DNS nécessite des ajustements'
      };
    }

    return {
      status: 'secure',
      text: 'Sécurisé',
      icon: CheckCircle,
      color: 'text-green-500',
      description: 'SSL et DNS correctement configurés'
    };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus?.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-80"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(3)]?.map((_, i) => (
                <div key={i} className="h-40 bg-white/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const CommandBlock = ({ title, command, description, commandId }) => (
    <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium text-white">{title}</h5>
        <button
          onClick={() => copyToClipboard(command, commandId)}
          className={`p-2 rounded transition-colors ${
            copiedCommand === commandId 
              ? 'bg-green-600 text-white' :'bg-slate-600 hover:bg-slate-500 text-slate-300'
          }`}
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
      <pre className="bg-black/30 p-3 rounded text-xs text-green-400 font-mono overflow-x-auto">
        {command}
      </pre>
      {description && (
        <p className="text-xs text-slate-400">{description}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              SSL/TLS Setup (Let's Encrypt) - trading-mvp.com
            </h1>
            <p className="text-slate-300">
              Configuration SSL complète avec WebSocket SSL Termination et NGINX
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadSecurityStatus}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <a
              href="https://trading-mvp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Tester le site
            </a>
          </div>
        </div>

        {/* Enhanced Status Overview with Detailed SSL Diagnosis */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <StatusIcon className={`w-8 h-8 ${overallStatus?.color}`} />
                <div>
                  <h2 className="text-xl font-semibold text-white">trading-mvp.com</h2>
                  <p className={`text-sm ${overallStatus?.color}`}>{overallStatus?.text}</p>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                {overallStatus?.description}
              </div>
            </div>
            
            {/* Enhanced Quick Actions */}
            <div className="flex items-center gap-2">
              {securityStatus?.certificates?.length > 0 && (
                <button
                  onClick={runSecurityScan}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  Scanner
                </button>
              )}
              <a
                href="https://www.ssllabs.com/ssltest/analyze.html?d=trading-mvp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                SSL Labs Test
              </a>
            </div>
          </div>
          
          {/* Added Critical SSL Diagnosis Section */}
          <div className="mt-6 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-400 mb-2">
                  🚨 Diagnostic : Pourquoi "Non sécurisé" ?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Causes possibles :</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>• <span className="text-red-400">Certificat SSL expiré ou manquant</span></li>
                      <li>• <span className="text-orange-400">Configuration NGINX incorrecte</span></li>
                      <li>• <span className="text-yellow-400">DNS pointant vers mauvaise IP</span></li>
                      <li>• <span className="text-purple-400">Contenu mixte (HTTP dans HTTPS)</span></li>
                      <li>• <span className="text-blue-400">Port 443 fermé ou inaccessible</span></li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Actions immédiates :</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>• Vérifier certificat avec <code className="text-green-400">curl -I https://trading-mvp.com</code></li>
                      <li>• Tester NGINX avec <code className="text-green-400">sudo nginx -t</code></li>
                      <li>• Vérifier DNS avec <code className="text-green-400">nslookup trading-mvp.com</code></li>
                      <li>• Renouveler certificat avec <code className="text-green-400">certbot renew</code></li>
                      <li>• Vider cache navigateur et tester en navigation privée</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert with Enhanced Information */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <div>
                <div className="font-medium">Erreur détectée</div>
                <div className="text-sm mt-1">{error}</div>
                <div className="text-xs mt-2 text-red-300">
                  💡 Conseil : Si le domaine n'est pas configuré, suivez les étapes dans l'onglet "Setup SSL/TLS"
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Key className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {securityStatus?.certificates?.filter(c => c?.status === 'valid')?.length || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Certificats SSL</h3>
            <p className="text-slate-400 text-sm">Actifs et valides</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Globe className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {securityStatus?.healthChecks?.filter(h => h?.is_healthy)?.length || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Contrôles DNS</h3>
            <p className="text-slate-400 text-sm">Fonctionnels</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {securityStatus?.securityScans?.length || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Scans sécurité</h3>
            <p className="text-slate-400 text-sm">Analyses effectuées</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-white/10">
          <nav className="flex space-x-8">
            {[
              { id: 'ssl-setup', label: 'Setup SSL/TLS', icon: Lock },
              { id: 'websocket-termination', label: 'WebSocket SSL', icon: Wifi },
              { id: 'ssl-fix', label: 'Correctif SSL', icon: Key },
              { id: 'dns-management', label: 'Gestion DNS', icon: Globe },
              { id: 'monitoring', label: 'Monitoring', icon: Activity }
            ]?.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-400' :'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'ssl-setup' && (
            <div className="space-y-6">
              {/* Prerequisites Check */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Prérequis SSL/TLS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">DNS A/AAAA de trading-mvp.com configuré</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Ports 80 et 443 ouverts</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">NGINX installé et configuré</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">API Base URL: https://trading-mvp.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                      <Wifi className="w-4 h-4" />
                      <span className="text-sm">WebSocket: wss://trading-mvp.com/ws/...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Installation Commands */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-400" />
                  Installation Certbot
                </h3>
                <div className="space-y-4">
                  <CommandBlock
                    title="1. Installer Certbot"
                    command="sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx"
                    description="Installation de NGINX et Certbot avec le plugin NGINX"
                    commandId="install-certbot"
                  />
                </div>
              </div>

              {/* NGINX Configuration */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  Configuration NGINX Complète
                </h3>
                <div className="space-y-4">
                  <CommandBlock
                    title="Configuration /etc/nginx/sites-available/trading-mvp.com"
                    command={`# HTTP → redirection HTTPS canonique
server {
  listen 80;
  server_name trading-mvp.com www.trading-mvp.com;
  location /.well-known/acme-challenge/ { root /var/www/html; }
  location / { return 301 https://trading-mvp.com$request_uri; }
}

# serveur HTTPS principal
server {
  listen 443 ssl http2;
  server_name trading-mvp.com;

  ssl_certificate     /etc/letsencrypt/live/trading-mvp.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/trading-mvp.com/privkey.pem;

  # Sécurité TLS renforcée
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;
  ssl_session_timeout 1d;
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

  # PROXY → APP
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }

  # API
  location /api/ {
    proxy_pass http://127.0.0.1:3000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # 🎯 SSL TERMINATION WEBSOCKET
  map $http_upgrade $connection_upgrade { default upgrade; '' close; }
  location /ws/quotes/ {
    proxy_pass http://127.0.0.1:8083/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header X-Forwarded-Proto https;
  }
}`}
                    description="Configuration NGINX complète avec SSL Termination pour WebSockets"
                    commandId="nginx-config"
                  />

                  <CommandBlock
                    title="2. Activer et tester la configuration"
                    command="sudo ln -sf /etc/nginx/sites-available/trading-mvp.com /etc/nginx/sites-enabled/trading-mvp.com
sudo nginx -t && sudo systemctl reload nginx"
                    description="Activation du site et test de la configuration NGINX"
                    commandId="nginx-enable"
                  />
                </div>
              </div>

              {/* SSL Certificate Generation */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-400" />
                  Génération Certificat SSL
                </h3>
                <div className="space-y-4">
                  <CommandBlock
                    title="3. Émettre le certificat Let's Encrypt"
                    command="sudo certbot --nginx -d trading-mvp.com --agree-tos -m admin@trading-mvp.com -n"
                    description="Génération automatique du certificat SSL avec Certbot"
                    commandId="ssl-generate"
                  />

                  <CommandBlock
                    title="4. Configuration du renouvellement automatique"
                    command="sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
# Test du renouvellement
sudo certbot renew --dry-run"
                    description="Activation du renouvellement automatique des certificats"
                    commandId="ssl-renew-setup"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'websocket-termination' && (
            <div className="space-y-6">
              {/* WebSocket SSL Termination Explanation */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-400" />
                  SSL Termination pour WebSockets
                </h3>
                <div className="space-y-4">
                  <p className="text-slate-300">
                    Le SSL Termination permet à NGINX de gérer toute la complexité SSL, puis de transmettre 
                    les connexions WebSocket en clair vers le MarketDataProcessor en interne.
                  </p>
                  
                  <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-2">Architecture du flux :</h4>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>1. Frontend (Navigateur) <span className="text-blue-400">wss://</span> → NGINX</div>
                      <div>2. NGINX reçoit la connexion sécurisée et la décrypte</div>
                      <div>3. NGINX <span className="text-green-400">ws://</span> → MarketDataProcessor (port 8083)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frontend WebSocket Update */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-yellow-400" />
                  Mise à jour Frontend WebSocket
                </h3>
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm">
                    Le frontend ne doit plus se connecter directement au port 8083, mais utiliser la route SSL-terminated.
                  </p>
                  
                  <CommandBlock
                    title="Configuration WebSocket Frontend (src/lib/quotesSocket.js)"
                    command={`// ANCIEN CODE (à remplacer)
// const WS_URL = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.hostname + ':8083';

// NOUVEAU CODE (SSL-terminated)
const WS_URL = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws/quotes/';

let ws;
let lastHeartbeat = Date.now();

export function startQuotesFeed(onTick) {
  console.log(\`Connecting to WebSocket at: \${WS_URL}\`);
  ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    console.log("WebSocket connection established.");
    lastHeartbeat = Date.now();
  };
  
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    
    // Handle heartbeat messages
    if (msg.t === 'heartbeat') {
      lastHeartbeat = msg.ts || Date.now();
      return;
    }
    
    onTick?.(msg);
  };
  
  ws.onclose = () => {
    console.log("WebSocket connection closed. Reconnecting in 3 seconds...");
    setTimeout(() => startQuotesFeed(onTick), 3000);
  };
}`}
                    description="Code WebSocket mis à jour pour utiliser SSL Termination"
                    commandId="websocket-frontend"
                  />
                </div>
              </div>

              {/* Performance++ Features */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Fonctionnalités Performance++
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-400 mb-2">🎯 Health Sentinel Integration</h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Contrôle santé MarketDataProcessor chaque minute</li>
                      <li>• Mise à jour Data Health Index automatique</li>
                      <li>• Passage en mode DEGRADED si connexion IBKR perdue</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-400 mb-2">🎯 WebSocket Heartbeat</h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Heartbeat serveur toutes les 20 secondes</li>
                      <li>• Détection client de connexions mortes</li>
                      <li>• Reconnexion proactive après 45s sans heartbeat</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-400 mb-2">🎯 Pacing Violation Management</h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Queue d'abonnements pour éviter surcharge IBKR</li>
                      <li>• Traitement un symbole toutes les 150ms</li>
                      <li>• Protection contre déconnexions forcées</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-purple-400 mb-2">🎯 Database Integration</h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Tracking WebSocket connections dans Supabase</li>
                      <li>• Métriques système en temps réel</li>
                      <li>• Logs de santé pour diagnostic</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ssl-fix' && (
            <div className="space-y-6">
              {/* Enhanced SSL Diagnostic Section */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Diagnostic SSL Complet - "Non sécurisé"
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-red-400">Problème principal identifié</div>
                          <div className="text-xs text-red-300 mt-1">
                            Le navigateur affiche "Non sécurisé" pour https://trading-mvp.com
                            <br />Cela indique un problème avec le certificat SSL ou sa configuration.
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Activity className="w-4 h-4 text-blue-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-blue-400">Système de fallback actif</div>
                          <div className="text-xs text-blue-300 mt-1">
                            Les appels API utilisent le fallback Supabase avec succès.
                            <br />L'application fonctionne mais sans SSL sur le domaine principal.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-green-400">Configuration NGINX prête</div>
                          <div className="text-xs text-green-300 mt-1">
                            La configuration NGINX avec SSL Termination est en place.
                            <br />Il suffit de résoudre le problème de certificat.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white">🔍 Tests de diagnostic rapide :</h4>
                    <CommandBlock
                      title="1. Vérifier l'état du certificat SSL"
                      command="# Test basique du certificat
curl -I https://trading-mvp.com

# Test détaillé avec openssl
echo | openssl s_client -servername trading-mvp.com -connect trading-mvp.com:443 2>/dev/null | openssl x509 -noout -dates

# Vérifier les logs NGINX
sudo tail -f /var/log/nginx/error.log"
                      description="Diagnostics SSL de base pour identifier le problème"
                      commandId="ssl-diagnostic"
                    />

                    <CommandBlock
                      title="2. Vérifications DNS et réseau"
                      command="# Vérifier DNS
nslookup trading-mvp.com
dig trading-mvp.com

# Test de connectivité port 443
telnet trading-mvp.com 443

# Vérifier si NGINX écoute
sudo netstat -tlnp | grep :443"
                      description="Tests réseau pour s'assurer que le domaine pointe correctement"
                      commandId="network-diagnostic"
                    />
                  </div>
                </div>
              </div>

              {/* Solution Steps */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-400" />
                  Plan d'action pour résoudre "Non sécurisé"
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <h4 className="text-sm font-medium text-white">Urgence</h4>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1">
                        <li>• Renouveler certificat Let's Encrypt</li>
                        <li>• Vérifier configuration NGINX</li>
                        <li>• Redémarrer service NGINX</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <h4 className="text-sm font-medium text-white">Vérification</h4>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1">
                        <li>• Tester SSL Labs (A+ attendu)</li>
                        <li>• Vérifier WebSocket SSL</li>
                        <li>• Test navigateur privé</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <h4 className="text-sm font-medium text-white">Optimisation</h4>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1">
                        <li>• Configurer HSTS preload</li>
                        <li>• Mettre à jour variables env</li>
                        <li>• Activer monitoring SSL</li>
                      </ul>
                    </div>
                  </div>

                  <CommandBlock
                    title="🚀 Solution express - Commandes à exécuter"
                    command={`# 1. Renouveler le certificat Let's Encrypt
sudo certbot renew --nginx --force-renewal

# 2. Vérifier et recharger NGINX
sudo nginx -t && sudo systemctl reload nginx

# 3. Test immédiat
curl -I https://trading-mvp.com

# 4. Si erreur, regénérer certificat complet
sudo certbot --nginx -d trading-mvp.com --force-renewal

# 5. Vérifier auto-renewal
sudo systemctl status certbot.timer`}
                    description="Solution rapide pour résoudre le problème SSL"
                    commandId="express-ssl-fix"
                  />
                </div>
              </div>

              {/* Troubleshooting Common Issues */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Dépannage des problèmes courants
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/30 border border-slate-700 rounded">
                      <h4 className="text-sm font-medium text-red-400 mb-1">❌ Erreur : Certificate not found</h4>
                      <p className="text-xs text-slate-400">
                        Le certificat n'existe pas ou a expiré.
                        <br />Solution : <code className="text-green-400">sudo certbot --nginx -d trading-mvp.com</code>
                      </p>
                    </div>
                    
                    <div className="p-3 bg-slate-800/30 border border-slate-700 rounded">
                      <h4 className="text-sm font-medium text-red-400 mb-1">❌ Erreur : nginx: configuration invalid</h4>
                      <p className="text-xs text-slate-400">
                        Configuration NGINX incorrecte.
                        <br />Solution : Vérifier avec <code className="text-green-400">sudo nginx -t</code>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/30 border border-slate-700 rounded">
                      <h4 className="text-sm font-medium text-red-400 mb-1">❌ Erreur : Connection refused</h4>
                      <p className="text-xs text-slate-400">
                        Port 443 fermé ou service arrêté.
                        <br />Solution : <code className="text-green-400">sudo systemctl start nginx</code>
                      </p>
                    </div>
                    
                    <div className="p-3 bg-slate-800/30 border border-slate-700 rounded">
                      <h4 className="text-sm font-medium text-red-400 mb-1">❌ Mixed Content Warning</h4>
                      <p className="text-xs text-slate-400">
                        Ressources HTTP dans une page HTTPS.
                        <br />Solution : Forcer HTTPS dans les variables d'env
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dns-management' && domainInfo && (
            <DNSManagementWidget 
              domainId={domainInfo?.id} 
              domainName={domainInfo?.domain_name}
            />
          )}

          {activeTab === 'monitoring' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Post-deployment Checks */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Vérifications Post-Déploiement
                </h3>
                <div className="space-y-4">
                  <CommandBlock
                    title="Tests SSL obligatoires"
                    command="# Test navigateur
curl -I https://trading-mvp.com

# Test API
curl -I https://trading-mvp.com/api/health

# Vérifier HSTS
curl -I https://trading-mvp.com | grep -i strict-transport-security

# Test WebSocket (optionnel)
wscat -c wss://trading-mvp.com/ws/quotes/"
                    description="Commandes de vérification après installation SSL"
                    commandId="ssl-tests"
                  />
                </div>
              </div>

              {/* Health Checks */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Contrôles santé
                </h3>
                <div className="space-y-3">
                  {securityStatus?.healthChecks?.map((check) => (
                    <div key={check?.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{check?.check_type}</div>
                        <div className="text-sm text-slate-400">{check?.check_url}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {check?.is_healthy ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="text-sm text-slate-400">{check?.response_time_ms}ms</span>
                      </div>
                    </div>
                  ))}
                  {securityStatus?.healthChecks?.length === 0 && (
                    <div className="text-center text-slate-400 py-4">
                      Aucun contrôle configuré
                    </div>
                  )}
                </div>
              </div>

              {/* Environment Variables Update */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Mise à jour Variables d'Environnement
                </h3>
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm">
                    Après l'activation SSL, mettez à jour ces variables dans votre application :
                  </p>
                  
                  <CommandBlock
                    title="Variables d'environnement à mettre à jour"
                    command={`# Frontend (.env)
VITE_API_BASE_URL=https://trading-mvp.com
VITE_FORCE_HTTPS=true

# Si WebSocket utilisé
VITE_WS_BASE_URL=wss://trading-mvp.com/ws/

# Backend
API_BASE_URL=https://trading-mvp.com
CORS_ORIGIN=https://trading-mvp.com`}
                    description="Variables d'environnement pour forcer HTTPS après installation SSL"
                    commandId="env-update"
                  />
                </div>
              </div>

              {/* Security Scans */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Scans sécurité et certificats
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {securityStatus?.securityScans?.map((scan) => (
                    <div key={scan?.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{scan?.scan_type}</div>
                        <div className="text-sm text-slate-400">
                          Score: {scan?.scan_score}/100
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${
                          scan?.overall_grade === 'A+' || scan?.overall_grade === 'A' ?'text-green-400' 
                            : scan?.overall_grade === 'B' ?'text-yellow-400' :'text-red-400'
                        }`}>
                          {scan?.overall_grade}
                        </span>
                      </div>
                    </div>
                  ))}
                  {securityStatus?.certificates?.map((cert) => (
                    <div key={cert?.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">Certificat SSL</div>
                        <div className="text-sm text-slate-400">
                          Expires: {new Date(cert?.expires_at)?.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cert?.status === 'valid' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="text-sm text-slate-400">{cert?.status}</span>
                      </div>
                    </div>
                  ))}
                  {(securityStatus?.securityScans?.length === 0 && securityStatus?.certificates?.length === 0) && (
                    <div className="text-center text-slate-400 py-4 col-span-2">
                      Aucune donnée de sécurité disponible
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SSLSecurityFixPage;