import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour surveiller l'état du réseau et de la connectivité
 * Remplace les warnings "useNetworkStatus is not implemented yet"
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator?.onLine ?? true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [effectiveType, setEffectiveType] = useState('4g');
  const [downlink, setDownlink] = useState(10);
  const [rtt, setRtt] = useState(50);
  const [saveData, setSaveData] = useState(false);

  // Fonction pour mettre à jour les informations de connexion
  const updateConnectionInfo = useCallback(() => {
    if ('connection' in navigator) {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (conn) {
        setConnectionType(conn?.type || 'unknown');
        setEffectiveType(conn?.effectiveType || '4g');
        setDownlink(conn?.downlink || 10);
        setRtt(conn?.rtt || 50);
        setSaveData(conn?.saveData || false);
      }
    }
  }, []);

  // Gestionnaires d'événements
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    updateConnectionInfo();
  }, [updateConnectionInfo]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  const handleConnectionChange = useCallback(() => {
    updateConnectionInfo();
  }, [updateConnectionInfo]);

  useEffect(() => {
    // État initial
    updateConnectionInfo();

    // Écouter les changements de connectivité
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écouter les changements de type de connexion
    if ('connection' in navigator) {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        conn?.addEventListener('change', handleConnectionChange);
      }
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
          conn?.removeEventListener('change', handleConnectionChange);
        }
      }
    };
  }, [handleOnline, handleOffline, handleConnectionChange, updateConnectionInfo]);

  // Fonction pour tester la connectivité réelle
  const testConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 5000
      });
      return response?.ok;
    } catch (error) {
      console.warn('[NetworkStatus] Connection test failed:', error);
      return false;
    }
  }, []);

  return {
    isOnline,
    connectionType,
    effectiveType,
    downlink,
    rtt,
    saveData,
    testConnection,
    // Helpers calculés
    isSlowConnection: effectiveType === 'slow-2g' || effectiveType === '2g',
    isFastConnection: effectiveType === '4g' || effectiveType === '5g',
    shouldOptimizeForSpeed: saveData || effectiveType === 'slow-2g',
    connectionQuality: (() => {
      if (!isOnline) return 'offline';
      if (effectiveType === '5g') return 'excellent';
      if (effectiveType === '4g') return 'good';
      if (effectiveType === '3g') return 'fair';
      return 'poor';
    })()
  };
}

export default useNetworkStatus;