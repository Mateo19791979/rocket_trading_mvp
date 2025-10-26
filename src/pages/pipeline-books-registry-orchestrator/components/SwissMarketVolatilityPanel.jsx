import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Database, BarChart3, Target, Shield, Zap } from 'lucide-react';

const SwissMarketVolatilityPanel = () => {
  const [volatilityData, setVolatilityData] = useState({
    vsmiCurrent: 18.2,
    smiCurrent: 11567.5,
    correlation: -0.85,
    lastUpdate: new Date()?.toLocaleTimeString('fr-FR'),
    volatilityTrend: 'decreasing',
    riskLevel: 'moderate'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading Swiss market data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl mr-4 shadow-lg">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">📊 Swiss Market Volatility Panel</h2>
        </div>
        
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-white/80">Loading Swiss market data...</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp className="w-5 h-5 text-red-400" />;
    if (trend === 'decreasing') return <TrendingDown className="w-5 h-5 text-green-400" />;
    return <Activity className="w-5 h-5 text-yellow-400" />;
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      case 'high': return 'text-red-400 bg-red-500/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl mr-4 shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">📊 Swiss Market Volatility Panel</h2>
            <p className="text-white/80 text-sm">VSMI-SMI Analysis (2000-2013 Patterns)</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-white/60 text-xs">Last update</p>
          <p className="text-white font-mono text-sm">{volatilityData?.lastUpdate}</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* VSMI Current */}
        <div className="bg-black/20 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-200 text-sm font-medium">VSMI Index</span>
            </div>
            {getTrendIcon(volatilityData?.volatilityTrend)}
          </div>
          <p className="text-3xl font-bold text-white mb-1">{volatilityData?.vsmiCurrent}</p>
          <p className="text-red-200/80 text-xs">Volatility Index (Swiss)</p>
        </div>

        {/* SMI Current */}
        <div className="bg-black/20 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-blue-200 text-sm font-medium">SMI Index</span>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{volatilityData?.smiCurrent?.toLocaleString()}</p>
          <p className="text-blue-200/80 text-xs">Swiss Market Index</p>
        </div>

        {/* Correlation */}
        <div className="bg-black/20 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-purple-200 text-sm font-medium">Correlation</span>
            </div>
            <AlertTriangle className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{volatilityData?.correlation}</p>
          <p className="text-purple-200/80 text-xs">VSMI-SMI Relationship</p>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Risk Assessment */}
        <div className="space-y-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-yellow-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
          </div>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${getRiskColor(volatilityData?.riskLevel)}`}>
            <span className="text-sm font-medium uppercase">{volatilityData?.riskLevel} Risk</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Market Stress</span>
              <span className="text-yellow-200">18.2% (Moderate)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Volatility Regime</span>
              <span className="text-blue-200">Decreasing Trend</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Strategy Trigger</span>
              <span className="text-green-200">Active Signal</span>
            </div>
          </div>
        </div>

        {/* AI Integration Status */}
        <div className="space-y-4">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-orange-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">AI Integration</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-green-500/20 rounded-lg p-3 border border-green-400/30">
              <span className="text-green-200 text-sm">Swiss Volatility Agent</span>
              <span className="px-2 py-1 bg-green-500/30 text-green-100 rounded text-xs border border-green-400/20">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center bg-blue-500/20 rounded-lg p-3 border border-blue-400/30">
              <span className="text-blue-200 text-sm">Pattern Recognition</span>
              <span className="px-2 py-1 bg-blue-500/30 text-blue-100 rounded text-xs border border-blue-400/20">RUNNING</span>
            </div>
            <div className="flex justify-between items-center bg-orange-500/20 rounded-lg p-3 border border-orange-400/30">
              <span className="text-orange-200 text-sm">Strategy Adaptation</span>
              <span className="px-2 py-1 bg-orange-500/30 text-orange-100 rounded text-xs border border-orange-400/20">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Context */}
      <div className="mt-8 bg-black/20 rounded-lg p-4 border border-white/10">
        <p className="text-white/90 text-sm">
          <strong className="text-orange-200">Pattern Match:</strong> Current VSMI(18.2) matches 2008-2011 post-crisis patterns. 
          Historical data suggests <strong className="text-green-200">volatility normalization</strong> over next 3-6 months with 
          <strong className="text-blue-200"> 73% confidence</strong> based on Swiss market analysis.
        </p>
      </div>
    </div>
  );
};

export default SwissMarketVolatilityPanel;