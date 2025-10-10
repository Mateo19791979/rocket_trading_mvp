import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API } from "@/lib/apiBase";
import { getTradingAudit } from "@/lib/jsonFetch";

const TradingAuditLogs = () => {
  const { isMockMode } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuditLogs = async () => {
    if (loading) return; // Prevent duplicate calls
    
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching trading audit logs with fallback...');

      const result = await getTradingAudit();
      
      console.log('✅ Trading audit logs loaded:', result?.length || 0, 'entries');
      setAuditLogs(result || []);

    } catch (err) {
      console.error('❌ Trading audit fetch failed:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const getSeverityColor = (action) => {
    if (action?.includes('ERROR') || action?.includes('FAIL')) return 'text-red-600';
    if (action?.includes('CREATE') || action?.includes('BUY') || action?.includes('SELL')) return 'text-blue-600';
    if (action?.includes('UPDATE') || action?.includes('MODIFY')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getActionIcon = (action) => {
    if (action?.includes('CREATE')) return <FileText className="h-4 w-4" />;
    if (action?.includes('UPDATE') || action?.includes('MODIFY')) return <User className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Chargement des logs d'audit...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Trading Audit</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Live
              </span>
              {isMockMode && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Mode demo
                </span>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              API: {API}/ops/trading-audit
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && !isMockMode && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
            <div className="mt-2 text-xs text-red-600">
              <p>• Verifiez que le serveur backend est en marche</p>
              <p>• Controlez la variable VITE_INTERNAL_ADMIN_KEY</p>
              <p>• Assurez-vous que l'endpoint /ops/trading-audit est implemente</p>
            </div>
          </div>
        )}

        {/* Demo Notice */}
        {isMockMode && (
          <div className="px-6 py-3 bg-orange-50 border-b border-orange-200">
            <div className="flex items-center space-x-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Mode demonstration - Donnees simulees pour illustration</span>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {auditLogs?.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <span>Aucune activite recente</span>
              {error && (
                <div className="mt-2 text-xs text-red-600">
                  Backend API non disponible
                </div>
              )}
            </div>
          ) : (
            auditLogs?.map((log, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className={`mt-1 ${getSeverityColor(log?.action)}`}>
                    {getActionIcon(log?.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getSeverityColor(log?.action)}`}>
                          {log?.action}
                        </span>
                        {log?.symbol && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {log?.symbol}
                          </span>
                        )}
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {log?.actor_role}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(log?.ts)?.toLocaleString('fr-FR')}
                      </div>
                    </div>
                    {log?.notes && (
                      <p className="mt-1 text-sm text-gray-600">
                        {log?.notes}
                        {isMockMode && log?.notes?.includes('simulation') && (
                          <span className="text-orange-600 ml-2">(Donnees simulees)</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 text-center">
          <div className="text-xs text-gray-500">
            {auditLogs?.length > 0 && (
              <>
                {auditLogs?.length} evenement{auditLogs?.length > 1 ? 's' : ''} recent{auditLogs?.length > 1 ? 's' : ''}
                {isMockMode && <span className="text-orange-600 ml-2">(Mode demonstration)</span>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingAuditLogs;