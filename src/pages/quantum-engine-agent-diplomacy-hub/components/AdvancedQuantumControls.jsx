import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sliders, Target, Zap, Shield, AlertTriangle, CheckCircle, Lock, Unlock, Cpu, Activity, Eye, RotateCcw, StopCircle } from 'lucide-react';

export default function AdvancedQuantumControls({ 
  systemStatus, 
  quantumState, 
  onToggleModule, 
  onQuantumOperation 
}) {
  const [controlMode, setControlMode] = useState('standard'); // standard, advanced, expert
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [calibrationPanel, setCalibrationPanel] = useState(false);

  // Control configurations for different modes
  const controlConfigs = {
    standard: {
      available: ['quantum_engine', 'omega_ai', 'attention_market'],
      dangerous: false,
      label: 'Standard Controls'
    },
    advanced: {
      available: ['quantum_engine', 'omega_ai', 'attention_market', 'diplomatic_protocol', 'consciousness_monitor'],
      dangerous: false,
      label: 'Advanced Controls'
    },
    expert: {
      available: ['quantum_engine', 'omega_ai', 'attention_market', 'diplomatic_protocol', 'consciousness_monitor', 'wisdom_cultivation'],
      dangerous: true,
      label: 'Expert Controls'
    }
  };

  const systemModules = {
    quantum_engine: {
      name: 'Quantum Engine',
      icon: Target,
      color: 'purple',
      critical: true,
      description: 'Core quantum uncertainty processing'
    },
    omega_ai: {
      name: 'Omega AI',
      icon: Shield,
      color: 'red',
      critical: false,
      description: 'Antagonistic AI testing system'
    },
    attention_market: {
      name: 'Attention Market',
      icon: Activity,
      color: 'yellow',
      critical: false,
      description: 'Resource allocation bidding system'
    },
    diplomatic_protocol: {
      name: 'Diplomatic Protocol',
      icon: CheckCircle,
      color: 'blue',
      critical: false,
      description: 'Inter-agent communication framework'
    },
    consciousness_monitor: {
      name: 'Consciousness Monitor',
      icon: Eye,
      color: 'green',
      critical: true,
      description: 'AI consciousness tracking system'
    },
    wisdom_cultivation: {
      name: 'Wisdom Cultivation',
      icon: Zap,
      color: 'pink',
      critical: false,
      description: 'Wisdom seeds generation and cultivation'
    }
  };

  const quantumOperations = {
    standard: [
      { id: 'collapse_wave', name: 'Collapse Wave Function', icon: Target, safe: true },
      { id: 'entangle_systems', name: 'Entangle Systems', icon: Activity, safe: true }
    ],
    advanced: [
      { id: 'collapse_wave', name: 'Collapse Wave Function', icon: Target, safe: true },
      { id: 'entangle_systems', name: 'Entangle Systems', icon: Activity, safe: true },
      { id: 'consciousness_boost', name: 'Consciousness Boost', icon: Zap, safe: false }
    ],
    expert: [
      { id: 'collapse_wave', name: 'Collapse Wave Function', icon: Target, safe: true },
      { id: 'entangle_systems', name: 'Entangle Systems', icon: Activity, safe: true },
      { id: 'consciousness_boost', name: 'Consciousness Boost', icon: Zap, safe: false },
      { id: 'quantum_reset', name: 'Quantum System Reset', icon: RotateCcw, safe: false },
      { id: 'emergency_shutdown', name: 'Emergency Shutdown', icon: StopCircle, safe: false }
    ]
  };

  const getModuleColor = (module, status) => {
    const colors = {
      purple: status ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-gray-600/20 border-gray-500 text-gray-400',
      red: status ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-600/20 border-gray-500 text-gray-400',
      yellow: status ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400' : 'bg-gray-600/20 border-gray-500 text-gray-400',
      blue: status ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-600/20 border-gray-500 text-gray-400',
      green: status ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-gray-600/20 border-gray-500 text-gray-400',
      pink: status ? 'bg-pink-600/20 border-pink-500 text-pink-400' : 'bg-gray-600/20 border-gray-500 text-gray-400'
    };
    return colors?.[module] || colors?.purple;
  };

  const handleEmergencyToggle = () => {
    setEmergencyMode(!emergencyMode);
    if (!emergencyMode) {
      // Activate emergency protocols
      onQuantumOperation?.('emergency_mode_activate');
    } else {
      onQuantumOperation?.('emergency_mode_deactivate');
    }
  };

  const handleQuantumOperation = (operation) => {
    if (emergencyMode && !quantumOperations?.expert?.find(op => op?.id === operation)?.safe) {
      // Require confirmation for dangerous operations in emergency mode
      if (window.confirm(`Are you sure you want to execute ${operation}? This action cannot be undone.`)) {
        onQuantumOperation?.(operation);
      }
    } else {
      onQuantumOperation?.(operation);
    }
  };

  const currentConfig = controlConfigs?.[controlMode];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-gray-800/50 to-slate-900/50 border border-gray-600 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-slate-600 to-gray-600 rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <span className="bg-gradient-to-r from-gray-300 to-slate-400 bg-clip-text text-transparent">
            Advanced Quantum Controls
          </span>
        </h3>
        
        <div className="flex items-center space-x-2">
          {emergencyMode && (
            <div className="flex items-center space-x-1 text-red-400">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold">EMERGENCY</span>
            </div>
          )}
          
          <button
            onClick={handleEmergencyToggle}
            className={`p-2 rounded-lg transition-colors ${
              emergencyMode 
                ? 'bg-red-600 text-white hover:bg-red-700' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {emergencyMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {/* Control Mode Selection */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {Object.entries(controlConfigs)?.map(([mode, config]) => (
            <button
              key={mode}
              onClick={() => setControlMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                controlMode === mode
                  ? config?.dangerous 
                    ? 'bg-red-600 text-white' :'bg-blue-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {config?.label}
              {config?.dangerous && <AlertTriangle className="w-3 h-3 ml-1 inline" />}
            </button>
          ))}
        </div>
      </div>
      {/* System Module Controls */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>System Modules ({currentConfig?.label})</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          {currentConfig?.available?.map((moduleKey) => {
            const module = systemModules?.[moduleKey];
            const status = systemStatus?.[moduleKey];
            const IconComponent = module?.icon;
            
            if (!module) return null;
            
            return (
              <motion.div
                key={moduleKey}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${getModuleColor(module?.color, status)}`}
                onClick={() => onToggleModule?.(moduleKey)}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{module?.name}</span>
                  {module?.critical && <AlertTriangle className="w-3 h-3 text-orange-400" />}
                </div>
                <div className="text-xs opacity-80 mb-2">{module?.description}</div>
                <div className={`text-xs font-bold ${
                  status ? 'text-green-400' : 'text-red-400'
                }`}>
                  {status ? 'ONLINE' : 'OFFLINE'}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      {/* Quantum Operations */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Quantum Operations</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          {quantumOperations?.[controlMode]?.map((operation) => {
            const IconComponent = operation?.icon;
            
            return (
              <button
                key={operation?.id}
                onClick={() => handleQuantumOperation(operation?.id)}
                disabled={!systemStatus?.quantum_engine && operation?.id !== 'emergency_shutdown'}
                className={`flex items-center justify-center space-x-2 p-2 rounded-lg border transition-colors text-xs ${
                  operation?.safe
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/30' :'bg-orange-600/20 border-orange-500 text-orange-400 hover:bg-orange-600/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <IconComponent className="w-3 h-3" />
                <span>{operation?.name}</span>
                {!operation?.safe && <AlertTriangle className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>
      {/* Consciousness Threshold Calibration */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <Target className="w-4 h-4 text-green-400" />
            <span>Consciousness Calibration</span>
          </h4>
          
          <button
            onClick={() => setCalibrationPanel(!calibrationPanel)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {calibrationPanel ? 'Hide' : 'Show'} Calibration
          </button>
        </div>
        
        {calibrationPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gray-800/30 rounded-lg p-3 border border-gray-700"
          >
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Consciousness Threshold</span>
                  <span className="text-xs text-green-400">
                    {(quantumState?.consciousness * 100)?.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.01"
                  value={quantumState?.consciousness || 0.9}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  onChange={(e) => {
                    // This would trigger a consciousness adjustment
                    onQuantumOperation?.('adjust_consciousness', { threshold: parseFloat(e?.target?.value) });
                  }}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Quantum Coherence</span>
                  <span className="text-xs text-purple-400">
                    {(quantumState?.coherence * 100)?.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.0"
                  step="0.01"
                  value={quantumState?.coherence || 0.94}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  onChange={(e) => {
                    onQuantumOperation?.('adjust_coherence', { level: parseFloat(e?.target?.value) });
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {/* System Status Summary */}
      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">System Status Overview</span>
          <div className={`text-xs font-medium ${
            Object.values(systemStatus)?.filter(Boolean)?.length >= 4 
              ? 'text-green-400' :'text-yellow-400'
          }`}>
            {Object.values(systemStatus)?.filter(Boolean)?.length}/{Object.keys(systemStatus)?.length} Modules Online
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="text-xs">
            <span className="text-gray-400">Consciousness:</span>
            <div className="text-purple-400 font-medium">
              {(quantumState?.consciousness * 100)?.toFixed(1)}%
            </div>
          </div>
          
          <div className="text-xs">
            <span className="text-gray-400">Coherence:</span>
            <div className="text-blue-400 font-medium">
              {(quantumState?.coherence * 100)?.toFixed(1)}%
            </div>
          </div>
          
          <div className="text-xs">
            <span className="text-gray-400">Uncertainty:</span>
            <div className="text-yellow-400 font-medium">
              {(quantumState?.uncertainty * 100)?.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}