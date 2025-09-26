import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, TrendingUp, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const OrdersMVPPanel = () => {
  const [validationStatus, setValidationStatus] = useState({
    zodValidation: true,
    quantityThreshold: true,
    marketStatus: false,
    ibkrConnection: true
  });

  const [thresholds, setThresholds] = useState({
    minQuantity: 1,
    maxQuantity: 1000,
    maxOrderValue: 50000
  });

  const [marketHours, setMarketHours] = useState({
    nyse: { open: '09:30', close: '16:00', status: 'closed' },
    nasdaq: { open: '09:30', close: '16:00', status: 'closed' }
  });

  const validationRules = [
    {
      id: 'zodValidation',
      title: 'Zod Validation',
      description: 'Validation des schémas de données d\'ordres',
      status: validationStatus?.zodValidation,
      icon: ShieldCheck
    },
    {
      id: 'quantityThreshold',
      title: 'Quantity Thresholds',
      description: 'Seuils de quantité par défaut configurés',
      status: validationStatus?.quantityThreshold,
      icon: TrendingUp
    },
    {
      id: 'marketStatus',
      title: 'Market Status Check',
      description: 'Vérification marché ouvert avant envoi',
      status: validationStatus?.marketStatus,
      icon: Clock
    },
    {
      id: 'ibkrConnection',
      title: 'IBKR Connection',
      description: 'Statut connexion Interactive Brokers',
      status: validationStatus?.ibkrConnection,
      icon: Zap
    }
  ];

  const updateThreshold = (field, value) => {
    setThresholds({
      ...thresholds,
      [field]: parseInt(value) || 0
    });
  };

  const toggleValidation = (id) => {
    setValidationStatus({
      ...validationStatus,
      [id]: !validationStatus?.[id]
    });
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center mb-6">
        <Lock className="w-6 h-6 text-white mr-3" />
        <h3 className="text-xl font-bold text-white">Ordres (MVP)</h3>
      </div>
      {/* Validation Rules Status */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">État des Validations</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {validationRules?.map((rule) => {
            const Icon = rule?.icon;
            return (
              <div key={rule?.id} className="bg-white/10 rounded-lg p-3 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 text-white mr-2" />
                    <span className="font-medium text-white text-sm">{rule?.title}</span>
                  </div>
                  <button onClick={() => toggleValidation(rule?.id)}>
                    {rule?.status ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-orange-100">{rule?.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      {/* Quantity Thresholds */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Seuils de Quantité</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-orange-100 mb-2">
              Min. Quantity
            </label>
            <input
              type="number"
              value={thresholds?.minQuantity}
              onChange={(e) => updateThreshold('minQuantity', e?.target?.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-orange-100 mb-2">
              Max. Quantity
            </label>
            <input
              type="number"
              value={thresholds?.maxQuantity}
              onChange={(e) => updateThreshold('maxQuantity', e?.target?.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-orange-100 mb-2">
              Max. Order Value ($)
            </label>
            <input
              type="number"
              value={thresholds?.maxOrderValue}
              onChange={(e) => updateThreshold('maxOrderValue', e?.target?.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </div>
      {/* Market Status */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Statut des Marchés</h4>
        <div className="space-y-3">
          {Object.entries(marketHours)?.map(([market, info]) => (
            <div key={market} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-white mr-2" />
                <span className="font-medium text-white uppercase">{market}</span>
                <span className="text-orange-100 text-sm ml-2">
                  {info?.open} - {info?.close} EST
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  info?.status === 'open' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}></div>
                <span className={`text-sm font-medium ${
                  info?.status === 'open' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {info?.status?.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* IBKR Downtime Handling */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
        <div className="flex items-center mb-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
          <h5 className="font-semibold text-white">Gestion Panne IBKR</h5>
        </div>
        <div className="space-y-2 text-sm text-orange-100">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
            <span>Retourner HTTP 503 si connexion IBKR indisponible</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
            <span>Suggérer mode paper trading en alternative</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
            <span>Notification automatique aux utilisateurs actifs</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
            <span>Retry automatique avec backoff exponentiel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersMVPPanel;