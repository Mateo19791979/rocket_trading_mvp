import React, { useState, useEffect } from 'react';
import AppImage from '../../components/AppImage';
import { Play, Pause, Calendar } from 'lucide-react';
import OptionAPanel from './components/OptionAPanel';
import OptionBPanel from './components/OptionBPanel';
import JsonContractPanel from './components/JsonContractPanel';
import ActionPlanPanel from './components/ActionPlanPanel';

export default function RegistryDualStreamsVsFusion() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);
  const [activeTab, setActiveTab] = useState('private');
  const [registryData, setRegistryData] = useState({
    private: [],
    open: [],
    status: 'loading'
  });

  // Mock data for demonstration
  const mockPrivateData = [
    { "name": "Bollinger_RSI_Contrarian", "category": "mean_reversion" },
    { "name": "Momentum_MA_Crossover", "category": "trend" },
    { "name": "PDF_Strategy_Alpha", "category": "alpha_generation" }
  ];

  const mockOpenData = [
    { "name": "ArXiv_Pattern_Recognition", "category": "pattern_analysis" },
    { "name": "SSRN_Risk_Parity", "category": "risk_management" },
    { "name": "OpenAccess_Momentum", "category": "trend" }
  ];

  useEffect(() => {
    // Simulate loading data
    const loadData = () => {
      setRegistryData({
        private: mockPrivateData,
        open: mockOpenData,
        status: 'loaded'
      });
    };

    loadData();

    // Auto-refresh timer
    let intervalId;
    if (isAutoRefreshing) {
      intervalId = setInterval(() => {
        setCurrentDate(new Date());
        loadData();
      }, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoRefreshing]);

  const formatDate = (date) => {
    return date?.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 text-white">
      {/* Header avec image de référence */}
      <div className="relative h-64 mb-8">
        <AppImage
          src="/assets/images/Plaquette_Registry_Flux_vs_Fusion-1758912382436.jpg"
          alt="Registry — Deux Flux séparés vs Fusion"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-violet-900/70" />
        <div className="absolute inset-0 flex items-center justify-between px-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white">
              Registry — Deux Flux séparés vs Fusion
            </h1>
            <p className="text-xl text-teal-300 mb-4">
              Rendre le système stable maintenant, simple à fusionner plus tard
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Calendar className="w-4 h-4" />
              {formatDate(currentDate)}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsAutoRefreshing(!isAutoRefreshing)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                isAutoRefreshing
                  ? 'border-teal-500 bg-teal-500/20 text-teal-300' :'border-gray-500 bg-gray-500/20 text-gray-300'
              }`}
            >
              {isAutoRefreshing ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <div className="flex bg-slate-800/50 rounded-lg border border-slate-600">
              <button
                onClick={() => setActiveTab('private')}
                className={`px-4 py-2 rounded-l-lg transition-all ${
                  activeTab === 'private' ?'bg-orange-600 text-white' :'text-gray-300 hover:text-white'
                }`}
              >
                Private
              </button>
              <button
                onClick={() => setActiveTab('open')}
                className={`px-4 py-2 rounded-r-lg transition-all ${
                  activeTab === 'open' ?'bg-teal-600 text-white' :'text-gray-300 hover:text-white'
                }`}
              >
                Open
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Colonne Gauche - Option A */}
          <div>
            <OptionAPanel 
              registryData={registryData}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Colonne Droite - Option B */}
          <div>
            <OptionBPanel />
          </div>
        </div>

        {/* Bottom Section - Two Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contrat JSON */}
          <div>
            <JsonContractPanel />
          </div>

          {/* Plan d'action */}
          <div>
            <ActionPlanPanel />
          </div>
        </div>
      </div>
    </div>
  );
}