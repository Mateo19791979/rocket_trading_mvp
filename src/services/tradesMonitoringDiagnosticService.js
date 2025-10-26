/**
 * Trades Monitoring Diagnostic Service
 * Implements the 6-step diagnostic process for identifying missing trades in monitoring
 * Target: IA Paper Account DUN766038
 */

class TradesMonitoringDiagnosticService {
  constructor() {
    this.baseUrl = 'https://trading-mvp.com';
    this.targetAccount = 'DUN766038';
  }

  /**
   * STEP 1 — TEST IBKR
   * Tests IBKR connection, handshake, and fills detection
   */
  async testIBKRConnection() {
    const results = {
      step: 'IBKR_CONNECTION',
      tests: [],
      status: 'pending',
      data: {}
    };

    try {
      // Test 1: Handshake
      const handshakeTest = await this.performHandshakeTest();
      results?.tests?.push(handshakeTest);
      results.data.handshake = handshakeTest?.data;

      // Test 2: Open Orders
      const openOrdersTest = await this.performOpenOrdersTest();
      results?.tests?.push(openOrdersTest);
      results.data.openOrders = openOrdersTest?.data;

      // Test 3: Fills
      const fillsTest = await this.performFillsTest();
      results?.tests?.push(fillsTest);
      results.data.fills = fillsTest?.data;

      // Determine overall status
      const hasFailures = results?.tests?.some(test => test?.status === 'error');
      const hasWarnings = results?.tests?.some(test => test?.status === 'warning');
      
      results.status = hasFailures ? 'error' : hasWarnings ? 'warning' : 'success';
      
      return results;
    } catch (error) {
      return {
        ...results,
        status: 'error',
        error: error?.message
      };
    }
  }

  async performHandshakeTest() {
    try {
      const response = await fetch(`${this.baseUrl}/api/ibkr/handshake`);
      const data = await response?.json();

      if (!response?.ok) {
        return {
          name: 'IBKR Handshake',
          status: 'error',
          message: 'Handshake request failed',
          data: null
        };
      }

      if (data?.status !== 'ok') {
        return {
          name: 'IBKR Handshake',
          status: 'error',
          message: 'IBKR status not OK',
          data
        };
      }

      if (data?.connection !== 'paper') {
        return {
          name: 'IBKR Handshake',
          status: 'warning',
          message: 'Not connected to Paper trading',
          data
        };
      }

      return {
        name: 'IBKR Handshake',
        status: 'success',
        message: `Connected to ${data?.connection} trading`,
        data
      };
    } catch (error) {
      return {
        name: 'IBKR Handshake',
        status: 'error',
        message: error?.message,
        data: null
      };
    }
  }

  async performOpenOrdersTest() {
    try {
      const response = await fetch(`${this.baseUrl}/api/ibkr/open-orders`);
      const data = await response?.json();

      return {
        name: 'IBKR Open Orders',
        status: 'success',
        message: `Found ${data?.length || 0} open orders`,
        data
      };
    } catch (error) {
      return {
        name: 'IBKR Open Orders',
        status: 'error',
        message: error?.message,
        data: null
      };
    }
  }

  async performFillsTest() {
    try {
      const response = await fetch(`${this.baseUrl}/api/ibkr/fills?limit=5`);
      const data = await response?.json();

      if (!data || data?.length === 0) {
        return {
          name: 'IBKR Fills',
          status: 'error',
          message: '⚠️ IBKR ne renvoie aucun fill – vérifier TWS / IB Gateway',
          recommendation: 'IBKR_READ_ONLY=true, ou TWS API pas activée (Enable Socket Clients)',
          data: []
        };
      }

      return {
        name: 'IBKR Fills',
        status: 'success',
        message: `Found ${data?.length} fills`,
        data
      };
    } catch (error) {
      return {
        name: 'IBKR Fills',
        status: 'error',
        message: error?.message,
        data: null
      };
    }
  }

  /**
   * STEP 2 — TEST BACKEND
   * Tests backend execution logging and configuration
   */
  async testBackend() {
    const results = {
      step: 'BACKEND_VERIFICATION',
      tests: [],
      status: 'pending',
      data: {}
    };

    try {
      // Test 1: Execution Logs
      const logsTest = await this.performExecutionLogsTest();
      results?.tests?.push(logsTest);
      results.data.executionLogs = logsTest?.data;

      // Test 2: Configuration Check (if available)
      const configTest = await this.performBackendConfigTest();
      results?.tests?.push(configTest);
      results.data.configuration = configTest?.data;

      const hasFailures = results?.tests?.some(test => test?.status === 'error');
      const hasWarnings = results?.tests?.some(test => test?.status === 'warning');
      
      results.status = hasFailures ? 'error' : hasWarnings ? 'warning' : 'success';
      
      return results;
    } catch (error) {
      return {
        ...results,
        status: 'error',
        error: error?.message
      };
    }
  }

  async performExecutionLogsTest() {
    try {
      const response = await fetch(`${this.baseUrl}/api/ibkr/execute/logs?limit=10`);
      
      if (!response?.ok) {
        return {
          name: 'Backend Execution Logs',
          status: 'error',
          message: `API returned ${response?.status}`,
          data: null
        };
      }

      const data = await response?.json();

      if (!data || data?.length === 0) {
        return {
          name: 'Backend Execution Logs',
          status: 'error',
          message: '⚠️ backend ne journalise pas les ordres exécutés',
          data: []
        };
      }

      return {
        name: 'Backend Execution Logs',
        status: 'success',
        message: `Found ${data?.length} execution logs`,
        data
      };
    } catch (error) {
      return {
        name: 'Backend Execution Logs',
        status: 'error',
        message: error?.message,
        data: null
      };
    }
  }

  async performBackendConfigTest() {
    // This would check IBKR_READ_ONLY setting if exposed via API
    return {
      name: 'Backend Configuration',
      status: 'info',
      message: 'Configuration check not implemented',
      recommendation: 'Vérifier la variable IBKR_READ_ONLY (devrait être false)',
      data: null
    };
  }

  /**
   * STEP 3 — TEST SUPABASE
   * Tests database tables, counts, and views
   */
  async testSupabase() {
    const results = {
      step: 'SUPABASE_VALIDATION',
      tests: [],
      status: 'pending',
      data: {}
    };

    try {
      // Test 1: Count orders
      const ordersCountTest = await this.performOrdersCountTest();
      results?.tests?.push(ordersCountTest);
      results.data.ordersCount = ordersCountTest?.data;

      // Test 2: Count fills
      const fillsCountTest = await this.performFillsCountTest();
      results?.tests?.push(fillsCountTest);
      results.data.fillsCount = fillsCountTest?.data;

      // Test 3: Recent orders
      const recentOrdersTest = await this.performRecentOrdersTest();
      results?.tests?.push(recentOrdersTest);
      results.data.recentOrders = recentOrdersTest?.data;

      // Test 4: View existence
      const viewTest = await this.performViewExistenceTest();
      results?.tests?.push(viewTest);
      results.data.viewExists = viewTest?.data;

      const hasFailures = results?.tests?.some(test => test?.status === 'error');
      const hasWarnings = results?.tests?.some(test => test?.status === 'warning');
      
      results.status = hasFailures ? 'error' : hasWarnings ? 'warning' : 'success';
      
      return results;
    } catch (error) {
      return {
        ...results,
        status: 'error',
        error: error?.message
      };
    }
  }

  async performOrdersCountTest() {
    try {
      const response = await this.executeSupabaseQuery('SELECT COUNT(*) as count FROM trading.orders');
      const count = response?.data?.[0]?.count || 0;

      return {
        name: 'Orders Count',
        status: count === 0 ? 'error' : 'success',
        message: `${count} orders in database`,
        data: count
      };
    } catch (error) {
      return {
        name: 'Orders Count',
        status: 'error',
        message: error?.message,
        data: 0
      };
    }
  }

  async performFillsCountTest() {
    try {
      const response = await this.executeSupabaseQuery('SELECT COUNT(*) as count FROM trading.fills');
      const count = response?.data?.[0]?.count || 0;

      return {
        name: 'Fills Count',
        status: count === 0 ? 'error' : 'success',
        message: `${count} fills in database`,
        data: count
      };
    } catch (error) {
      return {
        name: 'Fills Count',
        status: 'error',
        message: error?.message,
        data: 0
      };
    }
  }

