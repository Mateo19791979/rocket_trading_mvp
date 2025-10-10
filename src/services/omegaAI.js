import { supabase } from '../lib/supabase.js';

// Service pour gérer les attaques de l'IA Omega contre les stratégies Alpha
export class OmegaAIService {
  // Lancer une attaque Omega contre une stratégie Alpha
  async runOmegaAttack(alphaStrategy) {
    try {
      if (!alphaStrategy?.id || !alphaStrategy?.spec_yaml) {
        throw new Error('Invalid strategy object: missing id or spec_yaml');
      }

      // Créer une stratégie d'attaque inversée
      let omegaSpec = this.generateOmegaSpec(alphaStrategy);
      
      // Appeler la fonction Supabase pour exécuter l'attaque
      const { data, error } = await supabase?.rpc('run_omega_attack', {
        p_alpha_strategy_id: alphaStrategy?.id,
        p_omega_spec: omegaSpec,
        p_attack_vectors: { 
          simulation_type: 'inverse_logic',
          volatility_multiplier: Math.random() * 1.5 + 1.0,
          market_stress: Math.random() > 0.5 ? 'high' : 'medium'
        }
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        attack_id: data,
        alpha_strategy_id: alphaStrategy?.id,
        message: 'Omega attack launched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to launch Omega attack'
      };
    }
  }

  // Générer une spécification Omega inversée basée sur la stratégie Alpha
  generateOmegaSpec(alphaStrategy) {
    const baseSpec = alphaStrategy?.spec_yaml || '';
    
    // Logique simple d'inversion (à améliorer avec de vrais algorithmes)
    let omegaSpec = baseSpec?.replace(/long/gi, 'TEMP_LONG')?.replace(/short/gi, 'long')?.replace(/TEMP_LONG/gi, 'short')?.replace(/buy/gi, 'TEMP_BUY')?.replace(/sell/gi, 'buy')?.replace(/TEMP_BUY/gi, 'sell');

    // Ajouter des éléments antagonistes spécifiques
    omegaSpec = `strategy_id: omega_${Date.now()}
type: adversarial_counter
target_strategy: ${alphaStrategy?.id}

# Stratégie Omega Antagoniste
${omegaSpec}

# Modifications antagonistes
antagonist_features:
  - contrarian_signals: true
  - stress_testing: high
  - market_regime_shift: enabled
  - liquidity_shock: random`;

    return omegaSpec;
  }

  // Récupérer les résultats d'attaques Omega
  async getOmegaAttacks(limit = 50) {
    try {
      const { data, error } = await supabase
        ?.from('omega_attacks')
        ?.select(`
          *,
          strategy_candidates!alpha_strategy_id (
            id,
            spec_yaml,
            iqs,
            status
          )
        `)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) {
        throw error;
      }

      return {
        success: true,
        attacks: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch Omega attacks',
        attacks: []
      };
    }
  }

  // Obtenir les statistiques des attaques Omega
  async getOmegaStats() {
    try {
      const { data, error } = await supabase
        ?.from('omega_attacks')
        ?.select('outcome, simulated_pnl, created_at');

      if (error) {
        throw error;
      }

      const attacks = data || [];
      const totalAttacks = attacks?.length;
      const successfulAttacks = attacks?.filter(a => a?.outcome === 'SUCCESS')?.length;
      const failedAttacks = totalAttacks - successfulAttacks;
      const successRate = totalAttacks > 0 ? (successfulAttacks / totalAttacks * 100)?.toFixed(1) : 0;

      const avgPnlImpact = attacks?.length > 0 
        ? attacks?.reduce((sum, a) => sum + (parseFloat(a?.simulated_pnl) || 0), 0) / attacks?.length
        : 0;

      return {
        success: true,
        stats: {
          totalAttacks,
          successfulAttacks,
          failedAttacks,
          successRate: parseFloat(successRate),
          avgPnlImpact: Math.round(avgPnlImpact * 100) / 100,
          recentAttacks: attacks?.slice(0, 5)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch Omega statistics',
        stats: {
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

  // Identifier les stratégies vulnérables
  async getVulnerableStrategies() {
    try {
      const { data, error } = await supabase
        ?.from('strategy_candidates')
        ?.select(`
          *,
          omega_attacks!alpha_strategy_id (
            id,
            outcome,
            simulated_pnl,
            created_at
          )
        `)
        ?.not('omega_attacks', 'is', null);

      if (error) {
        throw error;
      }

      const strategies = data || [];
      const vulnerable = // Plus de 30% d'attaques réussies
      strategies?.map(strategy => {
          const attacks = strategy?.omega_attacks || [];
          const successfulAttacks = attacks?.filter(a => a?.outcome === 'SUCCESS')?.length;
          const totalAttacks = attacks?.length;
          const vulnerabilityScore = totalAttacks > 0 ? successfulAttacks / totalAttacks : 0;
          
          return {
            ...strategy,
            vulnerability_score: vulnerabilityScore,
            attack_count: totalAttacks,
            successful_attacks: successfulAttacks,
            last_attack: attacks?.[0]?.created_at
          };
        })?.filter(s => s?.vulnerability_score > 0.3)?.sort((a, b) => b?.vulnerability_score - a?.vulnerability_score);

      return {
        success: true,
        vulnerableStrategies: vulnerable
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch vulnerable strategies',
        vulnerableStrategies: []
      };
    }
  }
}

export const omegaAIService = new OmegaAIService();