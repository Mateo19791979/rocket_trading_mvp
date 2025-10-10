import React, { useState } from 'react';
import { Settings, Play, Pause, RotateCcw, Sliders, Target, Shield, AlertTriangle } from 'lucide-react';

export default function MasterControlInterface({ 
  orchestrationMode, 
  onModeChange, 
  systemOverview, 
  onGlobalCommand 
}) {
  const [resourceAllocation, setResourceAllocation] = useState({
    cpu: 75,
    memory: 68,
    network: 82
  });
  const [prioritySettings, setPrioritySettings] = useState({
    trading: 85,
    research: 70,
    riskManagement: 95
  });

  const handleResourceChange = (resource, value) => {
    setResourceAllocation(prev => ({
      ...prev,
      [resource]: parseInt(value)
    }));
  };

  const handlePriorityChange = (category, value) => {
    setPrioritySettings(prev => ({
      ...prev,
      [category]: parseInt(value)
    }));
  };

  const getSystemHealthColor = () => {
    if (!systemOverview?.systemHealth) return 'text-gray-400';
    return systemOverview?.systemHealth?.overall === 'healthy' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Master Control Interface</h3>
        <Settings className="w-4 h-4 text-blue-400" />
      </div>
      {/* Global Orchestration Commands */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Global Commands</h4>
        
        <div className="space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={() => onGlobalCommand?.('pause')}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Pause className="w-4 h-4" />
              <span>System Pause</span>
            </button>
            <button
              onClick={() => onGlobalCommand?.('resume')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="w-4 h-4" />
              <span>Resume</span>
            </button>
          </div>
          
          <button
            onClick={() => onGlobalCommand?.('reset')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Agents</span>
          </button>
        </div>
      </div>
      {/* Orchestration Mode */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Orchestration Mode</h4>
        
        <div className="space-y-2">
          {['auto', 'manual', 'hybrid']?.map(mode => (
            <label key={mode} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="orchestrationMode"
                value={mode}
                checked={orchestrationMode === mode}
                onChange={(e) => onModeChange?.(e?.target?.value)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-300 capitalize">{mode}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Resource Allocation */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <Sliders className="w-3 h-3 mr-1" />
          Resource Allocation
        </h4>
        
        <div className="space-y-3">
          {Object.entries(resourceAllocation)?.map(([resource, value]) => (
            <div key={resource}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 capitalize">{resource}:</span>
                <span className="text-white">{value}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => handleResourceChange(resource, e?.target?.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Priority Assignment */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <Target className="w-3 h-3 mr-1" />
          Priority Assignment
        </h4>
        
        <div className="space-y-3">
          {Object.entries(prioritySettings)?.map(([category, value]) => (
            <div key={category}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 capitalize">{category?.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="text-white">{value}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => handlePriorityChange(category, e?.target?.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          ))}
        </div>
      </div>
      {/* System Status Overview */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <Shield className="w-3 h-3 mr-1" />
          System Status
        </h4>
        
        {systemOverview ? (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Overall Health:</span>
              <span className={getSystemHealthColor()}>
                {systemOverview?.systemHealth?.overall?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Agents:</span>
              <span className="text-blue-400">{systemOverview?.agents?.active}/{systemOverview?.agents?.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime:</span>
              <span className="text-green-400">{systemOverview?.systemHealth?.uptime || '99.8%'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Recent Events:</span>
              <span className="text-purple-400">{systemOverview?.events?.recent || 0}</span>
            </div>
            {systemOverview?.riskManager && (
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Level:</span>
                <span className="text-yellow-400">
                  {systemOverview?.riskManager?.highRiskCount > 0 ? 'ELEVATED' : 'NORMAL'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-400">Loading system status...</div>
        )}
      </div>
      {/* Audit Log Access */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Audit & Logging</h4>
        
        <div className="space-y-2">
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
            View Audit Trail
          </button>
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
            Export System Logs
          </button>
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
            Performance Report
          </button>
        </div>
      </div>
      {/* Emergency Controls Warning */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium text-red-400">Emergency Notice</span>
        </div>
        <p className="text-xs text-gray-300">
          All orchestration activities are logged and monitored. Emergency controls require multi-factor authentication.
        </p>
      </div>
    </div>
  );
}