import { supabase } from '../lib/supabase.js';

/**
 * Synthetic Market Service - Forward Testing Engine
 * Tests strategies against 1000 possible futures before deployment
 */

// Create and run forward test simulation
export async function runForwardTestSimulation(strategyId, totalRuns = 1000) {
  try {
    if (!strategyId) {
      throw new Error('Strategy ID is required');
    }

    // Use database function for forward testing
    const { data, error } = await supabase?.rpc('create_forward_test_simulation', {
      p_strategy_id: strategyId,
      p_total_runs: totalRuns
    });

    if (error) throw error;

    return {
      success: true,
      simulation: data
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message
    };
  }
}

// Get forward test results for a strategy
export async function getForwardTestResults(strategyId) {
  try {
    const { data, error } = await supabase?.from('forward_test_results')?.select(`
        *,
        strategy_candidates:strategy_id (
          id,
          spec_yaml,
          iqs,
          status
        )
      `)?.eq('strategy_id', strategyId)?.order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      results: data || []
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      results: []
    };
  }
}

// Get all forward test results with analytics
export async function getForwardTestAnalytics() {
  try {
    const { data, error } = await supabase?.from('forward_test_results')?.select(`
        *,
        strategy_candidates:strategy_id (
          id,
          spec_yaml,
          iqs,
          status
        )
      `)?.order('robustness_score', { ascending: false })?.limit(100);

    if (error) throw error;

    const results = data || [];
    const analytics = {
      totalSimulations: results?.length,
      avgRobustnessScore: results?.reduce((sum, r) => sum + (parseFloat(r?.robustness_score) || 0), 0) / results?.length || 0,
      avgPnl: results?.reduce((sum, r) => sum + (parseFloat(r?.avg_pnl) || 0), 0) / results?.length || 0,
      bestPerformers: results?.slice(0, 10),
      worstPerformers: results?.slice(-10)?.reverse(),
      robustStrategies: results?.filter(r => parseFloat(r?.robustness_score) > 0.7),
      riskyStrategies: results?.filter(r => parseFloat(r?.worst_case_pnl) < -500)
    };

    return {
      success: true,
      analytics
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      analytics: {
        totalSimulations: 0,
        avgRobustnessScore: 0,
        avgPnl: 0,
        bestPerformers: [],
        worstPerformers: [],
        robustStrategies: [],
        riskyStrategies: []
      }
    };
  }
}

// Get robustness ranking of strategies
export async function getRobustnessRanking() {
  try {
    const { data, error } = await supabase?.from('forward_test_results')?.select(`
        strategy_id,
        robustness_score,
        avg_pnl,
        worst_case_pnl,
        total_runs,
        success_runs,
        created_at,
        strategy_candidates:strategy_id (
          id,
          spec_yaml,
          iqs,
          status,
          notes
        )
      `)?.order('robustness_score', { ascending: false });

    if (error) throw error;

    // Group by strategy and get best robustness score for each
    const strategyMap = new Map();
    
    data?.forEach(result => {
      const strategyId = result?.strategy_id;
      const currentBest = strategyMap?.get(strategyId);
      
      if (!currentBest || parseFloat(result?.robustness_score) > parseFloat(currentBest?.robustness_score)) {
        strategyMap?.set(strategyId, result);
      }
    });

    const rankings = Array.from(strategyMap?.values())?.sort((a, b) => parseFloat(b?.robustness_score) - parseFloat(a?.robustness_score))?.map((result, index) => ({
        rank: index + 1,
        ...result,
        robustnessGrade: getRobustnessGrade(parseFloat(result?.robustness_score)),
        riskLevel: getRiskLevel(parseFloat(result?.worst_case_pnl))
      }));

    return {
      success: true,
      rankings
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      rankings: []
    };
  }
}

// Get simulation comparison between strategies
export async function compareStrategiesForwardTest(strategyIds) {
  try {
    if (!strategyIds?.length) {
      throw new Error('Strategy IDs array is required');
    }

    const { data, error } = await supabase?.from('forward_test_results')?.select(`
        *,
        strategy_candidates:strategy_id (
          id,
          spec_yaml,
          iqs,
          status
        )
      `)?.in('strategy_id', strategyIds)?.order('created_at', { ascending: false });

    if (error) throw error;

    // Group results by strategy
    const comparisonData = {};
    
    data?.forEach(result => {
      const strategyId = result?.strategy_id;
      if (!comparisonData?.[strategyId]) {
        comparisonData[strategyId] = {
          strategy: result?.strategy_candidates,
          results: []
        };
      }
      comparisonData?.[strategyId]?.results?.push(result);
    });

    // Calculate comparison metrics
    const comparison = Object.keys(comparisonData)?.map(strategyId => {
      const strategyData = comparisonData?.[strategyId];
      const results = strategyData?.results;
      
      return {
        strategy: strategyData?.strategy,
        bestRobustness: Math.max(...results?.map(r => parseFloat(r?.robustness_score) || 0)),
        avgRobustness: results?.reduce((sum, r) => sum + (parseFloat(r?.robustness_score) || 0), 0) / results?.length,
        bestPnl: Math.max(...results?.map(r => parseFloat(r?.avg_pnl) || 0)),
        worstPnl: Math.min(...results?.map(r => parseFloat(r?.worst_case_pnl) || 0)),
        totalSimulations: results?.length,
        lastTested: results?.[0]?.created_at
      };
    });

    return {
      success: true,
      comparison: comparison?.sort((a, b) => b?.bestRobustness - a?.bestRobustness)
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      comparison: []
    };
  }
}

// Helper functions
function getRobustnessGrade(score) {
  if (score >= 0.9) return 'A+';
  if (score >= 0.8) return 'A';
  if (score >= 0.7) return 'B+';
  if (score >= 0.6) return 'B';
  if (score >= 0.5) return 'C+';
  if (score >= 0.4) return 'C';
  return 'D';
}

function getRiskLevel(worstCasePnl) {
  if (worstCasePnl >= -100) return 'Low';
  if (worstCasePnl >= -300) return 'Medium';
  if (worstCasePnl >= -500) return 'High';
  return 'Extreme';
}

export default {
  runForwardTestSimulation,
  getForwardTestResults,
  getForwardTestAnalytics,
  getRobustnessRanking,
  compareStrategiesForwardTest
};