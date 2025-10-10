import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Eye } from 'lucide-react';
import paperTradingSecurityService from '../../services/paperTradingSecurityService';

export default function PaperModeBanner() {
  const [brokerMode, setBrokerMode] = useState('paper');
  const [showBanner, setShowBanner] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPaperMode();
  }, []);

  const checkPaperMode = async () => {
    try {
      setIsLoading(true);
      const mode = await paperTradingSecurityService?.getBrokerFlag();
      setBrokerMode(mode);
      
      // Show banner if not in live mode
      setShowBanner(mode !== 'live');
    } catch (error) {
      console.error('Error checking paper mode:', error);
      setBrokerMode('paper');
      setShowBanner(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!showBanner) {
    return null;
  }

  const getBannerConfig = () => {
    switch (brokerMode) {
      case 'mock': case'disabled':
        return {
          icon: Shield,
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          title: 'Mode PAPIER – AUCUN ORDRE RÉEL',
          subtitle: 'Trading désactivé - Mode simulation uniquement'
        };
      case 'paper':
        return {
          icon: Eye,
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          title: 'Mode PAPIER – AUCUN ORDRE RÉEL',
          subtitle: 'Simulation de trading - Toutes les transactions sont virtuelles'
        };
      default:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          title: 'Mode PAPIER – AUCUN ORDRE RÉEL',
          subtitle: 'Mode de trading non reconnu - Sécurité activée'
        };
    }
  };

  const bannerConfig = getBannerConfig();
  const IconComponent = bannerConfig?.icon;

  return (
    <div className={`${bannerConfig?.bgColor} border rounded-lg p-4 mb-6 shadow-sm`}>
      <div className="flex items-center space-x-3">
        <div className={`flex-shrink-0 ${bannerConfig?.iconColor}`}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${bannerConfig?.textColor}`}>
            {bannerConfig?.title}
          </h3>
          <p className={`text-xs ${bannerConfig?.textColor} opacity-80 mt-1`}>
            {bannerConfig?.subtitle}
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowBanner(false)}
            className={`${bannerConfig?.textColor} hover:opacity-75 transition-opacity`}
            aria-label="Fermer la bannière"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {/* Additional info */}
      <div className={`mt-3 text-xs ${bannerConfig?.textColor} opacity-70`}>
        <div className="flex items-center space-x-4">
          <span>• Mode: {brokerMode?.toUpperCase()}</span>
          <span>• Portefeuille virtuel actif</span>
          <span>• KillSwitch opérationnel</span>
        </div>
      </div>
    </div>
  );
}