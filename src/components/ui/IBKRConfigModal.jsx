import React, { useState, useEffect } from 'react';
import { X, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ibkrService } from '../../services/ibkrService';

const IBKRConfigModal = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tradingMode: 'paper',
    host: '127.0.0.1',
    clientId: 42,
    autoConnect: false,
    timeoutSeconds: 10,
    retryAttempts: 3
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Load existing connection data
  const loadExistingConnection = async () => {
    if (!user?.id) return;

    try {
      const connection = await ibkrService?.getConnection(user?.id);
      if (connection) {
        setFormData({
          tradingMode: connection?.trading_mode || 'paper',
          host: connection?.host || '127.0.0.1',
          clientId: connection?.client_id || 42,
          autoConnect: connection?.connection_settings?.auto_connect || false,
          timeoutSeconds: connection?.connection_settings?.timeout_seconds || 10,
          retryAttempts: connection?.connection_settings?.retry_attempts || 3
        });
      }
    } catch (error) {
      console.log('Erreur chargement configuration IBKR:', error?.message);
    }
  };

  // Test connection
  const testConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      const result = await ibkrService?.testConnection({
        host: formData?.host,
        tradingMode: formData?.tradingMode,
        timeoutSeconds: formData?.timeoutSeconds
      });

      setTestResult({
        success: true,
        message: `Connexion réussie! Latence: ${result?.latency}ms`,
        latency: result?.latency
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error?.message
      });
    } finally {
      setTesting(false);
    }
  };

  // Save configuration
  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      const connection = await ibkrService?.saveConnection(user?.id, formData);
      
      onSave?.(connection);
      onClose?.();
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erreur sauvegarde: ${error?.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadExistingConnection();
    }
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground font-heading">
              Configuration IBKR Gateway
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              Configurez votre connexion Interactive Brokers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Trading Mode */}
          <div>
            <label className="block text-sm font-medium text-foreground font-body mb-2">
              Mode de Trading
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tradingMode: 'paper' }))}
                className={`p-4 border rounded-xl text-left transition-all ${
                  formData?.tradingMode === 'paper' ?'border-primary bg-primary/10 text-primary' :'border-border hover:border-border text-foreground'
                }`}
              >
                <div className="font-medium font-body">Paper Trading</div>
                <div className="text-xs text-muted-foreground font-data">
                  Port 7497 • Mode simulation
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tradingMode: 'live' }))}
                className={`p-4 border rounded-xl text-left transition-all ${
                  formData?.tradingMode === 'live' ?'border-error bg-error/10 text-error' :'border-border hover:border-border text-foreground'
                }`}
              >
                <div className="font-medium font-body">Live Trading</div>
                <div className="text-xs text-muted-foreground font-data">
                  Port 7496 • Argent réel ⚠️
                </div>
              </button>
            </div>
          </div>

          {/* Connection Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground font-body mb-2">
                Host
              </label>
              <input
                type="text"
                value={formData?.host}
                onChange={(e) => setFormData(prev => ({ ...prev, host: e?.target?.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-data"
                placeholder="127.0.0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground font-body mb-2">
                Client ID
              </label>
              <input
                type="number"
                value={formData?.clientId}
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: parseInt(e?.target?.value) }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-data"
                placeholder="42"
                min="1"
                max="999999"
              />
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground font-heading">
              Paramètres Avancés
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground font-body mb-2">
                  Timeout (secondes)
                </label>
                <input
                  type="number"
                  value={formData?.timeoutSeconds}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeoutSeconds: parseInt(e?.target?.value) }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-data"
                  min="5"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground font-body mb-2">
                  Tentatives de reconnexion
                </label>
                <input
                  type="number"
                  value={formData?.retryAttempts}
                  onChange={(e) => setFormData(prev => ({ ...prev, retryAttempts: parseInt(e?.target?.value) }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-data"
                  min="0"
                  max="10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoConnect"
                checked={formData?.autoConnect}
                onChange={(e) => setFormData(prev => ({ ...prev, autoConnect: e?.target?.checked }))}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
              <label htmlFor="autoConnect" className="text-sm text-foreground font-body">
                Connexion automatique au démarrage
              </label>
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-primary font-body">
                <div className="font-medium mb-2">Prérequis IBKR Gateway:</div>
                <ul className="space-y-1 text-xs font-data">
                  <li>• TWS ou IB Gateway doit être démarré</li>
                  <li>• Activer "Enable ActiveX and Socket Clients" dans la configuration</li>
                  <li>• Ajouter 127.0.0.1 dans les IPs de confiance</li>
                  <li>• Utiliser le port {formData?.tradingMode === 'live' ? '7496' : '7497'} pour {formData?.tradingMode === 'live' ? 'live' : 'paper'} trading</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test Connection */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <AlertTriangle size={20} className="text-warning" />
              <span className="text-sm text-foreground font-body">
                Testez la connexion avant de sauvegarder
              </span>
            </div>
            <button
              onClick={testConnection}
              disabled={testing}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
            >
              {testing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Test en cours...</span>
                </div>
              ) : (
                'Tester la connexion'
              )}
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-4 rounded-xl border ${
              testResult?.success 
                ? 'bg-success/10 border-success/30 text-success' :'bg-error/10 border-error/30 text-error'
            }`}>
              <div className="font-medium font-body">
                {testResult?.success ? '✅ Test réussi' : '❌ Test échoué'}
              </div>
              <div className="text-sm font-data mt-1">
                {testResult?.message}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-body"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Sauvegarde...</span>
              </div>
            ) : (
              'Sauvegarder'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IBKRConfigModal;