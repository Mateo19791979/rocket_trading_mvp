import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Activity, AlertTriangle, TrendingUp, Zap, Clock, XCircle, Download, RotateCcw } from 'lucide-react';

// Components
import SurveillancePanel from './components/SurveillancePanel';
import AlertManagementPanel from './components/AlertManagementPanel';
import PdfAutoReportsPanel from './components/PdfAutoReportsPanel';
import RiskControllerPanel from './components/RiskControllerPanel';
import AdvantagesPanel from './components/AdvantagesPanel';

// Services
import { monitoringControlService } from '../../services/monitoringControlService';

const MonitoringControlCenter = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [realTimeData, setRealTimeData] = useState({
    busMonitor: null,
    alerts: null,
    pdfReports: null,
    riskController: null,
    advantages: null
  });

  // Load monitoring data
  const loadMonitoringData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [busMonitor, alerts, pdfReports, riskController, advantages] = await Promise.all([
        monitoringControlService?.getBusMonitorStatus(),
        monitoringControlService?.getAlertManagement(),
        monitoringControlService?.getPdfAutoReports(),
        monitoringControlService?.getRiskController(),
        monitoringControlService?.getMonitoringAdvantages()
      ]);

      setRealTimeData({
        busMonitor: busMonitor?.data,
        alerts: alerts?.data,
        pdfReports: pdfReports?.data,
        riskController: riskController?.data,
        advantages: advantages?.data
      });

      setLastUpdate(new Date());
    } catch (err) {
      setError('Échec du chargement des données de monitoring');
      console.error('Monitoring data load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data and set up real-time updates
  useEffect(() => {
    loadMonitoringData();

    // Set up real-time subscription
    const subscription = monitoringControlService?.subscribeToSystemUpdates((payload) => {
      // Refresh data when changes detected
      loadMonitoringData();
    });

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000);

    return () => {
      if (subscription) {
        subscription?.unsubscribe();
      }
      clearInterval(interval);
    };
  }, []);

  // Emergency actions
  const handleEmergencyKillswitch = async () => {
    if (!confirm('Êtes-vous sûr de vouloir activer le killswitch d\'urgence ? Cette action arrêtera toutes les opérations de trading.')) {
      return;
    }

    try {
      await monitoringControlService?.triggerEmergencyKillswitch('Activation manuelle depuis le centre de contrôle');
      await loadMonitoringData(); // Refresh data
    } catch (err) {
      setError('Échec de l\'activation du killswitch');
    }
  };

  const handleGenerateImmediateReport = async () => {
    try {
      await monitoringControlService?.generateImmediateReport();
      await loadMonitoringData(); // Refresh data
    } catch (err) {
      setError('Échec de la génération du rapport immédiat');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du centre de contrôle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Monitoring & Contrôle
            </h1>
            <p className="text-xl text-blue-400 font-semibold">
              Niveau Hedge Fund — supervision Rocket
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {format(new Date(), 'EEEE d MMMM yyyy, HH:mm:ss', { locale: fr })}
            </p>
          </div>
          
          {/* System Status Indicators */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                realTimeData?.busMonitor?.summary?.healthy === realTimeData?.busMonitor?.summary?.total
                  ? 'bg-green-500 animate-pulse' :'bg-yellow-500'
              }`}></div>
              <span className="text-sm text-gray-400">
                Système {realTimeData?.busMonitor?.summary?.healthy === realTimeData?.busMonitor?.summary?.total ? 'Optimal' : 'Dégradé'}
              </span>
            </div>
            
            <button
              onClick={loadMonitoringData}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Actualiser</span>
            </button>

            {/* Emergency Controls */}
            <button
              onClick={handleEmergencyKillswitch}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Arrêt d'urgence</span>
            </button>
          </div>
        </div>

        {/* Last Update & Error Display */}
        <div className="flex items-center justify-between mt-4">
          {lastUpdate && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Dernière mise à jour: {format(lastUpdate, 'HH:mm:ss', { locale: fr })}</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">
              <XCircle className="w-4 h-4" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-100"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-[1920px] mx-auto">
          {/* Left Column - Surveillance */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-teal-400" />
                  Surveillance
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Bus Monitor */}
                <SurveillancePanel data={realTimeData?.busMonitor} />
                
                {/* Alertes */}
                <AlertManagementPanel data={realTimeData?.alerts} />
                
                {/* PDF Auto */}
                <PdfAutoReportsPanel data={realTimeData?.pdfReports} />
                
                {/* Risk Controller */}
                <RiskControllerPanel data={realTimeData?.riskController} />
              </div>
            </div>
          </div>

          {/* Right Column - Avantages */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-400" />
                  Avantages
                </h2>
              </div>
              <div className="p-6">
                <AdvantagesPanel data={realTimeData?.advantages} />
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Actions Rapides
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <button
                  onClick={handleGenerateImmediateReport}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Générer Rapport Immédiat</span>
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {realTimeData?.busMonitor?.summary?.active || 0}
                    </div>
                    <div className="text-sm text-gray-400">Agents Actifs</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {realTimeData?.alerts?.metrics?.avgLatency || 150}ms
                    </div>
                    <div className="text-sm text-gray-400">Latence Moy.</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-lg font-semibold text-orange-400">
                    VaR 95%: ${(realTimeData?.riskController?.metrics?.var95 || 0)?.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Risque de Marché</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringControlCenter;