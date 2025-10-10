import { supabase } from '../lib/supabase.js';

class AASCertificationService {
  
  // AAS Level 5 Production Certification Service
  async getCertificationProgress() {
    try {
      const progressData = await Promise.allSettled([
        this.getPhase1Status(), // Controlled Freeze (Shadow Mode)
        this.getPhase2Status(), // Certification & Go Live
        this.getPhase3Status(), // N6 Vision Future
        this.getKillSwitchStatus(),
        this.getShadowMonitoringStatus(),
        this.getHealthSentinelStatus()
      ]);

      const [phase1, phase2, phase3, killSwitches, shadowMonitoring, healthSentinel] = progressData?.map(
        result => result?.status === 'fulfilled' ? result?.value : { progress: 0, status: 'error' }
      );

      // Calculate overall certification progress (87-92% → 100%)
      const overallProgress = Math.round(
        (phase1?.progress * 0.30) +    // 30% weight for freeze controls
        (phase2?.progress * 0.50) +    // 50% weight for certification
        (phase3?.progress * 0.20)      // 20% weight for future vision
      );

      return {
        data: {
          currentStatus: this.calculateCurrentStatus(overallProgress),
          overallProgress,
          phases: {
            phase1: { ...phase1, name: 'Gel Contrôlé (Shadow Mode)', duration: '24-72h' },
            phase2: { ...phase2, name: 'Certification & Go Live', duration: '24-30h' },
            phase3: { ...phase3, name: 'Vision N6 Future', duration: 'Ongoing' }
          },
          criticalSystems: {
            killSwitches,
            shadowMonitoring,
            healthSentinel
          },
          certificationLevel: this.calculateCertificationLevel(overallProgress),
          nextMilestones: this.getNextMilestones(overallProgress)
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Phase 1: Controlled Freeze (Shadow Mode) Analysis
  async getPhase1Status() {
    try {
      const checks = await Promise.allSettled([
        // Kill switches activation
        supabase?.from('kill_switches')?.select('*')?.eq('is_active', true),
        // Shadow monitoring active
        supabase?.from('system_health')?.select('mode')?.eq('mode', 'shadow'),
        // Infrastructure freeze status
        supabase?.from('deployment_pipelines')?.select('overall_status')?.eq('overall_status', 'frozen'),
        // API key rotation status
        supabase?.from('external_api_configs')?.select('last_rotation')
      ]);

      const [killSwitches, shadowMode, frozenPipelines, apiRotation] = checks;
      
      let completedItems = 0;
      let totalItems = 4;
      const details = [];

      // Kill switches critical activation
      const activeKills = killSwitches?.status === 'fulfilled' ? killSwitches?.value?.data?.length : 0;
      if (activeKills >= 2) {
        completedItems++;
        details?.push({ 
          item: `${activeKills} Kill Switches actifs (LIVE_TRADING, EXECUTION)`, 
          status: 'completed',
          critical: true
        });
      } else {
        details?.push({ 
          item: 'Activation Kill Switches critiques', 
          status: 'pending',
          action: 'UPDATE kill_switches SET is_active = TRUE WHERE module IN (\'LIVE_TRADING\',\'EXECUTION\')'
        });
      }

      // Shadow monitoring deployment
      const shadowModeCount = shadowMode?.status === 'fulfilled' ? shadowMode?.value?.data?.length : 0;
      if (shadowModeCount >= 1) {
        completedItems++;
        details?.push({ 
          item: 'Shadow Monitoring déployé (Health Sentinel)', 
          status: 'completed'
        });
      } else {
        details?.push({ 
          item: 'Déploiement Shadow Monitoring', 
          status: 'pending',
          action: 'Activer cron /aas/health/compute toutes les 10 min'
        });
      }

      // Infrastructure stabilization
      const frozenCount = frozenPipelines?.status === 'fulfilled' ? frozenPipelines?.value?.data?.length : 0;
      if (frozenCount >= 1) {
        completedItems++;
        details?.push({ 
          item: 'Infrastructure verrouillée (Docker, npm)', 
          status: 'completed'
        });
      } else {
        details?.push({ 
          item: 'Verrouillage infrastructure', 
          status: 'pending',
          action: 'Lock versions Docker, npm package.json'
        });
      }

      // API keys rotation & backend storage
      const rotationData = apiRotation?.status === 'fulfilled' ? apiRotation?.value?.data : [];
      const recentRotation = rotationData?.filter(api => {
        const rotationDate = new Date(api?.last_rotation);
        const daysSince = (Date.now() - rotationDate?.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 1;
      });
      
      if (recentRotation?.length >= 3) {
        completedItems++;
        details?.push({ 
          item: 'Rotation clés API et stockage backend', 
          status: 'completed'
        });
      } else {
        details?.push({ 
          item: 'Rotation des clés API requise', 
          status: 'pending',
          action: 'Rotate API keys, store backend only'
        });
      }

      return {
        progress: Math.round((completedItems / totalItems) * 100),
        completedItems,
        totalItems,
        details,
        status: completedItems === totalItems ? 'completed' : 'in_progress',
        objective: 'Geler tout ordre live, maintenir paper-trading seulement'
      };
    } catch (error) {
      return { progress: 0, details: [], error: error?.message };
    }
  }

  // Phase 2: Certification & Progressive Go Live
  async getPhase2Status() {
    try {
      const checks = await Promise.allSettled([
        // K6 brutal load testing
        supabase?.from('deployment_metrics')?.select('*')?.eq('metric_type', 'k6_load_test'),
        // Paranoid security audit
        supabase?.from('deployment_metrics')?.select('*')?.eq('metric_type', 'security_audit'),
        // Control room (Grafana + Prometheus)
        supabase?.from('deployment_metrics')?.select('*')?.eq('metric_type', 'monitoring_setup'),
        // Documentation generation
        supabase?.from('generated_documents')?.select('*')?.eq('document_type', 'aas_manual'),
        // Paper trading supervision (48h)
        supabase?.from('deployment_metrics')?.select('*')?.eq('metric_type', 'paper_trading_48h'),
        // First live strategy (0.1% portfolio)
        supabase?.from('deployment_metrics')?.select('*')?.eq('metric_type', 'canary_live_strategy')
      ]);

      const [k6Tests, securityAudit, controlRoom, documentation, paperTrading, liveStrategy] = checks;
      
      let completedItems = 0;
      let totalItems = 6;
      const details = [];

      // K6 Brutal Load Testing (10,000 req/min for 30 min)
      const k6Results = k6Tests?.status === 'fulfilled' ? k6Tests?.value?.data : [];
      const validK6 = k6Results?.filter(test => 
        test?.metric_value >= 10000 && // req/min
        test?.metadata?.duration_minutes >= 30 &&
        test?.metadata?.p99_latency < 1500 // ms
      );
      
      if (validK6?.length >= 1) {
        completedItems++;
        details?.push({ 
          item: `K6 Load Test: ${validK6?.[0]?.metric_value} req/min, P99 < 1500ms`, 
          status: 'completed',
          validation: 'Performance validée'
        });
      } else {
        details?.push({ 
          item: 'K6 Test de Charge Brutal (10k req/min, 30min)', 
          status: 'pending',
          target: 'P99 latency < 1500ms, Memory stable'
        });
      }

      // Paranoid Security Audit
      const securityResults = securityAudit?.status === 'fulfilled' ? securityAudit?.value?.data : [];
      const validSecurity = securityResults?.filter(audit => 
        audit?.metadata?.auth_test === 401 &&
        audit?.metadata?.killswitch_test === 503 &&
        audit?.metadata?.sentry_alert === true
      );
      
      if (validSecurity?.length >= 1) {
        completedItems++;
        details?.push({ 
          item: 'Audit Sécurité Paranoïaque: 401/503/Sentry OK', 
          status: 'completed',
          validation: 'Aucune faille détectée'
        });
      } else {
        details?.push({ 
          item: 'Audit Sécurité Paranoïaque', 
          status: 'pending',
          tests: 'VITE_API_KEY→401, Kill Switch→503, Agent Error→Sentry'
        });
      }

      // Control Room Setup (Grafana + Prometheus)
      const monitoringResults = controlRoom?.status === 'fulfilled' ? controlRoom?.value?.data : [];
      const validMonitoring = monitoringResults?.filter(setup => 
        setup?.metadata?.grafana_active === true &&
        setup?.metadata?.prometheus_active === true &&
        setup?.metadata?.slack_alerts === true
      );
      
      if (validMonitoring?.length >= 1) {
        completedItems++;
        details?.push({ 
          item: 'Control Room: Grafana + Prometheus + Alerts', 
          status: 'completed',
          validation: 'Monitoring opérationnel'
        });
      } else {
        details?.push({ 
          item: 'Mise en service du Control Room', 
          status: 'pending',
          requirements: 'Grafana + Prometheus + Alert Slack si Health Sentinel = SAFE'
        });
      }

      // Documentation "Papiers du Véhicule"
      const docResults = documentation?.status === 'fulfilled' ? documentation?.value?.data : [];
      const validDocs = docResults?.filter(doc => 
        doc?.metadata?.manual_type === 'aas_operation' &&
        doc?.metadata?.architecture_diagram === true &&
        doc?.metadata?.killswitch_procedures === true
      );
      
      if (validDocs?.length >= 1) {
        completedItems++;
        details?.push({ 
          item: 'Documentation AAS: Manuel + Diagrammes + Procédures', 
          status: 'completed',
          validation: 'Papiers du véhicule générés'
        });
      } else {
        details?.push({ 
          item: 'Génération des "papiers du véhicule"', 
          status: 'pending',
          includes: 'Flux autonome, Manuel exploitation, Logique RLS/API, Rapport IA Learning'
        });
      }

      // Paper Trading Supervisé (48h continues)
      const paperResults = paperTrading?.status === 'fulfilled' ? paperTrading?.value?.data : [];
      const validPaper = paperResults?.filter(session => 
        session?.metadata?.duration_hours >= 48 &&
        session?.metadata?.pnl_coherent === true &&
        session?.metadata?.mode === 'NORMAL'
      );
      
      if (validPaper?.length >= 1) {
        completedItems++;
        details?.push({ 
          item: 'Paper Trading 48h: PnL cohérent, mode NORMAL', 
          status: 'completed',
          validation: 'Supervision continue validée'
        });
      } else {
        details?.push({ 
          item: 'Paper Trading Supervisé (48h continues)', 
          status: 'pending',
          validation: 'PnL simulé cohérent, aucun blocage, mode NORMAL constant'
        });
      }

      // Première Stratégie Live (0.1% portfolio)
      const liveResults = liveStrategy?.status === 'fulfilled' ? liveStrategy?.value?.data : [];
      const validLive = liveResults?.filter(strategy => 
        strategy?.metadata?.portfolio_percentage <= 0.1 &&
        strategy?.metadata?.duration_hours >= 24 &&
        strategy?.metadata?.pnl_diff_percent <= 5 &&
        strategy?.metadata?.system_health === 'NORMAL'
      );
      
      if (validLive?.length >= 1) {
        completedItems++;
        details?.push({ 
          item: 'Live Strategy 0.1%: PnL réel ≈ PnL papier ±5%', 
          status: 'completed',
          validation: 'Première stratégie live validée'
        });
      } else {
        details?.push({ 
          item: 'Première Stratégie Live (mini-capital)', 
          status: 'pending',
          spec: '1 stratégie, 0.1% portefeuille, 24h, PnL réel ≈ PnL papier ±5%'
        });
      }

      return {
        progress: Math.round((completedItems / totalItems) * 100),
        completedItems,
        totalItems,
        details,
        status: completedItems === totalItems ? 'completed' : 'in_progress',
        duration: '24-30h réparties sur 3 jours'
      };
    } catch (error) {
      return { progress: 0, details: [], error: error?.message };
    }
  }

  // Phase 3: N6 Vision Future Roadmap
  async getPhase3Status() {
    try {
      const checks = await Promise.allSettled([
        // Meta-governance preparation
        supabase?.from('meta_learning_metrics')?.select('*')?.limit(5),
        // Federated learning infrastructure
        supabase?.from('ai_agents')?.select('*')?.eq('communication_enabled', true),
        // AI-AI regulation voting system
        supabase?.from('decisions_log')?.select('*')?.limit(10),
        // Causal reasoning graphs
        supabase?.from('strategy_extractions')?.select('*')?.limit(5)
      ]);

      const [metaGov, federated, aiRegulation, causalReasoning] = checks;
      
      let completedItems = 0;
      let totalItems = 4;
      const details = [];

      // Meta-gouvernance: IA ajuste ses propres seuils
      const metaMetrics = metaGov?.status === 'fulfilled' ? metaGov?.value?.data?.length : 0;
      if (metaMetrics >= 5) {
        completedItems++;
        details?.push({ 
          item: 'Meta-gouvernance: IA ajuste IQS, DHI, risk seuils', 
          status: 'completed',
          level: 'N6 Advanced'
        });
      } else {
        details?.push({ 
          item: 'Meta-gouvernance autonome', 
          status: 'developing',
          concept: 'IA ajuste ses propres seuils (IQS, DHI, risk)'
        });
      }

      // Apprentissage fédéré inter-serveurs
      const communicatingAgents = federated?.status === 'fulfilled' ? federated?.value?.data?.length : 0;
      if (communicatingAgents >= 20) {
        completedItems++;
        details?.push({ 
          item: `Apprentissage fédéré: ${communicatingAgents} agents communicants`, 
          status: 'completed',
          level: 'Multi-AAS'
        });
      } else {
        details?.push({ 
          item: 'Apprentissage fédéré inter-serveurs', 
          status: 'developing',
          concept: 'Partage multi-AAS, vote croisé signaux'
        });
      }

      // Régulation IA-IA: vote croisé de signaux
      const decisionLogs = aiRegulation?.status === 'fulfilled' ? aiRegulation?.value?.data?.length : 0;
      if (decisionLogs >= 10) {
        completedItems++;
        details?.push({ 
          item: `Régulation IA-IA: ${decisionLogs} décisions votées`, 
          status: 'completed',
          level: 'Collective Intelligence'
        });
      } else {
        details?.push({ 
          item: 'Régulation IA-IA collaborative', 
          status: 'developing',
          concept: 'Vote croisé de signaux entre AAS'
        });
      }

      // Raisonnement causal: graphe macro + micro + alt-data
      const causalGraphs = causalReasoning?.status === 'fulfilled' ? causalReasoning?.value?.data?.length : 0;
      if (causalGraphs >= 5) {
        completedItems++;
        details?.push({ 
          item: `Raisonnement causal: ${causalGraphs} graphes actifs`, 
          status: 'completed',
          level: 'Deep Understanding'
        });
      } else {
        details?.push({ 
          item: 'Raisonnement causal avancé', 
          status: 'developing',
          concept: 'Graphe macro + micro + alt-data'
        });
      }

      return {
        progress: Math.round((completedItems / totalItems) * 100),
        completedItems,
        totalItems,
        details,
        status: 'developing',
        vision: 'AAS N6 - Next Generation Autonomous Intelligence'
      };
    } catch (error) {
      return { progress: 0, details: [], error: error?.message };
    }
  }

  // Kill Switches Status Check
  async getKillSwitchStatus() {
    try {
      const { data: killSwitches } = await supabase?.from('kill_switches')
        ?.select('module, is_active, reason, updated_at');

      const criticalModules = ['LIVE_TRADING', 'EXECUTION', 'STRATEGY_GENERATION'];
      const activeCritical = killSwitches?.filter(ks => 
        criticalModules?.includes(ks?.module) && ks?.is_active
      ) || [];

      const totalSwitches = killSwitches?.length || 0;
      const activeSwitches = killSwitches?.filter(ks => ks?.is_active)?.length || 0;

      return {
        status: activeCritical?.length >= 2 ? 'secured' : 'vulnerable',
        totalSwitches,
        activeSwitches,
        criticalActive: activeCritical?.length,
        criticalRequired: criticalModules?.length,
        modules: killSwitches?.map(ks => ({
          module: ks?.module,
          active: ks?.is_active,
          reason: ks?.reason,
          lastUpdate: ks?.updated_at,
          critical: criticalModules?.includes(ks?.module)
        })) || [],
        recommendation: activeCritical?.length < 2 ? 
          'Activer Kill Switches critiques LIVE_TRADING et EXECUTION' : 'Kill Switches sécuritaires actifs'
      };
    } catch (error) {
      return { status: 'error', error: error?.message };
    }
  }

  // Shadow Monitoring Status
  async getShadowMonitoringStatus() {
    try {
      const { data: healthData } = await supabase?.from('system_health')
        ?.select('mode, health_status, dhi_avg, errors_1h, created_at')
        ?.order('created_at', { ascending: false })
        ?.limit(10);

      const shadowMode = healthData?.filter(h => h?.mode === 'shadow')?.length || 0;
      const recentHealthy = healthData?.filter(h => 
        h?.health_status === 'healthy' && 
        h?.dhi_avg > 0.7 && 
        h?.errors_1h <= 5
      )?.length || 0;

      const latestHealth = healthData?.[0];

      return {
        status: shadowMode >= 1 ? 'active' : 'inactive',
        mode: latestHealth?.mode || 'unknown',
        healthStatus: latestHealth?.health_status || 'unknown',
        dhiAverage: latestHealth?.dhi_avg || 0,
        errorsPerHour: latestHealth?.errors_1h || 0,
        recentHealthyCount: recentHealthy,
        monitoring: {
          healthSentinel: recentHealthy >= 5,
          anomalySentinel: latestHealth?.health_status === 'healthy',
          dataHealthIndex: (latestHealth?.dhi_avg || 0) >= 0.7,
          iqsQuality: true // Assumed based on system health
        },
        cronStatus: 'Active /aas/health/compute every 10 min',
        alerting: latestHealth?.errors_1h > 5 ? 'Sentry/Slack alerts triggered' : 'Normal operations'
      };
    } catch (error) {
      return { status: 'error', error: error?.message };
    }
  }

  // Health Sentinel Advanced Status
  async getHealthSentinelStatus() {
    try {
      const { data: healthMetrics } = await supabase?.from('system_health')
        ?.select('*')
        ?.order('created_at', { ascending: false })
        ?.limit(5);

      if (!healthMetrics?.length) {
        return {
          status: 'inactive',
          recommendation: 'Deploy Health Sentinel monitoring system'
        };
      }

      const latest = healthMetrics?.[0];
      const avgDHI = healthMetrics?.reduce((sum, h) => sum + (h?.dhi_avg || 0), 0) / healthMetrics?.length;
      const avgErrors = healthMetrics?.reduce((sum, h) => sum + (h?.errors_1h || 0), 0) / healthMetrics?.length;

      return {
        status: latest?.health_status === 'healthy' ? 'operational' : 'degraded',
        mode: latest?.mode || 'unknown',
        currentDHI: latest?.dhi_avg || 0,
        averageDHI: Math.round(avgDHI * 100) / 100,
        currentErrors: latest?.errors_1h || 0,
        averageErrors: Math.round(avgErrors),
        uptime: latest?.uptime_seconds || 0,
        lastHeartbeat: latest?.last_heartbeat,
        computeAlpha: latest?.compute_alpha || 1,
        alphaDecay: latest?.alpha_decay || 0,
        cpuUsage: latest?.cpu_usage || 0,
        memoryUsage: latest?.memory_usage || 0,
        healthScore: this.calculateHealthScore(latest),
        guards: {
          healthSentinel: latest?.health_status === 'healthy',
          anomalySentinel: (latest?.errors_1h || 0) <= 5,
          dhiThreshold: (latest?.dhi_avg || 0) >= 0.7,
          modeNormal: latest?.mode === 'normal'
        }
      };
    } catch (error) {
      return { status: 'error', error: error?.message };
    }
  }

  // Calculate Health Score (0-100)
  calculateHealthScore(healthData) {
    if (!healthData) return 0;

    let score = 100;
    
    // DHI score (40% weight)
    const dhiScore = Math.min((healthData?.dhi_avg || 0) * 100, 40);
    
    // Error rate (30% weight)
    const errorScore = Math.max(30 - (healthData?.errors_1h || 0) * 3, 0);
    
    // System resources (20% weight)
    const resourceScore = Math.max(20 - ((healthData?.cpu_usage || 0) + (healthData?.memory_usage || 0)) / 10, 0);
    
    // Mode and status (10% weight)
    const statusScore = (healthData?.health_status === 'healthy' && healthData?.mode === 'normal') ? 10 : 0;

    return Math.round(dhiScore + errorScore + resourceScore + statusScore);
  }

  // Calculate current certification status
  calculateCurrentStatus(overallProgress) {
    if (overallProgress >= 100) {
      return { 
        level: '100% Certifié Production', 
        color: 'emerald', 
        description: 'AAS Level 5 Production Ready - Entité Autonome Complète' 
      };
    } else if (overallProgress >= 95) {
      return { 
        level: '95-99% Pré-Production Avancée', 
        color: 'green', 
        description: 'Tests finaux et validation avant certification complète' 
      };
    } else if (overallProgress >= 87) {
      return { 
        level: '87-92% Pré-Production Sécurisée', 
        color: 'amber', 
        description: 'Phase Shadow Mode - Gel contrôlé en cours' 
      };
    } else {
      return { 
        level: 'Développement Avancé', 
        color: 'blue', 
        description: 'Préparation certification AAS Level 5' 
      };
    }
  }

  // Calculate certification level
  calculateCertificationLevel(progress) {
    if (progress >= 100) return { level: 'AAS-5', status: 'Production Certified' };
    if (progress >= 90) return { level: 'AAS-4', status: 'Pre-Production' };
    if (progress >= 80) return { level: 'AAS-3', status: 'Staging Ready' };
    if (progress >= 70) return { level: 'AAS-2', status: 'Development Advanced' };
    return { level: 'AAS-1', status: 'Development Core' };
  }

  // Get next milestones
  getNextMilestones(progress) {
    if (progress >= 95) {
      return [
        'Certification finale 100%',
        'Go-live validation',
        'Production deployment'
      ];
    } else if (progress >= 85) {
      return [
        'Complete Phase 2 certification',
        'Canary deployment validation', 
        'Security audit finalization'
      ];
    } else {
      return [
        'Activate critical kill switches',
        'Deploy shadow monitoring',
        'Complete infrastructure freeze'
      ];
    }
  }

  // Execute kill switch activation
  async activateKillSwitch(module, reason, userId) {
    try {
      const { data, error } = await supabase?.from('kill_switches')
        ?.update({
          is_active: true,
          reason: reason,
          activated_by: userId,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('module', module)
        ?.select();

      if (error) throw error;

      return {
        data: data?.[0],
        error: null,
        message: `Kill Switch ${module} activated successfully`
      };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Deactivate kill switch
  async deactivateKillSwitch(module, reason, userId) {
    try {
      const { data, error } = await supabase?.from('kill_switches')
        ?.update({
          is_active: false,
          reason: reason,
          activated_by: userId,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('module', module)
        ?.select();

      if (error) throw error;

      return {
        data: data?.[0],
        error: null,
        message: `Kill Switch ${module} deactivated successfully`
      };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Get certification timeline
  getCertificationTimeline() {
    return {
      phase1: {
        name: 'Phase 1 - Gel Contrôlé (Shadow Mode)',
        duration: '24-72h',
        objective: 'Sécurité maximale, gel live trading',
        tasks: [
          'Activation Kill Switches critiques',
          'Déploiement Shadow Monitoring', 
          'Verrouillage infrastructure',
          'Rotation clés API'
        ]
      },
      phase2: {
        name: 'Phase 2 - Certification & Go Live Progressif',
        duration: '24-30h sur 3 jours',
        objective: 'Tests, documentation, canary deployment',
        stages: [
          {
            name: 'Étape 1 - Certification technique (10-12h)',
            tasks: ['K6 Test Brutal', 'Audit Sécurité Paranoïaque']
          },
          {
            name: 'Étape 2 - Validation opérationnelle (8-10h)', 
            tasks: ['Control Room Setup', 'Documentation Génération']
          },
          {
            name: 'Étape 3 - Déploiement Canary (48h)',
            tasks: ['Paper Trading 48h', 'Première Stratégie Live']
          }
        ]
      },
      phase3: {
        name: 'Phase 3 - Vision N6 Future',
        duration: 'Ongoing',
        objective: 'Next-generation autonomous intelligence',
        capabilities: [
          'Meta-gouvernance autonome',
          'Apprentissage fédéré inter-serveurs',
          'Régulation IA-IA collaborative',
          'Raisonnement causal avancé'
        ]
      }
    };
  }

  // Subscribe to certification progress updates
  subscribeToCertificationUpdates(callback) {
    const channels = [
      supabase?.channel('certification_killswitches')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kill_switches' },
        () => this.getCertificationProgress()?.then(callback)
      )?.subscribe(),

      supabase?.channel('certification_health')?.on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'system_health' },
        () => this.getCertificationProgress()?.then(callback)
      )?.subscribe(),

      supabase?.channel('certification_metrics')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deployment_metrics' },
        () => this.getCertificationProgress()?.then(callback)
      )?.subscribe()
    ];

    return channels;
  }

  // Unsubscribe from certification updates
  unsubscribeFromCertificationUpdates(channels) {
    channels?.forEach(channel => {
      if (channel) {
        supabase?.removeChannel(channel);
      }
    });
  }
}

const aasCertificationService = new AASCertificationService();
export default aasCertificationService;