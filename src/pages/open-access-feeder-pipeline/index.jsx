import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Calendar, AlertCircle } from 'lucide-react';
import { openAccessFeederService } from '../../services/openAccessFeederService';
import AppImage from '../../components/AppImage';

// Import sub-components
import LegalSourcesPanel from './components/LegalSourcesPanel';
import PipelineStagesPanel from './components/PipelineStagesPanel';
import ProductIntegrationPanel from './components/ProductIntegrationPanel';
import KPIMetricsPanel from './components/KPIMetricsPanel';
import ExecutionControlPanel from './components/ExecutionControlPanel';
import ProcessingLogsPanel from './components/ProcessingLogsPanel';

export default function OpenAccessFeederPipeline() {
  const [loading, setLoading] = useState(true);
  const [legalSources, setLegalSources] = useState(null);
  const [pipelineStages, setPipelineStages] = useState(null);
  const [productIntegration, setProductIntegration] = useState(null);
  const [kpiMetrics, setKpiMetrics] = useState(null);
  const [processingLogs, setProcessingLogs] = useState([]);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sourcesResult, stagesResult, integrationResult, kpisResult, logsResult] = await Promise.all([
        openAccessFeederService?.getLegalSourcesStatus(),
        openAccessFeederService?.getPipelineStagesStatus(),
        openAccessFeederService?.getProductIntegrationStatus(),
        openAccessFeederService?.getKPIMetrics(),
        openAccessFeederService?.getProcessingLogs(20)
      ]);

      if (sourcesResult?.error) throw new Error(sourcesResult.error);
      if (stagesResult?.error) throw new Error(stagesResult.error);
      if (integrationResult?.error) throw new Error(integrationResult.error);
      if (kpisResult?.error) throw new Error(kpisResult.error);
      if (logsResult?.error) throw new Error(logsResult.error);

      setLegalSources(sourcesResult?.sources);
      setPipelineStages(stagesResult?.stages);
      setProductIntegration(integrationResult?.integration);
      setKpiMetrics(kpisResult?.kpis);
      setProcessingLogs(logsResult?.logs);

    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh interval
  useEffect(() => {
    loadDashboardData();
    
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getCurrentDate = () => {
    return new Date()?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && !legalSources) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-lg">Chargement du pipeline Open-Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="relative bg-slate-800/60 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-teal-500/20 p-2 rounded-lg">
                <FileText className="w-8 h-8 text-teal-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Open-Access Feeder</h1>
                <p className="text-slate-300 mt-1">Pipeline légal pour enrichir la base de connaissances</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-slate-700/50 px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{getCurrentDate()}</span>
                </div>
              </div>
              
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reference Image */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-slate-700/50 p-6 mb-8">
          <AppImage
            src="/assets/images/Planche_OpenAccess_Feeder-1758900420389.jpg"
            alt="Open-Access Feeder Pipeline Diagram"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            {/* Legal Sources Section */}
            <LegalSourcesPanel 
              sources={legalSources} 
              loading={loading}
              onRefresh={loadDashboardData}
            />
            
            {/* Pipeline Stages Section */}
            <PipelineStagesPanel 
              stages={pipelineStages} 
              loading={loading}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Product Integration Section */}
            <ProductIntegrationPanel 
              integration={productIntegration} 
              loading={loading}
            />
            
            {/* KPI Metrics Section */}
            <KPIMetricsPanel 
              kpis={kpiMetrics} 
              loading={loading}
            />
            
            {/* Execution Controls */}
            <ExecutionControlPanel 
              onExecute={loadDashboardData}
            />
          </div>
        </div>

        {/* Processing Logs (Full Width) */}
        <div className="mt-8">
          <ProcessingLogsPanel 
            logs={processingLogs} 
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}