import { supabase } from '../lib/supabase.js';

// Service pour gérer le marché synthétique prédictif (Forward-Testing)
export class SyntheticMarketService {
  // Lancer un forward-test sur 1000 futurs possibles
  async runForwardTest(strategyId, totalRuns = 1000) {
    try {
      if (!strategyId) {
        throw new Error('Strategy ID is required');
      }

      // Appeler la fonction Supabase pour exécuter le forward-test
      const { data, error } = await supabase?.rpc('run_forward_test', {
        p_strategy_id: strategyId,
        p_total_runs: totalRuns
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        test_id: data,
        strategy_id: strategyId,
        total_runs: totalRuns,
        message: `Forward-test launched for ${totalRuns} simulations`
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to launch forward-test'
      };
    }
  }

  // Récupérer les résultats de forward-testing
  async getForwardTestResults(strategyId = null, limit = 50) {
    try {
      let query = supabase
        ?.from('forward_test_results')
        ?.select(`
          *,
          strategy_candidates!strategy_id (
            id,
            spec_yaml,
            iqs,
            status
          )
        `)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (strategyId) {
        query = query?.eq('strategy_id', strategyId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        results: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch forward-test results',
        results: []
      };
    }
  }

  // Obtenir les statistiques du marché synthétique
  async getSyntheticMarketStats() {
    try {
      const { data, error } = await supabase
        ?.from('forward_test_results')
        ?.select('strategy_id, total_runs, success_runs, robustness_score, avg_pnl, worst_case_pnl, created_at');

      if (error) {
        throw error;
      }

      const results = data || [];
      const totalTests = results?.length;
      const totalSimulations = results?.reduce((sum, r) => sum + (r?.total_runs || 0), 0);
      
      const avgRobustnessScore = results?.length > 0 
        ? results?.reduce((sum, r) => sum + (parseFloat(r?.robustness_score) || 0), 0) / results?.length
        : 0;

      const avgPnl = results?.length > 0 
        ? results?.reduce((sum, r) => sum + (parseFloat(r?.avg_pnl) || 0), 0) / results?.length
        : 0;

      const worstCasePnl = results?.length > 0 
        ? Math.min(...results?.map(r => parseFloat(r?.worst_case_pnl) || 0))
        : 0;

      // Classement par robustesse
      const topStrategies = results?.sort((a, b) => (b?.robustness_score || 0) - (a?.robustness_score || 0))?.slice(0, 10);

      // Analyse des risques
      const highRiskStrategies = results?.filter(r => (r?.robustness_score || 0) < 0.5);
      const lowRiskStrategies = results?.filter(r => (r?.robustness_score || 0) > 0.8);

      return {
        success: true,
        stats: {
          total_tests: totalTests,
          total_simulations: totalSimulations,
          avg_robustness_score: Math.round(avgRobustnessScore * 1000) / 10, // En pourcentage avec 1 décimale
          avg_pnl: Math.round(avgPnl * 100) / 100,
          worst_case_pnl: Math.round(worstCasePnl * 100) / 100,
          top_strategies: topStrategies,
          high_risk_count: highRiskStrategies?.length,
          low_risk_count: lowRiskStrategies?.length,
          recent_tests: results?.slice(0, 5)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch synthetic market statistics',
        stats: {
          total_tests: 0,
          total_simulations: 0,
          avg_robustness_score: 0,
          avg_pnl: 0,
          worst_case_pnl: 0,
          top_strategies: [],
          high_risk_count: 0,
          low_risk_count: 0,
          recent_tests: []
        }
      };
    }
  }

  // Analyser la robustesse d'une stratégie spécifique
  async analyzeStrategyRobustness(strategyId) {
    try {
      if (!strategyId) {
        throw new Error('Strategy ID is required');
      }

      const { data, error } = await supabase
        ?.from('forward_test_results')
        ?.select('*')
        ?.eq('strategy_id', strategyId)
        ?.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const tests = data || [];
      
      if (tests?.length === 0) {
        return {
          success: true,
          strategy_id: strategyId,
          analysis: {
            total_tests: 0,
            avg_robustness: 0,
            consistency_score: 0,
            risk_level: 'unknown',
            recommendation: 'No forward-test data available. Run tests first.'
          }
        };
      }

      const totalTests = tests?.length;
      const avgRobustness = tests?.reduce((sum, t) => sum + (parseFloat(t?.robustness_score) || 0), 0) / totalTests;
      const avgPnl = tests?.reduce((sum, t) => sum + (parseFloat(t?.avg_pnl) || 0), 0) / totalTests;
      
      // Calcul de la cohérence (faible écart-type = haute cohérence)
      const robustnessScores = tests?.map(t => parseFloat(t?.robustness_score) || 0);
      const robustnessStdDev = this.calculateStdDev(robustnessScores);
      const consistencyScore = Math.max(0, 1 - robustnessStdDev); // Score de cohérence de 0 à 1

      // Détermination du niveau de risque
      let riskLevel = 'unknown';
      let recommendation = 'Insufficient data for recommendation';

      if (avgRobustness >= 0.8) {
        riskLevel = 'low';
        recommendation = 'Highly robust strategy, recommended for production';
      } else if (avgRobustness >= 0.6) {
        riskLevel = 'medium';
        recommendation = 'Moderately robust, consider additional testing';
      } else if (avgRobustness >= 0.4) {
        riskLevel = 'high';
        recommendation = 'High risk strategy, requires optimization before deployment';
      } else {
        riskLevel = 'very_high';
        recommendation = 'Very risky strategy, not recommended for production';
      }

      // Tendance temporelle
      const recentTests = tests?.slice(0, Math.min(5, tests?.length));
      const recentAvgRobustness = recentTests?.reduce((sum, t) => sum + (parseFloat(t?.robustness_score) || 0), 0) / recentTests?.length;
      const trend = recentAvgRobustness > avgRobustness ? 'improving' : recentAvgRobustness < avgRobustness ? 'declining' : 'stable';

      return {
        success: true,
        strategy_id: strategyId,
        analysis: {
          total_tests: totalTests,
          avg_robustness: Math.round(avgRobustness * 1000) / 10, // Pourcentage avec 1 décimale
          consistency_score: Math.round(consistencyScore * 1000) / 10,
          avg_pnl: Math.round(avgPnl * 100) / 100,
          risk_level: riskLevel,
          trend: trend,
          recommendation: recommendation,
          test_history: tests,
          volatility: Math.round(robustnessStdDev * 1000) / 10
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to analyze strategy robustness',
        strategy_id: strategyId,
        analysis: null
      };
    }
  }

  // Comparer plusieurs stratégies sur leurs résultats forward-test
  async compareStrategies(strategyIds) {
    try {
      if (!Array.isArray(strategyIds) || strategyIds?.length === 0) {
        throw new Error('Strategy IDs array is required');
      }

      const comparisons = [];

      for (const strategyId of strategyIds) {
        const analysis = await this.analyzeStrategyRobustness(strategyId);
        if (analysis?.success) {
          comparisons?.push({
            strategy_id: strategyId,
            ...analysis?.analysis
          });
        }
      }

      // Trier par score de robustesse
      comparisons?.sort((a, b) => (b?.avg_robustness || 0) - (a?.avg_robustness || 0));

      // Identifier le meilleur et le pire
      const bestStrategy = comparisons?.[0];
      const worstStrategy = comparisons?.[comparisons?.length - 1];

      return {
        success: true,
        comparison: {
          strategies_compared: comparisons?.length,
          best_strategy: bestStrategy,
          worst_strategy: worstStrategy,
          all_strategies: comparisons,
          summary: {
            avg_robustness_all: comparisons?.length > 0 
              ? Math.round((comparisons?.reduce((sum, s) => sum + (s?.avg_robustness || 0), 0) / comparisons?.length) * 10) / 10
              : 0,
            high_performers: comparisons?.filter(s => (s?.avg_robustness || 0) >= 70)?.length,
            low_performers: comparisons?.filter(s => (s?.avg_robustness || 0) < 50)?.length
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to compare strategies',
        comparison: null
      };
    }
  }

  // Obtenir les recommandations basées sur les forward-tests
  async getRecommendations(limit = 10) {
    try {
      const { data, error } = await supabase
        ?.from('forward_test_results')
        ?.select(`
          *,
          strategy_candidates!strategy_id (
            id,
            spec_yaml,
            iqs,
            status
          )
        `)
        ?.order('robustness_score', { ascending: false })
        ?.limit(limit);

      if (error) {
        throw error;
      }

      const results = data || [];
      const recommendations = results?.map(result => {
        const robustness = parseFloat(result?.robustness_score) || 0;
        const avgPnl = parseFloat(result?.avg_pnl) || 0;
        
        let recommendation = 'Unknown';
        let priority = 'low';
        
        if (robustness >= 0.8 && avgPnl > 0) {
          recommendation = 'Highly recommended for production deployment';
          priority = 'high';
        } else if (robustness >= 0.6 && avgPnl > -100) {
          recommendation = 'Good candidate, consider additional optimization';
          priority = 'medium';
        } else {
          recommendation = 'Requires significant improvement before deployment';
          priority = 'low';
        }

        return {
          strategy_id: result?.strategy_id,
          strategy_details: result?.strategy_candidates,
          robustness_score: Math.round(robustness * 1000) / 10,
          avg_pnl: Math.round(avgPnl * 100) / 100,
          recommendation,
          priority,
          test_date: result?.created_at,
          total_simulations: result?.total_runs
        };
      });

      return {
        success: true,
        recommendations
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to get recommendations',
        recommendations: []
      };
    }
  }

  // Utilitaire pour calculer l'écart-type
  calculateStdDev(values) {
    if (!values?.length || values?.length < 2) return 0;
    
    const mean = values?.reduce((sum, val) => sum + val, 0) / values?.length;
    const squaredDiffs = values?.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs?.reduce((sum, diff) => sum + diff, 0) / values?.length;
    return Math.sqrt(variance);
  }
}

export const syntheticMarketService = new SyntheticMarketService();