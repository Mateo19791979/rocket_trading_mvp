import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertTriangle, CheckCircle, Activity, Globe, RefreshCcw } from 'lucide-react';
import { useNetworkStatus } from '../../services/networkRecoveryService';
import { useNavigate } from 'react-router-dom';

export default function NetworkStabilityBanner() {
  const networkStatus = useNetworkStatus();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastOfflineTime, setLastOfflineTime] = useState(null);

  // Show banner when offline or connection issues detected
  useEffect(() => {
    const shouldShowBanner = !networkStatus?.isOnline || 
                            networkStatus?.networkState === 'critical' ||
                            networkStatus?.networkState === 'degraded';
    
    setShowBanner(shouldShowBanner);
    
    // Track offline time
    if (!networkStatus?.isOnline && !lastOfflineTime) {
      setLastOfflineTime(new Date());
    } else if (networkStatus?.isOnline && lastOfflineTime) {
      setLastOfflineTime(null);
    }
  }, [networkStatus?.isOnline, networkStatus?.networkState, lastOfflineTime]);

  // Auto-redirect to offline center if offline for too long
  useEffect(() => {
    if (!networkStatus?.isOnline && lastOfflineTime) {
      const offlineDuration = (Date.now() - lastOfflineTime?.getTime()) / 1000;
      
      // Redirect to offline center after 30 seconds of being offline
      if (offlineDuration > 30) {
        console.log('🚨 Extended offline detected - redirecting to offline recovery center');
        navigate('/offline-recovery-center');
      }
    }
  }, [networkStatus?.isOnline, lastOfflineTime, navigate]);

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      await networkStatus?.retryConnection();
    } catch (error) {
      console.error('Retry failed:', error);
    }
    setTimeout(() => setIsRetrying(false), 2000);
  };

  const handleGoToOfflineCenter = () => {
    navigate('/offline-recovery-center');
  };

  const getBannerStyle = () => {
    if (!networkStatus?.isOnline) {
      return 'bg-red-500 border-red-600';
    } else if (networkStatus?.networkState === 'critical') {
      return 'bg-red-400 border-red-500';  
    } else if (networkStatus?.networkState === 'degraded') {
      return 'bg-yellow-500 border-yellow-600';
    }
    return 'bg-green-500 border-green-600';
  };

  const getBannerIcon = () => {
    if (!networkStatus?.isOnline) {
      return <WifiOff size={20} className="text-white animate-pulse" />;
    } else if (networkStatus?.networkState === 'critical') {
      return <AlertTriangle size={20} className="text-white animate-pulse" />;
    } else if (networkStatus?.networkState === 'degraded') {
      return <Wifi size={20} className="text-white" />;
    }
    return <CheckCircle size={20} className="text-white" />;
  };

  const getBannerMessage = () => {
    if (!networkStatus?.isOnline) {
      const duration = lastOfflineTime ? 
        Math.round((Date.now() - lastOfflineTime?.getTime()) / 1000) : 0;
      return `Vous êtes hors ligne depuis ${duration}s - Fonctionnalités limitées`;
    } else if (networkStatus?.networkState === 'critical') {
      return 'Connexion très lente détectée - Performance dégradée';
    } else if (networkStatus?.networkState === 'degraded') {
      return 'Connexion lente - Chargement peut être plus long';
    }
    return 'Connexion rétablie';
  };

  if (!showBanner && networkStatus?.isOnline) {
    return null;
  }

  return (
    <div className={`${getBannerStyle()} border-2 rounded-lg p-3 mb-4 shadow-lg animate-fade-in`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getBannerIcon()}
          <div className="flex-1">
            <div className="text-white font-semibold">
              {getBannerMessage()}
            </div>
            {!networkStatus?.isOnline && (
              <div className="text-white text-sm opacity-90">
                Tentatives automatiques: {networkStatus?.retryAttempts}/{networkStatus?.maxRetryAttempts}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!networkStatus?.isOnline && (
            <>
              <button
                onClick={handleRetryConnection}
                disabled={isRetrying}
                className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white 
                         rounded-lg transition-all duration-300 flex items-center space-x-1
                         disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isRetrying ? (
                  <Activity size={14} className="animate-spin" />
                ) : (
                  <RefreshCcw size={14} />
                )}
                <span>{isRetrying ? 'Retry...' : 'Retry'}</span>
              </button>
              
              <button
                onClick={handleGoToOfflineCenter}
                className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-300 flex items-center space-x-1 text-sm"
              >
                <Globe size={14} />
                <span>Help</span>
              </button>
            </>
          )}
          
          <button
            onClick={() => setShowBanner(false)}
            className="text-white hover:text-gray-200 transition-colors duration-300"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}