import React from 'react';
import { AlertTriangle, Shield, Globe, Server, FileText, Zap } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function ProbableCausesPanel({ diagnosticResults }) {
  const causes = [
    {
      id: 'cors',
      icon: Shield,
      title: 'CORS bloqué',
      description: 'Erreurs dans la console Rocket - Origin mismatch',
      status: diagnosticResults?.corsStatus,
      severity: 'critical',
      quickFix: 'Ajouter trading-mvp.com aux origins autorisées'
    },
    {
      id: 'https',
      icon: Globe,
      title: 'HTTPS/DNS pas OK',
      description: 'Certificat Let\'s Encrypt/Traefik non configuré',
      status: diagnosticResults?.httpsStatus,
      severity: 'high',
      quickFix: 'Vérifier DNS et certificats SSL'
    },
    {
      id: 'traefik',
      icon: Server,
      title: 'Règle Traefik',
      description: 'Host ne match pas exactement api.trading-mvp.com',
      status: diagnosticResults?.traefikStatus,
      severity: 'high',
      quickFix: 'Corriger les labels Traefik'
    },
    {
      id: 'api',
      icon: Zap,
      title: 'API down/port',
      description: 'Backend pas exposé sur 8080, service KO',
      status: diagnosticResults?.apiStatus,
      severity: 'critical',
      quickFix: 'Redémarrer le service backend'
    },
    {
      id: 'schema',
      icon: FileText,
      title: 'Schéma JSON différent',
      description: 'Widget reçoit un format inattendu',
      status: diagnosticResults?.schemaStatus,
      severity: 'medium',
      quickFix: 'Adapter le format de réponse'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-900/30';
      case 'high': return 'border-orange-500 bg-orange-900/30';
      case 'medium': return 'border-yellow-500 bg-yellow-900/30';
      default: return 'border-gray-500 bg-gray-900/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'OK';
      case 'warning': return 'ATTENTION';
      case 'error': return 'ERREUR';
      default: return 'TEST EN COURS';
    }
  };

  return (
    <div className="bg-red-800/30 backdrop-blur-sm border border-red-600 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-red-400" />
        <h2 className="text-xl font-bold">Top 5 Causes Probables</h2>
      </div>
      <div className="space-y-4">
        {causes?.map((cause) => {
          const Icon = cause?.icon;
          return (
            <div
              key={cause?.id}
              className={`p-4 rounded-lg border-2 ${getSeverityColor(cause?.severity)} transition-all hover:bg-opacity-50`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-white" />
                  <h3 className="font-semibold text-white">{cause?.title}</h3>
                </div>
                <div className={`text-sm font-medium ${getStatusColor(cause?.status)}`}>
                  {getStatusText(cause?.status)}
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-3">{cause?.description}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  cause?.severity === 'critical' ? 'bg-red-600 text-white' :
                  cause?.severity === 'high'? 'bg-orange-600 text-white' : 'bg-yellow-600 text-black'
                }`}>
                  {cause?.severity?.toUpperCase()}
                </span>
                
                <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors">
                  Fix rapide
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                💡 {cause?.quickFix}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}