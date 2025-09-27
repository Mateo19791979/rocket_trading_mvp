import React, { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';
import TriggerConfigPanel from './components/TriggerConfigPanel';
import MainJobsPanel from './components/MainJobsPanel';
import OptimizationsPanel from './components/OptimizationsPanel';

const CiCdFlutterOptimizedOverview = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">CI/CD Flutter — Vue d'ensemble optimisée</h1>
                <p className="text-xl text-gray-300 mt-2">Qualité • Tests • Build • Sécurité • Déploiement</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">{formatDate(currentTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <TriggerConfigPanel />
            <MainJobsPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <OptimizationsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CiCdFlutterOptimizedOverview;