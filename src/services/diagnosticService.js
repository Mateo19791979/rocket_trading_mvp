import { supabase } from '../lib/supabase';

/**
 * Service de diagnostic et réparation pour détecter les pannes système
 */
export const diagnosticService = {
  /**
   * Lance un diagnostic complet du système
   */
  async runComprehensiveDiagnostic() {
    const results = {
      timestamp: new Date()?.toISOString(),
      overall_status: 'unknown',
      issues: [],
      healthy_items: [],
      recommendations: []
    };

    try {
      // 1. Test de connectivité Supabase de base
      const connectivity = await this.testSupabaseConnectivity();
      results.supabase_connectivity = connectivity;

      // 2. Diagnostic des colonnes critiques via RPC
      try {
        const { data: columnDiagnostics, error } = await supabase?.rpc('diagnostic_colonnes_critiques', {
          do_repair: false
        });

        if (!error && columnDiagnostics) {
          results.column_diagnostics = columnDiagnostics;
          
          // Séparer les problèmes et éléments sains
          columnDiagnostics?.forEach(item => {
            if (item?.status === 'ok' || item?.status === 'repaired') {
              results?.healthy_items?.push(item);
            } else {
              results?.issues?.push({
                category: 'database_column',
                severity: item?.status === 'missing' ? 'high' : 'critical',
                ...item
              });
            }
          });
        }
      } catch (columnError) {
        results?.issues?.push({
          category: 'database_function',
          severity: 'critical',
          table_column: 'diagnostic_colonnes_critiques',
          status: 'error',
          details: `Impossible d'exécuter le diagnostic RPC: ${columnError?.message}`
        });
      }

      // 3. Test spécifique pour positions.is_active (basé sur les erreurs Supabase logs)
      const positionsTest = await this.testPositionsIsActiveColumn();
      if (!positionsTest?.exists) {
        results?.issues?.push({
          category: 'database_column',
          severity: 'critical',
          table_column: 'public.positions.is_active',
          status: 'missing',
          details: 'Colonne manquante détectée - 8 erreurs SQL dans les logs runtime'
        });
      } else {
        results?.healthy_items?.push({
          table_column: 'public.positions.is_active',
          status: 'ok',
          details: 'Colonne existe et accessible'
        });
      }

      // 4. Diagnostic des hooks et composants frontend
      const frontendIssues = await this.checkFrontendIntegrity();
      results?.issues?.push(...frontendIssues);

      // 5. Déterminer le statut global
      const criticalIssues = results?.issues?.filter(i => i?.severity === 'critical')?.length;
      const highIssues = results?.issues?.filter(i => i?.severity === 'high')?.length;

      if (criticalIssues > 0) {
        results.overall_status = 'critical';
      } else if (highIssues > 0) {
        results.overall_status = 'warnings';
      } else {
        results.overall_status = 'healthy';
      }

      // 6. Générer des recommandations
      results.recommendations = this.generateRecommendations(results?.issues);

      return results;

    } catch (error) {
      console.error('Comprehensive diagnostic failed:', error);
      return {
        ...results,
        overall_status: 'error',
        error: error?.message,
        issues: [{
          category: 'system',
          severity: 'critical',
          table_column: 'diagnostic_service',
          status: 'error',
          details: `Diagnostic service failure: ${error?.message}`
        }]
      };
    }
  },

  /**
   * Test de connectivité Supabase
   */
  async testSupabaseConnectivity() {
    try {
      const { data, error } = await supabase?.rpc('health_json_ok');
      
      return {
        connected: !error,
        response_time: null, // Could measure this
        error: error?.message || null
      };
    } catch (error) {
      return {
        connected: false,
        response_time: null,
        error: error?.message
      };
    }
  },

  /**
   * Test spécifique pour la colonne positions.is_active
   */
  async testPositionsIsActiveColumn() {
    try {
      // Tentative de query avec is_active pour voir si ça fonctionne
      const { data, error } = await supabase?.from('positions')?.select('id, is_active')?.limit(1);

      if (error && error?.message?.includes('is_active')) {
        return { exists: false, error: error?.message };
      }

      return { exists: true, sample_data: data };
    } catch (error) {
      if (error?.message?.includes('is_active')) {
        return { exists: false, error: error?.message };
      }
      
      // Autre type d'erreur (table n'existe pas, etc.)
      return { exists: 'unknown', error: error?.message };
    }
  },

  /**
   * Vérifications frontend
   */
  async checkFrontendIntegrity() {
    const issues = [];

    // Check si useNetworkStatus est maintenant implémenté
    try {
      const { useNetworkStatus } = await import('../hooks/useNetworkStatus');
      if (typeof useNetworkStatus !== 'function') {
        issues?.push({
          category: 'frontend_hook',
          severity: 'medium',
          table_column: 'hooks.useNetworkStatus',
          status: 'missing',
          details: 'Hook useNetworkStatus non implémenté correctement'
        });
      }
    } catch (importError) {
      issues?.push({
        category: 'frontend_hook',
        severity: 'medium',
        table_column: 'hooks.useNetworkStatus',
        status: 'missing',
        details: 'Impossible d\'importer useNetworkStatus hook'
      });
    }

    return issues;
  },

  /**
   * Répare les problèmes détectés
   */
  async repairIssues(selectedIssues = []) {
    const results = [];

    for (const issue of selectedIssues) {
      try {
        let repairResult = null;

        switch (issue?.category) {
          case 'database_column':
            if (issue?.table_column?.includes('positions.is_active')) {
              repairResult = await this.repairPositionsIsActive();
            } else {
              repairResult = await this.repairGenericColumn(issue);
            }
            break;
            
          case 'database_function':
            // Ne pas réparer les fonctions automatiquement
            repairResult = {
              success: false,
              message: 'Réparation manuelle requise pour les fonctions'
            };
            break;
            
          default:
            repairResult = {
              success: false,
              message: 'Type de réparation non supporté'
            };
        }

        results?.push({
          issue: issue?.table_column,
          ...repairResult
        });

      } catch (error) {
        results?.push({
          issue: issue?.table_column,
          success: false,
          message: error?.message
        });
      }
    }

    return results;
  },

  /**
   * Répare spécifiquement la colonne positions.is_active
   */
  async repairPositionsIsActive() {
    try {
      const { data, error } = await supabase?.rpc('ensure_positions_is_active', {
        do_repair: true
      });

      if (error) {
        return { success: false, message: error?.message };
      }

      return { 
        success: true, 
        message: data || 'Réparation de positions.is_active réussie' 
      };
    } catch (error) {
      return { success: false, message: error?.message };
    }
  },

  /**
   * Générer des recommandations basées sur les issues
   */
  generateRecommendations(issues) {
    const recommendations = [];

    const criticalCount = issues?.filter(i => i?.severity === 'critical')?.length;
    const missingColumns = issues?.filter(i => i?.category === 'database_column' && i?.status === 'missing');

    if (criticalCount > 0) {
      recommendations?.push({
        priority: 'high',
        action: 'Réparer immédiatement les problèmes critiques',
        description: `${criticalCount} problème(s) critique(s) détecté(s) nécessitant une attention immédiate`
      });
    }

    if (missingColumns?.length > 0) {
      recommendations?.push({
        priority: 'medium',
        action: 'Exécuter les réparations de colonnes',
        description: `${missingColumns?.length} colonne(s) manquante(s) peuvent être réparées automatiquement`
      });
    }

    const connectivityIssues = issues?.filter(i => i?.category === 'database_function');
    if (connectivityIssues?.length > 0) {
      recommendations?.push({
        priority: 'medium',
        action: 'Vérifier la configuration Supabase',
        description: 'Problèmes de connectivité détectés - vérifier que le projet n\'est pas en pause'
      });
    }

    return recommendations;
  }
};

export default diagnosticService;