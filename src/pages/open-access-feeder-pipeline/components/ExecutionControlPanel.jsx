import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Settings, Zap } from 'lucide-react';
import { openAccessFeederService } from '../../../services/openAccessFeederService';

export default function ExecutionControlPanel({ onExecute }) {
  const [executing, setExecuting] = useState(false);
  const [selectedSource, setSelectedSource] = useState('arxiv');

  const handleManualExecution = async (sourceType) => {
    try {
      setExecuting(true);
      
      const result = await openAccessFeederService?.startManualExecution(sourceType, {
        manual_trigger: true,
        timestamp: new Date()?.toISOString()
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Refresh the dashboard data
      if (onExecute) {
        await onExecute();
      }

    } catch (error) {
      console.error('Erreur lors de l\'exécution manuelle:', error);
    } finally {
      setExecuting(false);
    }
  };

  const sourceOptions = [
    { value: 'arxiv', label: 'arXiv', color: 'text-teal-400' },
    { value: 'ssrn', label: 'SSRN', color: 'text-orange-400' },
    { value: 'openalex', label: 'OpenAlex', color: 'text-blue-400' },
    { value: 'doaj', label: 'DOAJ', color: 'text-purple-400' },
    { value: 'all', label: 'Toutes les sources', color: 'text-white' }
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Zap className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-semibold text-white">Contrôles d'exécution</h2>
      </div>
      <div className="space-y-4">
        {/* Source Selection */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Source à traiter
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e?.target?.value)}
            className="w-full bg-slate-700/50 border border-slate-600/30 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {sourceOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleManualExecution(selectedSource)}
            disabled={executing}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className={`w-4 h-4 ${executing ? 'animate-pulse' : ''}`} />
            <span>{executing ? 'Exécution...' : 'Démarrer'}</span>
          </button>

          <button
            onClick={() => handleManualExecution('pause')}
            disabled={executing}
            className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </button>

          <button
            onClick={() => handleManualExecution('restart')}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Redémarrer</span>
          </button>

          <button
            className="bg-slate-500/20 hover:bg-slate-500/30 border border-slate-500/30 text-slate-400 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Config</span>
          </button>
        </div>

        {/* Status Information */}
        <div className="bg-slate-700/30 rounded-lg p-3 mt-4">
          <h4 className="text-white font-medium text-sm mb-2">Planification automatique</h4>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span>Exécution hebdomadaire</span>
              <span className="text-green-400">✓ Activée</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Prochaine exécution</span>
              <span className="text-blue-400">Dimanche 00:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Mode de récupération d'erreur</span>
              <span className="text-yellow-400">Auto</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}