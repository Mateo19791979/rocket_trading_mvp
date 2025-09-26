import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ibkrService } from '../../services/ibkrService';

const IBKRConnectionStatus = ({ 
  showDetails = true, 
  onConnectionChange = () => {},
  className = ""
}) => {
  const { user } = useAuth();
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const loadConnection = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const connectionData = await ibkrService?.getConnection(user?.id);
      setConnection(connectionData);
      onConnectionChange?.(connectionData);
    } catch (error) {
      console.log('Erreur chargement connexion IBKR:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!connection) return;

    try {
      setTesting(true);
      const result = await ibkrService?.testConnection({
        host: connection?.host,
        tradingMode: connection?.trading_mode,
        timeoutSeconds: connection?.connection_settings?.timeout_seconds
      });

      if (result?.status === 'connected') {
        await ibkrService?.updateConnectionStatus(
          connection?.id, 
          'connected', 
          null, 
          result?.latency
        );
        await loadConnection(); // Refresh data
      }
    } catch (error) {
      await ibkrService?.updateConnectionStatus(
        connection?.id, 
        'error', 
        error?.message
      );
      await loadConnection(); // Refresh data
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    loadConnection();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadConnection, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-muted-foreground font-body">
          Chargement statut IBKR...
        </span>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-3 h-3 rounded-full bg-muted-foreground/30"></div>
        <span className="text-sm text-muted-foreground font-body">
          IBKR non configuré
        </span>
      </div>
    );
  }

  const getStatusDisplay = () => {
    switch (connection?.connection_status) {
      case 'connected':
        return {
          color: 'bg-success',
          text: 'Connecté',
          textColor: 'text-success'
        };
      case 'connecting':
        return {
          color: 'bg-warning',
          text: 'Connexion...',
          textColor: 'text-warning'
        };
      case 'error':
        return {
          color: 'bg-error',
          text: 'Erreur',
          textColor: 'text-error'
        };
      case 'timeout':
        return {
          color: 'bg-error',
          text: 'Timeout',
          textColor: 'text-error'
        };
      default:
        return {
          color: 'bg-muted-foreground',
          text: 'Déconnecté',
          textColor: 'text-muted-foreground'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${status?.color} ${
            connection?.connection_status === 'connected' ? 'animate-pulse' : ''
          }`}></div>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${status?.textColor} font-body`}>
              IBKR Gateway - {status?.text}
            </span>
            {showDetails && (
              <span className="text-xs text-muted-foreground font-data">
                Mode: {connection?.trading_mode === 'paper' ? 'Paper Trading' : 'Live Trading'} 
                • Port: {connection?.port}
                {connection?.latency_ms && ` • ${connection?.latency_ms}ms`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {connection?.connection_status === 'connected' && (
            <div className="px-2 py-1 bg-success/20 text-success rounded text-xs font-medium font-data">
              {connection?.trading_mode?.toUpperCase()}
            </div>
          )}
          
          <button
            onClick={testConnection}
            disabled={testing}
            className="px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/30 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Test...</span>
              </div>
            ) : (
              'Tester'
            )}
          </button>
        </div>
      </div>

      {showDetails && connection?.last_error && (
        <div className="mt-2 p-2 bg-error/10 border border-error/30 rounded text-xs text-error font-body">
          <strong>Erreur:</strong> {connection?.last_error}
        </div>
      )}

      {showDetails && connection?.last_connected_at && (
        <div className="mt-2 text-xs text-muted-foreground font-data">
          Dernière connexion: {new Date(connection?.last_connected_at)?.toLocaleString('fr-FR')}
        </div>
      )}
    </div>
  );
};

export default IBKRConnectionStatus;