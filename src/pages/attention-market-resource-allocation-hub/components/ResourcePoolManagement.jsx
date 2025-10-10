import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Zap, Wifi, Monitor, BarChart3, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';
import Icon from '@/components/AppIcon';


export default function ResourcePoolManagement({ resourceMetrics, marketState }) {
  const [selectedResourceType, setSelectedResourceType] = useState('cpu');
  const [resourceUtilization, setResourceUtilization] = useState({
    cpu: { total: 100, used: 0, available: 100 },
    memory: { total: 256, used: 0, available: 256 },
    gpu: { total: 8, used: 0, available: 8 },
    network: { total: 1000, used: 0, available: 1000 }
  });

  // Simulate real-time resource usage
  useEffect(() => {
    const interval = setInterval(() => {
      setResourceUtilization(prev => ({
        cpu: {
          total: 100,
          used: Math.min(95, Math.max(10, prev?.cpu?.used + (Math.random() - 0.5) * 10)),
          available: 0
        },
        memory: {
          total: 256,
          used: Math.min(200, Math.max(20, prev?.memory?.used + (Math.random() - 0.5) * 20)),
          available: 0
        },
        gpu: {
          total: 8,
          used: Math.min(8, Math.max(0, prev?.gpu?.used + (Math.random() - 0.5) * 2)),
          available: 0
        },
        network: {
          total: 1000,
          used: Math.min(800, Math.max(50, prev?.network?.used + (Math.random() - 0.5) * 100)),
          available: 0
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Update available resources
  useEffect(() => {
    setResourceUtilization(prev => ({
      cpu: { ...prev?.cpu, available: prev?.cpu?.total - prev?.cpu?.used },
      memory: { ...prev?.memory, available: prev?.memory?.total - prev?.memory?.used },
      gpu: { ...prev?.gpu, available: prev?.gpu?.total - prev?.gpu?.used },
      network: { ...prev?.network, available: prev?.network?.total - prev?.network?.used }
    }));
  }, [resourceUtilization?.cpu?.used, resourceUtilization?.memory?.used, resourceUtilization?.gpu?.used, resourceUtilization?.network?.used]);

  const getUtilizationColor = (percentage) => {
    if (percentage >= 90) return 'text-red-400 bg-red-900/30';
    if (percentage >= 70) return 'text-yellow-400 bg-yellow-900/30';
    return 'text-green-400 bg-green-900/30';
  };

  const getUtilizationStatus = (percentage) => {
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'warning';
    return 'healthy';
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'cpu': return Cpu;
      case 'memory': return HardDrive;
      case 'gpu': return Zap;
      case 'network': return Wifi;
      default: return Monitor;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes >= 1024) return `${(bytes / 1024)?.toFixed(1)}TB`;
    return `${bytes}GB`;
  };

  const formatSpeed = (speed) => {
    return `${speed}Mbps`;
  };

  const formatValue = (type, value) => {
    switch (type) {
      case 'cpu': return `${value?.toFixed(1)}%`;
      case 'memory': return formatBytes(value);
      case 'gpu': return `${Math.round(value)} Units`;
      case 'network': return formatSpeed(value);
      default: return value?.toString();
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Resource Pool Management</h3>
              <p className="text-gray-400 text-sm">Real-time computational resource monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-semibold">Live Monitoring</span>
          </div>
        </div>

        {/* Resource Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(resourceUtilization)?.map(([type, data]) => {
            const Icon = getResourceIcon(type);
            const utilizationPercentage = (data?.used / data?.total) * 100;
            const status = getUtilizationStatus(utilizationPercentage);
            
            return (
              <div 
                key={type}
                onClick={() => setSelectedResourceType(type)}
                className={`bg-gray-900/50 rounded-lg p-4 cursor-pointer transition-all border-2 ${
                  selectedResourceType === type 
                    ? 'border-blue-500 bg-blue-900/20' :'border-transparent hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-8 h-8 text-blue-400" />
                    <div>
                      <h4 className="text-white font-semibold capitalize">{type}</h4>
                      <p className="text-gray-400 text-sm">
                        {formatValue(type, data?.available)} available
                      </p>
                    </div>
                  </div>
                  
                  {status === 'critical' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                  {status === 'warning' && <Clock className="w-5 h-5 text-yellow-400" />}
                  {status === 'healthy' && <CheckCircle className="w-5 h-5 text-green-400" />}
                </div>
                {/* Usage Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Usage</span>
                    <span>{utilizationPercentage?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        utilizationPercentage >= 90 ? 'bg-red-500' :
                        utilizationPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, utilizationPercentage)}%` }}
                    />
                  </div>
                </div>
                {/* Stats */}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    Used: {formatValue(type, data?.used)}
                  </span>
                  <span className="text-gray-400">
                    Total: {formatValue(type, data?.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Resource View */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold capitalize">
              {selectedResourceType} Allocation Details
            </h4>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm">Real-time</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {formatValue(selectedResourceType, resourceUtilization?.[selectedResourceType]?.used)}
              </div>
              <div className="text-gray-400 text-sm">Currently Used</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {formatValue(selectedResourceType, resourceUtilization?.[selectedResourceType]?.available)}
              </div>
              <div className="text-gray-400 text-sm">Available</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {formatValue(selectedResourceType, resourceUtilization?.[selectedResourceType]?.total)}
              </div>
              <div className="text-gray-400 text-sm">Total Capacity</div>
            </div>
          </div>

          {/* Resource Allocation by Agents */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h5 className="text-white font-medium mb-3">Active Allocations</h5>
            <div className="space-y-2">
              {marketState?.agentActivity && Object.entries(marketState?.agentActivity)?.filter(([_, agent]) => agent?.wonBids > 0)?.slice(0, 4)?.map(([agentName, agent]) => (
                  <div key={agentName} className="flex items-center justify-between bg-gray-800/50 rounded p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-white text-sm font-medium">{agentName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">{agent?.wonBids} tasks</div>
                      <div className="text-gray-400 text-xs">{agent?.totalSpent?.toLocaleString()} tokens</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Resource Efficiency Metrics */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h4 className="text-white font-semibold">Efficiency Metrics</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Resource Utilization Rate</span>
                <span className="text-white font-semibold">
                  {resourceMetrics?.resourceUtilizationRate?.toFixed(1) || '0'}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(100, resourceMetrics?.resourceUtilizationRate || 0)}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Duration Accuracy</span>
                <span className="text-white font-semibold">
                  {resourceMetrics?.durationAccuracy?.toFixed(1) || '0'}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(100, resourceMetrics?.durationAccuracy || 0)}%` 
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">
                  {resourceMetrics?.agentDiversityIndex || 0}
                </div>
                <div className="text-gray-400 text-xs">Active Agents</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-white">
                  {resourceMetrics?.averageTaskDuration?.toFixed(0) || 0}m
                </div>
                <div className="text-gray-400 text-xs">Avg Duration</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-white">
                  {resourceMetrics?.totalResourcesAllocated?.toLocaleString() || 0}
                </div>
                <div className="text-gray-400 text-xs">Total Allocated</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-white">
                  {resourceMetrics?.highPriorityAllocationRate?.toFixed(1) || 0}%
                </div>
                <div className="text-gray-400 text-xs">High Priority</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}