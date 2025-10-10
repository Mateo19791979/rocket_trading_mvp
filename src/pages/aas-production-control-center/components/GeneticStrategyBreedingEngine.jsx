import React, { useState } from 'react';
import { Dna, TrendingUp, BarChart3, Shuffle, Target, Activity, Users, Award, ArrowRight, Zap } from 'lucide-react';

const GeneticStrategyBreedingEngine = ({ 
  strategyCandidates = [], 
  onBreed, 
  onSelection, 
  metaLearningMetrics = [] 
}) => {
  const [breedingInProgress, setBreedingInProgress] = useState(false);
  const [selectionInProgress, setSelectionInProgress] = useState(false);
  const [breedingParams, setBreedingParams] = useState({
    populationSize: 20,
    mutationRate: 0.15,
    crossoverProb: 0.8,
    elitismRatio: 0.1
  });

  const handleBreeding = async () => {
    setBreedingInProgress(true);
    try {
      await onBreed?.(breedingParams?.populationSize);
    } finally {
      setBreedingInProgress(false);
    }
  };

  const handleSelection = async () => {
    setSelectionInProgress(true);
    try {
      await onSelection?.();
    } finally {
      setSelectionInProgress(false);
    }
  };

  // Calculate breeding statistics
  const totalStrategies = strategyCandidates?.length || 0;
  const avgIQS = strategyCandidates?.length > 0 
    ? strategyCandidates?.reduce((sum, s) => sum + (s?.iqs || 0), 0) / strategyCandidates?.length 
    : 0;
  const topPerformers = strategyCandidates?.filter(s => (s?.iqs || 0) > 0.75)?.length || 0;
  const liveCandidates = strategyCandidates?.filter(s => s?.status === 'live')?.length || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'text-green-400 bg-green-900/20';
      case 'canary': return 'text-yellow-400 bg-yellow-900/20';
      case 'paper': return 'text-blue-400 bg-blue-900/20';
      case 'testing': return 'text-purple-400 bg-purple-900/20';
      case 'rejected': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Dna className="w-5 h-5 mr-2 text-green-400" />
          Genetic Strategy Breeding Engine
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Activity className="w-4 h-4" />
          <span>Generation #{Math.floor(totalStrategies / 20) + 1}</span>
        </div>
      </div>
      {/* Population Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Population Size</p>
              <p className="text-2xl font-bold text-white">{totalStrategies}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg IQS</p>
              <p className="text-2xl font-bold text-white">{(avgIQS * 100)?.toFixed(1)}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Top Performers</p>
              <p className="text-2xl font-bold text-green-400">{topPerformers}</p>
            </div>
            <Award className="w-8 h-8 text-gold-400" />
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Live Strategies</p>
              <p className="text-2xl font-bold text-emerald-400">{liveCandidates}</p>
            </div>
            <Target className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </div>
      {/* Breeding Parameters */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-300">Breeding Parameters</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Population Size</label>
            <input
              type="number"
              value={breedingParams?.populationSize}
              onChange={(e) => setBreedingParams(prev => ({ ...prev, populationSize: parseInt(e?.target?.value) }))}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
              min="10"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mutation Rate</label>
            <input
              type="number"
              value={breedingParams?.mutationRate}
              onChange={(e) => setBreedingParams(prev => ({ ...prev, mutationRate: parseFloat(e?.target?.value) }))}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
              min="0.05"
              max="0.5"
              step="0.05"
            />
          </div>
        </div>
      </div>
      {/* Strategy Pipeline */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-300">Strategy Pipeline</h4>
        <div className="space-y-2">
          {['pending', 'testing', 'paper', 'canary', 'live', 'rejected']?.map(status => {
            const count = strategyCandidates?.filter(s => s?.status === status)?.length || 0;
            const percentage = totalStrategies > 0 ? (count / totalStrategies) * 100 : 0;
            
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                    {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
                  </span>
                  <span className="text-gray-400 text-sm">{count} strategies</span>
                </div>
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Control Actions */}
      <div className="space-y-3">
        <button
          onClick={handleBreeding}
          disabled={breedingInProgress}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
        >
          {breedingInProgress ? (
            <>
              <Zap className="w-4 h-4 animate-pulse" />
              <span>Breeding in Progress...</span>
            </>
          ) : (
            <>
              <Dna className="w-4 h-4" />
              <span>Start Genetic Breeding</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <button
          onClick={handleSelection}
          disabled={selectionInProgress || totalStrategies === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
        >
          {selectionInProgress ? (
            <>
              <Shuffle className="w-4 h-4 animate-spin" />
              <span>Selection in Progress...</span>
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              <span>Run Natural Selection</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
      {/* Recent Breeding Results */}
      {strategyCandidates?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-lg font-medium mb-3 text-gray-300">Recent Candidates</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {strategyCandidates?.slice(0, 3)?.map((strategy, index) => (
              <div key={strategy?.id} className="flex items-center justify-between bg-gray-900/30 rounded-lg p-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(strategy?.status)}`}>
                      {strategy?.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      ID: {strategy?.id?.slice(0, 8)}...
                    </span>
                  </div>
                  {strategy?.parent_ids?.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Parents: {strategy?.parent_ids?.length} strategies
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    IQS: {strategy?.iqs ? (strategy?.iqs * 100)?.toFixed(1) + '%' : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(strategy.created_at)?.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneticStrategyBreedingEngine;