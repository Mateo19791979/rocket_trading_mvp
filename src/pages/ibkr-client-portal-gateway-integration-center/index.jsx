import React, { useState, useEffect } from 'react';
import { Terminal, Wifi, Shield, Activity, Settings, AlertTriangle, RefreshCw, Server, Database, FileText, Eye, Lock, BookOpen, Zap, Users, Calendar, CheckCircle, XCircle, Brain, Search, Key, Copy, AlertCircle, TrendingUp, Target } from 'lucide-react';
import { IBKRConfigurationPanel } from './components/IBKRConfigurationPanel';
import { ConnectionHealthMonitor } from './components/ConnectionHealthMonitor';
import { APIOperationsDashboard } from './components/APIOperationsDashboard';  
import { LiveTestingInterface } from './components/LiveTestingInterface';
import { ProductionControlsCenter } from './components/ProductionControlsCenter';
import MultiIATradingDashboard from './components/MultiIATradingDashboard';

export default function IBKRClientPortalGatewayIntegrationCenter() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({
    status: 'disconnected',
    lastConnected: null,
    latency: null,
    error: null
  });
  const [shadowMode, setShadowMode] = useState(true);
  const [gatewayHealth, setGatewayHealth] = useState({
    paper: { status: 'available', endpoint: '127.0.0.1:7497' },
    live: { status: 'available', endpoint: '127.0.0.1:7496' }
  });

  // IBKR Read-Only Index Notice Data
  const [ibkrNotice] = useState({
    id: "ibkr_index_readonly_notice",
    source_type: "meta",
    title: "READ-ONLY Index Notice",
    url: "",
    published_at: "2025-10-15",
    language: "en",
    platform: "tws|webapi",
    topics: ["policy", "readonly"],
    auth_level: "official",
    deprecation: false,
    priority: 1.0,
    chunks: [{
      chunk_id: "c1",
      text: "This index is for local lookup only. No crawling, no YouTube transcription, no automatic reindexing. Campus documentation prevails in conflicts.",
      tokens: 120
    }],
    validation_rule: "MUST_MATCH_CAMPUS_IF_CONFLICT",
    last_verified: "2025-10-15"
  });

  // Operator-IBKR READ-ONLY System Data
  const [operatorSystem] = useState({
    version: "1",
    mode: "READ-ONLY",
    all_jobs_disabled: true,
    interdictions: [
      "Aucune création/modification de contenu dans Rocketnew",
      "Aucun crawling/transcription YouTube automatique", 
      "Pas d'écriture externe en dehors des logs locaux techniques"
    ],
    objectif: "Répondre aux requêtes d'exécution/consultation en s'appuyant uniquement sur les fichiers fournis (ibkr_manual_ia.md, ibkr_learning_index.jsonl) et la doc Campus officielle déjà importée localement.",
    regles_or: [
      "Campus prime en cas de conflit avec toute autre source",
      "Paper d'abord : toute expérimentation doit rester en Paper Trading",
      "Sécurité : appliquer max_pos_per_symbol, max_notional, max_leverage, daily_loss_stop et l'idempotence (clientId, localOrderId, uuid)",
      "Anti-loop : ne jamais renvoyer un ordre déjà ack",
      "Heures & entitlements : exécuter seulement si marché & permissions OK"
    ],
    procedure_standard: [
      "RAG local (fichiers fournis uniquement) → récupérer l'extrait Campus pertinent (si présent)",
      "Plan en étapes numérotées (≤10)",
      "Choix adaptateur: TWS pour ordres avancés/SMART; sinon Web API",
      "Générer le payload minimal (ibapi Python ou REST JSON) sans l'envoyer par défaut",
      "Vérifications prévues (Submitted→Filled/Cancelled) décrites mais non exécutées sans confirmation explicite",
      "Gestion d'erreurs: backoff décrit; si >N échecs prévus → passer en lecture seule"
    ],
    disabled_jobs: {
      crawl_campus_daily: { enabled: false, schedule: null, task: "# disabled: no crawling" },
      fetch_youtube_transcripts: { enabled: false, schedule: null, task: "# disabled: no transcripts" },
      reindex_and_tests: { enabled: false, schedule: null, task: "# disabled: no indexing or tests" },
      premkt_health_eu: { enabled: false, schedule: null, task: "# disabled: no automated healthchecks" },
      premkt_health_us: { enabled: false, schedule: null, task: "# disabled: no automated healthchecks" },
      premkt_health_asia: { enabled: false, schedule: null, task: "# disabled: no automated healthchecks" }
    }
  });

  // IBKR Environment Configuration Data
  const [ibkrEnvConfig] = useState({
    section: "IBKR (TWS API)",
    variables: {
      IBKR_MODE: { value: "paper", description: "Safe defaults for paper trading", type: "select", options: ["paper", "live"] },
      IBKR_HOST: { value: "127.0.0.1", description: "TWS/Gateway host address", type: "text" },
      IBKR_PORT: { value: "7497", description: "Paper trading port", type: "number" },
      IBKR_CLIENT_ID: { value: "1", description: "Unique client identifier", type: "number" },
      IBKR_ACCOUNT: { value: "DUN766038", description: "Paper trading account", type: "text" },
      IBKR_READ_ONLY: { value: "true", description: "Enable read-only mode for safety", type: "boolean" }
    },
    optional_gateway: {
      section: "Client Portal Web API (optional)",
      variables: {
        IBKR_GATEWAY_HOST: { value: "127.0.0.1", description: "Gateway host (optional)", type: "text", optional: true },
        IBKR_GATEWAY_PORT: { value: "4003", description: "Gateway port (optional)", type: "number", optional: true },
        IBKR_CPAPI_BASEURL: { value: "http://127.0.0.1:5000/v1/api", description: "Client Portal API base URL", type: "text", optional: true }
      }
    },
    data_providers: {
      section: "DATA PROVIDERS (fill with your keys)",
      variables: {
        FINNHUB_API_KEY: { value: "REPLACE_ME", description: "Finnhub API key for market data", type: "password" },
        ALPHAVANTAGE_API_KEY: { value: "REPLACE_ME", description: "Alpha Vantage API key", type: "password" },
        TWELVEDATA_API_KEY: { value: "REPLACE_ME", description: "Twelve Data API key", type: "password" }
      }
    },
    realtime: {
      section: "REALTIME / WEBSOCKET",
      variables: {
        WS_ENABLED: { value: "true", description: "Enable WebSocket connections", type: "boolean" },
        WS_URL: { value: "ws://localhost:9001", description: "WebSocket URL", type: "text" },
        REDIS_URL: { value: "redis://localhost:6379", description: "Redis connection URL", type: "text" }
      }
    },
    supabase: {
      section: "SUPABASE (if used by your backend)",
      variables: {
        SUPABASE_URL: { value: "REPLACE_ME", description: "Supabase project URL", type: "text" },
        SUPABASE_ANON_KEY: { value: "REPLACE_ME", description: "Supabase anonymous key", type: "password" }
      }
    },
    safety: {
      section: "SAFETY LIMITS (adjust to your risk)",
      variables: {
        MAX_POS_PER_SYMBOL: { value: "1000", description: "Maximum positions per symbol", type: "number" },
        MAX_NOTIONAL_PER_SYMBOL: { value: "25000", description: "Maximum notional per symbol", type: "number" },
        MAX_LEVERAGE: { value: "2", description: "Maximum leverage allowed", type: "number" },
        DAILY_LOSS_STOP: { value: "-500", description: "Daily loss stop limit", type: "number" },
        ALLOW_EXTENDED_HOURS: { value: "false", description: "Allow extended hours trading", type: "boolean" }
      }
    },
    logging: {
      section: "LOGGING",
      variables: {
        LOG_LEVEL: { value: "info", description: "Logging level", type: "select", options: ["debug", "info", "warn", "error"] },
        AUDIT_TRAIL: { value: "true", description: "Enable audit trail logging", type: "boolean" }
      }
    }
  });

  const [activeTab, setActiveTab] = useState('operator');
  const [configCopied, setConfigCopied] = useState(false);

  useEffect(() => {
    // Initialize page
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStatusChange = (newStatus) => {
    setConnectionStatus(newStatus);
  };

  const handleShadowModeToggle = (enabled) => {
    setShadowMode(enabled);
  };

  const handleCopyConfig = () => {
    const configText = generateEnvConfig();
    navigator.clipboard?.writeText(configText);
    setConfigCopied(true);
    setTimeout(() => setConfigCopied(false), 2000);
  };

  const generateEnvConfig = () => {
    let config = "# ===============================\n";
    config += "# ROCKETNEW – IBKR PAPER CONFIG\n";
    config += "# Safe defaults for paper trading\n";
    config += "# ===============================\n\n";

    Object.entries(ibkrEnvConfig)?.forEach(([sectionKey, section]) => {
      if (section?.section && section?.variables) {
        config += `# --- ${section?.section} ---\n`;
        Object.entries(section?.variables)?.forEach(([key, variable]) => {
          if (variable?.optional) {
            config += `# ${key}=${variable?.value}\n`;
          } else {
            config += `${key}=${variable?.value}\n`;
          }
        });
        config += "\n";
      }
    });

    config += "# Notes:\n";
    config += "# 1) Laisse IBKR_READ_ONLY=true au début. Passe à false uniquement après tests.\n";
    config += "# 2) Si TWS tourne sur une autre machine que le backend, mets IBKR_HOST à l'IP de cette machine.\n";
    config += "# 3) Pour valider la connexion: curl http://127.0.0.1:8080/ibkr/handshake  (ou npm run ibkr:handshake)\n";

    return config;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex items-center space-x-4">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-xl text-gray-300">Loading IBKR Integration Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* IBKR Read-Only Index Notice Banner */}
      <div className="bg-gradient-to-r from-orange-900/80 to-red-900/80 border-b border-orange-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-sm font-semibold text-orange-200">{ibkrNotice?.title}</h2>
                    <p className="text-xs text-orange-300">Official Policy • Priority {ibkrNotice?.priority} • {ibkrNotice?.platform?.toUpperCase()}</p>
                  </div>
                  <div className="hidden md:block text-xs text-orange-300">
                    {ibkrNotice?.chunks?.[0]?.text}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notice Status Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-orange-300">Read-Only</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-orange-300">Protected Index</span>
              </div>
              <div className="text-xs text-orange-400">
                Verified: {ibkrNotice?.last_verified}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Operator-IBKR READ-ONLY System Banner */}
      <div className="bg-gradient-to-r from-red-900/90 to-gray-900/90 border-b border-red-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-200">Operator-IBKR (READ-ONLY) v{operatorSystem?.version}</h2>
                  <p className="text-sm text-red-300">Mode consultation seulement • Tous les jobs désactivés • Paper Trading obligatoire</p>
                </div>
              </div>
            </div>
            
            {/* System Status */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-300">Écriture Désactivée</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-300">Mode Sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-300">RAG Local Uniquement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">IBKR Client Portal Gateway Integration Center</h1>
                  <p className="text-sm text-gray-400">Production-Ready Interactive Brokers Gateway Management</p>
                </div>
              </div>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus?.status === 'connected' ? 'bg-green-400' :
                  connectionStatus?.status === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                  connectionStatus?.status === 'error'? 'bg-red-400' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-300 capitalize">{connectionStatus?.status || 'Unknown'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {shadowMode ? (
                  <>
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">Shadow Mode</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-orange-300">Live Mode</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced Tab Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('operator')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'operator' ?'border-red-500 text-red-400' :'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Operator-IBKR READ-ONLY</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('gateway')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'gateway' ?'border-blue-500 text-blue-400' :'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4" />
                <span>Gateway Management</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('multiia')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'multiia' ?'border-purple-500 text-purple-400' :'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Multi-IA Trading</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('envconfig')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'envconfig' ?'border-green-500 text-green-400' :'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>IBKR Paper Config</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      {/* Operator-IBKR READ-ONLY Tab Content */}
      {activeTab === 'operator' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Interdictions & Objectif */}
            <div className="space-y-6">
              {/* Interdictions Strictes */}
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg">
                <div className="px-6 py-4 border-b border-red-700/50">
                  <div className="flex items-center space-x-3">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <h2 className="text-lg font-semibold text-red-300">Interdictions (strictes)</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {operatorSystem?.interdictions?.map((interdiction, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-200">{interdiction}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Objectif */}
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <div className="px-6 py-4 border-b border-blue-700/50">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-blue-300">Objectif</h2>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-blue-200">{operatorSystem?.objectif}</p>
                  <div className="mt-4 bg-blue-800/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-300 mb-2">Sources autorisées uniquement :</h4>
                    <div className="space-y-1 text-xs text-blue-200">
                      <p>• ibkr_manual_ia.md (manuel local)</p>
                      <p>• ibkr_learning_index.jsonl (index d'apprentissage)</p>
                      <p>• Documentation Campus officielle importée localement</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jobs Désactivés */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-white">Jobs Automatiques (Tous Désactivés)</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {Object?.entries(operatorSystem?.disabled_jobs || {})?.map(([jobName, job]) => (
                      <div key={jobName} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <div>
                            <p className="text-sm font-medium text-white">{jobName}</p>
                            <p className="text-xs text-gray-400">{job?.task}</p>
                          </div>
                        </div>
                        <span className="text-xs text-red-300 font-medium">Désactivé</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Règles d'Or & Procédure */}
            <div className="space-y-6">
              {/* Règles d'Or */}
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <div className="px-6 py-4 border-b border-yellow-700/50">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-lg font-semibold text-yellow-300">Règles d'Or</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {operatorSystem?.regles_or?.map((regle, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-200">{regle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Procédure Standard */}
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg">
                <div className="px-6 py-4 border-b border-green-700/50">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-400" />
                    <h2 className="text-lg font-semibold text-green-300">Procédure Standard</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {operatorSystem?.procedure_standard?.map((etape, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-white font-bold">{String.fromCharCode(65 + index)}</span>
                        </div>
                        <p className="text-sm text-green-200">{etape}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sortie Attendue */}
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg">
                <div className="px-6 py-4 border-b border-purple-700/50">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-semibold text-purple-300">Sortie Attendue</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3 text-sm text-purple-200">
                    <p>• <strong>Résumé</strong> (≤6 lignes)</p>
                    <p>• <strong>Étapes numérotées</strong> de la procédure</p>
                    <p>• <strong>Payload prêt à l'emploi</strong> (non envoyé par défaut)</p>
                    <p>• <strong>Garde-fous listés</strong> et vérifications</p>
                    <p>• <strong>Référence Campus</strong> si disponible</p>
                  </div>
                  <div className="mt-4 bg-purple-800/30 rounded-lg p-3">
                    <p className="text-xs text-purple-300">
                      <strong>Langue :</strong> Répondre en français, code en anglais
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Multi-IA Trading Tab Content */}
      {activeTab === 'multiia' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Multi-IA Trading Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Multi-IA Trading Orchestrator</h2>
                <p className="text-gray-400">Système de trading collaboratif avec 4 agents IA et consensus 2/3</p>
              </div>
            </div>
            
            {/* Architecture Overview */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Architecture Multi-IA</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">IA-Stratégie</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-300">IA-Risque</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">IA-Validation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">IA-Execution</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                <p>→ Consensus minimal 2/3 • Policy Engine • Order Store • IBKR Paper Trading • Telemetry complète</p>
              </div>
            </div>
          </div>

          {/* Multi-IA Dashboard */}
          <MultiIATradingDashboard />
        </div>
      )}
      {/* IBKR Paper Config Tab Content */}
      {activeTab === 'envconfig' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header with Copy Button */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">IBKR Paper Trading Configuration</h2>
              <p className="text-gray-400 mt-2">Comprehensive environment variables for secure paper trading setup</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCopyConfig}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {configCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{configCopied ? 'Copied!' : 'Copy All Config'}</span>
              </button>
            </div>
          </div>

          {/* Configuration Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* IBKR Core Configuration */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Terminal className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">{ibkrEnvConfig?.section}</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {Object.entries(ibkrEnvConfig?.variables)?.map(([key, config]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">{key}</label>
                      <span className="text-xs text-gray-400">{config?.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type={config?.type === 'password' ? 'password' : 'text'}
                        value={config?.value}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                      <button className="p-2 text-gray-400 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">{config?.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Providers */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">{ibkrEnvConfig?.data_providers?.section}</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {Object.entries(ibkrEnvConfig?.data_providers?.variables)?.map(([key, config]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">{key}</label>
                      <div className="flex items-center space-x-2">
                        {config?.value === 'REPLACE_ME' && (
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className="text-xs text-gray-400">{config?.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="password"
                        value={config?.value}
                        className={`flex-1 px-3 py-2 bg-gray-700 border rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          config?.value === 'REPLACE_ME' ? 'border-yellow-500' : 'border-gray-600'
                        }`}
                        readOnly
                      />
                      <button className="p-2 text-gray-400 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">{config?.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Limits */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">{ibkrEnvConfig?.safety?.section}</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {Object.entries(ibkrEnvConfig?.safety?.variables)?.map(([key, config]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">{key}</label>
                      <span className="text-xs text-gray-400">{config?.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={config?.value}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        readOnly
                      />
                      <button className="p-2 text-gray-400 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">{config?.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time & WebSocket */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Wifi className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">{ibkrEnvConfig?.realtime?.section}</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {Object.entries(ibkrEnvConfig?.realtime?.variables)?.map(([key, config]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">{key}</label>
                      <span className="text-xs text-gray-400">{config?.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={config?.value}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        readOnly
                      />
                      <button className="p-2 text-gray-400 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">{config?.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Optional Gateway Configuration */}
          <div className="mt-8">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Server className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">{ibkrEnvConfig?.optional_gateway?.section}</h3>
                  <span className="text-xs text-orange-300 bg-orange-900/20 px-2 py-1 rounded">Optional</span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(ibkrEnvConfig?.optional_gateway?.variables)?.map(([key, config]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-300">{key}</label>
                        <span className="text-xs text-gray-400">{config?.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={config?.value}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent opacity-60"
                          readOnly
                          disabled
                        />
                        <button className="p-2 text-gray-400 hover:text-white">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">{config?.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Notes */}
          <div className="mt-8 bg-gradient-to-r from-blue-900/50 to-green-900/50 border border-blue-700/50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <BookOpen className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Configuration Notes</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>• <strong>IBKR_READ_ONLY:</strong> Laisse à true au début. Passe à false uniquement après tests.</p>
                  <p>• <strong>Host Configuration:</strong> Si TWS tourne sur une autre machine que le backend, mets IBKR_HOST à l'IP de cette machine.</p>
                  <p>• <strong>Connection Validation:</strong> Pour valider la connexion: <code className="bg-gray-700 px-2 py-1 rounded">curl http://127.0.0.1:8080/ibkr/handshake</code></p>
                  <p>• <strong>Safety First:</strong> Toutes les limites de sécurité sont appliquées automatiquement en mode paper trading.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
      {/* Gateway Management Tab Content */}
      {activeTab === 'gateway' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Configuration & Health */}
            <div className="space-y-6">
              {/* IBKR Configuration Panel */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">IBKR Configuration Panel</h2>
                  </div>
                </div>
                <div className="p-6">
                  <IBKRConfigurationPanel 
                    onStatusChange={handleStatusChange}
                    shadowMode={shadowMode}
                    onShadowModeChange={handleShadowModeToggle}
                  />
                </div>
              </div>

              {/* Connection Health Monitor */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-green-400" />
                    <h2 className="text-lg font-semibold text-white">Connection Health Monitor</h2>
                  </div>
                </div>
                <div className="p-6">
                  <ConnectionHealthMonitor 
                    connectionStatus={connectionStatus}
                    gatewayHealth={gatewayHealth}
                  />
                </div>
              </div>
            </div>

            {/* Center Column - API Operations & Testing */}
            <div className="space-y-6">
              {/* API Operations Dashboard */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">API Operations Dashboard</h2>
                  </div>
                </div>
                <div className="p-6">
                  <APIOperationsDashboard 
                    connectionStatus={connectionStatus}
                    shadowMode={shadowMode}
                  />
                </div>
              </div>

              {/* Live Testing Interface */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Terminal className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-white">Live Testing Interface</h2>
                  </div>
                </div>
                <div className="p-6">
                  <LiveTestingInterface 
                    connectionStatus={connectionStatus}
                    shadowMode={shadowMode}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Production Controls */}
            <div className="space-y-6">
              {/* Production Controls Center */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Server className="w-5 h-5 text-orange-400" />
                    <h2 className="text-lg font-semibold text-white">Production Controls Center</h2>
                  </div>
                </div>
                <div className="p-6">
                  <ProductionControlsCenter 
                    shadowMode={shadowMode}
                    onShadowModeChange={handleShadowModeToggle}
                    connectionStatus={connectionStatus}
                  />
                </div>
              </div>

              {/* Gateway Status Overview */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Wifi className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-semibold text-white">Gateway Status Overview</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Paper Trading Gateway */}
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-white">Paper Trading Gateway</p>
                        <p className="text-xs text-gray-400">{gatewayHealth?.paper?.endpoint}</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-300 font-medium">Available</span>
                  </div>

                  {/* Live Trading Gateway */}
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-white">Live Trading Gateway</p>
                        <p className="text-xs text-gray-400">{gatewayHealth?.live?.endpoint}</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-300 font-medium">Available</span>
                  </div>

                  {/* Environment Variables Status */}
                  <div className="border-t border-gray-600 pt-4">
                    <h4 className="text-sm font-medium text-white mb-3">Environment Configuration</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">IBKR_BASE</span>
                        <span className="text-green-300">Configured</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">IBKR_SHADOW_MODE</span>
                        <span className={shadowMode ? 'text-green-300' : 'text-orange-300'}>
                          {shadowMode ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">IBKR_ALLOW_SELF_SIGNED</span>
                        <span className="text-green-300">Enabled</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">INTERNAL_ADMIN_KEY</span>
                        <span className="text-green-300">Protected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Banner - Important Notices */}
          <div className="mt-8 bg-gradient-to-r from-blue-900/50 to-green-900/50 border border-blue-700/50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <Shield className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Production Safety Notice</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>• <strong>Shadow Mode Protection:</strong> All orders are blocked when shadow mode is enabled - safe for testing and development.</p>
                  <p>• <strong>Gateway Prerequisites:</strong> Ensure IB Gateway or TWS is running with the appropriate ports (7497 for paper, 7496 for live).</p>
                  <p>• <strong>Authentication Flow:</strong> Cookie-jar authentication with auto-reauth capabilities ensures persistent connections.</p>
                  <p>• <strong>SSL Certificate Handling:</strong> Self-signed certificate support for local Gateway connections.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}