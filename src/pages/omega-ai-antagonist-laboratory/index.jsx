import { useState, useEffect } from 'react';
import { Target, AlertTriangle, Shield, Zap, Brain, Activity, Play, Settings } from 'lucide-react';
import { omegaAIService } from '../../services/omegaAI.js';
import { supabase } from '../../lib/supabase.js';
import AttackVectorConfiguration from './components/AttackVectorConfiguration.jsx';
import VulnerabilityScanner from './components/VulnerabilityScanner';
import AdversarialTestingDashboard from './components/AdversarialTestingDashboard';
import OmegaAIEngine from './components/OmegaAIEngine';
import DefenseEnhancementCenter from './components/DefenseEnhancementCenter';
import Icon from '@/components/AppIcon';



export default function OmegaAIAntagonistLaboratory() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [laboratoryData, setLaboratoryData] = useState({
    totalAttacks: 0,
    successfulAttacks: 0,
    strategiesAnalyzed: 0,
    vulnerabilityScore: 0,
    defenseEffectiveness: 0
  });
  const [loading, setLoading] = useState(true);
  const [attacksInProgress, setAttacksInProgress] = useState([]);
  const [logs, setLogs] = useState([]);

  const loadLaboratoryData = async () => {
    setLoading(true);
    try {
      const [statsResult, attacksResult, strategiesResult] = await Promise.all([
        omegaAIService?.getOmegaStats(),
        omegaAIService?.getOmegaAttacks(10),
        loadStrategyCandidates()
      ]);

      if (statsResult?.success) {
        const stats = statsResult?.stats;
        setLaboratoryData({
          totalAttacks: stats?.totalAttacks || 0,
          successfulAttacks: stats?.successfulAttacks || 0,
          strategiesAnalyzed: strategiesResult?.length || 0,
          vulnerabilityScore: Math.round(stats?.successRate * 0.8 || 0),
          defenseEffectiveness: Math.max(0, 100 - (stats?.successRate || 0))
        });
      }

      if (attacksResult?.success) {
        const ongoing = attacksResult?.attacks?.filter(attack => 
          new Date(attack.created_at)?.getTime() > Date.now() - (5 * 60 * 1000)
        ) || [];
        setAttacksInProgress(ongoing);
      }

      addLog(`Laboratory data refreshed - ${statsResult?.stats?.totalAttacks || 0} total attacks analyzed`);
    } catch (error) {
      addLog(`Data refresh error: ${error?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaboratoryData();
    const interval = setInterval(loadLaboratoryData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadStrategyCandidates = async () => {
    try {
      const { data, error } = await supabase
        ?.from('strategy_candidates')
        ?.select('id, iqs, status')
        ?.limit(20);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      addLog(`Error loading strategies: ${error?.message}`, 'error');
      return [];
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date()?.toLocaleTimeString();
    const newLog = { timestamp, message, type };
    setLogs(prev => [newLog, ...prev?.slice(0, 49)]); // Keep last 50 logs
  };

  const runAdvancedAttackSequence = async () => {
    addLog('Initiating advanced Omega AI attack sequence...', 'info');
    
    try {
      // Simulate multiple concurrent attacks
      const strategies = await loadStrategyCandidates();
      const selectedStrategies = strategies?.slice(0, 3); // Attack top 3

      for (const strategy of selectedStrategies) {
        const result = await omegaAIService?.runOmegaAttack(strategy);
        if (result?.success) {
          addLog(`Advanced attack launched on strategy ${strategy?.id?.slice(0, 8)}...`, 'success');
        }
      }

      setTimeout(() => {
        loadLaboratoryData();
        addLog('Advanced attack sequence completed', 'success');
      }, 2000);
    } catch (error) {
      addLog(`Advanced attack sequence failed: ${error?.message}`, 'error');
    }
  };

  const moduleButtons = [
    { key: 'dashboard', label: 'Testing Dashboard', icon: Activity, color: 'red' },
    { key: 'vectors', label: 'Attack Vectors', icon: Target, color: 'orange' },
    { key: 'scanner', label: 'Vulnerability Scanner', icon: AlertTriangle, color: 'yellow' },
    { key: 'engine', label: 'Omega Engine', icon: Brain, color: 'purple' },
    { key: 'defense', label: 'Defense Center', icon: Shield, color: 'green' }
  ];

  const getStatusColor = (value, reverse = false) => {
    if (reverse) {
      if (value >= 80) return 'text-green-400';
      if (value >= 60) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      if (value >= 80) return 'text-red-400';
      if (value >= 60) return 'text-yellow-400'; 
      return 'text-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Omega AI Antagonist Laboratory
            </h1>
            <p className="text-gray-300 mt-2">
              Digital Twin Adversarial System • Systematic Strategy Attack Testing • Vulnerability Analysis
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : attacksInProgress?.length > 0 ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-white text-sm">
                {loading ? 'Scanning...' : attacksInProgress?.length > 0 ? `${attacksInProgress?.length} Active` : 'Standby'}
              </span>
            </div>
            <button
              onClick={runAdvancedAttackSequence}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 disabled:opacity-50 transition-all duration-200"
            >
              <Play className="w-4 h-4 inline mr-2" />
              Execute Attack Sequence
            </button>
          </div>
        </div>

        {/* Module Navigation */}
        <div className="flex space-x-2 overflow-x-auto">
          {moduleButtons?.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setActiveModule(key)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${
                activeModule === key
                  ? `bg-${color}-600 text-white`
                  : `bg-gray-800 text-gray-300 hover:bg-${color}-600/20 hover:text-${color}-400`
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Laboratory Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-4 border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-red-400 font-semibold text-sm">Total Attacks</h3>
            <Target className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{laboratoryData?.totalAttacks}</div>
          <div className="text-xs text-gray-400">Adversarial tests executed</div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-orange-400 font-semibold text-sm">Successful</h3>
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400">{laboratoryData?.successfulAttacks}</div>
          <div className="text-xs text-gray-400">Vulnerabilities found</div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-yellow-400 font-semibold text-sm">Strategies Analyzed</h3>
            <Activity className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{laboratoryData?.strategiesAnalyzed}</div>
          <div className="text-xs text-gray-400">Under adversarial review</div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-purple-400 font-semibold text-sm">Vulnerability Score</h3>
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(laboratoryData?.vulnerabilityScore)}`}>
            {laboratoryData?.vulnerabilityScore}%
          </div>
          <div className="text-xs text-gray-400">System exposure level</div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-green-400 font-semibold text-sm">Defense Effectiveness</h3>
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(laboratoryData?.defenseEffectiveness, true)}`}>
            {laboratoryData?.defenseEffectiveness}%
          </div>
          <div className="text-xs text-gray-400">Resistance capability</div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          {activeModule === 'dashboard' && (
            <AdversarialTestingDashboard 
              data={laboratoryData}
              attacksInProgress={attacksInProgress}
              onLogAdd={addLog}
            />
          )}
          
          {activeModule === 'vectors' && (
            <AttackVectorConfiguration onLogAdd={addLog} />
          )}
          
          {activeModule === 'scanner' && (
            <VulnerabilityScanner onLogAdd={addLog} />
          )}
          
          {activeModule === 'engine' && (
            <OmegaAIEngine 
              data={laboratoryData}
              onLogAdd={addLog}
            />
          )}
          
          {activeModule === 'defense' && (
            <DefenseEnhancementCenter 
              data={laboratoryData}
              onLogAdd={addLog}
            />
          )}
        </div>

        {/* Laboratory Activity Log */}
        <div className="bg-gray-800 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-red-400" />
            <h3 className="text-white font-semibold">Laboratory Log</h3>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs?.length > 0 ? (
              logs?.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm border-l-4 ${
                    log?.type === 'error' ?'bg-red-900/30 border-red-500 text-red-300'
                      : log?.type === 'success' ?'bg-green-900/30 border-green-500 text-green-300' :'bg-orange-900/30 border-orange-500 text-orange-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {log?.type === 'error' && <AlertTriangle className="w-4 h-4" />}
                    {log?.type === 'success' && <Shield className="w-4 h-4" />}
                    {log?.type === 'info' && <Target className="w-4 h-4" />}
                    <span className="text-xs opacity-70">{log?.timestamp}</span>
                  </div>
                  <div>{log?.message}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">
                Laboratory initialization complete. Awaiting adversarial operations...
              </div>
            )}
          </div>

          {/* Laboratory Status */}
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>System Status</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Adversarial Engine</span>
                <span className="text-green-400">●ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Attack Vectors</span>
                <span className="text-green-400">●ARMED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Defense Analysis</span>
                <span className="text-yellow-400">●MONITORING</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Strategy Targets</span>
                <span className="text-white">{laboratoryData?.strategiesAnalyzed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}