// Orchestra Diagnostic & Relance Service
// Service de diagnostic et réactivation du Chef Orchestra avec auto-vérification IA régionales

class OrchestraDiagnosticService {
  constructor() {
    this.diagnosticLogs = [];
    this.lastCheck = null;
    this.webSocketChannels = ['/market.signals', '/ai.trades', '/dashboard.events'];
    this.regionalAgents = ['Momentum_Europe', 'Momentum_US', 'Momentum_Asia'];
    this.autoCheckInterval = null;
  }

  // 1️⃣ Vérifie l'état du Chef Orchestra
  async checkOrchestraStatus() {
    try {
      const status = await this.getOrchestraStatus();
      this.log('Orchestra Status Check', status?.active ? '🟢 ACTIVE' : '🔴 INACTIVE', status);
      
      if (!status?.active) {
        this.log('Action Required', '🔄 Restarting Orchestra', null);
        await this.executeCommand('/orchestra/restart');
        return { status: 'restarted', action: 'restart_orchestra' };
      }
      
      return { status: 'active', action: 'none' };
    } catch (error) {
      this.log('Orchestra Check Error', `❌ ${error?.message}`, error);
      return { status: 'error', action: 'manual_intervention_required' };
    }
  }

  // 2️⃣ Contrôle les flux WebSocket
  async checkWebSocketChannels() {
    const channelStatus = {};
    const actions = [];

    for (const channel of this.webSocketChannels) {
      try {
        const isEmpty = await this.isChannelEmpty(channel);
        channelStatus[channel] = isEmpty ? 'EMPTY' : 'ACTIVE';
        
        if (isEmpty) {
          this.log('WebSocket Channel', `🟡 ${channel} is empty`, null);
          await this.executeCommand('/reset-live-channel', { channel });
          actions?.push(`reset_${channel?.replace('/', '_')}`);
        } else {
          this.log('WebSocket Channel', `🟢 ${channel} is active`, null);
        }
      } catch (error) {
        this.log('WebSocket Error', `❌ ${channel}: ${error?.message}`, error);
        channelStatus[channel] = 'ERROR';
        actions?.push(`manual_check_${channel?.replace('/', '_')}`);
      }
    }

    return { channels: channelStatus, actions };
  }

  // 3️⃣ Vérifie la synchronisation des IA régionales
  async checkRegionalAgents() {
    const agentStatus = {};
    const actions = [];

    for (const agent of this.regionalAgents) {
      try {
        const isActive = await this.isAgentActive(agent);
        agentStatus[agent] = isActive ? 'ACTIVE' : 'INACTIVE';
        
        if (!isActive) {
          this.log('Regional Agent', `🔴 ${agent} is inactive`, null);
          const region = agent?.split('_')?.[1]?.toLowerCase();
          await this.executeCommand(`/agent/restart/${region}`);
          actions?.push(`restart_${region}`);
        } else {
          this.log('Regional Agent', `🟢 ${agent} is active`, null);
        }
      } catch (error) {
        this.log('Agent Error', `❌ ${agent}: ${error?.message}`, error);
        agentStatus[agent] = 'ERROR';
        actions?.push(`manual_check_${agent}`);
      }
    }

    return { agents: agentStatus, actions };
  }

  // 4️⃣ Vérifie la cohérence des trades
  async checkTradesCoherence() {
    const tradeStatus = {};
    const actions = [];

    for (const agent of this.regionalAgents) {
      try {
        const lastSignal = await this.getLastSignalTimestamp(agent);
        const serverTime = Date.now();
        const timeDiff = serverTime - lastSignal;
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));

        tradeStatus[agent] = {
          lastSignal: new Date(lastSignal)?.toISOString(),
          minutesAgo: minutesDiff,
          status: minutesDiff > 10 ? 'STALE' : 'FRESH'
        };

        if (minutesDiff > 10) {
          this.log('Trade Coherence', `🟡 ${agent} last signal: ${minutesDiff}min ago`, null);
          await this.executeCommand('/sync-context', { agent });
          actions?.push(`sync_context_${agent}`);
        } else {
          this.log('Trade Coherence', `🟢 ${agent} signal fresh (${minutesDiff}min ago)`, null);
        }
      } catch (error) {
        this.log('Trade Check Error', `❌ ${agent}: ${error?.message}`, error);
        tradeStatus[agent] = { status: 'ERROR', error: error?.message };
        actions?.push(`manual_check_trades_${agent}`);
      }
    }

    return { trades: tradeStatus, actions };
  }

  // 5️⃣ Diagnostic complet
  async runCompleteDiagnostic() {
    this.log('Diagnostic Start', '🎛️ Starting complete Orchestra diagnostic', null);
    this.lastCheck = new Date();

    const results = {
      timestamp: this.lastCheck?.toISOString(),
      orchestraStatus: await this.checkOrchestraStatus(),
      webSocketChannels: await this.checkWebSocketChannels(),
      regionalAgents: await this.checkRegionalAgents(),
      tradesCoherence: await this.checkTradesCoherence(),
      summary: {}
    };

    // Génère le résumé final
    results.summary = this.generateSummary(results);
    
    this.log('Diagnostic Complete', '✅ Orchestra diagnostic finished', results?.summary);
    
    return results;
  }

  // Génère le résumé final
  generateSummary(results) {
    const allActions = [
      ...(results?.orchestraStatus?.action !== 'none' ? [results?.orchestraStatus?.action] : []),
      ...results?.webSocketChannels?.actions,
      ...results?.regionalAgents?.actions,
      ...results?.tradesCoherence?.actions
    ];

    // Status des composants
    const orchestraStatus = results?.orchestraStatus?.status === 'active' ? '🟢 Active' : 
                           results?.orchestraStatus?.status === 'restarted' ? '🟡 Restarted' : '🔴 Error';
    
    const wsChannelsOk = Object.values(results?.webSocketChannels?.channels)?.every(s => s === 'ACTIVE');
    const wsStatus = wsChannelsOk ? '🟢 All Active' : '🟡 Some Issues';
    
    const agentsOk = Object.values(results?.regionalAgents?.agents)?.every(s => s === 'ACTIVE');
    const agentsStatus = agentsOk ? '🟢 All Active' : '🟡 Some Inactive';
    
    const tradesOk = Object.values(results?.tradesCoherence?.trades)?.every(t => t?.status === 'FRESH');
    const tradesStatus = tradesOk ? '🟢 All Fresh' : '🟡 Some Stale';

    const lastSignalTime = Math.min(...Object.values(results?.tradesCoherence?.trades)?.filter(t => t?.lastSignal)?.map(t => new Date(t.lastSignal)?.getTime()));

    return {
      chef_orchestra: orchestraStatus,
      flux_websocket: wsStatus,
      ia_regionales: `${agentsStatus} (${Object.keys(results?.regionalAgents?.agents)?.join(', ')})`,
      dernier_signal: new Date(lastSignalTime)?.toLocaleString('fr-FR'),
      actions_correctives: allActions?.length > 0 ? allActions : ['Aucune action requise'],
      global_health: allActions?.length === 0 ? '🟢 Système sain' : 
                    allActions?.length <= 3 ? '🟡 Corrections mineures' : '🔴 Intervention requise'
    };
  }

  // Auto-vérification toutes les 15 minutes
  startAutoCheck(intervalMinutes = 15) {
    if (this.autoCheckInterval) {
      clearInterval(this.autoCheckInterval);
    }

    this.autoCheckInterval = setInterval(async () => {
      try {
        await this.runCompleteDiagnostic();
      } catch (error) {
        this.log('Auto Check Error', `❌ ${error?.message}`, error);
      }
    }, intervalMinutes * 60 * 1000);

    this.log('Auto Check', `🔄 Started orchestra_self_check every ${intervalMinutes} minutes`, null);
  }

  stopAutoCheck() {
    if (this.autoCheckInterval) {
      clearInterval(this.autoCheckInterval);
      this.autoCheckInterval = null;
      this.log('Auto Check', '⏹ Stopped orchestra_self_check', null);
    }
  }

  // Méthodes utilitaires internes
  async getOrchestraStatus() {
    // Simulation - remplacer par l'appel réel
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ 
          active: Math.random() > 0.3, // 70% chance d'être actif
          lastHeartbeat: Date.now() - Math.random() * 60000 
        });
      }, 200);
    });
  }

  async isChannelEmpty(channel) {
    // Simulation - remplacer par l'appel réel au WebSocket
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(Math.random() > 0.8); // 20% chance d'être vide
      }, 100);
    });
  }

  async isAgentActive(agent) {
    // Simulation - remplacer par l'appel réel
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(Math.random() > 0.2); // 80% chance d'être actif
      }, 150);
    });
  }

  async getLastSignalTimestamp(agent) {
    // Simulation - remplacer par l'appel réel
    return new Promise(resolve => {
      setTimeout(() => {
        const randomMinutesAgo = Math.floor(Math.random() * 20); // 0-20 minutes ago
        resolve(Date.now() - (randomMinutesAgo * 60 * 1000));
      }, 100);
    });
  }

  async executeCommand(command, params = {}) {
    // Simulation - remplacer par l'appel réel
    return new Promise(resolve => {
      setTimeout(() => {
        this.log('Command Executed', `🔧 ${command}`, params);
        resolve({ success: true, command, params });
      }, 300);
    });
  }

  // Logging avec horodatage
  log(category, message, data) {
    const logEntry = {
      timestamp: new Date()?.toISOString(),
      category,
      message,
      data
    };
    
    this.diagnosticLogs?.push(logEntry);
    
    // Garde seulement les 100 derniers logs
    if (this.diagnosticLogs?.length > 100) {
      this.diagnosticLogs = this.diagnosticLogs?.slice(-100);
    }
    
    console.log(`[Orchestra] ${category}: ${message}`, data || '');
    
    // Émet l'événement pour le panneau "Diagnostic Live"
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('orchestra:diagnostic', {
        detail: logEntry
      }));
    }
  }

  // API publique pour l'interface
  getDiagnosticLogs() {
    return [...this.diagnosticLogs];
  }

  getLastCheckSummary() {
    if (this.diagnosticLogs?.length === 0) return null;
    
    const lastDiagnostic = this.diagnosticLogs?.reverse()?.find(log => 
      log?.category === 'Diagnostic Complete'
    );
    
    return lastDiagnostic?.data || null;
  }

  clearLogs() {
    this.diagnosticLogs = [];
    this.log('System', '🗑️ Diagnostic logs cleared', null);
  }
}

// Instance singleton
const orchestraDiagnosticService = new OrchestraDiagnosticService();

export default orchestraDiagnosticService;