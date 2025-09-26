import React from 'react';
import { TrendingUp, Clock, Award, AlertTriangle, CheckCircle } from 'lucide-react';

export default function KPIMetricsPanel({ kpis, loading }) {
  const getMetricStatus = (current, target, isTime = false) => {
    if (isTime) {
      // For time metrics, lower is better
      if (current <= target) return { color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle };
      if (current <= target * 1.5) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: AlertTriangle };
      return { color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle };
    } else {
      // For count metrics, higher is better
      const percentage = target > 0 ? (current / target) * 100 : 0;
      if (percentage >= 100) return { color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle };
      if (percentage >= 75) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: AlertTriangle };
      return { color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle };
    }
  };

  const metrics = [
    {
      key: 'weekly_docs',
      title: 'Nbr docs OA intégrés',
      current: kpis?.weekly_docs_integrated || 0,
      target: kpis?.target_weekly_docs || 200,
      unit: '/semaine',
      icon: TrendingUp,
      description: 'Documents open-access traités cette semaine'
    },
    {
      key: 'strategies_extracted',
      title: 'Stratégies extraites avec score confiance',
      current: kpis?.strategies_extracted || 0,
      target: null,
      unit: '',
      icon: Award,
      description: `Score de confiance moyen: ${kpis?.avg_confidence_score ? (kpis?.avg_confidence_score * 100)?.toFixed(1) + '%' : 'N/A'}`,
      showConfidence: true
    },
    {
      key: 'ingestion_time',
      title: 'Temps ingestion',
      current: kpis?.avg_ingestion_time_hours || 0,
      target: kpis?.target_ingestion_hours || 24,
      unit: 'h',
      icon: Clock,
      description: 'Temps moyen de traitement par document',
      isTime: true
    }
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-6 h-6 text-green-400" />
        <h2 className="text-xl font-semibold text-white">📈 KPIs</h2>
      </div>
      <div className="space-y-4">
        {metrics?.map((metric) => {
          const status = metric?.target ? getMetricStatus(metric?.current, metric?.target, metric?.isTime) : null;
          const StatusIcon = status?.icon;
          const MetricIcon = metric?.icon;

          return (
            <div
              key={metric?.key}
              className={`${status?.bg || 'bg-slate-700/30'} border ${status ? status?.color?.replace('text-', 'border-')?.replace('400', '500/30') : 'border-slate-600/30'} rounded-lg p-4 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MetricIcon className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {metric?.title}
                    </h3>
                    <p className="text-slate-300 text-xs mt-1">
                      {metric?.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    {status && <StatusIcon className={`w-4 h-4 ${status?.color}`} />}
                    <div className={`text-xl font-bold ${status?.color || 'text-slate-300'}`}>
                      {loading ? '...' : metric?.current?.toFixed(metric?.isTime ? 1 : 0)}
                      <span className="text-sm font-normal text-slate-400 ml-1">
                        {metric?.unit}
                      </span>
                    </div>
                  </div>
                  
                  {metric?.target && (
                    <div className="text-xs text-slate-400 mt-1">
                      Objectif: {metric?.target}{metric?.unit}
                    </div>
                  )}
                </div>
              </div>
              {/* Progress Bar for targets */}
              {metric?.target && (
                <div className="mt-3">
                  <div className="bg-slate-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${status?.bg?.replace('/20', '/60')} transition-all duration-500`}
                      style={{ 
                        width: metric?.isTime 
                          ? `${Math.max(0, Math.min(100, 100 - ((metric?.current / metric?.target) - 1) * 100))}%`
                          : `${Math.min((metric?.current / metric?.target) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
              {/* Confidence Score Display */}
              {metric?.showConfidence && kpis?.avg_confidence_score && (
                <div className="mt-3 bg-slate-700/30 rounded-lg p-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Score de confiance</span>
                    <span className={`font-bold ${kpis?.avg_confidence_score > 0.8 ? 'text-green-400' : kpis?.avg_confidence_score > 0.6 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {(kpis?.avg_confidence_score * 100)?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-700/50 rounded-full h-1 mt-1">
                    <div
                      className={`h-1 rounded-full ${kpis?.avg_confidence_score > 0.8 ? 'bg-green-400' : kpis?.avg_confidence_score > 0.6 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${kpis?.avg_confidence_score * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}