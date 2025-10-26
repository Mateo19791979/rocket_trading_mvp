import { supabase } from '@/lib/supabase';

class SupabaseDiagnosticService {
  constructor() {
    this.knownErrors = {
      '42703': {
        name: 'Missing Column Error',
        description: 'Database column does not exist',
        severity: 'critical',
        autoFixable: true
      },
      '42883': {
        name: 'Function Not Found',
        description: 'Database function does not exist',
        severity: 'critical',
        autoFixable: true
      },
      '42P01': {
        name: 'Missing Table',
        description: 'Table or relation does not exist',
        severity: 'critical',
        autoFixable: true
      }
    };
    
    this.sqlErrorsCache = [];
    this.lastDiagnosticRun = null;
  }

  /**
   * Diagnostique complet du système Supabase
   */
  async runCompleteDiagnostics() {
    console.log('🔍 [SDS] Starting complete Supabase diagnostics...');
    
    const diagnostics = {
      timestamp: new Date()?.toISOString(),
      connection: await this.testConnection(),
      schema: await this.validateSchema(),
      errors: await this.analyzeRuntimeErrors(),
      recommendations: [],
      autoFixAvailable: false,
      severity: 'healthy'
    };

    // Analyser les erreurs critiques
    if (diagnostics?.errors?.criticalErrors?.length > 0) {
      diagnostics.severity = 'critical';
      diagnostics.autoFixAvailable = diagnostics?.errors?.criticalErrors?.some(err => 
        this.knownErrors?.[err?.sqlState]?.autoFixable
      );
    } else if (diagnostics?.errors?.totalErrors > 0) {
      diagnostics.severity = 'warning';
    }

    // Générer les recommandations
    diagnostics.recommendations = this.generateRecommendations(diagnostics);
    
    this.lastDiagnosticRun = diagnostics;
    return diagnostics;
  }

  /**
   * Test de connexion de base
   */
  async testConnection() {
    try {
      const { data, error } = await supabase?.from('users')?.select('count')?.limit(1);

      return {
        status: error ? 'failed' : 'success',
        error: error?.message,
        responseTime: Date.now() - Date.now(),
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error?.message || 'Unknown connection error',
        timestamp: new Date()?.toISOString()
      };
    }
  }

  /**
   * Validation du schéma de base de données
   */
  async validateSchema() {
    const validationResults = {
      missingTables: [],
      missingColumns: [],
      missingFunctions: [],
      status: 'healthy'
    };

    try {
      // Vérifier les tables critiques
      const criticalTables = ['positions', 'trades', 'orders', 'market_ticks_cache'];
      
      for (const tableName of criticalTables) {
        const tableExists = await this.checkTableExists(tableName);
        if (!tableExists) {
          validationResults?.missingTables?.push(tableName);
        } else {
          // Vérifier les colonnes critiques
          const missingCols = await this.checkRequiredColumns(tableName);
          validationResults?.missingColumns?.push(...missingCols);
        }
      }

      if (validationResults?.missingTables?.length > 0 || 
          validationResults?.missingColumns?.length > 0) {
        validationResults.status = 'critical';
      }

    } catch (error) {
      validationResults.status = 'error';
      validationResults.error = error?.message;
    }

    return validationResults;
  }

  /**
   * Vérifier si une table existe
   */
  async checkTableExists(tableName) {
    try {
      const { error } = await supabase?.from(tableName)?.select('*')?.limit(0);

      return !error || !error?.message?.includes('does not exist');
    } catch (error) {
      return false;
    }
  }

  /**
   * Vérifier les colonnes requises pour une table
   */
  async checkRequiredColumns(tableName) {
    const requiredColumns = {
      'positions': ['id', 'account_id', 'symbol', 'qty', 'avg_price', 'is_active', 'updated_at'],
      'trades': ['id', 'order_id', 'account_id', 'symbol', 'side', 'qty', 'price', 'fees', 'realized_pnl', 'unrealized_pnl', 'ts'],
      'orders': ['id', 'client_order_id', 'account_id', 'symbol', 'side', 'qty', 'order_type', 'status'],
      'market_ticks_cache': ['symbol', 'last', 'bid', 'ask', 'ts']
    };

    const missing = [];
    const required = requiredColumns?.[tableName] || [];

    for (const column of required) {
      try {
        const { error } = await supabase?.from(tableName)?.select(column)?.limit(0);

        if (error?.message?.includes(`column "${column}" does not exist`)) {
          missing?.push({
            table: tableName,
            column: column,
            sqlState: '42703'
          });
        }
      } catch (error) {
        if (error?.message?.includes('does not exist')) {
          missing?.push({
            table: tableName,
            column: column,
            sqlState: '42703'
          });
        }
      }
    }

    return missing;
  }

  /**
   * Analyser les erreurs runtime Supabase
   */
  async analyzeRuntimeErrors() {
    try {
      // Simuler l'analyse des erreurs runtime
      const errors = {
        totalErrors: 0,
        criticalErrors: [],
        warnings: [],
        sqlStateBreakdown: {}
      };

      // Détecter les erreurs 42703 spécifiques observées
      const knownIssues = [
        {
          sqlState: '42703',
          message: 'column positions.is_active does not exist',
          severity: 'critical',
          table: 'positions',
          column: 'is_active'
        },
        {
          sqlState: '42703',
          message: 'column trades.unrealized_pnl does not exist',
          severity: 'critical',
          table: 'trades',
          column: 'unrealized_pnl'
        }
      ];

      for (const issue of knownIssues) {
        const exists = await this.verifyColumnExists(issue?.table, issue?.column);
        if (!exists) {
          errors?.criticalErrors?.push(issue);
          errors.totalErrors++;
          
          if (!errors?.sqlStateBreakdown?.[issue?.sqlState]) {
            errors.sqlStateBreakdown[issue.sqlState] = 0;
          }
          errors.sqlStateBreakdown[issue.sqlState]++;
        }
      }

      return errors;
    } catch (error) {
      return {
        totalErrors: 1,
        criticalErrors: [],
        warnings: [],
        error: error?.message
      };
    }
  }

  /**
   * Vérifier si une colonne spécifique existe
   */
  async verifyColumnExists(tableName, columnName) {
    try {
      const { error } = await supabase?.from(tableName)?.select(columnName)?.limit(0);

      return !error || !error?.message?.includes(`column "${columnName}" does not exist`);
    } catch (error) {
      return false;
    }
  }

  /**
   * Générer les recommandations de réparation
   */
  generateRecommendations(diagnostics) {
    const recommendations = [];

    if (diagnostics?.errors?.criticalErrors?.length > 0) {
      recommendations?.push({
        type: 'critical',
        title: 'Critical Database Schema Issues Detected',
        description: 'Missing columns are preventing API requests from functioning',
        actions: [
          'Run Step 3 migration (shield) to add missing columns',
          'Apply trading schema compatibility patches',
          'Restart application after database fixes'
        ],
        autoFixAvailable: true,
        priority: 1
      });
    }

    if (diagnostics?.schema?.missingTables?.length > 0) {
      recommendations?.push({
        type: 'critical',
        title: 'Missing Database Tables',
        description: 'Core trading tables are missing from database',
        actions: [
          'Apply complete migration sequence (Steps 1, 2, 3)',
          'Verify Supabase migration status',
          'Check database connection permissions'
        ],
        autoFixAvailable: true,
        priority: 1
      });
    }

    if (diagnostics?.connection?.status === 'failed') {
      recommendations?.push({
        type: 'network',
        title: 'Supabase Connection Issues',
        description: 'Cannot connect to Supabase database',
        actions: [
          'Check internet connectivity',
          'Verify Supabase credentials in environment variables',
          'Check Supabase service status'
        ],
        autoFixAvailable: false,
        priority: 2
      });
    }

    return recommendations?.sort((a, b) => a?.priority - b?.priority);
  }

