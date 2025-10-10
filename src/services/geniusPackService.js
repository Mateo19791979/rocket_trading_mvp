import { supabase } from '../lib/supabase.js';
import omegaAIService from './omegaAIService.js';
import syntheticMarketService from './syntheticMarketService.js';
import attentionMarketService from './attentionMarketService.js';

/**
 * AAS Genius Pack Service - Unified Interface
 * Coordinates all three Genius Pack modules:
 * - Omega AI (Adversarial Twin)
 * - Synthetic Market (Forward Testing)
 * - Attention Market (Resource Allocation)
 */

// Initialize and orchestrate all Genius Pack modules
export async function initializeGeniusPackModules() {
  try {
    // Get current system state
    const [omegaStats, forwardTestAnalytics, marketState] = await Promise.allSettled([
      omegaAIService?.getOmegaAttackStatistics(),
      syntheticMarketService?.getForwardTestAnalytics(),
      attentionMarketService?.getMarketState()
    ]);

    const systemStatus = {
      omegaAI: {
        status: omegaStats?.status === 'fulfilled' && omegaStats?.value?.success ? 'operational' : 'degraded',
        data: omegaStats?.status === 'fulfilled' ? omegaStats?.value?.statistics : null,
        error: omegaStats?.status === 'rejected' ? omegaStats?.reason : null
      },
      syntheticMarket: {
        status: forwardTestAnalytics?.status === 'fulfilled' && forwardTestAnalytics?.value?.success ? 'operational' : 'degraded',
        data: forwardTestAnalytics?.status === 'fulfilled' ? forwardTestAnalytics?.value?.analytics : null,
        error: forwardTestAnalytics?.status === 'rejected' ? forwardTestAnalytics?.reason : null
      },
      attentionMarket: {
        status: marketState?.status === 'fulfilled' && marketState?.value?.success ? 'operational' : 'degraded',
        data: marketState?.status === 'fulfilled' ? marketState?.value?.marketState : null,
        error: marketState?.status === 'rejected' ? marketState?.reason : null
      }
    };

    return {
      success: true,
      systemStatus,
      overallHealth: calculateOverallHealth(systemStatus)
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      systemStatus: null
    };
  }
}

// Comprehensive strategy testing pipeline
export async function runComprehensiveStrategyTest(strategyId) {
  try {
    const results = {
      strategyId,
      timestamp: new Date()?.toISOString(),
      modules: {}
    };

    // Step 1: Forward Testing (Synthetic Market)
    console.log(`[Genius Pack] Running forward test for strategy ${strategyId}`);
    const forwardTestResult = await syntheticMarketService?.runForwardTestSimulation(strategyId);
    results.modules.syntheticMarket = forwardTestResult;

    if (forwardTestResult?.success) {
      // Step 2: Omega AI Attack (only if forward test passes)
      if (forwardTestResult?.simulation?.robustness_score > 0.6) {
        console.log(`[Genius Pack] Strategy shows promise (${forwardTestResult?.simulation?.robustness_score}), launching Omega attack`);
        
        // Get strategy details for attack using static import
        if (supabase) {
          const { data: strategy } = await supabase?.from('strategy_candidates')?.select('*')?.eq('id', strategyId)?.single();

          if (strategy) {
            const omegaResult = await omegaAIService?.runOmegaAttack(strategy);
            results.modules.omegaAI = omegaResult;
          }
        }
      } else {
        results.modules.omegaAI = {
          success: false,
          skipped: true,
          reason: 'Low robustness score, skipping Omega attack'
        };
      }

      // Step 3: Resource allocation for deployment (if tests pass)
      const shouldDeploy = forwardTestResult?.simulation?.robustness_score > 0.7 && 
                          (!results?.modules?.omegaAI || results?.modules?.omegaAI?.skipped || 
                           (results?.modules?.omegaAI?.success && results?.modules?.omegaAI?.data?.outcome === 'FAIL'));

      if (shouldDeploy) {
        console.log(`[Genius Pack] Strategy passed tests, requesting deployment resources`);
        const resourceResult = await attentionMarketService?.submitBid(
          'strategy_deployment_engine',
          `deploy:strategy:${strategyId}`,
          15000, // High bid for deployment
          9, // High priority
          {
            cpu_cores: 4,
            memory_gb: 8,
            gpu_required: true,
            estimated_duration: 120, // 2 hours for deployment
            strategy_id: strategyId
          }
        );
        results.modules.attentionMarket = resourceResult;
      } else {
        results.modules.attentionMarket = {
          success: false,
          skipped: true,
          reason: 'Strategy did not pass comprehensive testing'
        };
      }
    }

    // Calculate overall test score
    results.overallScore = calculateTestScore(results);
    results.recommendation = generateRecommendation(results);

    return {
      success: true,
      testResults: results
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message
    };
  }
}

