import React, { useState } from 'react';
import { Dna, GitBranch, Zap, TrendingUp, Target } from 'lucide-react';

export default function StrategyDNASequencer({ population, evolutionMetrics, onParameterChange }) {
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [sequenceView, setSequenceView] = useState('genes'); // genes, traits, mutations

  const renderDNASequence = (individual) => {
    if (!individual?.dna?.genes) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {individual?.dna?.genes?.map((gene, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                gene?.dominant 
                  ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-blue-900/30 border-blue-500/50 text-blue-300'
              }`}
            >
              <div className="text-xs font-mono uppercase tracking-wide">
                {gene?.name}
              </div>
              <div className="text-lg font-bold mt-1">
                {typeof gene?.value === 'number' ? gene?.value?.toFixed(3) : gene?.value}
              </div>
              <div className="text-xs opacity-70">
                {gene?.dominant ? 'DOM' : 'REC'}
              </div>
            </div>
          ))}
        </div>
        {/* DNA Sequence Visualization */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-2 font-mono">
            Genotype: {individual?.dna?.genotype?.substring(0, 50)}...
          </div>
          <div className="flex flex-wrap gap-1">
            {individual?.dna?.genotype?.split('')?.slice(0, 100)?.map((char, i) => (
              <span
                key={i}
                className={`text-xs font-mono w-4 h-4 flex items-center justify-center rounded ${
                  char === 'A' ? 'text-red-400' :
                  char === 'T' ? 'text-blue-400' :
                  char === 'G' ? 'text-green-400' :
                  char === 'C' ? 'text-yellow-400' : 'text-gray-500'
                }`}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTraits = (individual) => {
    if (!individual?.traits) return null;

    return (
      <div className="space-y-3">
        {individual?.traits?.map((trait, index) => (
          <div key={index} className="bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{trait?.name}</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                trait?.expression === 'dominant' 
                  ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'
              }`}>
                {trait?.expression}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    trait?.expression === 'dominant' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${trait?.strength * 100}%` }}
                />
              </div>
              <span className="text-gray-400 text-sm">{(trait?.strength * 100)?.toFixed(0)}%</span>
            </div>
            <div className="text-gray-400 text-sm mt-1">
              Value: {typeof trait?.value === 'number' ? trait?.value?.toFixed(3) : trait?.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMutations = (individual) => {
    if (!individual?.mutations?.length) {
      return (
        <div className="text-center py-8 text-gray-400">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No mutations detected</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {individual?.mutations?.map((mutation, index) => (
          <div key={index} className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 font-medium">{mutation?.gene}</span>
              <span className="px-2 py-1 bg-yellow-900/50 rounded text-xs text-yellow-200">
                {mutation?.type}
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              {new Date(mutation.timestamp)?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Dna className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Strategy DNA Sequencer</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Population:</span>
          <span className="text-green-400 font-semibold">{population?.length}</span>
        </div>
      </div>
      {/* Individual Selector */}
      <div className="mb-6">
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {population?.map((individual) => (
            <button
              key={individual?.id}
              onClick={() => setSelectedIndividual(individual)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                selectedIndividual?.id === individual?.id
                  ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-gray-900/30 border-gray-600/50 text-gray-300 hover:border-gray-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{individual?.name}</div>
                  <div className="text-sm opacity-70">
                    Gen {individual?.generation} • Fitness: {individual?.fitness?.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">{individual?.fitness?.toFixed(1)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* View Selector */}
      {selectedIndividual && (
        <>
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setSequenceView('genes')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                sequenceView === 'genes' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <GitBranch className="w-4 h-4 inline mr-2" />
              Genes
            </button>
            <button
              onClick={() => setSequenceView('traits')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                sequenceView === 'traits' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Traits
            </button>
            <button
              onClick={() => setSequenceView('mutations')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                sequenceView === 'mutations' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Mutations
            </button>
          </div>

          {/* Content Display */}
          <div className="space-y-4">
            {sequenceView === 'genes' && renderDNASequence(selectedIndividual)}
            {sequenceView === 'traits' && renderTraits(selectedIndividual)}
            {sequenceView === 'mutations' && renderMutations(selectedIndividual)}
          </div>
        </>
      )}
      {!selectedIndividual && (
        <div className="text-center py-12 text-gray-400">
          <Dna className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">Select a Strategy Individual</p>
          <p className="text-sm">Choose from the population above to analyze its genetic structure</p>
        </div>
      )}
    </div>
  );
}