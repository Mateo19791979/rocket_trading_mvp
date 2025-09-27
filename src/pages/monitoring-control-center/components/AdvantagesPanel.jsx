import React from 'react';
import { Eye, Zap, Link, Award, TrendingUp, Clock, Shield, CheckCircle, Wifi, Globe, Settings, BarChart3 } from 'lucide-react';

const AdvantagesPanel = ({ data }) => {
  const transparency = data?.transparency || { level: 'hedge_fund', compliance: 'institutional_grade' };
  const realTime = data?.realTime || { latency: '<400ms', updateFrequency: '1s' };
  const apiIntegration = data?.apiIntegration || { endpoints: 15, extensions: 'unlimited' };
  const professional = data?.professional || { uptime: '99.8%', reliability: 'enterprise_grade' };

  const advantages = [
    {
      icon: <Eye className="w-5 h-5 text-blue-400" />,
      title: "Transparence type hedge fund",
      description: "Standards de reporting institutionnels",
      details: [
        `Niveau: ${transparency?.level === 'hedge_fund' ? 'Hedge Fund' : transparency?.level}`,
        `Conformité: ${transparency?.compliance === 'institutional_grade' ? 'Grade Institutionnel' : transparency?.compliance}`,
        "Audit trail complet",
        "Reporting professionnel"
      ],
      color: "border-blue-500"
    },
    {
      icon: <Zap className="w-5 h-5 text-teal-400" />,
      title: "Suivi temps réel → décisions rapides",
      description: "Capacités de réponse immédiate",
      details: [
        `Latence: ${realTime?.latency}`,
        `Mise à jour: ${realTime?.updateFrequency}`,
        "Données live",
        "Réactivité immédiate"
      ],
      color: "border-teal-500"
    },
    {
      icon: <Link className="w-5 h-5 text-orange-400" />,
      title: "Intégration API → extension facile",
      description: "Connectivité seamless et scalabilité",
      details: [
        `Endpoints: ${apiIntegration?.endpoints}`,
        `Extensions: ${apiIntegration?.extensions === 'unlimited' ? 'Illimitées' : apiIntegration?.extensions}`,
        "Connexions tierces",
        "Scalabilité enterprise"
      ],
      color: "border-orange-500"
    },
    {
      icon: <Award className="w-5 h-5 text-green-400" />,
      title: "Conforme aux pratiques pro (reporting, audit)",
      description: "Standards professionnels et fiabilité",
      details: [
        `Uptime: ${professional?.uptime}`,
        `Fiabilité: ${professional?.reliability === 'enterprise_grade' ? 'Grade Entreprise' : professional?.reliability}`,
        "Monitoring 24/7",
        "Support institutionnel"
      ],
      color: "border-green-500"
    }
  ];

  const keyMetrics = [
    {
      label: "Temps de Réponse",
      value: realTime?.latency || "<400ms",
      icon: <Clock className="w-4 h-4" />,
      status: "excellent"
    },
    {
      label: "Disponibilité",
      value: professional?.uptime || "99.8%",
      icon: <Shield className="w-4 h-4" />,
      status: "excellent"
    },
    {
      label: "Connexions API",
      value: apiIntegration?.endpoints || "15+",
      icon: <Globe className="w-4 h-4" />,
      status: "good"
    },
    {
      label: "Conformité",
      value: "Institutionnelle",
      icon: <CheckCircle className="w-4 h-4" />,
      status: "excellent"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-900/20';
      case 'good': return 'text-blue-400 bg-blue-900/20';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-700/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 gap-4">
        {keyMetrics?.map((metric, idx) => (
          <div key={idx} className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">{metric?.value}</div>
                <div className="text-sm text-gray-400">{metric?.label}</div>
              </div>
              <div className={`p-2 rounded ${getStatusColor(metric?.status)}`}>
                {metric?.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Detailed Advantages */}
      <div className="space-y-4">
        {advantages?.map((advantage, idx) => (
          <div key={idx} className={`bg-gray-700/50 rounded-lg p-4 border-l-4 ${advantage?.color}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {advantage?.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white mb-1">
                  {advantage?.title}
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  {advantage?.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {advantage?.details?.map((detail, detailIdx) => (
                    <div key={detailIdx} className="flex items-center space-x-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                      <span className="text-gray-300 truncate">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* System Capabilities */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Settings className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-gray-300">Capacités Système</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Data Streaming:</span>
              <span className="text-green-400">✓ Temps réel</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Auto-scaling:</span>
              <span className="text-green-400">✓ Adaptatif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Multi-asset:</span>
              <span className="text-green-400">✓ Supporté</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Risk Management:</span>
              <span className="text-green-400">✓ Avancé</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Backup & Recovery:</span>
              <span className="text-green-400">✓ Automatique</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Monitoring:</span>
              <span className="text-green-400">✓ 24/7</span>
            </div>
          </div>
        </div>
      </div>
      {/* Competitive Advantages */}
      <div className="bg-gradient-to-r from-blue-900/20 to-teal-900/20 rounded-lg p-4 border border-blue-700/30">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-blue-300">Avantages Concurrentiels</h4>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <Wifi className="w-3 h-3 text-teal-400" />
            <span className="text-gray-300">Latence ultra-faible (&lt; 400ms garantie)</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-3 h-3 text-blue-400" />
            <span className="text-gray-300">Analytics prédictifs intégrés</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-gray-300">Sécurité de niveau bancaire</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-orange-400" />
            <span className="text-gray-300">Conformité réglementaire automatique</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvantagesPanel;