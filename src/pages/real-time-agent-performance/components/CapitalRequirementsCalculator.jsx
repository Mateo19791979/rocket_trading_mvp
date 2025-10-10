import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, TrendingUp, AlertTriangle, Info, Target } from 'lucide-react';

const CapitalRequirementsCalculator = ({ agents = [] }) => {
  const [capitalAnalysis, setCapitalAnalysis] = useState(null);
  const [selectedRiskProfile, setSelectedRiskProfile] = useState('moderate'); // conservative, moderate, aggressive
  const [targetReturn, setTargetReturn] = useState('match'); // match, conservative, aggressive

  const riskProfiles = {
    conservative: {
      label: 'Conservateur',
      maxRiskPerTrade: 0.01, // 1% max risk per trade
      maxDrawdownLimit: 0.05, // 5% max drawdown
      capitalBuffer: 3.0, // 3x buffer
      description: 'Capital important pour minimiser les risques'
    },
    moderate: {
      label: 'Modéré',
      maxRiskPerTrade: 0.02, // 2% max risk per trade
      maxDrawdownLimit: 0.10, // 10% max drawdown
      capitalBuffer: 2.0, // 2x buffer
      description: 'Équilibre entre croissance et sécurité'
    },
    aggressive: {
      label: 'Agressif',
      maxRiskPerTrade: 0.03, // 3% max risk per trade
      maxDrawdownLimit: 0.20, // 20% max drawdown
      capitalBuffer: 1.5, // 1.5x buffer
      description: 'Capital optimisé pour la croissance'
    }
  };

  useEffect(() => {
    calculateCapitalRequirements();
  }, [agents, selectedRiskProfile, targetReturn]);

  const calculateCapitalRequirements = () => {
    if (!agents?.length) return;

    const activeAgents = agents?.filter(agent => agent?.status === 'active' && agent?.totalTrades > 0);
    if (!activeAgents?.length) return;

    const profile = riskProfiles?.[selectedRiskProfile];
    
    // Analyse des performances des agents actifs
    const performanceMetrics = activeAgents?.map(agent => {
      const winRate = agent?.winRate || 0;
      const avgProfit = agent?.avgProfitPerTrade || 0;
      const totalPnL = agent?.totalPnL || 0;
      const totalTrades = agent?.totalTrades || 1;
      
      // Estimation du drawdown maximum basé sur les pertes
      const lossTrades = totalTrades * (1 - winRate / 100);
      const avgLoss = lossTrades > 0 ? Math.abs(avgProfit * (winRate / 100 - 1)) : 0;
      const estimatedMaxDrawdown = avgLoss * Math.min(5, Math.ceil(lossTrades / 10)); // Estimation conservative
      
      // Capital requis pour cet agent
      const requiredCapitalForDrawdown = estimatedMaxDrawdown / profile?.maxDrawdownLimit;
      const requiredCapitalForRisk = Math.abs(avgProfit) / profile?.maxRiskPerTrade;
      
      return {
        agent,
        winRate,
        avgProfit,
        totalPnL,
        totalTrades,
        estimatedMaxDrawdown,
        requiredCapitalForDrawdown,
        requiredCapitalForRisk,
        minCapitalRequired: Math.max(requiredCapitalForDrawdown, requiredCapitalForRisk) * profile?.capitalBuffer
      };
    });

    // Calculs globaux
    const totalPnL = performanceMetrics?.reduce((sum, metric) => sum + metric?.totalPnL, 0);
    const averageWinRate = performanceMetrics?.reduce((sum, metric) => sum + metric?.winRate, 0) / performanceMetrics?.length;
    const totalTrades = performanceMetrics?.reduce((sum, metric) => sum + metric?.totalTrades, 0);
    
    // Capital recommandé pour reproduire les performances
    const maxCapitalRequired = Math.max(...performanceMetrics?.map(m => m?.minCapitalRequired));
    const avgCapitalRequired = performanceMetrics?.reduce((sum, m) => sum + m?.minCapitalRequired, 0) / performanceMetrics?.length;
    
    // Ajustements selon le profil de risque et l'objectif de rendement
    let baseCapital = maxCapitalRequired;
    
    if (targetReturn === 'conservative') {
      baseCapital *= 1.5; // Plus de capital pour être plus conservateur
    } else if (targetReturn === 'aggressive') {
      baseCapital *= 0.8; // Moins de capital pour être plus agressif
    }

    // Recommandations par paliers
    const recommendations = {
      minimum: Math.round(baseCapital * 0.5 / 1000) * 1000, // Arrondi aux milliers
      recommended: Math.round(baseCapital / 1000) * 1000,
      optimal: Math.round(baseCapital * 1.5 / 1000) * 1000,
      details: performanceMetrics
    };

    setCapitalAnalysis({
      ...recommendations,
      totalPnL,
      averageWinRate,
      totalTrades,
      activeAgentsCount: activeAgents?.length,
      profile,
      riskMetrics: {
        maxDrawdownExpected: Math.max(...performanceMetrics?.map(m => m?.estimatedMaxDrawdown)),
        avgTradeSize: totalPnL / totalTrades,
        totalRiskExposure: baseCapital * profile?.maxDrawdownLimit
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const getPerformanceColor = (value, isPositive = true) => {
    if (isPositive) {
      return value > 0 ? 'text-green-400' : 'text-red-400';
    }
    return value < 50 ? 'text-red-400' : value < 70 ? 'text-yellow-400' : 'text-green-400';
  };

  if (!capitalAnalysis) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <Calculator className="h-8 w-8 text-gray-500 mr-3" />
          <span className="text-gray-400">Calcul du capital requis en cours...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-500" />
          Capital Requis pour Performances Réelles
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Info className="h-4 w-4" />
          <span>Basé sur {capitalAnalysis?.activeAgentsCount} agents actifs</span>
        </div>
      </div>
      {/* Configuration des paramètres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profil de Risque
          </label>
          <select
            value={selectedRiskProfile}
            onChange={(e) => setSelectedRiskProfile(e?.target?.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            {Object.entries(riskProfiles)?.map(([key, profile]) => (
              <option key={key} value={key}>
                {profile?.label} - {profile?.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Objectif de Rendement
          </label>
          <select
            value={targetReturn}
            onChange={(e) => setTargetReturn(e?.target?.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            <option value="conservative">Conservateur (-25% performances)</option>
            <option value="match">Reproduire exactement</option>
            <option value="aggressive">Agressif (+25% performances)</option>
          </select>
        </div>
      </div>
      {/* Métriques de performance actuelles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded p-4 text-center">
          <div className={`text-2xl font-bold ${getPerformanceColor(capitalAnalysis?.totalPnL)}`}>
            {formatCurrency(capitalAnalysis?.totalPnL)}
          </div>
          <div className="text-xs text-gray-400">P&L Total Actuel</div>
        </div>

        <div className="bg-gray-700 rounded p-4 text-center">
          <div className={`text-2xl font-bold ${getPerformanceColor(capitalAnalysis?.averageWinRate, false)}`}>
            {capitalAnalysis?.averageWinRate?.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Taux de Réussite Moyen</div>
        </div>

        <div className="bg-gray-700 rounded p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {capitalAnalysis?.totalTrades}
          </div>
          <div className="text-xs text-gray-400">Total Trades</div>
        </div>

        <div className="bg-gray-700 rounded p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {formatCurrency(capitalAnalysis?.riskMetrics?.avgTradeSize)}
          </div>
          <div className="text-xs text-gray-400">Trade Moyen</div>
        </div>
      </div>
      {/* Recommandations de capital */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Target className="h-4 w-4 mr-2 text-blue-500" />
          Recommandations de Capital
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Capital Minimum */}
          <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-red-300">Capital Minimum</h4>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-400 mb-2">
              {formatCurrency(capitalAnalysis?.minimum)}
            </div>
            <p className="text-xs text-red-200">
              Risque élevé - Peut ne pas couvrir les drawdowns importants
            </p>
          </div>

          {/* Capital Recommandé */}
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-300">Capital Recommandé</h4>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {formatCurrency(capitalAnalysis?.recommended)}
            </div>
            <p className="text-xs text-green-200">
              Équilibre optimal entre performance et sécurité
            </p>
          </div>

          {/* Capital Optimal */}
          <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-300">Capital Optimal</h4>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {formatCurrency(capitalAnalysis?.optimal)}
            </div>
            <p className="text-xs text-blue-200">
              Sécurité maximale avec marge de manœuvre importante
            </p>
          </div>
        </div>
      </div>
      {/* Analyse des risques */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Analyse des Risques</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between py-1">
              <span className="text-gray-300">Drawdown Maximum Estimé:</span>
              <span className="text-red-400 font-medium">
                {formatCurrency(capitalAnalysis?.riskMetrics?.maxDrawdownExpected)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-300">Risque par Trade (max):</span>
              <span className="text-yellow-400 font-medium">
                {(capitalAnalysis?.profile?.maxRiskPerTrade * 100)?.toFixed(1)}%
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between py-1">
              <span className="text-gray-300">Exposition Totale au Risque:</span>
              <span className="text-orange-400 font-medium">
                {formatCurrency(capitalAnalysis?.riskMetrics?.totalRiskExposure)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-300">Buffer de Sécurité:</span>
              <span className="text-blue-400 font-medium">
                {((capitalAnalysis?.profile?.capitalBuffer - 1) * 100)?.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Note explicative */}
      <div className="mt-4 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">Comment nous calculons le capital requis :</p>
            <ul className="list-disc list-inside space-y-1 text-blue-300">
              <li>Analyse des drawdowns historiques de vos agents</li>
              <li>Application de votre profil de risque sélectionné</li>
              <li>Ajout d'un buffer de sécurité pour les situations imprévues</li>
              <li>Prise en compte de la taille moyenne des trades</li>
            </ul>
            <p className="mt-2 text-xs text-blue-400">
              Ces calculs sont basés sur les performances passées et ne garantissent pas les résultats futurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapitalRequirementsCalculator;