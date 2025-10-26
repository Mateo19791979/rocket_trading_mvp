import { completeMarketStreamService } from './completeMarketDataStreamService.js';
import { aiAgentsService } from './aiAgentsService.js';
import { orchestratorService } from './orchestratorService.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env?.VITE_SUPABASE_URL || '',
  import.meta.env?.VITE_SUPABASE_ANON_KEY || ''
);

/**
 * 🤖 ACTIVATEUR FLUX IA
 * 
 * Service discret qui active automatiquement le flux complet pour les IA
 * S'exécute en arrière-plan sans modifications d'interface
 */

class AIStreamActivatorService {
  constructor() {
    this.isInitialized = false;
    this.activationAttempts = 0;
    this.maxActivationAttempts = 3;
    this.healthCheckInterval = null;
  }

  /**
   * 🚀 INITIALISATION AUTOMATIQUE
   * Lance le flux complet dès que l'application démarre
   */
  async initialize() {
    if (this.isInitialized) return;

    console.log('🤖 Initialisation activateur flux IA...');
    
    try {
      // Attendre que les services soient prêts
      await this.waitForServicesReady();
      
      // Activation du flux complet
      await this.activateCompleteStream();
      
      // Surveillance continue
      this.startHealthMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Activateur flux IA initialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur initialisation activateur:', error);
      this.scheduleRetry();
    }
  }

  /**
   * ⏳ ATTENTE SERVICES PRÊTS
   */
  async waitForServicesReady() {
    const maxWait = 10000; // 10 secondes
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      try {
        // Vérification que les services essentiels sont opérationnels
        const servicesReady = await this.checkServicesHealth();
        
        if (servicesReady) {
          console.log('✅ Services prêts pour activation flux');
          return;
        }
        
        await this.delay(1000); // Attendre 1 seconde
        
      } catch (error) {
        await this.delay(1000);
      }
    }
    
    console.log('⚠️ Services partiellement prêts, activation quand même');
  }

  /**
   * 🏥 VÉRIFICATION SANTÉ SERVICES
   */
  async checkServicesHealth() {
    try {
      // Vérifier Supabase
      const { error } = await supabase?.from('ai_agents')?.select('count')?.limit(1);
      if (error) throw error;
      
      // Vérifier orchestrateur (optionnel)
      let orchestratorReady = true;
      try {
        await orchestratorService?.checkApiAvailability();
      } catch {
        orchestratorReady = false; // Non critique
      }
      
      return true; // Supabase suffit pour le fonctionnement
      
    } catch (error) {
      return false;
    }
  }

  /**
   * 🚀 ACTIVATION FLUX COMPLET
   */
  async activateCompleteStream() {
    console.log('🌊 Activation flux marché complet pour IA...');
    
    try {
      // Activation du service de flux complet
      await completeMarketStreamService?.activate();
      
      // Notification aux IA que le flux est disponible
      await this.notifyAIAgentsStreamReady();
      
      // Configuration des IA pour utiliser le nouveau flux
      await this.configureAIForCompleteStream();
      
      console.log('🎯 FLUX COMPLET ACTIVÉ - IA ALIMENTÉES');
      
    } catch (error) {
      console.error('❌ Erreur activation flux:', error);
      throw error;
    }
  }

  /**
   * 📢 NOTIFICATION IA FLUX PRÊT
   */
  async notifyAIAgentsStreamReady() {
    try {
      // Récupération de tous les agents IA
      const agentGroups = await aiAgentsService?.getAgentsByGroup();
      const allAgents = Object.values(agentGroups)?.flat();
      
      console.log(`📡 Notification à ${allAgents?.length} agents IA...`);
      
      // Notification via EventBus
      for (const agent of allAgents) {
        await aiAgentsService?.createEvent(
          'complete_stream_available',
          'stream_activator',
          agent?.id,
          {
            stream_type: 'complete_market_data',
            capabilities: {
              markets: ['crypto', 'forex', 'equities', 'commodities'],
              timeframes: ['1s', '1m', '5m', '15m', '1h', '4h', '1d'],
              indicators: ['volume', 'oi', 'flow', 'sentiment'],
              real_time: true,
              ai_optimized: true
            },
            activation_time: new Date()?.toISOString(),
            message: 'Flux complet activé - Innovation IA autorisée'
          },
          'high'
        );
      }
      
      console.log('✅ Tous les agents IA notifiés du nouveau flux');
      
    } catch (error) {
      console.error('❌ Erreur notification IA:', error);
    }
  }

  /**
   * ⚙️ CONFIGURATION IA FLUX COMPLET
   */
  async configureAIForCompleteStream() {
    try {
      const agentGroups = await aiAgentsService?.getAgentsByGroup();
      
      // Configuration spécialisée par groupe d'IA
      await this.configureIngestionAgents(agentGroups?.ingestion || []);
      await this.configureSignalAgents(agentGroups?.signals || []);
      await this.configureExecutionAgents(agentGroups?.execution || []);
      await this.configureOrchestrationAgents(agentGroups?.orchestration || []);
      
      console.log('🎛️ Configuration IA pour flux complet terminée');
      
    } catch (error) {
      console.error('❌ Erreur configuration IA:', error);
    }
  }

  /**
   * 📥 CONFIGURATION AGENTS INGESTION
   */
  async configureIngestionAgents(agents) {
    for (const agent of agents) {
      try {
        const newConfig = {
          ...agent?.configuration,
          data_sources: {
            complete_stream: true,
            crypto_pairs: 200,
            forex_pairs: 50,
            equity_symbols: 100,
            commodity_symbols: 20,
            timeframes: ['1s', '1m', '5m', '15m', '1h', '4h', '1d'],
            real_time: true
          },
          processing_mode: 'high_frequency',
          ai_enhancement: 'active'
        };
        
        await aiAgentsService?.updateAgentConfiguration(agent?.id, newConfig);
        console.log(`✅ Agent ingestion ${agent?.name} configuré pour flux complet`);
        
      } catch (error) {
        console.error(`❌ Erreur config agent ${agent?.name}:`, error);
      }
    }
  }

  /**
   * 📊 CONFIGURATION AGENTS SIGNAUX
   */
  async configureSignalAgents(agents) {
    for (const agent of agents) {
      try {
        const newConfig = {
          ...agent?.configuration,
          signal_generation: {
            cross_market: true,
            correlation_hunting: true,
            arbitrage_detection: true,
            sentiment_integration: true,
            news_impact: true,
            micro_patterns: true
          },
          innovation_mode: 'autonomous',
          learning_rate: 'adaptive'
        };
        
        await aiAgentsService?.updateAgentConfiguration(agent?.id, newConfig);
        console.log(`✅ Agent signaux ${agent?.name} configuré pour innovation`);
        
      } catch (error) {
        console.error(`❌ Erreur config agent ${agent?.name}:`, error);
      }
    }
  }

  /**
   * ⚡ CONFIGURATION AGENTS EXÉCUTION
   */
  async configureExecutionAgents(agents) {
    for (const agent of agents) {
      try {
        const newConfig = {
          ...agent?.configuration,
          execution_capabilities: {
            multi_market: true,
            micro_arbitrage: true,
            millisecond_precision: true,
            risk_adaptation: 'dynamic',
            position_sizing: 'ai_optimized'
          },
          stream_integration: 'direct',
          latency_optimization: true
        };
        
        await aiAgentsService?.updateAgentConfiguration(agent?.id, newConfig);
        console.log(`✅ Agent exécution ${agent?.name} configuré pour trading avancé`);
        
      } catch (error) {
        console.error(`❌ Erreur config agent ${agent?.name}:`, error);
      }
    }
  }

  /**
   * 🎯 CONFIGURATION AGENTS ORCHESTRATION
   */
  async configureOrchestrationAgents(agents) {
    for (const agent of agents) {
      try {
        const newConfig = {
          ...agent?.configuration,
          orchestration_scope: {
            global_coordination: true,
            cross_market_strategies: true,
            agent_collaboration: 'enhanced',
            resource_allocation: 'dynamic',
            performance_optimization: 'continuous'
          },
          ai_governance: 'autonomous',
          innovation_oversight: 'permissive'
        };
        
        await aiAgentsService?.updateAgentConfiguration(agent?.id, newConfig);
        console.log(`✅ Agent orchestration ${agent?.name} configuré pour coordination globale`);
        
      } catch (error) {
        console.error(`❌ Erreur config agent ${agent?.name}:`, error);
      }
    }
  }

  /**
   * 🏥 SURVEILLANCE CONTINUE
   */
  startHealthMonitoring() {
    console.log('🔍 Démarrage surveillance flux IA...');
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        const streamStatus = completeMarketStreamService?.getStatus();
        
        if (!streamStatus?.isActive) {
          console.log('⚠️ Flux inactif détecté, tentative réactivation...');
          await this.reactivateStream();
        }
        
        // Vérification santé agents IA
        await this.checkAIAgentsHealth();
        
      } catch (error) {
        console.error('❌ Erreur surveillance:', error);
      }
    }, 30000); // Toutes les 30 secondes
  }

  /**
   * 🔄 RÉACTIVATION FLUX
   */
  async reactivateStream() {
    try {
      if (this.activationAttempts >= this.maxActivationAttempts) {
        console.log('🚫 Limite tentatives atteinte, arrêt réactivation automatique');
        return;
      }
      
      this.activationAttempts++;
      console.log(`🔄 Tentative réactivation ${this.activationAttempts}/${this.maxActivationAttempts}...`);
      
      await completeMarketStreamService?.activate();
      await this.notifyAIAgentsStreamReady();
      
      this.activationAttempts = 0; // Reset sur succès
      console.log('✅ Flux réactivé avec succès');
      
    } catch (error) {
      console.error(`❌ Échec réactivation tentative ${this.activationAttempts}:`, error);
    }
  }

  /**
   * 🤖 VÉRIFICATION SANTÉ IA
   */
  async checkAIAgentsHealth() {
    try {
      const agentsOverview = await aiAgentsService?.getAgentsOverview();
      
      if (agentsOverview?.errors > 0) {
        console.log(`⚠️ ${agentsOverview?.errors} agents IA en erreur détectés`);
        // Optionnel: actions de récupération
      }
      
      if (agentsOverview?.totalActive < agentsOverview?.total / 2) {
        console.log('⚠️ Moins de 50% des agents IA actifs');
        // Optionnel: alertes
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification santé IA:', error);
    }
  }

  /**
   * 🔄 PLANIFICATION RETRY
   */
  scheduleRetry() {
    const retryDelay = Math.min(5000 * Math.pow(2, this.activationAttempts), 30000);
    
    console.log(`🔄 Nouvelle tentative dans ${retryDelay/1000}s...`);
    
    setTimeout(() => {
      if (this.activationAttempts < this.maxActivationAttempts) {
        this.initialize();
      }
    }, retryDelay);
  }

  /**
   * 🛑 ARRÊT SERVICE
   */
  async stop() {
    console.log('🛑 Arrêt activateur flux IA...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Arrêt du flux complet
    await completeMarketStreamService?.deactivate();
    
    // Notification arrêt aux IA
    await this.notifyAIAgentsStreamStopped();
    
    this.isInitialized = false;
    console.log('✅ Activateur flux IA arrêté');
  }

  /**
   * 📢 NOTIFICATION ARRÊT AUX IA
   */
  async notifyAIAgentsStreamStopped() {
    try {
      const agentGroups = await aiAgentsService?.getAgentsByGroup();
      const allAgents = Object.values(agentGroups)?.flat();
      
      for (const agent of allAgents) {
        await aiAgentsService?.createEvent(
          'complete_stream_stopped',
          'stream_activator',
          agent?.id,
          {
            reason: 'service_shutdown',
            timestamp: new Date()?.toISOString(),
            fallback_available: true
          },
          'medium'
        );
      }
      
    } catch (error) {
      console.error('❌ Erreur notification arrêt:', error);
    }
  }

  /**
   * 📊 STATUS SERVICE
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      activationAttempts: this.activationAttempts,
      healthMonitoring: !!this.healthCheckInterval,
      streamStatus: completeMarketStreamService?.getStatus(),
      timestamp: new Date()?.toISOString()
    };
  }

  // Utilitaire
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton
const aiStreamActivatorService = new AIStreamActivatorService();

// Auto-initialisation
setTimeout(() => {
  console.log('🚀 Auto-initialisation activateur flux IA...');
  aiStreamActivatorService?.initialize();
}, 3000); // 3 secondes après chargement

export default aiStreamActivatorService;
export { aiStreamActivatorService };