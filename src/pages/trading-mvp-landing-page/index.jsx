import React, { useState, useEffect } from 'react';
import AppImage from '../../components/AppImage';
import ValuePropositionPanel from './components/ValuePropositionPanel';
import KeyFeaturesPanel from './components/KeyFeaturesPanel';
import IntegrationDeploymentPanel from './components/IntegrationDeploymentPanel';
import KPITargetsPanel from './components/KPITargetsPanel';
import ContactPanel from './components/ContactPanel';

export default function TradingMVPLandingPage() {
  const [diagnosticData, setDiagnosticData] = useState({
    siteStatus: 'checking',
    dnsStatus: 'checking',
    sslStatus: 'checking',
    apiStatus: 'checking',
    timestamp: new Date()?.toISOString()
  });

  const currentDate = new Date()?.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  useEffect(() => {
    // Diagnostic checks for site visibility
    const runDiagnostics = async () => {
      try {
        // Check if we can reach trading-mvp.com
        const siteCheck = await fetch('https://trading-mvp.com', { 
          mode: 'no-cors', 
          cache: 'no-cache' 
        })?.then(() => 'online')?.catch(() => 'offline');
        
        // Check DNS resolution
        const dnsCheck = window?.location?.hostname?.includes('trading-mvp.com') ? 'resolved' : 'redirect_active';
        
        // Check SSL certificate
        const sslCheck = window?.location?.protocol === 'https:' ? 'valid' : 'invalid';
        
        // Check API connectivity
        const apiCheck = await fetch('/api/health', { 
          method: 'GET',
          cache: 'no-cache'
        })?.then(res => res?.ok ? 'healthy' : 'error')?.catch(() => 'unreachable');

        setDiagnosticData({
          siteStatus: siteCheck,
          dnsStatus: dnsCheck,
          sslStatus: sslCheck,
          apiStatus: apiCheck,
          timestamp: new Date()?.toISOString()
        });
      } catch (error) {
        console.error('Diagnostic error:', error);
        setDiagnosticData(prev => ({
          ...prev,
          siteStatus: 'error',
          timestamp: new Date()?.toISOString()
        }));
      }
    };

    runDiagnostics();
    const interval = setInterval(runDiagnostics, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': case 'resolved': case 'valid': case 'healthy': return 'text-green-400';
      case 'offline': case 'invalid': case 'error': case 'unreachable': return 'text-red-400';
      case 'redirect_active': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return '🟢 Site Online';
      case 'offline': return '🔴 Site Offline';
      case 'resolved': return '🟢 DNS OK';
      case 'redirect_active': return '🟡 Redirect Active';
      case 'valid': return '🟢 SSL Valid';
      case 'invalid': return '🔴 SSL Invalid';
      case 'healthy': return '🟢 API Healthy';
      case 'error': return '🔴 API Error';
      case 'unreachable': return '🔴 API Unreachable';
      case 'checking': return '🔵 Checking...';
      default: return '❓ Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 text-white">
      {/* Emergency Diagnostic Banner */}
      <div className="bg-red-900/20 border-b border-red-500/30 px-6 py-3">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-red-400">🚨 DIAGNOSTIC MODE ACTIF</h2>
              <span className="text-sm text-gray-300">
                Dernière vérification: {new Date(diagnosticData?.timestamp)?.toLocaleTimeString('fr-FR')}
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <span className={getStatusColor(diagnosticData?.siteStatus)}>
                {getStatusText(diagnosticData?.siteStatus)}
              </span>
              <span className={getStatusColor(diagnosticData?.dnsStatus)}>
                {getStatusText(diagnosticData?.dnsStatus)}
              </span>
              <span className={getStatusColor(diagnosticData?.sslStatus)}>
                {getStatusText(diagnosticData?.sslStatus)}
              </span>
              <span className={getStatusColor(diagnosticData?.apiStatus)}>
                {getStatusText(diagnosticData?.apiStatus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Site Accessibility Alert */}
      {(diagnosticData?.siteStatus === 'offline' || diagnosticData?.dnsStatus === 'redirect_active') && (
        <div className="bg-yellow-900/30 border-b border-yellow-500/30 px-6 py-4">
          <div className="container mx-auto">
            <div className="flex items-start gap-4">
              <div className="text-yellow-400 text-2xl">⚠️</div>
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2">PROBLÈME DÉTECTÉ</h3>
                <div className="space-y-2 text-sm">
                  {diagnosticData?.siteStatus === 'offline' && (
                    <p className="text-red-300">
                      • <strong>Site inaccessible:</strong> trading-mvp.com ne répond pas
                    </p>
                  )}
                  {diagnosticData?.dnsStatus === 'redirect_active' && (
                    <p className="text-yellow-300">
                      • <strong>Redirection active:</strong> Vous êtes sur {window?.location?.hostname}
                    </p>
                  )}
                  <p className="text-blue-300">
                    • <strong>Actions recommandées:</strong> Vérifier DNS, SSL, reverse proxy, conteneurs Docker
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative">
        <AppImage 
          src="/assets/images/Plaquette_trading-mvp-1758903095684.jpg" 
          alt="Trading MVP Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        
        <div className="relative z-10 container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                trading-mvp.com
                {diagnosticData?.dnsStatus === 'redirect_active' && (
                  <span className="text-yellow-400 text-lg ml-2">
                    (via {window?.location?.hostname})
                  </span>
                )}
              </h1>
              <p className="text-xl text-blue-200">
                Meta-Orchestrateur IA • Registry multi-stratégies • Bus Monitor live
              </p>
              {diagnosticData?.siteStatus === 'offline' && (
                <p className="text-red-300 text-sm mt-2 font-medium">
                  ⚡ Mode diagnostic activé - Site principal inaccessible
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-blue-200 text-lg">{currentDate}</span>
              <div className="text-xs text-gray-400 mt-1">
                Build: {process?.env?.NODE_ENV || 'production'}
              </div>
            </div>
          </div>

          {/* Emergency Diagnostic Panel */}
          <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🔧 DIAGNOSTIC TECHNIQUE COMPLET
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Status Site Principal</h4>
                <div className={`text-sm ${getStatusColor(diagnosticData?.siteStatus)}`}>
                  {getStatusText(diagnosticData?.siteStatus)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  https://trading-mvp.com
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Résolution DNS</h4>
                <div className={`text-sm ${getStatusColor(diagnosticData?.dnsStatus)}`}>
                  {getStatusText(diagnosticData?.dnsStatus)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {window?.location?.hostname}
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Certificat SSL</h4>
                <div className={`text-sm ${getStatusColor(diagnosticData?.sslStatus)}`}>
                  {getStatusText(diagnosticData?.sslStatus)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {window?.location?.protocol}
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">API Backend</h4>
                <div className={`text-sm ${getStatusColor(diagnosticData?.apiStatus)}`}>
                  {getStatusText(diagnosticData?.apiStatus)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Health endpoint
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-slate-600/30">
              <h4 className="font-medium text-white mb-3">Actions Rapides</h4>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => window?.open('https://trading-mvp.com', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  🔗 Test Site Principal
                </button>
                <button 
                  onClick={() => window?.location?.reload()}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  🔄 Recharger
                </button>
                <button 
                  onClick={() => console.log('Diagnostic Data:', diagnosticData)}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  🔍 Console Log
                </button>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              <ValuePropositionPanel />
              <KeyFeaturesPanel />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <IntegrationDeploymentPanel />
              <KPITargetsPanel />
              <ContactPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}