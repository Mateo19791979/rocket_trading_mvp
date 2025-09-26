import React, { useState, useEffect } from 'react';
import { Puzzle, Plug, Settings, BarChart3, Copy, ExternalLink } from 'lucide-react';
import Header from '../../components/ui/Header';
import RecommendedWidgetsPanel from './components/RecommendedWidgetsPanel';
import EndpointsConfigurationPanel from './components/EndpointsConfigurationPanel';
import QuickIntegrationPanel from './components/QuickIntegrationPanel';
import FrontendKPIsPanel from './components/FrontendKPIsPanel';
import Icon from '../../components/AppIcon';


const RocketNewIntegrationHub = () => {
  const [activeItem, setActiveItem] = useState('rocket-new-integration-hub');
  const [integrationStatus, setIntegrationStatus] = useState({
    widgets: false,
    endpoints: false,
    integration: false,
    kpis: false
  });

  useEffect(() => {
    // Simulate loading integration status
    const timer = setTimeout(() => {
      setIntegrationStatus({
        widgets: true,
        endpoints: true,
        integration: false,
        kpis: false
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getCurrentDate = () => {
    return new Date()?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900">
      <Header activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Intégration Rocket.new
          </h1>
          <p className="text-xl text-orange-100 mb-4">
            Widgets & endpoints à connecter au site trading-mvp.com
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-orange-100">
            <Settings className="w-5 h-5 mr-2" />
            {getCurrentDate()}
          </div>
        </div>

        {/* Integration Status Overview */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'widgets', label: 'Widgets recommandés', icon: Puzzle },
            { key: 'endpoints', label: 'Endpoints API', icon: Plug },
            { key: 'integration', label: 'Intégration rapide', icon: Settings },
            { key: 'kpis', label: 'KPI front', icon: BarChart3 }
          ]?.map(({ key, label, icon: Icon }) => (
            <div key={key} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="w-5 h-5 text-white mr-2" />
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  integrationStatus?.[key] ? 'bg-teal-400' : 'bg-orange-400'
                } animate-pulse`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <RecommendedWidgetsPanel />
            <EndpointsConfigurationPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <QuickIntegrationPanel />
            <FrontendKPIsPanel />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button className="flex items-center px-6 py-3 bg-white text-orange-700 font-semibold rounded-lg hover:bg-orange-50 transition-colors">
            <ExternalLink className="w-5 h-5 mr-2" />
            Ouvrir Rocket.new
          </button>
          <button className="flex items-center px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors">
            <Copy className="w-5 h-5 mr-2" />
            Copier Configuration
          </button>
        </div>

        {/* Image Reference from Assets */}
        <div className="mt-8 text-center">
          <img 
            src="/assets/images/Plaquette_3_Rocket_Integration_Clair-1758905224380.jpg" 
            alt="Rocket Integration Reference" 
            className="mx-auto max-w-full h-auto rounded-lg border border-white/20 shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default RocketNewIntegrationHub;