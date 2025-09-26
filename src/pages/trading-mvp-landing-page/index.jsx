import React from 'react';
import AppImage from '../../components/AppImage';
import ValuePropositionPanel from './components/ValuePropositionPanel';
import KeyFeaturesPanel from './components/KeyFeaturesPanel';
import IntegrationDeploymentPanel from './components/IntegrationDeploymentPanel';
import KPITargetsPanel from './components/KPITargetsPanel';
import ContactPanel from './components/ContactPanel';

export default function TradingMVPLandingPage() {
  const currentDate = new Date()?.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 text-white">
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
              </h1>
              <p className="text-xl text-blue-200">
                Meta-Orchestrateur IA • Registry multi-stratégies • Bus Monitor live
              </p>
            </div>
            <div className="text-right">
              <span className="text-blue-200 text-lg">{currentDate}</span>
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