  /**
   * Auto-fix pour les erreurs critiques
   */
  async attemptAutoFix() {
    console.log('🔧 [SDS] Attempting automatic fixes...');
    
    const fixResults = {
      success: false,
      appliedFixes: [],
      errors: [],
      requiresManualIntervention: false
    };

    try {
      // Appliquer les correctifs SQL automatiques
      const criticalFixes = this.generateAutoFixSQL();
      
      for (const fix of criticalFixes) {
        try {
          console.log(`Applying fix: ${fix?.description}`);
          
          // Note: En production, ceci devrait être fait via des migrations Supabase
          // Pour l'instant, on simule le processus
          fixResults?.appliedFixes?.push({
            description: fix?.description,
            sql: fix?.sql,
            status: 'simulated', // En production: 'applied'
            timestamp: new Date()?.toISOString()
          });

        } catch (error) {
          fixResults?.errors?.push({
            fix: fix?.description,
            error: error?.message
          });
        }
      }

      fixResults.success = fixResults?.appliedFixes?.length > 0;
      fixResults.requiresManualIntervention = fixResults?.errors?.length > 0;

    } catch (error) {
      fixResults?.errors?.push({
        fix: 'auto-fix-process',
        error: error?.message
      });
    }

    return fixResults;
  }

  /**
   * Générer les SQL fixes automatiques
   */
  generateAutoFixSQL() {
    return [
      {
        description: 'Add missing is_active column to positions table',
        sql: `
          DO $$ BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_schema='public' AND table_name='positions' AND column_name='is_active'
            ) THEN
              ALTER TABLE public.positions ADD COLUMN is_active boolean NOT NULL DEFAULT true;
            END IF;
          END $$;
        `,
        priority: 1
      },
      {
        description: 'Add missing unrealized_pnl column to trades table',
        sql: `
          DO $$ BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_schema='public' AND table_name='trades' AND column_name='unrealized_pnl'
            ) THEN
              ALTER TABLE public.trades ADD COLUMN unrealized_pnl numeric;
            END IF;
          END $$;
        `,
        priority: 1
      },
      {
        description: 'Ensure trading schema compatibility views exist',
        sql: `
          CREATE OR REPLACE VIEW public.positions AS 
          SELECT id, account_id, symbol, qty, avg_price, 
                 COALESCE(is_active, true) as is_active, updated_at 
          FROM trading.positions;
          
          CREATE OR REPLACE VIEW public.trades AS 
          SELECT id, order_id, account_id, symbol, side, qty, price, fees, 
                 realized_pnl, unrealized_pnl, ts 
          FROM trading.trades;
        `,
        priority: 2
      }
    ];
  }

  /**
   * Obtenir le résumé du dernier diagnostic
   */
  getLastDiagnosticSummary() {
    if (!this.lastDiagnosticRun) {
      return null;
    }

    return {
      timestamp: this.lastDiagnosticRun?.timestamp,
      severity: this.lastDiagnosticRun?.severity,
      totalErrors: this.lastDiagnosticRun?.errors?.totalErrors || 0,
      autoFixAvailable: this.lastDiagnosticRun?.autoFixAvailable,
      recommendationsCount: this.lastDiagnosticRun?.recommendations?.length || 0
    };
  }

  /**
   * Test de santé rapide
   */
  async quickHealthCheck() {
    try {
      const results = await Promise.all([
        this.verifyColumnExists('positions', 'is_active'),
        this.verifyColumnExists('trades', 'unrealized_pnl'),
        this.checkTableExists('market_ticks_cache'),
        this.testConnection()
      ]);

      const [positionsOk, tradesOk, cacheOk, connectionOk] = results;

      return {
        status: (positionsOk && tradesOk && cacheOk && connectionOk?.status === 'success') ? 'healthy' : 'critical',
        issues: {
          missingPositionsIsActive: !positionsOk,
          missingTradesUnrealizedPnl: !tradesOk,
          missingMarketCache: !cacheOk,
          connectionFailed: connectionOk?.status !== 'success'
        },
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error?.message,
        timestamp: new Date()?.toISOString()
      };
    }
  }

  /**
   * Kill-switch d'urgence pour couper le trading immédiatement
   */
  async emergencyKillSwitch(accountCode = 'DUN766038') {
    console.log('🚨 [SDS] Activating emergency kill switch...');
    
    const killSwitchResults = {
      success: false,
      actions: [],
      errors: [],
      timestamp: new Date()?.toISOString()
    };

    try {
      // A. Coupe le trading et passe en lecture seule
      const { error: killSwitchError } = await supabase?.rpc('execute_emergency_killswitch', {
        account_code: accountCode
      });

      if (killSwitchError) {
        // Fallback SQL direct si la fonction RPC n'existe pas console.log('RPC not available, attempting direct SQL...');
        
        const killSwitchSQL = `
          DO $$ 
          BEGIN   
            IF to_regclass('trading.accounts') IS NOT NULL      
               AND to_regclass('trading.runtime_flags') IS NOT NULL THEN     
              UPDATE trading.runtime_flags rf     
              SET trading_enabled = false, read_only = true, updated_at = now()     
              FROM trading.accounts a     
              WHERE rf.account_id = a.id       
                AND a.account_code = $1;   
            END IF; 
          END $$;
        `;

        const { error: directError } = await supabase?.rpc('execute_sql', {
          query: killSwitchSQL,
          params: [accountCode]
        });

        if (directError) {
          killSwitchResults?.errors?.push({
            action: 'kill_switch',
            error: directError?.message
          });
        } else {
          killSwitchResults?.actions?.push({
            action: 'Trading disabled via direct SQL',
            status: 'success',
            target: accountCode
          });
        }
      } else {
        killSwitchResults?.actions?.push({
          action: 'Trading disabled via RPC',
          status: 'success',
          target: accountCode
        });
      }

      killSwitchResults.success = killSwitchResults?.actions?.length > 0;

    } catch (error) {
      killSwitchResults?.errors?.push({
        action: 'emergency_kill_switch',
        error: error?.message
      });
    }

    return killSwitchResults;
  }

  /**
   * Vérifications de santé backend (health checks)
   */
  async performHealthChecks() {
    console.log('🔍 [SDS] Performing backend health checks...');
    
    const healthResults = {
      timestamp: new Date()?.toISOString(),
      checks: {},
      overall_status: 'unknown'
    };

    try {
      // API up ?
      const apiCheck = await this.checkApiHealth();
      healthResults.checks.api = apiCheck;

      // Test de connectivité Supabase
      const dbCheck = await this.testConnection();
      healthResults.checks.database = dbCheck;

      // Vérification des tables critiques
      const schemaCheck = await this.validateCriticalTables();
      healthResults.checks.schema = schemaCheck;

      // Déterminer le statut global
      const allChecksPass = Object.values(healthResults?.checks)?.every(check => 
        check?.status === 'success' || check?.status === 'healthy'
      );

      healthResults.overall_status = allChecksPass ? 'healthy' : 'degraded';

    } catch (error) {
      healthResults.checks.system = {
        status: 'failed',
        error: error?.message
      };
      healthResults.overall_status = 'critical';
    }

    return healthResults;
  }

  /**
   * Vérifier la santé de l'API
   */
  async checkApiHealth() {
    try {
      const response = await fetch('/health', { 
        method: 'GET',
        timeout: 5000 
      });
      
      return {
        status: response?.ok ? 'success' : 'failed',
        code: response?.status,
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error?.message,
        timestamp: new Date()?.toISOString()
      };
    }
  }

  /**
   * Valider les tables critiques pour le trading
   */
  async validateCriticalTables() {
    const criticalTables = [
      'trading.accounts',
      'trading.runtime_flags', 
      'trading.orders',
      'trading.positions',
      'trading.trades',
      'trading.market_ticks_cache'
    ];

    const results = {
      status: 'healthy',
      missing_tables: [],
      existing_tables: []
    };

    try {
      for (const tableName of criticalTables) {
        const exists = await this.checkTableExists(tableName?.replace('trading.', ''));
        
        if (exists) {
          results?.existing_tables?.push(tableName);
        } else {
          results?.missing_tables?.push(tableName);
        }
      }

      if (results?.missing_tables?.length > 0) {
        results.status = 'critical';
      }

    } catch (error) {
      results.status = 'failed';
      results.error = error?.message;
    }

    return results;
  }

  /**
   * Réactivation progressive après stabilisation
   */
  async progressiveReactivation(accountCode = 'DUN766038', dryRun = true) {
    console.log('🔄 [SDS] Starting progressive reactivation...');
    
    const reactivationResults = {
      success: false,
      steps: [],
      errors: [],
      current_mode: dryRun ? 'dry_run' : 'live',
      timestamp: new Date()?.toISOString()
    };

    try {
      // Étape 1: Passer en mode lecture seule
      const { error: readOnlyError } = await supabase?.rpc('set_read_only_mode', {
        account_code: accountCode,
        read_only: true
      });

      if (!readOnlyError) {
        reactivationResults?.steps?.push({
          step: 1,
          description: 'Set to read-only mode',
          status: 'success'
        });
      }

      // Étape 2: Tests de santé
      const healthCheck = await this.performHealthChecks();
      
      if (healthCheck?.overall_status === 'healthy') {
        reactivationResults?.steps?.push({
          step: 2,
          description: 'Health checks passed',
          status: 'success'
        });

        // Étape 3: Test ordre Paper dry-run (si demandé)
        if (dryRun) {
          const testOrder = await this.testPaperOrder();
          
          if (testOrder?.success) {
            reactivationResults?.steps?.push({
              step: 3,
              description: 'Paper trading test successful',
              status: 'success'
            });
          }
        }

      } else {
        reactivationResults?.errors?.push({
          step: 2,
          error: 'Health checks failed',
          details: healthCheck
        });
      }

      reactivationResults.success = reactivationResults?.errors?.length === 0;

    } catch (error) {
      reactivationResults?.errors?.push({
        step: 'progressive_reactivation',
        error: error?.message
      });
    }

    return reactivationResults;
  }

  /**
   * Test d'ordre Paper pour validation
   */
  async testPaperOrder() {
    try {
      // Simuler un petit ordre test
      const testOrderData = {
        symbol: 'AAPL',
        side: 'BUY',
        qty: 1,
        orderType: 'MKT',
        dryRun: true
      };

      const { data, error } = await supabase?.rpc('test_paper_order', testOrderData);

      return {
        success: !error,
        data: data,
        error: error?.message,
        timestamp: new Date()?.toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error?.message,
        timestamp: new Date()?.toISOString()
      };
    }
  }

  /**
   * Obtenir le statut d'urgence complet
   */
  async getEmergencyStatus() {
    const status = {
      timestamp: new Date()?.toISOString(),
      trading_status: 'unknown',
      ui_status: 'unknown',
      critical_errors: [],
      recommendations: []
    };

    try {
      // Vérifier le statut de trading
      const { data: tradingFlags } = await supabase?.from('runtime_flags')?.select('*')?.limit(1);
      
      if (tradingFlags?.length > 0) {
        const flags = tradingFlags?.[0];
        status.trading_status = flags?.trading_enabled ? 'enabled' : 'disabled';
        status.read_only_mode = flags?.read_only || false;
      }

      // Vérifier les erreurs critiques
      const diagnostics = await this.runCompleteDiagnostics();
      
      if (diagnostics?.severity === 'critical') {
        status.critical_errors = diagnostics?.errors?.criticalErrors || [];
        status.ui_status = 'broken';
        
        status?.recommendations?.push({
          priority: 'critical',
          action: 'Apply Step 3 migration (shield) immediately',
          description: 'Missing database columns are preventing UI from loading'
        });
      } else {
        status.ui_status = 'functional';
      }

    } catch (error) {
      status?.critical_errors?.push({
        source: 'emergency_status_check',
        error: error?.message
      });
    }

    return status;
  }
}

// Create singleton instance
const supabaseDiagnostics = new SupabaseDiagnosticService();

export { supabaseDiagnostics };
export default supabaseDiagnostics;