// Get integrated dashboard data for all modules
export async function getGeniusPackDashboardData() {
  try {
    const [omegaStats, forwardAnalytics, marketState, resourceMetrics] = await Promise.allSettled([
      omegaAIService?.getOmegaAttackStatistics(),
      syntheticMarketService?.getForwardTestAnalytics(),
      attentionMarketService?.getMarketState(),
      attentionMarketService?.getResourceAllocationMetrics()
    ]);

    const dashboardData = {
      omegaAI: {
        totalAttacks: omegaStats?.status === 'fulfilled' ? omegaStats?.value?.statistics?.totalAttacks || 0 : 0,
        successRate: omegaStats?.status === 'fulfilled' ? omegaStats?.value?.statistics?.successRate || 0 : 0,
        vulnerableStrategies: omegaStats?.status === 'fulfilled' ? omegaStats?.value?.statistics?.successfulAttacks || 0 : 0
      },
      syntheticMarket: {
        totalSimulations: forwardAnalytics?.status === 'fulfilled' ? forwardAnalytics?.value?.analytics?.totalSimulations || 0 : 0,
        avgRobustness: forwardAnalytics?.status === 'fulfilled' ? forwardAnalytics?.value?.analytics?.avgRobustnessScore || 0 : 0,
        robustStrategies: forwardAnalytics?.status === 'fulfilled' ? forwardAnalytics?.value?.analytics?.robustStrategies?.length || 0 : 0
      },
      attentionMarket: {
        totalBids: marketState?.status === 'fulfilled' ? marketState?.value?.marketState?.totalBids || 0 : 0,
        budgetUtilization: marketState?.status === 'fulfilled' ? marketState?.value?.marketState?.budgetUtilization || 0 : 0,
        activeAgents: marketState?.status === 'fulfilled' ? Object.keys(marketState?.value?.marketState?.agentActivity || {})?.length : 0,
        avgEfficiency: resourceMetrics?.status === 'fulfilled' ? resourceMetrics?.value?.metrics?.durationAccuracy || 0 : 0
      },
      systemHealth: calculateSystemHealth({
        omegaOperational: omegaStats?.status === 'fulfilled',
        syntheticOperational: forwardAnalytics?.status === 'fulfilled',
        attentionOperational: marketState?.status === 'fulfilled'
      })
    };

    return {
      success: true,
      dashboardData
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      dashboardData: null
    };
  }
}

// Emergency shutdown of all Genius Pack modules
export async function emergencyShutdown(reason = 'Manual shutdown') {
  try {
    const shutdownTasks = [
      // Emergency resource reallocation to critical systems only
      attentionMarketService?.emergencyResourceReallocation([
        {
          taskId: 'system_monitoring',
          cpuCores: 2,
          memoryGb: 4,
          estimatedDuration: 60
        }
      ], 50000),
    ];

    const results = await Promise.allSettled(shutdownTasks);
    
    return {
      success: true,
      message: 'Emergency shutdown initiated',
      reason,
      shutdownResults: results
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message
    };
  }
}

// Helper functions
function calculateOverallHealth(systemStatus) {
  const modules = Object.values(systemStatus);
  const operationalCount = modules?.filter(m => m?.status === 'operational')?.length;
  const totalCount = modules?.length;
  
  const healthPercentage = (operationalCount / totalCount) * 100;
  
  if (healthPercentage === 100) return 'excellent';
  if (healthPercentage >= 66) return 'good';
  if (healthPercentage >= 33) return 'degraded';
  return 'critical';
}

function calculateTestScore(results) {
  let score = 0;
  let maxScore = 0;

  // Synthetic Market (40% weight)
  maxScore += 40;
  if (results?.modules?.syntheticMarket?.success) {
    const robustness = results?.modules?.syntheticMarket?.simulation?.robustness_score || 0;
    score += robustness * 40;
  }

  // Omega AI (30% weight)  
  maxScore += 30;
  if (results?.modules?.omegaAI?.success) {
    // Higher score if strategy survives attack
    const survived = results?.modules?.omegaAI?.data?.outcome === 'FAIL';
    score += survived ? 30 : 15;
  } else if (results?.modules?.omegaAI?.skipped) {
    // Neutral score if skipped due to low robustness
    score += 15;
  }

  // Attention Market (30% weight)
  maxScore += 30;
  if (results?.modules?.attentionMarket?.success) {
    score += 30;
  } else if (results?.modules?.attentionMarket?.skipped) {
    score += 0; // No points for skipped deployment
  }

  return maxScore > 0 ? (score / maxScore * 100)?.toFixed(1) : 0;
}

function generateRecommendation(results) {
  let score = parseFloat(results?.overallScore);
  
  if (score >= 80) {
    return {
      level: 'deploy',
      message: 'Strategy passed comprehensive testing. Recommended for production deployment.',
      color: 'green'
    };
  } else if (score >= 60) {
    return {
      level: 'conditional',
      message: 'Strategy shows potential but needs refinement. Consider paper trading first.',
      color: 'yellow'
    };
  } else if (score >= 40) {
    return {
      level: 'review',
      message: 'Strategy has significant weaknesses. Requires major improvements.',
      color: 'orange'
    };
  } else {
    return {
      level: 'reject',
      message: 'Strategy failed comprehensive testing. Not recommended for deployment.',
      color: 'red'
    };
  }
}

function calculateSystemHealth(status) {
  const total = Object.keys(status)?.length;
  const operational = Object.values(status)?.filter(Boolean)?.length;
  return ((operational / total) * 100)?.toFixed(1);
}

export default {
  initializeGeniusPackModules,
  runComprehensiveStrategyTest,
  getGeniusPackDashboardData,
  emergencyShutdown,
  
  // Re-export individual module services
  omegaAI: omegaAIService,
  syntheticMarket: syntheticMarketService,
  attentionMarket: attentionMarketService
};