  async performRecentOrdersTest() {
    try {
      const response = await this.executeSupabaseQuery(
        "SELECT COUNT(*) as count FROM trading.orders WHERE created_at >= now()-interval '1 hour'"
      );
      const count = response?.data?.[0]?.count || 0;

      return {
        name: 'Recent Orders (1h)',
        status: 'info',
        message: `${count} orders in last hour`,
        data: count
      };
    } catch (error) {
      return {
        name: 'Recent Orders (1h)',
        status: 'error',
        message: error?.message,
        data: 0
      };
    }
  }

  async performViewExistenceTest() {
    try {
      const response = await this.executeSupabaseQuery(
        "SELECT to_regclass('trading.v_orders_current_status')"
      );
      const exists = response?.data?.[0]?.to_regclass !== null;

      return {
        name: 'View Existence',
        status: exists ? 'success' : 'warning',
        message: exists ? 'View exists' : '⚠️ Vue trading.v_orders_current_status absente, recréer-la',
        data: exists
      };
    } catch (error) {
      return {
        name: 'View Existence',
        status: 'error',
        message: error?.message,
        data: false
      };
    }
  }

  /**
   * STEP 4 — TEST FRONTEND (Monitoring)
   * Tests frontend API endpoints and data retrieval
   */
  async testFrontend() {
    const results = {
      step: 'FRONTEND_MONITORING',
      tests: [],
      status: 'pending',
      data: {}
    };

    try {
      // Test 1: Trades count API
      const tradesCountTest = await this.performTradesCountTest();
      results?.tests?.push(tradesCountTest);
      results.data.tradesCount = tradesCountTest?.data;

      // Test 2: API endpoint validation
      const endpointTest = await this.performEndpointValidationTest();
      results?.tests?.push(endpointTest);
      results.data.endpointValidation = endpointTest?.data;

      const hasFailures = results?.tests?.some(test => test?.status === 'error');
      const hasWarnings = results?.tests?.some(test => test?.status === 'warning');
      
      results.status = hasFailures ? 'error' : hasWarnings ? 'warning' : 'success';
      
      return results;
    } catch (error) {
      return {
        ...results,
        status: 'error',
        error: error?.message
      };
    }
  }

  async performTradesCountTest() {
    try {
      const response = await fetch(`${this.baseUrl}/api/metrics/trades/count`);
      
      if (!response?.ok) {
        return {
          name: 'Trades Count API',
          status: 'error',
          message: `API returned ${response?.status}`,
          data: null
        };
      }

      const data = await response?.json();

      // Check for expected structure
      const hasExpectedFields = data?.hasOwnProperty('count_15m') && 
                              data?.hasOwnProperty('count_today') && 
                              data?.hasOwnProperty('count_total');

      if (!hasExpectedFields) {
        return {
          name: 'Trades Count API',
          status: 'warning',
          message: 'API response missing expected fields',
          data
        };
      }

      return {
        name: 'Trades Count API',
        status: 'success',
        message: `API working, count_total: ${data?.count_total}`,
        data
      };
    } catch (error) {
      return {
        name: 'Trades Count API',
        status: 'error',
        message: error?.message,
        data: null
      };
    }
  }

  async performEndpointValidationTest() {
    return {
      name: 'Endpoint Validation',
      status: 'info',
      message: 'Page /trades should call /api/metrics/trades/count and not public.positions',
      recommendation: 'Vérifier que la page /trades appelle bien cette route et non une vue vide (public.positions)',
      data: true
    };
  }

  /**
   * STEP 5 — RAPPORT SYNTHÉTIQUE
   * Generates a comprehensive diagnostic table
   */
  generateSyntheticReport(ibkrResults, backendResults, supabaseResults, frontendResults) {
    const report = [
      {
        component: 'IBKR',
        test: 'handshake / fills',
        result: ibkrResults?.status === 'success' ? 'OK' : 'KO',
        interpretation: 'connexion IBKR',
        correctif: 'activer API TWS'
      },
      {
        component: 'Backend',
        test: 'execute/logs',
        result: backendResults?.status === 'success' ? 'OK' : 'KO',
        interpretation: 'ordres reçus',
        correctif: 'vérifier write mode'
      },
      {
        component: 'Supabase',
        test: 'orders/fills count',
        result: `${supabaseResults?.data?.ordersCount || 0} / ${supabaseResults?.data?.fillsCount || 0}`,
        interpretation: 'DB alimentée',
        correctif: 'trigger ou vue manquante'
      },
      {
        component: 'Frontend',
        test: '/metrics/trades/count',
        result: frontendResults?.status === 'success' ? 'OK' : 'KO',
        interpretation: 'UI branchée',
        correctif: 'endpoint à corriger'
      }
    ];

    return report;
  }

  /**
   * STEP 6 — SORTIE FINALE
   * Generates the final JSON diagnostic report
   */
  generateFinalReport(ibkrResults, backendResults, supabaseResults, frontendResults) {
    // Determine probable cause and recommended fix
    let probableCause = '';
    let recommendedFix = '';

    if (ibkrResults?.status === 'error') {
      probableCause = 'problème TWS/API';
      recommendedFix = 'Vérifier TWS/Gateway ouvert, API activée, IBKR_READ_ONLY=false';
    } else if (ibkrResults?.status === 'success' && 
               ibkrResults?.data?.fills?.length === 0) {
      probableCause = 'problème d\'écriture backend';
      recommendedFix = 'Vérifier IBKR_READ_ONLY=false, backend en mode écriture';
    } else if (supabaseResults?.data?.ordersCount === 0) {
      probableCause = 'problème d\'écriture backend';
      recommendedFix = 'Vérifier triggers, RPC, connexion backend->DB';
    } else if (frontendResults?.status === 'error' || 
               frontendResults?.data?.tradesCount?.count_total === 0) {
      probableCause = 'problème d\'API ou de requête front';
      recommendedFix = 'Vérifier endpoint /api/metrics/trades/count, requête DB';
    } else {
      probableCause = 'cache ou retard Supabase/PostgREST';
      recommendedFix = 'Le monitoring doit afficher les trades dans les 60 secondes';
    }

    const report = {
      ibkr_connection: ibkrResults?.status === 'success' ? 'OK' : 'KO',
      fills_detected: ibkrResults?.data?.fills?.length || 0,
      orders_in_db: supabaseResults?.data?.ordersCount || 0,
      fills_in_db: supabaseResults?.data?.fillsCount || 0,
      frontend_trades_count: frontendResults?.data?.tradesCount?.count_total || 0,
      probable_cause: probableCause,
      recommended_fix: recommendedFix,
      timestamp: new Date()?.toISOString(),
      account_target: this.targetAccount,
      detailed_results: {
        ibkr: ibkrResults,
        backend: backendResults,
        supabase: supabaseResults,
        frontend: frontendResults
      }
    };

    return report;
  }

  /**
   * Utility method to execute Supabase queries
   */
  async executeSupabaseQuery(query) {
    const response = await fetch('/api/supabase/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response?.ok) {
      throw new Error(`Supabase query failed: ${response.status}`);
    }

    return await response?.json();
  }

  /**
   * Main diagnostic method that runs all tests sequentially
   */
  async runFullDiagnostic() {
    const results = {
      startTime: new Date()?.toISOString(),
      steps: []
    };

    try {
      // Step 1: IBKR Test
      const ibkrResults = await this.testIBKRConnection();
      results?.steps?.push(ibkrResults);

      // Step 2: Backend Test
      const backendResults = await this.testBackend();
      results?.steps?.push(backendResults);

      // Step 3: Supabase Test
      const supabaseResults = await this.testSupabase();
      results?.steps?.push(supabaseResults);

      // Step 4: Frontend Test
      const frontendResults = await this.testFrontend();
      results?.steps?.push(frontendResults);

      // Step 5: Generate Synthetic Report
      const syntheticReport = this.generateSyntheticReport(
        ibkrResults, backendResults, supabaseResults, frontendResults
      );

      // Step 6: Generate Final Report
      const finalReport = this.generateFinalReport(
        ibkrResults, backendResults, supabaseResults, frontendResults
      );

      results.endTime = new Date()?.toISOString();
      results.syntheticReport = syntheticReport;
      results.finalReport = finalReport;

      return results;
    } catch (error) {
      results.error = error?.message;
      results.endTime = new Date()?.toISOString();
      return results;
    }
  }
}

// Export singleton instance
export default new TradesMonitoringDiagnosticService();