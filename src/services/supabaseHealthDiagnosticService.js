import { supabase } from '../lib/supabase';

/**
 * Service spécialisé pour diagnostiquer et réparer les problèmes Supabase
 * Correction des problèmes de connectivité et de schéma de base de données
 */
export const supabaseHealthDiagnosticService = {

  /**
   * Test de santé complet de Supabase
   */
  async runFullHealthCheck() {
    const results = {
      timestamp: new Date()?.toISOString(),
      overall: 'unknown',
      tests: {},
      recommendations: []
    };

    try {
      console.log('🔍 Démarrage diagnostic complet Supabase...');

      // Test 1: Configuration environnement
      results.tests.environment = await this.testEnvironmentConfig();
      
      // Test 2: Connectivité réseau
      results.tests.network = await this.testNetworkConnectivity();
      
      // Test 3: Authentification
      results.tests.auth = await this.testAuthentication();
      
      // Test 4: Schéma de base de données
      results.tests.schema = await this.testDatabaseSchema();
      
      // Test 5: RLS Policies
      results.tests.rls = await this.testRLSPolicies();
      
      // Test 6: Accès aux données de trading
      results.tests.tradingData = await this.testTradingDataAccess();

      // Évaluation globale
      const failedTests = Object.values(results?.tests)?.filter(test => !test?.passed);
      results.overall = failedTests?.length === 0 ? 'healthy' : 
                      failedTests?.length <= 2 ? 'warning' : 'critical';

      // Générer les recommandations
      results.recommendations = this.generateRecommendations(results?.tests);

      console.log(`🔍 Diagnostic terminé: ${results?.overall} (${failedTests?.length} tests échoués)`);
      
      return results;

    } catch (error) {
      console.log('❌ Erreur pendant le diagnostic:', error?.message);
      results.overall = 'error';
      results.error = error?.message;
      return results;
    }
  },

  /**
   * Test de configuration environnement
   */
  async testEnvironmentConfig() {
    try {
      const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
      
      const hasValidUrl = supabaseUrl && supabaseUrl?.startsWith('https://') && supabaseUrl?.includes('supabase');
      const hasValidKey = supabaseKey && supabaseKey?.length > 50;
      
      return {
        passed: hasValidUrl && hasValidKey,
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          urlValid: hasValidUrl,
          keyValid: hasValidKey,
          urlPreview: supabaseUrl ? `${supabaseUrl?.substring(0, 30)}...` : 'Non défini'
        }
      };
    } catch (error) {
      return {
        passed: false,
        error: error?.message,
        details: { error: 'Impossible de vérifier la configuration' }
      };
    }
  },

  /**
   * Test de connectivité réseau
   */
  async testNetworkConnectivity() {
    try {
      const startTime = Date.now();
      
      const response = await fetch(import.meta.env?.VITE_SUPABASE_URL + '/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': import.meta.env?.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal?.timeout(5000) // 5 secondes timeout
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        passed: response?.ok,
        details: {
          status: response?.status,
          statusText: response?.statusText,
          responseTime,
          headers: Object.fromEntries(response?.headers?.entries() || [])
        }
      };
    } catch (error) {
      return {
        passed: false,
        error: error?.message,
        details: {
          errorType: error?.name,
          timeout: error?.message?.includes('timeout'),
          networkError: error?.message?.includes('Failed to fetch')
        }
      };
    }
  },

  /**
   * Test d'authentification
   */
  async testAuthentication() {
    try {
      const { data: { user }, error } = await supabase?.auth?.getUser();
      
      return {
        passed: !error,
        details: {
          isAuthenticated: !!user,
          userId: user?.id || null,
          email: user?.email || null,
          error: error?.message || null
        }
      };
    } catch (error) {
      return {
        passed: false,
        error: error?.message,
        details: { authError: true }
      };
    }
  },

  /**
   * Test du schéma de base de données
   */
  async testDatabaseSchema() {
    const requiredTables = ['trades', 'portfolios', 'assets', 'market_data', 'orders', 'positions'];
    const results = {};
    let passedCount = 0;

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          ?.from(table)
          ?.select('*')
          ?.limit(1);
        
        const passed = !error;
        results[table] = {
          exists: passed,
          hasData: data?.length > 0,
          error: error?.message || null
        };
        
        if (passed) passedCount++;
        
      } catch (error) {
        results[table] = {
          exists: false,
          hasData: false,
          error: error?.message
        };
      }
    }

    return {
      passed: passedCount === requiredTables?.length,
      details: {
        totalTables: requiredTables?.length,
        existingTables: passedCount,
        tables: results
      }
    };
  },

  /**
   * Test des politiques RLS
   */
  async testRLSPolicies() {
    try {
      // Test d'accès avec et sans authentification
      const { data: publicData, error: publicError } = await supabase
        ?.from('market_data')
        ?.select('id')
        ?.limit(1);

      // Test d'accès aux données utilisateur (doit échouer sans auth)
      const { data: privateData, error: privateError } = await supabase
        ?.from('portfolios')
        ?.select('id')
        ?.limit(1);

      return {
        passed: !publicError, // Les données publiques doivent être accessibles
        details: {
          publicAccess: {
            success: !publicError,
            hasData: publicData?.length > 0,
            error: publicError?.message || null
          },
          privateAccess: {
            blocked: !!privateError, // Les données privées doivent être bloquées sans auth
            error: privateError?.message || null
          }
        }
      };
    } catch (error) {
      return {
        passed: false,
        error: error?.message,
        details: { rlsTestError: true }
      };
    }
  },

  /**
   * Test d'accès aux données de trading
   */
  async testTradingDataAccess() {
    const tradingQueries = [
      { name: 'assets', query: () => supabase?.from('assets')?.select('id, symbol')?.limit(5) },
      { name: 'market_data', query: () => supabase?.from('market_data')?.select('id, timestamp')?.limit(5) },
      { name: 'trades', query: () => supabase?.from('trades')?.select('id')?.limit(1) }
    ];

    const results = {};
    let successCount = 0;

    for (const { name, query } of tradingQueries) {
      try {
        const { data, error } = await query();
        const success = !error;
        
        results[name] = {
          accessible: success,
          hasData: data?.length > 0,
          recordCount: data?.length || 0,
          error: error?.message || null
        };
        
        if (success) successCount++;
        
      } catch (error) {
        results[name] = {
          accessible: false,
          hasData: false,
          recordCount: 0,
          error: error?.message
        };
      }
    }

    return {
      passed: successCount > 0, // Au moins une requête doit réussir
      details: {
        totalQueries: tradingQueries?.length,
        successfulQueries: successCount,
        queries: results
      }
    };
  },

  /**
   * Générer des recommandations basées sur les résultats des tests
   */
  generateRecommendations(tests) {
    const recommendations = [];

    // Configuration environnement
    if (!tests?.environment?.passed) {
      recommendations?.push({
        priority: 'HIGH',
        category: 'Configuration',
        issue: 'Variables d\'environnement Supabase manquantes ou invalides',
        solution: 'Vérifiez vos VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans le fichier .env'
      });
    }

    // Connectivité réseau
    if (!tests?.network?.passed) {
      const networkDetails = tests?.network?.details;
      if (networkDetails?.timeout) {
        recommendations?.push({
          priority: 'HIGH',
          category: 'Réseau',
          issue: 'Timeout de connexion à Supabase',
          solution: 'Vérifiez votre connexion internet et les paramètres firewall'
        });
      } else if (networkDetails?.networkError) {
        recommendations?.push({
          priority: 'CRITICAL',
          category: 'Réseau',
          issue: 'Impossible de se connecter à Supabase',
          solution: 'Projet Supabase possiblement en pause. Vérifiez votre dashboard Supabase.'
        });
      }
    }

    // Schéma de base de données
    if (!tests?.schema?.passed) {
      const schemaDetails = tests?.schema?.details;
      const missingTables = Object.entries(schemaDetails?.tables || {})
        ?.filter(([_, table]) => !table?.exists)
        ?.map(([name]) => name);
      
      if (missingTables?.length > 0) {
        recommendations?.push({
          priority: 'HIGH',
          category: 'Base de données',
          issue: `Tables manquantes: ${missingTables?.join(', ')}`,
          solution: 'Exécutez les migrations Supabase ou créez les tables manquantes'
        });
      }
    }

    // Données de trading
    if (!tests?.tradingData?.passed) {
      recommendations?.push({
        priority: 'MEDIUM',
        category: 'Données',
        issue: 'Accès limité aux données de trading',
        solution: 'Vérifiez les politiques RLS et les permissions d\'accès aux tables'
      });
    }

    return recommendations;
  },

  /**
   * Tentative de réparation automatique des problèmes
   */
  async attemptAutoRepair() {
    const repairActions = [];

    try {
      console.log('🔧 Tentative de réparation automatique...');

      // Action 1: Rafraîchir la session
      try {
        const { data, error } = await supabase?.auth?.refreshSession();
        repairActions?.push({
          action: 'Rafraîchissement de session',
          success: !error,
          details: error ? error?.message : 'Session rafraîchie avec succès'
        });
      } catch (error) {
        repairActions?.push({
          action: 'Rafraîchissement de session',
          success: false,
          details: error?.message
        });
      }

      // Action 2: Nettoyer le cache localStorage
      if (typeof window !== 'undefined') {
        try {
          const supabaseKeys = Object.keys(localStorage || {})
            ?.filter(key => key?.includes('supabase') || key?.includes('sb-'));
          
          supabaseKeys?.forEach(key => localStorage?.removeItem(key));
          
          repairActions?.push({
            action: 'Nettoyage du cache',
            success: true,
            details: `${supabaseKeys?.length} entrées de cache supprimées`
          });
        } catch (error) {
          repairActions?.push({
            action: 'Nettoyage du cache',
            success: false,
            details: error?.message
          });
        }
      }

      // Action 3: Test de reconnexion simple
      try {
        const { data, error } = await supabase
          ?.from('assets')
          ?.select('id')
          ?.limit(1);
          
        repairActions?.push({
          action: 'Test de reconnexion',
          success: !error,
          details: error ? error?.message : 'Reconnexion réussie'
        });
      } catch (error) {
        repairActions?.push({
          action: 'Test de reconnexion',
          success: false,
          details: error?.message
        });
      }

      const successfulRepairs = repairActions?.filter(action => action?.success)?.length;
      
      return {
        timestamp: new Date()?.toISOString(),
        success: successfulRepairs > 0,
        actions: repairActions,
        summary: `${successfulRepairs}/${repairActions?.length} réparations réussies`
      };

    } catch (error) {
      return {
        timestamp: new Date()?.toISOString(),
        success: false,
        error: error?.message,
        actions: repairActions
      };
    }
  }
};