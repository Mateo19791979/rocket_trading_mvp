import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Brain, 
  Shield, 
  Zap, 
  Play, 
  Pause, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';
import { aasObservatoryService } from '../../../services/aasObservatoryService';

export default function ImmediateTriggerPanel({ onTriggerExecuted, systemStatus }) {
  const [executingTriggers, setExecutingTriggers] = useState(new Set());
  const [triggerResults, setTriggerResults] = useState({});
  const [lastExecution, setLastExecution] = useState({});

  const triggers = [
    {
      id: 'health_compute',
      title: 'Calcul santé',
      endpoint: '/aas/health/compute',
      description: 'Real-time health computation status',
      icon: Activity,
      color: 'bg-green-600 hover:bg-green-700',
      category: 'health'
    },
    {
      id: 'wisdom_distill',
      title: 'Distiller sagesse',
      endpoint: '/apex/legacy/distill',
      description: 'Wisdom extraction processing',
      icon: Brain,
      color: 'bg-purple-600 hover:bg-purple-700',
      category: 'wisdom'
    },
    {
      id: 'omega_audit',
      title: 'Audit Omega',
      endpoint: '/apex/audit/full',
      description: 'Comprehensive system auditing',
      icon: Shield,
      color: 'bg-blue-600 hover:bg-blue-700',
      category: 'audit'
    },
    {
      id: 'shadow_canary',
      title: 'Shadow/Canary',
      endpoint: '/aas/deployment/control',
      description: 'Emergency kill toggles & deployment controls',
      icon: Zap,
      color: 'bg-red-600 hover:bg-red-700',
      category: 'control'
    }
  ];

  const executeTrigger = async (trigger) => {
    if (executingTriggers?.has(trigger?.id)) return;

    setExecutingTriggers(prev => new Set([...prev, trigger.id]));
    
    try {
      const result = await aasObservatoryService?.executeTrigger(trigger?.endpoint);
      
      setTriggerResults(prev => ({
        ...prev,
        [trigger?.id]: {
          status: 'success',
          message: result?.message || 'Trigger executed successfully',
          timestamp: new Date(),
          data: result
        }
      }));

      setLastExecution(prev => ({
        ...prev,
        [trigger?.id]: new Date()
      }));

      if (onTriggerExecuted) {
        onTriggerExecuted();
      }
    } catch (error) {
      setTriggerResults(prev => ({
        ...prev,
        [trigger?.id]: {
          status: 'error',
          message: error?.message || 'Trigger execution failed',
          timestamp: new Date(),
          error: error
        }
      }));
    } finally {
      setExecutingTriggers(prev => {
        const newSet = new Set(prev);
        newSet?.delete(trigger?.id);
        return newSet;
      });
    }
  };

  const getStatusIcon = (triggerId) => {
    const result = triggerResults?.[triggerId];
    const isExecuting = executingTriggers?.has(triggerId);

    if (isExecuting) {
      return <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />;
    }
    
    if (result?.status === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
    
    if (result?.status === 'error') {
      return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }
    
    return null;
  };

  const formatTimeSince = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Zap className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Immediate Trigger Panel</h3>
            <p className="text-gray-400 text-sm">Force AI réflexions immédiatement</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
          systemStatus === 'active' ?'bg-green-600/20 text-green-300' :'bg-yellow-600/20 text-yellow-300'
        }`}>
          {systemStatus === 'active' ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          {systemStatus === 'active' ? 'Active' : 'Monitoring'}
        </div>
      </div>
      <div className="space-y-4">
        {triggers?.map((trigger) => {
          const IconComponent = trigger?.icon;
          const isExecuting = executingTriggers?.has(trigger?.id);
          const result = triggerResults?.[trigger?.id];
          const lastExec = lastExecution?.[trigger?.id];

          return (
            <motion.div
              key={trigger?.id}
              className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4 hover:border-blue-500/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${trigger?.color?.split(' ')?.[0]}/20`}>
                    <IconComponent className={`h-4 w-4 ${trigger?.color?.includes('green') ? 'text-green-400' : 
                      trigger?.color?.includes('purple') ? 'text-purple-400' :
                      trigger?.color?.includes('blue') ? 'text-blue-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{trigger?.title}</h4>
                    <p className="text-gray-400 text-xs">{trigger?.endpoint}</p>
                  </div>
                </div>
                {getStatusIcon(trigger?.id)}
              </div>
              <p className="text-gray-300 text-sm mb-3">{trigger?.description}</p>
              {/* Last Execution Info */}
              {lastExec && (
                <div className="flex items-center text-xs text-gray-400 mb-3">
                  <Clock className="h-3 w-3 mr-1" />
                  Last run: {formatTimeSince(lastExec)}
                </div>
              )}
              {/* Result Display */}
              {result && (
                <div className={`p-2 rounded text-xs mb-3 ${
                  result?.status === 'success' ?'bg-green-900/30 text-green-300 border border-green-500/30' :'bg-red-900/30 text-red-300 border border-red-500/30'
                }`}>
                  {result?.message}
                </div>
              )}
              <button
                onClick={() => executeTrigger(trigger)}
                disabled={isExecuting || systemStatus !== 'active'}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  isExecuting 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : systemStatus !== 'active' ?'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : `${trigger?.color} text-white`
                }`}
              >
                {isExecuting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Executing...
                  </div>
                ) : (
                  `Execute ${trigger?.title}`
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
      {/* Visual Activation Indicators */}
      <div className="mt-6 pt-4 border-t border-gray-600/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">System Response:</span>
          <div className="flex space-x-2">
            {triggers?.map((trigger) => (
              <div
                key={trigger?.id}
                className={`h-2 w-8 rounded-full transition-all ${
                  executingTriggers?.has(trigger?.id) 
                    ? 'bg-yellow-400 animate-pulse' 
                    : triggerResults?.[trigger?.id]?.status === 'success' ?'bg-green-400'
                    : triggerResults?.[trigger?.id]?.status === 'error' ?'bg-red-400' :'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}