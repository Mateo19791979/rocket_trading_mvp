import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, AlertTriangle, Clock, RotateCcw, Shield, Target, Settings } from 'lucide-react';

const RecoveryOrchestrationCenter = () => {
  const [recoveryPhase, setRecoveryPhase] = useState('assessment');
  const [systemTests, setSystemTests] = useState({
    connectivity: { status: 'pending', score: 0 },
    database: { status: 'pending', score: 0 },
    api: { status: 'pending', score: 0 },
    security: { status: 'pending', score: 0 }
  });
  const [regionStatus, setRegionStatus] = useState({
    EU: { status: 'offline', health: 0, agents: 0 },
    US: { status: 'offline', health: 0, agents: 0 },
    AS: { status: 'offline', health: 0, agents: 0 }
  });
  const [runningTests, setRunningTests] = useState(false);

  const recoveryPhases = [
    { id: 'assessment', name: 'System Assessment', description: 'Evaluate system integrity and readiness' },
    { id: 'preparation', name: 'Recovery Preparation', description: 'Initialize recovery components and procedures' },
    { id: 'restoration', name: 'System Restoration', description: 'Bring core systems back online sequentially' },
    { id: 'validation', name: 'Post-Recovery Validation', description: 'Verify system functionality and performance' },
    { id: 'monitoring', name: 'Enhanced Monitoring', description: 'Monitor system stability post-recovery' }
  ];

  const testingSuite = [
    {
      category: 'connectivity',
      name: 'Network Connectivity',
      tests: [
        'DNS Resolution',
        'Database Connections',
        'External API Endpoints',
        'WebSocket Channels'
      ]
    },
    {
      category: 'database',
      name: 'Database Integrity',
      tests: [
        'Connection Pool Health',
        'Data Consistency Check',
        'Replication Status',
        'Query Performance'
      ]
    },
    {
      category: 'api',
      name: 'API Functionality',
      tests: [
        'Authentication System',
        'Core Endpoints',
        'Rate Limiting',
        'Response Times'
      ]
    },
    {
      category: 'security',
      name: 'Security Validation',
      tests: [
        'SSL Certificate Validity',
        'Access Control',
        'Encryption Status',
        'Audit Trail Integrity'
      ]
    }
  ];

  const runSystemTests = () => {
    setRunningTests(true);
    
    // Reset all tests
    setSystemTests(prev => 
      Object.keys(prev)?.reduce((acc, key) => ({
        ...acc,
        [key]: { status: 'running', score: 0 }
      }), {})
    );

    // Simulate test execution
    const testCategories = Object.keys(systemTests);
    testCategories?.forEach((category, index) => {
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        const score = success ? Math.floor(85 + Math.random() * 15) : Math.floor(Math.random() * 60);
        
        setSystemTests(prev => ({
          ...prev,
          [category]: {
            status: success ? 'passed' : 'failed',
            score: score
          }
        }));

        if (index === testCategories?.length - 1) {
          setRunningTests(false);
        }
      }, (index + 1) * 1500);
    });
  };

  const activateRegion = (region) => {
    setRegionStatus(prev => ({
      ...prev,
      [region]: { status: 'activating', health: 0, agents: 0 }
    }));

    // Simulate region activation
    let health = 0;
    let agents = 0;
    const interval = setInterval(() => {
      health = Math.min(100, health + 10);
      agents = Math.min(8, Math.floor(health / 12.5));
      
      setRegionStatus(prev => ({
        ...prev,
        [region]: { status: health === 100 ? 'active' : 'activating', health, agents }
      }));

      if (health === 100) {
        clearInterval(interval);
      }
    }, 500);
  };

  const getTestStatusColor = (status) => {
    const colors = {
      pending: 'text-gray-400',
      running: 'text-blue-400',
      passed: 'text-green-400',
      failed: 'text-red-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getRegionStatusColor = (status) => {
    const colors = {
      offline: 'text-gray-400',
      activating: 'text-yellow-400',
      active: 'text-green-400',
      error: 'text-red-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const overallScore = Object.values(systemTests)?.reduce((acc, test) => acc + test?.score, 0) / Object.keys(systemTests)?.length;

  return (
    <div className="bg-gray-800 border border-cyan-500 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <RotateCcw className="text-cyan-400 mr-3 h-6 w-6" />
          <h3 className="text-xl font-bold text-white">Recovery Orchestration Center</h3>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Overall Health Score</div>
          <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore?.toFixed(1)}%
          </div>
        </div>
      </div>
      {/* Recovery Phase Navigator */}
      <div className="mb-8">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Target className="text-blue-400 mr-2 h-5 w-5" />
          Recovery Phase Navigator
        </h4>
        
        <div className="flex items-center justify-between mb-4">
          {recoveryPhases?.map((phase, index) => (
            <div key={phase?.id} className="flex items-center">
              <div 
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                  recoveryPhase === phase?.id 
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300' :'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
                onClick={() => setRecoveryPhase(phase?.id)}
              >
                <span className="text-xs font-bold">{index + 1}</span>
              </div>
              {index < recoveryPhases?.length - 1 && (
                <div className="w-16 h-0.5 bg-gray-600 mx-2"></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h5 className="text-white font-medium">
            {recoveryPhases?.find(p => p?.id === recoveryPhase)?.name}
          </h5>
          <p className="text-gray-300 text-sm">
            {recoveryPhases?.find(p => p?.id === recoveryPhase)?.description}
          </p>
        </div>
      </div>
      {/* System Testing & Validation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold flex items-center">
            <Shield className="text-green-400 mr-2 h-5 w-5" />
            System Testing & Validation
          </h4>
          <button
            onClick={runSystemTests}
            disabled={runningTests}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            {runningTests ? 'Running Tests...' : 'Run Validation Suite'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testingSuite?.map((suite) => (
            <div key={suite?.category} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">{suite?.name}</span>
                <div className="flex items-center">
                  <span className={`mr-2 ${getTestStatusColor(systemTests?.[suite?.category]?.status)}`}>
                    {systemTests?.[suite?.category]?.status === 'running' ? (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : systemTests?.[suite?.category]?.status === 'passed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : systemTests?.[suite?.category]?.status === 'failed' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </span>
                  <span className={`font-bold ${getScoreColor(systemTests?.[suite?.category]?.score)}`}>
                    {systemTests?.[suite?.category]?.score}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                {suite?.tests?.map((test, index) => (
                  <div key={index} className="text-xs text-gray-300 flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2"></div>
                    {test}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Regional Reactivation */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Settings className="text-purple-400 mr-2 h-5 w-5" />
          Regional System Reactivation
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(regionStatus)?.map(([region, status]) => (
            <div key={region} className="bg-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">Region {region}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  status?.status === 'active' ? 'bg-green-900/50 text-green-300' :
                  status?.status === 'activating'? 'bg-yellow-900/50 text-yellow-300' : 'bg-gray-900/50 text-gray-300'
                }`}>
                  {status?.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Health:</span>
                  <span className={getScoreColor(status?.health)}>{status?.health}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Active Agents:</span>
                  <span className="text-blue-400">{status?.agents}/8</span>
                </div>
                
                {status?.status === 'activating' && (
                  <div className="w-full bg-gray-500 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${status?.health}%` }}
                    ></div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => activateRegion(region)}
                disabled={status?.status === 'activating' || status?.status === 'active'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded font-medium transition-colors"
              >
                {status?.status === 'active' ? 'Active' : 
                 status?.status === 'activating' ? 'Activating...' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecoveryOrchestrationCenter;