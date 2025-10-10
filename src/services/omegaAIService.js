import { supabase } from '../lib/supabase.js';

/**
 * Omega AI Service - Adversarial Twin Intelligence
 * Manages antagonistic AI attacks against Alpha strategies
 */

// Simulate an Omega AI attack against an Alpha strategy
export async function runOmegaAttack(alphaStrategy) {
  try {
    if (!alphaStrategy?.id || !alphaStrategy?.spec_yaml) {
      throw new Error('Invalid strategy object provided');
    }

    // Create inverse strategy (simplified adversarial logic)
    const omegaSpec = alphaStrategy?.spec_yaml?.replace(/long/gi, 'TEMP_SWAP')?.replace(/short/gi, 'long')?.replace(/TEMP_SWAP/gi, 'short')?.replace(/buy/gi, 'TEMP_SWAP')?.replace(/sell/gi, 'buy')?.replace(/TEMP_SWAP/gi, 'sell');

    // Use database function for attack simulation
    const { data, error } = await supabase?.rpc('run_omega_attack_simulation', {
      p_alpha_strategy_id: alphaStrategy?.id,
      p_omega_spec_yaml: omegaSpec,
      p_attack_vectors: { 
        simulation_type: 'inverse_logic',
        volatility_multiplier: 1.5,
        adversarial_mode: true
      }
    });

    if (error) throw error;

    return {
      success: true,
      data: data
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message
    };
  }
}

// Get Omega attack history for a strategy
export async function getOmegaAttackHistory(strategyId) {
  try {
    const { data, error } = await supabase?.from('omega_attacks')?.select(`
        *,
        strategy_candidates:alpha_strategy_id (
          id,
          spec_yaml,
          iqs,
          status
        )
      `)?.eq('alpha_strategy_id', strategyId)?.order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      attacks: data || []
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      attacks: []
    };
  }
}

// Get all Omega attacks with statistics
export async function getOmegaAttackStatistics() {
  try {
    const { data, error } = await supabase?.from('omega_attacks')?.select('*')?.order('created_at', { ascending: false })?.limit(100);

    if (error) throw error;

    const attacks = data || [];
    const totalAttacks = attacks?.length;
    const successfulAttacks = attacks?.filter(a => a?.outcome === 'SUCCESS')?.length;
    const failedAttacks = attacks?.filter(a => a?.outcome === 'FAIL')?.length;
    const avgPnlImpact = attacks?.reduce((sum, a) => sum + (parseFloat(a?.simulated_pnl) || 0), 0) / totalAttacks || 0;

    const statistics = {
      totalAttacks,
      successfulAttacks,
      failedAttacks,
      successRate: totalAttacks > 0 ? (successfulAttacks / totalAttacks * 100)?.toFixed(1) : 0,
      avgPnlImpact: avgPnlImpact?.toFixed(2),
      recentAttacks: attacks?.slice(0, 10)
    };

    return {
      success: true,
      statistics
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      statistics: {
        totalAttacks: 0,
        successfulAttacks: 0,
        failedAttacks: 0,
        successRate: 0,
        avgPnlImpact: 0,
        recentAttacks: []
      }
    };
  }
}

// Get vulnerable strategies (strategies that failed Omega attacks)
export async function getVulnerableStrategies() {
  try {
    const { data, error } = await supabase?.from('omega_attacks')?.select(`
        alpha_strategy_id,
        outcome,
        simulated_pnl,
        created_at,
        strategy_candidates:alpha_strategy_id (
          id,
          spec_yaml,
          iqs,
          status,
          notes
        )
      `)?.eq('outcome', 'SUCCESS')?.order('created_at', { ascending: false })?.limit(50);

    if (error) throw error;

    // Group by strategy and calculate vulnerability metrics
    const vulnerabilityMap = new Map();
    
    data?.forEach(attack => {
      const strategyId = attack?.alpha_strategy_id;
      if (!vulnerabilityMap?.has(strategyId)) {
        vulnerabilityMap?.set(strategyId, {
          strategy: attack?.strategy_candidates,
          failedAttacks: 0,
          totalPnlLoss: 0,
          lastFailure: null
        });
      }
      
      const vulnData = vulnerabilityMap?.get(strategyId);
      vulnData.failedAttacks++;
      vulnData.totalPnlLoss += parseFloat(attack?.simulated_pnl) || 0;
      if (!vulnData?.lastFailure || attack?.created_at > vulnData?.lastFailure) {
        vulnData.lastFailure = attack?.created_at;
      }
    });

    const vulnerableStrategies = Array.from(vulnerabilityMap?.values())?.sort((a, b) => b?.failedAttacks - a?.failedAttacks);

    return {
      success: true,
      vulnerableStrategies
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      vulnerableStrategies: []
    };
  }
}

// Schedule automated Omega attack for a strategy
export async function scheduleOmegaAttack(strategyId, attackConfig = {}) {
  try {
    // Get the strategy first
    const { data: strategy, error: strategyError } = await supabase?.from('strategy_candidates')?.select('*')?.eq('id', strategyId)?.single();

    if (strategyError) throw strategyError;
    if (!strategy) throw new Error('Strategy not found');

    // Run the attack
    const attackResult = await runOmegaAttack(strategy);

    return attackResult;

  } catch (error) {
    return {
      success: false,
      error: error?.message
    };
  }
}

export default {
  runOmegaAttack,
  getOmegaAttackHistory,
  getOmegaAttackStatistics,
  getVulnerableStrategies,
  scheduleOmegaAttack
};