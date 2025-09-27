import React, { useState, useEffect } from 'react';
import { Lock, FileText, AlertTriangle, Eye, Shield, Clock } from 'lucide-react';

const SecurityLoggingPanel = () => {
  const [securityStats, setSecurityStats] = useState({
    totalSessions: 0,
    activeConversations: 0,
    loggedDecisions: 0,
    securityAlerts: 0,
    lastAudit: null
  });
  
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSecurityData = () => {
    try {
      // Mock security statistics
      const mockStats = {
        totalSessions: Math.floor(Math.random() * 500) + 1200,
        activeConversations: Math.floor(Math.random() * 20) + 5,
        loggedDecisions: Math.floor(Math.random() * 2000) + 8500,
        securityAlerts: Math.floor(Math.random() * 3),
        lastAudit: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      };
      
      setSecurityStats(mockStats);

      // Mock recent logs
      const mockLogs = [
        {
          id: 1,
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: 'conversation',
          message: 'Nouvelle conversation avec Chef Orchestrateur',
          user: 'john.trader@tradingai.com',
          status: 'success'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 12 * 60 * 1000),
          type: 'decision',
          message: 'Décision d\'allocation validée - Portfolio Tech',
          user: 'admin@tradingai.com', 
          status: 'logged'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 18 * 60 * 1000),
          type: 'security',
          message: 'Tentative d\'accès non autorisé bloquée',
          user: 'unknown',
          status: 'blocked'
        },
        {
          id: 4,
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          type: 'audit',
          message: 'Audit de sécurité automatique complété',
          user: 'system',
          status: 'completed'
        },
        {
          id: 5,
          timestamp: new Date(Date.now() - 35 * 60 * 1000),
          type: 'conversation',
          message: 'Session avec Chef Risque - Analyse VaR',
          user: 'trader@tradingai.com',
          status: 'success'
        }
      ];

      setRecentLogs(mockLogs);
      setLoading(false);
    } catch (error) {
      console.error('Error loading security data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
    
    // Update data every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (date) => {
    return date?.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit'
    }) || '';
  };

  const getLogIcon = (type) => {
    const icons = {
      conversation: Eye,
      decision: FileText,
      security: AlertTriangle,
      audit: Shield
    };
    return icons?.[type] || FileText;
  };

  const getStatusColor = (status) => {
    const colors = {
      success: 'text-green-400',
      logged: 'text-blue-400',
      blocked: 'text-red-400',
      completed: 'text-purple-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getStatusBackground = (status) => {
    const backgrounds = {
      success: 'bg-green-900 bg-opacity-30',
      logged: 'bg-blue-900 bg-opacity-30',
      blocked: 'bg-red-900 bg-opacity-30',
      completed: 'bg-purple-900 bg-opacity-30'
    };
    return backgrounds?.[status] || 'bg-gray-900 bg-opacity-30';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-teal-400 mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Sécurité & journalisation
        </h2>
        <div className="text-gray-300">Chargement des données de sécurité...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold text-teal-400 mb-4 flex items-center">
        <Lock className="w-5 h-5 mr-2" />
        Sécurité & journalisation
      </h2>
      {/* Security Features */}
      <div className="space-y-4 mb-6">
        <div className="p-3 bg-green-900 bg-opacity-20 rounded-lg border border-green-700">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-4 h-4 text-green-400" />
            <span className="font-medium text-green-200">Lecture seule (pas d'ordres)</span>
          </div>
          <p className="text-xs text-green-300">
            Mode sécurisé activé. Aucune exécution d'ordres de trading possible via l'interface chat.
          </p>
        </div>

        <div className="p-3 bg-blue-900 bg-opacity-20 rounded-lg border border-blue-700">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-blue-200">Journal des conversations & décisions</span>
          </div>
          <p className="text-xs text-blue-300">
            Toutes les interactions et décisions sont automatiquement enregistrées et auditées.
          </p>
        </div>

        <div className="p-3 bg-orange-900 bg-opacity-20 rounded-lg border border-orange-700">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="font-medium text-orange-200">Mode confirmation pour actions risquées</span>
          </div>
          <p className="text-xs text-orange-300">
            Double validation requise pour les actions à impact élevé sur le système.
          </p>
        </div>
      </div>
      {/* Security Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-700 bg-opacity-50 rounded-lg">
          <div className="text-2xl font-bold text-white">{securityStats?.totalSessions?.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Sessions totales</div>
        </div>
        <div className="text-center p-3 bg-gray-700 bg-opacity-50 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{securityStats?.activeConversations}</div>
          <div className="text-xs text-gray-400">Conversations actives</div>
        </div>
        <div className="text-center p-3 bg-gray-700 bg-opacity-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{securityStats?.loggedDecisions?.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Décisions loggées</div>
        </div>
        <div className="text-center p-3 bg-gray-700 bg-opacity-50 rounded-lg">
          <div className="text-2xl font-bold text-red-400">{securityStats?.securityAlerts}</div>
          <div className="text-xs text-gray-400">Alertes sécurité</div>
        </div>
      </div>
      {/* Recent Activity Log */}
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Activité récente
        </h3>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentLogs?.map((log) => {
            const LogIcon = getLogIcon(log?.type);
            
            return (
              <div
                key={log?.id}
                className={`p-3 rounded border-l-4 ${getStatusBackground(log?.status)} ${
                  log?.status === 'success' ? 'border-l-green-400' :
                  log?.status === 'logged' ? 'border-l-blue-400' :
                  log?.status === 'blocked'? 'border-l-red-400' : 'border-l-purple-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <LogIcon className={`w-4 h-4 mt-0.5 ${getStatusColor(log?.status)}`} />
                    <div>
                      <p className="text-sm text-white font-medium">{log?.message}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                        <span>{log?.user}</span>
                        <span>•</span>
                        <span>{formatTimestamp(log?.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Last Audit Info */}
      <div className="mt-4 p-3 bg-purple-900 bg-opacity-20 rounded-lg">
        <p className="text-xs text-purple-200">
          🔍 <strong>Dernier audit :</strong> {securityStats?.lastAudit ? 
            securityStats?.lastAudit?.toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'En cours...'
          }
        </p>
      </div>
    </div>
  );
};

export default SecurityLoggingPanel;