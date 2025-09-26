import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, Code, Shield, Layers, ExternalLink, Copy, CheckCircle, Zap } from 'lucide-react';

const UIIntegrationPanel = () => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeTab, setActiveTab] = useState('components');

  const integrationComponents = [
    {
      name: 'AgentStatusGrid.jsx',
      description: 'Grille temps réel des agents IA',
      endpoint: '/status',
      action: 'appelle',
      code: `// AgentStatusGrid.jsx
import React, { useEffect, useState } from 'react';
import { busMonitorService } from '../../../services/busMonitorService';

const AgentStatusGrid = () => {
  const [agentStatuses, setAgentStatuses] = useState({});
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await busMonitorService.getStatus();
        setAgentStatuses(response.data);
      } catch (error) {
        console.error('Status fetch failed:', error);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(agentStatuses).map(([agent, status]) => (
        <AgentCard key={agent} agent={agent} status={status} />
      ))}
    </div>
  );
};`,
      icon: Grid,
      color: 'blue'
    },
    {
      name: 'StrategyPages',
      description: 'Pages stratégie & options avancées',
      endpoint: '/proposal, /signals, /risk',
      action: 'Pages stratégie/options →',
      code: `// StrategyOptionsPage.jsx
import { strategyWeaverService } from '../services/strategyWeaverService';
import { quantOracleService } from '../services/quantOracleService';
import { immuneSentinelService } from '../services/immuneSentinelService';

const StrategyOptionsPage = () => {
  const [proposals, setProposals] = useState([]);
  const [signals, setSignals] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState({});
  
  const fetchStrategies = async () => {
    const [proposalRes, signalRes, riskRes] = await Promise.all([
      strategyWeaverService.getProposal(),
      quantOracleService.getSignals({ fast: 10, slow: 30 }),
      immuneSentinelService.getRisk({ window: 20 })
    ]);
    
    setProposals(proposalRes.data);
    setSignals(signalRes.data);
    setRiskMetrics(riskRes.data);
  };
  
  return (
    <div className="space-y-6">
      <ProposalPanel proposals={proposals} />
      <SignalsPanel signals={signals} />
      <RiskPanel metrics={riskMetrics} />
    </div>
  );
};`,
      icon: Layers,
      color: 'teal'
    },
    {
      name: 'SecureBackend',
      description: 'Backend Express sécurisé pour ordres',
      endpoint: 'Express API',
      action: 'Ordres via backend →',
      code: `// Backend Express - orders.js
const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for order endpoints
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 orders per minute
  message: 'Too many orders, please try again later'
});

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Secure order placement
router.post('/place', orderLimiter, authenticateToken, async (req, res) => {
  try {
    const { symbol, quantity, orderType, strategy } = req.body;
    
    // Validate order with risk controller
    const riskCheck = await riskController.validateOrder(req.body);
    if (!riskCheck.approved) {
      return res.status(400).json({ error: riskCheck.reason });
    }
    
    // Execute order through deployer service
    const order = await deployerService.executeOrder({
      ...req.body,
      userId: req.user.id,
      timestamp: new Date()
    });
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`,
      icon: Shield,
      color: 'orange'
    }
  ];

  const apiEndpoints = [
    { path: '/status', method: 'GET', description: 'Statut consolidé de tous les services', service: 'Bus Monitor' },
    { path: '/proposal', method: 'POST', description: 'Génération de propositions stratégiques', service: 'Strategy Weaver' },
    { path: '/signals', method: 'GET', description: 'Signaux algorithmiques MA', service: 'Quant Oracle' },
    { path: '/risk', method: 'GET', description: 'Métriques de risque et volatilité', service: 'Immune Sentinel' },
    { path: '/health', method: 'GET', description: 'État de santé global système', service: 'All Services' }
  ];

  const copyToClipboard = (content, id) => {
    navigator.clipboard?.writeText(content);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 shadow-xl border border-gray-800">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-purple-600 rounded-lg mr-3">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">🧱 Intégration UI</h2>
          <p className="text-gray-400 text-sm">Composants React & backend sécurisé</p>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'components' ?'bg-purple-600 text-white' :'text-gray-400 hover:text-white'
          }`}
        >
          Composants
        </button>
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'endpoints' ?'bg-purple-600 text-white' :'text-gray-400 hover:text-white'
          }`}
        >
          API Endpoints
        </button>
      </div>
      {activeTab === 'components' && (
        <div className="space-y-4">
          {integrationComponents?.map((component, index) => (
            <motion.div
              key={component?.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`p-2 bg-${component?.color}-600 rounded-lg mr-3`}>
                    <component.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{component?.name}</h3>
                    <p className="text-gray-400 text-xs">{component?.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(component?.code, component?.name)}
                    className="p-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {copiedCode === component?.name ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{component?.action}</span>
                  <code className="text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
                    {component?.endpoint}
                  </code>
                </div>
              </div>
              
              {/* Code Preview */}
              <div className="bg-gray-950/50 rounded-lg border border-gray-700 max-h-32 overflow-y-auto">
                <pre className="text-xs text-gray-300 p-3 font-mono">
                  <code>{component?.code?.split('\n')?.slice(0, 8)?.join('\n') + '\n// ...'}</code>
                </pre>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {activeTab === 'endpoints' && (
        <div className="space-y-3">
          {apiEndpoints?.map((endpoint, index) => (
            <motion.div
              key={endpoint?.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`text-xs px-2 py-1 rounded text-white ${
                    endpoint?.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {endpoint?.method}
                  </span>
                  <code className="text-blue-300 text-sm">{endpoint?.path}</code>
                  <span className="text-xs text-gray-400">• {endpoint?.service}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(`${endpoint?.method} ${endpoint?.path}`, endpoint?.path)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    {copiedCode === endpoint?.path ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                  <Zap className="w-3 h-3 text-yellow-400" />
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-2 ml-16">{endpoint?.description}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UIIntegrationPanel;