import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Activity, Database, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const SecurityMetricsPanel = ({ data, className = '' }) => {
  const metrics = [
    {
      id: 'ssl_security',
      title: 'Sécurité SSL/TLS',
      value: data?.ssl?.validCerts || 0,
      total: data?.ssl?.totalCerts || 0,
      percentage: data?.ssl?.totalCerts > 0 ? Math.round((data?.ssl?.validCerts / data?.ssl?.totalCerts) * 100) : 0,
      icon: Lock,
      color: 'blue',
      status: (data?.ssl?.validCerts || 0) === (data?.ssl?.totalCerts || 0) ? 'good' : 'warning'
    },
    {
      id: 'dns_health',
      title: 'Santé DNS',
      value: data?.dns?.healthyChecks || 0,
      total: data?.dns?.totalChecks || 0,
      percentage: data?.dns?.totalChecks > 0 ? Math.round((data?.dns?.healthyChecks / data?.dns?.totalChecks) * 100) : 0,
      icon: Activity,
      color: 'green',
      status: (data?.dns?.failingChecks || 0) === 0 ? 'good' : 'error'
    },
    {
      id: 'risk_control',
      title: 'Contrôle des Risques',
      value: data?.risk?.killswitchEnabled ? 1 : 0,
      total: 1,
      percentage: data?.risk?.killswitchEnabled ? 100 : 0,
      icon: Shield,
      color: 'purple',
      status: data?.risk?.killswitchEnabled ? 'good' : 'warning'
    },
    {
      id: 'system_health',
      title: 'Santé Système',
      value: data?.system?.healthyAgents || 0,
      total: data?.system?.totalAgents || 1,
      percentage: data?.system?.totalAgents > 0 ? Math.round((data?.system?.healthyAgents / data?.system?.totalAgents) * 100) : 0,
      icon: Database,
      color: 'teal',
      status: (data?.system?.healthyAgents || 0) === (data?.system?.totalAgents || 1) ? 'good' : 'warning'
    },
    {
      id: 'compliance',
      title: 'Conformité',
      value: data?.compliance?.compliantReports || 0,
      total: data?.compliance?.totalReports || 0,
      percentage: data?.compliance?.totalReports > 0 ? Math.round((data?.compliance?.compliantReports / data?.compliance?.totalReports) * 100) : 100,
      icon: CheckCircle,
      color: 'orange',
      status: (data?.compliance?.violations || 0) === 0 ? 'good' : 'error'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-orange-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return Clock;
      case 'error': return AlertTriangle;
      default: return Activity;
    }
  };

  const getProgressColor = (percentage, status) => {
    if (percentage >= 90 && status === 'good') return 'from-green-500 to-green-600';
    if (percentage >= 70) return 'from-yellow-500 to-yellow-600';
    if (percentage >= 50) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const overallScore = Math.round(
    metrics?.reduce((sum, metric) => sum + metric?.percentage, 0) / metrics?.length
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Métriques de Sécurité</h2>
        </div>

        {/* Overall Score */}
        <div className="text-right">
          <div className="text-sm text-slate-400">Score Global</div>
          <div className={`text-2xl font-bold ${overallScore >= 90 ? 'text-green-400' : overallScore >= 70 ? 'text-orange-400' : 'text-red-400'}`}>
            {overallScore}%
          </div>
        </div>
      </div>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics?.map((metric, index) => {
          const Icon = metric?.icon;
          const StatusIcon = getStatusIcon(metric?.status);
          
          return (
            <motion.div
              key={metric?.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 bg-${metric?.color}-500/20 rounded-lg`}>
                  <Icon className={`w-5 h-5 text-${metric?.color}-400`} />
                </div>
                <StatusIcon className={`w-4 h-4 ${getStatusColor(metric?.status)}`} />
              </div>
              <h3 className="font-medium text-white text-sm mb-2">{metric?.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-white">{metric?.value}</span>
                <span className="text-xs text-slate-400">/ {metric?.total}</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-600/50 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${getProgressColor(metric?.percentage, metric?.status)} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${metric?.percentage}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-400 text-right">
                {metric?.percentage}%
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Overall Progress */}
      <div className="mt-6 p-4 bg-slate-700/20 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Niveau de durcissement global</span>
          <span className="text-sm font-medium text-white">{overallScore}% complété</span>
        </div>
        <div className="w-full bg-slate-600/50 rounded-full h-3">
          <div 
            className={`bg-gradient-to-r ${getProgressColor(overallScore, overallScore >= 90 ? 'good' : 'warning')} h-3 rounded-full transition-all duration-500`}
            style={{ width: `${overallScore}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-400 text-center">
          {overallScore >= 90 ? 'Excellent niveau de sécurité' : 
           overallScore >= 70 ? 'Niveau de sécurité correct, améliorations possibles': 'Niveau de sécurité insuffisant, action requise'}
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityMetricsPanel;