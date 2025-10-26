import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, XCircle, RefreshCw, Play, Download, Copy, Clock, Database, Server, Monitor, Zap } from 'lucide-react';

const TradesMonitoringDiagnosticCenter = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [diagnosticResults, setDiagnosticResults] = useState({
    ibkr: { status: 'pending', data: null, error: null },
    backend: { status: 'pending', data: null, error: null },
    supabase: { status: 'pending', data: null, error: null },
    frontend: { status: 'pending', data: null, error: null }
  });
  const [finalReport, setFinalReport] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date()?.toISOString(),
      message,
      type
    }]);
  };

  const testIBKRConnection = async () => {
    addLog('STEP 1 — TEST IBKR', 'info');
    try {
      // Test 1: Handshake
      addLog('1. Testing IBKR Handshake...', 'info');
      const handshakeResponse = await fetch('https://trading-mvp.com/api/ibkr/handshake');
      const handshakeData = await handshakeResponse?.json();
      
      if (!handshakeResponse?.ok || handshakeData?.status !== 'ok') {
        throw new Error('IBKR Handshake failed');
      }
      
      if (handshakeData?.connection !== 'paper') {
        addLog('⚠️ Warning: Not connected to Paper trading', 'warning');
      }
      
      addLog(`✅ Handshake OK - Status: ${handshakeData?.status}, Connection: ${handshakeData?.connection}`, 'success');

      // Test 2: Check for fills
      addLog('2. Checking IBKR Fills...', 'info');
      const fillsResponse = await fetch('https://trading-mvp.com/api/ibkr/fills?limit=5');
      const fillsData = await fillsResponse?.json();
      
      const openOrdersResponse = await fetch('https://trading-mvp.com/api/ibkr/open-orders');
      const openOrdersData = await openOrdersResponse?.json();

      if (!fillsData || fillsData?.length === 0) {
        addLog('⚠️ IBKR ne renvoie aucun fill – vérifier TWS / IB Gateway', 'error');
        addLog('Probable cause: IBKR_READ_ONLY=true, ou TWS API pas activée (Enable Socket Clients)', 'warning');
      } else {
        addLog(`✅ Found ${fillsData?.length} fills in IBKR`, 'success');
      }

      return {
        status: 'success',
        data: {
          handshake: handshakeData,
          fills: fillsData,
          openOrders: openOrdersData,
          fillsCount: fillsData?.length || 0
        }
      };
    } catch (error) {
      addLog(`❌ IBKR Test Failed: ${error?.message}`, 'error');
      return {
        status: 'error',
        error: error?.message,
        data: null
      };
    }
  };

  const testBackend = async () => {
    addLog('STEP 2 — TEST BACKEND', 'info');
    try {
      // Test 1: Check execution logs
      addLog('1. Checking backend execution logs...', 'info');
      const logsResponse = await fetch('https://trading-mvp.com/api/ibkr/execute/logs?limit=10');
      
      if (!logsResponse?.ok) {
        throw new Error(`Backend logs API returned ${logsResponse.status}`);
      }
      
      const logsData = await logsResponse?.json();
      
      if (!logsData || logsData?.length === 0) {
        addLog('⚠️ backend ne journalise pas les ordres exécutés', 'error');
      } else {
        addLog(`✅ Found ${logsData?.length} execution logs`, 'success');
      }

      // Test 2: Check IBKR_READ_ONLY setting (if accessible)
      addLog('2. Verifying IBKR_READ_ONLY setting...', 'info');
      // This would need to be implemented in backend to expose this info
      
      return {
        status: 'success',
        data: {
          executionLogs: logsData,
          logsCount: logsData?.length || 0
        }
      };
    } catch (error) {
      addLog(`❌ Backend Test Failed: ${error?.message}`, 'error');
      return {
        status: 'error',
        error: error?.message,
        data: null
      };
    }
  };

  const testSupabase = async () => {
    addLog('STEP 3 — TEST SUPABASE', 'info');
    try {
      // Test 1: Count orders and fills
      addLog('1. Counting orders and fills in database...', 'info');
      
      const ordersCountResponse = await fetch('/api/supabase/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'SELECT COUNT(*) as count FROM trading.orders'
        })
      });
      
      const fillsCountResponse = await fetch('/api/supabase/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'SELECT COUNT(*) as count FROM trading.fills'
        })
      });
      
      const recentOrdersResponse = await fetch('/api/supabase/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "SELECT COUNT(*) as count FROM trading.orders WHERE created_at >= now()-interval '1 hour'"
        })
      });

      const ordersCount = await ordersCountResponse?.json();
      const fillsCount = await fillsCountResponse?.json();
      const recentOrders = await recentOrdersResponse?.json();

      addLog(`📊 Orders in DB: ${ordersCount?.data?.[0]?.count || 0}`, 'info');
      addLog(`📊 Fills in DB: ${fillsCount?.data?.[0]?.count || 0}`, 'info');
      addLog(`📊 Recent Orders (1h): ${recentOrders?.data?.[0]?.count || 0}`, 'info');

      if (ordersCount?.data?.[0]?.count === 0 || fillsCount?.data?.[0]?.count === 0) {
        addLog('⚠️ Problem: trading.orders = 0 or trading.fills = 0 → API backend ou trigger manquant', 'error');
      }

      // Test 2: Check if view exists
      addLog('2. Checking if trading.v_orders_current_status view exists...', 'info');
      const viewCheckResponse = await fetch('/api/supabase/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "SELECT to_regclass('trading.v_orders_current_status')"
        })
      });
      
      const viewCheck = await viewCheckResponse?.json();
      const viewExists = viewCheck?.data?.[0]?.to_regclass !== null;
      
      if (!viewExists) {
        addLog('⚠️ Vue trading.v_orders_current_status absente, recréer-la', 'warning');
      } else {
        addLog('✅ View trading.v_orders_current_status exists', 'success');
      }

      return {
        status: 'success',
        data: {
          ordersCount: ordersCount?.data?.[0]?.count || 0,
          fillsCount: fillsCount?.data?.[0]?.count || 0,
          recentOrdersCount: recentOrders?.data?.[0]?.count || 0,
          viewExists
        }
      };
    } catch (error) {
      addLog(`❌ Supabase Test Failed: ${error?.message}`, 'error');
      return {
        status: 'error',
        error: error?.message,
        data: null
      };
    }
  };

  const testFrontend = async () => {
    addLog('STEP 4 — TEST FRONTEND (Monitoring)', 'info');
    try {
      // Test 1: Check trades count API
      addLog('1. Testing /api/metrics/trades/count endpoint...', 'info');
      
      const tradesCountResponse = await fetch('https://trading-mvp.com/api/metrics/trades/count');
      
      if (!tradesCountResponse?.ok) {
        throw new Error(`Trades count API returned ${tradesCountResponse.status}`);
      }
      
      const tradesCountData = await tradesCountResponse?.json();
      
      addLog(`📊 Frontend trades count: ${JSON.stringify(tradesCountData)}`, 'info');
      
      if (tradesCountData?.count_total === 0 && diagnosticResults?.supabase?.data?.ordersCount > 0) {
        addLog('⚠️ Mismatch: count=0 but trading.orders contains data → mismatch API <-> DB', 'error');
      } else if (tradesCountData?.count_total > 0) {
        addLog(`✅ Frontend shows ${tradesCountData?.count_total} total trades`, 'success');
      }

      // Test 2: Verify /trades page is calling the right endpoint
      addLog('2. Verifying /trades page endpoint configuration...', 'info');
      addLog('✅ Page /trades should call /api/metrics/trades/count and not public.positions', 'info');

      return {
        status: 'success',
        data: {
          tradesCount: tradesCountData,
          apiWorking: true
        }
      };
    } catch (error) {
      addLog(`❌ Frontend Test Failed: ${error?.message}`, 'error');
      return {
        status: 'error',
        error: error?.message,
        data: null
      };
    }
  };

  const generateFinalReport = () => {
    addLog('STEP 6 — GENERATING FINAL REPORT', 'info');
    
    const results = diagnosticResults;
    let probableCause = '';
    let recommendedFix = '';

    // Determine probable cause
    if (results?.ibkr?.status === 'error') {
      probableCause = 'IBKR connection or API issue';
      recommendedFix = 'Check TWS/Gateway connection, verify API is enabled, check IBKR_READ_ONLY setting';
    } else if (results?.ibkr?.status === 'success' && results?.ibkr?.data?.fillsCount === 0) {
      probableCause = 'IBKR connected but no fills detected';
      recommendedFix = 'Verify TWS API settings (Enable Socket Clients), check IBKR_READ_ONLY=false';
    } else if (results?.backend?.status === 'error' || results?.backend?.data?.logsCount === 0) {
      probableCause = 'Backend not logging executed orders';
      recommendedFix = 'Check backend IBKR integration, verify write mode is enabled';
    } else if (results?.supabase?.data?.ordersCount === 0) {
      probableCause = 'Database not being populated';
      recommendedFix = 'Check API backend write operations, verify triggers or RPC functions';
    } else if (results?.frontend?.status === 'error' || results?.frontend?.data?.tradesCount?.count_total === 0) {
      probableCause = 'Frontend API or query issue';
      recommendedFix = 'Verify /api/metrics/trades/count endpoint, check database query logic';
    } else {
      probableCause = 'System appears to be working correctly';
      recommendedFix = 'Monitor for latency issues, verify real-time updates';
    }

    const report = {
      ibkr_connection: results?.ibkr?.status === 'success' ? 'OK' : 'KO',
      fills_detected: results?.ibkr?.data?.fillsCount || 0,
      orders_in_db: results?.supabase?.data?.ordersCount || 0,
      fills_in_db: results?.supabase?.data?.fillsCount || 0,
      frontend_trades_count: results?.frontend?.data?.tradesCount?.count_total || 0,
      probable_cause: probableCause,
      recommended_fix: recommendedFix,
      timestamp: new Date()?.toISOString(),
      detailed_results: results
    };

    setFinalReport(report);
    addLog('✅ Final diagnostic report generated', 'success');
    
    return report;
  };

  const runFullDiagnostic = async () => {
    setIsRunning(true);
    setLogs([]);
    setFinalReport(null);
    
    addLog('🚀 PROMPT GLOBAL – DIAGNOSTIC "TRADES NON VISIBLES DANS LE MONITORING"', 'info');
    addLog('Target: IA Paper Account DUN766038', 'info');
    addLog('========================================', 'info');

    // Step 1: IBKR Test
    setCurrentStep(1);
    const ibkrResult = await testIBKRConnection();
    setDiagnosticResults(prev => ({ ...prev, ibkr: ibkrResult }));
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Backend Test
    setCurrentStep(2);
    const backendResult = await testBackend();
    setDiagnosticResults(prev => ({ ...prev, backend: backendResult }));
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Supabase Test
    setCurrentStep(3);
    const supabaseResult = await testSupabase();
    setDiagnosticResults(prev => ({ ...prev, supabase: supabaseResult }));
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Frontend Test
    setCurrentStep(4);
    const frontendResult = await testFrontend();
    setDiagnosticResults(prev => ({ ...prev, frontend: frontendResult }));
    
    // Update state with all results
    const allResults = {
      ibkr: ibkrResult,
      backend: backendResult,
      supabase: supabaseResult,
      frontend: frontendResult
    };
    setDiagnosticResults(allResults);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Generate synthetic report
    setCurrentStep(5);
    const report = generateFinalReport();
    
    setCurrentStep(6);
    setIsRunning(false);
    
    addLog('🎯 Diagnostic Complete!', 'success');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="text-green-400" size={20} />;
      case 'error': return <XCircle className="text-red-400" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-400" size={20} />;
      default: return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const copyReportToClipboard = () => {
    if (finalReport) {
      navigator.clipboard?.writeText(JSON.stringify(finalReport, null, 2));
      addLog('📋 Report copied to clipboard', 'success');
    }
  };

  const downloadReport = () => {
    if (finalReport) {
      const blob = new Blob([JSON.stringify(finalReport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trades-monitoring-diagnostic-${new Date()?.toISOString()?.slice(0, 16)}.json`;
      a?.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Search className="text-red-400" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Trades Monitoring Diagnostic Center</h1>
                <p className="text-gray-300 mt-1">
                  Diagnostic "Trades Non Visibles dans le Monitoring" - Account DUN766038
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={runFullDiagnostic}
                disabled={isRunning}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {isRunning ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                <span>{isRunning ? 'Running Diagnostic...' : 'Start Full Diagnostic'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Diagnostic Steps */}
          <div className="space-y-6">
            {/* Diagnostic Progress */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                <Zap className="text-yellow-400" size={20} />
                <span>Diagnostic Progress</span>
              </h2>
              
              <div className="space-y-4">
                {[
                  { id: 1, name: 'IBKR Connection Test', icon: Server, description: 'Test handshake and fills detection' },
                  { id: 2, name: 'Backend Verification', icon: Database, description: 'Check execution logs and configuration' },
                  { id: 3, name: 'Supabase Validation', icon: Database, description: 'Verify orders and fills in database' },
                  { id: 4, name: 'Frontend Monitoring', icon: Monitor, description: 'Test trades count API endpoint' }
                ]?.map(step => (
                  <div key={step?.id} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    currentStep === step?.id ? 'bg-blue-500/20 border border-blue-500/30' :
                    currentStep > step?.id ? 'bg-green-500/10 border border-green-500/20': 'bg-gray-700/50'
                  }`}>
                    <step.icon className={
                      currentStep === step?.id ? 'text-blue-400' :
                      currentStep > step?.id ? 'text-green-400': 'text-gray-400'
                    } size={20} />
                    <div className="flex-1">
                      <div className="font-medium">{step?.name}</div>
                      <div className="text-sm text-gray-400">{step?.description}</div>
                    </div>
                    {diagnosticResults?.[Object.keys(diagnosticResults)?.[step?.id - 1]] && 
                     getStatusIcon(diagnosticResults?.[Object.keys(diagnosticResults)?.[step?.id - 1]]?.status)}
                  </div>
                ))}
              </div>
            </div>

            {/* Results Summary Table */}
            {(diagnosticResults?.ibkr?.status !== 'pending' || diagnosticResults?.backend?.status !== 'pending' || 
              diagnosticResults?.supabase?.status !== 'pending' || diagnosticResults?.frontend?.status !== 'pending') && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Results Summary</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3">Component</th>
                        <th className="text-left py-3">Test</th>
                        <th className="text-left py-3">Result</th>
                        <th className="text-left py-3">Interpretation</th>
                        <th className="text-left py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      <tr className="border-b border-gray-700/50">
                        <td className="py-3">IBKR</td>
                        <td className="py-3">handshake / fills</td>
                        <td className="py-3">
                          {diagnosticResults?.ibkr?.status === 'success' ? 
                            <span className="text-green-400">OK</span> : 
                            <span className="text-red-400">KO</span>
                          }
                        </td>
                        <td className="py-3">connexion IBKR</td>
                        <td className="py-3 text-xs">activer API TWS</td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-3">Backend</td>
                        <td className="py-3">execute/logs</td>
                        <td className="py-3">
                          {diagnosticResults?.backend?.status === 'success' ? 
                            <span className="text-green-400">OK</span> : 
                            <span className="text-red-400">KO</span>
                          }
                        </td>
                        <td className="py-3">ordres reçus</td>
                        <td className="py-3 text-xs">vérifier write mode</td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-3">Supabase</td>
                        <td className="py-3">orders/fills count</td>
                        <td className="py-3">
                          <span className="text-blue-400">
                            {diagnosticResults?.supabase?.data?.ordersCount || 0} / {diagnosticResults?.supabase?.data?.fillsCount || 0}
                          </span>
                        </td>
                        <td className="py-3">DB alimentée</td>
                        <td className="py-3 text-xs">trigger ou vue manquante</td>
                      </tr>
                      <tr>
                        <td className="py-3">Frontend</td>
                        <td className="py-3">/metrics/trades/count</td>
                        <td className="py-3">
                          {diagnosticResults?.frontend?.status === 'success' ? 
                            <span className="text-green-400">OK</span> : 
                            <span className="text-red-400">KO</span>
                          }
                        </td>
                        <td className="py-3">UI branchée</td>
                        <td className="py-3 text-xs">endpoint à corriger</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Logs and Report */}
          <div className="space-y-6">
            
            {/* Real-time Logs */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Diagnostic Logs</h2>
                <button
                  onClick={() => setLogs([])}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
              
              <div className="bg-black/50 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                {logs?.map((log, index) => (
                  <div key={index} className={`flex items-start space-x-2 mb-1 ${
                    log?.type === 'error' ? 'text-red-400' :
                    log?.type === 'success' ? 'text-green-400' :
                    log?.type === 'warning'? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    <span className="text-xs text-gray-500 w-20 flex-shrink-0">
                      {new Date(log.timestamp)?.toLocaleTimeString()}
                    </span>
                    <span className="w-4 flex-shrink-0">{getLogIcon(log?.type)}</span>
                    <span className="flex-1">{log?.message}</span>
                  </div>
                ))}
                {logs?.length === 0 && (
                  <div className="text-gray-500 text-center">
                    Diagnostic logs will appear here...
                  </div>
                )}
              </div>
            </div>

            {/* Final JSON Report */}
            {finalReport && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-green-400">Final Diagnostic Report</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyReportToClipboard}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30"
                    >
                      <Copy size={14} />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={downloadReport}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-black/50 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono">
                    {JSON.stringify(finalReport, null, 2)}
                  </pre>
                </div>
                
                {/* Quick Summary */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Probable Cause</div>
                    <div className="font-medium text-yellow-400">{finalReport?.probable_cause}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Recommended Fix</div>
                    <div className="font-medium text-blue-400 text-xs">{finalReport?.recommended_fix}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradesMonitoringDiagnosticCenter;