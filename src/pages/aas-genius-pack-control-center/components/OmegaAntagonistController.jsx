import { useState, useEffect } from 'react';
import { Target, AlertTriangle, Shield, Zap, TrendingDown, Play, RotateCw } from 'lucide-react';
import { omegaAIService } from '../../../services/omegaAI.js';
import { supabase } from '../../../lib/supabase.js';

export default function OmegaAntagonistController({ onLogAdd }) {
  const [attacks, setAttacks] = useState([]);
  const [vulnerableStrategies, setVulnerableStrategies] = useState([]);
  const [stats, setStats] = useState({
    totalAttacks: 0,
    successfulAttacks: 0,
    successRate: 0,
    avgPnlImpact: 0
  });
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [loading, setLoading] = useState({
    attacks: true,
    strategies: true,
    vulnerable: true,
    launching: false
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadAttacks(),
      loadStrategies(),
      loadVulnerableStrategies(),
      loadStats()
    ]);
  };

  const loadAttacks = async () => {
    setLoading(prev => ({ ...prev, attacks: true }));
    try {
      const result = await omegaAIService?.getOmegaAttacks(20);
      if (result?.success) {
        setAttacks(result?.attacks || []);
      }
    } catch (error) {
      onLogAdd?.(`Error loading attacks: ${error?.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, attacks: false }));
    }
  };

  const loadStrategies = async () => {
    setLoading(prev => ({ ...prev, strategies: true }));
    try {
      const { data, error } = await supabase
        ?.from('strategy_candidates')
        ?.select('id, spec_yaml, iqs, status')
        ?.eq('status', 'testing')
        ?.order('iqs', { ascending: false })
        ?.limit(10);

      if (error) throw error;
      setStrategies(data || []);
    } catch (error) {
      onLogAdd?.(`Error loading strategies: ${error?.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, strategies: false }));
    }
  };

  const loadVulnerableStrategies = async () => {
    setLoading(prev => ({ ...prev, vulnerable: true }));
    try {
      const result = await omegaAIService?.getVulnerableStrategies();
      if (result?.success) {
        setVulnerableStrategies(result?.vulnerableStrategies || []);
      }
    } catch (error) {
      onLogAdd?.(`Error loading vulnerable strategies: ${error?.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, vulnerable: false }));
    }
  };

  const loadStats = async () => {
    try {
      const result = await omegaAIService?.getOmegaStats();
      if (result?.success) {
        setStats(result?.stats);
      }
    } catch (error) {
      onLogAdd?.(`Error loading stats: ${error?.message}`, 'error');
    }
  };

  const launchOmegaAttack = async (strategyId = null) => {
    setLoading(prev => ({ ...prev, launching: true }));
    try {
      const targetStrategyId = strategyId || selectedStrategy;
      
      if (!targetStrategyId) {
        onLogAdd?.('Please select a strategy to attack', 'error');
        return;
      }

      const targetStrategy = strategies?.find(s => s?.id === targetStrategyId);
      if (!targetStrategy) {
        onLogAdd?.('Strategy not found', 'error');
        return;
      }

      onLogAdd?.(`Launching Omega AI attack on strategy ${targetStrategy?.id}...`, 'info');
      
      const result = await omegaAIService?.runOmegaAttack(targetStrategy);
      
      if (result?.success) {
        onLogAdd?.(`Omega attack launched successfully! Attack ID: ${result?.attack_id}`, 'success');
        // Reload data to show new attack
        setTimeout(() => {
          loadAllData();
        }, 1000);
      } else {
        onLogAdd?.(`Omega attack failed: ${result?.error}`, 'error');
      }
    } catch (error) {
      onLogAdd?.(`Attack launch error: ${error?.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, launching: false }));
    }
  };

  const getOutcomeColor = (outcome) => {
    return outcome === 'SUCCESS' ? 'text-red-400' : 'text-green-400';
  };

  const getOutcomeIcon = (outcome) => {
    return outcome === 'SUCCESS' ? AlertTriangle : Shield;
  };

  const formatPnL = (pnl) => {
    const value = parseFloat(pnl) || 0;
    return value >= 0 ? `+$${value?.toFixed(2)}` : `-$${Math.abs(value)?.toFixed(2)}`;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Target className="w-8 h-8 text-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Omega AI Antagonist</h2>
            <p className="text-gray-400">Digital Twin Adversarial Testing System</p>
          </div>
        </div>
        <button
          onClick={loadAllData}
          disabled={loading?.attacks}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          <RotateCw className={`w-4 h-4 ${loading?.attacks ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg border border-red-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-red-400" />
            <span className="text-gray-300 text-sm">Total Attacks</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.totalAttacks}</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-red-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-gray-300 text-sm">Successful</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{stats?.successfulAttacks}</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-red-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-red-400" />
            <span className="text-gray-300 text-sm">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.successRate}%</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-red-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-gray-300 text-sm">Avg PnL Impact</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatPnL(stats?.avgPnlImpact)}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attack Launch Panel */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Play className="w-5 h-5 text-red-400" />
            <span>Launch Omega Attack</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Strategy
              </label>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e?.target?.value)}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2"
                disabled={loading?.strategies}
              >
                <option value="">Select a strategy to attack...</option>
                {strategies?.map((strategy) => (
                  <option key={strategy?.id} value={strategy?.id}>
                    Strategy {strategy?.id?.slice(0, 8)}... (IQS: {strategy?.iqs})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => launchOmegaAttack()}
              disabled={!selectedStrategy || loading?.launching}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading?.launching ? (
                <span className="flex items-center justify-center space-x-2">
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Launching Attack...</span>
                </span>
              ) : (
                'Launch Omega Attack'
              )}
            </button>
          </div>
        </div>

        {/* Vulnerable Strategies */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Vulnerable Strategies</span>
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {loading?.vulnerable ? (
              <div className="text-gray-400 text-center py-4">Loading vulnerable strategies...</div>
            ) : vulnerableStrategies?.length > 0 ? (
              vulnerableStrategies?.map((strategy) => (
                <div
                  key={strategy?.id}
                  className="bg-gray-600 p-3 rounded-lg border border-red-500/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">
                      Strategy {strategy?.id?.slice(0, 8)}...
                    </span>
                    <span className="text-red-400 text-sm font-bold">
                      {Math.round(strategy?.vulnerability_score * 100)}% vulnerable
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>{strategy?.attack_count} attacks</span>
                    <span>{strategy?.successful_attacks} successful</span>
                  </div>
                  <button
                    onClick={() => launchOmegaAttack(strategy?.id)}
                    disabled={loading?.launching}
                    className="mt-2 w-full bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Attack Again
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">
                No vulnerable strategies detected
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Recent Attacks */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-red-400" />
          <span>Recent Omega Attacks</span>
        </h3>
        
        <div className="bg-gray-700 rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {loading?.attacks ? (
              <div className="text-gray-400 text-center py-8">Loading attacks...</div>
            ) : attacks?.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-600 sticky top-0">
                  <tr>
                    <th className="text-left text-gray-300 p-3 text-sm">Target Strategy</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Outcome</th>
                    <th className="text-left text-gray-300 p-3 text-sm">PnL Impact</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Attack Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attacks?.map((attack) => {
                    const OutcomeIcon = getOutcomeIcon(attack?.outcome);
                    return (
                      <tr key={attack?.id} className="border-t border-gray-600 hover:bg-gray-600/50">
                        <td className="p-3 text-white text-sm">
                          {attack?.alpha_strategy_id?.slice(0, 8)}...
                        </td>
                        <td className="p-3">
                          <div className={`flex items-center space-x-2 ${getOutcomeColor(attack?.outcome)}`}>
                            <OutcomeIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{attack?.outcome}</span>
                          </div>
                        </td>
                        <td className="p-3 text-white text-sm">
                          {formatPnL(attack?.simulated_pnl)}
                        </td>
                        <td className="p-3 text-gray-300 text-sm">
                          {new Date(attack.created_at)?.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-400 text-center py-8">
                No attacks recorded yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}