import React, { useState, useEffect } from 'react';
import { Clock, Target, Zap, Activity, CheckCircle, TrendingUp } from 'lucide-react';
import Icon from '@/components/AppIcon';


const TimelineDashboard = ({ deployments, systemHealth, readinessScore }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const calculateTimeToMilestone = (hours) => {
    const targetTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    const diff = targetTime - currentTime;
    
    if (diff <= 0) return 'Completed';
    
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${totalHours}h ${minutes}m`;
  };

  const getCurrentPhase = () => {
    const activeDeployment = deployments?.[0];
    if (!activeDeployment) return 'pre_launch';
    
    const createdAt = new Date(activeDeployment.created_at);
    const hoursElapsed = (currentTime - createdAt) / (1000 * 60 * 60);
    
    if (hoursElapsed < 24) return 't0_monitoring';
    if (hoursElapsed < 48) return 't24_extension';
    return 't48_golive';
  };

  const phase = getCurrentPhase();
  
  const milestones = [
    {
      id: 't0',
      label: 'T-0 Canary Launch',
      time: 0,
      status: phase === 'pre_launch' ? 'pending' : 'completed',
      description: 'Canary à taille minimale (0.1-0.5%)',
      icon: Zap,
      color: 'red'
    },
    {
      id: 't24',
      label: 'T-24h Extension',
      time: 24,
      status: phase === 't0_monitoring' ? 'pending' : phase === 'pre_launch' ? 'upcoming' : 'completed',
      description: '+2-3 strats canary, taille totale ≤2%',
      icon: Activity,
      color: 'yellow'
    },
    {
      id: 't48',
      label: 'T-48h GO-LIVE',
      time: 48,
      status: phase === 't48_golive' ? 'active' : 'upcoming',
      description: 'Montée progressive par paliers',
      icon: Target,
      color: 'green'
    }
  ];

  const getKPIStatus = () => {
    const healthyAgents = systemHealth?.filter(h => h?.health_status === 'healthy')?.length || 0;
    const totalAgents = systemHealth?.length || 1;
    
    return [
      {
        label: 'P99 Latence API',
        value: '45ms',
        target: '< 100ms',
        status: 'good',
        trend: 'down'
      },
      {
        label: 'Erreurs 1h',
        value: '0.02%',
        target: '< 0.1%',
        status: 'excellent',
        trend: 'stable'
      },
      {
        label: 'Health Agents',
        value: `${Math.round((healthyAgents / totalAgents) * 100)}%`,
        target: '> 90%',
        status: healthyAgents / totalAgents >= 0.9 ? 'good' : 'warning',
        trend: 'up'
      },
      {
        label: 'Drift Live/Paper',
        value: '2.1%',
        target: '< 5%',
        status: 'good',
        trend: 'stable'
      }
    ];
  };

  const kpis = getKPIStatus();

  return (
    <div className="space-y-6">
      {/* Mission Timeline */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-6 h-6 text-gold-400" />
          <h2 className="text-xl font-bold">Mission Timeline Dashboard</h2>
          <div className="ml-auto text-sm text-gray-400">
            {currentTime?.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {milestones?.map((milestone, index) => {
            const Icon = milestone?.icon;
            return (
              <div
                key={milestone?.id}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  milestone?.status === 'active' ? 'border-green-400 bg-green-400/10' :
                  milestone?.status === 'completed' ? 'border-gray-500 bg-gray-500/10' :
                  milestone?.status === 'pending'? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-600 bg-gray-600/10'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Icon className={`w-6 h-6 text-${milestone?.color}-400`} />
                  <span className="font-bold">{milestone?.label}</span>
                  {milestone?.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-3">{milestone?.description}</p>
                <div className="text-lg font-bold">
                  {milestone?.status === 'completed' ? 'Completed' :
                   milestone?.status === 'active' ? 'In Progress' :
                   calculateTimeToMilestone(milestone?.time)}
                </div>
                {/* Connection line to next milestone */}
                {index < milestones?.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-600"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Real-time KPI Monitoring */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold">KPI Monitoring en Temps Réel</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis?.map((kpi, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                kpi?.status === 'excellent' ? 'border-green-400 bg-green-400/10' :
                kpi?.status === 'good' ? 'border-blue-400 bg-blue-400/10' :
                kpi?.status === 'warning'? 'border-yellow-400 bg-yellow-400/10' : 'border-red-400 bg-red-400/10'
              }`}
            >
              <div className="text-sm text-gray-400 mb-1">{kpi?.label}</div>
              <div className="text-2xl font-bold text-white mb-1">{kpi?.value}</div>
              <div className="text-xs text-gray-400 mb-2">Target: {kpi?.target}</div>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  kpi?.status === 'excellent' ? 'bg-green-400/20 text-green-400' :
                  kpi?.status === 'good' ? 'bg-blue-400/20 text-blue-400' :
                  kpi?.status === 'warning'? 'bg-yellow-400/20 text-yellow-400' : 'bg-red-400/20 text-red-400'
                }`}>
                  {kpi?.status?.toUpperCase()}
                </span>
                
                <span className={`text-xs ${
                  kpi?.trend === 'up' ? 'text-green-400' :
                  kpi?.trend === 'down'? 'text-red-400' : 'text-gray-400'
                }`}>
                  {kpi?.trend === 'up' ? '↗' : kpi?.trend === 'down' ? '↘' : '→'} {kpi?.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Deployment Status */}
      {deployments?.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold">Deployment Status</h2>
          </div>

          <div className="space-y-4">
            {deployments?.slice(0, 3)?.map((deployment, index) => (
              <div key={deployment?.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-bold text-white">{deployment?.pipeline_name}</h3>
                  <p className="text-sm text-gray-400">
                    Stage: {deployment?.current_stage?.replace('_', ' ')?.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(deployment.created_at)?.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className={`px-3 py-1 rounded text-sm font-bold ${
                    deployment?.overall_status === 'completed' ? 'bg-green-400/20 text-green-400' :
                    deployment?.overall_status === 'running' ? 'bg-blue-400/20 text-blue-400' :
                    deployment?.overall_status === 'pending'? 'bg-yellow-400/20 text-yellow-400' : 'bg-gray-400/20 text-gray-400'
                  }`}>
                    {deployment?.overall_status?.toUpperCase()}
                  </div>
                  
                  {deployment?.completion_percentage && (
                    <div className="text-sm text-gray-400 mt-1">
                      {deployment?.completion_percentage?.toFixed(1)}% complete
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineDashboard;