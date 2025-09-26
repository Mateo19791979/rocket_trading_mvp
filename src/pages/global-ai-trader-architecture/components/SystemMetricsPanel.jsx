import React from 'react';
import { motion } from 'framer-motion';
import { Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart } from 'recharts';
import { Activity, Cpu, HardDrive, Clock } from 'lucide-react';

const SystemMetricsPanel = ({ services, serviceStatuses }) => {
  // Mock performance data
  const performanceData = [
    { time: '00:00', cpu: 45, memory: 60, requests: 120 },
    { time: '04:00', cpu: 38, memory: 55, requests: 95 },
    { time: '08:00', cpu: 65, memory: 70, requests: 180 },
    { time: '12:00', cpu: 78, memory: 75, requests: 240 },
    { time: '16:00', cpu: 85, memory: 80, requests: 320 },
    { time: '20:00', cpu: 72, memory: 68, requests: 210 },
    { time: '24:00', cpu: 48, memory: 58, requests: 140 }
  ];

  const getSystemHealth = () => {
    if (!serviceStatuses || Object.keys(serviceStatuses)?.length === 0) return 'unknown';
    
    const statuses = Object.values(serviceStatuses);
    const healthyCount = statuses?.filter(s => s?.status === 'healthy')?.length;
    const total = statuses?.length;
    const healthPercentage = (healthyCount / total) * 100;
    
    if (healthPercentage >= 90) return 'excellent';
    if (healthPercentage >= 70) return 'good';
    if (healthPercentage >= 50) return 'warning';
    return 'critical';
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const systemHealth = getSystemHealth();
  const healthColor = getHealthColor(systemHealth);
  
  const avgResponseTime = serviceStatuses && Object.keys(serviceStatuses)?.length > 0
    ? Math.round(Object.values(serviceStatuses)?.reduce((sum, s) => sum + (s?.response_time || 0), 0) / Object.values(serviceStatuses)?.length)
    : 0;

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 shadow-xl border border-gray-800">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-green-600 rounded-lg mr-3">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Métriques Système</h2>
          <p className="text-gray-400 text-sm">Performance & monitoring temps réel</p>
        </div>
      </div>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Activity className={`w-5 h-5 ${healthColor}`} />
            <span className={`text-xs font-semibold ${healthColor}`}>
              {systemHealth?.toUpperCase()}
            </span>
          </div>
          <div className="text-white text-lg font-bold">
            {Object.keys(serviceStatuses)?.length}/5
          </div>
          <div className="text-gray-400 text-xs">Services actifs</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400">AVG</span>
          </div>
          <div className="text-white text-lg font-bold">{avgResponseTime}ms</div>
          <div className="text-gray-400 text-xs">Temps réponse</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-5 h-5 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-400">72%</span>
          </div>
          <div className="text-white text-lg font-bold">CPU</div>
          <div className="text-gray-400 text-xs">Utilisation</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400">68%</span>
          </div>
          <div className="text-white text-lg font-bold">RAM</div>
          <div className="text-gray-400 text-xs">Mémoire</div>
        </div>
      </div>
      {/* Performance Chart */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Performance 24h</h3>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-400">CPU</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-400">Memory</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-400">Requests</span>
            </div>
          </div>
        </div>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                stackId="1"
                stroke="#60A5FA"
                fill="#60A5FA"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="memory"
                stackId="2"
                stroke="#A78BFA"
                fill="#A78BFA"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Service Response Times */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Temps de Réponse Services</h3>
        
        <div className="space-y-3">
          {services?.map((service) => {
            const status = serviceStatuses?.[service?.id];
            const responseTime = status?.response_time || 0;
            const percentage = Math.min((responseTime / 300) * 100, 100);
            
            return (
              <div key={service?.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{service?.name}</span>
                  <span className={`text-xs ${
                    responseTime < 100 ? 'text-green-400' : 
                    responseTime < 200 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {responseTime}ms
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-2 rounded-full ${
                      responseTime < 100 ? 'bg-green-400' : 
                      responseTime < 200 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SystemMetricsPanel;